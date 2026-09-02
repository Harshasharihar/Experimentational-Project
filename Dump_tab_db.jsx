import React from "react";
import {
  Box,
  Typography,
  Button,
  Paper,
} from "@mui/material";

import {
  Home,
  TrendingUp,
  Layers,
  Visibility,
  ArrowForward,
  Speed,
  PhoneAndroid,
  Storage,
  Memory,
} from "@mui/icons-material";

import { useNavigate } from "react-router-dom";

// KEEP YOUR EXISTING IMPORTS
import Header from "./Header";
import Footer from "./Footer";


const COLORS = {
  blue: "#0868D8",
  darkBlue: "#031B3B",
  text: "#071735",
  background: "#F5F9FF",
};


function UfsPerformanceDashboard({
  benchmarkData,
  handleViewDetails,
}) {

  const navigate = useNavigate();


  /*
   * ----------------------------------------------------
   * EXISTING BACKEND DATA
   * ----------------------------------------------------
   *
   * Expected:
   *
   * benchmarkData = [
   *   {
   *      name: "AndroBench",
   *      versionCount: 0
   *   },
   *   {
   *      name: "AnTuTu_android",
   *      versionCount: 2
   *   }
   * ]
   *
   * Keep your existing backend function.
   */


  /*
   * ----------------------------------------------------
   * ICON BASED ON BENCHMARK NAME
   * ----------------------------------------------------
   */

  const getBenchmarkIcon = (name) => {

    const value = name?.toLowerCase();

    if (value?.includes("androbench")) {
      return <Speed />;
    }

    if (value?.includes("antutu")) {
      return <PhoneAndroid />;
    }

    if (value?.includes("fio")) {
      return <Storage />;
    }

    if (value?.includes("tio")) {
      return <Memory />;
    }

    return <Speed />;
  };


  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        background: COLORS.background,
      }}
    >

      {/* =================================================
          EXISTING HEADER
         ================================================= */}

      <Header title="UFS PERFORMANCE DASHBOARD" />


      {/* =================================================
          MAIN CONTENT
         ================================================= */}

      <Box
        component="main"
        sx={{
          flex: 1,

          px: {
            xs: 2,
            sm: 3,
            md: 5,
            lg: 7,
          },

          py: {
            xs: 3,
            sm: 4,
            md: 5,
          },
        }}
      >

        {/* =================================================
            BREADCRUMB
           ================================================= */}

        <Box
          sx={{
            maxWidth: "1400px",
            mx: "auto",
            mb: 3,

            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >

          <Home
            sx={{
              color: COLORS.blue,
              fontSize: {
                xs: 20,
                md: 24,
              },
            }}
          />

          <Typography
            sx={{
              color: COLORS.blue,
              fontSize: {
                xs: "0.9rem",
                md: "1rem",
              },
              fontWeight: 500,
            }}
          >
            Home
          </Typography>

          <Typography
            sx={{
              color: "#8A96A8",
            }}
          >
            /
          </Typography>

          <Typography
            sx={{
              color: COLORS.text,
              fontSize: {
                xs: "0.9rem",
                md: "1rem",
              },
              fontWeight: 500,
            }}
          >
            UFS Performance Dashboard
          </Typography>

        </Box>


        {/* =================================================
            PAGE TITLE
           ================================================= */}

        <Box
          sx={{
            maxWidth: "1400px",
            mx: "auto",
            mb: 3,
          }}
        >

          <Typography
            component="h1"
            sx={{
              color: COLORS.text,

              fontWeight: 700,

              fontSize: {
                xs: "1.6rem",
                sm: "2rem",
                md: "2.4rem",
              },
            }}
          >
            UFS PERFORMANCE DASHBOARD
          </Typography>

          <Typography
            sx={{
              color: "#53647C",

              mt: 0.5,

              fontSize: {
                xs: "0.85rem",
                sm: "0.95rem",
                md: "1.05rem",
              },
            }}
          >
            View benchmark performance statistics and details
          </Typography>

        </Box>


        {/* =================================================
            TABLE CONTAINER
           ================================================= */}

        <Paper
          elevation={0}
          sx={{
            maxWidth: "1400px",
            mx: "auto",

            p: {
              xs: 1,
              sm: 1.5,
              md: 2,
            },

            borderRadius: "16px",

            background: "#FFFFFF",

            boxShadow:
              "0 10px 30px rgba(20,60,120,0.10)",

            border:
              "1px solid rgba(30,100,180,0.10)",

            overflow: "hidden",
          }}
        >

          {/* =================================================
              TABLE
             ================================================= */}

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
                borderCollapse: "separate",
                borderSpacing: 0,

                minWidth: {
                  xs: "650px",
                  sm: "750px",
                },
              }}
            >

              {/* =================================================
                  TABLE HEADER
                 ================================================= */}

              <Box component="thead">

                <Box component="tr">

                  {/* BENCHMARK */}

                  <Box
                    component="th"
                    sx={{
                      width: "40%",

                      background: COLORS.blue,
                      color: "#FFFFFF",

                      p: {
                        xs: 1.5,
                        sm: 2,
                        md: 2.5,
                      },

                      textAlign: "left",

                      borderRight:
                        "1px solid rgba(255,255,255,0.25)",
                    }}
                  >

                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1.5,
                      }}
                    >

                      <TrendingUp
                        sx={{
                          fontSize: {
                            xs: 20,
                            md: 25,
                          },
                        }}
                      />

                      <Typography
                        sx={{
                          fontWeight: 700,

                          fontSize: {
                            xs: "0.8rem",
                            sm: "0.9rem",
                            md: "1rem",
                          },
                        }}
                      >
                        BENCHMARK
                      </Typography>

                    </Box>

                  </Box>


                  {/* VERSION COUNT */}

                  <Box
                    component="th"
                    sx={{
                      width: "27%",

                      background: COLORS.blue,
                      color: "#FFFFFF",

                      p: {
                        xs: 1.5,
                        sm: 2,
                        md: 2.5,
                      },

                      textAlign: "center",

                      borderRight:
                        "1px solid rgba(255,255,255,0.25)",
                    }}
                  >

                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        gap: 1.5,
                      }}
                    >

                      <Layers
                        sx={{
                          fontSize: {
                            xs: 20,
                            md: 25,
                          },
                        }}
                      />

                      <Typography
                        sx={{
                          fontWeight: 700,

                          fontSize: {
                            xs: "0.8rem",
                            sm: "0.9rem",
                            md: "1rem",
                          },
                        }}
                      >
                        VERSION COUNT
                      </Typography>

                    </Box>

                  </Box>


                  {/* PROCEED TO VIEW */}

                  <Box
                    component="th"
                    sx={{
                      width: "33%",

                      background: COLORS.blue,
                      color: "#FFFFFF",

                      p: {
                        xs: 1.5,
                        sm: 2,
                        md: 2.5,
                      },

                      textAlign: "center",
                    }}
                  >

                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        gap: 1.5,
                      }}
                    >

                      <Visibility
                        sx={{
                          fontSize: {
                            xs: 20,
                            md: 25,
                          },
                        }}
                      />

                      <Typography
                        sx={{
                          fontWeight: 700,

                          fontSize: {
                            xs: "0.8rem",
                            sm: "0.9rem",
                            md: "1rem",
                          },
                        }}
                      >
                        PROCEED TO VIEW
                      </Typography>

                    </Box>

                  </Box>

                </Box>

              </Box>


              {/* =================================================
                  DYNAMIC TABLE BODY
                 ================================================= */}

              <Box component="tbody">

                {benchmarkData?.map((item, index) => (

                  <Box
                    component="tr"
                    key={`${item.name}-${index}`}
                    sx={{
                      background:
                        index % 2 === 0
                          ? "#FFFFFF"
                          : "#F5F9FF",

                      "&:hover": {
                        background: "#EDF5FF",
                      },

                      transition:
                        "background 0.2s ease",
                    }}
                  >

                    {/* =================================================
                        BENCHMARK NAME
                       ================================================= */}

                    <Box
                      component="td"
                      sx={{
                        p: {
                          xs: 1.5,
                          sm: 2,
                          md: 2.5,
                        },

                        borderRight:
                          "1px solid #DCE5F0",

                        borderBottom:
                          "1px solid #DCE5F0",
                      }}
                    >

                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: {
                            xs: 1.5,
                            md: 2.5,
                          },
                        }}
                      >

                        {/* ICON */}

                        <Box
                          sx={{
                            width: {
                              xs: 40,
                              sm: 45,
                              md: 55,
                            },

                            height: {
                              xs: 40,
                              sm: 45,
                              md: 55,
                            },

                            minWidth: {
                              xs: 40,
                              sm: 45,
                              md: 55,
                            },

                            borderRadius: "50%",

                            background: "#EAF3FF",

                            color: COLORS.blue,

                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          {getBenchmarkIcon(item.name)}
                        </Box>


                        {/* NAME */}

                        <Typography
                          sx={{
                            color: COLORS.text,

                            fontWeight: 600,

                            fontSize: {
                              xs: "0.85rem",
                              sm: "0.95rem",
                              md: "1.1rem",
                            },

                            wordBreak: "break-word",
                          }}
                        >
                          {item.name}
                        </Typography>

                      </Box>

                    </Box>


                    {/* =================================================
                        VERSION COUNT
                       ================================================= */}

                    <Box
                      component="td"
                      sx={{
                        p: {
                          xs: 1.5,
                          sm: 2,
                          md: 2.5,
                        },

                        textAlign: "center",

                        borderRight:
                          "1px solid #DCE5F0",

                        borderBottom:
                          "1px solid #DCE5F0",
                      }}
                    >

                      <Box
                        sx={{
                          display: "inline-flex",

                          minWidth: {
                            xs: 45,
                            sm: 55,
                            md: 70,
                          },

                          px: 2,

                          py: 0.8,

                          justifyContent: "center",

                          borderRadius: "9px",

                          background:
                            Number(item.versionCount) > 0
                              ? "#DDF5E9"
                              : "#EAF3FF",

                          color:
                            Number(item.versionCount) > 0
                              ? "#16894F"
                              : COLORS.blue,

                          fontWeight: 700,

                          fontSize: {
                            xs: "0.9rem",
                            md: "1.1rem",
                          },
                        }}
                      >
                        {item.versionCount ?? 0}
                      </Box>

                    </Box>


                    {/* =================================================
                        VIEW DETAILS
                       ================================================= */}

                    <Box
                      component="td"
                      sx={{
                        p: {
                          xs: 1.5,
                          sm: 2,
                          md: 2.5,
                        },

                        textAlign: "center",

                        borderBottom:
                          "1px solid #DCE5F0",
                      }}
                    >

                      <Button
                        onClick={() =>
                          handleViewDetails(item)
                        }
                        endIcon={<ArrowForward />}
                        sx={{
                          minWidth: {
                            xs: "120px",
                            sm: "150px",
                            md: "180px",
                          },

                          border:
                            "1px solid #D7E0EB",

                          borderRadius: "8px",

                          background: "#FFFFFF",

                          color: COLORS.text,

                          textTransform: "none",

                          fontWeight: 500,

                          fontSize: {
                            xs: "0.75rem",
                            sm: "0.85rem",
                            md: "0.95rem",
                          },

                          px: {
                            xs: 1,
                            sm: 2,
                          },

                          py: {
                            xs: 0.8,
                            sm: 1,
                          },

                          "&:hover": {
                            background: "#EDF5FF",
                            borderColor: COLORS.blue,
                            color: COLORS.blue,
                          },
                        }}
                      >
                        View Details
                      </Button>

                    </Box>

                  </Box>

                ))}

              </Box>

            </Box>

          </Box>

        </Paper>

      </Box>


      {/* =================================================
          EXISTING FOOTER
         ================================================= */}

      <Footer />

    </Box>
  );
}

export default UfsPerformanceDashboard;
