import React from "react";

import {
  Box,
  Typography,
  Card,
  Button,
  Divider,
  CssBaseline,
} from "@mui/material";

import {
  ArrowBackRounded,
  DownloadRounded,
  NotesRounded,
  InfoRounded,
  TableChartRounded,
  BarChartRounded,
} from "@mui/icons-material";

import "@fontsource/manrope/400.css";
import "@fontsource/manrope/500.css";
import "@fontsource/manrope/600.css";
import "@fontsource/manrope/700.css";


const FONT = "'Manrope', sans-serif";


const COLORS = {
  background: "#F6F9FD",

  heading: "#0B1F3A",
  body: "#435875",

  navy: "#061A2D",

  blue: "#087FF5",

  green: "#0FA878",
  greenDark: "#078A62",
  greenLight: "#E5F8F2",

  border: "#E2EAF2",

  white: "#FFFFFF",
};


/* =====================================================
   INFORMATION CARD
===================================================== */

function InformationCard({
  title,
  icon,
  children,
}) {
  return (
    <Card
      sx={{
        position: "relative",

        width: "100%",

        minHeight: {
          xs: "360px",
          sm: "400px",
          md: "470px",
        },

        borderRadius: "16px",

        backgroundColor: COLORS.white,

        border: `1px solid ${COLORS.border}`,

        boxShadow:
          "0 8px 28px rgba(18, 52, 86, 0.08)",

        overflow: "hidden",

        transition:
          "transform 220ms ease, box-shadow 220ms ease",

        "&::before": {
          content: '""',

          position: "absolute",

          left: 0,
          top: 0,
          bottom: 0,

          width: "4px",

          backgroundColor: COLORS.green,
        },

        "&:hover": {
          transform: "translateY(-4px)",

          boxShadow:
            "0 16px 38px rgba(18, 52, 86, 0.13)",
        },
      }}
    >

      <Box
        sx={{
          height: "100%",

          minHeight: "inherit",

          boxSizing: "border-box",

          padding: {
            xs: "24px",
            sm: "28px",
            md: "30px",
          },

          paddingLeft: {
            xs: "28px",
            sm: "32px",
            md: "34px",
          },

          display: "flex",

          flexDirection: "column",
        }}
      >

        {/* =========================================
            CARD HEADER
        ========================================= */}

        <Box
          sx={{
            display: "flex",

            alignItems: "center",

            gap: "14px",

            mb: "16px",
          }}
        >

          <Box
            sx={{
              width: {
                xs: "42px",
                md: "46px",
              },

              height: {
                xs: "42px",
                md: "46px",
              },

              borderRadius: "50%",

              backgroundColor: COLORS.greenLight,

              color: COLORS.green,

              display: "flex",

              alignItems: "center",

              justifyContent: "center",

              flexShrink: 0,
            }}
          >
            {icon}
          </Box>


          <Typography
            sx={{
              fontFamily: FONT,

              fontSize: {
                xs: "18px",
                sm: "19px",
                md: "20px",
              },

              fontWeight: 700,

              color: COLORS.greenDark,

              lineHeight: 1.3,
            }}
          >
            {title}
          </Typography>

        </Box>


        {/* =========================================
            SMALL GREEN LINE
        ========================================= */}

        <Box
          sx={{
            width: "40px",

            height: "3px",

            borderRadius: "10px",

            backgroundColor: COLORS.green,

            mb: "20px",
          }}
        />


        {/* =========================================
            CARD CONTENT
        ========================================= */}

        <Box
          sx={{
            flex: 1,

            minWidth: 0,

            overflow: "hidden",
          }}
        >
          {children}
        </Box>

      </Box>

    </Card>
  );
}


/* =====================================================
   RELATED INFORMATION
===================================================== */

