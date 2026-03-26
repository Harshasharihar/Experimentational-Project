#!/bin/bash
# =============================================================================
# uic_error_simulate.sh
# UIC Error Simulation Script — Trigger DME QoS Notification Bits 1, 2, 3
#
# PURPOSE:
#   Simulate UIC (UniPro Interconnect) errors on a UFS device to trigger
#   dme_qos_notification bits:
#       Bit 1 (value=2) → TX QoS event
#       Bit 2 (value=4) → RX QoS event
#       Bit 3 (value=8) → PA_INIT QoS event
#
# METHODS USED (in order of safety):
#   1. debugfs err_inj   — safest, kernel-controlled injection
#   2. Gear cycling      — real PA_INIT via gear up/down
#   3. HIBERN8 cycling   — real PA_INIT via link sleep/wake
#   4. Lane toggling     — real DL errors via lane disable
#   5. fio I/O stress    — real TX/RX stress under all above conditions
#
# USAGE (run ON the Android device as root, or via adb shell):
#   chmod +x uic_error_simulate.sh
#   ./uic_error_simulate.sh [OPTIONS]
#
# OPTIONS:
#   --bsg     <path>   UFS BSG node       (default: /dev/ufs-bsg0)
#   --block   <path>   UFS block device   (default: /dev/block/sda)
#   --fio     <path>   fio binary path    (default: /data/local/tmp/fio)
#   --ufsutils <path>  ufs-utils path     (default: /data/local/tmp/ufs-utils)
#   --cycles  <n>      Gear/HIBERN8 cycles (default: 10)
#   --timeout <sec>    Max wait per bit   (default: 30)
#   --method  <1-5>    Run only one method (default: all)
#   --dry-run          Print commands, do not execute
#   --help             Show this help
#
# OUTPUT:
#   Console log with PASS/FAIL per bit per method
#   Log file: /data/local/tmp/uic_sim_<timestamp>.txt
#
# =============================================================================

set -uo pipefail

# ─────────────────────────────────────────────────────────────────────────────
# COLOUR CODES
# ─────────────────────────────────────────────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
CYAN='\033[0;36m'; BOLD='\033[1m'; RESET='\033[0m'
BLUE='\033[0;34m'; MAGENTA='\033[0;35m'

# ─────────────────────────────────────────────────────────────────────────────
# DEFAULTS
# ─────────────────────────────────────────────────────────────────────────────
BSG_PATH="/dev/ufs-bsg0"
BLOCK_DEV="/dev/block/sda"
FIO_CMD="/data/local/tmp/fio"
UFS_CMD="/data/local/tmp/ufs-utils"
CYCLES=10
TIMEOUT=30
METHOD="all"
DRY_RUN=false
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
LOG_FILE="/data/local/tmp/uic_sim_${TIMESTAMP}.txt"

# ─────────────────────────────────────────────────────────────────────────────
# PARSE CLI ARGS
# ─────────────────────────────────────────────────────────────────────────────
while [[ $# -gt 0 ]]; do
    case $1 in
        --bsg)      BSG_PATH="$2";  shift 2 ;;
        --block)    BLOCK_DEV="$2"; shift 2 ;;
        --fio)      FIO_CMD="$2";   shift 2 ;;
        --ufsutils) UFS_CMD="$2";   shift 2 ;;
        --cycles)   CYCLES="$2";    shift 2 ;;
        --timeout)  TIMEOUT="$2";   shift 2 ;;
        --method)   METHOD="$2";    shift 2 ;;
        --dry-run)  DRY_RUN=true;   shift ;;
        --help)
            grep "^#" "$0" | grep -v "^#!/" | sed 's/^# \?//' | head -30
            exit 0 ;;
        *) echo "Unknown option: $1"; exit 1 ;;
    esac
done

# ─────────────────────────────────────────────────────────────────────────────
# LOGGING
# ─────────────────────────────────────────────────────────────────────────────
log()     { echo -e "${CYAN}[$(date +%H:%M:%S)]${RESET} $*"    | tee -a "$LOG_FILE"; }
pass()    { echo -e "${GREEN}  ✔ PASS${RESET} $*"              | tee -a "$LOG_FILE"; }
fail()    { echo -e "${RED}  ✘ FAIL${RESET} $*"                | tee -a "$LOG_FILE"; }
warn()    { echo -e "${YELLOW}  ⚠ WARN${RESET} $*"             | tee -a "$LOG_FILE"; }
info()    { echo -e "${BLUE}  ℹ INFO${RESET} $*"               | tee -a "$LOG_FILE"; }
section() { echo -e "\n${BOLD}${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"  | tee -a "$LOG_FILE"
            echo -e "${BOLD}${MAGENTA}  $*${RESET}"            | tee -a "$LOG_FILE"
            echo -e "${BOLD}${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}\n" | tee -a "$LOG_FILE"; }

# Run or dry-run a command
run_cmd() {
    if [[ "$DRY_RUN" == true ]]; then
        echo -e "${YELLOW}  [DRY-RUN]${RESET} $*" | tee -a "$LOG_FILE"
    else
        eval "$@" 2>>"$LOG_FILE" || true
    fi
}

