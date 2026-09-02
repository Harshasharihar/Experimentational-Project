import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  Collapse,
  Divider,
  Drawer,
  FormControlLabel,
  IconButton,
  Menu,
  MenuItem,
  Paper,
  Select,
  Typography,
} from "@mui/material";

import {
  Menu as MenuIcon,
  Close,
  KeyboardArrowDown,
  KeyboardArrowUp,
  Home,
  NotificationsNone,
  Person,
  Send,
  BarChart,
  TableChart,
  ShowChart,
  Notes,
  Refresh,
} from "@mui/icons-material";

/* =========================================================
   BACKEND URL
   ========================================================= */

const GLOBAL_BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL || "";


/* =========================================================
   MAIN COMPONENT
   ========================================================= */

export default function UfsPerformanceDetails() {

  /* =======================================================
     SIDEBAR
     ======================================================= */

  const [drawerOpen, setDrawerOpen] = useState(false);

  /* =======================================================
     EVALUATOR NOTES DRAWER
     ======================================================= */

  const [notesOpen, setNotesOpen] = useState(false);

  const [messages, setMessages] = useState([
    {
      sender: "assistant",
      text: "Hello! 👋 How can I help you with the performance evaluation?",
      time: "10:30 AM",
    },
  ]);

  const [messageText, setMessageText] = useState("");


  /* =======================================================
     BACKEND FILTER DATA
     ======================================================= */

  const [benchmarkData, setBenchmarkData] = useState([]);

  const [versionData, setVersionData] = useState([]);

  const [ufsVersionData, setUfsVersionData] = useState([]);

  const [capacityData, setCapacityData] = useState([]);

  const [nandCellData, setNandCellData] = useState([]);

  const [socVendorData, setSocVendorData] = useState([]);

  const [socModelData, setSocModelData] = useState([]);

  const [hciVersionData, setHciVersionData] = useState([]);


  /* =======================================================
     SELECTED FILTERS
     ======================================================= */

  const [selectedBenchmark, setSelectedBenchmark] = useState("");

  const [selectedVersions, setSelectedVersions] = useState([]);

  const [selectedUfsVersions, setSelectedUfsVersions] = useState([]);

  const [selectedCapacity, setSelectedCapacity] = useState([]);

  const [selectedNandCell, setSelectedNandCell] = useState([]);

  const [selectedSocVendor, setSelectedSocVendor] = useState([]);

  const [selectedSocModel, setSelectedSocModel] = useState([]);

  const [selectedHciVersion, setSelectedHciVersion] = useState([]);


  /* =======================================================
     TOP DROPDOWN FILTERS
     ======================================================= */

  const [writeBoosterData, setWriteBoosterData] = useState([]);

  const [fileSystemData, setFileSystemData] = useState([]);

  const [encryptionData, setEncryptionData] = useState([]);

  const [scenarioData, setScenarioData] = useState([]);

  const [selectedWriteBooster, setSelectedWriteBooster] = useState([]);

  const [selectedFileSystem, setSelectedFileSystem] = useState([]);

  const [selectedEncryption, setSelectedEncryption] = useState([]);

  const [selectedScenarios, setSelectedScenarios] = useState([]);


  /* =======================================================
     PERFORMANCE DATA
     ======================================================= */

  const [performanceData, setPerformanceData] = useState(null);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");


  /* =======================================================
     FILTER SECTION OPEN/CLOSE
     ======================================================= */

  const [openSections, setOpenSections] = useState({
    generations: true,
    capacity: true,
    nand: true,
    socVendor: true,
    socModel: true,
    hci: true,
  });


  /* =======================================================
     FETCH INITIAL DATA
     ======================================================= */

  useEffect(() => {

    const loadInitialData = async () => {

      try {

        const response = await fetch(
          `${GLOBAL_BACKEND_URL}/performance/filters`
        );

        if (!response.ok) {
          throw new Error("Unable to load filters");
        }

        const data = await response.json();

        /*
         * Map your backend response here.
         */

        setBenchmarkData(data?.benchmarks || []);

        setWriteBoosterData(data?.writeBooster || []);

        setFileSystemData(data?.fileSystem || []);

        setEncryptionData(data?.encryption || []);

        setScenarioData(data?.scenarios || []);

      } catch (err) {

        console.error(err);

        setError("Unable to load filter information.");

      }

    };

    loadInitialData();

  }, []);


  /* =======================================================
     BENCHMARK SELECTION
     ======================================================= */

  const handleBenchmarkChange = async (benchmark) => {

    setSelectedBenchmark(benchmark);

    setSelectedVersions([]);
    setSelectedUfsVersions([]);
    setSelectedCapacity([]);
    setSelectedNandCell([]);
    setSelectedSocVendor([]);
    setSelectedSocModel([]);
    setSelectedHciVersion([]);

    try {

      const response = await fetch(
        `${GLOBAL_BACKEND_URL}/performance/versions?benchmark=${encodeURIComponent(
          benchmark
        )}`
      );

      const data = await response.json();

      setVersionData(data?.versions || []);

    } catch (err) {

      console.error(err);

      setVersionData([]);

    }

  };


  /* =======================================================
     VERSION SELECTION
     ======================================================= */

  const handleVersionChange = async (value) => {

    setSelectedVersions(value);

    if (!selectedBenchmark || value.length === 0) {
      return;
    }

    try {

      const response = await fetch(
        `${GLOBAL_BACKEND_URL}/performance/ufs-versions?benchmark=${encodeURIComponent(
          selectedBenchmark
        )}&versions=${encodeURIComponent(value.join(","))}`
      );

      const data = await response.json();

      setUfsVersionData(data?.ufsVersions || []);

    } catch (err) {

      console.error(err);

      setUfsVersionData([]);

    }

  };


  /* =======================================================
     GENERIC CHECKBOX HANDLER
     ======================================================= */

  const toggleArrayValue = (
    value,
    currentValues,
    setValues
  ) => {

    if (currentValues.includes(value)) {

      setValues(
        currentValues.filter(
          (item) => item !== value
        )
      );

    } else {

      setValues([
        ...currentValues,
        value,
      ]);

    }

  };


  /* =======================================================
     FETCH PERFORMANCE
     ======================================================= */

  const fetchPerformanceData = async () => {

    if (selectedScenarios.length < 2) {
      setPerformanceData(null);
      return;
    }

    setLoading(true);
    setError("");

    try {

      const payload = {

        benchmark: selectedBenchmark,

        versions: selectedVersions,

        ufsVersions: selectedUfsVersions,

        capacity: selectedCapacity,

        nandCellType: selectedNandCell,

        socVendor: selectedSocVendor,

        socModel: selectedSocModel,

        hciVersions: selectedHciVersion,

        writeBooster: selectedWriteBooster,

        fileSystem: selectedFileSystem,

        encryption: selectedEncryption,

        scenarios: selectedScenarios,

      };


      const response = await fetch(
        `${GLOBAL_BACKEND_URL}/performance/results`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify(payload),
        }
      );


      if (!response.ok) {
        throw new Error("Unable to retrieve performance data");
      }


      const data = await response.json();


      /*
       * EXPECTED STRUCTURE:
       *
       * {
       *   table: {
       *      columns: [...],
       *      rows: [...]
       *   },
       *
       *   graph: [
       *      {
       *         name: "...",
       *         values: [...]
       *      }
       *   ]
       * }
       *
       * If your backend uses different names,
       * change only this mapping.
       */

      setPerformanceData(data);

    } catch (err) {

      console.error(err);

      setError(
        "Unable to retrieve performance information."
      );

      setPerformanceData(null);

    } finally {

      setLoading(false);

    }

  };


  /* =======================================================
     RUN WHEN SCENARIOS CHANGE
     ======================================================= */

  useEffect(() => {

    if (selectedScenarios.length >= 2) {

      fetchPerformanceData();

    } else {

      setPerformanceData(null);

    }

  }, [selectedScenarios]);


  /* =======================================================
     RESET
     ======================================================= */

  const resetFilters = () => {

    setSelectedBenchmark("");

    setSelectedVersions([]);

    setSelectedUfsVersions([]);

    setSelectedCapacity([]);

    setSelectedNandCell([]);

    setSelectedSocVendor([]);

    setSelectedSocModel([]);

    setSelectedHciVersion([]);

    setSelectedWriteBooster([]);

    setSelectedFileSystem([]);

    setSelectedEncryption([]);

    setSelectedScenarios([]);

    setPerformanceData(null);

  };


  /* =======================================================
     EVALUATOR NOTES
     ======================================================= */

  const handleSendMessage = () => {

    if (!messageText.trim()) {
      return;
    }

    const now = new Date();

    const time = now.toLocaleTimeString(
      [],
      {
        hour: "2-digit",
        minute: "2-digit",
      }
    );

    setMessages((previous) => [
      ...previous,

      {
        sender: "user",
        text: messageText,
        time,
      },

      {
        sender: "assistant",
        text: "Your evaluator note has been received.",
        time,
      },
    ]);

    setMessageText("");

  };


  /* =======================================================
     TABLE DATA
     ======================================================= */

  const tableColumns =
    performanceData?.table?.columns || [];

  const tableRows =
    performanceData?.table?.rows || [];


  /* =======================================================
     GRAPH DATA
     ======================================================= */

  const graphData =
    performanceData?.graph || [];


  /* =======================================================
     PAGE
     ======================================================= */

  return (

    <Box
      sx={{
        minHeight: "100vh",
        background: "#f4f7fc",
        fontFamily: "Manrope, sans-serif",
        overflowX: "hidden",
      }}
    >

      {/* ===================================================
          HEADER
      =================================================== */}

      <Box
        sx={{
          height: {
            xs: 64,
            md: 76,
          },

          background:
            "linear-gradient(135deg,#061a3a,#063b8f)",

          color: "white",

          display: "flex",

          alignItems: "center",

          px: {
            xs: 1.5,
            md: 3,
          },

          position: "sticky",

          top: 0,

          zIndex: 1200,

          boxShadow:
            "0 4px 15px rgba(0,0,0,0.18)",
        }}
      >

        <IconButton
          onClick={() =>
            setDrawerOpen(!drawerOpen)
          }
          sx={{
            color: "white",
            mr: 1,
          }}
        >
          <MenuIcon />
        </IconButton>


        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.2,
            flex: 1,
          }}
        >

          <Box
            sx={{
              fontSize: {
                xs: 28,
                md: 38,
              },

              fontWeight: 700,
            }}
          >
            ◉
          </Box>

          <Typography
            sx={{
              fontWeight: 700,

              fontSize: {
                xs: "16px",
                sm: "21px",
                md: "30px",
              },

              letterSpacing: {
                xs: 0,
                md: "0.5px",
              },

              whiteSpace: "nowrap",
            }}
          >
            UFS PERFORMANCE DASHBOARD
          </Typography>

        </Box>


        <IconButton
          sx={{
            color: "white",
          }}
        >
          <NotificationsNone />
        </IconButton>


        <Box
          sx={{
            display: {
              xs: "none",
              sm: "flex",
            },

            alignItems: "center",

            ml: 1,

            gap: 1,
          }}
        >

          <Box
            sx={{
              width: 38,
              height: 38,
              borderRadius: "50%",
              background: "#1976d2",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            A
          </Box>

          <Typography>
            Admin User
          </Typography>

        </Box>

      </Box>


      {/* ===================================================
          MAIN AREA
      =================================================== */}

      <Box
        sx={{
          display: "flex",
          minHeight: "calc(100vh - 76px)",
        }}
      >


        {/* =================================================
            LEFT FILTER PANEL
        ================================================= */}

        <Box
          sx={{
            width: {
              xs: drawerOpen ? 270 : 0,
              md: 245,
            },

            flexShrink: 0,

            overflow: "hidden",

            transition:
              "width 0.3s ease",

            background:
              "linear-gradient(180deg,#071b3c,#092b5b)",

            color: "white",

            position: {
              xs: "fixed",
              md: "sticky",
            },

            top: {
              xs: 64,
              md: 76,
            },

            height: {
              xs: "calc(100vh - 64px)",
              md: "calc(100vh - 76px)",
            },

            zIndex: 1100,
          }}
        >

          <Box
            sx={{
              p: 2,
              overflowY: "auto",
              height: "100%",
            }}
          >

            <Typography
              sx={{
                fontSize: 14,
                fontWeight: 700,
                mb: 2,
                letterSpacing: 1,
              }}
            >
              PERFORMANCE FILTERS
            </Typography>


            {/* ================= GENERATIONS ================= */}

            <FilterSection
              title="GENERATIONS"
              open={
                openSections.generations
              }
              onClick={() =>
                setOpenSections({
                  ...openSections,
                  generations:
                    !openSections.generations,
                })
              }
            >

              {versionData.map(
                (item) => (

                  <CheckboxItem
                    key={item}
                    label={item}
                    checked={
                      selectedVersions.includes(item)
                    }
                    onChange={() =>
                      handleVersionChange(
                        selectedVersions.includes(item)
                          ? selectedVersions.filter(
                              (x) => x !== item
                            )
                          : [
                              ...selectedVersions,
                              item,
                            ]
                      )
                    }
                  />

                )
              )}

            </FilterSection>


            {/* ================= CAPACITY ================= */}

            <FilterSection
              title="CAPACITY"
              open={openSections.capacity}
              onClick={() =>
                setOpenSections({
                  ...openSections,
                  capacity:
                    !openSections.capacity,
                })
              }
            >

              {capacityData.map(
                (item) => (

                  <CheckboxItem
                    key={item}
                    label={item}
                    checked={
                      selectedCapacity.includes(item)
                    }
                    onChange={() =>
                      toggleArrayValue(
                        item,
                        selectedCapacity,
                        setSelectedCapacity
                      )
                    }
                  />

                )
              )}

            </FilterSection>


            {/* ================= NAND ================= */}

            <FilterSection
              title="NAND CELL TYPE"
              open={openSections.nand}
              onClick={() =>
                setOpenSections({
                  ...openSections,
                  nand:
                    !openSections.nand,
                })
              }
            >

              {nandCellData.map(
                (item) => (

                  <CheckboxItem
                    key={item}
                    label={item}
                    checked={
                      selectedNandCell.includes(item)
                    }
                    onChange={() =>
                      toggleArrayValue(
                        item,
                        selectedNandCell,
                        setSelectedNandCell
                      )
                    }
                  />

                )
              )}

            </FilterSection>


            {/* ================= SOC VENDOR ================= */}

            <FilterSection
              title="SOC VENDOR"
              open={openSections.socVendor}
              onClick={() =>
                setOpenSections({
                  ...openSections,
                  socVendor:
                    !openSections.socVendor,
                })
              }
            >

              {socVendorData.map(
                (item) => (

                  <CheckboxItem
                    key={item}
                    label={item}
                    checked={
                      selectedSocVendor.includes(item)
                    }
                    onChange={() =>
                      toggleArrayValue(
                        item,
                        selectedSocVendor,
                        setSelectedSocVendor
                      )
                    }
                  />

                )
              )}

            </FilterSection>


            {/* ================= SOC MODEL ================= */}

            <FilterSection
              title="SOC MODEL"
              open={openSections.socModel}
              onClick={() =>
                setOpenSections({
                  ...openSections,
                  socModel:
                    !openSections.socModel,
                })
              }
            >

          
