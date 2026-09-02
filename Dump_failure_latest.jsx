import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  Collapse,
  Drawer,
  FormControlLabel,
  IconButton,
  Menu,
  MenuItem,
  Paper,
  Select,
  Typography,
  Divider,
} from "@mui/material";

import {
  Menu as MenuIcon,
  Close,
  KeyboardArrowDown,
  KeyboardArrowUp,
  Home,
  NotificationsNone,
  TableChart,
  ShowChart,
  Notes,
  Refresh,
  Send,
} from "@mui/icons-material";

const GLOBAL_BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL || "";


/* =========================================================
   MULTI SELECT DROPDOWN
========================================================= */

function MultiSelectDropdown({
  title,
  values,
  options,
  setValues,
}) {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleToggle = (item) => {
    if (values.includes(item)) {
      setValues(values.filter((value) => value !== item));
    } else {
      setValues([...values, item]);
    }
  };

  return (
    <Box>
      <Button
        fullWidth
        onClick={(event) => setAnchorEl(event.currentTarget)}
        endIcon={<KeyboardArrowDown />}
        sx={{
          minHeight: 72,
          justifyContent: "space-between",
          alignItems: "center",
          textTransform: "none",
          background: "white",
          border: "1px solid #d9e2f0",
          borderRadius: 2,
          px: 2,
          color: "#172b4d",
          boxShadow: "0 3px 12px rgba(16,40,80,0.05)",
        }}
      >
        <Box sx={{ textAlign: "left", minWidth: 0 }}>
          <Typography
            sx={{
              fontSize: 11,
              color: "#667085",
              mb: 0.4,
            }}
          >
            {title}
          </Typography>

          <Typography
            sx={{
              fontSize: 13,
              fontWeight: 600,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              maxWidth: 220,
            }}
          >
            {values.length ? values.join(", ") : "Select"}
          </Typography>
        </Box>
      </Button>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={() => setAnchorEl(null)}
        PaperProps={{
          sx: {
            maxHeight: 350,
            minWidth: 240,
          },
        }}
      >
        {options.length === 0 && (
          <MenuItem disabled>No options available</MenuItem>
        )}

        {options.map((item) => (
          <MenuItem
            key={item}
            onClick={() => handleToggle(item)}
          >
            <Checkbox
              size="small"
              checked={values.includes(item)}
            />

            <Typography sx={{ fontSize: 13 }}>
              {item}
            </Typography>
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
}


/* =========================================================
   FILTER SECTION
========================================================= */

function FilterSection({
  title,
  open,
  onClick,
  children,
}) {
  return (
    <Box sx={{ mb: 1 }}>
      <Box
        onClick={onClick}
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          cursor: "pointer",
          py: 1,
          borderBottom:
            "1px solid rgba(255,255,255,0.18)",
        }}
      >
        <Typography
          sx={{
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: 1,
          }}
        >
          {title}
        </Typography>

        {open ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
      </Box>

      <Collapse in={open}>
        <Box sx={{ py: 0.5 }}>
          {children}
        </Box>
      </Collapse>
    </Box>
  );
}


/* =========================================================
   CHECKBOX ITEM
========================================================= */

function CheckboxItem({
  label,
  checked,
  onChange,
}) {
  return (
    <FormControlLabel
      control={
        <Checkbox
          size="small"
          checked={checked}
          onChange={onChange}
          sx={{
            color: "#b8c8df",
            "&.Mui-checked": {
              color: "#3182ff",
            },
          }}
        />
      }
      label={
        <Typography sx={{ fontSize: 13 }}>
          {label}
        </Typography>
      }
      sx={{
        display: "flex",
        m: 0,
      }}
    />
  );
}


/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function UfsPerformanceDetails() {

  /* =======================================================
     DRAWERS
  ======================================================= */

  const [filterDrawerOpen, setFilterDrawerOpen] =
    useState(false);

  const [notesOpen, setNotesOpen] = useState(false);


  /* =======================================================
     EVALUATOR NOTES
  ======================================================= */

  const [messages, setMessages] = useState([
    {
      sender: "assistant",
      text:
        "Hello! How can I help you with the performance evaluation?",
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

  const [writeBoosterData, setWriteBoosterData] = useState([]);
  const [fileSystemData, setFileSystemData] = useState([]);
  const [encryptionData, setEncryptionData] = useState([]);
  const [scenarioData, setScenarioData] = useState([]);


  /* =======================================================
     SELECTED FILTERS
  ======================================================= */

  const [selectedBenchmark, setSelectedBenchmark] =
    useState("");

  const [selectedVersions, setSelectedVersions] =
    useState([]);

  const [selectedUfsVersions, setSelectedUfsVersions] =
    useState([]);

  const [selectedCapacity, setSelectedCapacity] =
    useState([]);

  const [selectedNandCell, setSelectedNandCell] =
    useState([]);

  const [selectedSocVendor, setSelectedSocVendor] =
    useState([]);

  const [selectedSocModel, setSelectedSocModel] =
    useState([]);

  const [selectedHciVersion, setSelectedHciVersion] =
    useState([]);

  const [selectedWriteBooster, setSelectedWriteBooster] =
    useState([]);

  const [selectedFileSystem, setSelectedFileSystem] =
    useState([]);

  const [selectedEncryption, setSelectedEncryption] =
    useState([]);

  const [selectedScenarios, setSelectedScenarios] =
    useState([]);


  /* =======================================================
     PERFORMANCE DATA
  ======================================================= */

  const [performanceData, setPerformanceData] =
    useState(null);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");


  /* =======================================================
     FILTER SECTIONS
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
     INITIAL BACKEND DATA
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
     BENCHMARK
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
     VERSION
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
     GENERIC ARRAY TOGGLE
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
     FETCH PERFORMANCE DATA
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
        throw new Error(
          "Unable to retrieve performance data"
        );
      }

      const data = await response.json();

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
     SCENARIO CHANGE
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

    const time = new Date().toLocaleTimeString(
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
        text:
          "Your evaluator note has been received.",
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
     RENDER
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
            setFilterDrawerOpen(
              !filterDrawerOpen
            )
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

              whiteSpace: "nowrap",
            }}
          >
            UFS PERFORMANCE DASHBOARD
          </Typography>

        </Box>


        <IconButton sx={{ color: "white" }}>
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
          MAIN
      =================================================== */}

      <Box
        sx={{
          display: "flex",
          minHeight:
            "calc(100vh - 76px)",
        }}
      >


        {/* =================================================
            FILTER SIDEBAR
        ================================================= */}

        <Box
          sx={{
            width: {
              xs: filterDrawerOpen ? 270 : 0,
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


            <FilterSection
              title="GENERATIONS"
              open={openSections.generations}
              onClick={() =>
                setOpenSections({
                  ...openSections,
                  generations:
                    !openSections.generations,
                })
              }
            >

              {versionData.map((item) => (

                <CheckboxItem
                  key={item}
                  label={item}
                  checked={
                    selectedVersions.includes(item)
                  }
                  onChange={() => {

                    const next =
                      selectedVersions.includes(item)
                        ? selectedVersions.filter(
                            (x) => x !== item
                          )
                        : [
                            ...selectedVersions,
                            item,
                          ];

                    handleVersionChange(next);

                  }}
                />

              ))}

            </FilterSection>


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

              {capacityData.map((item) => (

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

              ))}

            </FilterSection>


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

              {nandCellData.map((item) => (

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

              ))}

            </FilterSection>


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

              {socVendorData.map((item) => (

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

              ))}

            </FilterSection>


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

              {socModelData.map((item) => (

                <CheckboxItem
                  key={item}
                  label={item}
                  checked={
                    selectedSocModel.includes(item)
                  }
                  onChange={() =>
                    toggleArrayValue(
                      item,
                      selectedSocModel,
                      setSelectedSocModel
                    )
                  }
                />

              ))}

            </FilterSection>


            <FilterSection
              title="HCI VERSIONS"
              open={openSections.hci}
              onClick={() =>
                setOpenSections({
                  ...openSections,
                  hci:
                    !openSections.hci,
                })
              }
            >

              {hciVersionData.map((item) => (

                <CheckboxItem
                  key={item}
                  label={item}
                  checked={
                    selectedHciVersion.includes(item)
                  }
                  onChange={() =>
                    toggleArrayValue(
                      item,
                      selectedHciVersion,
                      setSelectedHciVersion
                    )
                  }
                />

              ))}

            </FilterSection>


            <Button
              fullWidth
              variant="outlined"
              startIcon={<Refresh />}
              onClick={resetFilters}
              sx={{
                mt: 2,
                color: "white",
                borderColor:
                  "rgba(255,255,255,0.4)",
                borderRadius: 2,
              }}
            >
              Reset Filters
            </Button>

          </Box>

        </Box>


        {/* =================================================
            CONTENT
        ================================================= */}

        <Box
          sx={{
            flex: 1,
            minWidth: 0,

            p: {
              xs: 1.5,
              sm: 2,
              md: 3,
            },
          }}
        >

          <Box sx={{ mb: 2.5 }}>

            <Typography
              sx={{
                color: "#0d5bd7",
                fontSize: 13,
                fontWeight: 700,
                letterSpacing: 3,
                mb: 1,
              }}
            >
              PERFORMANCE
            </Typography>

            <Typography
              sx={{
                fontSize: {
                  xs: 22,
                  md: 30,
                },
                fontWeight: 700,
                color: "#071b3c",
              }}
            >
              Performance Comparison
            </Typography>

            <Typography
              sx={{
                color: "#667085",
                mt: 0.5,
              }}
            >
              Select the required configuration and
              scenarios to compare performance.
            </Typography>

          </Box>


          {/* =================================================
              TOP MULTI SELECTS
          ================================================= */}

          <Box
            sx={{
              display: "grid",

              gridTemplateColumns: {
                xs: "1fr",
                sm: "1fr 1fr",
                lg: "1fr 1fr 1fr 1.5fr",
              },

              gap: 1.5,

              mb: 2,
            }}
          >

            <MultiSelectDropdown
              title="WriteBooster"
              values={selectedWriteBooster}
              options={writeBoosterData}
              setValues={setSelectedWriteBooster}
            />

            <MultiSelectDropdown
              title="FileSystem"
              values={selectedFileSystem}
              options={fileSystemData}
              setValues={setSelectedFileSystem}
            />

            <MultiSelectDropdown
              title="Encryption"
              values={selectedEncryption}
              options={encryptionData}
              setValues={setSelectedEncryption}
            />

            <MultiSelectDropdown
              title="Available Scenarios"
              values={selectedScenarios}
              options={scenarioData}
              setValues={setSelectedScenarios}
            />

          </Box>


          {/* =================================================
              INFO
          ================================================= */}

          {selectedScenarios.length < 2 && (

            <Paper
              sx={{
                p: 2,
                mb: 2,
                borderRadius: 2,
                border:
                  "1px dashed #9db8dc",
                background: "#eef5ff",
              }}
            >

              <Typography
                sx={{
                  color: "#174ea6",
                  fontWeight: 600,
                }}
              >
                Select at least two scenarios to
                populate the performance comparison.
              </Typography>

            </Paper>

          )}


          {error && (

            <Paper
              sx={{
                p: 2,
                mb: 2,
                color: "#b42318",
              }}
            >
              {error}
            </Paper>

          )}


          {/* =================================================
              LOADING
          ================================================= */}

          {loading && (

            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                minHeight: 300,
              }}
            >

              <Box sx={{ textAlign: "center" }}>

                <CircularProgress />

                <Typography
                  sx={{
                    mt: 2,
                    color: "#667085",
                  }}
                >
                  Loading performance data...
                </Typography>

              </Box>

            </Box>

          )}


          {/* =================================================
              RESULT CARDS
          ================================================= */}

          {!loading &&
            performanceData && (

              <Box
                sx={{
                  display: "grid",

                  gridTemplateColumns: {
                    xs: "1fr",
                    xl: "1.05fr 0.95fr",
                  },

                  gap: 2,
                }}
              >

                {/* =================================================
                    TABLE
                ================================================= */}

                <Paper
                  sx={{
                    borderRadius: 3,
                    overflow: "hidden",
                    border:
                      "1px solid #dce5f2",
                    boxShadow:
                      "0 8px 25px rgba(16,40,80,0.08)",
                  }}
                >

                  <Box
                    sx={{
                      p: 2,
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >

                    <TableChart
                      sx={{
                        color: "#1264d8",
                      }}
                    />

                    <Typography
                      sx={{
                        fontWeight: 700,
                        color: "#071b3c",
                      }}
                    >
                      PERFORMANCE SUMMARY
                    </Typography>

                  </Box>


                  <Box
                    sx={{
                      width: "100%",
                      overflowX: "auto",
                      maxHeight: 620,
                      overflowY: "auto",
                    }}
                  >

                    <Box
                      component="table"
                      sx={{
                        width: "100%",
                        minWidth: 650,
                        borderCollapse:
                          "collapse",

                        "& th": {
                          position: "sticky",
                          top: 0,
                          zIndex: 3,

                          background:
                            "linear-gradient(135deg,#0754c7,#176bdc)",

                          color: "white",

                          padding: "15px",

                          textAlign: "left",

                          fontSize: 13,
                        },

                        "& td": {
                          padding: "14px",
                          borderBottom:
                            "1px solid #e5eaf2",
                          color: "#172b4d",
                          fontSize: 14,
                        },

                        "& tbody tr:nth-of-type(even)": {
                          background:
                            "#f7faff",
                        },
                      }}
                    >

                      <thead>
                        <tr>

                          {tableColumns.map(
                            (column) => (
                              <th key={column}>
                                {column}
                              </th>
                            )
                          )}

                        </tr>
                      </thead>


                      <tbody>

                        {tableRows.map(
                          (row, index) => (

                            <tr
                              key={index}
                              className="performance-row"
                            >

                              {tableColumns.map(
                                (column) => (
                                  <td key={column}>
                                    {row[column]}
                                  </td>
                                )
                              )}

                            </tr>

                          )
                        )}

                      </tbody>

                    </Box>

                  </Box>

                </Paper>


                {/* =================================================
                    GRAPH
                ================================================= */}

                <Paper
                  sx={{
                    borderRadius: 3,
                    overflow: "hidden",
                    border:
                      "1px solid #dce5f2",
                    boxShadow:
                      "0 8px 25px rgba(16,40,80,0.08)",
                    minHeight: 500,
                  }}
                >

                  <Box
                    sx={{
                      p: 2,
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >

                    <ShowChart
                      sx={{
                        color: "#1264d8",
                      }}
                    />

                    <Typography
                      sx={{
                        fontWeight: 700,
                        color: "#071b3c",
                      }}
                    >
                      PERFORMANCE COMPARISON (3D)
                    </Typography>

                  </Box>


                  {/* GRAPH */}

                  <Box
                    sx={{
                      px: {
                        xs: 1,
                        md: 3,
                      },
                      pb: 3,
                      minHeight: 430,
                      display: "flex",
                      alignItems: "flex-end",
                      justifyContent: "center",
                      overflowX: "auto",
                    }}
                  >

                    <Box
                      sx={{
                        minWidth: Math.max(
                          600,
                          graphData.length * 130
                        ),

                        width: "100%",

                        height: 370,

                        display: "flex",

                        alignItems: "flex-end",

                        justifyContent:
                          "space-around",

                        gap: 3,

                        perspective: "900px",

                        px: 2,
                      }}
                    >

                      {graphData.map(
                        (series, seriesIndex) => (

                          <Box
                            key={
                              series.name ||
                              seriesIndex
                            }
                            sx={{
                              flex: 1,
                              maxWidth: 170,
                              height: "100%",
                              display: "flex",
                              alignItems: "flex-end",
                              justifyContent:
                                "center",
                              gap: 0.8,
                            }}
                          >

                            {(series.values || [])
                              .map(
                                (value, index) => {

                                  const numericValue =
                                    Number(value) || 0;

                                  const maxValue =
                                    Math.max(
                                      ...graphData.flatMap(
                                        (item) =>
                                          (
                                            item.values ||
                                            []
                                          ).map(
                                            (v) =>
                                              Number(v) ||
                                              0
                                          )
                                      ),
                                      1
                                    );

                                  const height =
                                    Math.max(
                                      8,
                                      (
                                        numericValue /
                                        maxValue
                                      ) * 260
                                    );

                                  return (

                                    <Box
                                      key={index}
                                      sx={{
                                        position:
                                          "relative",

                                        width: {
                                          xs: 24,
                                          sm: 30,
                                        },

                                        height,

                                        borderRadius:
                                          "4px 4px 0 0",

                                        background:
                                          seriesIndex %
                                            3 ===
                                          0
                                            ? "linear-gradient(135deg,#1669df,#092b65)"
                                            : seriesIndex %
                                                3 ===
                                              1
                                            ? "linear-gradient(135deg,#7030d9,#30156b)"
                                            : "linear-gradient(135deg,#ed7d16,#8d4100)",

                                        transform:
                                          "skewY(-2deg)",

                                        transformOrigin:
                                          "bottom",

                                        animation:
                                          "barGrow 900ms cubic-bezier(.2,.8,.2,1) forwards",

                                        animationDelay:
                                          `${index * 100}ms`,

                                        boxShadow:
                                          "4px 4px 0 rgba(0,0,0,0.15)",
                                      }}
                                    >

                                      <Typography
                                        sx={{
                                          position:
                                            "absolute",

                                          top: -24,

                                          left: "50%",

                                          transform:
                                            "translateX(-50%)",

                                          fontSize: 10,

                                          fontWeight: 700,

                                          color:
                                            "#344054",

                                          whiteSpace:
                                            "nowrap",
                                        }}
                                      >
                                        {numericValue}
                                      </Typography>

                                    </Box>

                                  );

                                }
                              )}

                          </Box>

                        )
                      )}

                    </Box>

                  </Box>


                  {/* LEGEND */}

                  <Box
                    sx={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 2,
                      px: 3,
                      pb: 3,
                    }}
                  >

                    {graphData.map(
                      (series, index) => (

                        <Box
                          key={index}
                          sx={{
                            display: "flex",
                            alignItems:
                              "center",
                            gap: 0.8,
                          }}
                        >

                          <Box
                            sx={{
                              width: 12,
                              height: 12,
                              borderRadius: 1,

                              background:
                                index % 3 === 0
                                  ? "#1669df"
                                  : index % 3 === 1
                                  ? "#7030d9"
                                  : "#ed7d16",
                            }}
                          />

                          <Typography
                            sx={{
                              fontSize: 12,
                              color:
                                "#475467",
                            }}
                          >
                            {series.name}
                          </Typography>

                        </Box>

                      )
                    )}

                  </Box>

                </Paper>

              </Box>

            )}

        </Box>

      </Box>


      {/* ===================================================
          EVALUATOR NOTES BUTTON
      =================================================== */}

      <Button
        variant="contained"
        startIcon={<Notes />}
        onClick={() =>
          setNotesOpen(true)
        }
        sx={{
          position: "fixed",

          right: {
            xs: 12,
            md: 25,
          },

          bottom: {
            xs: 12,
            md: 25,
          },

          borderRadius: 3,

          background:
            "linear-gradient(135deg,#0754c7,#176bdc)",

          zIndex: 1000,

          boxShadow:
            "0 8px 25px rgba(0,75,180,0.3)",
        }}
      >
        Evaluator Notes
      </Button>


      {/* ===================================================
          EVALUATOR NOTES DRAWER
      =================================================== */}

      <Drawer
        anchor="right"
        open={notesOpen}
        onClose={() => setNotesOpen(false)}
      >

        <Box
          sx={{
            width: {
              xs: "100vw",
              sm: 400,
            },

            height: "100%",

            display: "flex",

            flexDirection: "column",

            background: "#f7f9fd",
          }}
        >

          {/* HEADER */}

          <Box
            sx={{
              p: 2,

              background:
                "linear-gradient(135deg,#071b3c,#0754c7)",

              color: "white",

              display: "flex",

              alignItems: "center",

              justifyContent:
                "space-between",
            }}
          >

            <Box>

              <Typography
                sx={{
                  fontWeight: 700,
                }}
              >
                Evaluator Notes
              </Typography>

              <Typography
                sx={{
                  fontSize: 12,
                  opacity: 0.75,
                }}
              >
                Performance Evaluation Assistant
              </Typography>

            </Box>


            <IconButton
              onClick={() =>
                setNotesOpen(false)
              }
              sx={{
                color: "white",
              }}
            >
              <Close />
            </IconButton>

          </Box>


          {/* MESSAGES */}

          <Box
            sx={{
              flex: 1,
              overflowY: "auto",
              p: 2,
            }}
          >

            {messages.map(
              (message, index) => (

                <Box
                  key={index}
                  sx={{
                    display: "flex",

                    justifyContent:
                      message.sender ===
                      "user"
                        ? "flex-end"
                        : "flex-start",

                    mb: 2,

                    animation:
                      "messageIn 350ms ease",
                  }}
                >

                  <Paper
                    sx={{
                      p: 1.5,

                      maxWidth: "85%",

                      borderRadius: 2,

                      background:
                        message.sender ===
                        "user"
                          ? "#e9e4ff"
                          : "white",

                      boxShadow:
                        "0 3px 12px rgba(0,0,0,0.06)",
                    }}
                  >

                    <Typography
                      sx={{
                        fontSize: 14,
                        lineHeight: 1.6,
                      }}
                    >
                      {message.text}
                    </Typography>

                    <Typography
                      sx={{
                        fontSize: 10,
                        color: "#98a2b3",
                        textAlign: "right",
                        mt: 0.5,
                      }}
                    >
                      {message.time}
                    </Typography>

                  </Paper>

                </Box>

              )
            )}

          </Box>


          {/* INPUT */}

          <Box
            sx={{
              p: 1.5,
              borderTop:
                "1px solid #dce5f2",
              background: "white",
            }}
          >

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                background: "#f2f4f8",
                borderRadius: 2,
                px: 1.5,
              }}
            >

              <input
                value={messageText}
                onChange={(e) =>
                  setMessageText(
                    e.target.value
                  )
                }
                onKeyDown={(e) => {

                  if (e.key === "Enter") {
                    handleSendMessage();
                  }

                }}
                placeholder="Type your message..."
                style={{
                  flex: 1,
                  border: "none",
                  outline: "none",
                  background: "transparent",
                  padding: "12px 0",
                  fontSize: "14px",
                }}
              />

              <IconButton
                onClick={handleSendMessage}
                sx={{
                  color: "#0754c7",
                }}
              >
                <Send />
              </IconButton>

            </Box>

          </Box>

        </Box>

      </Drawer>


      {/* ===================================================
          FOOTER
      =================================================== */}

      <Box
        sx={{
          background:
            "linear-gradient(135deg,#061a3a,#05285c)",

          color: "white",

          px: {
            xs: 2,
            md: 5,
          },

          py: {
            xs: 2,
            md: 2.5,
          },

          display: "flex",

          flexWrap: "wrap",

          alignItems: "center",

          justifyContent:
            "space-between",

          gap: 2,
        }}
      >

        <Box>

          <Typography
            sx={{
              fontWeight: 600,
            }}
          >
            ◉ &nbsp; UFS PERFORMANCE DASHBOARD
          </Typography>

          <Typography
            sx={{
              fontSize: 12,
              opacity: 0.75,
              mt: 0.5,
            }}
          >
            © 2026 All rights reserved.
          </Typography>

        </Box>


        <Box
          sx={{
            display: "flex",
            gap: {
              xs: 1.5,
              md: 4,
            },

            flexWrap: "wrap",
          }}
        >

          <Typography sx={{ fontSize: 13 }}>
            Privacy Policy
          </Typography>

          <Typography sx={{ fontSize: 13 }}>
            Terms of Service
          </Typography>

          <Typography sx={{ fontSize: 13 }}>
            About Us
          </Typography>

        </Box>


        <Typography
          sx={{
            fontSize: 13,
            opacity: 0.8,
          }}
        >
          Version 1.0.0
        </Typography>

      </Box>


      {/* ===================================================
          ANIMATIONS
      =================================================== */}

      <style>
        {`

          @keyframes barGrow {

            0% {
              transform:
                skewY(-2deg)
                scaleY(0);

              opacity: 0;
            }

            100% {
              transform:
                skewY(-2deg)
                scaleY(1);

              opacity: 1;
            }

          }


          @keyframes messageIn {

            from {
              opacity: 0;
              transform:
                translateY(10px);
            }

            to {
              opacity: 1;
              transform:
                translateY(0);
            }

          }


          .performance-row {

            animation:
              tableRowIn
              450ms
              ease
              both;

          }


          .performance-row:nth-child(1) {
            animation-delay: 50ms;
          }

          .performance-row:nth-child(2) {
            animation-delay: 100ms;
          }

          .performance-row:nth-child(3) {
            animation-delay: 150ms;
          }

          .performance-row:nth-child(4) {
            animation-delay: 200ms;
          }

          .performance-row:nth-child(5) {
            animation-delay: 250ms;
          }

          .performance-row:nth-child(6) {
            animation-delay: 300ms;
          }

          .performance-row:nth-child(7) {
            animation-delay: 350ms;
          }

          .performance-row:nth-child(8) {
            animation-delay: 400ms;
          }


          @keyframes tableRowIn {

            from {
              opacity: 0;
              transform:
                translateY(12px);
            }

            to {
              opacity: 1;
              transform:
                translateY(0);
            }

          }


          @media (prefers-reduced-motion: reduce) {

            *,
            *::before,
            *::after {

              animation-duration:
                0.01ms !important;

              animation-iteration-count:
                1 !important;

              transition-duration:
                0.01ms !important;

            }

          }

        `}
      </style>

    </Box>
  );
}