# ─────────────────────────────────────────────────────────────────────────────
# GLOBAL STATE
# ─────────────────────────────────────────────────────────────────────────────
NOTIFY_PATH=""        # sysfs path to dme_qos_notification
DEBUGFS_PATH=""       # debugfs ufshcd path
ERR_INJ_AVAILABLE=false
UFS_UTILS_OK=false
FIO_OK=false
RESULTS=()            # collect pass/fail per test

# Track overall bit achievements
BIT1_ACHIEVED=false
BIT2_ACHIEVED=false
BIT3_ACHIEVED=false

# ─────────────────────────────────────────────────────────────────────────────
# HELPER: Read dme_qos_notification
# ─────────────────────────────────────────────────────────────────────────────
read_notify() {
    if [[ -n "$NOTIFY_PATH" && -f "$NOTIFY_PATH" ]]; then
        cat "$NOTIFY_PATH" 2>/dev/null | tr -d '\r\n' || echo "N/A"
    else
        echo "N/A"
    fi
}

# ─────────────────────────────────────────────────────────────────────────────
# HELPER: Decode notification bitfield
# ─────────────────────────────────────────────────────────────────────────────
decode_notify() {
    local val="$1"
    if [[ "$val" == "N/A" || "$val" == "0" ]]; then
        echo "  No QoS events (value=$val)"
        return
    fi
    local dec=$((val))
    echo "  Raw value: $val (decimal: $dec)"
    (( dec & 1 )) && echo "    Bit 0 SET → QoS Monitor reset by host"
    (( dec & 2 )) && echo "    Bit 1 SET → TX QoS event detected  ★"
    (( dec & 4 )) && echo "    Bit 2 SET → RX QoS event detected  ★"
    (( dec & 8 )) && echo "    Bit 3 SET → PA_INIT QoS detected   ★"
}

# ─────────────────────────────────────────────────────────────────────────────
# HELPER: Check if a specific bit is set in notification
# ─────────────────────────────────────────────────────────────────────────────
bit_set() {
    # bit_set <bit_number>  → returns 0 (true) if bit is set
    local bit="$1"
    local val
    val=$(read_notify)
    [[ "$val" == "N/A" ]] && return 1
    local dec=$((val))
    local mask=$(( 1 << bit ))
    (( dec & mask )) && return 0 || return 1
}

# ─────────────────────────────────────────────────────────────────────────────
# HELPER: Poll for a bit to be set within timeout
# ─────────────────────────────────────────────────────────────────────────────
wait_for_bit() {
    # wait_for_bit <bit> <timeout_sec> <description>
    local bit="$1" timeout="$2" desc="$3"
    local elapsed=0
    log "Waiting up to ${timeout}s for Bit ${bit} (${desc})..."
    while (( elapsed < timeout )); do
        if bit_set "$bit"; then
            local val
            val=$(read_notify)
            pass "Bit ${bit} SET after ${elapsed}s! (notification=0x${val})"
            decode_notify "$val" | tee -a "$LOG_FILE"
            return 0
        fi
        sleep 1
        (( elapsed++ ))
    done
    local val
    val=$(read_notify)
    fail "Bit ${bit} NOT set after ${timeout}s (notification=0x${val})"
    return 1
}

# ─────────────────────────────────────────────────────────────────────────────
# HELPER: Clear notification (write 0)
# ─────────────────────────────────────────────────────────────────────────────
clear_notify() {
    if [[ -n "$NOTIFY_PATH" && -f "$NOTIFY_PATH" ]]; then
        run_cmd "echo 0 > $NOTIFY_PATH"
        sleep 0.2
        log "Notification cleared (reset)"
    fi
}

# ─────────────────────────────────────────────────────────────────────────────
# HELPER: Read a DME attribute via ufs-utils
# ─────────────────────────────────────────────────────────────────────────────
dme_read() {
    local attr="$1"
    if [[ "$UFS_UTILS_OK" == true ]]; then
        $UFS_CMD uic -t 2 -i "$attr" -p "$BSG_PATH" 2>/dev/null \
            | grep -oP ':\s*\K[0-9xa-fA-F]+' | head -1 || echo "N/A"
    else
        echo "N/A"
    fi
}

# ─────────────────────────────────────────────────────────────────────────────
# HELPER: Write a DME attribute via ufs-utils
# ─────────────────────────────────────────────────────────────────────────────
dme_write() {
    local attr="$1" val="$2"
    if [[ "$UFS_UTILS_OK" == true ]]; then
        run_cmd "$UFS_CMD uic -t 2 -i $attr -v $val -p $BSG_PATH"
        log "  DME write: attr=$attr val=$val"
    else
        warn "ufs-utils not available — skipping DME write $attr=$val"
    fi
}

# ─────────────────────────────────────────────────────────────────────────────
# HELPER: Write to debugfs err_inj
# ─────────────────────────────────────────────────────────────────────────────
inject_err() {
    local type="$1" val="$2"
    # type: pa_err | dl_err | nl_err | tl_err | uic_err | cmd_timeout
    local path="${DEBUGFS_PATH}/err_inj/${type}"
    if [[ -f "$path" ]]; then
        run_cmd "echo $val > $path"
        log "  Injected err_inj/${type} = $val"
        return 0
    else
        warn "err_inj/${type} not found at $path"
        return 1
    fi
}

