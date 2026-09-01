import React from "react";

import {
  Box,
  Typography,
  Card,
  CardContent,
  CssBaseline,
} from "@mui/material";

import {
  ArrowForwardRounded,
  GroupsRounded,
  HomeRounded,
} from "@mui/icons-material";

import "@fontsource/manrope/400.css";
import "@fontsource/manrope/500.css";
import "@fontsource/manrope/600.css";
import "@fontsource/manrope/700.css";


const FONT = "'Manrope', sans-serif";


const COLORS = {
  background: "#F5F9FE",

  heading: "#071A3A",
  body: "#31486A",

  blue: "#087FF5",
  blueLight: "#E7F2FF",

  green: "#10A878",
  greenLight: "#E5F8F2",

  white: "#FFFFFF",

  border: "#E1EAF4",

  header: "#031A38",
};


// =====================================================
// SUPPORT CARD
// =====================================================

function SupportCard({
  title,
  description,
  icon,
  onClick,
}) {
  return (
    <Card
      onClick={onClick}
      sx={{
        position: "relative",

        width: "100%",

        minHeight: {
          xs: "260px",
          sm: "280px",
          md: "300px",
        },

        borderRadius: "14px",

        backgroundColor: COLORS.white,

        border: `1px solid ${COLORS.border}`,

        boxShadow:
          "0 10px 30px rgba(15, 45, 80, 0.08)",

        overflow: "hidden",

        cursor: "pointer",

        transition:
          "transform 220ms ease, box-shadow 220ms ease, border-color 220ms ease",

        // LEFT GREEN ACCENT
        "&::before": {
          content: '""',

          position: "absolute",

          left: 0,
          top: 0,
          bottom: 0,

          width: "6px",

          backgroundColor: COLORS.green,

          zIndex: 5,
        },

        "&:hover": {
          transform: "translateY(-6px)",

          borderColor: COLORS.green,

          boxShadow:
            "0 18px 40px rgba(15, 45, 80, 0.15)",

          "& .support-arrow": {
            transform: "translateX(6px)",
          },

          "& .support-icon": {
            transform: "scale(1.06)",
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

          display: "flex",

          flexDirection: "column",

          padding: {
            xs: "24px",
            sm: "28px",
            md: "32px",
          },

          paddingLeft: {
            xs: "30px",
            sm: "34px",
            md: "38px",
          },

          "&:last-child": {
            paddingBottom: {
              xs: "24px",
              sm: "28px",
              md: "32px",
            },
          },
        }}
      >

        {/* =========================================
            DECORATIVE BACKGROUND
        ========================================= */}

        <Box
          sx={{
            position: "absolute",

            right: "-30px",

            bottom: "-40px",

            width: {
              xs: "220px",
              md: "300px",
            },

            height: {
              xs: "150px",
              md: "190px",
            },

            opacity: 0.12,

            pointerEvents: "none",

            background: `
              linear-gradient(
                to top right,
                ${COLORS.green},
                transparent
              )
            `,

            clipPath: `
              polygon(
                0% 85%,
                15% 70%,
                28% 76%,
                42% 52%,
                55% 65%,
                70% 35%,
                82% 48%,
                100% 5%,
                100% 100%,
                0% 100%
              )
            `,
          }}
        />


        {/* =========================================
            ICON + TITLE
        ========================================= */}

        <Box
          sx={{
            display: "flex",

            alignItems: "center",

            gap: {
              xs: "18px",
              sm: "22px",
              md: "26px",
            },

            position: "relative",

            zIndex: 2,
          }}
        >

          {/* ICON */}

          <Box
            className="support-icon"
            sx={{
              width: {
                xs: "70px",
                sm: "78px",
                md: "86px",
              },

              height: {
                xs: "70px",
                sm: "78px",
                md: "86px",
              },

              flexShrink: 0,

              borderRadius: "50%",

              backgroundColor: COLORS.greenLight,

              display: "flex",

              alignItems: "center",

              justifyContent: "center",

              color: COLORS.green,

              transition:
                "transform 220ms ease",

              overflow: "hidden",
            }}
          >

            {icon ? (
              icon
            ) : (
              <Typography
                sx={{
                  fontSize: "34px",
                  fontWeight: 700,
                  color: COLORS.green,
                }}
              >
                ?
              </Typography>
            )}

          </Box>


          {/* TITLE */}

          <Typography
            sx={{
              fontFamily: FONT,

              fontSize: {
                xs: "18px",
                sm: "20px",
                md: "22px",
              },

              fontWeight: 700,

              lineHeight: 1.3,

              color: COLORS.heading,

              textAlign: "left",
            }}
          >
            {title}
          </Typography>

        </Box>


        {/* =========================================
            ACCENT LINE
        ========================================= */}

        <Box
          sx={{
            width: "34px",

            height: "3px",

            borderRadius: "5px",

            backgroundColor: COLORS.green,

            mt: {
              xs: "20px",
              md: "22px",
            },

            mb: {
              xs: "16px",
              md: "18px",
            },
          }}
        />


        {/* =========================================
            DESCRIPTION
        ========================================= */}

        <Typography
          sx={{
            position: "relative",

            zIndex: 2,

            fontFamily: FONT,

            fontSize: {
              xs: "13px",
              sm: "14px",
              md: "15px",
            },

            fontWeight: 400,

            lineHeight: 1.7,

            color: COLORS.body,

            maxWidth: "420px",

            textAlign: "left",
          }}
        >
          {description}
        </Typography>


        {/* =========================================
            ARROW
        ========================================= */}

        <Box
          sx={{
            position: "relative",

            zIndex: 3,

            mt: "auto",

            display: "flex",

            justifyContent: "flex-end",
          }}
        >

          <ArrowForwardRounded
            className="support-arrow"
            sx={{
              fontSize: {
                xs: "26px",
                md: "30px",
              },

              color: COLORS.green,

              transition:
                "transform 200ms ease",
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
            md: "18px",
          },
        }}
      >

        {/* LOGO */}

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

            flexShrink: 0,
          }}
        >
          D
        </Box>


        <Typography
          sx={{
            fontFamily: FONT,

            fontSize: {
              xs: "15px",
              sm: "19px",
              md: "24px",
            },

            fontWeight: 700,

            whiteSpace: "nowrap",

            color: "#FFFFFF",
          }}
        >
          CUSTOMER SUPPORT STATISTICS DASHBOARD
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

            fontSize: "22px",
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
// FOOTER
// =====================================================

function Footer() {

  return (
    <Box
      component="footer"
      sx={{
        minHeight: {
          xs: "90px",
          sm: "95px",
          md: "100px",
        },

        backgroundColor: COLORS.header,

        display: "flex",

        flexDirection: "column",

        alignItems: "center",

        justifyContent: "center",

        px: "20px",

        py: "8px",

        boxSizing: "border-box",
      }}
    >

      {/* MAINTAINERS */}

      <Box
        sx={{
          display: "flex",

          alignItems: "center",

          gap: "10px",

          mb: "10px",
        }}
      >

        <Box
          sx={{
            width: "38px",

            height: "38px",

            borderRadius: "50%",

            border:
              "1px solid rgba(255,255,255,0.35)",

            display: "flex",

            alignItems: "center",

            justifyContent: "center",

            color: "#FFFFFF",
          }}
        >
          <GroupsRounded />
        </Box>


        <Typography
          sx={{
            fontFamily: FONT,

            fontSize: {
              xs: "13px",
              sm: "15px",
              md: "16px",
            },

            color: "#FFFFFF",
          }}
        >
          Maintainers :
        </Typography>


        <Typography
          sx={{
            fontFamily: FONT,

            fontSize: {
              xs: "13px",
              sm: "15px",
              md: "16px",
            },

            color: "#00AEEF",

            fontWeight: 600,
          }}
        >
          CTODNAND Bangalore
        </Typography>

      </Box>


      {/* DIVIDER */}

      <Box
        sx={{
          width: {
            xs: "85%",
            sm: "65%",
            md: "44%",
          },

          height: "1px",

          backgroundColor:
            "rgba(255,255,255,0.18)",

          mb: "10px",
        }}
      />


      {/* COPYRIGHT */}

      <Box
        sx={{
          display: "flex",

          alignItems: "center",

          justifyContent: "center",

          gap: {
            xs: "10px",
            sm: "24px",
          },

          flexWrap: "wrap",
        }}
      >

        <Typography
          sx={{
            fontFamily: FONT,

            fontSize: {
              xs: "9px",
              sm: "11px",
              md: "13px",
            },

            color: "#B8C7D9",
          }}
        >
          © 2026 Software India Pvt Ltd. All Rights Reserved.
        </Typography>


        <Box
          sx={{
            display: {
              xs: "none",
              sm: "block",
            },

            width: "1px",

            height: "22px",

            backgroundColor:
              "rgba(255,255,255,0.3)",
          }}
        />


        <Typography
          sx={{
            fontFamily: FONT,

            fontSize: {
              xs: "9px",
              sm: "11px",
              md: "13px",
            },

            color: "#B8C7D9",
          }}
        >
          To recipients eyes only.
        </Typography>

      </Box>

    </Box>
  );
}


// =====================================================
// MAIN COMPONENT
// =====================================================

export default function CustomerSupportDashboard({

  /*
   * Pass the backend data from your existing code.
   *
   * Example:
   *
   * supportItems={[
   *   {
   *     name: "Factory Reset Time",
   *     description: "...",
   *     onClick: handleFactoryReset
   *   }
   * ]}
   */

  supportItems = [],

  onHome,

}) {

  return (
    <>
      <CssBaseline />


      <Box
        sx={{
          minHeight: "100vh",

          display: "flex",

          flexDirection: "column",

          backgroundColor:
            COLORS.background,

          fontFamily: FONT,
        }}
      >

        {/* =========================================
            HEADER
        ========================================= */}

        <Header />


        {/* =========================================
            MAIN
        ========================================= */}

        <Box
          component="main"
          sx={{
            flex: 1,

            position: "relative",

            overflow: "hidden",

            background: `
              radial-gradient(
                circle at 88% 8%,
                rgba(0,132,255,0.07),
                transparent 20%
              ),

              radial-gradient(
                circle at 0% 70%,
                rgba(0,132,255,0.04),
                transparent 25%
              ),

              ${COLORS.background}
            `,

            px: {
              xs: "20px",
              sm: "5vw",
              md: "6vw",
            },

            pt: {
              xs: "24px",
              sm: "30px",
              md: "36px",
            },

            pb: {
              xs: "25px",
              md: "30px",
            },
          }}
        >

          {/* ======================================
              DECORATIVE DOTS
          ====================================== */}

          <Box
            sx={{
              position: "absolute",

              top: 0,

              right: 0,

              width: {
                xs: "180px",
                md: "300px",
              },

              height: {
                xs: "140px",
                md: "210px",
              },

              opacity: 0.5,

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


          {/* ======================================
              CONTENT
          ====================================== */}

          <Box
            sx={{
              position: "relative",

              zIndex: 2,

              width: "100%",

              maxWidth: "1400px",

              margin: "0 auto",
            }}
          >

            {/* ====================================
                BACK HOME
            ==================================== */}

            <Box
              onClick={onHome}
              sx={{
                display: "flex",

                alignItems: "center",

                gap: "5px",

                width: "fit-content",

                cursor: "pointer",

                color: COLORS.blue,

                fontFamily: FONT,

                fontSize: {
                  xs: "13px",
                  md: "14px",
                },

                fontWeight: 600,

                mb: {
                  xs: "28px",
                  md: "34px",
                },

                transition:
                  "transform 180ms ease",

                "&:hover": {
                  transform:
                    "translateX(-3px)",
                },
              }}
            >

              <HomeRounded
                sx={{
                  fontSize: "18px",
                }}
              />

              <span>
                Back to Home
              </span>

            </Box>


            {/* ====================================
                PAGE LABEL
            ==================================== */}

            <Typography
              sx={{
                fontFamily: FONT,

                fontSize: {
                  xs: "11px",
                  md: "13px",
                },

                fontWeight: 700,

                letterSpacing: {
                  xs: "3px",
                  md: "5px",
                },

                color: COLORS.blue,

                mb: "12px",
              }}
            >
              CUSTOMER SUPPORT
            </Typography>


            {/* LINE */}

            <Box
              sx={{
                width: "30px",

                height: "3px",

                borderRadius: "10px",

                backgroundColor:
                  COLORS.blue,

                mb: {
                  xs: "18px",
                  md: "22px",
                },
              }}
            />


            {/* ====================================
                PAGE TITLE
            ==================================== */}

            <Typography
              component="h1"
              sx={{
                fontFamily: FONT,

                fontSize:
                  "clamp(30px, 3.2vw, 50px)",

                fontWeight: 700,

                lineHeight: 1.12,

                letterSpacing: "-1.5px",

                color: COLORS.heading,

                mb: {
                  xs: "12px",
                  md: "14px",
                },
              }}
            >
              Customer Support Statistics Dashboard
            </Typography>


            {/* ====================================
                DESCRIPTION
            ==================================== */}

            <Typography
              sx={{
                fontFamily: FONT,

                fontSize:
                  "clamp(14px, 1.1vw, 17px)",

                fontWeight: 400,

                lineHeight: 1.6,

                color: COLORS.body,

                maxWidth: "850px",

                mb: {
                  xs: "30px",
                  md: "42px",
                },
              }}
            >
              Monitor and analyze key customer support
              performance metrics across various dimensions.
            </Typography>


            {/* ====================================
                DYNAMIC CARDS
            ==================================== */}

            <Box
              sx={{
                display: "grid",

                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "repeat(2, minmax(0, 1fr))",
                  lg: "repeat(4, minmax(0, 1fr))",
                },

                gap: {
                  xs: "20px",
                  sm: "24px",
                  md: "28px",
                },

                alignItems: "stretch",
              }}
            >

              {supportItems.map((item, index) => (

                <SupportCard
                  key={
                    item.id ??
                    item.name ??
                    item.title ??
                    index
                  }

                  title={
                    item.name ??
                    item.title
                  }

                  description={
                    item.description ??
                    ""
                  }

                  icon={item.icon}

                  onClick={item.onClick}
                />

              ))}

            </Box>

          </Box>

        </Box>


        {/* =========================================
            FOOTER
        ========================================= */}

        <Footer />

      </Box>
    </>
  );
}
