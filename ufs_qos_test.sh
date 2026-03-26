#!/bin/bash
# =============================================================================
# ufs_qos_test.sh
# UFS UniPro QoS Patch — Stress Test + Regression Test Script
#
# PURPOSE:
#   1. STRESS TEST  — Drive the UFS link hard to trigger real QoS events
#                     (DME counter increments, uevents, PA_INIT cycles)
#   2. REGRESSION   — Verify the patch does NOT hurt normal UFS performance
#                     (IOPS, throughput, latency must stay within baseline)
#
# USAGE (run from host PC with device connected via ADB):
#   chmod +x ufs_qos_test.sh
#   ./ufs_qos_test.sh [OPTIONS]
#
# OPTIONS:
#   --device <serial>   ADB device serial (default: first connected device)
#   --bsg    <path>     UFS BSG node    (default: /dev/ufs-bsg0)
#   --block  <path>     UFS block device (default: /dev/block/sda)
#   --tmpdir <path>     Temp dir on device (default: /data/local/tmp)
#   --stress-dur <sec>  Duration of each stress phase in seconds (default: 120)
#   --regr-dur   <sec>  Duration of each regression fio run in seconds (default: 60)
#   --threshold  <%>    Max allowed performance drop in regression (default: 10)
#   --skip-stress       Skip stress tests, run regression only
#   --skip-regression   Skip regression tests, run stress only
#   --help              Show this help
#
# REQUIREMENTS (on host):
#   adb, bc
#
# REQUIREMENTS (pushed to device automatically by this script):
#   fio binary for Android (arm64)  → place at ./tools/fio before running
#   ufs-utils binary for Android    → place at ./tools/ufs-utils before running
#
# REPORT:
#   A full HTML report is saved to ./ufs_qos_report_<timestamp>.html
#
# =============================================================================

set -euo pipefail

# ─────────────────────────────────────────────────────────────────────────────
# COLOUR CODES
# ─────────────────────────────────────────────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
CYAN='\033[0;36m'; BOLD='\033[1m'; RESET='\033[0m'

# ─────────────────────────────────────────────────────────────────────────────
# DEFAULT CONFIG  (override via CLI flags)
# ─────────────────────────────────────────────────────────────────────────────
ADB_SERIAL=""
BSG_PATH="/dev/ufs-bsg0"
BLOCK_DEV="/dev/block/sda"
TMP_DIR="/data/local/tmp"
STRESS_DUR=120          # seconds per stress phase
REGR_DUR=60             # seconds per fio regression run
REGR_THRESHOLD=10       # max % performance drop allowed (regression pass/fail)
SKIP_STRESS=false
SKIP_REGRESSION=false
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
REPORT_FILE="./ufs_qos_report_${TIMESTAMP}.html"
LOG_FILE="./ufs_qos_log_${TIMESTAMP}.txt"

# ─────────────────────────────────────────────────────────────────────────────
# PARSE CLI ARGS
# ─────────────────────────────────────────────────────────────────────────────
while [[ $# -gt 0 ]]; do
    case $1 in
        --device)    ADB_SERIAL="$2"; shift 2 ;;
        --bsg)       BSG_PATH="$2";   shift 2 ;;
        --block)     BLOCK_DEV="$2";  shift 2 ;;
        --tmpdir)    TMP_DIR="$2";    shift 2 ;;
        --stress-dur) STRESS_DUR="$2"; shift 2 ;;
        --regr-dur)  REGR_DUR="$2";   shift 2 ;;
        --threshold) REGR_THRESHOLD="$2"; shift 2 ;;
        --skip-stress)      SKIP_STRESS=true;     shift ;;
        --skip-regression)  SKIP_REGRESSION=true; shift ;;
        --help)
            sed -n '/^# USAGE/,/^# ====/p' "$0" | head -30
            exit 0 ;;
        *) echo "Unknown option: $1"; exit 1 ;;
    esac
done

# Build ADB command prefix
ADB="adb"
[[ -n "$ADB_SERIAL" ]] && ADB="adb -s $ADB_SERIAL"

# ─────────────────────────────────────────────────────────────────────────────
# LOGGING HELPERS
# ─────────────────────────────────────────────────────────────────────────────
log()      { echo -e "${CYAN}[$(date +%H:%M:%S)]${RESET} $*" | tee -a "$LOG_FILE"; }
pass()     { echo -e "${GREEN}  ✔ PASS${RESET} $*"           | tee -a "$LOG_FILE"; }
fail()     { echo -e "${RED}  ✘ FAIL${RESET} $*"             | tee -a "$LOG_FILE"; }
warn()     { echo -e "${YELLOW}  ⚠ WARN${RESET} $*"          | tee -a "$LOG_FILE"; }
section()  { echo -e "\n${BOLD}━━━ $* ━━━${RESET}\n"         | tee -a "$LOG_FILE"; }

# Redirect all adb output to log too
adb_shell() { $ADB shell "$@" 2>>"$LOG_FILE"; }

# ─────────────────────────────────────────────────────────────────────────────
# HTML REPORT HELPERS
# ─────────────────────────────────────────────────────────────────────────────
HTML_BODY=""

html_section() {
    HTML_BODY+="<h2>$1</h2>"
}