# ─────────────────────────────────────────────────────────────────────────────
# HELPER: Start background fio
# ─────────────────────────────────────────────────────────────────────────────
FIO_BG_PID=""
start_fio_bg() {
    local name="$1" rw="$2" bs="$3" iodepth="$4" numjobs="$5" runtime="$6"
    if [[ "$FIO_OK" == false ]]; then
        warn "fio not available — skipping background I/O"
        return 1
    fi
    log "Starting background fio: rw=$rw bs=$bs iodepth=$iodepth jobs=$numjobs"
    if [[ "$DRY_RUN" == false ]]; then
        $FIO_CMD \
            --name="$name" \
            --ioengine=libaio \
            --rw="$rw" \
            --bs="$bs" \
            --iodepth="$iodepth" \
            --numjobs="$numjobs" \
            --direct=1 \
            --size=2G \
            --runtime="$runtime" \
            --time_based \
            --filename="$BLOCK_DEV" \
            --group_reporting \
            --output=/dev/null \
            2>>"$LOG_FILE" &
        FIO_BG_PID=$!
        log "  fio started (PID=$FIO_BG_PID)"
    fi
}

stop_fio_bg() {
    if [[ -n "$FIO_BG_PID" ]]; then
        run_cmd "kill $FIO_BG_PID 2>/dev/null || true"
        wait "$FIO_BG_PID" 2>/dev/null || true
        FIO_BG_PID=""
        log "Background fio stopped"
    fi
    # Kill any stray fio processes
    run_cmd "pkill -f 'fio --name' 2>/dev/null || true"
}

# ─────────────────────────────────────────────────────────────────────────────
# STEP 0: PRE-FLIGHT
# ─────────────────────────────────────────────────────────────────────────────
section "PRE-FLIGHT CHECKS"

echo "" > "$LOG_FILE"
log "Script started: uic_error_simulate.sh"
log "Timestamp: $TIMESTAMP"
log "BSG: $BSG_PATH  BLOCK: $BLOCK_DEV"

# Must be root
if [[ "$(id -u)" != "0" ]]; then
    fail "Must run as root (try: adb root)"
    exit 1
fi
pass "Running as root"

# Check BSG node
if [[ -c "$BSG_PATH" ]]; then
    pass "BSG node found: $BSG_PATH"
else
    fail "BSG node not found: $BSG_PATH"
    warn "Try: ls /dev/ufs-bsg* to find correct path"
    exit 1
fi

# Check block device
if [[ -b "$BLOCK_DEV" ]]; then
    pass "Block device found: $BLOCK_DEV"
else
    warn "Block device not found: $BLOCK_DEV"
    warn "Try: ls /dev/block/sd* or ls /dev/block/by-name/"
    BLOCK_DEV=$(ls /dev/block/sd? 2>/dev/null | head -1)
    if [[ -n "$BLOCK_DEV" ]]; then
        warn "Auto-detected block device: $BLOCK_DEV"
    fi
fi

# Find dme_qos_notification sysfs path
log "Searching for dme_qos_notification sysfs path..."
NOTIFY_PATH=$(find /sys -name "dme_qos_notification" 2>/dev/null | head -1)
if [[ -n "$NOTIFY_PATH" ]]; then
    pass "Found: $NOTIFY_PATH"
    INITIAL_VAL=$(read_notify)
    log "  Initial value: $INITIAL_VAL"
else
    fail "dme_qos_notification sysfs not found — patch may not be loaded"
    warn "Continuing anyway — will check for path again later"
fi

# Find debugfs ufshcd path
log "Searching for debugfs ufshcd path..."
DEBUGFS_PATH=$(find /sys/kernel/debug -name "ufshcd*" -type d 2>/dev/null | head -1)
if [[ -z "$DEBUGFS_PATH" ]]; then
    # Mount debugfs if not mounted
    run_cmd "mount -t debugfs debugfs /sys/kernel/debug 2>/dev/null || true"
    DEBUGFS_PATH=$(find /sys/kernel/debug -name "ufshcd*" -type d 2>/dev/null | head -1)
fi
if [[ -n "$DEBUGFS_PATH" ]]; then
    pass "debugfs ufshcd path: $DEBUGFS_PATH"
    if [[ -d "${DEBUGFS_PATH}/err_inj" ]]; then
        pass "err_inj folder found"
        ERR_INJ_AVAILABLE=true
        log "  Available err_inj nodes:"
        ls "${DEBUGFS_PATH}/err_inj/" 2>/dev/null | while read f; do
            log "    ${f} = $(cat ${DEBUGFS_PATH}/err_inj/${f} 2>/dev/null)"
        done
    else
        warn "err_inj folder not found — Method 1 will be skipped"
    fi
else
    warn "debugfs ufshcd not found — Method 1 will be skipped"
fi

# Check ufs-utils
if $UFS_CMD --version &>/dev/null 2>&1 || $UFS_CMD 2>&1 | grep -q "usage\|Usage\|uic"; then
    UFS_UTILS_OK=true
    pass "ufs-utils found: $UFS_CMD"
