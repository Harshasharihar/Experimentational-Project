import React from "react";

import {
  Box,
  Typography,
  Card,
  CardContent,
  CssBaseline,
} from "@mui/material";

import { ArrowForwardRounded } from "@mui/icons-material";

import "@fontsource/manrope/400.css";
import "@fontsource/manrope/500.css";
import "@fontsource/manrope/600.css";
import "@fontsource/manrope/700.css";


// =====================================================
// FONT
// =====================================================

const FONT = "'Manrope', sans-serif";


// =====================================================
// COLORS
// =====================================================

const COLORS = {
  background: "#F5F9FE",

  heading: "#071A3A",
  body: "#31486A",

  blue: "#087FF5",
  blueDark: "#0068D9",
  blueLight: "#E7F2FF",

  green: "#10A878",
  greenDark: "#008C68",
  greenLight: "#E5F8F2",

  white: "#FFFFFF",

  border: "#E1EAF4",

  header: "#031A38",
};


// =====================================================
// PERFORMANCE 3D ICON
// =====================================================

function PerformanceIcon() {
  return (
    <Box
      sx={{
        width: "clamp(150px, 12vw, 190px)",
        height: "clamp(150px, 12vw, 190px)",

        display: "flex",
        alignItems: "center",
        justifyContent: "center",

        flexShrink: 0,
      }}
    >
      <svg
        viewBox="0 0 220 220"
        width="100%"
        height="100%"
      >
        <defs>

          <linearGradient
            id="performanceBar"
            x1="0"
            y1="0"
            x2="1"
            y2="1"
          >
            <stop
              offset="0%"
              stopColor="#087FF5"
            />

            <stop
              offset="100%"
              stopColor="#0054B8"
            />
          </linearGradient>

          <linearGradient
            id="performanceArrow"
            x1="0"
            y1="1"
            x2="1"
            y2="0"
          >
            <stop
              offset="0%"
              stopColor="#087FF5"
            />

            <stop
              offset="100%"
              stopColor="#004FAE"
            />
          </linearGradient>

          <linearGradient
            id="performanceBase"
            x1="0"
            y1="0"
            x2="0"
            y2="1"
          >
            <stop
              offset="0%"
              stopColor="#FFFFFF"
            />

            <stop
              offset="100%"
              stopColor="#C8D3E0"
            />
          </linearGradient>

          <filter
            id="performanceShadow"
            x="-30%"
            y="-30%"
            width="160%"
            height="160%"
          >
            <feDropShadow
              dx="0"
              dy="7"
              stdDeviation="7"
              floodOpacity="0.18"
            />
          </filter>

        </defs>


        {/* SOFT CIRCLE */}

        <circle
          cx="105"
          cy="103"
          r="75"
          fill="#EAF4FF"
        />


        {/* BASE SHADOW */}

        <ellipse
          cx="108"
          cy="174"
          rx="69"
          ry="15"
          fill="#B9C8D8"
          opacity="0.45"
        />


        {/* BASE */}

        <ellipse
          cx="108"
          cy="161"
          rx="68"
          ry="18"
          fill="url(#performanceBase)"
          filter="url(#performanceShadow)"
        />

        <ellipse
          cx="108"
          cy="155"
          rx="65"
          ry="15"
          fill="#EAF0F6"
        />


        {/* SMALL BAR */}

        <path
          d="
            M52 145
            L52 116
            Q52 112 57 111
            L72 108
            Q77 108 77 113
            L77 148
            Z
          "
          fill="url(#performanceBar)"
        />


        {/* MEDIUM BAR */}

        <path
          d="
            M83 145
            L83 91
            Q83 87 88 86
            L105 82
            Q110 82 110 87
            L110 148
            Z
          "
          fill="url(#performanceBar)"
        />


        {/* LARGE BAR */}

        <path
          d="
            M116 145
            L116 65
            Q116 61 121 60
            L140 56
            Q145 56 145 61
            L145 148
            Z
          "
          fill="url(#performanceBar)"
        />


        {/* BAR HIGHLIGHTS */}

        <path
          d="
            M54 116
            L58 115
            L58 143
            L54 144
            Z
          "
          fill="#5EB2FF"
          opacity="0.65"
        />

        <path
          d="
            M85 91
            L90 90
            L90 143
            L85 144
            Z
          "
          fill="#5EB2FF"
          opacity="0.65"
        />

        <path
          d="
            M118 65
            L123 64
            L123 143
            L118 144
            Z
          "
          fill="#5EB2FF"
          opacity="0.65"
        />


        {/* TREND LINE */}

        <path
          d="
            M42 102
            L75 75
            L91 88
            L130 51
            L148 62
            L177 30
          "
          fill="none"
          stroke="url(#performanceArrow)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />


        {/* ARROW HEAD */}

        <path
          d="
            M154 32
            L177 30
            L174 53
          "
          fill="none"
          stroke="#0068D9"
          strokeWidth="8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

      </svg>
    </Box>
  );
}