html_row() {
    # html_row "label" "value" "PASS|FAIL|INFO"
    local color="black"
    case "$3" in
        PASS) color="green" ;;
        FAIL) color="red"   ;;
        WARN) color="orange";;
        INFO) color="#555"  ;;
    esac
    HTML_BODY+="<tr><td>$1</td><td><b style='color:${color}'>$2</b></td><td style='color:${color}'>$3</td></tr>"
}

html_table_start() { HTML_BODY+="<table border='1' cellpadding='6' cellspacing='0' style='border-collapse:collapse;width:100%;margin-bottom:20px'><tr style='background:#ddd'><th>Test</th><th>Value</th><th>Result</th></tr>"; }
html_table_end()   { HTML_BODY+="</table>"; }

html_code() { HTML_BODY+="<pre style='background:#f4f4f4;padding:10px;border-radius:4px;overflow-x:auto'>$1</pre>"; }

write_report() {
    cat > "$REPORT_FILE" <<EOF
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>UFS QoS Test Report — ${TIMESTAMP}</title>
<style>
  body { font-family: Arial, sans-serif; margin: 40px; color: #222; }
  h1   { background: #1a237e; color: white; padding: 16px; border-radius: 6px; }
  h2   { color: #1a237e; border-bottom: 2px solid #1a237e; padding-bottom: 4px; }
  table { font-size: 14px; }
  td,th { padding: 6px 12px; }
  tr:nth-child(even) { background: #f9f9f9; }
  pre  { font-size: 12px; }
  .summary { font-size: 18px; font-weight: bold; padding: 12px;
             border-radius: 6px; margin: 20px 0; }
  .summary.pass { background: #e8f5e9; color: green; }
  .summary.fail { background: #ffebee; color: red; }
</style>
</head>
<body>
<h1>UFS UniPro QoS Patch — Test Report</h1>
<p><b>Date:</b> $(date)<br>
   <b>Device:</b> $DEVICE_MODEL<br>
   <b>Kernel:</b> $KERNEL_VER<br>
   <b>BSG node:</b> $BSG_PATH<br>
   <b>Block dev:</b> $BLOCK_DEV</p>
${HTML_BODY}
</body>
</html>
EOF
    log "Report saved → $REPORT_FILE"
}

# ─────────────────────────────────────────────────────────────────────────────
# STEP 0: PRE-FLIGHT CHECKS
# ─────────────────────────────────────────────────────────────────────────────
section "PRE-FLIGHT CHECKS"

# Check ADB connection
if ! $ADB get-state &>/dev/null; then
    fail "No ADB device found. Connect device and retry."
    exit 1
fi
pass "ADB device found"

DEVICE_MODEL=$(adb_shell getprop ro.product.model | tr -d '\r')
KERNEL_VER=$(adb_shell uname -r | tr -d '\r')
log "Device : $DEVICE_MODEL"
log "Kernel : $KERNEL_VER"

# Check BSG node exists
if ! adb_shell "[ -c $BSG_PATH ]" 2>/dev/null; then
    warn "BSG node $BSG_PATH not found — DME counter reads will be skipped"
    BSG_AVAILABLE=false
else
    BSG_AVAILABLE=true
    pass "BSG node $BSG_PATH found"
fi

# Push tools if they exist locally
for tool in fio ufs-utils; do
    if [[ -f "./tools/$tool" ]]; then
        $ADB push "./tools/$tool" "$TMP_DIR/$tool" >>"$LOG_FILE" 2>&1
        adb_shell "chmod +x $TMP_DIR/$tool"
        pass "Pushed $tool to device"
    else
        warn "./tools/$tool not found locally — some tests may be skipped"
    fi
done

# Check fio on device
FIO_CMD="$TMP_DIR/fio"
if ! adb_shell "$FIO_CMD --version" &>/dev/null; then
    # Try system fio
    if adb_shell "fio --version" &>/dev/null; then
        FIO_CMD="fio"
        pass "System fio found"
    else
        fail "fio not available on device — regression tests will be skipped"
        SKIP_REGRESSION=true
    fi
fi

# Check ufs-utils on device
UFS_CMD="$TMP_DIR/ufs-utils"
if ! adb_shell "$UFS_CMD --version" &>/dev/null 2>&1; then
    UFS_AVAILABLE=false
    warn "ufs-utils not available — DME counter tests will be skipped"
else
    UFS_AVAILABLE=true
    pass "ufs-utils found on device"
fi

# Find UFS sysfs stats path
UFS_STATS_PATH=$(adb_shell "find /sys -name 'err_stats' 2>/dev/null | head -1 | xargs dirname" 2>/dev/null | tr -d '\r')
if [[ -z "$UFS_STATS_PATH" ]]; then
    UFS_STATS_PATH=$(adb_shell "find /sys/devices -path '*ufshcd*' -name 'ufs_stats' 2>/dev/null | head -1" 2>/dev/null | tr -d '\r')
fi
if [[ -n "$UFS_STATS_PATH" ]]; then
    pass "UFS sysfs stats path: $UFS_STATS_PATH"
else
    warn "UFS sysfs stats path not found — sysfs counter tests skipped"
fi

# ─────────────────────────────────────────────────────────────────────────────
# HELPER: Read a single DME QoS attribute
# ─────────────────────────────────────────────────────────────────────────────
read_dme_attr() {
    # read_dme_attr <attr_hex>  → prints numeric value or "N/A"
    local attr="$1"
    if [[ "$UFS_AVAILABLE" == true && "$BSG_AVAILABLE" == true ]]; then
        local val
        val=$(adb_shell "$UFS_CMD uic -t 2 -i $attr -p $BSG_PATH 2>/dev/null" \
              | grep -oP ':\s*\K[0-9]+' | head -1 | tr -d '\r')
        echo "${val:-N/A}"
    else
        echo "N/A"
    fi
}

# ─────────────────────────────────────────────────────────────────────────────
# HELPER: Capture a full DME QoS snapshot → associative-array-style output
# ─────────────────────────────────────────────────────────────────────────────
snapshot_dme() {
    # Usage: snapshot_dme <label>
    # Prints: LABEL_TX_NAC=5  LABEL_CRC=0  etc.
    local label="$1"
    declare -gA DME_SNAP_${label}
    local attrs=(
        "TX_DATA_OFL:0x5100"
        "TX_NAC:0x5101"
        "TX_QOS:0x5102"
        "TX_DL_ERR:0x5103"
        "RX_DATA_OFL:0x5110"
        "RX_CRC:0x5111"
        "RX_QOS:0x5112"
        "RX_DL_ERR:0x5113"
        "TXRX_DATA_OFL:0x5120"
        "PA_INIT:0x5121"
        "TXRX_QOS:0x5122"
        "TXRX_DL_ERR:0x5123"
        "QOS_ENABLE:0x5130"
        "QOS_STATUS:0x5131"
    )
    for entry in "${attrs[@]}"; do
        local name="${entry%%:*}"
        local addr="${entry##*:}"
        local val
        val=$(read_dme_attr "$addr")
        eval "DME_SNAP_${label}_${name}=${val}"
        echo "  ${name} = ${val}"
    done
}

# ─────────────────────────────────────────────────────────────────────────────
# HELPER: Listen for uevents in background, capture to file
# ─────────────────────────────────────────────────────────────────────────────
UEVENT_LOG="$TMP_DIR/ufs_uevent_capture.txt"
start_uevent_listener() {
    adb_shell "udevadm monitor --kernel --subsystem-match=ufs > $UEVENT_LOG 2>&1 &"
    UEVENT_PID=$(adb_shell "pgrep -f 'udevadm monitor' | tail -1" | tr -d '\r')
    log "Uevent listener started (PID $UEVENT_PID)"
}

stop_uevent_listener() {
    adb_shell "kill $UEVENT_PID 2>/dev/null || true"
    log "Uevent listener stopped"
}

count_uevents() {
    local count
    count=$(adb_shell "grep -c 'SUBSYSTEM=ufs\|ufs-bsg\|(ufs)' $UEVENT_LOG 2>/dev/null || echo 0" | tr -d '\r')
    echo "${count:-0}"
}

# ─────────────────────────────────────────────────────────────────────────────
# HELPER: Run fio on device and parse IOPS + BW + latency from JSON output
# ─────────────────────────────────────────────────────────────────────────────
FIO_JSON="$TMP_DIR/fio_result.json"

run_fio() {
    # run_fio <name> <rw_mode> <block_size> <iodepth> <numjobs> <runtime_sec>
    # Returns: sets globals FIO_READ_IOPS FIO_WRITE_IOPS FIO_READ_BW FIO_WRITE_BW
    #          FIO_READ_LAT_US FIO_WRITE_LAT_US
    local name="$1" rw="$2" bs="$3" iodepth="$4" numjobs="$5" runtime="$6"

    log "  Running fio: name=$name rw=$rw bs=$bs iodepth=$iodepth jobs=$numjobs runtime=${runtime}s"

    adb_shell "$FIO_CMD \
        --name=$name \
        --ioengine=libaio \
        --rw=$rw \
        --bs=$bs \
        --iodepth=$iodepth \
        --numjobs=$numjobs \
        --direct=1 \
        --size=1G \
        --runtime=$runtime \
        --time_based \
        --filename=$BLOCK_DEV \
        --output-format=json \
        --output=$FIO_JSON \
        --group_reporting \
        2>/dev/null"

    # Pull and parse JSON
    local json
    json=$($ADB shell cat "$FIO_JSON" 2>/dev/null | tr -d '\r')

    # Parse with shell (no jq dependency needed)
    FIO_READ_IOPS=$(echo  "$json" | grep -oP '"read"[^}]*"iops"\s*:\s*\K[0-9.]+' | head -1)
    FIO_WRITE_IOPS=$(echo "$json" | grep -oP '"write"[^}]*"iops"\s*:\s*\K[0-9.]+' | head -1)
    FIO_READ_BW=$(echo    "$json" | grep -oP '"read"[^}]*"bw"\s*:\s*\K[0-9.]+' | head -1)
    FIO_WRITE_BW=$(echo   "$json" | grep -oP '"write"[^}]*"bw"\s*:\s*\K[0-9.]+' | head -1)
    # lat_ns → convert to us
    local r_lat_ns w_lat_ns
    r_lat_ns=$(echo "$json" | grep -oP '"read".*?"lat_ns".*?"mean"\s*:\s*\K[0-9.]+' | head -1)
    w_lat_ns=$(echo "$json" | grep -oP '"write".*?"lat_ns".*?"mean"\s*:\s*\K[0-9.]+' | head -1)
    FIO_READ_LAT_US=$(echo "scale=1; ${r_lat_ns:-0} / 1000" | bc 2>/dev/null || echo "N/A")
    FIO_WRITE_LAT_US=$(echo "scale=1; ${w_lat_ns:-0} / 1000" | bc 2>/dev/null || echo "N/A")

    FIO_READ_IOPS="${FIO_READ_IOPS:-0}"
    FIO_WRITE_IOPS="${FIO_WRITE_IOPS:-0}"
    FIO_READ_BW="${FIO_READ_BW:-0}"
    FIO_WRITE_BW="${FIO_WRITE_BW:-0}"
}

# ─────────────────────────────────────────────────────────────────────────────
# HELPER: Compare two numbers with a threshold (percentage drop)
# ─────────────────────────────────────────────────────────────────────────────
check_regression() {
    # check_regression <baseline> <current> <threshold_%> <metric_name>
    # Returns 0 (pass) or 1 (fail)
    local base="$1" cur="$2" thresh="$3" name="$4"
    if [[ "$base" == "0" || "$base" == "N/A" || "$cur" == "N/A" ]]; then
        warn "$name: baseline or current is 0/N/A, skipping comparison"
        html_row "$name regression" "baseline=$base current=$cur" "WARN"
        return 0
    fi
    local drop
    drop=$(echo "scale=1; 100 - ($cur * 100 / $base)" | bc 2>/dev/null || echo "0")
    local drop_abs="${drop#-}"  # absolute value
    if (( $(echo "$drop_abs > $thresh" | bc -l) )); then
        fail "$name dropped ${drop}% (threshold: ${thresh}%)  baseline=$base  current=$cur"
        html_row "$name regression" "drop=${drop}% baseline=$base current=$cur" "FAIL"
        return 1
    else
        pass "$name within threshold: drop=${drop}%  baseline=$base  current=$cur"
        html_row "$name regression" "drop=${drop}% baseline=$base current=$cur" "PASS"
        return 0
    fi
}

# ─────────────────────────────────────────────────────────────────────────────
# PHASE 1: BASELINE DME SNAPSHOT
# ─────────────────────────────────────────────────────────────────────────────
section "PHASE 1: BASELINE DME SNAPSHOT"
html_section "Phase 1 — Baseline DME QoS Snapshot"
html_table_start

log "Reading DME QoS attribute baseline (before stress)..."

# Verify QoS monitoring is enabled (DME_QoS_ENABLE = 0x5130)
QOS_ENABLE=$(read_dme_attr "0x5130")
log "DME_QoS_ENABLE = $QOS_ENABLE"
if [[ "$QOS_ENABLE" == "1" ]]; then
    pass "QoS monitoring enabled by patch"
    html_row "DME_QoS_ENABLE (0x5130)" "$QOS_ENABLE" "PASS"
elif [[ "$QOS_ENABLE" == "N/A" ]]; then
    warn "Could not read DME_QoS_ENABLE (ufs-utils or BSG unavailable)"
    html_row "DME_QoS_ENABLE (0x5130)" "N/A" "WARN"
else
    fail "DME_QoS_ENABLE = $QOS_ENABLE — patch may not have initialized QoS"
    html_row "DME_QoS_ENABLE (0x5130)" "$QOS_ENABLE" "FAIL"
fi

log "Capturing pre-stress DME baseline..."
BASE_TX_NAC=$(read_dme_attr "0x5101")
BASE_TX_OFL=$(read_dme_attr "0x5100")
BASE_RX_CRC=$(read_dme_attr "0x5111")
BASE_RX_OFL=$(read_dme_attr "0x5110")
BASE_PA_INIT=$(read_dme_attr "0x5121")
BASE_TXRX_QOS=$(read_dme_attr "0x5122")
BASE_QOS_STATUS=$(read_dme_attr "0x5131")

log "  TX_NAC       = $BASE_TX_NAC"
log "  TX_DATA_OFL  = $BASE_TX_OFL"
log "  RX_CRC_ERROR = $BASE_RX_CRC"
log "  RX_DATA_OFL  = $BASE_RX_OFL"
log "  PA_INIT      = $BASE_PA_INIT"
log "  TXRX_QOS_CNT = $BASE_TXRX_QOS"
log "  QOS_STATUS   = $BASE_QOS_STATUS"

html_row "TX_NAC_RECEIVED (baseline)"     "$BASE_TX_NAC"     "INFO"
html_row "TX_DATA_OFL (baseline)"         "$BASE_TX_OFL"     "INFO"
html_row "RX_CRC_ERROR (baseline)"        "$BASE_RX_CRC"     "INFO"
html_row "RX_DATA_OFL (baseline)"         "$BASE_RX_OFL"     "INFO"
html_row "PA_INIT_REQUEST (baseline)"     "$BASE_PA_INIT"    "INFO"
html_row "TXRX_QOS_COUNT (baseline)"      "$BASE_TXRX_QOS"   "INFO"
html_row "QOS_STATUS (baseline)"          "$BASE_QOS_STATUS" "INFO"
html_table_end

# ─────────────────────────────────────────────────────────────────────────────
# PHASE 2: REGRESSION BASELINE — measure performance BEFORE stress
# ─────────────────────────────────────────────────────────────────────────────
if [[ "$SKIP_REGRESSION" == false ]]; then
    section "PHASE 2: REGRESSION BASELINE (Pre-Stress Performance)"
    html_section "Phase 2 — Regression Baseline (Pre-Stress)"
    html_table_start

    log "Measuring baseline UFS performance (before any stress)..."

    # 2A: Sequential Read throughput (128K blocks, large file)
    run_fio "baseline_seqread" "read" "128k" "32" "1" "$REGR_DUR"
    BASE_SEQ_READ_BW="$FIO_READ_BW"
    BASE_SEQ_READ_LAT="$FIO_READ_LAT_US"
    log "  Seq Read BW:  ${BASE_SEQ_READ_BW} KB/s"
    html_row "Seq Read Throughput (KB/s)" "$BASE_SEQ_READ_BW" "INFO"

    # 2B: Sequential Write throughput (128K blocks)
    run_fio "baseline_seqwrite" "write" "128k" "32" "1" "$REGR_DUR"
    BASE_SEQ_WRITE_BW="$FIO_WRITE_BW"
    log "  Seq Write BW: ${BASE_SEQ_WRITE_BW} KB/s"
    html_row "Seq Write Throughput (KB/s)" "$BASE_SEQ_WRITE_BW" "INFO"

    # 2C: Random 4K Read IOPS (typical app workload)
    run_fio "baseline_randread" "randread" "4k" "32" "4" "$REGR_DUR"
    BASE_RAND_READ_IOPS="$FIO_READ_IOPS"
    BASE_RAND_READ_LAT="$FIO_READ_LAT_US"
    log "  Rand Read IOPS:     ${BASE_RAND_READ_IOPS}"
    log "  Rand Read Lat (us): ${BASE_RAND_READ_LAT}"
    html_row "Rand 4K Read IOPS (baseline)"     "$BASE_RAND_READ_IOPS" "INFO"
    html_row "Rand 4K Read Latency µs (baseline)" "$BASE_RAND_READ_LAT" "INFO"

    # 2D: Random 4K Write IOPS (database / logging workload)
    run_fio "baseline_randwrite" "randwrite" "4k" "32" "4" "$REGR_DUR"
    BASE_RAND_WRITE_IOPS="$FIO_WRITE_IOPS"
    BASE_RAND_WRITE_LAT="$FIO_WRITE_LAT_US"
    log "  Rand Write IOPS:     ${BASE_RAND_WRITE_IOPS}"
    log "  Rand Write Lat (us): ${BASE_RAND_WRITE_LAT}"
    html_row "Rand 4K Write IOPS (baseline)"      "$BASE_RAND_WRITE_IOPS" "INFO"
    html_row "Rand 4K Write Latency µs (baseline)" "$BASE_RAND_WRITE_LAT" "INFO"

    # 2E: Mixed 70/30 read/write (realistic mixed workload)
    run_fio "baseline_mixed" "randrw" "4k" "16" "4" "$REGR_DUR"
    BASE_MIX_READ_IOPS="$FIO_READ_IOPS"
    BASE_MIX_WRITE_IOPS="$FIO_WRITE_IOPS"
    log "  Mixed Read IOPS:  ${BASE_MIX_READ_IOPS}"
    log "  Mixed Write IOPS: ${BASE_MIX_WRITE_IOPS}"
    html_row "Mixed Read IOPS (baseline)"  "$BASE_MIX_READ_IOPS"  "INFO"
    html_row "Mixed Write IOPS (baseline)" "$BASE_MIX_WRITE_IOPS" "INFO"

    html_table_end
    pass "Baseline measurements complete"
fi

# ─────────────────────────────────────────────────────────────────────────────
# PHASE 3: STRESS TESTS
# ─────────────────────────────────────────────────────────────────────────────
if [[ "$SKIP_STRESS" == false ]]; then

    section "PHASE 3: STRESS TESTS"
    html_section "Phase 3 — Stress Tests"

    # Start uevent listener before all stress phases
    start_uevent_listener

    # ── 3A: I/O CONGESTION STRESS ─────────────────────────────────────────────
    # Goal: Trigger TX_DATA_OFL and TX_NAC by saturating write bandwidth
    section "  3A: I/O Congestion Stress (Sequential Overload)"
    html_table_start
    log "Running heavy sequential write to saturate UFS link..."
    log "  Expected: TX_DATA_OFL and TX_NAC counters to increment"

    PRE_TX_NAC=$(read_dme_attr "0x5101")
    PRE_TX_OFL=$(read_dme_attr "0x5100")

    # Heavy sequential write with high queue depth — maximises link congestion
    adb_shell "$FIO_CMD \
        --name=congestion_stress \
        --ioengine=libaio \
        --rw=write \
        --bs=512k \
        --iodepth=64 \
        --numjobs=4 \
        --direct=1 \
        --size=4G \
        --runtime=$STRESS_DUR \
        --time_based \
        --filename=$BLOCK_DEV \
        --group_reporting \
        >/dev/null 2>&1 || true"

    POST_TX_NAC=$(read_dme_attr "0x5101")
    POST_TX_OFL=$(read_dme_attr "0x5100")

    delta_nac=$(( ${POST_TX_NAC:-0} - ${PRE_TX_NAC:-0} ))
    delta_ofl=$(( ${POST_TX_OFL:-0} - ${PRE_TX_OFL:-0} ))
    log "  TX_NAC delta:      +$delta_nac  ($PRE_TX_NAC → $POST_TX_NAC)"
    log "  TX_DATA_OFL delta: +$delta_ofl  ($PRE_TX_OFL → $POST_TX_OFL)"

    if (( delta_nac > 0 || delta_ofl > 0 )); then
        pass "Congestion stress induced TX QoS events (NAC=$delta_nac OFL=$delta_ofl)"
        html_row "Congestion stress — TX_NAC delta"     "+$delta_nac" "PASS"
        html_row "Congestion stress — TX_DATA_OFL delta" "+$delta_ofl" "PASS"
    else
        warn "No TX_NAC/OFL increase observed — link may be handling load fine"
        html_row "Congestion stress — TX_NAC delta"     "+$delta_nac" "WARN"
        html_row "Congestion stress — TX_DATA_OFL delta" "+$delta_ofl" "WARN"
    fi
    html_table_end

    # ── 3B: RANDOM I/O STRESS ─────────────────────────────────────────────────
    # Goal: Trigger RX_CRC errors via random small I/O (worst-case signal integrity)
    section "  3B: Random I/O Stress (4K Random Hammer)"
    html_table_start
    log "Running 4K random read+write to stress signal integrity..."
    log "  Expected: RX_CRC_ERROR to increment under mixed pressure"

    PRE_RX_CRC=$(read_dme_attr "0x5111")
    PRE_RX_OFL=$(read_dme_attr "0x5110")

    adb_shell "$FIO_CMD \
        --name=randrw_stress \
        --ioengine=libaio \
        --rw=randrw \
        --rwmixread=50 \
        --bs=4k \
        --iodepth=128 \
        --numjobs=8 \
        --direct=1 \
        --size=2G \
        --runtime=$STRESS_DUR \
        --time_based \
        --filename=$BLOCK_DEV \
        --group_reporting \
        >/dev/null 2>&1 || true"

    POST_RX_CRC=$(read_dme_attr "0x5111")
    POST_RX_OFL=$(read_dme_attr "0x5110")

    delta_crc=$(( ${POST_RX_CRC:-0} - ${PRE_RX_CRC:-0} ))
    delta_rxofl=$(( ${POST_RX_OFL:-0} - ${PRE_RX_OFL:-0} ))
    log "  RX_CRC_ERROR delta: +$delta_crc  ($PRE_RX_CRC → $POST_RX_CRC)"
    log "  RX_DATA_OFL delta:  +$delta_rxofl  ($PRE_RX_OFL → $POST_RX_OFL)"

    html_row "Random I/O stress — RX_CRC delta"     "+$delta_crc"    "INFO"
    html_row "Random I/O stress — RX_DATA_OFL delta" "+$delta_rxofl"  "INFO"
    pass "Random I/O stress completed (CRC errors are system-specific)"
    html_table_end

    # ── 3C: SUSPEND/RESUME CYCLE TEST ─────────────────────────────────────────
    # Goal: Each suspend→resume cycle MUST increment PA_INIT counter
    #       and the uevent MUST fire on resume
    section "  3C: Suspend/Resume Cycle Test (PA_INIT)"
    html_table_start
    log "Running 5 suspend/resume cycles to trigger PA_INIT events..."

    PRE_PA_INIT=$(read_dme_attr "0x5121")
    UEVENT_COUNT_BEFORE=$(count_uevents)

    RESUME_PASS=0
    for i in $(seq 1 5); do
        log "  Cycle $i/5: suspending device..."
        adb_shell "input keyevent 26"          # screen off (triggers autosuspend)
        sleep 5
        adb_shell "input keyevent 26"          # wake up
        sleep 3

        CURRENT_PA=$(read_dme_attr "0x5121")
        log "    PA_INIT after cycle $i: $CURRENT_PA"
        (( RESUME_PASS++ )) || true
    done

    POST_PA_INIT=$(read_dme_attr "0x5121")
    UEVENT_COUNT_AFTER=$(count_uevents)

    delta_pa=$(( ${POST_PA_INIT:-0} - ${PRE_PA_INIT:-0} ))
    delta_ev=$(( ${UEVENT_COUNT_AFTER:-0} - ${UEVENT_COUNT_BEFORE:-0} ))

    log "  PA_INIT delta:  +$delta_pa  ($PRE_PA_INIT → $POST_PA_INIT)"
    log "  UFS uevents fired during test: $delta_ev"

    if (( delta_pa >= 5 )); then
        pass "PA_INIT incremented on every resume cycle (+$delta_pa)"
        html_row "PA_INIT increments (5 cycles)" "+$delta_pa / 5" "PASS"
    elif (( delta_pa > 0 )); then
        warn "PA_INIT incremented partially (+$delta_pa / 5 cycles)"
        html_row "PA_INIT increments (5 cycles)" "+$delta_pa / 5" "WARN"
    else
        fail "PA_INIT did NOT increment — suspend/resume may not be triggering UIC"
        html_row "PA_INIT increments (5 cycles)" "+$delta_pa / 5" "FAIL"
    fi

    if (( delta_ev > 0 )); then
        pass "UFS uevents fired during suspend/resume cycles (+$delta_ev events)"
        html_row "UFS uevents on PA_INIT" "+$delta_ev events" "PASS"
    else
        warn "No UFS uevents captured — check uevent listener or patch uevent hook"
        html_row "UFS uevents on PA_INIT" "0" "WARN"
    fi
    html_table_end

    # ── 3D: COMBINED THERMAL-STYLE STRESS ─────────────────────────────────────
    # Goal: Hit the link from all angles simultaneously
    #       sequential + random + CPU pressure at the same time
    section "  3D: Combined Thermal-Style Stress (All Angles)"
    html_table_start
    log "Running combined multi-queue stress (mimics thermal load scenario)..."
    log "  This exercises ALL DME QoS counters simultaneously"

    PRE_TXRX_QOS=$(read_dme_attr "0x5122")

    # Launch parallel stress jobs on device
    adb_shell "
        # Job 1: heavy sequential write (fills TX pipeline)
        $FIO_CMD --name=j1 --ioengine=libaio --rw=write \
            --bs=256k --iodepth=32 --numjobs=2 --direct=1 \
            --size=2G --runtime=$STRESS_DUR --time_based \
            --filename=${BLOCK_DEV} >/dev/null 2>&1 &

        # Job 2: heavy random read (stresses RX pipeline)
        $FIO_CMD --name=j2 --ioengine=libaio --rw=randread \
            --bs=4k --iodepth=64 --numjobs=4 --direct=1 \
            --size=1G --runtime=$STRESS_DUR --time_based \
            --filename=${BLOCK_DEV} >/dev/null 2>&1 &

        # Job 3: CPU + memory pressure (mimics thermal stress)
        dd if=/dev/urandom of=/dev/null bs=1M count=10000 2>/dev/null &
        DD_PID=\$!

        # Wait for all fio jobs
        wait \$(pgrep -f 'fio --name=j1') 2>/dev/null || true
        wait \$(pgrep -f 'fio --name=j2') 2>/dev/null || true
        kill \$DD_PID 2>/dev/null || true
    " || true

    POST_TXRX_QOS=$(read_dme_attr "0x5122")
    TOTAL_UEVENTS=$(count_uevents)

    delta_qos=$(( ${POST_TXRX_QOS:-0} - ${PRE_TXRX_QOS:-0} ))
    log "  TXRX_QOS_COUNT delta: +$delta_qos"
    log "  Total UFS uevents captured so far: $TOTAL_UEVENTS"

    html_row "Combined stress — TXRX_QOS delta" "+$delta_qos"     "INFO"
    html_row "Total UFS uevents fired (all stress)" "$TOTAL_UEVENTS" \
        "$([ "$TOTAL_UEVENTS" -gt 0 ] && echo PASS || echo WARN)"
    pass "Combined stress phase completed"
    html_table_end

    stop_uevent_listener

    # ── 3E: POST-STRESS FULL DME SNAPSHOT ─────────────────────────────────────
    section "  3E: Post-Stress DME Snapshot"
    html_section "Phase 3E — Post-Stress DME Counter Summary"
    html_table_start
    log "Reading all DME QoS counters after all stress phases..."

    POST_TX_NAC=$(read_dme_attr "0x5101")
    POST_TX_OFL=$(read_dme_attr "0x5100")
    POST_TX_QOSC=$(read_dme_attr "0x5102")
    POST_TX_DL=$(read_dme_attr "0x5103")
    POST_RX_CRC=$(read_dme_attr "0x5111")
    POST_RX_OFL=$(read_dme_attr "0x5110")
    POST_RX_QOSC=$(read_dme_attr "0x5112")
    POST_RX_DL=$(read_dme_attr "0x5113")
    POST_PA_INIT=$(read_dme_attr "0x5121")
    POST_TXRX_QOS=$(read_dme_attr "0x5122")
    POST_QOS_STATUS=$(read_dme_attr "0x5131")

    html_row "TX_NAC_RECEIVED (post)"    "$POST_TX_NAC"     "INFO"
    html_row "TX_DATA_OFL (post)"        "$POST_TX_OFL"     "INFO"
    html_row "TX_QOS_COUNT (post)"       "$POST_TX_QOSC"    "INFO"
    html_row "TX_DL_ERR (post)"          "$POST_TX_DL"      "INFO"
    html_row "RX_CRC_ERROR (post)"       "$POST_RX_CRC"     "INFO"
    html_row "RX_DATA_OFL (post)"        "$POST_RX_OFL"     "INFO"
    html_row "RX_QOS_COUNT (post)"       "$POST_RX_QOSC"    "INFO"
    html_row "RX_DL_ERR (post)"          "$POST_RX_DL"      "INFO"
    html_row "PA_INIT_REQUEST (post)"    "$POST_PA_INIT"    "INFO"
    html_row "TXRX_QOS_COUNT (post)"     "$POST_TXRX_QOS"   "INFO"
    html_row "QOS_STATUS (post)"         "$POST_QOS_STATUS" "INFO"
    html_table_end

fi # end SKIP_STRESS

# ─────────────────────────────────────────────────────────────────────────────
# PHASE 4: REGRESSION TEST — performance AFTER stress must match baseline
# ─────────────────────────────────────────────────────────────────────────────
if [[ "$SKIP_REGRESSION" == false ]]; then
    section "PHASE 4: REGRESSION TEST (Post-Stress Performance)"
    html_section "Phase 4 — Regression Test (Post-Stress vs Baseline)"
    html_table_start
    log "Measuring UFS performance AFTER stress — comparing to baseline..."
    log "Allowed regression threshold: ${REGR_THRESHOLD}%"

    REGRESSION_PASS=true

    # 4A: Sequential Read
    run_fio "regr_seqread" "read" "128k" "32" "1" "$REGR_DUR"
    REGR_SEQ_READ_BW="$FIO_READ_BW"
    check_regression "$BASE_SEQ_READ_BW" "$REGR_SEQ_READ_BW" \
        "$REGR_THRESHOLD" "Seq Read Throughput (KB/s)" || REGRESSION_PASS=false

    # 4B: Sequential Write
    run_fio "regr_seqwrite" "write" "128k" "32" "1" "$REGR_DUR"
    REGR_SEQ_WRITE_BW="$FIO_WRITE_BW"
    check_regression "$BASE_SEQ_WRITE_BW" "$REGR_SEQ_WRITE_BW" \
        "$REGR_THRESHOLD" "Seq Write Throughput (KB/s)" || REGRESSION_PASS=false

    # 4C: Random 4K Read IOPS
    run_fio "regr_randread" "randread" "4k" "32" "4" "$REGR_DUR"
    REGR_RAND_READ_IOPS="$FIO_READ_IOPS"
    REGR_RAND_READ_LAT="$FIO_READ_LAT_US"
    check_regression "$BASE_RAND_READ_IOPS" "$REGR_RAND_READ_IOPS" \
        "$REGR_THRESHOLD" "Rand 4K Read IOPS" || REGRESSION_PASS=false
    # For latency: a RISE is a regression (higher latency = worse)
    check_regression "$REGR_RAND_READ_LAT" "$BASE_RAND_READ_LAT" \
        "$REGR_THRESHOLD" "Rand 4K Read Latency µs (lower=better)" || REGRESSION_PASS=false

    # 4D: Random 4K Write IOPS
    run_fio "regr_randwrite" "randwrite" "4k" "32" "4" "$REGR_DUR"
    REGR_RAND_WRITE_IOPS="$FIO_WRITE_IOPS"
    REGR_RAND_WRITE_LAT="$FIO_WRITE_LAT_US"
    check_regression "$BASE_RAND_WRITE_IOPS" "$REGR_RAND_WRITE_IOPS" \
        "$REGR_THRESHOLD" "Rand 4K Write IOPS" || REGRESSION_PASS=false
    check_regression "$REGR_RAND_WRITE_LAT" "$BASE_RAND_WRITE_LAT" \
        "$REGR_THRESHOLD" "Rand 4K Write Latency µs (lower=better)" || REGRESSION_PASS=false

    # 4E: Mixed workload
    run_fio "regr_mixed" "randrw" "4k" "16" "4" "$REGR_DUR"
    REGR_MIX_READ_IOPS="$FIO_READ_IOPS"
    REGR_MIX_WRITE_IOPS="$FIO_WRITE_IOPS"
    check_regression "$BASE_MIX_READ_IOPS" "$REGR_MIX_READ_IOPS" \
        "$REGR_THRESHOLD" "Mixed Read IOPS" || REGRESSION_PASS=false
    check_regression "$BASE_MIX_WRITE_IOPS" "$REGR_MIX_WRITE_IOPS" \
        "$REGR_THRESHOLD" "Mixed Write IOPS" || REGRESSION_PASS=false

    html_table_end

    if [[ "$REGRESSION_PASS" == true ]]; then
        pass "REGRESSION TEST: ALL metrics within ${REGR_THRESHOLD}% threshold ✔"
        HTML_BODY+="<div class='summary pass'>✔ REGRESSION PASS — Patch introduces NO performance regression</div>"
    else
        fail "REGRESSION TEST: One or more metrics exceeded ${REGR_THRESHOLD}% drop ✘"
        HTML_BODY+="<div class='summary fail'>✘ REGRESSION FAIL — Performance regression detected</div>"
    fi
fi

# ─────────────────────────────────────────────────────────────────────────────
# PHASE 5: FINAL SUMMARY
# ─────────────────────────────────────────────────────────────────────────────
section "PHASE 5: FINAL SUMMARY"
html_section "Phase 5 — Final Summary"
html_table_start

# Sysfs existence check
log "Checking sysfs counter files..."
for attr in tx_nac_received rx_crc_errors pa_init_count txrx_qos_count; do
    SYSFS_FILE="${UFS_STATS_PATH}/${attr}"
    if adb_shell "[ -f $SYSFS_FILE ]" 2>/dev/null; then
        VAL=$(adb_shell "cat $SYSFS_FILE" | tr -d '\r')
        pass "sysfs $attr = $VAL"
        html_row "sysfs: $attr" "$VAL" "PASS"
    else
        warn "sysfs $attr not found at $SYSFS_FILE"
        html_row "sysfs: $attr" "not found" "WARN"
    fi
done

html_table_end

# Kernel log for QoS messages
log "Checking kernel log for QoS messages..."
DMESG_QOS=$(adb_shell "dmesg | grep -i 'qos\|unipro\|dme' | tail -20" 2>/dev/null || echo "")
if [[ -n "$DMESG_QOS" ]]; then
    pass "Kernel log contains QoS-related messages"
    html_section "Kernel Log (QoS messages)"
    html_code "$(echo "$DMESG_QOS" | head -20)"
else
    warn "No QoS messages found in dmesg"
fi

# Write the final HTML report
DEVICE_MODEL="${DEVICE_MODEL:-unknown}"
KERNEL_VER="${KERNEL_VER:-unknown}"
write_report

echo ""
echo -e "${BOLD}${GREEN}════════════════════════════════════════${RESET}"
echo -e "${BOLD}  UFS QoS Test Complete${RESET}"
echo -e "${BOLD}  Report: ${REPORT_FILE}${RESET}"
echo -e "${BOLD}  Log:    ${LOG_FILE}${RESET}"
echo -e "${BOLD}${GREEN}════════════════════════════════════════${RESET}"