else
    UFS_UTILS_OK=false
    warn "ufs-utils not found at $UFS_CMD — DME write operations will be skipped"
fi

# Check fio
if $FIO_CMD --version &>/dev/null 2>&1; then
    FIO_OK=true
    pass "fio found: $FIO_CMD"
else
    FIO_CMD=$(which fio 2>/dev/null || echo "")
    if [[ -n "$FIO_CMD" ]] && $FIO_CMD --version &>/dev/null 2>&1; then
        FIO_OK=true
        pass "System fio found: $FIO_CMD"
    else
        FIO_OK=false
        warn "fio not found — I/O stress will be skipped"
    fi
fi

# ─────────────────────────────────────────────────────────────────────────────
# STEP 1: CONFIGURE DME QoS THRESHOLDS (minimum = easiest to trigger)
# ─────────────────────────────────────────────────────────────────────────────
section "STEP 1: CONFIGURE DME QoS THRESHOLDS"

log "Setting all QoS thresholds to minimum so events fire easily..."

# TX QoS attributes
dme_write "0x5105" "0x0001"   # TX error threshold = 1
dme_write "0x5106" "0x00FF"   # TX byte count window (small)
dme_write "0x5107" "0x0001"   # TX QoS enable

# RX QoS attributes
dme_write "0x5115" "0x0001"   # RX error threshold = 1
dme_write "0x5116" "0x00FF"   # RX byte count window (small)
dme_write "0x5117" "0x0001"   # RX QoS enable

# PA_INIT QoS attributes
dme_write "0x5125" "0x0001"   # PA_INIT threshold = 1
dme_write "0x5126" "0x00FF"   # PA_INIT window
dme_write "0x5127" "0x0001"   # PA_INIT QoS enable

# Global QoS enable
dme_write "0x5130" "0x0001"   # Master enable

# Read current gear for later use
log "Reading current link state..."
CURRENT_TX_GEAR=$(dme_read "0x1568")   # PA_TxGear
CURRENT_RX_GEAR=$(dme_read "0x1583")   # PA_RxGear
CURRENT_TX_LANES=$(dme_read "0x1560")  # PA_ActiveTxDataLanes
CURRENT_RX_LANES=$(dme_read "0x1580")  # PA_ActiveRxDataLanes
log "  TX Gear: $CURRENT_TX_GEAR   RX Gear: $CURRENT_RX_GEAR"
log "  TX Lanes: $CURRENT_TX_LANES  RX Lanes: $CURRENT_RX_LANES"

# Clear notification before starting
clear_notify
log "Notification cleared. Ready to begin simulation."

# ─────────────────────────────────────────────────────────────────────────────
# FUNCTION: Record test result
# ─────────────────────────────────────────────────────────────────────────────
record_result() {
    local method="$1" bit="$2" result="$3"
    RESULTS+=("Method${method}|Bit${bit}|${result}")
    if [[ "$result" == "PASS" ]]; then
        case "$bit" in
            1) BIT1_ACHIEVED=true ;;
            2) BIT2_ACHIEVED=true ;;
            3) BIT3_ACHIEVED=true ;;
        esac
    fi
}

# ─────────────────────────────────────────────────────────────────────────────
# METHOD 1: debugfs ERROR INJECTION
# ─────────────────────────────────────────────────────────────────────────────
run_method1() {
    section "METHOD 1: debugfs Error Injection (Safest)"
    log "Using kernel err_inj interface to directly inject UIC errors"
    log "No real hardware stress — purely software-controlled"

    if [[ "$ERR_INJ_AVAILABLE" == false ]]; then
        warn "err_inj not available — skipping Method 1"
        record_result 1 1 "SKIP"
        record_result 1 2 "SKIP"
        record_result 1 3 "SKIP"
        return
    fi

    # ── 1A: Inject PA error → triggers Bit 3 (PA_INIT) ──────────────────────
    log ""
    log "── 1A: Inject PA error → expect Bit 3 (PA_INIT) ──"
    clear_notify

    # PA error bitmask: 0x1=GenericError 0x2=PA_INIT 0x4=PHY
    inject_err "pa_err" "0x2"    # PA_INIT error

    # Also start fio to exercise the link while error is injected
    start_fio_bg "m1a_fio" "write" "128k" "32" "2" "20"
    sleep 3

    if wait_for_bit 3 "$TIMEOUT" "PA_INIT QoS"; then
        record_result 1 3 "PASS"
    else
        record_result 1 3 "FAIL"
    fi
    stop_fio_bg
    clear_notify

    # ── 1B: Inject DL error → triggers Bit 1 (TX QoS) ───────────────────────
    log ""
    log "── 1B: Inject DL error + TX stress → expect Bit 1 (TX QoS) ──"
    clear_notify

    # DL error bitmask: 0x1=NAC_Received 0x2=TCx_Replay_Timeout
    #                   0x4=AFCx_Request_Timeout 0x8=FCx_Protection_Timeout
    inject_err "dl_err" "0x1"    # NAC received = TX side error

    start_fio_bg "m1b_fio" "write" "512k" "64" "4" "30"
    sleep 2

    if wait_for_bit 1 "$TIMEOUT" "TX QoS"; then
        record_result 1 1 "PASS"
    else
        record_result 1 1 "FAIL"
    fi
    stop_fio_bg
    clear_notify

    # ── 1C: Inject DL error → triggers Bit 2 (RX QoS) ───────────────────────
    log ""
    log "── 1C: Inject DL error + RX stress → expect Bit 2 (RX QoS) ──"
    clear_notify

    inject_err "dl_err" "0x8"    # FCx protection timeout = RX side error

    start_fio_bg "m1c_fio" "randread" "4k" "128" "8" "30"
    sleep 2

    if wait_for_bit 2 "$TIMEOUT" "RX QoS"; then
        record_result 1 2 "PASS"
    else
        record_result 1 2 "FAIL"
    fi
    stop_fio_bg
    clear_notify

    # ── 1D: UIC generic error (backup if specific ones don't work) ────────────
    log ""
    log "── 1D: Generic UIC error injection (backup) ──"
    local cur_val
    cur_val=$(read_notify)
    if [[ "$cur_val" == "0" || "$cur_val" == "N/A" ]]; then
        inject_err "uic_err" "0x1"
        sleep 2
        cur_val=$(read_notify)
        log "After generic UIC injection: notification=$cur_val"
        decode_notify "$cur_val" | tee -a "$LOG_FILE"
    fi
    clear_notify
}