// =====================================================
// CUSTOMER SUPPORT 3D ICON
// =====================================================

function SupportIcon() {
  return (
    <Box
      sx={{
        width: "clamp(150px, 12vw, 190px)",
        height: "clamp(150px, 12vw, 190px)",

        display: "flex",
        alignItems: "center",
        justifyContent: "center",

        flexShrink: 0,
      }}
    >

      <svg
        viewBox="0 0 220 220"
        width="100%"
        height="100%"
      >

        <defs>

          <linearGradient
            id="headsetGreen"
            x1="0"
            y1="0"
            x2="1"
            y2="1"
          >
            <stop
              offset="0%"
              stopColor="#18C995"
            />

            <stop
              offset="100%"
              stopColor="#007D5D"
            />
          </linearGradient>

          <linearGradient
            id="headsetDark"
            x1="0"
            y1="0"
            x2="0"
            y2="1"
          >
            <stop
              offset="0%"
              stopColor="#20CFA0"
            />

            <stop
              offset="100%"
              stopColor="#008761"
            />
          </linearGradient>

          <filter
            id="supportShadow"
            x="-30%"
            y="-30%"
            width="160%"
            height="160%"
          >
            <feDropShadow
              dx="0"
              dy="7"
              stdDeviation="7"
              floodOpacity="0.16"
            />
          </filter>

        </defs>


        {/* SOFT CIRCLE */}

        <circle
          cx="100"
          cy="104"
          r="75"
          fill="#E3F8F2"
        />


        {/* HEADSET BAND */}

        <path
          d="
            M48 111
            C48 67 69 43 101 43
            C134 43 155 68 155 111
          "
          fill="none"
          stroke="url(#headsetGreen)"
          strokeWidth="14"
          strokeLinecap="round"
        />


        {/* LEFT EAR CUP */}

        <path
          d="
            M40 105
            Q40 96 49 96
            L59 96
            Q66 96 66 104
            L66 134
            Q66 142 58 142
            L49 142
            Q40 142 40 133
            Z
          "
          fill="url(#headsetDark)"
          filter="url(#supportShadow)"
        />


        {/* RIGHT EAR CUP */}

        <path
          d="
            M136 104
            Q136 96 145 96
            L154 96
            Q163 96 163 105
            L163 134
            Q163 142 154 142
            L145 142
            Q136 142 136 133
            Z
          "
          fill="url(#headsetDark)"
          filter="url(#supportShadow)"
        />


        {/* MICROPHONE */}

        <path
          d="
            M159 135
            C178 135 184 145 184 158
            C184 168 177 174 165 174
            L143 174
          "
          fill="none"
          stroke="#008C68"
          strokeWidth="8"
          strokeLinecap="round"
        />


        <circle
          cx="139"
          cy="174"
          r="8"
          fill="#008C68"
        />


        {/* CHAT BUBBLE */}

        <path
          d="
            M145 141
            C145 125 158 115 177 115
            L195 115
            C211 115 220 126 220 141
            L220 158
            C220 173 209 183 195 183
            L184 183
            L177 195
            L177 183
            L168 183
            C154 183 145 173 145 158
            Z
          "
          fill="url(#headsetGreen)"
          filter="url(#supportShadow)"
        />


        {/* CHAT DOTS */}

        <circle
          cx="169"
          cy="149"
          r="5"
          fill="#FFFFFF"
        />

        <circle
          cx="184"
          cy="149"
          r="5"
          fill="#FFFFFF"
        />

        <circle
          cx="199"
          cy="149"
          r="5"
          fill="#FFFFFF"
        />

      </svg>

    </Box>
  );
}


