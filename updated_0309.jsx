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
  {/* GRAPH HEADER */}
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
      sx={{
        color: theme.blue,
        fontSize: 19,
      }}
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
      {/* LEGEND */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexWrap: "wrap",
          gap: { xs: 1.5, sm: 3 },
          mb: 2.5,
          px: 1,
        }}
      >
        {graphData.map((series, seriesIndex) => {
          const barColors = [
            "#1976D2",
            "#2E9B59",
            "#F28C18",
            "#7B4AB5",
            "#239CA5",
            "#D64550",
            "#6B7280",
            "#E05A9D",
          ];

          const color =
            barColors[seriesIndex % barColors.length];

          return (
            <Box
              key={seriesIndex}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.7,
              }}
            >
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  background: color,
                  borderRadius: "2px",
                  boxShadow: `2px 2px 0 ${color}55`,
                }}
              />

              <Typography
                sx={{
                  fontFamily: "Manrope, sans-serif",
                  fontSize: 11,
                  fontWeight: 700,
                  color: theme.navy,
                  whiteSpace: "nowrap",
                }}
              >
                {labelOf(series?.name) ||
                  `Scenario ${seriesIndex + 1}`}
              </Typography>
            </Box>
          );
        })}
      </Box>

      {/* CHART */}
      <Box
        sx={{
          position: "relative",
          display: "flex",
          width: "100%",
          minHeight: 390,
          pt: 2,
          pb: 5,
          pl: { xs: 5, sm: 7 },
          pr: { xs: 1, sm: 3 },
        }}
      >
        {/* Y AXIS TITLE */}
        <Typography
          sx={{
            position: "absolute",
            left: 2,
            top: "50%",
            transform: "rotate(-90deg) translateX(50%)",
            transformOrigin: "left top",
            fontFamily: "Manrope, sans-serif",
            fontSize: 10,
            fontWeight: 700,
            color: theme.navy,
            whiteSpace: "nowrap",
          }}
        >
          PERFORMANCE VALUE
        </Typography>

        {/* Y AXIS */}
        <Box
          sx={{
            position: "absolute",
            left: 42,
            top: 20,
            bottom: 67,
            width: 1,
            borderLeft: `1px solid ${theme.border}`,
          }}
        >
          {(() => {
            const tickCount = 5;
            const tickStep = maxGraphValue / tickCount;

            return Array.from(
              { length: tickCount + 1 },
              (_, index) => {
                const value = tickStep * index;
                const bottom =
                  (index / tickCount) * 100;

                return (
                  <Box
                    key={index}
                    sx={{
                      position: "absolute",
                      left: 0,
                      right: -10000,
                      bottom: `${bottom}%`,
                      borderTop:
                        index === 0
                          ? `1px solid ${theme.border}`
                          : "1px dashed #E3EAF3",
                    }}
                  >
                    <Typography
                      sx={{
                        position: "absolute",
                        left: -37,
                        top: -7,
                        width: 32,
                        textAlign: "right",
                        fontFamily: "Manrope, sans-serif",
                        fontSize: 9,
                        fontWeight: 600,
                        color: theme.muted,
                      }}
                    >
                      {value >= 1000
                        ? `${(value / 1000).toFixed(1)}K`
                        : value.toLocaleString(
                            undefined,
                            {
                              maximumFractionDigits: 0,
                            }
                          )}
                    </Typography>
                  </Box>
                );
              }
            );
          })()}
        </Box>

        {/* GRAPH AREA */}
        <Box
          sx={{
            position: "relative",
            width: "100%",
            minHeight: 300,
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-around",
            gap: { xs: 1, sm: 2 },
            perspective: "900px",
            borderBottom: `1px solid ${theme.border}`,
          }}
        >
          {[
            "SEQ READ (MB/s)",
            "SEQ WRITE (MB/s)",
            "RAND READ (K IOPS)",
            "RAND WRITE (K IOPS)",
            "LATENCY (µs)",
          ].map((metricName, metricIndex) => (
            <Box
              key={metricIndex}
              sx={{
                flex: 1,
                height: "100%",
                minWidth: { xs: 70, sm: 100 },
                display: "flex",
                alignItems: "flex-end",
                justifyContent: "center",
                position: "relative",
              }}
            >
              {/* GROUP OF 3D BARS */}
              <Box
                sx={{
                  height: "100%",
                  width: "100%",
                  display: "flex",
                  alignItems: "flex-end",
                  justifyContent: "center",
                  gap: { xs: 0.35, sm: 0.8 },
                  pb: 0,
                }}
              >
                {graphData.map(
                  (series, seriesIndex) => {
                    const rawValue =
                      series?.values?.[metricIndex];

                    const numericValue =
                      Number(rawValue) || 0;

                    const height =
                      maxGraphValue > 0
                        ? (numericValue /
                            maxGraphValue) *
                          100
                        : 0;

                    const barColors = [
                      "#1976D2",
                      "#2E9B59",
                      "#F28C18",
                      "#7B4AB5",
                      "#239CA5",
                      "#D64550",
                      "#6B7280",
                      "#E05A9D",
                    ];

                    const color =
                      barColors[
                        seriesIndex %
                          barColors.length
                      ];

                    return (
                      <Box
                        key={seriesIndex}
                        sx={{
                          height: "100%",
                          width: {
                            xs: 14,
                            sm: 22,
                            md: 30,
                          },
                          minWidth: {
                            xs: 14,
                            sm: 22,
                            md: 30,
                          },
                          display: "flex",
                          flexDirection:
                            "column",
                          justifyContent:
                            "flex-end",
                          alignItems: "center",
                          position:
                            "relative",
                          zIndex: 2,
                        }}
                      >
                        {/* DATA LABEL */}
                        <Typography
                          sx={{
                            mb: 0.8,
                            fontFamily:
                              "Manrope, sans-serif",
                            fontSize: {
                              xs: 7,
                              sm: 8.5,
                            },
                            fontWeight: 800,
                            color:
                              theme.navy,
                            whiteSpace:
                              "nowrap",
                          }}
                        >
                          {numericValue.toLocaleString(
                            undefined,
                            {
                              maximumFractionDigits: 1,
                            }
                          )}
                        </Typography>

                        {/* 3D BAR */}
                        <Box
                          sx={{
                            position:
                              "relative",
                            width: "100%",
                            height: `${Math.max(
                              height,
                              1.5
                            )}%`,
                            minHeight: 5,
                            transformOrigin:
                              "bottom center",
                            animation:
                              "barGrow 0.75s cubic-bezier(.2,.8,.2,1) both",
                            animationDelay: `${seriesIndex *
                              80 +
                              metricIndex *
                                60}ms`,

                            /* FRONT */
                            background: `linear-gradient(
                              90deg,
                              ${color} 0%,
                              ${color}DD 70%,
                              ${color} 100%
                            )`,

                            borderRadius:
                              "2px 2px 0 0",

                            boxShadow: `2px 3px 0 ${color}55`,

                            /* TOP FACE */
                            "&:before": {
                              content: '""',
                              position:
                                "absolute",
                              left: 0,
                              top: -6,
                              width:
                                "100%",
                              height: 7,
                              background:
                                `linear-gradient(
                                  135deg,
                                  ${color}EE,
                                  ${color}AA
                                )`,
                              transform:
                                "skewX(-42deg)",
                              transformOrigin:
                                "bottom left",
                              borderRadius:
                                "2px 2px 0 0",
                            },

                            /* RIGHT SIDE */
                            "&:after": {
                              content: '""',
                              position:
                                "absolute",
                              top: -6,
                              right: -5,
                              width: 6,
                              height:
                                "calc(100% + 6px)",
                              background:
                                color,
                              filter:
                                "brightness(0.72)",
                              transform:
                                "skewY(-42deg)",
                              transformOrigin:
                                "left bottom",
                              borderRadius:
                                "0 2px 0 0",
                            },

                            "&:hover": {
                              filter:
                                "brightness(1.08)",
                              transform:
                                "translateY(-2px)",
                              transition:
                                "all 0.2s ease",
                            },
                          }}
                        />
                      </Box>
                    );
                  }
                )}
              </Box>

              {/* X AXIS LABEL */}
              <Typography
                sx={{
                  position: "absolute",
                  bottom: -38,
                  left: "50%",
                  transform:
                    "translateX(-50%)",
                  width: "100%",
                  textAlign: "center",
                  fontFamily:
                    "Manrope, sans-serif",
                  fontSize: {
                    xs: 7.5,
                    sm: 9,
                  },
                  fontWeight: 700,
                  color: theme.navy,
                  whiteSpace: "nowrap",
                }}
              >
                {metricName}
              </Typography>
            </Box>
          ))}
        </Box>

        {/* X AXIS TITLE */}
        <Typography
          sx={{
            position: "absolute",
            bottom: 3,
            left: "50%",
            transform: "translateX(-50%)",
            fontFamily:
              "Manrope, sans-serif",
            fontSize: 10,
            fontWeight: 700,
            color: theme.navy,
          }}
        >
          PERFORMANCE METRICS
        </Typography>
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
        <ShowChartIcon
          sx={{
            fontSize: 32,
            color: "#B8C8DA",
            mb: 0.8,
          }}
        />

        <Typography
          sx={{
            fontFamily:
              "Manrope, sans-serif",
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