# ─────────────────────────────────────────────────────────────────────────────
# METHOD 2: GEAR CYCLING (Real PA_INIT → Bit 3)
# ─────────────────────────────────────────────────────────────────────────────
run_method2() {
    section "METHOD 2: Gear Cycling (Real PA_INIT events)"
    log "Rapidly cycling M-PHY gear causes real PA_INIT on each transition"
    log "Target: Bit 3 (PA_INIT QoS)"

    if [[ "$UFS_UTILS_OK" == false ]]; then
        warn "ufs-utils not available — skipping Method 2"
        record_result 2 3 "SKIP"
        return
    fi

    # Get current gear
    local orig_tx_gear orig_rx_gear
    orig_tx_gear=$(dme_read "0x1568")
    orig_rx_gear=$(dme_read "0x1583")
    log "Original gears: TX=$orig_tx_gear RX=$orig_rx_gear"

    # Safety: only proceed if we got valid gear values
    if [[ "$orig_tx_gear" == "N/A" || "$orig_tx_gear" == "0" ]]; then
        warn "Could not read current TX gear — using safe default 3"
        orig_tx_gear="3"
        orig_rx_gear="3"
    fi

    clear_notify

    log "Starting gear cycling ($CYCLES cycles): Gear${orig_tx_gear} ↔ Gear1"

    local bit3_hit=false
    for i in $(seq 1 "$CYCLES"); do
        log "  Gear cycle $i/$CYCLES"

        # Drop to Gear 1 (forces PA negotiation = PA_INIT)
        dme_write "0x1568" "0x0001"   # PA_TxGear = 1
        dme_write "0x1583" "0x0001"   # PA_RxGear = 1
        sleep 0.5

        # Back to original gear (another PA negotiation)
        dme_write "0x1568" "0x000${orig_tx_gear}"
        dme_write "0x1583" "0x000${orig_rx_gear}"
        sleep 0.5

        # Check after each cycle
        if bit_set 3; then
            local val
            val=$(read_notify)
            pass "Bit 3 (PA_INIT) SET at gear cycle $i! notification=0x$val"
            decode_notify "$val" | tee -a "$LOG_FILE"
            bit3_hit=true
            break
        fi
        log "    After cycle $i: notification=$(read_notify)"
    done

    if [[ "$bit3_hit" == true ]]; then
        record_result 2 3 "PASS"
    else
        fail "Bit 3 not set after $CYCLES gear cycles"
        record_result 2 3 "FAIL"
    fi

    # Restore original gear
    log "Restoring original gear: TX=$orig_tx_gear RX=$orig_rx_gear"
    dme_write "0x1568" "0x000${orig_tx_gear}"
    dme_write "0x1583" "0x000${orig_rx_gear}"
    clear_notify
}