// =====================================================
// DASHBOARD CARD
// =====================================================

function DashboardCard({
  type,
  title,
  description,
}) {

  const performance = type === "performance";

  const accent = performance
    ? COLORS.blue
    : COLORS.green;

  const iconBackground = performance
    ? COLORS.blueLight
    : COLORS.greenLight;


  return (
    <Card
      sx={{
        position: "relative",

        width: "100%",

        minHeight: {
          xs: "400px",
          sm: "410px",
          md: "440px",
        },

        borderRadius: "14px",

        backgroundColor: COLORS.white,

        border: `1px solid ${COLORS.border}`,

        boxShadow:
          "0 10px 30px rgba(15, 45, 80, 0.09)",

        overflow: "hidden",

        transition:
          "transform 220ms ease, box-shadow 220ms ease",

        "&:hover": {
          transform: "translateY(-5px)",

          boxShadow:
            "0 18px 40px rgba(15, 45, 80, 0.15)",
        },

        /* LEFT ACCENT */

        "&::before": {
          content: '""',

          position: "absolute",

          left: 0,
          top: 0,
          bottom: 0,

          width: "6px",

          backgroundColor: accent,

          zIndex: 5,
        },
      }}
    >

      <CardContent
        sx={{
          height: "100%",

          minHeight: "inherit",

          boxSizing: "border-box",

          padding: {
            xs: "28px",
            sm: "32px",
            md: "40px",
          },

          paddingLeft: {
            xs: "34px",
            sm: "40px",
            md: "42px",
          },

          paddingRight: {
            xs: "28px",
            sm: "34px",
            md: "40px",
          },

          "&:last-child": {
            paddingBottom: {
              xs: "28px",
              md: "40px",
            },
          },

          display: "flex",

          flexDirection: "column",

          position: "relative",
        }}
      >

        {/* =========================================
            DECORATIVE GRAPH BACKGROUND
        ========================================= */}

        <Box
          sx={{
            position: "absolute",

            right: "-10px",

            bottom: "-15px",

            width: {
              xs: "50%",
              md: "58%",
            },

            height: "52%",

            opacity: 0.16,

            pointerEvents: "none",

            backgroundImage: `
              linear-gradient(
                to top,
                ${accent},
                transparent
              )
            `,

            clipPath: `
              polygon(
                0% 90%,
                12% 78%,
                22% 83%,
                35% 62%,
                48% 70%,
                60% 45%,
                72% 58%,
                85% 25%,
                100% 0%,
                100% 100%,
                0% 100%
              )
            `,
          }}
        />


        {/* =========================================
            CARD TOP CONTENT
        ========================================= */}

        <Box
          sx={{
            position: "relative",

            zIndex: 2,

            display: "flex",

            alignItems: "center",

            gap: {
              xs: "18px",
              sm: "24px",
              md: "30px",
            },

            flexDirection: {
              xs: "column",
              sm: "row",
            },

            textAlign: "left",

            flex: 1,
          }}
        >

          {/* =======================================
              ICON
          ======================================= */}

          <Box
            sx={{
              width: {
                xs: "145px",
                sm: "150px",
                md: "170px",
              },

              height: {
                xs: "145px",
                sm: "150px",
                md: "170px",
              },

              borderRadius: "50%",

              backgroundColor: iconBackground,

              display: "flex",

              alignItems: "center",

              justifyContent: "center",

              flexShrink: 0,

              alignSelf: {
                xs: "flex-start",
                sm: "center",
              },
            }}
          >

            {performance
              ? <PerformanceIcon />
              : <SupportIcon />
            }

          </Box>


          {/* =======================================
              TEXT
          ======================================= */}

          <Box
            sx={{
              position: "relative",

              zIndex: 3,

              flex: 1,

              width: "100%",

              textAlign: "left",
            }}
          >

            {/* TITLE */}

            <Typography
              sx={{
                fontFamily: FONT,

                fontSize: {
                  xs: "20px",
                  sm: "21px",
                  md: "24px",
                },

                fontWeight: 700,

                lineHeight: 1.3,

                letterSpacing: "-0.5px",

                color: COLORS.heading,

                textAlign: "left",

                mb: "16px",
              }}
            >
              {title}
            </Typography>


            {/* SMALL ACCENT LINE */}

            <Box
              sx={{
                width: "34px",

                height: "3px",

                borderRadius: "5px",

                backgroundColor: accent,

                mb: "22px",
              }}
            />


            {/* DESCRIPTION */}

            <Typography
              sx={{
                fontFamily: FONT,

                fontSize: {
                  xs: "14px",
                  sm: "15px",
                  md: "16px",
                },

                fontWeight: 400,

                lineHeight: 1.8,

                color: COLORS.body,

                textAlign: "left",

                maxWidth: {
                  xs: "100%",
                  sm: "390px",
                  md: "420px",
                },
              }}
            >
              {description}
            </Typography>

          </Box>

        </Box>


        {/* =========================================
            EXPLORE BUTTON
        ========================================= */}

        <Box
          sx={{
            position: "relative",

            zIndex: 4,

            display: "flex",

            alignItems: "center",

            justifyContent: "space-between",

            width: "fit-content",

            minWidth: {
              xs: "190px",
              sm: "205px",
            },

            height: "48px",

            px: "16px",

            borderRadius: "9px",

            border: `1px solid ${accent}`,

            color: accent,

            fontFamily: FONT,

            fontSize: {
              xs: "14px",
              md: "15px",
            },

            fontWeight: 700,

            cursor: "pointer",

            transition:
              "background-color 180ms ease, transform 180ms ease",

            "&:hover": {
              backgroundColor: performance
                ? "#F1F8FF"
                : "#F0FBF7",

              transform: "translateX(3px)",
            },
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
            sx={{
              fontSize: "25px",

              ml: "12px",
            }}
          />

        </Box>

      </CardContent>

    </Card>
  );
}


// =====================================================
// HEADER
// =====================================================

function Header() {

  return (
    <Box
      component="header"
      sx={{
        height: {
          xs: "70px",
          sm: "78px",
          md: "94px",
        },

        px: {
          xs: "20px",
          sm: "4vw",
          md: "3.2vw",
        },

        display: "flex",

        alignItems: "center",

        justifyContent: "space-between",

        backgroundColor: COLORS.header,

        borderBottom:
          "4px solid #0787F8",

        color: "#FFFFFF",
      }}
    >

      {/* LEFT */}

      <Box
        sx={{
          display: "flex",

          alignItems: "center",

          gap: {
            xs: "12px",
            md: "20px",
          },
        }}
      >

        {/* SIMPLE LOGO */}

        <Box
          sx={{
            width: {
              xs: "34px",
              md: "46px",
            },

            height: {
              xs: "34px",
              md: "46px",
            },

            borderRadius: "50%",

            border:
              "3px dotted #FFFFFF",

            display: "flex",

            alignItems: "center",

            justifyContent: "center",

            color: "#FFFFFF",

            fontSize: {
              xs: "17px",
              md: "23px",
            },

            fontWeight: 700,
          }}
        >
          D
        </Box>


        <Typography
          sx={{
            fontFamily: FONT,

            fontSize: {
              xs: "16px",
              sm: "20px",
              md: "25px",
            },

            fontWeight: 700,

            letterSpacing: {
              xs: "-0.3px",
              md: "-0.5px",
            },

            whiteSpace: "nowrap",
          }}
        >
          DEVICE PROMOTION STATS DASHBOARD
        </Typography>

      </Box>


      {/* RIGHT */}

      <Box
        sx={{
          display: {
            xs: "none",
            md: "flex",
          },

          alignItems: "center",

          gap: "18px",
        }}
      >

        <Box
          sx={{
            width: "44px",

            height: "44px",

            border:
              "1px solid rgba(255,255,255,0.35)",

            borderRadius: "9px",

            display: "flex",

            alignItems: "center",

            justifyContent: "center",

            fontSize: "23px",
          }}
        >
          ↗
        </Box>


        <Box
          sx={{
            width: "1px",

            height: "34px",

            backgroundColor:
              "rgba(255,255,255,0.25)",
          }}
        />


        <Typography
          sx={{
            fontFamily: FONT,

            fontSize: "15px",

            color: "#D8E3F2",
          }}
        >
          Analytics at your fingertips
        </Typography>

      </Box>

    </Box>
  );
}


// =====================================================
// MAIN APPLICATION
// =====================================================

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

        {/* ===========================================
            HEADER
        =========================================== */}

        <Header />


        {/* ===========================================
            MAIN
        =========================================== */}

        <Box
          component="main"
          sx={{
            position: "relative",

            flex: 1,

            overflow: "hidden",

            background: `
              radial-gradient(
                circle at 88% 10%,
                rgba(0, 132, 255, 0.075),
                transparent 20%
              ),

              radial-gradient(
                circle at 0% 70%,
                rgba(0, 132, 255, 0.045),
                transparent 25%
              ),

              ${COLORS.background}
            `,

            px: {
              xs: "20px",
              sm: "5vw",
              md: "8vw",
            },

            pt: {
              xs: "36px",
              sm: "42px",
              md: "58px",
            },

            pb: {
              xs: "50px",
              md: "70px",
            },
          }}
        >

          {/* ========================================
              DECORATIVE DOTS
          ======================================== */}

          <Box
            sx={{
              position: "absolute",

              top: 0,

              right: 0,

              width: "260px",

              height: "190px",

              opacity: 0.55,

              pointerEvents: "none",

              backgroundImage: `
                radial-gradient(
                  #087FF5 1px,
                  transparent 1px
                )
              `,

              backgroundSize: "11px 11px",

              maskImage:
                "linear-gradient(135deg, black, transparent)",

              WebkitMaskImage:
                "linear-gradient(135deg, black, transparent)",
            }}
          />


          {/* ========================================
              CONTENT
          ======================================== */}

          <Box
            sx={{
              position: "relative",

              zIndex: 2,

              width: "100%",

              maxWidth: "1290px",

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
                  xs: "11px",
                  md: "13px",
                },

                fontWeight: 700,

                letterSpacing: {
                  xs: "3.5px",
                  md: "5px",
                },

                color: COLORS.blue,

                lineHeight: 1,

                textAlign: "left",

                mb: "12px",
              }}
            >
              DASHBOARD
            </Typography>


            {/* LINE */}

            <Box
              sx={{
                width: "30px",

                height: "3px",

                borderRadius: "10px",

                backgroundColor: COLORS.blue,

                mb: {
                  xs: "18px",
                  md: "24px",
                },
              }}
            />


            {/* ======================================
                WELCOME
            ====================================== */}

            <Typography
              component="h1"
              sx={{
                fontFamily: FONT,

                fontSize:
                  "clamp(36px, 3.4vw, 54px)",

                fontWeight: 700,

                lineHeight: 1.1,

                letterSpacing: "-1.8px",

                color: COLORS.heading,

                textAlign: "left",

                mb: {
                  xs: "12px",
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
                  "clamp(15px, 1.15vw, 18px)",

                fontWeight: 400,

                lineHeight: 1.6,

                color: COLORS.body,

                textAlign: "left",

                maxWidth: "720px",
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
                width: "100%",

                maxWidth: "1290px",

                margin: "0 auto",

                display: "grid",

                gridTemplateColumns: {
                  xs: "1fr",
                  md: "repeat(2, minmax(0, 1fr))",
                },

                gap: {
                  xs: "24px",
                  sm: "28px",
                  md: "38px",
                },

                mt: {
                  xs: "36px",
                  sm: "42px",
                  md: "52px",
                },
              }}
            >

              {/* PERFORMANCE */}

              <DashboardCard
                type="performance"
                title="Performance Statistics"
                description="View I/O speed across SoC benchmarks, UFS versions and other performance metrics."
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


        {/* ===========================================
            FOOTER
        =========================================== */}

        <Box
          component="footer"
          sx={{
            minHeight: {
              xs: "80px",
              md: "115px",
            },

            px: "20px",

            py: "20px",

            display: "flex",

            flexDirection: "column",

            alignItems: "center",

            justifyContent: "center",

            backgroundColor: COLORS.header,

            color: "#FFFFFF",
          }}
        >

          {/* MAINTAINERS */}

          <Typography
            sx={{
              fontFamily: FONT,

              fontSize: {
                xs: "12px",
                md: "16px",
              },

              color: "#FFFFFF",

              mb: "12px",
            }}
          >
            Maintainers :{" "}
            <Box
              component="span"
              sx={{
                color: "#00AEEF",

                fontWeight: 600,
              }}
            >
              CTODNAND Bangalore
            </Box>
          </Typography>


          {/* DIVIDER */}

          <Box
            sx={{
              width: {
                xs: "80%",
                md: "44%",
              },

              height: "1px",

              backgroundColor:
                "rgba(255,255,255,0.2)",

              mb: "12px",
            }}
          />


          {/* COPYRIGHT */}

          <Typography
            sx={{
              fontFamily: FONT,

              fontSize: {
                xs: "10px",
                md: "13px",
              },

              color: "#B8C7D9",

              textAlign: "center",
            }}
          >
            © 2026 Software India Pvt Ltd. All Rights Reserved.
          </Typography>

        </Box>

      </Box>
    </>
  );
}


