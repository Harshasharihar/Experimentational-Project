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
import SearchIcon from "@mui/icons-material/Search";
import FilterAltIcon from "@mui/icons-material/FilterAlt";

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
  const [applyRequest, setApplyRequest] = useState(0);

  // ----------------------------------------------------------
  // UI STATE
  // ----------------------------------------------------------
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [scenarioSearch, setScenarioSearch] = useState("");
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
  // 13. GET SCENARIO RESULTS ONLY AFTER APPLY FILTERS
  // ----------------------------------------------------------
  useEffect(() => {
    let active = true;

    const loadScenarioResults = async () => {
      // applyRequest === 0 means the page is intentionally empty on entry.
      if (
        applyRequest === 0 ||
        !benchmark ||
        selectedScenarios.length < 2
      ) {
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

        const firstAccessPatterns = results[0]?.access_patterns || {};
        const accessPatternColumns = Object.keys(firstAccessPatterns);

        const rows = accessPatternColumns.map((pattern) => {
          const row = { "Access Pattern": pattern };
          results.forEach((result, index) => {
            row[`Scenario ${index + 1}`] =
              result?.access_patterns?.[pattern] ?? "-";
          });
          return row;
        });

        setTableData({
          columns: [
            "Access Pattern",
            ...results.map((_, index) => `Scenario ${index + 1}`),
          ],
          rows,
        });

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
  }, [applyRequest]);

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

  const resetFilters = () => {
    setBenchmark("");
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
    setScenarioOptions([]);
    setScenarioSearch("");
    setApplyRequest(0);
    clearResults();
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
  }) => {
    return (
      <Box sx={{ mb: 1.7 }}>
        <Typography
          sx={{
            fontFamily: "Manrope, sans-serif",
            fontSize: 12,
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
                  gap: 0.55,
                  flexWrap: "wrap",
                  maxHeight: 52,
                  overflow: "hidden",
                }}
              >
                {selected.map((item) => (
                  <Box
                    key={item}
                    sx={{
                      px: 0.8,
                      py: 0.25,
                      borderRadius: "10px",
                      background: theme.lightBlue,
                      color: theme.blue2,
                      fontSize: 10.5,
                      fontWeight: 700,
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
                  fontSize: 12,
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
            fontSize: 12,
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
                maxHeight: 340,
                borderRadius: "6px",
                border: `1px solid ${theme.border}`,
                boxShadow: "0 8px 24px rgba(7,27,60,0.12)",
              },
            },
          }}
        >
          <Box
            sx={{
              px: 1.25,
              py: 0.75,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 1,
              position: "sticky",
              top: 0,
              zIndex: 2,
              background: "#FFFFFF",
              borderBottom: `1px solid ${theme.border}`,
            }}
            onMouseDown={(event) => event.preventDefault()}
          >
            <Typography
              onClick={() => setter(options)}
              sx={{
                cursor: options.length ? "pointer" : "default",
                fontFamily: "Manrope, sans-serif",
                fontSize: 11.5,
                fontWeight: 700,
                color: options.length ? theme.blue2 : "#B8C3D1",
              }}
            >
              Select All
            </Typography>
            <Typography
              onClick={() => setter([])}
              sx={{
                cursor: values.length ? "pointer" : "default",
                fontFamily: "Manrope, sans-serif",
                fontSize: 9.5,
                fontWeight: 600,
                color: values.length ? theme.muted : "#B8C3D1",
              }}
            >
              Deselect All
            </Typography>
          </Box>

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
                  fontSize: 12,
                  fontFamily: "Manrope, sans-serif",
                  py: 0.65,
                }}
              >
                <Checkbox
                  size="small"
                  checked={checked}
                  sx={{
                    p: 0.4,
                    mr: 0.7,
                    color: "#B7C7DC",
                    "&.Mui-checked": { color: theme.blue },
                  }}
                />
                {labelOf(option)}
              </MenuItem>
            );
          })}

          {options.length === 0 && (
            <Box sx={{ px: 1.5, py: 1.4 }}>
              <Typography
                sx={{
                  fontFamily: "Manrope, sans-serif",
                  fontSize: 10.5,
                  color: theme.muted,
                }}
              >
                No options available.
              </Typography>
            </Box>
          )}
        </Select>
      </Box>
    );
  };

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
  const renderSectionHeader = (title, icon, key, disabled = false) => (
    <Box
      onClick={() => !disabled && toggleSection(key)}
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        cursor: disabled ? "not-allowed" : "pointer",
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
            color: disabled ? "#A9B5C5" : theme.navy,
          }}
        >
          {title}
        </Typography>
      </Box>

      {expandedSections[key] && !disabled ? (
        <KeyboardArrowUpIcon sx={{ fontSize: 18, color: theme.muted }} />
      ) : (
        <KeyboardArrowDownIcon sx={{ fontSize: 18, color: disabled ? "#C2CBD7" : theme.muted }} />
      )}
    </Box>
  );

  return (
    <Box
      sx={{
        height: "100vh",
        width: "100%",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        background: "#F7F9FC",
        color: theme.text,
        fontFamily: "Manrope, sans-serif",
        "@keyframes fadeUp": {
          from: { opacity: 0, transform: "translateY(8px)" },
          to: { opacity: 1, transform: "translateY(0)" },
        },
        "@keyframes barGrow": {
          from: { transform: "scaleY(0)", opacity: 0.25 },
          to: { transform: "scaleY(1)", opacity: 1 },
        },
        "@media (prefers-reduced-motion: reduce)": {
          "& *": { animationDuration: "0.01ms !important", animationIterationCount: "1 !important" },
        },
      }}
    >
      {/* FIXED HEADER */}
      <Box
        component="header"
        sx={{
          height: 62,
          minHeight: 62,
          flexShrink: 0,
          px: { xs: 2, sm: 3.2 },
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "linear-gradient(135deg,#071B3C 0%,#0A2348 55%,#062D69 100%)",
          borderBottom: "2px solid #087FF5",
          boxShadow: "0 2px 8px rgba(7,27,60,.20)",
          zIndex: 20,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", minWidth: 0 }}>
          <Box
            sx={{
              width: 40, height: 40, mr: 1.25, borderRadius: "50%",
              border: "2px dotted rgba(255,255,255,.88)",
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}
          >
            <Box sx={{ width: 15, height: 15, borderRadius: "50%", border: "2px solid #FFF" }} />
          </Box>
          <Typography sx={{ color: "#FFF", fontSize: { xs: 13, sm: 17 }, fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            KIOXIA DEVICE PROMOTION STATS DASHBOARD
          </Typography>
        </Box>
        <IconButton
          onClick={() => onHome && onHome()}
          sx={{ color: "#FFF", width: 40, height: 40, border: "1px solid rgba(255,255,255,.55)", borderRadius: "7px", flexShrink: 0, "&:hover": { background: "rgba(255,255,255,.08)" } }}
        >
          <HomeIcon sx={{ fontSize: 21 }} />
        </IconButton>
      </Box>

      {/* FIXED PAGE TITLE */}
      <Box sx={{ flexShrink: 0, px: { xs: 2, md: 4 }, pt: 2.2, pb: 1.4 }}>
        <Typography sx={{ color: theme.navy, fontSize: { xs: 21, md: 24 }, lineHeight: 1.15, fontWeight: 700 }}>
          UFS PERFORMANCE DETAILS
        </Typography>
        <Typography sx={{ mt: .45, color: theme.muted, fontSize: { xs: 11, md: 12.5 } }}>
          Compare Benchmark Performance Across Selected Scenarios and Device Configuration
        </Typography>
      </Box>

      {/* BODY: ONLY RESULTS PANEL SCROLLS; PAGE ITSELF NEVER SCROLLS */}
      <Box sx={{ flex: 1, minHeight: 0, display: "flex", gap: 2, px: { xs: 1.2, md: 2 }, pb: 1.2, overflow: "hidden" }}>
        {/* LEFT FILTER PANEL */}
        <Box
          sx={{
            width: { xs: 285, md: 286 },
            minWidth: { xs: 285, md: 286 },
            height: "100%",
            overflow: "hidden",
            border: `1px solid ${theme.border}`,
            borderRadius: "6px",
            background: "#FFF",
            boxShadow: "0 2px 8px rgba(7,27,60,.06)",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Box sx={{ px: 1.7, pt: 1.5, pb: 1.15, flexShrink: 0, borderBottom: `1px solid ${theme.border}` }}>
            <Typography sx={{ color: theme.navy, fontSize: 13.5, fontWeight: 700 }}>PERFORMANCE FILTERS</Typography>
            <Typography sx={{ mt: .25, color: theme.muted, fontSize: 10.5 }}>Select configuration and scenarios</Typography>
          </Box>

          <Box
            sx={{
              flex: 1, minHeight: 0, overflowY: "auto", px: 1.2, pb: 1.5,
              scrollbarWidth: "thin", scrollbarColor: "#B6C4D5 transparent",
              "&::-webkit-scrollbar": { width: 7 },
              "&::-webkit-scrollbar-thumb": { background: "#B6C4D5", borderRadius: 8 },
            }}
          >
            {renderSectionHeader("BENCHMARK & DEVICE GEN", <SpeedIcon sx={{ fontSize: 18, color: theme.blue }} />, "benchmark")}
            {expandedSections.benchmark && (
              <Box sx={{ pt: 1.15, px: .8 }}>
                {renderSingleSelect({
                  label: "Benchmark",
                  value: benchmark,
                  setter: (value) => { setBenchmark(value); setApplyRequest(0); },
                  options: benchmarkOptions,
                  placeholder: loadingFilters ? "Loading..." : "Select benchmark",
                })}
                {renderMultiSelect({
                  label: "Benchmark Version",
                  values: selectedVersions,
                  setter: (value) => { setSelectedVersions(value); setApplyRequest(0); },
                  options: versionOptions,
                  disabled: !benchmark || loadingVersions,
                  placeholder: loadingVersions ? "Loading versions..." : "Select version(s)",
                })}
                {renderMultiSelect({
                  label: "UFS Version",
                  values: selectedUfsVersions,
                  setter: (value) => { setSelectedUfsVersions(value); setApplyRequest(0); },
                  options: ufsVersionOptions,
                  disabled: selectedVersions.length === 0 || loadingUfsVersions,
                  placeholder: loadingUfsVersions ? "Loading UFS versions..." : "Select UFS version(s)",
                })}
              </Box>
            )}

            {renderSectionHeader(
              "ADDITIONAL CONFIGURATION",
              <DeveloperBoardIcon sx={{ fontSize: 18, color: theme.green }} />,
              "device",
              !(benchmark && selectedVersions.length && selectedUfsVersions.length)
            )}
            {expandedSections.device && benchmark && selectedVersions.length && selectedUfsVersions.length ? (
              <Box sx={{ pt: 1.15, px: .8 }}>
                {renderMultiSelect({ label: "Capacity", values: selectedCapacity, setter: v => { setSelectedCapacity(v); setApplyRequest(0); }, options: capacityOptions, disabled: !capacityOptions.length })}
                {renderMultiSelect({ label: "NAND Cell Type", values: selectedNand, setter: v => { setSelectedNand(v); setApplyRequest(0); }, options: nandOptions, disabled: !nandOptions.length })}
                {renderMultiSelect({ label: "SoC Vendor", values: selectedSocVendor, setter: v => { setSelectedSocVendor(v); setApplyRequest(0); }, options: socVendorOptions, disabled: !socVendorOptions.length })}
                {renderMultiSelect({ label: "SoC Model", values: selectedSocModel, setter: v => { setSelectedSocModel(v); setApplyRequest(0); }, options: socModelOptions, disabled: !socModelOptions.length })}
                {renderMultiSelect({ label: "HCI Version", values: selectedHciVersions, setter: v => { setSelectedHciVersions(v); setApplyRequest(0); }, options: hciVersionOptions, disabled: !hciVersionOptions.length })}
              </Box>
            ) : null}

            {renderSectionHeader(
              "STORAGE",
              <StorageIcon sx={{ fontSize: 18, color: theme.blue }} />,
              "storage",
              !(benchmark && selectedVersions.length && selectedUfsVersions.length)
            )}
            {expandedSections.storage && benchmark && selectedVersions.length && selectedUfsVersions.length ? (
              <Box sx={{ pt: 1.15, px: .8 }}>
                {renderMultiSelect({ label: "WriteBooster", values: selectedWriteBooster, setter: v => { setSelectedWriteBooster(v); setApplyRequest(0); }, options: writeBoosterOptions, disabled: !writeBoosterOptions.length })}
              </Box>
            ) : null}

            {renderSectionHeader(
              "SOFTWARE / SECURITY",
              <SecurityIcon sx={{ fontSize: 18, color: theme.green }} />,
              "software",
              !(benchmark && selectedVersions.length && selectedUfsVersions.length)
            )}
            {expandedSections.software && benchmark && selectedVersions.length && selectedUfsVersions.length ? (
              <Box sx={{ pt: 1.15, px: .8 }}>
                {renderMultiSelect({ label: "File System", values: selectedFileSystem, setter: v => { setSelectedFileSystem(v); setApplyRequest(0); }, options: fileSystemOptions, disabled: !fileSystemOptions.length })}
                {renderMultiSelect({ label: "Encryption", values: selectedEncryption, setter: v => { setSelectedEncryption(v); setApplyRequest(0); }, options: encryptionOptions, disabled: !encryptionOptions.length })}
              </Box>
            ) : null}
          </Box>

          {/* ACTIONS ALWAYS VISIBLE AT BOTTOM */}
          <Box sx={{ px: 1.2, pt: 1, pb: 1.25, flexShrink: 0, borderTop: `1px solid ${theme.border}`, background: "#FFF" }}>
            <Button
              fullWidth
              variant="contained"
              startIcon={<FilterAltIcon sx={{ fontSize: 16 }} />}
              disabled={selectedScenarios.length < 2 || loadingResults}
              onClick={() => { setError(""); setApplyRequest(v => v + 1); }}
              sx={{ height: 38, borderRadius: "5px", textTransform: "none", fontSize: 12, fontWeight: 700, background: theme.blue2, boxShadow: "none", "&:hover": { background: theme.blue, boxShadow: "none" }, "&.Mui-disabled": { background: "#DCE5F2", color: "#98A7B8" } }}
            >Apply Filters</Button>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<RefreshIcon sx={{ fontSize: 16 }} />}
              onClick={resetFilters}
              sx={{ mt: .8, height: 38, borderRadius: "5px", textTransform: "none", fontSize: 12, fontWeight: 600, color: theme.blue2, borderColor: theme.blue2, "&:hover": { borderColor: theme.blue, background: theme.lightBlue } }}
            >Reset Filters</Button>
          </Box>
        </Box>

        {/* RIGHT: SINGLE SCROLL CONTAINER FOR ALL THREE RESULT SECTIONS */}
        <Box
          sx={{
            flex: 1, minWidth: 0, minHeight: 0, height: "100%", overflowY: "auto", overflowX: "hidden",
            pr: .25, scrollbarWidth: "thin", scrollbarColor: "#AAB9CB transparent",
            "&::-webkit-scrollbar": { width: 9 },
            "&::-webkit-scrollbar-track": { background: "transparent" },
            "&::-webkit-scrollbar-thumb": { background: "#AAB9CB", borderRadius: 10, border: "2px solid transparent", backgroundClip: "padding-box" },
          }}
        >
          {error && <Paper elevation={0} sx={{ mb: 1.2, p: 1, border: "1px solid #F1C9C9", background: "#FFF7F7", color: "#B42318", fontSize: 11 }}>{error}</Paper>}

          {/* AVAILABLE SCENARIOS */}
          <Paper elevation={0} sx={{ mb: 1.2, border: `1px solid ${theme.border}`, borderRadius: "7px", background: "#FFF", overflow: "hidden", boxShadow: "0 2px 8px rgba(7,27,60,.04)" }}>
            <Box sx={{ px: 1.7, py: 1.2, display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: `1px solid ${theme.border}`, background: "#FBFCFE", gap: 1, flexWrap: "wrap" }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: .8 }}>
                <MemoryIcon sx={{ color: theme.blue, fontSize: 20 }} />
                <Typography sx={{ color: theme.navy, fontSize: 13.5, fontWeight: 700 }}>AVAILABLE SCENARIOS</Typography>
                {selectedScenarios.length > 0 && <Box sx={{ px: .9, py: .25, borderRadius: "9px", background: theme.lightBlue, color: theme.blue2, fontSize: 9.5, fontWeight: 700 }}>{selectedScenarios.length} SELECTED</Box>}
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.6 }}>
                <FormControlLabel
                  sx={{ m: 0, "& .MuiFormControlLabel-label": { fontSize: 10.5, fontWeight: 600, color: theme.navy } }}
                  control={<Checkbox size="small" checked={scenarioOptions.length > 0 && selectedScenarios.length === scenarioOptions.length} indeterminate={selectedScenarios.length > 0 && selectedScenarios.length < scenarioOptions.length} onChange={e => setSelectedScenarios(e.target.checked ? scenarioOptions : [])} sx={{ p: .25, mr: .35, color: "#9BAABD", "&.Mui-checked": { color: theme.blue } }} />}
                  label="Select All"
                />
                <Typography onClick={() => setSelectedScenarios([])} sx={{ cursor: selectedScenarios.length ? "pointer" : "default", color: selectedScenarios.length ? theme.blue2 : "#B4BFCD", fontSize: 10.5, fontWeight: 600 }}>Deselect All</Typography>
                <Typography sx={{ color: theme.muted, fontSize: 10.5 }}>{selectedScenarios.length} / {scenarioOptions.length} Selected</Typography>
              </Box>
            </Box>

            {scenarioOptions.length > 0 ? (
              <Box sx={{ p: 1.3 }}>
                <TextField
                  fullWidth size="small" value={scenarioSearch} onChange={e => setScenarioSearch(e.target.value)} placeholder="Search scenarios..."
                  InputProps={{ startAdornment: <SearchIcon sx={{ color: "#9AA9BA", fontSize: 19, mr: .8 }} /> }}
                  sx={{ mb: 1, "& .MuiOutlinedInput-root": { height: 36, borderRadius: "5px", fontSize: 11, background: "#FFF", "& fieldset": { borderColor: theme.border } } }}
                />
                <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2,minmax(0,1fr))", lg: "repeat(4,minmax(0,1fr))" }, columnGap: 1.3, rowGap: .35 }}>
                  {scenarioOptions.filter(o => labelOf(o).toLowerCase().includes(scenarioSearch.trim().toLowerCase())).map(option => {
                    const v = String(valueOf(option));
                    const checked = selectedScenarios.some(s => String(valueOf(s)) === v);
                    return <FormControlLabel key={v} sx={{ m: 0, minWidth: 0, "& .MuiFormControlLabel-label": { fontSize: 9.2, color: theme.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" } }} control={<Checkbox size="small" checked={checked} onChange={() => toggleArrayValue(setSelectedScenarios, selectedScenarios, option)} sx={{ p: .25, mr: .25, color: "#A7B6C8", "&.Mui-checked": { color: theme.blue } }} />} label={labelOf(option)} />;
                  })}
                </Box>
                {scenarioOptions.filter(o => labelOf(o).toLowerCase().includes(scenarioSearch.trim().toLowerCase())).length === 0 && <Typography sx={{ py: 2, textAlign: "center", color: theme.muted, fontSize: 11 }}>No scenarios match your search.</Typography>}
              </Box>
            ) : (
              <Box sx={{ minHeight: 180, display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", px: 2 }}>
                <Box sx={{ animation: "fadeUp .35s ease both" }}>
                  <Box sx={{ position: "relative", width: 70, height: 70, mx: "auto", mb: .6 }}>
                    <MemoryIcon sx={{ position: "absolute", left: 10, top: 9, fontSize: 42, color: "#7EA9E9" }} />
                    <SearchIcon sx={{ position: "absolute", right: 2, bottom: 2, fontSize: 29, color: "#5E8FD8" }} />
                  </Box>
                  <Typography sx={{ color: theme.navy, fontSize: 13, fontWeight: 700 }}>No scenarios selected yet</Typography>
                  <Typography sx={{ mt: .4, color: theme.muted, fontSize: 10.5 }}>Select one or more scenarios to view performance details.</Typography>
                </Box>
              </Box>
            )}
          </Paper>

          {/* TABLE INFORMATION */}
          <Paper elevation={0} sx={{ mb: 1.2, border: `1px solid ${theme.border}`, borderRadius: "7px", background: "#FFF", overflow: "hidden", boxShadow: "0 2px 8px rgba(7,27,60,.04)" }}>
            <Box sx={{ px: 1.7, py: 1.2, display: "flex", alignItems: "center", gap: .8, borderBottom: `1px solid ${theme.border}`, background: "#FBFCFE" }}>
              <TableChartIcon sx={{ color: theme.green, fontSize: 20 }} />
              <Typography sx={{ color: theme.navy, fontSize: 13.5, fontWeight: 700 }}>TABLE INFORMATION</Typography>
            </Box>
            {loadingResults ? (
              <Box sx={{ minHeight: 210, display: "flex", alignItems: "center", justifyContent: "center" }}><CircularProgress size={27} sx={{ color: theme.blue }} /></Box>
            ) : tableRows.length > 0 ? (
              <Box sx={{ p: 1.2, overflowX: "auto" }}>
                <Box component="table" sx={{ width: "100%", minWidth: 720, borderCollapse: "collapse", tableLayout: "fixed", fontSize: 10.5 }}>
                  <Box component="thead">
                    <Box component="tr">
                      {tableColumns.map((col, i) => <Box component="th" key={col} sx={{ border: `1px solid ${theme.border}`, background: "#F7F9FC", color: theme.navy, p: .7, fontWeight: 700, textAlign: i === 0 ? "left" : "center" }}>{col}</Box>)}
                    </Box>
                  </Box>
                  <Box component="tbody">
                    {tableRows.map((row, ri) => <Box component="tr" key={ri} sx={{ "&:hover": { background: "#F9FCFF" } }}>{tableColumns.map((col, ci) => <Box component="td" key={col} sx={{ border: `1px solid ${theme.border}`, p: .7, color: theme.text, fontWeight: ci === 0 ? 600 : 500, textAlign: ci === 0 ? "left" : "center" }}>{row[col] ?? "-"}</Box>)}</Box>)}
                  </Box>
                </Box>
              </Box>
            ) : (
              <Box sx={{ minHeight: 205, display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", px: 2 }}>
                <Box sx={{ animation: "fadeUp .35s ease both" }}>
                  <TableChartIcon sx={{ fontSize: 47, color: "#6BB992", mb: .5 }} />
                  <Typography sx={{ color: theme.navy, fontSize: 13, fontWeight: 700 }}>No data to display</Typography>
                  <Typography sx={{ mt: .4, color: theme.muted, fontSize: 10.5 }}>Please select scenarios and apply filters to view table information.</Typography>
                </Box>
              </Box>
            )}
          </Paper>

          {/* GRAPH INFORMATION */}
          <Paper elevation={0} sx={{ mb: 1.2, border: `1px solid ${theme.border}`, borderRadius: "7px", background: "#FFF", overflow: "hidden", boxShadow: "0 2px 8px rgba(7,27,60,.04)" }}>
            <Box sx={{ px: 1.7, py: 1.2, display: "flex", alignItems: "center", gap: .8, borderBottom: `1px solid ${theme.border}`, background: "#FBFCFE" }}>
              <ShowChartIcon sx={{ color: theme.blue, fontSize: 21 }} />
              <Typography sx={{ color: theme.navy, fontSize: 13.5, fontWeight: 700 }}>GRAPH INFORMATION</Typography>
            </Box>
            {graphData.length > 0 ? (
              <Box sx={{ p: 1.2 }}>
                {/* LEGEND / DATA LABELS */}
                <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2,minmax(0,1fr))", lg: `repeat(${Math.min(graphData.length,5)},minmax(0,1fr))` }, gap: .8, mb: 1 }}>
                  {graphData.map((series, si) => <Box key={series.name + si} sx={{ display: "flex", gap: .6, minWidth: 0, alignItems: "flex-start" }}>
                    <Box sx={{ width: 11, height: 11, mt: .25, flexShrink: 0, background: si % 5 === 0 ? "#2D78E5" : si % 5 === 1 ? "#45A99A" : si % 5 === 2 ? "#F28C18" : si % 5 === 3 ? "#7650B8" : "#2499A4", borderRadius: "1px" }} />
                    <Box sx={{ minWidth: 0 }}><Typography sx={{ fontSize: 9.5, fontWeight: 700, color: theme.navy, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{series.name}</Typography><Typography sx={{ mt: .15, fontSize: 8.2, color: theme.muted, lineHeight: 1.45 }}>{series.values.map(v => Number(v).toLocaleString(undefined,{maximumFractionDigits:1})).join(" / ")}</Typography></Box>
                  </Box>)}
                </Box>

                <Box sx={{ position: "relative", height: 300, overflowX: "auto", border: `1px solid ${theme.border}`, background: "linear-gradient(to top,#F7FBFF,#FFF)" }}>
                  <Box sx={{ position: "absolute", left: 48, right: 12, top: 16, bottom: 42, display: "flex", flexDirection: "column", justifyContent: "space-between", pointerEvents: "none" }}>
                    {[0, .25, .5, .75, 1].map((p,i) => <Box key={i} sx={{ borderTop: "1px dashed #E5ECF5", width: "100%" }} />)}
                  </Box>
                  <Box sx={{ position: "absolute", left: 6, top: 18, bottom: 43, width: 38, display: "flex", flexDirection: "column", justifyContent: "space-between", alignItems: "flex-end" }}>
                    {[1,.75,.5,.25,0].map((p,i) => <Typography key={i} sx={{ fontSize: 8, color: theme.muted }}>{Math.round(maxGraphValue*p).toLocaleString()}</Typography>)}
                  </Box>
                  <Box sx={{ position: "absolute", left: 48, right: 12, top: 16, bottom: 42, display: "flex", alignItems: "flex-end", justifyContent: "space-around", gap: 2, minWidth: Math.max(850, graphData.length * 150) }}>
                    {tableColumns.slice(1).map((metric, mi) => <Box key={metric} sx={{ flex: 1, height: "100%", minWidth: 120, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
                      <Box sx={{ flex: 1, display: "flex", alignItems: "flex-end", justifyContent: "center", gap: .9 }}>
                        {graphData.map((series, si) => {
                          const value = Number(series.values[mi]) || 0;
                          const h = Math.max((value / maxGraphValue) * 100, 2);
                          const c = si % 5 === 0 ? "#2D78E5" : si % 5 === 1 ? "#45A99A" : si % 5 === 2 ? "#F28C18" : si % 5 === 3 ? "#7650B8" : "#2499A4";
                          return <Box key={si} sx={{ width: 24, height: `${h}%`, minHeight: 5, position: "relative", transformOrigin: "bottom", animation: "barGrow .55s ease both", animationDelay: `${si*55}ms`, background: `linear-gradient(180deg,${c},${c}CC)`, borderRadius: "2px 2px 0 0", boxShadow: `5px 5px 0 ${c}22`, "&:before": { content:'""', position:"absolute", left:0, top:0, width:"100%", height:7, background:`linear-gradient(90deg,${c},#FFFFFF88)`, transform:"skewX(-45deg)", transformOrigin:"left bottom" }, "&:after": { content:'""', position:"absolute", top:2, right:-5, width:5, height:"calc(100% - 2px)", background:`${c}B8`, transform:"skewY(-45deg)", transformOrigin:"left top" } }}>
                            <Typography sx={{ position:"absolute", left:"50%", transform:"translateX(-50%)", top:-17, fontSize:7.8, fontWeight:700, color:theme.text, whiteSpace:"nowrap" }}>{value.toLocaleString(undefined,{maximumFractionDigits:1})}</Typography>
                          </Box>;
                        })}
                      </Box>
                      <Typography sx={{ mt: .8, textAlign:"center", fontSize:8.5, fontWeight:700, color:theme.navy, whiteSpace:"nowrap" }}>{metric}</Typography>
                    </Box>)}
                  </Box>
                  <Typography sx={{ position:"absolute", left:5, top:"50%", transform:"rotate(-90deg) translateX(-50%)", transformOrigin:"left top", fontSize:8.5, fontWeight:700, color:theme.navy }}>PERFORMANCE</Typography>
                </Box>
              </Box>
            ) : (
              <Box sx={{ minHeight: 205, display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", px: 2 }}>
                <Box sx={{ animation: "fadeUp .35s ease both" }}>
                  <ShowChartIcon sx={{ fontSize: 50, color: "#5F91DE", mb: .5 }} />
                  <Typography sx={{ color: theme.navy, fontSize: 13, fontWeight: 700 }}>No data to display</Typography>
                  <Typography sx={{ mt: .4, color: theme.muted, fontSize: 10.5 }}>Please select scenarios and apply filters to view graph information.</Typography>
                </Box>
              </Box>
            )}
          </Paper>
        </Box>
      </Box>

      {/* FIXED FOOTER */}
      <Box
        component="footer"
        sx={{
          height: 68, minHeight: 68, flexShrink: 0, background: "linear-gradient(135deg,#062C68 0%,#071B3C 100%)",
          borderTop: "2px solid #0A6EDB", color: "#FFF", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", px: 2, zIndex: 20,
        }}
      >
        <Typography sx={{ fontSize: 10.5, color: "#FFF", fontWeight: 500 }}>◉ &nbsp; Maintained By: <Box component="span" sx={{ color: "#55A8FF", fontWeight: 700 }}>CT DON AND TS IP - KIC Bangalore</Box></Typography>
        <Box sx={{ width: 520, maxWidth: "70%", borderTop: "1px solid rgba(255,255,255,.18)", my: .7 }} />
        <Typography sx={{ fontSize: 9.5, color: "#FFF" }}>© 2025 Software India Pvt Ltd. All Rights Reserved. <Box component="span" sx={{ mx: 1, color: "rgba(255,255,255,.5)" }}>|</Box> For recipients eyes only.</Typography>
      </Box>
    </Box>
  );
}