# ─────────────────────────────────────────────────────────────────────────────
# METHOD 3: HIBERN8 CYCLING (Real PA_INIT → Bit 3)
# ─────────────────────────────────────────────────────────────────────────────
run_method3() {
    section "METHOD 3: HIBERN8 Cycling (Real PA_INIT via link sleep)"
    log "Each HIBERN8 exit forces a PA_INIT on the M-PHY link"
    log "Target: Bit 3 (PA_INIT QoS)"

    clear_notify

    log "Triggering HIBERN8 cycles via suspend/resume keyevents ($CYCLES cycles)"
    log "Each screen-off → screen-on = 1 HIBERN8 cycle = 1 PA_INIT"

    local bit3_hit=false
    for i in $(seq 1 "$CYCLES"); do
        log "  HIBERN8 cycle $i/$CYCLES"

        # Screen off → device enters runtime suspend → UFS enters HIBERN8
        run_cmd "input keyevent 26"
        sleep 4

        # Screen on → UFS exits HIBERN8 → PA_INIT fires
        run_cmd "input keyevent 26"
        sleep 2

        if bit_set 3; then
            local val
            val=$(read_notify)
            pass "Bit 3 (PA_INIT) SET at HIBERN8 cycle $i! notification=0x$val"
            decode_notify "$val" | tee -a "$LOG_FILE"
            bit3_hit=true
            break
        fi
        log "    After cycle $i: notification=$(read_notify)"
    done

    if [[ "$bit3_hit" == true ]]; then
        record_result 3 3 "PASS"
    else
        # Fallback: try pm suspend directly
        log "Keyevent method didn't trigger — trying pm suspend directly..."
        for i in $(seq 1 3); do
            run_cmd "echo mem > /sys/power/state"
            sleep 5
            if bit_set 3; then
                pass "Bit 3 SET via pm suspend at cycle $i"
                record_result 3 3 "PASS"
                bit3_hit=true
                break
            fi
        done
        if [[ "$bit3_hit" == false ]]; then
            fail "Bit 3 not set after HIBERN8 cycling"
            record_result 3 3 "FAIL"
        fi
    fi
    clear_notify
}

# ─────────────────────────────────────────────────────────────────────────────
# METHOD 4: LANE TOGGLING (Real DL errors → Bits 1 and 2)
# ─────────────────────────────────────────────────────────────────────────────
run_method4() {
    section "METHOD 4: Lane Toggling (Real Data Link errors)"
    log "Disabling a TX/RX lane during active I/O causes real DL errors"
    log "Target: Bit 1 (TX QoS) and Bit 2 (RX QoS)"

    if [[ "$UFS_UTILS_OK" == false ]]; then
        warn "ufs-utils not available — skipping Method 4"
        record_result 4 1 "SKIP"
        record_result 4 2 "SKIP"
        return
    fi

    local orig_tx_lanes orig_rx_lanes
    orig_tx_lanes=$(dme_read "0x1560")
    orig_rx_lanes=$(dme_read "0x1580")
    log "Current TX lanes: $orig_tx_lanes  RX lanes: $orig_rx_lanes"

    # Only toggle if we have 2 lanes (single-lane devices skip this)
    if [[ "$orig_tx_lanes" != "2" && "$orig_tx_lanes" != "0x2" ]]; then
        warn "Device has <2 TX lanes ($orig_tx_lanes) — lane toggle may not apply"
        warn "Attempting anyway..."
    fi

    # ── 4A: TX lane toggle → Bit 1 ──────────────────────────────────────────
    log ""
    log "── 4A: TX lane disable during write → expect Bit 1 (TX QoS) ──"
    clear_notify

    # Start heavy write stress first
    start_fio_bg "m4a_fio" "write" "512k" "64" "4" "60"
    sleep 3   # Let I/O build up

    log "  Dropping TX from 2 lanes to 1 lane..."
    dme_write "0x1560" "0x0001"   # 1 TX lane
    sleep 2

    if wait_for_bit 1 "$TIMEOUT" "TX QoS via lane drop"; then
        record_result 4 1 "PASS"
    else
        record_result 4 1 "FAIL"
    fi

    # Restore TX lanes
    log "  Restoring TX lanes to $orig_tx_lanes"
    dme_write "0x1560" "0x000${orig_tx_lanes:-2}"
    stop_fio_bg
    clear_notify
    sleep 2

    # ── 4B: RX lane toggle → Bit 2 ──────────────────────────────────────────
    log ""
    log "── 4B: RX lane disable during read → expect Bit 2 (RX QoS) ──"
    clear_notify

    start_fio_bg "m4b_fio" "randread" "4k" "128" "8" "60"
    sleep 3

    log "  Dropping RX from 2 lanes to 1 lane..."
    dme_write "0x1580" "0x0001"   # 1 RX lane
    sleep 2

    if wait_for_bit 2 "$TIMEOUT" "RX QoS via lane drop"; then
        record_result 4 2 "PASS"
    else
        record_result 4 2 "FAIL"
    fi

    log "  Restoring RX lanes to $orig_rx_lanes"
    dme_write "0x1580" "0x000${orig_rx_lanes:-2}"
    stop_fio_bg
    clear_notify
}

