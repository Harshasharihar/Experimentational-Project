import React from "react";

import {
  Box,
  Typography,
  Card,
  CardContent,
  CssBaseline,
} from "@mui/material";

import {
  BarChartRounded,
  SupportAgentRounded,
  ArrowForwardRounded,
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

  blue: "#087FF5",
  blueLight: "#E5F2FF",

  teal: "#17B897",
  tealLight: "#E2F8F3",

  border: "#E4ECF5",

  white: "#FFFFFF",
};


/* =====================================================
   DASHBOARD CARD
===================================================== */

function DashboardCard({
  type,
  title,
  description,
}) {

  const performance = type === "performance";

  const accent = performance
    ? COLORS.blue
    : COLORS.teal;

  const iconBackground = performance
    ? COLORS.blueLight
    : COLORS.tealLight;


  return (
    <Card
      sx={{
        position: "relative",

        width: "100%",

        minHeight: {
          xs: "360px",
          sm: "370px",
          md: "380px",
        },

        borderRadius: "16px",

        backgroundColor: COLORS.white,

        border: `1px solid ${COLORS.border}`,

        boxShadow:
          "0 8px 28px rgba(18, 52, 86, 0.08)",

        overflow: "hidden",

        cursor: "pointer",

        transition:
          "transform 220ms ease, box-shadow 220ms ease, border-color 220ms ease",

        /* LEFT ACCENT LINE */
        "&::before": {
          content: '""',

          position: "absolute",

          left: 0,
          top: 0,
          bottom: 0,

          width: "4px",

          backgroundColor: accent,
        },

        "&:hover": {
          transform: "translateY(-6px)",

          borderColor: accent,

          boxShadow:
            "0 18px 42px rgba(18, 52, 86, 0.14)",

          "& .card-icon": {
            transform: "scale(1.06)",
          },

          "& .card-arrow": {
            transform: "translateX(5px)",
          },
        },
      }}
    >

      <CardContent
        sx={{
          position: "relative",

          height: "100%",

          minHeight: "inherit",

          boxSizing: "border-box",

          padding: {
            xs: "28px",
            sm: "32px",
            md: "40px",
          },

          paddingLeft: {
            xs: "32px",
            sm: "36px",
            md: "40px",
          },

          "&:last-child": {
            paddingBottom: {
              xs: "28px",
              sm: "32px",
              md: "40px",
            },
          },

          display: "flex",

          flexDirection: "column",
        }}
      >

        {/* ============================================
            DECORATIVE BACKGROUND
        ============================================ */}

        <Box
          sx={{
            position: "absolute",

            right: {
              xs: "-80px",
              md: "-30px",
            },

            top: "60px",

            width: {
              xs: "220px",
              md: "300px",
            },

            height: "220px",

            opacity: 0.45,

            pointerEvents: "none",

            backgroundImage: `
              radial-gradient(
                ${accent}25 1px,
                transparent 1px
              )
            `,

            backgroundSize: "16px 16px",

            maskImage:
              "linear-gradient(to left, black, transparent)",

            WebkitMaskImage:
              "linear-gradient(to left, black, transparent)",
          }}
        />


        {/* ============================================
            ICON
        ============================================ */}

        <Box
          className="card-icon"
          sx={{
            position: "relative",

            zIndex: 2,

            width: {
              xs: "64px",
              sm: "68px",
              md: "72px",
            },

            height: {
              xs: "64px",
              sm: "68px",
              md: "72px",
            },

            borderRadius: "16px",

            backgroundColor: iconBackground,

            display: "flex",

            alignItems: "center",

            justifyContent: "center",

            color: accent,

            transition:
              "transform 220ms ease",

            mb: {
              xs: "26px",
              md: "30px",
            },
          }}
        >

          {performance ? (

            <BarChartRounded
              sx={{
                fontSize: {
                  xs: 36,
                  md: 42,
                },
              }}
            />

          ) : (

            <SupportAgentRounded
              sx={{
                fontSize: {
                  xs: 36,
                  md: 42,
                },
              }}
            />

          )}

        </Box>


        {/* ============================================
            TITLE
        ============================================ */}

        <Typography
          sx={{
            position: "relative",

            zIndex: 2,

            fontFamily: FONT,

            fontSize: {
              xs: "20px",
              sm: "21px",
              md: "23px",
            },

            fontWeight: 700,

            lineHeight: 1.25,

            letterSpacing: "-0.3px",

            color: COLORS.heading,

            mb: "12px",
          }}
        >
          {title}
        </Typography>


        {/* ============================================
            DESCRIPTION
        ============================================ */}

        <Typography
          sx={{
            position: "relative",

            zIndex: 2,

            maxWidth: "450px",

            fontFamily: FONT,

            fontSize: {
              xs: "14px",
              md: "15px",
            },

            fontWeight: 400,

            lineHeight: 1.7,

            color: COLORS.body,
          }}
        >
          {description}
        </Typography>


        {/* ============================================
            DIVIDER
        ============================================ */}

        <Box
          sx={{
            width: "100%",

            height: "1px",

            backgroundColor: COLORS.border,

            mt: "auto",

            mb: "20px",
          }}
        />


        {/* ============================================
            EXPLORE
        ============================================ */}

        <Box
          sx={{
            position: "relative",

            zIndex: 2,

            display: "flex",

            alignItems: "center",

            gap: "8px",

            color: accent,

            fontFamily: FONT,

            fontSize: {
              xs: "14px",
              md: "15px",
            },

            fontWeight: 700,

            width: "fit-content",
          }}
        >

          <Typography
            component="span"
            sx={{
              fontFamily: FONT,

              fontSize: "inherit",

              fontWeight: "inherit",

              color: "inherit",
            }}
          >
            {performance
              ? "Explore performance"
              : "Explore support"}
          </Typography>


          <ArrowForwardRounded
            className="card-arrow"
            sx={{
              fontSize: {
                xs: 20,
                md: 22,
              },

              transition:
                "transform 200ms ease",
            }}
          />

        </Box>

      </CardContent>

    </Card>
  );
}