function RelatedInformationCard({
  relatedInformation = [],
}) {

  return (
    <InformationCard
      title="RELATED INFORMATION"
      icon={
        <InfoRounded
          sx={{
            fontSize: {
              xs: 22,
              md: 25,
            },
          }}
        />
      }
    >

      <Box
        component="ul"
        sx={{
          margin: 0,

          padding: 0,

          listStyle: "none",

          display: "flex",

          flexDirection: "column",

          gap: "8px",

          overflowY: "auto",

          maxHeight: {
            xs: "280px",
            sm: "330px",
            md: "370px",
          },

          "&::-webkit-scrollbar": {
            width: "5px",
          },

          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "#B9DCCE",

            borderRadius: "10px",
          },
        }}
      >

        {relatedInformation.map((item, index) => (

          <Box
            component="li"
            key={index}
            sx={{
              display: "flex",

              alignItems: "flex-start",

              gap: "12px",

              padding: {
                xs: "12px",
                md: "14px",
              },

              borderRadius: "9px",

              backgroundColor: "#F4FAF8",

              transition:
                "background-color 180ms ease",

              "&:hover": {
                backgroundColor: COLORS.greenLight,
              },
            }}
          >

            {/* BULLET */}

            <Box
              sx={{
                width: "7px",

                height: "7px",

                borderRadius: "50%",

                backgroundColor: COLORS.green,

                marginTop: "8px",

                flexShrink: 0,
              }}
            />


            <Typography
              sx={{
                fontFamily: FONT,

                fontSize: {
                  xs: "13px",
                  sm: "14px",
                  md: "15px",
                },

                fontWeight: 500,

                lineHeight: 1.6,

                color: COLORS.body,

                wordBreak: "break-word",
              }}
            >
              {item}
            </Typography>

          </Box>

        ))}

      </Box>

    </InformationCard>
  );
}


/* =====================================================
   IMAGE INFORMATION CARD
===================================================== */

function ImageInformationCard({
  title,
  imageUrl,
  icon,
  alt,
}) {

  return (
    <InformationCard
      title={title}
      icon={icon}
    >

      <Box
        sx={{
          width: "100%",

          height: "100%",

          minHeight: {
            xs: "250px",
            sm: "300px",
            md: "350px",
          },

          borderRadius: "10px",

          backgroundColor: "#F3F9F7",

          border: "1px solid #E4F0EC",

          display: "flex",

          alignItems: "center",

          justifyContent: "center",

          overflow: "hidden",

          padding: {
            xs: "10px",
            md: "14px",
          },

          boxSizing: "border-box",
        }}
      >

        {imageUrl ? (

          <Box
            component="img"
            src={imageUrl}
            alt={alt}
            sx={{
              width: "100%",

              height: "100%",

              maxHeight: "100%",

              objectFit: "contain",

              display: "block",
            }}
          />

        ) : (

          <Typography
            sx={{
              fontFamily: FONT,

              fontSize: {
                xs: "14px",
                md: "16px",
              },

              color: COLORS.body,

              textAlign: "center",
            }}
          >
            Image will be displayed here
          </Typography>

        )}

      </Box>

    </InformationCard>
  );
}


/* =====================================================
   MAIN PAGE
===================================================== */

