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
  ListSubheader,
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
          <ListSubheader
            component="div"
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
          </ListSubheader>

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
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
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
          position: "relative",
          zIndex: 1200,
          height: { xs: 58, sm: 66 },
          minHeight: { xs: 58, sm: 66 },
          flexShrink: 0,
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
          pt: { xs: 2.2, sm: 2.6 },
          pb: { xs: 1.4, sm: 1.8 },
          flexShrink: 0,
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
          alignItems: "stretch",
          gap: 2,
          px: { xs: 1.5, sm: 3, md: 4 },
          pb: 1.5,
          flex: 1,
          minHeight: 0,
          position: "relative",
        }}
      >
        {/* ====================================================
            FILTER SIDEBAR
            ==================================================== */}
        <Box
          sx={{
            width: { xs: sidebarOpen ? "100%" : 0, md: sidebarOpen ? 300 : 0 },
            minWidth: { xs: 0, md: sidebarOpen ? 300 : 0 },
            height: "100%",
            overflowY: "auto",
            overflowX: "hidden",
            flexShrink: 0,
            position: { xs: "absolute", md: "relative" },
            left: { xs: 0, md: "auto" },
            top: { xs: 0, md: "auto" },
            zIndex: { xs: 1100, md: "auto" },
            background: "#FFFFFF",
            border: `1px solid ${theme.border}`,
            borderRadius: "7px",
            boxShadow: "0 3px 12px rgba(7,27,60,0.07)",
            transition: "width 0.22s ease",
            display: { xs: sidebarOpen ? "block" : "none", md: "block" },
            scrollbarWidth: "thin",
            "&::-webkit-scrollbar": { width: 7 },
            "&::-webkit-scrollbar-thumb": {
              background: "#C4D2E3",
              borderRadius: 10,
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
              position: "sticky",
              top: 0,
              zIndex: 4,
            }}
          >
            <Box>
              <Typography sx={{ fontFamily: "Manrope, sans-serif", fontSize: 15, fontWeight: 700, color: theme.navy }}>
                PERFORMANCE FILTERS
              </Typography>
              <Typography sx={{ fontFamily: "Manrope, sans-serif", fontSize: 10.5, color: theme.muted, mt: 0.2 }}>
                Select configuration and scenarios
              </Typography>
            </Box>
            <IconButton
              size="small"
              onClick={() => setSidebarOpen(false)}
              sx={{ display: { xs: "inline-flex", md: "none" }, color: theme.muted }}
            >
              <CloseIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Box>

          <Box sx={{ px: 1.8, pb: 2 }}>
            {renderSectionHeader(
              "BENCHMARK & DEVICE GEN",
              <SpeedIcon sx={{ fontSize: 18, color: theme.blue }} />,
              "benchmark"
            )}

            {expandedSections.benchmark && (
              <Box sx={{ pt: 1.5 }}>
                {renderSingleSelect({
                  label: "Benchmark",
                  value: benchmark,
                  setter: (value) => {
                    setBenchmark(value);
                    setApplyRequest(0);
                  },
                  options: benchmarkOptions,
                  placeholder: loadingFilters ? "Loading..." : "Select benchmark",
                })}

                {renderMultiSelect({
                  label: "Benchmark Version",
                  values: selectedVersions,
                  setter: (value) => {
                    setSelectedVersions(value);
                    setApplyRequest(0);
                  },
                  options: versionOptions,
                  disabled: !benchmark || loadingVersions,
                  placeholder: loadingVersions ? "Loading versions..." : "Select version(s)",
                })}

                {renderMultiSelect({
                  label: "UFS Version",
                  values: selectedUfsVersions,
                  setter: (value) => {
                    setSelectedUfsVersions(value);
                    setApplyRequest(0);
                  },
                  options: ufsVersionOptions,
                  disabled: selectedVersions.length === 0 || loadingUfsVersions,
                  placeholder: loadingUfsVersions ? "Loading UFS versions..." : "Select UFS version(s)",
                })}
              </Box>
            )}

            {renderSectionHeader(
              "ADDITIONAL CONFIGURATION",
              <DeveloperBoardIcon sx={{ fontSize: 18, color: theme.blue }} />,
              "device",
              !(benchmark && selectedVersions.length > 0 && selectedUfsVersions.length > 0)
            )}

            {expandedSections.device && benchmark && selectedVersions.length > 0 && selectedUfsVersions.length > 0 && (
              <Box sx={{ pt: 1.5 }}>
                {renderMultiSelect({
                  label: "Capacity",
                  values: selectedCapacity,
                  setter: (value) => { setSelectedCapacity(value); setApplyRequest(0); },
                  options: capacityOptions,
                  disabled: capacityOptions.length === 0,
                })}
                {renderMultiSelect({
                  label: "NAND Cell Type",
                  values: selectedNand,
                  setter: (value) => { setSelectedNand(value); setApplyRequest(0); },
                  options: nandOptions,
                  disabled: nandOptions.length === 0,
                })}
                {renderMultiSelect({
                  label: "SoC Vendor",
                  values: selectedSocVendor,
                  setter: (value) => { setSelectedSocVendor(value); setApplyRequest(0); },
                  options: socVendorOptions,
                  disabled: socVendorOptions.length === 0,
                })}
                {renderMultiSelect({
                  label: "SoC Model",
                  values: selectedSocModel,
                  setter: (value) => { setSelectedSocModel(value); setApplyRequest(0); },
                  options: socModelOptions,
                  disabled: socModelOptions.length === 0,
                })}
                {renderMultiSelect({
                  label: "HCI Version",
                  values: selectedHciVersions,
                  setter: (value) => { setSelectedHciVersions(value); setApplyRequest(0); },
                  options: hciVersionOptions,
                  disabled: hciVersionOptions.length === 0,
                })}
              </Box>
            )}

            {renderSectionHeader(
              "STORAGE",
              <StorageIcon sx={{ fontSize: 18, color: theme.blue }} />,
              "storage",
              !(benchmark && selectedVersions.length > 0 && selectedUfsVersions.length > 0)
            )}

            {expandedSections.storage && benchmark && selectedVersions.length > 0 && selectedUfsVersions.length > 0 && (
              <Box sx={{ pt: 1.5 }}>
                {renderMultiSelect({
                  label: "WriteBooster",
                  values: selectedWriteBooster,
                  setter: (value) => { setSelectedWriteBooster(value); setApplyRequest(0); },
                  options: writeBoosterOptions,
                  disabled: writeBoosterOptions.length === 0,
                })}
              </Box>
            )}

            {renderSectionHeader(
              "SOFTWARE / SECURITY",
              <SecurityIcon sx={{ fontSize: 18, color: theme.blue }} />,
              "software",
              !(benchmark && selectedVersions.length > 0 && selectedUfsVersions.length > 0)
            )}

            {expandedSections.software && benchmark && selectedVersions.length > 0 && selectedUfsVersions.length > 0 && (
              <Box sx={{ pt: 1.5 }}>
                {renderMultiSelect({
                  label: "File System",
                  values: selectedFileSystem,
                  setter: (value) => { setSelectedFileSystem(value); setApplyRequest(0); },
                  options: fileSystemOptions,
                  disabled: fileSystemOptions.length === 0,
                })}
                {renderMultiSelect({
                  label: "Encryption",
                  values: selectedEncryption,
                  setter: (value) => { setSelectedEncryption(value); setApplyRequest(0); },
                  options: encryptionOptions,
                  disabled: encryptionOptions.length === 0,
                })}
              </Box>
            )}

            <Button
              fullWidth
              variant="contained"
              startIcon={<SendIcon sx={{ fontSize: 16 }} />}
              disabled={selectedScenarios.length < 2 || loadingResults}
              onClick={() => {
                setError("");
                setApplyRequest((value) => value + 1);
              }}
              sx={{
                mt: 2,
                height: 39,
                borderRadius: "5px",
                textTransform: "none",
                fontFamily: "Manrope, sans-serif",
                fontSize: 12,
                fontWeight: 700,
                background: theme.blue2,
                color: "#FFFFFF",
                boxShadow: "none",
                "&:hover": { background: theme.blue, boxShadow: "none" },
                "&.Mui-disabled": { background: "#DCE5F2", color: "#9AA8B9" },
              }}
            >
              Apply Filters
            </Button>

            <Button
              fullWidth
              variant="outlined"
              startIcon={<RefreshIcon sx={{ fontSize: 16 }} />}
              onClick={resetFilters}
              sx={{
                mt: 1,
                height: 38,
                borderRadius: "5px",
                textTransform: "none",
                fontFamily: "Manrope, sans-serif",
                fontSize: 12,
                fontWeight: 600,
                color: theme.blue2,
                borderColor: "#BFD2E8",
                "&:hover": { borderColor: theme.blue, background: theme.lightBlue },
              }}
            >
              Reset Filters
            </Button>
          </Box>
        </Box>

        {/* ====================================================
            RESULTS AREA - ONE SHARED VERTICAL SCROLL
            ==================================================== */}
        <Box
          sx={{
            flex: 1,
            minWidth: 0,
            height: "100%",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <Button
            startIcon={<MenuIcon />}
            onClick={() => setSidebarOpen(true)}
            sx={{
              display: { xs: "inline-flex", md: "none" },
              mb: 1,
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

          <Box
            sx={{
              height: "100%",
              overflowY: "auto",
              overflowX: "hidden",
              pr: { xs: 0, md: 0.5 },
              scrollbarWidth: "thin",
              scrollbarColor: "#AFC0D5 transparent",
              "&::-webkit-scrollbar": { width: 9 },
              "&::-webkit-scrollbar-track": { background: "transparent" },
              "&::-webkit-scrollbar-thumb": {
                background: "#AFC0D5",
                borderRadius: 10,
                border: "2px solid transparent",
                backgroundClip: "padding-box",
              },
              "&::-webkit-scrollbar-thumb:hover": { background: "#7F96B1" },
            }}
          >
            {error && (
              <Paper
                elevation={0}
                sx={{
                  mb: 1.5,
                  px: 1.8,
                  py: 1.2,
                  borderRadius: "6px",
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

            {/* AVAILABLE SCENARIOS */}
            <Paper
              elevation={0}
              sx={{
                borderRadius: "7px",
                border: `1px solid ${theme.border}`,
                background: "#FFFFFF",
                boxShadow: "0 2px 9px rgba(7,27,60,0.05)",
                mb: 1.5,
                overflow: "hidden",
              }}
            >
              <Box
                sx={{
                  px: { xs: 1.5, sm: 2 },
                  py: 1.35,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 1,
                  borderBottom: `1px solid ${theme.border}`,
                  background: "#FBFCFE",
                  flexWrap: "wrap",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <MemoryIcon sx={{ color: theme.blue, fontSize: 19 }} />
                  <Typography sx={{ fontFamily: "Manrope, sans-serif", fontSize: 14, fontWeight: 700, color: theme.navy }}>
                    AVAILABLE SCENARIOS
                  </Typography>
                  {selectedScenarios.length > 0 && (
                    <Box
                      sx={{
                        px: 1,
                        py: 0.35,
                        borderRadius: "10px",
                        background: theme.lightBlue,
                        color: theme.blue2,
                        fontFamily: "Manrope, sans-serif",
                        fontSize: 9.5,
                        fontWeight: 700,
                      }}
                    >
                      {selectedScenarios.length} SELECTED
                    </Box>
                  )}
                </Box>

                <Box sx={{ display: "flex", alignItems: "center", gap: 1.4 }}>
                  <Typography
                    onClick={() => { setSelectedScenarios(scenarioOptions); setApplyRequest(0); }}
                    sx={{
                      cursor: scenarioOptions.length ? "pointer" : "default",
                      fontFamily: "Manrope, sans-serif",
                      fontSize: 11.5,
                      fontWeight: 700,
                      color: scenarioOptions.length ? theme.blue2 : "#AAB6C5",
                    }}
                  >
                    Select All
                  </Typography>
                  <Typography
                    onClick={() => { setSelectedScenarios([]); setApplyRequest(0); }}
                    sx={{
                      cursor: selectedScenarios.length ? "pointer" : "default",
                      fontFamily: "Manrope, sans-serif",
                      fontSize: 9.5,
                      fontWeight: 600,
                      color: selectedScenarios.length ? theme.muted : "#AAB6C5",
                    }}
                  >
                    Deselect All
                  </Typography>
                </Box>
              </Box>

              {scenarioOptions.length > 0 ? (
                <Box sx={{ p: { xs: 1.2, sm: 1.6 } }}>
                  <TextField
                    fullWidth
                    size="small"
                    value={scenarioSearch}
                    onChange={(event) => setScenarioSearch(event.target.value)}
                    placeholder="Search scenarios..."
                    InputProps={{
                      startAdornment: <MemoryIcon sx={{ mr: 0.8, fontSize: 17, color: "#9AA8B9" }} />,
                    }}
                    sx={{
                      mb: 1.2,
                      "& .MuiOutlinedInput-root": {
                        height: 38,
                        borderRadius: "5px",
                        fontFamily: "Manrope, sans-serif",
                        fontSize: 11.5,
                      },
                      "& .MuiOutlinedInput-notchedOutline": { borderColor: theme.border },
                      "& .Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: theme.blue },
                    }}
                  />

                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" },
                      columnGap: 2,
                      rowGap: 0.15,
                    }}
                  >
                    {scenarioOptions
                      .filter((scenario) =>
                        labelOf(scenario).toLowerCase().includes(scenarioSearch.toLowerCase())
                      )
                      .map((scenario) => {
                        const scenarioValue = String(valueOf(scenario));
                        const checked = selectedScenarios.some(
                          (item) => String(valueOf(item)) === scenarioValue
                        );

                        return (
                          <FormControlLabel
                            key={scenarioValue}
                            sx={{ m: 0, minWidth: 0, alignItems: "flex-start" }}
                            control={
                              <Checkbox
                                size="small"
                                checked={checked}
                                onChange={() => {
                                  toggleArrayValue(setSelectedScenarios, selectedScenarios, scenario);
                                  setApplyRequest(0);
                                }}
                                sx={{
                                  p: 0.45,
                                  mr: 0.55,
                                  color: "#B7C7DC",
                                  "&.Mui-checked": { color: theme.blue },
                                }}
                              />
                            }
                            label={
                              <Typography
                                sx={{
                                  pt: 0.35,
                                  fontFamily: "Manrope, sans-serif",
                                  fontSize: 10.8,
                                  lineHeight: 1.35,
                                  color: theme.text,
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                }}
                                title={labelOf(scenario)}
                              >
                                {labelOf(scenario)}
                              </Typography>
                            }
                          />
                        );
                      })}
                  </Box>
                </Box>
              ) : (
                <Box sx={{ minHeight: 125, display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", px: 2 }}>
                  <Box>
                    <MemoryIcon sx={{ fontSize: 31, color: "#B8C8DA", mb: 0.7 }} />
                    <Typography sx={{ fontFamily: "Manrope, sans-serif", fontSize: 12, fontWeight: 600, color: theme.muted }}>
                      No scenarios available
                    </Typography>
                    <Typography sx={{ mt: 0.35, fontFamily: "Manrope, sans-serif", fontSize: 10.5, color: "#98A2B3" }}>
                      Select the configuration filters to load available scenarios.
                    </Typography>
                  </Box>
                </Box>
              )}
            </Paper>

            {/* TABLE INFORMATION */}
            <Paper
              elevation={0}
              sx={{
                borderRadius: "7px",
                border: `1px solid ${theme.border}`,
                background: "#FFFFFF",
                overflow: "hidden",
                mb: 1.5,
                boxShadow: "0 2px 9px rgba(7,27,60,0.05)",
              }}
            >
              <Box sx={{ px: { xs: 1.5, sm: 2 }, py: 1.35, display: "flex", alignItems: "center", gap: 1, borderBottom: `1px solid ${theme.border}`, background: "#FBFCFE" }}>
                <TableChartIcon sx={{ color: theme.blue, fontSize: 19 }} />
                <Typography sx={{ fontFamily: "Manrope, sans-serif", fontSize: 14, fontWeight: 700, color: theme.navy }}>
                  TABLE INFORMATION
                </Typography>
              </Box>

              {loadingResults ? (
                <Box sx={{ minHeight: 180, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                  <CircularProgress size={30} thickness={3} sx={{ color: theme.blue }} />
                  <Typography sx={{ mt: 1.3, fontFamily: "Manrope, sans-serif", fontSize: 11.5, color: theme.muted }}>
                    Loading performance results...
                  </Typography>
                </Box>
              ) : tableColumns.length > 0 && tableRows.length > 0 ? (
                <Box sx={{ width: "100%", overflowX: "auto" }}>
                  <Box
                    component="table"
                    sx={{
                      width: "100%",
                      minWidth: 620,
                      borderCollapse: "separate",
                      borderSpacing: 0,
                      fontFamily: "Manrope, sans-serif",
                      "& th": {
                        background: `linear-gradient(135deg, ${theme.blue} 0%, ${theme.blue2} 100%)`,
                        color: "#FFFFFF",
                        padding: "11px 13px",
                        textAlign: "left",
                        fontSize: 11,
                        fontWeight: 700,
                        whiteSpace: "nowrap",
                        borderRight: "1px solid rgba(255,255,255,0.2)",
                      },
                      "& td": {
                        padding: "10px 13px",
                        fontSize: 11,
                        color: theme.text,
                        borderBottom: `1px solid ${theme.border}`,
                        borderRight: `1px solid ${theme.border}`,
                        background: "#FFFFFF",
                      },
                      "& tbody tr:hover td": { background: "#F7FBFF" },
                      "& tbody tr:last-child td": { borderBottom: 0 },
                    }}
                  >
                    <thead>
                      <tr>
                        {tableColumns.map((column) => <th key={column}>{column}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {tableRows.map((row, rowIndex) => (
                        <tr key={rowIndex}>
                          {tableColumns.map((column) => {
                            const value = row?.[column];
                            return (
                              <td key={column}>
                                {typeof value === "number" ? value.toLocaleString(undefined, { maximumFractionDigits: 2 }) : value ?? "-"}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </Box>
                </Box>
              ) : (
                <Box sx={{ minHeight: 155, display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", px: 2 }}>
                  <Box>
                    <TableChartIcon sx={{ fontSize: 32, color: "#B8C8DA", mb: 0.7 }} />
                    <Typography sx={{ fontFamily: "Manrope, sans-serif", fontSize: 12, fontWeight: 600, color: theme.muted }}>
                      No table data available
                    </Typography>
                    <Typography sx={{ mt: 0.35, fontFamily: "Manrope, sans-serif", fontSize: 10.5, color: "#98A2B3" }}>
                      Select at least two scenarios and click Apply Filters.
                    </Typography>
                  </Box>
                </Box>
              )}
            </Paper>

            {/* GRAPH INFORMATION */}
            <Paper
              elevation={0}
              sx={{
                borderRadius: "7px",
                border: `1px solid ${theme.border}`,
                background: "#FFFFFF",
                overflow: "hidden",
                mb: 1.5,
                boxShadow: "0 2px 9px rgba(7,27,60,0.05)",
              }}
            >
              <Box sx={{ px: { xs: 1.5, sm: 2 }, py: 1.35, display: "flex", alignItems: "center", gap: 1, borderBottom: `1px solid ${theme.border}`, background: "#FBFCFE" }}>
                <ShowChartIcon sx={{ color: "#45A99A", fontSize: 19 }} />
                <Typography sx={{ fontFamily: "Manrope, sans-serif", fontSize: 14, fontWeight: 700, color: theme.navy }}>
                  GRAPH INFORMATION
                </Typography>
              </Box>

              {graphData.length > 0 ? (
                <Box sx={{ p: { xs: 1.5, sm: 2.2 } }}>
                  {/* Legend with explicit scenario labels */}
                  <Box
                    sx={{
                      mb: 2,
                      p: 1.2,
                      borderRadius: "6px",
                      background: "#F8FBFF",
                      border: `1px solid ${theme.border}`,
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 1.2,
                    }}
                  >
                    {graphData.map((series, index) => (
                      <Box key={index} sx={{ display: "flex", alignItems: "center", gap: 0.65, minWidth: { xs: "100%", sm: "auto" } }}>
                        <Box sx={{ width: 10, height: 10, borderRadius: "2px", background: index % 2 === 0 ? theme.blue : "#45A99A" }} />
                        <Typography sx={{ fontFamily: "Manrope, sans-serif", fontSize: 10.5, fontWeight: 700, color: theme.text }}>
                          {labelOf(series.name) || `Scenario ${index + 1}`}
                        </Typography>
                      </Box>
                    ))}
                  </Box>

                  <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "repeat(2, 1fr)" }, gap: 2 }}>
                    {graphData.map((series, seriesIndex) => (
                      <Box key={seriesIndex} sx={{ border: `1px solid ${theme.border}`, borderRadius: "6px", p: 1.3, background: "#FCFDFF" }}>
                        <Typography sx={{ mb: 1.1, fontFamily: "Manrope, sans-serif", fontSize: 11.5, fontWeight: 700, color: theme.navy }}>
                          {labelOf(series.name) || `Scenario ${seriesIndex + 1}`}
                        </Typography>

                        <Box
                          sx={{
                            minHeight: 260,
                            display: "flex",
                            alignItems: "flex-end",
                            gap: { xs: 1, sm: 1.8 },
                            px: { xs: 0.8, sm: 1.5 },
                            pt: 3,
                            pb: 3.5,
                            borderLeft: `1px solid ${theme.border}`,
                            borderBottom: `1px solid ${theme.border}`,
                            background: "linear-gradient(to top, #F7FBFF 0%, #FFFFFF 100%)",
                            position: "relative",
                            overflowX: "auto",
                          }}
                        >
                          {[25, 50, 75].map((line) => (
                            <Box key={line} sx={{ position: "absolute", left: 0, right: 0, top: `${100-line}%`, borderTop: "1px dashed #E8EEF6" }} />
                          ))}

                          {(series.values || []).map((rawValue, index) => {
                            const numericValue = Number(rawValue) || 0;
                            const height = (numericValue / maxGraphValue) * 100;
                            const barColor = index % 2 === 0 ? theme.blue : "#45A99A";
                            return (
                              <Box
                                key={index}
                                sx={{
                                  width: { xs: 34, sm: 46 },
                                  minWidth: { xs: 34, sm: 46 },
                                  height: 205,
                                  display: "flex",
                                  flexDirection: "column",
                                  justifyContent: "flex-end",
                                  alignItems: "center",
                                  position: "relative",
                                  zIndex: 2,
                                }}
                              >
                                <Typography sx={{ mb: 0.6, fontFamily: "Manrope, sans-serif", fontSize: 8.8, fontWeight: 700, color: theme.text, whiteSpace: "nowrap" }}>
                                  {numericValue.toLocaleString(undefined, { maximumFractionDigits: 1 })}
                                </Typography>

                                <Box
                                  sx={{
                                    width: "72%",
                                    height: `${Math.max(height, 2)}%`,
                                    minHeight: 5,
                                    position: "relative",
                                    borderRadius: "3px 3px 0 0",
                                    background: `linear-gradient(180deg, ${barColor} 0%, ${barColor}CC 70%, ${barColor}99 100%)`,
                                    boxShadow: `5px 5px 0 ${barColor}33, 0 7px 14px ${barColor}22`,
                                    transform: "skewY(0deg)",
                                    animation: "barGrow 0.65s cubic-bezier(.2,.8,.2,1) both",
                                    animationDelay: `${index * 60}ms`,
                                    "&:before": {
                                      content: '""',
                                      position: "absolute",
                                      left: 0,
                                      top: 0,
                                      width: "100%",
                                      height: 7,
                                      background: `linear-gradient(90deg, ${barColor}DD, #FFFFFF88)`,
                                      transform: "skewX(-45deg)",
                                      transformOrigin: "left bottom",
                                      borderRadius: "2px 2px 0 0",
                                    },
                                    "&:after": {
                                      content: '""',
                                      position: "absolute",
                                      top: 2,
                                      right: -6,
                                      width: 6,
                                      height: "calc(100% - 2px)",
                                      background: `${barColor}B8`,
                                      transform: "skewY(-45deg)",
                                      transformOrigin: "left top",
                                      borderRadius: "0 2px 0 0",
                                    },
                                  }}
                                />

                                <Typography sx={{ position: "absolute", bottom: -24, fontFamily: "Manrope, sans-serif", fontSize: 8.2, color: theme.muted, whiteSpace: "nowrap" }}>
                                  {tableRows[index]?.[tableColumns[0]] || `Metric ${index + 1}`}
                                </Typography>
                              </Box>
                            );
                          })}
                        </Box>
                      </Box>
                    ))}
                  </Box>
                </Box>
              ) : (
                <Box sx={{ minHeight: 180, display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", px: 2 }}>
                  <Box>
                    <ShowChartIcon sx={{ fontSize: 34, color: "#B8C8DA", mb: 0.7 }} />
                    <Typography sx={{ fontFamily: "Manrope, sans-serif", fontSize: 12, fontWeight: 600, color: theme.muted }}>
                      No graph data available
                    </Typography>
                    <Typography sx={{ mt: 0.35, fontFamily: "Manrope, sans-serif", fontSize: 10.5, color: "#98A2B3" }}>
                      Results will appear here after Apply Filters.
                    </Typography>
                  </Box>
                </Box>
              )}
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
          height: { xs: 62, sm: 70 },
          flexShrink: 0,
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