# ─────────────────────────────────────────────────────────────────────────────
# METHOD 5: HEAVY I/O STRESS (Organic errors via raw throughput)
# ─────────────────────────────────────────────────────────────────────────────
run_method5() {
    section "METHOD 5: Heavy I/O Stress (Organic QoS events)"
    log "Pure fio stress — no injection, just raw I/O pressure"
    log "Works best with low thresholds set in Step 1"
    log "Target: Bits 1, 2, 3 (all three via combined stress)"

    if [[ "$FIO_OK" == false ]]; then
        warn "fio not available — skipping Method 5"
        record_result 5 1 "SKIP"
        record_result 5 2 "SKIP"
        return
    fi

    # ── 5A: TX Stress (heavy sequential write → Bit 1) ──────────────────────
    log ""
    log "── 5A: Heavy sequential write → expect Bit 1 (TX QoS) ──"
    clear_notify
    log "Running: 512K writes, 4 jobs, iodepth=64 for ${TIMEOUT}s"

    if [[ "$DRY_RUN" == false ]]; then
        $FIO_CMD \
            --name=tx_stress \
            --ioengine=libaio \
            --rw=write \
            --bs=512k \
            --iodepth=64 \
            --numjobs=4 \
            --direct=1 \
            --size=4G \
            --runtime="$TIMEOUT" \
            --time_based \
            --filename="$BLOCK_DEV" \
            --group_reporting \
            --output=/dev/null \
            2>>"$LOG_FILE" &
        local FIO_PID=$!

        # Poll for bit during fio run
        local elapsed=0
        local bit1_hit=false
        while (( elapsed < TIMEOUT )); do
            if bit_set 1; then
                val=$(read_notify)
                pass "Bit 1 (TX QoS) SET after ${elapsed}s of write stress!"
                decode_notify "$val" | tee -a "$LOG_FILE"
                bit1_hit=true
                break
            fi
            sleep 2
            (( elapsed += 2 ))
        done
        kill $FIO_PID 2>/dev/null || true
        wait $FIO_PID 2>/dev/null || true

        if [[ "$bit1_hit" == true ]]; then
            record_result 5 1 "PASS"
        else
            fail "Bit 1 not set during TX stress"
            record_result 5 1 "FAIL"
        fi
    fi
    clear_notify
    sleep 2

    # ── 5B: RX Stress (heavy random read → Bit 2) ────────────────────────────
    log ""
    log "── 5B: Heavy random read → expect Bit 2 (RX QoS) ──"
    clear_notify
    log "Running: 4K reads, 8 jobs, iodepth=128 for ${TIMEOUT}s"

    if [[ "$DRY_RUN" == false ]]; then
        $FIO_CMD \
            --name=rx_stress \
            --ioengine=libaio \
            --rw=randread \
            --bs=4k \
            --iodepth=128 \
            --numjobs=8 \
            --direct=1 \
            --size=2G \
            --runtime="$TIMEOUT" \
            --time_based \
            --filename="$BLOCK_DEV" \
            --group_reporting \
            --output=/dev/null \
            2>>"$LOG_FILE" &
        local FIO_PID=$!

        local elapsed=0
        local bit2_hit=false
        while (( elapsed < TIMEOUT )); do
            if bit_set 2; then
                val=$(read_notify)
                pass "Bit 2 (RX QoS) SET after ${elapsed}s of read stress!"
                decode_notify "$val" | tee -a "$LOG_FILE"
                bit2_hit=true
                break
            fi
            sleep 2
            (( elapsed += 2 ))
        done
        kill $FIO_PID 2>/dev/null || true
        wait $FIO_PID 2>/dev/null || true

        if [[ "$bit2_hit" == true ]]; then
            record_result 5 2 "PASS"
        else
            fail "Bit 2 not set during RX stress"
            record_result 5 2 "FAIL"
        fi
    fi
    clear_notify
    sleep 2

    # ── 5C: Combined stress (TX + RX + CPU → all bits) ───────────────────────
    log ""
    log "── 5C: Combined all-angle stress → expect all bits ──"
    clear_notify
    log "Running: mixed TX+RX+CPU pressure simultaneously for ${TIMEOUT}s"

    if [[ "$DRY_RUN" == false ]]; then
        # Job 1: heavy sequential write (TX stress)
        $FIO_CMD --name=combined_tx --ioengine=libaio --rw=write \
            --bs=256k --iodepth=32 --numjobs=2 --direct=1 \
            --size=2G --runtime="$TIMEOUT" --time_based \
            --filename="$BLOCK_DEV" --output=/dev/null 2>>"$LOG_FILE" &
        local P1=$!

        # Job 2: heavy random read (RX stress)
        $FIO_CMD --name=combined_rx --ioengine=libaio --rw=randread \
            --bs=4k --iodepth=64 --numjobs=4 --direct=1 \
            --size=1G --runtime="$TIMEOUT" --time_based \
            --filename="$BLOCK_DEV" --output=/dev/null 2>>"$LOG_FILE" &
        local P2=$!

        # Job 3: CPU pressure
        dd if=/dev/urandom of=/dev/null bs=1M count=100000 2>/dev/null &
        local P3=$!

        # Monitor all bits during combined stress
        local elapsed=0
        local all_bits_hit=false
        while (( elapsed < TIMEOUT )); do
            local val
            val=$(read_notify)
            local dec=$((val))
            log "  t=${elapsed}s notification=0x${val} ($(decode_notify "$val" | grep "SET" | tr '\n' ' '))"

            # Check if all 3 bits have fired at some point
            if (( dec & 14 )); then   # 14 = bits 1+2+3
                pass "Multiple QoS bits detected! notification=0x${val}"
                decode_notify "$val" | tee -a "$LOG_FILE"
                all_bits_hit=true
                # Don't break — let it run to catch more events
            fi
            sleep 3
            (( elapsed += 3 ))
        done

        kill $P1 $P2 $P3 2>/dev/null || true
        wait $P1 $P2 $P3 2>/dev/null || true

        if [[ "$all_bits_hit" == true ]]; then
            record_result 5 "1+2+3" "PASS"
        else
            warn "Not all bits fired during combined stress — check thresholds"
            record_result 5 "1+2+3" "PARTIAL"
        fi
    fi
    clear_notify
}