export default function CustomerSupportStatsPage({

  selectedItem = "",

  relatedInformation = [],

  tableImage = "",

  graphImage = "",

  onBack,

  onExport,

  onEvaluatorNotes,

}) {

  return (
    <>
      <CssBaseline />


      <Box
        sx={{
          minHeight: "100vh",

          display: "flex",

          flexDirection: "column",

          backgroundColor: COLORS.background,

          fontFamily: FONT,
        }}
      >


        {/* =================================================
            HEADER
        ================================================= */}

        <Box
          component="header"
          sx={{
            position: "sticky",

            top: 0,

            zIndex: 1100,

            minHeight: {
              xs: "64px",
              sm: "70px",
              md: "78px",
            },

            display: "flex",

            alignItems: "center",

            backgroundColor: COLORS.navy,

            borderBottom:
              "3px solid #087FF5",

            px: {
              xs: "18px",
              sm: "4vw",
              md: "5vw",
            },

            boxSizing: "border-box",
          }}
        >

          {/* LOGO / MARK */}

          <Box
            sx={{
              width: {
                xs: "34px",
                md: "42px",
              },

              height: {
                xs: "34px",
                md: "42px",
              },

              borderRadius: "50%",

              border: "2px solid rgba(255,255,255,0.8)",

              mr: {
                xs: "10px",
                md: "16px",
              },
            }}
          />


          {/* HEADER TITLE */}

          <Typography
            sx={{
              fontFamily: FONT,

              fontSize: {
                xs: "16px",
                sm: "20px",
                md: "25px",
              },

              fontWeight: 700,

              color: "#FFFFFF",

              letterSpacing: "-0.3px",

              whiteSpace: {
                xs: "normal",
                md: "nowrap",
              },
            }}
          >
            CUSTOMER SUPPORT STATISTICS DASHBOARD
          </Typography>


          <Box sx={{ flex: 1 }} />


          <Typography
            sx={{
              display: {
                xs: "none",
                lg: "block",
              },

              fontFamily: FONT,

              fontSize: "14px",

              color: "#C7D4E5",
            }}
          >
            Analytics at your fingertips
          </Typography>

        </Box>


        {/* =================================================
            MAIN
        ================================================= */}

        <Box
          component="main"
          sx={{
            flex: 1,

            position: "relative",

            overflow: "hidden",

            background: `
              radial-gradient(
                circle at 92% 8%,
                rgba(0, 132, 255, 0.06),
                transparent 22%
              ),

              radial-gradient(
                circle at 0% 65%,
                rgba(15, 168, 120, 0.035),
                transparent 25%
              ),

              ${COLORS.background}
            `,

            paddingTop: {
              xs: "24px",
              sm: "30px",
              md: "36px",
            },

            paddingBottom: {
              xs: "40px",
              md: "55px",
            },

            paddingLeft:
              "clamp(18px, 6vw, 96px)",

            paddingRight:
              "clamp(18px, 6vw, 96px)",
          }}
        >


          {/* =================================================
              DECORATIVE DOTS
          ================================================= */}

          <Box
            sx={{
              position: "absolute",

              top: 0,

              right: 0,

              width: {
                xs: "150px",
                md: "300px",
              },

              height: {
                xs: "150px",
                md: "230px",
              },

              pointerEvents: "none",

              opacity: 0.5,

              backgroundImage: `
                radial-gradient(
                  #087FF525 1px,
                  transparent 1px
                )
              `,

              backgroundSize: "12px 12px",

              maskImage:
                "linear-gradient(135deg, black, transparent)",

              WebkitMaskImage:
                "linear-gradient(135deg, black, transparent)",
            }}
          />


          {/* =================================================
              CONTENT CONTAINER
          ================================================= */}

          <Box
            sx={{
              position: "relative",

              zIndex: 2,

              width: "100%",

              maxWidth: "1500px",

              margin: "0 auto",
            }}
          >


            {/* =================================================
                TOP ACTIONS
            ================================================= */}

            <Box
              sx={{
                display: "flex",

                alignItems: "center",

                justifyContent: "space-between",

                gap: "12px",

                mb: {
                  xs: "24px",
                  md: "30px",
                },

                flexWrap: "wrap",
              }}
            >

              {/* BACK */}

              <Button
                onClick={onBack}
                startIcon={
                  <ArrowBackRounded />
                }
                sx={{
                  fontFamily: FONT,

                  fontSize: {
                    xs: "13px",
                    md: "14px",
                  },

                  fontWeight: 600,

                  color: COLORS.blue,

                  textTransform: "none",

                  border:
                    "1px solid #C9DDF5",

                  borderRadius: "8px",

                  padding:
                    "8px 16px",

                  backgroundColor:
                    "#FFFFFF",

                  "&:hover": {
                    backgroundColor:
                      "#F2F8FF",
                  },
                }}
              >
                Back
              </Button>


              {/* RIGHT ACTIONS */}

              <Box
                sx={{
                  display: "flex",

                  gap: {
                    xs: "8px",
                    sm: "12px",
                  },

                  flexWrap: "wrap",
                }}
              >

                <Button
                  onClick={onExport}
                  startIcon={
                    <DownloadRounded />
                  }
                  sx={{
                    fontFamily: FONT,

                    fontSize: {
                      xs: "12px",
                      md: "14px",
                    },

                    fontWeight: 700,

                    color: COLORS.blue,

                    textTransform: "none",

                    border:
                      "1px solid #A8CBF5",

                    borderRadius: "8px",

                    padding:
                      "8px 18px",

                    backgroundColor:
                      "#FFFFFF",

                    "&:hover": {
                      backgroundColor:
                        "#F2F8FF",
                    },
                  }}
                >
                  Export
                </Button>


                <Button
                  onClick={onEvaluatorNotes}
                  startIcon={
                    <NotesRounded />
                  }
                  sx={{
                    fontFamily: FONT,

                    fontSize: {
                      xs: "12px",
                      md: "14px",
                    },

                    fontWeight: 700,

                    color: COLORS.blue,

                    textTransform: "none",

                    border:
                      "1px solid #A8CBF5",

                    borderRadius: "8px",

                    padding:
                      "8px 18px",

                    backgroundColor:
                      "#FFFFFF",

                    "&:hover": {
                      backgroundColor:
                        "#F2F8FF",
                    },
                  }}
                >
                  Evaluator Notes
                </Button>

              </Box>

            </Box>


            {/* =================================================
                PAGE TITLE
            ================================================= */}

            <Typography
              component="h1"
              sx={{
                fontFamily: FONT,

                fontSize:
                  "clamp(26px, 3vw, 42px)",

                fontWeight: 700,

                lineHeight: 1.15,

                letterSpacing: "-1px",

                color: COLORS.heading,

                textAlign: "left",

                mb: "12px",

                wordBreak: "break-word",
              }}
            >
              {selectedItem} Customer Stats Page
            </Typography>


            {/* BLUE / GREEN UNDERLINE */}

            <Box
              sx={{
                width: "38px",

                height: "3px",

                borderRadius: "10px",

                backgroundColor: COLORS.green,

                mb: {
                  xs: "26px",
                  md: "34px",
                },
              }}
            />


            {/* =================================================
                THREE INFORMATION CARDS
            ================================================= */}

            <Box
              sx={{
                display: "grid",

                gridTemplateColumns: {
                  xs: "1fr",

                  md:
                    "minmax(0, 0.9fr) minmax(0, 1.25fr) minmax(0, 1.25fr)",
                },

                gap: {
                  xs: "20px",
                  sm: "24px",
                  md: "28px",
                },

                alignItems: "stretch",
              }}
            >


              {/* =============================================
                  RELATED INFORMATION
              ============================================= */}

              <RelatedInformationCard
                relatedInformation={
                  relatedInformation
                }
              />


              {/* =============================================
                  TABLE INFORMATION
              ============================================= */}

              <ImageInformationCard
                title="TABLE INFORMATION"

                imageUrl={
                  tableImage
                }

                alt="Table information"

                icon={
                  <TableChartRounded
                    sx={{
                      fontSize: {
                        xs: 22,
                        md: 25,
                      },
                    }}
                  />
                }
              />


              {/* =============================================
                  GRAPH INFORMATION
              ============================================= */}

              <ImageInformationCard
                title="GRAPH INFORMATION"

                imageUrl={
                  graphImage
                }

                alt="Graph information"

                icon={
                  <BarChartRounded
                    sx={{
                      fontSize: {
                        xs: 22,
                        md: 25,
                      },
                    }}
                  />
                }
              />

            </Box>

          </Box>

        </Box>


        {/* =================================================
            FOOTER
        ================================================= */}

        <Box
          component="footer"
          sx={{
            backgroundColor: COLORS.navy,

            minHeight: {
              xs: "74px",
              md: "90px",
            },

            px: "20px",

            py: {
              xs: "14px",
              md: "18px",
            },

            display: "flex",

            flexDirection: "column",

            alignItems: "center",

            justifyContent: "center",

            gap: "8px",

            boxSizing: "border-box",
          }}
        >

          <Typography
            sx={{
              fontFamily: FONT,

              fontSize: {
                xs: "11px",
                md: "13px",
              },

              fontWeight: 500,

              color: "#C2CFDE",

              textAlign: "center",
            }}
          >
            © 2026 Software India Pvt Ltd. All Rights Reserved.
          </Typography>


          <Typography
            sx={{
              fontFamily: FONT,

              fontSize: {
                xs: "10px",
                md: "12px",
              },

              color: "#8FA3BA",

              textAlign: "center",
            }}
          >
            To recipients eyes only.
          </Typography>

        </Box>

      </Box>
    </>
  );
}
