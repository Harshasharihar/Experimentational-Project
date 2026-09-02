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
import FolderIcon from "@mui/icons-material/Folder";
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
  No MultiSelectDropDown component and no separate child component
  are required.

  Backend endpoints expected:
    GET  /performance/filters
    GET  /performance/versions?benchmark=<benchmark>
    GET  /performance/ufs-versions?benchmark=<benchmark>&versions=<v1>&versions=<v2>
    POST /performance/results

  Expected results response:
  {
    "table": {
      "columns": ["Access Pattern", "Scenario 1", "Scenario 2"],
      "rows": [
        {
          "Access Pattern": "Sequential Read",
          "Scenario 1": 4777.9,
          "Scenario 2": 4797.9
        }
      ]
    },
    "graph": [
      {
        "name": "Scenario 1",
        "values": [4777.9, 3258, 2410.8, 2015.3]
      }
    ]
  }
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
  const [selectedCapacity, setSelectedCapacity] = useState("");

  const [nandOptions, setNandOptions] = useState([]);
  const [selectedNand, setSelectedNand] = useState("");

  const [socVendorOptions, setSocVendorOptions] = useState([]);
  const [selectedSocVendor, setSelectedSocVendor] = useState("");

  const [socModelOptions, setSocModelOptions] = useState([]);
  const [selectedSocModel, setSelectedSocModel] = useState("");

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
  // LOAD INITIAL FILTERS
  // ----------------------------------------------------------
  useEffect(() => {
    let active = true;

    const loadFilters = async () => {
      setLoadingFilters(true);
      setError("");

      try {
        const data = await getJson(apiUrl("/performance/filters"));

        if (!active) return;

        const pick = (key, fallback = []) => {
          const value = data?.[key];
          return Array.isArray(value) ? value : fallback;
        };

        const benchmarks =
          pick("benchmarks").length > 0
            ? pick("benchmarks")
            : pick("benchmark");

        setBenchmarkOptions(benchmarks);
        setCapacityOptions(pick("capacities", pick("capacity")));
        setNandOptions(pick("nand_cell_types", pick("nandCellTypes")));
        setSocVendorOptions(pick("soc_vendors", pick("socVendors")));
        setSocModelOptions(pick("soc_models", pick("socModels")));
        setHciVersionOptions(pick("hci_versions", pick("hciVersions")));
        setWriteBoosterOptions(
          pick("write_booster", pick("writeBooster"))
        );
        setFileSystemOptions(
          pick("file_systems", pick("fileSystems"))
        );
        setEncryptionOptions(pick("encryption"));
        setScenarioOptions(
          pick("available_scenarios", pick("scenarios"))
        );

        if (!benchmark && benchmarks.length === 1) {
          setBenchmark(
            typeof benchmarks[0] === "object"
              ? benchmarks[0].value ?? benchmarks[0].name ?? ""
              : benchmarks[0]
          );
        }
      } catch (err) {
        if (active) {
          setError(
            "Unable to load performance filters. Please check the backend connection."
          );
        }
      } finally {
        if (active) setLoadingFilters(false);
      }
    };

    loadFilters();

    return () => {
      active = false;
    };
  }, []);

  // ----------------------------------------------------------
  // LOAD VERSIONS WHEN BENCHMARK CHANGES
  // ----------------------------------------------------------
  useEffect(() => {
    let active = true;

    const loadVersions = async () => {
      if (!benchmark) {
        setVersionOptions([]);
        setSelectedVersions([]);
        setUfsVersionOptions([]);
        setSelectedUfsVersions([]);
        return;
      }

      setLoadingVersions(true);
      setError("");

      try {
        const data = await getJson(
          apiUrl(
            `/performance/versions?benchmark=${encodeURIComponent(
              benchmark
            )}`
          )
        );

        if (!active) return;

        const versions =
          Array.isArray(data)
            ? data
            : data?.versions || data?.data || [];

        setVersionOptions(versions);
        setSelectedVersions([]);
        setUfsVersionOptions([]);
        setSelectedUfsVersions([]);
      } catch (err) {
        if (active) {
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
  // LOAD UFS VERSIONS AFTER SOFTWARE VERSIONS
  // ----------------------------------------------------------
  useEffect(() => {
    let active = true;

    const loadUfsVersions = async () => {
      if (!benchmark || selectedVersions.length === 0) {
        setUfsVersionOptions([]);
        setSelectedUfsVersions([]);
        return;
      }

      setLoadingUfsVersions(true);

      try {
        const query = selectedVersions
          .map(
            (item) =>
              `versions=${encodeURIComponent(
                typeof item === "object"
                  ? item.value ?? item.name ?? ""
                  : item
              )}`
          )
          .join("&");

        const data = await getJson(
          apiUrl(
            `/performance/ufs-versions?benchmark=${encodeURIComponent(
              benchmark
            )}&${query}`
          )
        );

        if (!active) return;

        const versions =
          Array.isArray(data)
            ? data
            : data?.ufs_versions ||
              data?.ufsVersions ||
              data?.versions ||
              data?.data ||
              [];

        setUfsVersionOptions(versions);
        setSelectedUfsVersions([]);
      } catch (err) {
        if (active) {
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

  // ----------------------------------------------------------
  // FETCH TABLE + GRAPH
  // ----------------------------------------------------------
  const fetchPerformanceData = async () => {
    if (selectedScenarios.length < 2) {
      clearResults();
      return;
    }

    setLoadingResults(true);
    setError("");

    try {
      const payload = {
        benchmark,
        versions: selectedVersions.map(valueOf),
        ufs_versions: selectedUfsVersions.map(valueOf),
        capacity: selectedCapacity,
        nand_cell_type: selectedNand,
        soc_vendor: selectedSocVendor,
        soc_model: selectedSocModel,
        hci_versions: selectedHciVersions.map(valueOf),
        write_booster: selectedWriteBooster.map(valueOf),
        file_system: selectedFileSystem.map(valueOf),
        encryption: selectedEncryption.map(valueOf),
        scenarios: selectedScenarios.map(valueOf),
      };

      const data = await getJson(apiUrl("/performance/results"), {
        method: "POST",
        body: JSON.stringify(payload),
      });

      setTableData(data?.table || null);
      setGraphData(Array.isArray(data?.graph) ? data.graph : []);
    } catch (err) {
      setTableData(null);
      setGraphData([]);
      setError(
        "Unable to load performance results. Please verify the selected filters."
      );
    } finally {
      setLoadingResults(false);
    }
  };

  useEffect(() => {
    if (selectedScenarios.length >= 2) {
      fetchPerformanceData();
    } else {
      clearResults();
    }
  }, [selectedScenarios]);

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

  // ----------------------------------------------------------
  // SINGLE SELECT FIELD
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
                {renderSingleSelect({
                  label: "SoC Vendor",
                  value: selectedSocVendor,
                  setter: setSelectedSocVendor,
                  options: socVendorOptions,
                })}

                {renderSingleSelect({
                  label: "SoC Model",
                  value: selectedSocModel,
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
                {renderSingleSelect({
                  label: "Capacity",
                  value: selectedCapacity,
                  setter: setSelectedCapacity,
                  options: capacityOptions,
                })}

                {renderSingleSelect({
                  label: "NAND Cell Type",
                  value: selectedNand,
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
                setSelectedCapacity("");
                setSelectedNand("");
                setSelectedSocVendor("");
                setSelectedSocModel("");
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
                ["Capacity", selectedCapacity || "-"],
                ["NAND Cell Type", selectedNand || "-"],
                ["SoC Vendor", selectedSocVendor || "-"],
                ["SoC Model", selectedSocModel || "-"],
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