/* =====================================================
   MAIN APPLICATION
===================================================== */

export default function ReactApp() {

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


        {/* ==========================================
            MAIN
        ========================================== */}

        <Box
          component="main"
          sx={{
            flex: 1,

            position: "relative",

            overflow: "hidden",

            background: `
              radial-gradient(
                circle at 85% 8%,
                rgba(0, 132, 255, 0.06),
                transparent 20%
              ),

              radial-gradient(
                circle at 0% 60%,
                rgba(0, 132, 255, 0.035),
                transparent 25%
              ),

              ${COLORS.background}
            `,

            paddingTop: {
              xs: "42px",
              sm: "48px",
              md: "54px",
            },

            paddingBottom: {
              xs: "60px",
              md: "80px",
            },

            paddingLeft:
              "clamp(20px, 8.5vw, 120px)",

            paddingRight:
              "clamp(20px, 8.5vw, 120px)",
          }}
        >


          {/* ========================================
              TOP RIGHT DOTS
          ======================================== */}

          <Box
            sx={{
              position: "absolute",

              top: 0,

              right: 0,

              width: {
                xs: "180px",
                md: "330px",
              },

              height: {
                xs: "150px",
                md: "220px",
              },

              opacity: 0.6,

              pointerEvents: "none",

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


          {/* ========================================
              CONTENT CONTAINER
          ======================================== */}

          <Box
            sx={{
              position: "relative",

              zIndex: 2,

              width: "100%",

              maxWidth: "1200px",

              margin: "0 auto",
            }}
          >


            {/* ======================================
                DASHBOARD LABEL
            ====================================== */}

            <Typography
              sx={{
                fontFamily: FONT,

                fontSize: {
                  xs: "12px",
                  md: "14px",
                },

                fontWeight: 700,

                letterSpacing: {
                  xs: "4px",
                  md: "5px",
                },

                color: COLORS.blue,

                lineHeight: 1,

                mb: "12px",
              }}
            >
              DASHBOARD
            </Typography>


            {/* BLUE LINE */}

            <Box
              sx={{
                width: "26px",

                height: "3px",

                borderRadius: "10px",

                backgroundColor: COLORS.blue,

                mb: {
                  xs: "20px",
                  md: "24px",
                },
              }}
            />


            {/* ======================================
                MAIN TITLE
            ====================================== */}

            <Typography
              component="h1"
              sx={{
                fontFamily: FONT,

                fontSize:
                  "clamp(34px, 4vw, 52px)",

                fontWeight: 700,

                lineHeight: 1.08,

                letterSpacing: "-1.5px",

                color: COLORS.heading,

                mb: {
                  xs: "14px",
                  md: "16px",
                },
              }}
            >
              Welcome back!
            </Typography>


            {/* ======================================
                SUBTITLE
            ====================================== */}

            <Typography
              sx={{
                fontFamily: FONT,

                fontSize:
                  "clamp(15px, 1.25vw, 18px)",

                fontWeight: 400,

                lineHeight: 1.6,

                color: COLORS.body,

                maxWidth: "700px",
              }}
            >
              Monitor device performance and customer
              support metrics in one place.
            </Typography>


            {/* ======================================
                CARDS
            ====================================== */}

            <Box
              sx={{
                display: "grid",

                gridTemplateColumns: {
                  xs: "1fr",
                  md: "repeat(2, minmax(0, 1fr))",
                },

                gap: {
                  xs: "22px",
                  sm: "26px",
                  md: "34px",
                },

                mt: {
                  xs: "38px",
                  sm: "42px",
                  md: "48px",
                },
              }}
            >


              {/* PERFORMANCE */}

              <DashboardCard
                type="performance"
                title="Performance Statistics"
                description="View I/O speed across SoC benchmarks,   versions and other performance metrics."
              />


              {/* CUSTOMER SUPPORT */}

              <DashboardCard
                type="support"
                title="Customer Support Statistics"
                description="View factory reset, WAF, different HS-Gear performance, RTT info and more."
              />

            </Box>

          </Box>

        </Box>


        {/* ==========================================
            FOOTER
        ========================================== */}

        <Box
          component="footer"
          sx={{
            minHeight: {
              xs: "58px",
              md: "64px",
            },

            px: "20px",

            py: "12px",

            display: "flex",

            alignItems: "center",

            justifyContent: "center",

            textAlign: "center",

            backgroundColor: "#061A2D",
          }}
        >

          <Typography
            sx={{
              fontFamily: FONT,

              fontSize: {
                xs: "11px",
                md: "12px",
              },

              fontWeight: 500,

              color: "#B7C5D6",
            }}
          >
            © 2026 Software India Pvt Ltd. All Rights Reserved.
          </Typography>

        </Box>


      </Box>
    </>
  );
}
