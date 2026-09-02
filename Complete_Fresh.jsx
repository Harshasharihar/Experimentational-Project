import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Drawer,
  FormControlLabel,
  IconButton,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography,
} from "@mui/material";

import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import HomeIcon from "@mui/icons-material/Home";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import TableChartIcon from "@mui/icons-material/TableChart";
import ShowChartIcon from "@mui/icons-material/ShowChart";
import NotesIcon from "@mui/icons-material/Notes";
import RefreshIcon from "@mui/icons-material/Refresh";
import SendIcon from "@mui/icons-material/Send";
import StorageIcon from "@mui/icons-material/Storage";
import MemoryIcon from "@mui/icons-material/Memory";
import SettingsInputComponentIcon from "@mui/icons-material/SettingsInputComponent";
import SpeedIcon from "@mui/icons-material/Speed";
import SecurityIcon from "@mui/icons-material/Security";
import DeveloperBoardIcon from "@mui/icons-material/DeveloperBoard";

import "@fontsource/manrope/400.css";
import "@fontsource/manrope/500.css";
import "@fontsource/manrope/600.css";
import "@fontsource/manrope/700.css";

const GLOBAL_BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "";

/*
  UFS PERFORMANCE DETAILS
  ------------------------------------------------------------
  Single-file implementation.
  All 13 backend requests are handled in this file.

  1.  GET  /api/benchmarks
  2.  GET  /api/benchmarks/{benchmark_name}/versions
  3.  POST /api/benchmarks/{benchmark_name}/filters/ufs
  4.  POST /api/benchmarks/{benchmark_name}/filters/capacity
  5.  POST /api/benchmarks/{benchmark_name}/filters/cell-type
  6.  POST /api/benchmarks/{benchmark_name}/filters/soc-vendors
  7.  POST /api/benchmarks/{benchmark_name}/filters/soc-model
  8.  POST /api/benchmarks/{benchmark_name}/filters/hci-versions
  9.  POST /api/benchmarks/{benchmark_name}/filters/wb-size
  10. POST /api/benchmarks/{benchmark_name}/filters/fs
  11. POST /api/benchmarks/{benchmark_name}/filters/encryption
  12. POST /api/benchmarks/{benchmark_name}/filters/scenario
  13. POST /api/benchmarks/{benchmark_name}/sc-results

  Filter requests are cumulative, following the payload structure shown
  in the backend API documentation. Query 13 returns:
    { results: [{ Scenario, access_patterns: { ... } }] }

  No separate MultiSelectDropDown component is used.
*/