{/* ===========================================
    FOOTER
=========================================== */}

<Box
  component="footer"
  sx={{
    minHeight: {
      xs: "120px",
      sm: "125px",
      md: "130px",
    },

    width: "100%",

    backgroundColor: "#031A38",

    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",

    px: "20px",
    py: "18px",

    boxSizing: "border-box",
  }}
>

  {/* =========================================
      MAINTAINERS ROW
  ========================================= */}

  <Box
    sx={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",

      gap: {
        xs: "10px",
        sm: "14px",
      },

      mb: "14px",
    }}
  >

    {/* PEOPLE ICON CIRCLE */}

    <Box
      sx={{
        width: {
          xs: "36px",
          sm: "42px",
        },

        height: {
          xs: "36px",
          sm: "42px",
        },

        borderRadius: "50%",

        border:
          "1px solid rgba(255,255,255,0.35)",

        display: "flex",

        alignItems: "center",

        justifyContent: "center",

        color: "#FFFFFF",

        fontSize: {
          xs: "18px",
          sm: "21px",
        },

        flexShrink: 0,
      }}
    >
      👥
    </Box>


    {/* MAINTAINERS */}

    <Typography
      sx={{
        fontFamily: FONT,

        fontSize: {
          xs: "14px",
          sm: "16px",
          md: "17px",
        },

        fontWeight: 500,

        color: "#FFFFFF",

        lineHeight: 1,
      }}
    >
      Maintainers :
    </Typography>


    {/* COMPANY */}

    <Typography
      sx={{
        fontFamily: FONT,

        fontSize: {
          xs: "14px",
          sm: "16px",
          md: "17px",
        },

        fontWeight: 500,

        color: "#00AEEF",

        lineHeight: 1,
      }}
    >
      CTODNAND Bangalore
    </Typography>

  </Box>


  {/* =========================================
      HORIZONTAL DIVIDER
  ========================================= */}

  <Box
    sx={{
      width: {
        xs: "90%",
        sm: "70%",
        md: "44%",
      },

      height: "1px",

      backgroundColor:
        "rgba(255,255,255,0.18)",

      mb: {
        xs: "14px",
        md: "16px",
      },
    }}
  />


  {/* =========================================
      COPYRIGHT ROW
  ========================================= */}

  <Box
    sx={{
      display: "flex",

      alignItems: "center",

      justifyContent: "center",

      flexWrap: "wrap",

      gap: {
        xs: "12px",
        sm: "24px",
      },

      textAlign: "center",
    }}
  >

    {/* COPYRIGHT */}

    <Typography
      sx={{
        fontFamily: FONT,

        fontSize: {
          xs: "10px",
          sm: "12px",
          md: "14px",
        },

        fontWeight: 400,

        color: "#C1CDDC",

        lineHeight: 1.4,
      }}
    >
      © 2026 Software India Pvt Ltd. All Rights Reserved.
    </Typography>


    {/* VERTICAL SEPARATOR */}

    <Box
      sx={{
        display: {
          xs: "none",
          sm: "block",
        },

        width: "1px",

        height: "24px",

        backgroundColor:
          "rgba(255,255,255,0.30)",
      }}
    />


    {/* RECIPIENTS */}

    <Typography
      sx={{
        fontFamily: FONT,

        fontSize: {
          xs: "10px",
          sm: "12px",
          md: "14px",
        },

        fontWeight: 400,

        color: "#C1CDDC",

        lineHeight: 1.4,
      }}
    >
      To recipients eyes only.
    </Typography>

  </Box>

</Box>