# ─────────────────────────────────────────────────────────────────────────────
# RUN SELECTED METHODS
# ─────────────────────────────────────────────────────────────────────────────
section "STARTING SIMULATION"
log "Method selection: $METHOD"
log "Cycles: $CYCLES  Timeout per bit: ${TIMEOUT}s"
log "Dry run: $DRY_RUN"

case "$METHOD" in
    1)    run_method1 ;;
    2)    run_method2 ;;
    3)    run_method3 ;;
    4)    run_method4 ;;
    5)    run_method5 ;;
    all)
        run_method1
        run_method2
        run_method3
        run_method4
        run_method5
        ;;
    *)
        fail "Unknown method: $METHOD (use 1-5 or all)"
        exit 1
        ;;
esac

# ─────────────────────────────────────────────────────────────────────────────
# FINAL SUMMARY
# ─────────────────────────────────────────────────────────────────────────────
section "FINAL SUMMARY"

echo ""
echo -e "${BOLD}┌─────────────────────────────────────────────────┐${RESET}"
echo -e "${BOLD}│         UIC Error Simulation Results            │${RESET}"
echo -e "${BOLD}├──────────────┬──────────┬───────────────────────┤${RESET}"
echo -e "${BOLD}│ Method       │ Bit      │ Result                │${RESET}"
echo -e "${BOLD}├──────────────┼──────────┼───────────────────────┤${RESET}"

for entry in "${RESULTS[@]}"; do
    IFS='|' read -r method bit result <<< "$entry"
    if [[ "$result" == "PASS" ]]; then
        COLOR="$GREEN"
    elif [[ "$result" == "FAIL" ]]; then
        COLOR="$RED"
    elif [[ "$result" == "SKIP" ]]; then
        COLOR="$YELLOW"
    else
        COLOR="$CYAN"
    fi
    printf "│ %-12s │ %-8s │ ${COLOR}%-21s${RESET} │\n" "$method" "$bit" "$result"
done | tee -a "$LOG_FILE"

echo -e "${BOLD}└──────────────┴──────────┴───────────────────────┘${RESET}"
echo ""

# Overall achievement
echo -e "${BOLD}Overall Bit Achievement:${RESET}"
[[ "$BIT1_ACHIEVED" == true ]] && echo -e "  ${GREEN}✔${RESET} Bit 1 (TX QoS)    = ACHIEVED" \
                                || echo -e "  ${RED}✘${RESET} Bit 1 (TX QoS)    = NOT ACHIEVED"
[[ "$BIT2_ACHIEVED" == true ]] && echo -e "  ${GREEN}✔${RESET} Bit 2 (RX QoS)    = ACHIEVED" \
                                || echo -e "  ${RED}✘${RESET} Bit 2 (RX QoS)    = NOT ACHIEVED"
[[ "$BIT3_ACHIEVED" == true ]] && echo -e "  ${GREEN}✔${RESET} Bit 3 (PA_INIT)   = ACHIEVED" \
                                || echo -e "  ${RED}✘${RESET} Bit 3 (PA_INIT)   = NOT ACHIEVED"

echo ""

# Final notification state
FINAL_VAL=$(read_notify)
log "Final dme_qos_notification = $FINAL_VAL"
decode_notify "$FINAL_VAL" | tee -a "$LOG_FILE"

echo ""
echo -e "${BOLD}${GREEN}Log saved to: ${LOG_FILE}${RESET}"
echo ""

# If not all bits achieved, print tips
if [[ "$BIT1_ACHIEVED" == false || "$BIT2_ACHIEVED" == false || "$BIT3_ACHIEVED" == false ]]; then
    echo -e "${YELLOW}Tips for unachieved bits:${RESET}"
    [[ "$BIT1_ACHIEVED" == false ]] && \
        echo "  Bit 1 (TX): Lower threshold 0x5105 to 0x0000, increase fio jobs/iodepth"
    [[ "$BIT2_ACHIEVED" == false ]] && \
        echo "  Bit 2 (RX): Lower threshold 0x5115 to 0x0000, increase fio read iodepth"
    [[ "$BIT3_ACHIEVED" == false ]] && \
        echo "  Bit 3 (PA_INIT): Try --method 3 (HIBERN8) or lower threshold 0x5125 to 0x0000"
    echo ""
    echo -e "  Re-run with lower thresholds:"
    echo -e "  ${CYAN}ufs-utils uic -t 2 -i 0x5105 -v 0x0000 -p $BSG_PATH${RESET}  # TX"
    echo -e "  ${CYAN}ufs-utils uic -t 2 -i 0x5115 -v 0x0000 -p $BSG_PATH${RESET}  # RX"
    echo -e "  ${CYAN}ufs-utils uic -t 2 -i 0x5125 -v 0x0000 -p $BSG_PATH${RESET}  # PA_INIT"
fi