export default function UfsPerformanceDetails({
  benchmark: initialBenchmark = "",
  onHome,
}) {
  // ----------------------------------------------------------
  // COMMON THEME - kept consistent with the supplied dashboard
  // ----------------------------------------------------------
  const theme = {
    navy: "#071B3C",
    navy2: "#0B2B58",
    blue: "#087FF5",
    blue2: "#176BDC",
    lightBlue: "#EAF4FF",
    page: "#F7F9FC",
    text: "#26364A",
    muted: "#6B778C",
    border: "#DCE5F2",
    white: "#FFFFFF",
    green: "#79B96A",
    greenLight: "#E8F4E4",
  };

  // ----------------------------------------------------------
  // FILTER STATE
  // ----------------------------------------------------------
  const [benchmark, setBenchmark] = useState(initialBenchmark);
  const [benchmarkOptions, setBenchmarkOptions] = useState([]);

  const [versionOptions, setVersionOptions] = useState([]);
  const [selectedVersions, setSelectedVersions] = useState([]);

  const [ufsVersionOptions, setUfsVersionOptions] = useState([]);
  const [selectedUfsVersions, setSelectedUfsVersions] = useState([]);

  const [capacityOptions, setCapacityOptions] = useState([]);
  const [selectedCapacity, setSelectedCapacity] = useState([]);

  const [nandOptions, setNandOptions] = useState([]);
  const [selectedNand, setSelectedNand] = useState([]);

  const [socVendorOptions, setSocVendorOptions] = useState([]);
  const [selectedSocVendor, setSelectedSocVendor] = useState([]);

  const [socModelOptions, setSocModelOptions] = useState([]);
  const [selectedSocModel, setSelectedSocModel] = useState([]);

  const [hciVersionOptions, setHciVersionOptions] = useState([]);
  const [selectedHciVersions, setSelectedHciVersions] = useState([]);

  const [writeBoosterOptions, setWriteBoosterOptions] = useState([]);
  const [selectedWriteBooster, setSelectedWriteBooster] = useState([]);

  const [fileSystemOptions, setFileSystemOptions] = useState([]);
  const [selectedFileSystem, setSelectedFileSystem] = useState([]);

  const [encryptionOptions, setEncryptionOptions] = useState([]);
  const [selectedEncryption, setSelectedEncryption] = useState([]);

  const [scenarioOptions, setScenarioOptions] = useState([]);
  const [selectedScenarios, setSelectedScenarios] = useState([]);

  // ----------------------------------------------------------
  // DATA STATE
  // ----------------------------------------------------------
  const [tableData, setTableData] = useState(null);
  const [graphData, setGraphData] = useState([]);

  const [loadingFilters, setLoadingFilters] = useState(false);
  const [loadingVersions, setLoadingVersions] = useState(false);
  const [loadingUfsVersions, setLoadingUfsVersions] = useState(false);
  const [loadingResults, setLoadingResults] = useState(false);
  const [error, setError] = useState("");

  // ----------------------------------------------------------
  // UI STATE
  // ----------------------------------------------------------
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [notes, setNotes] = useState([
    {
      user: "Evaluator",
      time: "Today",
      text: "Performance comparison is ready for evaluation.",
    },
  ]);
  const [newNote, setNewNote] = useState("");
  const [expandedSections, setExpandedSections] = useState({
    benchmark: true,
    device: true,
    storage: true,
    software: true,
    scenarios: true,
  });

  // ----------------------------------------------------------
  // API HELPERS
  // ----------------------------------------------------------
  const apiUrl = (path) =>
    `${GLOBAL_BACKEND_URL}${path.startsWith("/") ? path : `/${path}`}`;

  const getJson = async (url, options = {}) => {
    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`Request failed (${response.status})`);
    }

    return response.json();
  };

  // ----------------------------------------------------------
  // 1. GET BENCHMARKS
  // ----------------------------------------------------------
  useEffect(() => {
    let active = true;

    const loadBenchmarks = async () => {
      setLoadingFilters(true);
      setError("");

      try {
        const data = await getJson(apiUrl("/api/benchmarks"));

        if (!active) return;

        const benchmarks = Array.isArray(data)
          ? data
          : data?.benchmarks || data?.data || [];

        setBenchmarkOptions(benchmarks);

        // Keep benchmark passed from the previous page if available.
        if (!benchmark && benchmarks.length === 1) {
          setBenchmark(valueOf(benchmarks[0]));
        }
      } catch (err) {
        if (active) {
          console.error("Error loading benchmarks:", err);
          setError("Unable to load benchmarks.");
          setBenchmarkOptions([]);
        }
      } finally {
        if (active) setLoadingFilters(false);
      }
    };

    loadBenchmarks();

    return () => {
      active = false;
    };
  }, []);

  // ----------------------------------------------------------
  // 2. GET BENCHMARK VERSIONS WHEN BENCHMARK CHANGES
  // ----------------------------------------------------------
  useEffect(() => {
    let active = true;

    const loadVersions = async () => {
      setVersionOptions([]);
      setSelectedVersions([]);
      setUfsVersionOptions([]);
      setSelectedUfsVersions([]);
      setCapacityOptions([]);
      setSelectedCapacity([]);
      setNandOptions([]);
      setSelectedNand([]);
      setSocVendorOptions([]);
      setSelectedSocVendor([]);
      setSocModelOptions([]);
      setSelectedSocModel([]);
      setHciVersionOptions([]);
      setSelectedHciVersions([]);
      setWriteBoosterOptions([]);
      setSelectedWriteBooster([]);
      setFileSystemOptions([]);
      setSelectedFileSystem([]);
      setEncryptionOptions([]);
      setSelectedEncryption([]);
      setScenarioOptions([]);
      setSelectedScenarios([]);
      clearResults();

      if (!benchmark) return;

      setLoadingVersions(true);
      setError("");

      try {
        const data = await getJson(
          apiUrl(
            `/api/benchmarks/${encodeURIComponent(benchmark)}/versions`
          )
        );

        if (!active) return;

        const versions = Array.isArray(data)
          ? data
          : data?.versions || data?.data || [];

        setVersionOptions(versions);
      } catch (err) {
        if (active) {
          console.error("Error loading benchmark versions:", err);
          setVersionOptions([]);
          setError("Unable to load benchmark versions.");
        }
      } finally {
        if (active) setLoadingVersions(false);
      }
    };

    loadVersions();

    return () => {
      active = false;
    };
  }, [benchmark]);

  // ----------------------------------------------------------
  // 3. GET UFS VERSIONS AFTER BENCHMARK VERSIONS
  // POST /api/benchmarks/{benchmark_name}/filters/ufs
  // Request: { versions: [...] }
  // ----------------------------------------------------------
  useEffect(() => {
    let active = true;

    const loadUfsVersions = async () => {
      setUfsVersionOptions([]);
      setSelectedUfsVersions([]);
      setCapacityOptions([]);
      setSelectedCapacity([]);
      setNandOptions([]);
      setSelectedNand([]);
      setSocVendorOptions([]);
      setSelectedSocVendor([]);
      setSocModelOptions([]);
      setSelectedSocModel([]);
      setHciVersionOptions([]);
      setSelectedHciVersions([]);
      setWriteBoosterOptions([]);
      setSelectedWriteBooster([]);
      setFileSystemOptions([]);
      setSelectedFileSystem([]);
      setEncryptionOptions([]);
      setSelectedEncryption([]);
      setScenarioOptions([]);
      setSelectedScenarios([]);
      clearResults();

      if (!benchmark || selectedVersions.length === 0) return;

      setLoadingUfsVersions(true);

      try {
        const payload = {
          versions: selectedVersions.map(valueOf),
        };

        const data = await getJson(
          apiUrl(
            `/api/benchmarks/${encodeURIComponent(
              benchmark
            )}/filters/ufs`
          ),
          {
            method: "POST",
            body: JSON.stringify(payload),
          }
        );

        if (!active) return;

        setUfsVersionOptions(
          data?.ufs_versions || data?.ufsVersions || data?.data || []
        );
      } catch (err) {
        if (active) {
          console.error("Error loading UFS versions:", err);
          setUfsVersionOptions([]);
          setError("Unable to load UFS versions.");
        }
      } finally {
        if (active) setLoadingUfsVersions(false);
      }
    };

    loadUfsVersions();

    return () => {
      active = false;
    };
  }, [benchmark, selectedVersions]);

  // ----------------------------------------------------------
  // 4. GET CAPACITY AFTER UFS VERSION
  // POST /api/benchmarks/{benchmark_name}/filters/capacity
  // Request: versions + ufs_version
  // ----------------------------------------------------------
  useEffect(() => {
    let active = true;

    const loadCapacity = async () => {
      setCapacityOptions([]);
      setSelectedCapacity([]);
      setNandOptions([]);
      setSelectedNand([]);
      setSocVendorOptions([]);
      setSelectedSocVendor([]);
      setSocModelOptions([]);
      setSelectedSocModel([]);
      setHciVersionOptions([]);
      setSelectedHciVersions([]);
      setWriteBoosterOptions([]);
      setSelectedWriteBooster([]);
      setFileSystemOptions([]);
      setSelectedFileSystem([]);
      setEncryptionOptions([]);
      setSelectedEncryption([]);
      setScenarioOptions([]);
      setSelectedScenarios([]);
      clearResults();

      if (!benchmark || selectedVersions.length === 0 || selectedUfsVersions.length === 0) {
        return;
      }

      try {
        const payload = {
          versions: selectedVersions.map(valueOf),
          ufs_version: selectedUfsVersions.map(valueOf),
        };

        const data = await getJson(
          apiUrl(
            `/api/benchmarks/${encodeURIComponent(
              benchmark
            )}/filters/capacity`
          ),
          {
            method: "POST",
            body: JSON.stringify(payload),
          }
        );

        if (!active) return;

        setCapacityOptions(
          data?.capacities || data?.capacity || data?.data || []
        );
      } catch (err) {
        if (active) {
          console.error("Error loading capacity:", err);
          setCapacityOptions([]);
          setError("Unable to load capacity options.");
        }
      }
    };

    loadCapacity();

    return () => {
      active = false;
    };
  }, [benchmark, selectedVersions, selectedUfsVersions]);

  // ----------------------------------------------------------
  // 5. GET CELL TYPE AFTER CAPACITY
  // POST /api/benchmarks/{benchmark_name}/filters/cell-type
  // Request: versions + ufs_version + capacities
  // ----------------------------------------------------------
  useEffect(() => {
    let active = true;

    const loadCellType = async () => {
      setNandOptions([]);
      setSelectedNand([]);
      setSocVendorOptions([]);
      setSelectedSocVendor([]);
      setSocModelOptions([]);
      setSelectedSocModel([]);
      setHciVersionOptions([]);
      setSelectedHciVersions([]);
      setWriteBoosterOptions([]);
      setSelectedWriteBooster([]);
      setFileSystemOptions([]);
      setSelectedFileSystem([]);
      setEncryptionOptions([]);
      setSelectedEncryption([]);
      setScenarioOptions([]);
      setSelectedScenarios([]);
      clearResults();

      if (
        !benchmark ||
        selectedVersions.length === 0 ||
        selectedUfsVersions.length === 0 ||
        selectedCapacity.length === 0
      ) {
        return;
      }

      try {
        const payload = {
          versions: selectedVersions.map(valueOf),
          ufs_version: selectedUfsVersions.map(valueOf),
          capacities: selectedCapacity.map(valueOf),
        };

        const data = await getJson(
          apiUrl(
            `/api/benchmarks/${encodeURIComponent(
              benchmark
            )}/filters/cell-type`
          ),
          {
            method: "POST",
            body: JSON.stringify(payload),
          }
        );

        if (!active) return;

        setNandOptions(
          data?.cell_type || data?.cellTypes || data?.cell_types || data?.data || []
        );
      } catch (err) {
        if (active) {
          console.error("Error loading cell type:", err);
          setNandOptions([]);
          setError("Unable to load cell type options.");
        }
      }
    };

    loadCellType();

    return () => {
      active = false;
    };
  }, [benchmark, selectedVersions, selectedUfsVersions, selectedCapacity]);

  // ----------------------------------------------------------
  // 6. GET SOC VENDORS AFTER CELL TYPE
  // POST /api/benchmarks/{benchmark_name}/filters/soc-vendors
  // Request: versions + ufs_version + capacities + cell_type
  // ----------------------------------------------------------
  useEffect(() => {
    let active = true;

    const loadSocVendors = async () => {
      setSocVendorOptions([]);
      setSelectedSocVendor([]);
      setSocModelOptions([]);
      setSelectedSocModel([]);
      setHciVersionOptions([]);
      setSelectedHciVersions([]);
      setWriteBoosterOptions([]);
      setSelectedWriteBooster([]);
      setFileSystemOptions([]);
      setSelectedFileSystem([]);
      setEncryptionOptions([]);
      setSelectedEncryption([]);
      setScenarioOptions([]);
      setSelectedScenarios([]);
      clearResults();

      if (
        !benchmark ||
        selectedVersions.length === 0 ||
        selectedUfsVersions.length === 0 ||
        selectedCapacity.length === 0 ||
        selectedNand.length === 0
      ) {
        return;
      }

      try {
        const payload = {
          versions: selectedVersions.map(valueOf),
          ufs_version: selectedUfsVersions.map(valueOf),
          capacities: selectedCapacity.map(valueOf),
          cell_type: selectedNand.map(valueOf),
        };

        const data = await getJson(
          apiUrl(
            `/api/benchmarks/${encodeURIComponent(
              benchmark
            )}/filters/soc-vendors`
          ),
          {
            method: "POST",
            body: JSON.stringify(payload),
          }
        );

        if (!active) return;

        setSocVendorOptions(
          data?.soc_vendors || data?.socVendors || data?.vendors || data?.data || []
        );
      } catch (err) {
        if (active) {
          console.error("Error loading SoC vendors:", err);
          setSocVendorOptions([]);
          setError("Unable to load SoC vendor options.");
        }
      }
    };

    loadSocVendors();

    return () => {
      active = false;
    };
  }, [benchmark, selectedVersions, selectedUfsVersions, selectedCapacity, selectedNand]);

  // ----------------------------------------------------------
  // 7. GET SOC MODELS AFTER SOC VENDOR
  // POST /api/benchmarks/{benchmark_name}/filters/soc-model
  // Request: previous filters + soc_vendors
  // ----------------------------------------------------------
  useEffect(() => {
    let active = true;

    const loadSocModels = async () => {
      setSocModelOptions([]);
      setSelectedSocModel([]);
      setHciVersionOptions([]);
      setSelectedHciVersions([]);
      setWriteBoosterOptions([]);
      setSelectedWriteBooster([]);
      setFileSystemOptions([]);
      setSelectedFileSystem([]);
      setEncryptionOptions([]);
      setSelectedEncryption([]);
      setScenarioOptions([]);
      setSelectedScenarios([]);
      clearResults();

      if (
        !benchmark ||
        selectedVersions.length === 0 ||
        selectedUfsVersions.length === 0 ||
        selectedCapacity.length === 0 ||
        selectedNand.length === 0 ||
        selectedSocVendor.length === 0
      ) {
        return;
      }

      try {
        const payload = {
          versions: selectedVersions.map(valueOf),
          ufs_version: selectedUfsVersions.map(valueOf),
          capacities: selectedCapacity.map(valueOf),
          cell_type: selectedNand.map(valueOf),
          soc_vendors: selectedSocVendor.map(valueOf),
        };

        const data = await getJson(
          apiUrl(
            `/api/benchmarks/${encodeURIComponent(
              benchmark
            )}/filters/soc-model`
          ),
          {
            method: "POST",
            body: JSON.stringify(payload),
          }
        );

        if (!active) return;

        setSocModelOptions(
          data?.soc_models || data?.socModels || data?.models || data?.data || []
        );
      } catch (err) {
        if (active) {
          console.error("Error loading SoC models:", err);
          setSocModelOptions([]);
          setError("Unable to load SoC model options.");
        }
      }
    };

    loadSocModels();

    return () => {
      active = false;
    };
  }, [benchmark, selectedVersions, selectedUfsVersions, selectedCapacity, selectedNand, selectedSocVendor]);

  // ----------------------------------------------------------
  // 8. GET HCI VERSIONS AFTER SOC MODEL
  // POST /api/benchmarks/{benchmark_name}/filters/hci-versions
  // ----------------------------------------------------------
  useEffect(() => {
    let active = true;

    const loadHciVersions = async () => {
      setHciVersionOptions([]);
      setSelectedHciVersions([]);
      setWriteBoosterOptions([]);
      setSelectedWriteBooster([]);
      setFileSystemOptions([]);
      setSelectedFileSystem([]);
      setEncryptionOptions([]);
      setSelectedEncryption([]);
      setScenarioOptions([]);
      setSelectedScenarios([]);
      clearResults();

      if (
        !benchmark ||
        selectedVersions.length === 0 ||
        selectedUfsVersions.length === 0 ||
        selectedCapacity.length === 0 ||
        selectedNand.length === 0 ||
        selectedSocVendor.length === 0 ||
        selectedSocModel.length === 0
      ) {
        return;
      }

      try {
        const payload = {
          versions: selectedVersions.map(valueOf),
          ufs_version: selectedUfsVersions.map(valueOf),
          capacities: selectedCapacity.map(valueOf),
          cell_type: selectedNand.map(valueOf),
          soc_vendors: selectedSocVendor.map(valueOf),
          soc_models: selectedSocModel.map(valueOf),
        };

        const data = await getJson(
          apiUrl(
            `/api/benchmarks/${encodeURIComponent(
              benchmark
            )}/filters/hci-versions`
          ),
          {
            method: "POST",
            body: JSON.stringify(payload),
          }
        );

        if (!active) return;

        setHciVersionOptions(
          data?.HCI_Versions || data?.hci_versions || data?.hciVersions || data?.data || []
        );
      } catch (err) {
        if (active) {
          console.error("Error loading HCI versions:", err);
          setHciVersionOptions([]);
          setError("Unable to load HCI version options.");
        }
      }
    };

    loadHciVersions();

    return () => {
      active = false;
    };
  }, [benchmark, selectedVersions, selectedUfsVersions, selectedCapacity, selectedNand, selectedSocVendor, selectedSocModel]);

  // ----------------------------------------------------------
  // 9. GET WRITEBOOSTER AFTER HCI VERSION
  // POST /api/benchmarks/{benchmark_name}/filters/wb-size
  // ----------------------------------------------------------
  useEffect(() => {
    let active = true;

    const loadWriteBooster = async () => {
      setWriteBoosterOptions([]);
      setSelectedWriteBooster([]);
      setFileSystemOptions([]);
      setSelectedFileSystem([]);
      setEncryptionOptions([]);
      setSelectedEncryption([]);
      setScenarioOptions([]);
      setSelectedScenarios([]);
      clearResults();

      if (
        !benchmark ||
        selectedVersions.length === 0 ||
        selectedUfsVersions.length === 0 ||
        selectedCapacity.length === 0 ||
        selectedNand.length === 0 ||
        selectedSocVendor.length === 0 ||
        selectedSocModel.length === 0 ||
        selectedHciVersions.length === 0
      ) {
        return;
      }

      try {
        const payload = {
          versions: selectedVersions.map(valueOf),
          ufs_version: selectedUfsVersions.map(valueOf),
          capacities: selectedCapacity.map(valueOf),
          cell_type: selectedNand.map(valueOf),
          soc_vendors: selectedSocVendor.map(valueOf),
          soc_models: selectedSocModel.map(valueOf),
          hci_versions: selectedHciVersions.map(valueOf),
        };

        const data = await getJson(
          apiUrl(
            `/api/benchmarks/${encodeURIComponent(
              benchmark
            )}/filters/wb-size`
          ),
          {
            method: "POST",
            body: JSON.stringify(payload),
          }
        );

        if (!active) return;

        setWriteBoosterOptions(
          data?.Writebooster_Size || data?.writebooster_size || data?.writeboosters || data?.data || []
        );
      } catch (err) {
        if (active) {
          console.error("Error loading WriteBooster:", err);
          setWriteBoosterOptions([]);
          setError("Unable to load WriteBooster options.");
        }
      }
    };

    loadWriteBooster();

    return () => {
      active = false;
    };
  }, [benchmark, selectedVersions, selectedUfsVersions, selectedCapacity, selectedNand, selectedSocVendor, selectedSocModel, selectedHciVersions]);

  // ----------------------------------------------------------
  // 10. GET FILE SYSTEM AFTER WRITEBOOSTER
  // POST /api/benchmarks/{benchmark_name}/filters/fs
  // ----------------------------------------------------------
  useEffect(() => {
    let active = true;

    const loadFileSystem = async () => {
      setFileSystemOptions([]);
      setSelectedFileSystem([]);
      setEncryptionOptions([]);
      setSelectedEncryption([]);
      setScenarioOptions([]);
      setSelectedScenarios([]);
      clearResults();

      if (
        !benchmark ||
        selectedVersions.length === 0 ||
        selectedUfsVersions.length === 0 ||
        selectedCapacity.length === 0 ||
        selectedNand.length === 0 ||
        selectedSocVendor.length === 0 ||
        selectedSocModel.length === 0 ||
        selectedHciVersions.length === 0 ||
        selectedWriteBooster.length === 0
      ) {
        return;
      }

      try {
        const payload = {
          versions: selectedVersions.map(valueOf),
          ufs_version: selectedUfsVersions.map(valueOf),
          capacities: selectedCapacity.map(valueOf),
          cell_type: selectedNand.map(valueOf),
          soc_vendors: selectedSocVendor.map(valueOf),
          soc_models: selectedSocModel.map(valueOf),
          hci_versions: selectedHciVersions.map(valueOf),
          writeboosters: selectedWriteBooster.map(valueOf),
        };

        const data = await getJson(
          apiUrl(
            `/api/benchmarks/${encodeURIComponent(
              benchmark
            )}/filters/fs`
          ),
          {
            method: "POST",
            body: JSON.stringify(payload),
          }
        );

        if (!active) return;

        setFileSystemOptions(
          data?.FileSystem || data?.fileSystems || data?.filesystems || data?.fs || data?.data || []
        );
      } catch (err) {
        if (active) {
          console.error("Error loading file systems:", err);
          setFileSystemOptions([]);
          setError("Unable to load file system options.");
        }
      }
    };

    loadFileSystem();

    return () => {
      active = false;
    };
  }, [benchmark, selectedVersions, selectedUfsVersions, selectedCapacity, selectedNand, selectedSocVendor, selectedSocModel, selectedHciVersions, selectedWriteBooster]);

  // ----------------------------------------------------------
  // 11. GET ENCRYPTION AFTER FILE SYSTEM
  // POST /api/benchmarks/{benchmark_name}/filters/encryption
  // ----------------------------------------------------------
  useEffect(() => {
    let active = true;

    const loadEncryption = async () => {
      setEncryptionOptions([]);
      setSelectedEncryption([]);
      setScenarioOptions([]);
      setSelectedScenarios([]);
      clearResults();

      if (
        !benchmark ||
        selectedVersions.length === 0 ||
        selectedUfsVersions.length === 0 ||
        selectedCapacity.length === 0 ||
        selectedNand.length === 0 ||
        selectedSocVendor.length === 0 ||
        selectedSocModel.length === 0 ||
        selectedHciVersions.length === 0 ||
        selectedWriteBooster.length === 0 ||
        selectedFileSystem.length === 0
      ) {
        return;
      }

      try {
        const payload = {
          versions: selectedVersions.map(valueOf),
          ufs_version: selectedUfsVersions.map(valueOf),
          capacities: selectedCapacity.map(valueOf),
          cell_type: selectedNand.map(valueOf),
          soc_vendors: selectedSocVendor.map(valueOf),
          soc_models: selectedSocModel.map(valueOf),
          hci_versions: selectedHciVersions.map(valueOf),
          writeboosters: selectedWriteBooster.map(valueOf),
          filesystems: selectedFileSystem.map(valueOf),
        };

        const data = await getJson(
          apiUrl(
            `/api/benchmarks/${encodeURIComponent(
              benchmark
            )}/filters/encryption`
          ),
          {
            method: "POST",
            body: JSON.stringify(payload),
          }
        );

        if (!active) return;

        setEncryptionOptions(
          data?.Encryptions || data?.encryptions || data?.encryption || data?.data || []
        );
      } catch (err) {
        if (active) {
          console.error("Error loading encryption:", err);
          setEncryptionOptions([]);
          setError("Unable to load encryption options.");
        }
      }
    };

    loadEncryption();

    return () => {
      active = false;
    };
  }, [benchmark, selectedVersions, selectedUfsVersions, selectedCapacity, selectedNand, selectedSocVendor, selectedSocModel, selectedHciVersions, selectedWriteBooster, selectedFileSystem]);

  // ----------------------------------------------------------
  // 12. GET SCENARIOS AFTER ENCRYPTION
  // POST /api/benchmarks/{benchmark_name}/filters/scenario
  // ----------------------------------------------------------
  useEffect(() => {
    let active = true;

    const loadScenarios = async () => {
      setScenarioOptions([]);
      setSelectedScenarios([]);
      clearResults();

      if (
        !benchmark ||
        selectedVersions.length === 0 ||
        selectedUfsVersions.length === 0 ||
        selectedCapacity.length === 0 ||
        selectedNand.length === 0 ||
        selectedSocVendor.length === 0 ||
        selectedSocModel.length === 0 ||
        selectedHciVersions.length === 0 ||
        selectedWriteBooster.length === 0 ||
        selectedFileSystem.length === 0 ||
        selectedEncryption.length === 0
      ) {
        return;
      }

      try {
        const payload = {
          versions: selectedVersions.map(valueOf),
          ufs_version: selectedUfsVersions.map(valueOf),
          capacities: selectedCapacity.map(valueOf),
          cell_type: selectedNand.map(valueOf),
          soc_vendors: selectedSocVendor.map(valueOf),
          soc_models: selectedSocModel.map(valueOf),
          hci_versions: selectedHciVersions.map(valueOf),
          writeboosters: selectedWriteBooster.map(valueOf),
          filesystems: selectedFileSystem.map(valueOf),
          encryptions: selectedEncryption.map(valueOf),
        };

        const data = await getJson(
          apiUrl(
            `/api/benchmarks/${encodeURIComponent(
              benchmark
            )}/filters/scenario`
          ),
          {
            method: "POST",
            body: JSON.stringify(payload),
          }
        );

        if (!active) return;

        setScenarioOptions(
          data?.Scenarios || data?.scenarios || data?.available_scenarios || data?.data || []
        );
      } catch (err) {
        if (active) {
          console.error("Error loading scenarios:", err);
          setScenarioOptions([]);
          setError("Unable to load scenario options.");
        }
      }
    };

    loadScenarios();

    return () => {
      active = false;
    };
  }, [benchmark, selectedVersions, selectedUfsVersions, selectedCapacity, selectedNand, selectedSocVendor, selectedSocModel, selectedHciVersions, selectedWriteBooster, selectedFileSystem, selectedEncryption]);

  // ----------------------------------------------------------
  // 13. GET SCENARIO RESULTS AFTER 2+ SCENARIOS
  // POST /api/benchmarks/{benchmark_name}/sc-results
  // Response: { results: [{ Scenario, access_patterns: {...} }] }
  // ----------------------------------------------------------
  useEffect(() => {
    let active = true;

    const loadScenarioResults = async () => {
      if (!benchmark || selectedScenarios.length < 2) {
        clearResults();
        return;
      }

      setLoadingResults(true);
      setError("");

      try {
        const payload = {
          versions: selectedVersions.map(valueOf),
          ufs_version: selectedUfsVersions.map(valueOf),
          capacities: selectedCapacity.map(valueOf),
          cell_type: selectedNand.map(valueOf),
          soc_vendors: selectedSocVendor.map(valueOf),
          soc_models: selectedSocModel.map(valueOf),
          hci_versions: selectedHciVersions.map(valueOf),
          writeboosters: selectedWriteBooster.map(valueOf),
          fileSystems: selectedFileSystem.map(valueOf),
          encryptions: selectedEncryption.map(valueOf),
          scenarios: selectedScenarios.map(valueOf),
        };

        const data = await getJson(
          apiUrl(
            `/api/benchmarks/${encodeURIComponent(
              benchmark
            )}/sc-results`
          ),
          {
            method: "POST",
            body: JSON.stringify(payload),
          }
        );

        if (!active) return;

        const results = Array.isArray(data?.results)
          ? data.results
          : [];

        // Convert backend response into the table structure already used
        // by the UI. Nothing is hardcoded here.
        const firstAccessPatterns =
          results[0]?.access_patterns || {};

        const accessPatternColumns = Object.keys(firstAccessPatterns);

        const rows = accessPatternColumns.map((pattern) => {
          const row = {
            "Access Pattern": pattern,
          };

          results.forEach((result, index) => {
            row[`Scenario ${index + 1}`] =
              result?.access_patterns?.[pattern] ?? "-";
          });

          return row;
        });

        const columns = [
          "Access Pattern",
          ...results.map((_, index) => `Scenario ${index + 1}`),
        ];

        setTableData({ columns, rows });

        // Keep graph data tied to the backend result order.
        setGraphData(
          results.map((result, index) => ({
            name:
              result?.Scenario ||
              selectedScenarios[index] ||
              `Scenario ${index + 1}`,
            values: accessPatternColumns.map(
              (pattern) =>
                Number(result?.access_patterns?.[pattern]) || 0
            ),
          }))
        );
      } catch (err) {
        if (active) {
          console.error("Error loading scenario results:", err);
          setTableData(null);
          setGraphData([]);
          setError("Unable to load scenario results.");
        }
      } finally {
        if (active) setLoadingResults(false);
      }
    };

    loadScenarioResults();

    return () => {
      active = false;
    };
  }, [
    benchmark,
    selectedVersions,
    selectedUfsVersions,
    selectedCapacity,
    selectedNand,
    selectedSocVendor,
    selectedSocModel,
    selectedHciVersions,
    selectedWriteBooster,
    selectedFileSystem,
    selectedEncryption,
    selectedScenarios,
  ]);

  // ----------------------------------------------------------
  // HELPERS
  // ----------------------------------------------------------
  const valueOf = (item) => {
    if (item === null || item === undefined) return "";
    if (typeof item === "object") {
      return item.value ?? item.name ?? item.label ?? "";
    }
    return item;
  };

  const labelOf = (item) => {
    if (item === null || item === undefined) return "";
    if (typeof item === "object") {
      return item.label ?? item.name ?? item.value ?? "";
    }
    return item;
  };

  const toggleArrayValue = (setter, current, item) => {
    const value = valueOf(item);

    setter(
      current.some((entry) => valueOf(entry) === value)
        ? current.filter((entry) => valueOf(entry) !== value)
        : [...current, item]
    );
  };

  const clearResults = () => {
    setTableData(null);
    setGraphData([]);
  };

  const tableColumns = useMemo(
    () => tableData?.columns || [],
    [tableData]
  );

  const tableRows = useMemo(
    () => tableData?.rows || [],
    [tableData]
  );

  const maxGraphValue = useMemo(() => {
    const values = graphData.flatMap((item) =>
      Array.isArray(item?.values)
        ? item.values.map((v) => Number(v) || 0)
        : []
    );

    return Math.max(...values, 1);
  }, [graphData]);

  // ----------------------------------------------------------
  // SECTION TOGGLE
  // ----------------------------------------------------------
  const toggleSection = (section) => {
    setExpandedSections((previous) => ({
      ...previous,
      [section]: !previous[section],
    }));
  };

  // ----------------------------------------------------------
  // ADD EVALUATOR NOTE
  // ----------------------------------------------------------
  const addNote = () => {
    const text = newNote.trim();

    if (!text) return;

    setNotes((previous) => [
      ...previous,
      {
        user: "You",
        time: new Date().toLocaleString(),
        text,
      },
    ]);

    setNewNote("");
  };

  // ----------------------------------------------------------
  // INLINE MULTI-SELECT FIELD
  // ----------------------------------------------------------
  // This is intentionally kept inside this file and rendered
  // directly in the sidebar. There is no separate component.
  const renderMultiSelect = ({
    label,
    values,
    setter,
    options,
    disabled = false,
    placeholder = "Select",
  }) => (
    <Box sx={{ mb: 1.7 }}>
      <Typography
        sx={{
          fontFamily: "Manrope, sans-serif",
          fontSize: "12px",
          fontWeight: 600,
          color: theme.text,
          mb: 0.7,
        }}
      >
        {label}
      </Typography>

      <Select
        multiple
        fullWidth
        displayEmpty
        disabled={disabled}
        value={values.map(valueOf)}
        onChange={(event) => {
          const selected = event.target.value;

          setter(
            options.filter((option) =>
              selected.includes(String(valueOf(option)))
            )
          );
        }}
        IconComponent={KeyboardArrowDownIcon}
        renderValue={(selected) =>
          selected.length > 0 ? (
            <Box
              sx={{
                display: "flex",
                gap: 0.5,
                flexWrap: "wrap",
                maxHeight: 54,
                overflow: "auto",
              }}
            >
              {selected.map((item) => (
                <Box
                  key={item}
                  sx={{
                    px: 1,
                    py: 0.35,
                    borderRadius: "12px",
                    background: theme.lightBlue,
                    color: theme.blue2,
                    fontSize: "11px",
                    fontWeight: 600,
                    fontFamily: "Manrope, sans-serif",
                  }}
                >
                  {item}
                </Box>
              ))}
            </Box>
          ) : (
            <Typography
              sx={{
                color: "#98A2B3",
                fontSize: "12px",
                fontFamily: "Manrope, sans-serif",
              }}
            >
              {placeholder}
            </Typography>
          )
        }
        sx={{
          minHeight: 40,
          borderRadius: "5px",
          background: "#FFFFFF",
          fontFamily: "Manrope, sans-serif",
          fontSize: "12px",
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: theme.border,
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "#B7C7DC",
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: theme.blue,
            borderWidth: "1px",
          },
        }}
        MenuProps={{
          PaperProps: {
            sx: {
              mt: 0.5,
              maxHeight: 320,
              borderRadius: "6px",
              border: `1px solid ${theme.border}`,
              boxShadow: "0 8px 24px rgba(7,27,60,0.12)",
            },
          },
        }}
      >
        {options.map((option) => {
          const optionValue = String(valueOf(option));
          const checked = values.some(
            (selected) => String(valueOf(selected)) === optionValue
          );

          return (
            <MenuItem
              key={optionValue}
              value={optionValue}
              sx={{
                fontSize: "12px",
                fontFamily: "Manrope, sans-serif",
                py: 0.7,
              }}
            >
              <Checkbox
                size="small"
                checked={checked}
                sx={{
                  p: 0.4,
                  mr: 0.7,
                  color: "#B7C7DC",
                  "&.Mui-checked": {
                    color: theme.blue,
                  },
                }}
              />
              {labelOf(option)}
            </MenuItem>
          );
        })}
      </Select>
    </Box>
  );

  // ----------------------------------------------------------
  // INLINE SINGLE-SELECT FIELD
  // Used only for Benchmark because benchmark_name is one path value.
  // ----------------------------------------------------------
  const renderSingleSelect = ({
    label,
    value,
    setter,
    options,
    disabled = false,
    placeholder = "Select",
  }) => (
    <Box sx={{ mb: 1.7 }}>
      <Typography
        sx={{
          fontFamily: "Manrope, sans-serif",
          fontSize: "12px",
          fontWeight: 600,
          color: theme.text,
          mb: 0.7,
        }}
      >
        {label}
      </Typography>

      <Select
        fullWidth
        displayEmpty
        value={value}
        disabled={disabled}
        onChange={(event) => setter(event.target.value)}
        IconComponent={KeyboardArrowDownIcon}
        sx={{
          minHeight: 40,
          borderRadius: "5px",
          background: "#FFFFFF",
          fontFamily: "Manrope, sans-serif",
          fontSize: "12px",
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: theme.border,
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "#B7C7DC",
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: theme.blue,
          },
        }}
      >
        <MenuItem value="">
          <Typography
            sx={{
              fontSize: "12px",
              color: "#98A2B3",
              fontFamily: "Manrope, sans-serif",
            }}
          >
            {placeholder}
          </Typography>
        </MenuItem>

        {options.map((option) => (
          <MenuItem
            key={String(valueOf(option))}
            value={valueOf(option)}
            sx={{
              fontFamily: "Manrope, sans-serif",
              fontSize: "12px",
            }}
          >
            {labelOf(option)}
          </MenuItem>
        ))}
      </Select>
    </Box>
  );

  // ----------------------------------------------------------
  // SIDEBAR SECTION HEADER
  // ----------------------------------------------------------
  const renderSectionHeader = (title, icon, key) => (
    <Box
      onClick={() => toggleSection(key)}
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        cursor: "pointer",
        py: 1.25,
        borderBottom: `1px solid ${theme.border}`,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.9 }}>
        {icon}
        <Typography
          sx={{
            fontFamily: "Manrope, sans-serif",
            fontSize: "12px",
            fontWeight: 700,
            color: theme.navy,
          }}
        >
          {title}
        </Typography>
      </Box>

      {expandedSections[key] ? (
        <KeyboardArrowUpIcon sx={{ fontSize: 18, color: theme.muted }} />
      ) : (
        <KeyboardArrowDownIcon sx={{ fontSize: 18, color: theme.muted }} />
      )}
    </Box>
  );

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: theme.page,
        color: theme.text,
        fontFamily: "Manrope, sans-serif",

        "@keyframes fadeUp": {
          from: {
            opacity: 0,
            transform: "translateY(10px)",
          },
          to: {
            opacity: 1,
            transform: "translateY(0)",
          },
        },

        "@keyframes tableRowIn": {
          from: {
            opacity: 0,
            transform: "translateY(8px)",
          },
          to: {
            opacity: 1,
            transform: "translateY(0)",
          },
        },

        "@keyframes barGrow": {
          from: {
            transform: "scaleY(0)",
            opacity: 0.25,
          },
          to: {
            transform: "scaleY(1)",
            opacity: 1,
          },
        },

        "@keyframes messageIn": {
          from: {
            opacity: 0,
            transform: "translateX(12px)",
          },
          to: {
            opacity: 1,
            transform: "translateX(0)",
          },
        },

        "@media (prefers-reduced-motion: reduce)": {
          "& *": {
            animationDuration: "0.01ms !important",
            animationIterationCount: "1 !important",
          },
        },
      }}
    >
      {/* ======================================================
          HEADER - SAME NAVY/BLUE THEME AS ATTACHED DASHBOARD
          ====================================================== */}
      <Box
        component="header"
        sx={{
          position: "sticky",
          top: 0,
          zIndex: 1200,
          height: { xs: 58, sm: 66 },
          px: { xs: 1.5, sm: 3.2 },
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background:
            "linear-gradient(135deg, #071B3C 0%, #0A2348 58%, #062D69 100%)",
          borderBottom: "2px solid #087FF5",
          boxShadow: "0 2px 8px rgba(7,27,60,0.22)",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", minWidth: 0 }}>
          {/* Logo treatment matching the supplied header */}
          <Box
            sx={{
              width: { xs: 34, sm: 40 },
              height: { xs: 34, sm: 40 },
              mr: { xs: 1, sm: 1.25 },
              borderRadius: "50%",
              position: "relative",
              flexShrink: 0,
              border: "2px dotted rgba(255,255,255,0.85)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Box
              sx={{
                width: 14,
                height: 14,
                borderRadius: "50%",
                border: "2px solid rgba(255,255,255,0.9)",
              }}
            />
          </Box>

          <Typography
            sx={{
              color: "#FFFFFF",
              fontFamily: "Manrope, sans-serif",
              fontWeight: 700,
              fontSize: { xs: 13, sm: 16 },
              letterSpacing: "-0.2px",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            UFS PERFORMANCE DASHBOARD
          </Typography>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 0.7 }}>
          <IconButton
            size="small"
            sx={{
              color: "#FFFFFF",
              border: "1px solid rgba(255,255,255,0.55)",
              borderRadius: "6px",
              width: 34,
              height: 34,
              "&:hover": {
                background: "rgba(255,255,255,0.08)",
              },
            }}
          >
            <NotificationsNoneIcon sx={{ fontSize: 18 }} />
          </IconButton>

          <IconButton
            size="small"
            onClick={() => {
              if (onHome) onHome();
            }}
            sx={{
              color: "#FFFFFF",
              border: "1px solid rgba(255,255,255,0.55)",
              borderRadius: "6px",
              width: 34,
              height: 34,
              "&:hover": {
                background: "rgba(255,255,255,0.08)",
              },
            }}
          >
            <HomeIcon sx={{ fontSize: 19 }} />
          </IconButton>

          <IconButton
            size="small"
            onClick={() => setSidebarOpen((value) => !value)}
            sx={{
              display: { xs: "inline-flex", md: "none" },
              color: "#FFFFFF",
              border: "1px solid rgba(255,255,255,0.55)",
              borderRadius: "6px",
              width: 34,
              height: 34,
            }}
          >
            <MenuIcon sx={{ fontSize: 19 }} />
          </IconButton>
        </Box>
      </Box>

      {/* ======================================================
          PAGE HEADING
          ====================================================== */}
      <Box
        sx={{
          px: { xs: 2, sm: 4, md: 6 },
          pt: { xs: 2.5, sm: 3.2 },
          pb: 2,
        }}
      >
        <Typography
          sx={{
            fontFamily: "Manrope, sans-serif",
            fontWeight: 700,
            fontSize: { xs: 21, sm: 25 },
            lineHeight: 1.2,
            color: theme.navy,
            letterSpacing: "-0.5px",
          }}
        >
          UFS PERFORMANCE DETAILS
        </Typography>

        <Typography
          sx={{
            mt: 0.55,
            fontFamily: "Manrope, sans-serif",
            fontWeight: 400,
            fontSize: { xs: 11.5, sm: 13 },
            color: theme.muted,
          }}
        >
          Compare benchmark performance across selected scenarios and device
          configurations.
        </Typography>
      </Box>

      {/* ======================================================
          MAIN CONTENT
          ====================================================== */}
      <Box
        sx={{
          display: "flex",
          alignItems: "flex-start",
          gap: 2,
          px: { xs: 1.5, sm: 3, md: 4 },
          pb: 4,
        }}
      >
        {/* ====================================================
            FILTER SIDEBAR
            ==================================================== */}
        <Box
          sx={{
            width: { xs: sidebarOpen ? "100%" : 0, md: sidebarOpen ? 285 : 0 },
            minWidth: { xs: sidebarOpen ? 0 : 0, md: sidebarOpen ? 285 : 0 },
            maxHeight: { xs: "none", md: "calc(100vh - 145px)" },
            overflowY: { xs: "visible", md: "auto" },
            overflowX: "hidden",
            position: { xs: "absolute", md: "sticky" },
            top: { xs: 65, md: 88 },
            zIndex: { xs: 1100, md: "auto" },
            background: "#FFFFFF",
            border: `1px solid ${theme.border}`,
            borderRadius: "7px",
            boxShadow: "0 3px 12px rgba(7,27,60,0.07)",
            transition: "all 0.22s ease",
            display: {
              xs: sidebarOpen ? "block" : "none",
              md: "block",
            },
          }}
        >
          <Box
            sx={{
              px: 1.8,
              py: 1.55,
              background: "#F9FBFE",
              borderBottom: `1px solid ${theme.border}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Box>
              <Typography
                sx={{
                  fontFamily: "Manrope, sans-serif",
                  fontSize: 14,
                  fontWeight: 700,
                  color: theme.navy,
                }}
              >
                PERFORMANCE FILTERS
              </Typography>
              <Typography
                sx={{
                  fontFamily: "Manrope, sans-serif",
                  fontSize: 10.5,
                  color: theme.muted,
                  mt: 0.2,
                }}
              >
                Select configuration and scenarios
              </Typography>
            </Box>

            <IconButton
              size="small"
              onClick={() => setSidebarOpen(false)}
              sx={{
                display: { xs: "inline-flex", md: "none" },
                color: theme.muted,
              }}
            >
              <CloseIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Box>

          <Box sx={{ px: 1.8, pb: 2 }}>
            {/* BENCHMARK */}
            {renderSectionHeader(
              "BENCHMARK",
              <SpeedIcon sx={{ fontSize: 17, color: theme.blue }} />,
              "benchmark"
            )}

            {expandedSections.benchmark && (
              <Box sx={{ pt: 1.5 }}>
                {renderSingleSelect({
                  label: "Benchmark",
                  value: benchmark,
                  setter: setBenchmark,
                  options: benchmarkOptions,
                  placeholder:
                    loadingFilters ? "Loading..." : "Select benchmark",
                })}

                {renderMultiSelect({
                  label: "Benchmark Version",
                  values: selectedVersions,
                  setter: setSelectedVersions,
                  options: versionOptions,
                  disabled: !benchmark || loadingVersions,
                  placeholder:
                    loadingVersions
                      ? "Loading versions..."
                      : "Select version(s)",
                })}

                {renderMultiSelect({
                  label: "UFS Version",
                  values: selectedUfsVersions,
                  setter: setSelectedUfsVersions,
                  options: ufsVersionOptions,
                  disabled:
                    selectedVersions.length === 0 || loadingUfsVersions,
                  placeholder:
                    loadingUfsVersions
                      ? "Loading UFS versions..."
                      : "Select UFS version(s)",
                })}
              </Box>
            )}

            {/* DEVICE */}
            {renderSectionHeader(
              "DEVICE CONFIGURATION",
              <DeveloperBoardIcon
                sx={{ fontSize: 17, color: theme.blue }}
              />,
              "device"
            )}

            {expandedSections.device && (
              <Box sx={{ pt: 1.5 }}>
                {renderMultiSelect({
                  label: "SoC Vendor",
                  values: selectedSocVendor,
                  setter: setSelectedSocVendor,
                  options: socVendorOptions,
                })}

                {renderMultiSelect({
                  label: "SoC Model",
                  values: selectedSocModel,
                  setter: setSelectedSocModel,
                  options: socModelOptions,
                })}

                {renderMultiSelect({
                  label: "HCI Version",
                  values: selectedHciVersions,
                  setter: setSelectedHciVersions,
                  options: hciVersionOptions,
                })}
              </Box>
            )}

            {/* STORAGE */}
            {renderSectionHeader(
              "STORAGE",
              <StorageIcon sx={{ fontSize: 17, color: theme.blue }} />,
              "storage"
            )}

            {expandedSections.storage && (
              <Box sx={{ pt: 1.5 }}>
                {renderMultiSelect({
                  label: "Capacity",
                  values: selectedCapacity,
                  setter: setSelectedCapacity,
                  options: capacityOptions,
                })}

                {renderMultiSelect({
                  label: "NAND Cell Type",
                  values: selectedNand,
                  setter: setSelectedNand,
                  options: nandOptions,
                })}

                {renderMultiSelect({
                  label: "WriteBooster",
                  values: selectedWriteBooster,
                  setter: setSelectedWriteBooster,
                  options: writeBoosterOptions,
                })}
              </Box>
            )}

            {/* SOFTWARE */}
            {renderSectionHeader(
              "SOFTWARE / SECURITY",
              <SecurityIcon sx={{ fontSize: 17, color: theme.blue }} />,
              "software"
            )}

            {expandedSections.software && (
              <Box sx={{ pt: 1.5 }}>
                {renderMultiSelect({
                  label: "File System",
                  values: selectedFileSystem,
                  setter: setSelectedFileSystem,
                  options: fileSystemOptions,
                })}

                {renderMultiSelect({
                  label: "Encryption",
                  values: selectedEncryption,
                  setter: setSelectedEncryption,
                  options: encryptionOptions,
                })}
              </Box>
            )}

            {/* SCENARIOS */}
            {renderSectionHeader(
              "AVAILABLE SCENARIOS",
              <MemoryIcon sx={{ fontSize: 17, color: theme.blue }} />,
              "scenarios"
            )}

            {expandedSections.scenarios && (
              <Box sx={{ pt: 1.1 }}>
                <Typography
                  sx={{
                    fontFamily: "Manrope, sans-serif",
                    fontSize: 10.5,
                    color: theme.muted,
                    mb: 1,
                  }}
                >
                  Select at least two scenarios to compare.
                </Typography>

                {scenarioOptions.map((scenario) => {
                  const scenarioValue = String(valueOf(scenario));
                  const checked = selectedScenarios.some(
                    (item) =>
                      String(valueOf(item)) === scenarioValue
                  );

                  return (
                    <FormControlLabel
                      key={scenarioValue}
                      sx={{
                        width: "100%",
                        m: 0,
                        mb: 0.25,
                        alignItems: "flex-start",
                      }}
                      control={
                        <Checkbox
                          size="small"
                          checked={checked}
                          onChange={() =>
                            toggleArrayValue(
                              setSelectedScenarios,
                              selectedScenarios,
                              scenario
                            )
                          }
                          sx={{
                            p: 0.5,
                            mr: 0.5,
                            color: "#B7C7DC",
                            "&.Mui-checked": {
                              color: theme.blue,
                            },
                          }}
                        />
                      }
                      label={
                        <Typography
                          sx={{
                            pt: 0.35,
                            fontFamily: "Manrope, sans-serif",
                            fontSize: 11.5,
                            color: theme.text,
                          }}
                        >
                          {labelOf(scenario)}
                        </Typography>
                      }
                    />
                  );
                })}
              </Box>
            )}

            <Button
              fullWidth
              variant="outlined"
              startIcon={<RefreshIcon sx={{ fontSize: 16 }} />}
              onClick={() => {
                setSelectedVersions([]);
                setSelectedUfsVersions([]);
                setSelectedCapacity([]);
                setSelectedNand([]);
                setSelectedSocVendor([]);
                setSelectedSocModel([]);
                setSelectedHciVersions([]);
                setSelectedWriteBooster([]);
                setSelectedFileSystem([]);
                setSelectedEncryption([]);
                setSelectedScenarios([]);
                clearResults();
              }}
              sx={{
                mt: 2,
                height: 38,
                borderRadius: "5px",
                textTransform: "none",
                fontFamily: "Manrope, sans-serif",
                fontSize: 12,
                fontWeight: 600,
                color: theme.blue2,
                borderColor: "#BFD2E8",
                "&:hover": {
                  borderColor: theme.blue,
                  background: theme.lightBlue,
                },
              }}
            >
              Reset Filters
            </Button>
          </Box>
        </Box>

        {/* ====================================================
            RESULTS AREA
            ==================================================== */}
        <Box
          sx={{
            flex: 1,
            minWidth: 0,
            width: "100%",
            animation: "fadeUp 0.35s ease both",
          }}
        >
          {/* MOBILE FILTER BUTTON */}
          <Button
            startIcon={<MenuIcon />}
            onClick={() => setSidebarOpen(true)}
            sx={{
              display: { xs: "inline-flex", md: "none" },
              mb: 1.5,
              textTransform: "none",
              fontFamily: "Manrope, sans-serif",
              fontSize: 12,
              fontWeight: 600,
              color: theme.blue2,
              border: `1px solid ${theme.border}`,
              background: "#FFFFFF",
              borderRadius: "5px",
            }}
          >
            Performance Filters
          </Button>

          {/* FILTER SUMMARY */}
          <Paper
            elevation={0}
            sx={{
              p: { xs: 1.5, sm: 2 },
              mb: 2,
              borderRadius: "7px",
              border: `1px solid ${theme.border}`,
              background: "#FFFFFF",
              boxShadow: "0 2px 9px rgba(7,27,60,0.05)",
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: { xs: "flex-start", sm: "center" },
                justifyContent: "space-between",
                gap: 1,
                flexWrap: "wrap",
              }}
            >
              <Box>
                <Typography
                  sx={{
                    fontFamily: "Manrope, sans-serif",
                    fontSize: 14,
                    fontWeight: 700,
                    color: theme.navy,
                  }}
                >
                  PERFORMANCE COMPARISON
                </Typography>

                <Typography
                  sx={{
                    mt: 0.3,
                    fontFamily: "Manrope, sans-serif",
                    fontSize: 11,
                    color: theme.muted,
                  }}
                >
                  {selectedScenarios.length >= 2
                    ? `${selectedScenarios.length} scenarios selected`
                    : "Select at least two scenarios to populate results"}
                </Typography>
              </Box>

              {benchmark && (
                <Box
                  sx={{
                    px: 1.25,
                    py: 0.65,
                    borderRadius: "4px",
                    background: theme.lightBlue,
                    color: theme.blue2,
                    fontFamily: "Manrope, sans-serif",
                    fontSize: 11,
                    fontWeight: 700,
                  }}
                >
                  {benchmark}
                </Box>
              )}
            </Box>
          </Paper>

          {/* ERROR */}
          {error && (
            <Paper
              elevation={0}
              sx={{
                mb: 2,
                px: 1.8,
                py: 1.3,
                borderRadius: "5px",
                border: "1px solid #F0CACA",
                background: "#FFF7F7",
                color: "#B42318",
                fontFamily: "Manrope, sans-serif",
                fontSize: 11.5,
              }}
            >
              {error}
            </Paper>
          )}

          {/* LOADING */}
          {loadingResults && (
            <Paper
              elevation={0}
              sx={{
                minHeight: 180,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "7px",
                border: `1px solid ${theme.border}`,
                background: "#FFFFFF",
                mb: 2,
              }}
            >
              <CircularProgress
                size={30}
                thickness={3}
                sx={{ color: theme.blue }}
              />
              <Typography
                sx={{
                  mt: 1.5,
                  fontFamily: "Manrope, sans-serif",
                  fontSize: 12,
                  color: theme.muted,
                }}
              >
                Loading performance results...
              </Typography>
            </Paper>
          )}

          {/* ==================================================
              TABLE INFORMATION
              ================================================== */}
          {!loadingResults && (
            <Paper
              elevation={0}
              sx={{
                borderRadius: "7px",
                border: `1px solid ${theme.border}`,
                background: "#FFFFFF",
                overflow: "hidden",
                mb: 2,
                boxShadow: "0 2px 9px rgba(7,27,60,0.05)",
              }}
            >
              <Box
                sx={{
                  px: { xs: 1.5, sm: 2 },
                  py: 1.35,
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  borderBottom: `1px solid ${theme.border}`,
                  background: "#FBFCFE",
                }}
              >
                <TableChartIcon
                  sx={{ color: theme.blue, fontSize: 19 }}
                />
                <Typography
                  sx={{
                    fontFamily: "Manrope, sans-serif",
                    fontSize: 14,
                    fontWeight: 700,
                    color: theme.navy,
                  }}
                >
                  TABLE INFORMATION
                </Typography>
              </Box>

              {tableColumns.length > 0 && tableRows.length > 0 ? (
                <Box
                  sx={{
                    width: "100%",
                    overflowX: "auto",
                  }}
                >
                  <Box
                    component="table"
                    sx={{
                      width: "100%",
                      minWidth: 620,
                      borderCollapse: "separate",
                      borderSpacing: 0,
                      fontFamily: "Manrope, sans-serif",

                      "& th": {
                        position: "sticky",
                        top: 0,
                        zIndex: 3,
                        background:
                          "linear-gradient(135deg, #087FF5 0%, #176BDC 100%)",
                        color: "#FFFFFF",
                        padding: "12px 14px",
                        textAlign: "left",
                        fontFamily: "Manrope, sans-serif",
                        fontSize: 11.5,
                        fontWeight: 700,
                        whiteSpace: "nowrap",
                        borderRight: "1px solid rgba(255,255,255,0.2)",
                      },

                      "& td": {
                        padding: "12px 14px",
                        fontFamily: "Manrope, sans-serif",
                        fontSize: 11.5,
                        color: theme.text,
                        borderBottom: `1px solid ${theme.border}`,
                        borderRight: `1px solid ${theme.border}`,
                        background: "#FFFFFF",
                      },

                      "& tbody tr": {
                        animation: "tableRowIn 0.38s ease both",
                      },

                      "& tbody tr:hover td": {
                        background: "#F7FBFF",
                      },

                      "& tbody tr:last-child td": {
                        borderBottom: 0,
                      },
                    }}
                  >
                    <Box component="thead">
                      <Box component="tr">
                        {tableColumns.map((column) => (
                          <Box component="th" key={column}>
                            {column}
                          </Box>
                        ))}
                      </Box>
                    </Box>

                    <Box component="tbody">
                      {tableRows.map((row, rowIndex) => (
                        <Box
                          component="tr"
                          key={rowIndex}
                          sx={{
                            animationDelay: `${rowIndex * 55}ms !important`,
                          }}
                        >
                          {tableColumns.map((column) => {
                            const value = row?.[column];

                            return (
                              <Box component="td" key={column}>
                                {typeof value === "number"
                                  ? value.toLocaleString(undefined, {
                                      maximumFractionDigits: 2,
                                    })
                                  : value ?? "-"}
                              </Box>
                            );
                          })}
                        </Box>
                      ))}
                    </Box>
                  </Box>
                </Box>
              ) : (
                <Box
                  sx={{
                    minHeight: 150,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    textAlign: "center",
                    px: 2,
                  }}
                >
                  <Box>
                    <TableChartIcon
                      sx={{
                        fontSize: 32,
                        color: "#B8C8DA",
                        mb: 0.8,
                      }}
                    />
                    <Typography
                      sx={{
                        fontFamily: "Manrope, sans-serif",
                        fontSize: 12,
                        fontWeight: 600,
                        color: theme.muted,
                      }}
                    >
                      No table data available
                    </Typography>
                    <Typography
                      sx={{
                        mt: 0.35,
                        fontFamily: "Manrope, sans-serif",
                        fontSize: 10.5,
                        color: "#98A2B3",
                      }}
                    >
                      Select at least two scenarios and wait for the backend
                      results.
                    </Typography>
                  </Box>
                </Box>
              )}
            </Paper>
          )}

          {/* ==================================================
              GRAPH INFORMATION
              ================================================== */}
          {!loadingResults && (
            <Paper
              elevation={0}
              sx={{
                borderRadius: "7px",
                border: `1px solid ${theme.border}`,
                background: "#FFFFFF",
                overflow: "hidden",
                mb: 2,
                boxShadow: "0 2px 9px rgba(7,27,60,0.05)",
              }}
            >
              <Box
                sx={{
                  px: { xs: 1.5, sm: 2 },
                  py: 1.35,
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  borderBottom: `1px solid ${theme.border}`,
                  background: "#FBFCFE",
                }}
              >
                <ShowChartIcon
                  sx={{ color: theme.blue, fontSize: 19 }}
                />
                <Typography
                  sx={{
                    fontFamily: "Manrope, sans-serif",
                    fontSize: 14,
                    fontWeight: 700,
                    color: theme.navy,
                  }}
                >
                  GRAPH INFORMATION
                </Typography>
              </Box>

              {graphData.length > 0 ? (
                <Box sx={{ p: { xs: 1.5, sm: 2.5 } }}>
                  {graphData.map((series, seriesIndex) => (
                    <Box
                      key={seriesIndex}
                      sx={{
                        mb:
                          seriesIndex === graphData.length - 1
                            ? 0
                            : 3,
                      }}
                    >
                      <Typography
                        sx={{
                          mb: 1.4,
                          fontFamily: "Manrope, sans-serif",
                          fontSize: 12,
                          fontWeight: 700,
                          color: theme.navy,
                        }}
                      >
                        {labelOf(series?.name) ||
                          `Scenario ${seriesIndex + 1}`}
                      </Typography>

                      <Box
                        sx={{
                          minHeight: 235,
                          display: "flex",
                          alignItems: "flex-end",
                          gap: { xs: 1.2, sm: 2.4 },
                          px: { xs: 1, sm: 2 },
                          pt: 2,
                          pb: 3.2,
                          borderLeft: `1px solid ${theme.border}`,
                          borderBottom: `1px solid ${theme.border}`,
                          background:
                            "linear-gradient(to top, #F8FBFF 0%, #FFFFFF 100%)",
                          position: "relative",
                          overflowX: "auto",

                          "&:before": {
                            content: '""',
                            position: "absolute",
                            left: 0,
                            right: 0,
                            top: "25%",
                            borderTop: "1px dashed #E8EEF6",
                          },

                          "&:after": {
                            content: '""',
                            position: "absolute",
                            left: 0,
                            right: 0,
                            top: "50%",
                            borderTop: "1px dashed #E8EEF6",
                          },
                        }}
                      >
                        {(series.values || []).map((rawValue, index) => {
                          const numericValue = Number(rawValue) || 0;
                          const height =
                            (numericValue / maxGraphValue) * 100;

                          return (
                            <Box
                              key={index}
                              sx={{
                                width: { xs: 42, sm: 58 },
                                minWidth: { xs: 42, sm: 58 },
                                height: 185,
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "flex-end",
                                alignItems: "center",
                                position: "relative",
                                zIndex: 2,
                              }}
                            >
                              <Typography
                                sx={{
                                  mb: 0.7,
                                  fontFamily: "Manrope, sans-serif",
                                  fontSize: 9.5,
                                  fontWeight: 700,
                                  color: theme.text,
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {numericValue.toLocaleString(undefined, {
                                  maximumFractionDigits: 1,
                                })}
                              </Typography>

                              <Box
                                sx={{
                                  width: "100%",
                                  height: `${Math.max(height, 2)}%`,
                                  minHeight: 4,
                                  position: "relative",
                                  transformOrigin: "bottom",
                                  animation:
                                    "barGrow 0.75s cubic-bezier(.2,.8,.2,1) both",
                                  animationDelay: `${index * 90}ms`,
                                  borderRadius: "3px 3px 0 0",
                                  background:
                                    "linear-gradient(180deg,#2C92F5 0%,#087FF5 65%,#0754C7 100%)",
                                  boxShadow:
                                    "3px 3px 0 rgba(7,84,199,0.25), 0 5px 12px rgba(8,127,245,0.16)",
                                  "&:after": {
                                    content: '""',
                                    position: "absolute",
                                    top: 0,
                                    right: -4,
                                    width: 4,
                                    height: "100%",
                                    transform: "skewY(-35deg)",
                                    transformOrigin: "left top",
                                    background: "#0754C7",
                                    borderRadius: "0 2px 0 0",
                                  },
                                }}
                              />

                              <Typography
                                sx={{
                                  position: "absolute",
                                  bottom: -23,
                                  fontFamily: "Manrope, sans-serif",
                                  fontSize: 9,
                                  color: theme.muted,
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {tableRows[index]?.[
                                  tableColumns[0]
                                ] || `Metric ${index + 1}`}
                              </Typography>
                            </Box>
                          );
                        })}
                      </Box>
                    </Box>
                  ))}
                </Box>
              ) : (
                <Box
                  sx={{
                    minHeight: 150,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    textAlign: "center",
                    px: 2,
                  }}
                >
                  <Box>
                    <ShowChartIcon
                      sx={{
                        fontSize: 32,
                        color: "#B8C8DA",
                        mb: 0.8,
                      }}
                    />
                    <Typography
                      sx={{
                        fontFamily: "Manrope, sans-serif",
                        fontSize: 12,
                        fontWeight: 600,
                        color: theme.muted,
                      }}
                    >
                      No graph data available
                    </Typography>
                  </Box>
                </Box>
              )}
            </Paper>
          )}

          {/* ==================================================
              CURRENT FILTER DETAILS
              ================================================== */}
          <Paper
            elevation={0}
            sx={{
              borderRadius: "7px",
              border: `1px solid ${theme.border}`,
              background: "#FFFFFF",
              boxShadow: "0 2px 9px rgba(7,27,60,0.05)",
              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                px: 2,
                py: 1.35,
                display: "flex",
                alignItems: "center",
                gap: 1,
                borderBottom: `1px solid ${theme.border}`,
                background: "#FBFCFE",
              }}
            >
              <SettingsInputComponentIcon
                sx={{ color: theme.blue, fontSize: 18 }}
              />
              <Typography
                sx={{
                  fontFamily: "Manrope, sans-serif",
                  fontSize: 14,
                  fontWeight: 700,
                  color: theme.navy,
                }}
              >
                SELECTED CONFIGURATION
              </Typography>
            </Box>

            <Box
              sx={{
                p: 2,
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "repeat(2, 1fr)",
                  lg: "repeat(3, 1fr)",
                },
                gap: 1,
              }}
            >
              {[
                ["Benchmark", benchmark || "-"],
                [
                  "Version(s)",
                  selectedVersions.map(labelOf).join(", ") || "-",
                ],
                [
                  "UFS Version(s)",
                  selectedUfsVersions.map(labelOf).join(", ") || "-",
                ],
                ["Capacity", selectedCapacity.map(labelOf).join(", ") || "-"],
                ["NAND Cell Type", selectedNand.map(labelOf).join(", ") || "-"],
                ["SoC Vendor", selectedSocVendor.map(labelOf).join(", ") || "-"],
                ["SoC Model", selectedSocModel.map(labelOf).join(", ") || "-"],
                [
                  "HCI Version(s)",
                  selectedHciVersions.map(labelOf).join(", ") || "-",
                ],
                [
                  "WriteBooster",
                  selectedWriteBooster.map(labelOf).join(", ") || "-",
                ],
                [
                  "File System",
                  selectedFileSystem.map(labelOf).join(", ") || "-",
                ],
                [
                  "Encryption",
                  selectedEncryption.map(labelOf).join(", ") || "-",
                ],
                [
                  "Scenarios",
                  selectedScenarios.map(labelOf).join(", ") || "-",
                ],
              ].map(([label, value]) => (
                <Box
                  key={label}
                  sx={{
                    p: 1.2,
                    borderRadius: "5px",
                    border: `1px solid ${theme.border}`,
                    background: "#FAFCFF",
                  }}
                >
                  <Typography
                    sx={{
                      fontFamily: "Manrope, sans-serif",
                      fontSize: 9.5,
                      fontWeight: 600,
                      color: theme.muted,
                      textTransform: "uppercase",
                    }}
                  >
                    {label}
                  </Typography>

                  <Typography
                    sx={{
                      mt: 0.35,
                      fontFamily: "Manrope, sans-serif",
                      fontSize: 11,
                      fontWeight: 600,
                      color: theme.text,
                      wordBreak: "break-word",
                    }}
                  >
                    {value}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Paper>
        </Box>
      </Box>

      {/* ======================================================
          EVALUATOR NOTES BUTTON
          ====================================================== */}
      <Button
        onClick={() => setDrawerOpen(true)}
        startIcon={<NotesIcon />}
        sx={{
          position: "fixed",
          right: { xs: 12, sm: 20 },
          bottom: { xs: 65, sm: 76 },
          zIndex: 1250,
          height: 40,
          px: 1.7,
          borderRadius: "5px",
          background: theme.navy,
          color: "#FFFFFF",
          textTransform: "none",
          fontFamily: "Manrope, sans-serif",
          fontSize: 11.5,
          fontWeight: 600,
          boxShadow: "0 5px 16px rgba(7,27,60,0.25)",
          "&:hover": {
            background: theme.navy2,
          },
        }}
      >
        Evaluator Notes
      </Button>

      {/* ======================================================
          RIGHT DRAWER / CHAT WINDOW
          ====================================================== */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{
          sx: {
            width: { xs: "100%", sm: 390 },
            maxWidth: "100%",
            fontFamily: "Manrope, sans-serif",
            background: "#F7F9FC",
          },
        }}
      >
        <Box
          sx={{
            height: "100%",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Box
            sx={{
              px: 2,
              py: 1.65,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              background:
                "linear-gradient(135deg,#071B3C 0%,#063B8F 100%)",
              borderBottom: "2px solid #087FF5",
            }}
          >
            <Box>
              <Typography
                sx={{
                  fontFamily: "Manrope, sans-serif",
                  fontSize: 14,
                  fontWeight: 700,
                  color: "#FFFFFF",
                }}
              >
                EVALUATOR NOTES
              </Typography>
              <Typography
                sx={{
                  mt: 0.2,
                  fontFamily: "Manrope, sans-serif",
                  fontSize: 10,
                  color: "rgba(255,255,255,0.72)",
                }}
              >
                Performance evaluation discussion
              </Typography>
            </Box>

            <IconButton
              onClick={() => setDrawerOpen(false)}
              sx={{
                color: "#FFFFFF",
                border: "1px solid rgba(255,255,255,0.4)",
                borderRadius: "5px",
                width: 32,
                height: 32,
              }}
            >
              <CloseIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Box>

          <Box
            sx={{
              flex: 1,
              overflowY: "auto",
              p: 1.6,
            }}
          >
            {notes.map((note, index) => (
              <Box
                key={index}
                sx={{
                  mb: 1.4,
                  p: 1.35,
                  borderRadius: "6px",
                  border: `1px solid ${theme.border}`,
                  background: "#FFFFFF",
                  animation: "messageIn 0.3s ease both",
                  animationDelay: `${index * 60}ms`,
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 1,
                    mb: 0.65,
                  }}
                >
                  <Typography
                    sx={{
                      fontFamily: "Manrope, sans-serif",
                      fontSize: 11,
                      fontWeight: 700,
                      color: theme.navy,
                    }}
                  >
                    {note.user}
                  </Typography>

                  <Typography
                    sx={{
                      fontFamily: "Manrope, sans-serif",
                      fontSize: 9.5,
                      color: theme.muted,
                    }}
                  >
                    {note.time}
                  </Typography>
                </Box>

                <Typography
                  sx={{
                    fontFamily: "Manrope, sans-serif",
                    fontSize: 11,
                    lineHeight: 1.55,
                    color: theme.text,
                  }}
                >
                  {note.text}
                </Typography>
              </Box>
            ))}
          </Box>

          <Box
            sx={{
              p: 1.4,
              borderTop: `1px solid ${theme.border}`,
              background: "#FFFFFF",
            }}
          >
            <TextField
              fullWidth
              multiline
              minRows={2}
              maxRows={5}
              value={newNote}
              onChange={(event) => setNewNote(event.target.value)}
              placeholder="Add evaluator note..."
              onKeyDown={(event) => {
                if (
                  event.key === "Enter" &&
                  !event.shiftKey
                ) {
                  event.preventDefault();
                  addNote();
                }
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "5px",
                  fontFamily: "Manrope, sans-serif",
                  fontSize: 11.5,
                  background: "#F9FBFE",
                },
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: theme.border,
                },
              }}
            />

            <Button
              fullWidth
              onClick={addNote}
              endIcon={<SendIcon sx={{ fontSize: 15 }} />}
              sx={{
                mt: 1,
                height: 37,
                borderRadius: "5px",
                background: theme.blue2,
                color: "#FFFFFF",
                textTransform: "none",
                fontFamily: "Manrope, sans-serif",
                fontSize: 11.5,
                fontWeight: 600,
                "&:hover": {
                  background: "#0648AC",
                },
              }}
            >
              Add Note
            </Button>
          </Box>
        </Box>
      </Drawer>

      {/* ======================================================
          FOOTER - SAME THEME AS SUPPLIED DASHBOARD
          ====================================================== */}
      <Box
        component="footer"
        sx={{
          minHeight: { xs: 62, sm: 70 },
          px: 2,
          py: 1.2,
          background:
            "linear-gradient(135deg,#061A3A 0%,#05285C 100%)",
          color: "#FFFFFF",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          borderTop: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 0.7,
            flexWrap: "wrap",
          }}
        >
          <Box
            sx={{
              width: 22,
              height: 22,
              borderRadius: "50%",
              border: "1px solid rgba(255,255,255,0.65)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <StorageIcon sx={{ fontSize: 13 }} />
          </Box>

          <Typography
            sx={{
              fontFamily: "Manrope, sans-serif",
              fontSize: { xs: 9.5, sm: 10.5 },
              color: "rgba(255,255,255,0.86)",
            }}
          >
            Maintainers:
          </Typography>

          <Typography
            sx={{
              fontFamily: "Manrope, sans-serif",
              fontSize: { xs: 9.5, sm: 10.5 },
              fontWeight: 700,
              color: "#42A5F5",
            }}
          >
            C T D O N A N D  T S I P - K I C  Bangalore
          </Typography>
        </Box>

        <Box
          sx={{
            width: { xs: "85%", sm: "55%" },
            height: "1px",
            my: 0.8,
            background: "rgba(255,255,255,0.2)",
          }}
        />

        <Typography
          sx={{
            fontFamily: "Manrope, sans-serif",
            fontSize: { xs: 8.5, sm: 9.5 },
            color: "rgba(255,255,255,0.78)",
            textAlign: "center",
          }}
        >
          © 2026 Software India Pvt Ltd. All Rights Reserved.
          <Box
            component="span"
            sx={{
              mx: 1,
              color: "rgba(255,255,255,0.35)",
            }}
          >
            |
          </Box>
          To recipients eyes only.
        </Typography>
      </Box>
    </Box>
  );
}
