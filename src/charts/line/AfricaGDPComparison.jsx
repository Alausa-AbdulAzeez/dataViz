import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import * as d3 from "d3";
import { Icon } from "@iconify/react";
import html2canvas from "html2canvas";

const AfricaGDPComparison = () => {
  const chartContainerRef = useRef(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [iconTooltip, setIconTooltip] = useState({
    visible: false,
    content: "",
  });
  const [screenSize, setScreenSize] = useState("large");

  const [activeDownloadTab, setActiveDownloadTab] = useState("Chart");
  const [isFullscreen, setIsFullscreen] = useState(false);

  const [chartDimensions, setChartDimensions] = useState({
    width: 0,
    height: 0,
  });
  const [visibleCountries, setVisibleCountries] = useState({});
  const [tooltip, setTooltip] = useState(null);
  const [activeCountry, setActiveCountry] = useState(null);
  const chartRef = useRef(null);

  const data = [
    {
      country: "Nigeria",
      year: 2010,
      gdp: 374.098,
    },
    {
      country: "Nigeria",
      year: 2011,
      gdp: 419.942,
    },
    {
      country: "Nigeria",
      year: 2012,
      gdp: 467.157,
    },
    {
      country: "Nigeria",
      year: 2013,
      gdp: 521.861,
    },
    {
      country: "Nigeria",
      year: 2014,
      gdp: 576.004,
    },
    {
      country: "Nigeria",
      year: 2015,
      gdp: 494.307,
    },
    {
      country: "Nigeria",
      year: 2016,
      gdp: 405.019,
    },
    {
      country: "Nigeria",
      year: 2017,
      gdp: 375.756,
    },
    {
      country: "Nigeria",
      year: 2018,
      gdp: 421.739,
    },
    {
      country: "Nigeria",
      year: 2019,
      gdp: 474.517,
    },
    {
      country: "Nigeria",
      year: 2020,
      gdp: 432.299,
    },
    {
      country: "Nigeria",
      year: 2021,
      gdp: 441.074,
    },
    {
      country: "Nigeria",
      year: 2022,
      gdp: 476.468,
    },
    {
      country: "Nigeria",
      year: 2023,
      gdp: 363.816,
    },
    {
      country: "Nigeria",
      year: 2024,
      gdp: 187.64,
    },
    {
      country: "Egypt",
      year: 2010,
      gdp: 230.024,
    },
    {
      country: "Egypt",
      year: 2011,
      gdp: 247.726,
    },
    {
      country: "Egypt",
      year: 2012,
      gdp: 294.482,
    },
    {
      country: "Egypt",
      year: 2013,
      gdp: 303.194,
    },
    {
      country: "Egypt",
      year: 2014,
      gdp: 321.634,
    },
    {
      country: "Egypt",
      year: 2015,
      gdp: 350.119,
    },
    {
      country: "Egypt",
      year: 2016,
      gdp: 351.443,
    },
    {
      country: "Egypt",
      year: 2017,
      gdp: 246.826,
    },
    {
      country: "Egypt",
      year: 2018,
      gdp: 263.156,
    },
    {
      country: "Egypt",
      year: 2019,
      gdp: 317.894,
    },
    {
      country: "Egypt",
      year: 2020,
      gdp: 382.525,
    },
    {
      country: "Egypt",
      year: 2021,
      gdp: 423.3,
    },
    {
      country: "Egypt",
      year: 2022,
      gdp: 475.231,
    },
    {
      country: "Egypt",
      year: 2023,
      gdp: 393.828,
    },
    {
      country: "Egypt",
      year: 2024,
      gdp: 383.109,
    },
    {
      country: "Kenya",
      year: 2010,
      gdp: 45.406,
    },
    {
      country: "Kenya",
      year: 2011,
      gdp: 46.555,
    },
    {
      country: "Kenya",
      year: 2012,
      gdp: 56.407,
    },
    {
      country: "Kenya",
      year: 2013,
      gdp: 61.703,
    },
    {
      country: "Kenya",
      year: 2014,
      gdp: 68.395,
    },
    {
      country: "Kenya",
      year: 2015,
      gdp: 70.37,
    },
    {
      country: "Kenya",
      year: 2016,
      gdp: 74.816,
    },
    {
      country: "Kenya",
      year: 2017,
      gdp: 81.965,
    },
    {
      country: "Kenya",
      year: 2018,
      gdp: 92.211,
    },
    {
      country: "Kenya",
      year: 2019,
      gdp: 100.328,
    },
    {
      country: "Kenya",
      year: 2020,
      gdp: 100.912,
    },
    {
      country: "Kenya",
      year: 2021,
      gdp: 109.875,
    },
    {
      country: "Kenya",
      year: 2022,
      gdp: 114.733,
    },
    {
      country: "Kenya",
      year: 2023,
      gdp: 108.747,
    },
    {
      country: "Kenya",
      year: 2024,
      gdp: 120.899,
    },
    {
      country: "Rwanda",
      year: 2010,
      gdp: 6.124,
    },
    {
      country: "Rwanda",
      year: 2011,
      gdp: 6.885,
    },
    {
      country: "Rwanda",
      year: 2012,
      gdp: 7.654,
    },
    {
      country: "Rwanda",
      year: 2013,
      gdp: 7.821,
    },
    {
      country: "Rwanda",
      year: 2014,
      gdp: 8.24,
    },
    {
      country: "Rwanda",
      year: 2015,
      gdp: 8.546,
    },
    {
      country: "Rwanda",
      year: 2016,
      gdp: 8.695,
    },
    {
      country: "Rwanda",
      year: 2017,
      gdp: 9.253,
    },
    {
      country: "Rwanda",
      year: 2018,
      gdp: 9.638,
    },
    {
      country: "Rwanda",
      year: 2019,
      gdp: 10.349,
    },
    {
      country: "Rwanda",
      year: 2020,
      gdp: 10.174,
    },
    {
      country: "Rwanda",
      year: 2021,
      gdp: 11.066,
    },
    {
      country: "Rwanda",
      year: 2022,
      gdp: 13.313,
    },
    {
      country: "Rwanda",
      year: 2023,
      gdp: 14.331,
    },
    {
      country: "Rwanda",
      year: 2024,
      gdp: 14.251,
    },
    {
      country: "South Africa",
      year: 2010,
      gdp: 417.315,
    },
    {
      country: "South Africa",
      year: 2011,
      gdp: 458.708,
    },
    {
      country: "South Africa",
      year: 2012,
      gdp: 434.4,
    },
    {
      country: "South Africa",
      year: 2013,
      gdp: 400.877,
    },
    {
      country: "South Africa",
      year: 2014,
      gdp: 381.195,
    },
    {
      country: "South Africa",
      year: 2015,
      gdp: 346.663,
    },
    {
      country: "South Africa",
      year: 2016,
      gdp: 323.493,
    },
    {
      country: "South Africa",
      year: 2017,
      gdp: 381.317,
    },
    {
      country: "South Africa",
      year: 2018,
      gdp: 405.093,
    },
    {
      country: "South Africa",
      year: 2019,
      gdp: 389.245,
    },
    {
      country: "South Africa",
      year: 2020,
      gdp: 337.876,
    },
    {
      country: "South Africa",
      year: 2021,
      gdp: 420.778,
    },
    {
      country: "South Africa",
      year: 2022,
      gdp: 406.755,
    },
    {
      country: "South Africa",
      year: 2023,
      gdp: 380.592,
    },
    {
      country: "South Africa",
      year: 2024,
      gdp: 400.191,
    },
    {
      country: "Ethiopia",
      year: 2010,
      gdp: 26.887,
    },
    {
      country: "Ethiopia",
      year: 2011,
      gdp: 30.48,
    },
    {
      country: "Ethiopia",
      year: 2012,
      gdp: 42.221,
    },
    {
      country: "Ethiopia",
      year: 2013,
      gdp: 46.544,
    },
    {
      country: "Ethiopia",
      year: 2014,
      gdp: 54.165,
    },
    {
      country: "Ethiopia",
      year: 2015,
      gdp: 63.081,
    },
    {
      country: "Ethiopia",
      year: 2016,
      gdp: 72.12,
    },
    {
      country: "Ethiopia",
      year: 2017,
      gdp: 76.841,
    },
    {
      country: "Ethiopia",
      year: 2018,
      gdp: 80.207,
    },
    {
      country: "Ethiopia",
      year: 2019,
      gdp: 92.608,
    },
    {
      country: "Ethiopia",
      year: 2020,
      gdp: 96.611,
    },
    {
      country: "Ethiopia",
      year: 2021,
      gdp: 99.261,
    },
    {
      country: "Ethiopia",
      year: 2022,
      gdp: 118.958,
    },
    {
      country: "Ethiopia",
      year: 2023,
      gdp: 159.761,
    },
    {
      country: "Ethiopia",
      year: 2024,
      gdp: 143.123,
    },
  ];

  // Fullscreen toggle functionality (for overview tab)
  const toggleFullscreen = useCallback(
    (attributedRef) => {
      if (!attributedRef.current) return;

      if (!isFullscreen) {
        if (attributedRef.current.requestFullscreen) {
          attributedRef.current.requestFullscreen();
        } else if (attributedRef.current.webkitRequestFullscreen) {
          attributedRef.current.webkitRequestFullscreen();
        } else if (attributedRef.current.msRequestFullscreen) {
          attributedRef.current.msRequestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
          document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
          document.msExitFullscreen();
        }
      }
      // No need to set isFullscreen here as it will be handled by the event listener
    },
    [isFullscreen]
  );

  // Handle downloads
  const handleDownload = () => {
    if (onDownload && typeof onDownload === "function") {
      onDownload("PNG", chartRef);
    }
  };

  const handleFullCSVDownload = () => {
    if (onDownload && typeof onDownload === "function") {
      onDownload("FullCSV", { data });
    }
  };

  const width = chartDimensions.width || 800;
  const height = chartDimensions.height || 500;
  const margin = {
    top: 50,
    right: screenSize === "small" ? 20 : 10,
    bottom: screenSize === "small" ? 120 : 100,
    left: screenSize === "small" ? 60 : 80,
  };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const years = [...new Set(data.map((d) => d.year))];
  const countries = [...new Set(data.map((d) => d.country))];
  const color = d3
    .scaleOrdinal()
    .domain(countries)
    .range(["#ff9e4a", "#1f77b4", "#2ca02c", "#d62728", "#9467bd", "#8c564b"]);

  // Setup scales and generators
  const xScale = useMemo(() => {
    return d3
      .scaleLinear()
      .domain(d3.extent(data, (d) => d.year))
      .range([0, innerWidth])
      .nice();
  }, [data, innerWidth]);

  // Create X axis ticks - reduce number for better visibility
  const xTicks = useMemo(() => {
    const allYears = [...new Set(data.map((d) => d.year))];
    // For years 2000-2023, show only every 4th or 5th year on mobile, every 2nd or 3rd year otherwise
    const step = screenSize === "small" ? 5 : 2;
    return allYears.filter((_, index) => index % step === 0);
  }, [data, screenSize]);

  const yScale = useMemo(
    () =>
      d3
        .scaleLinear()
        .domain([0, d3.max(data, (d) => d.gdp) * 1.1])
        .range([innerHeight, 0]),
    [data]
  );

  const line = d3
    .line()
    .x((d) => xScale(d.year))
    .y((d) => yScale(d.gdp))
    .curve(d3.curveMonotoneX);

  const grouped = useMemo(() => {
    return countries.map((country) => ({
      country,
      values: data.filter((d) => d.country === country),
    }));
  }, [data]);

  // Helper functions for download handlers
  const onDownload = (type, ref) => {
    if (type === "PNG") {
      html2canvas(ref.current).then((canvas) => {
        canvas.toBlob((blob) => {
          saveAs(blob, `chart-${new Date().getTime()}.png`);
        });
      });
    } else if (type === "SVG") {
      const svgElement = ref.current.querySelector("svg");
      const svgData = new XMLSerializer().serializeToString(svgElement);
      const svgBlob = new Blob([svgData], {
        type: "image/svg+xml;charset=utf-8",
      });
      saveAs(svgBlob, `chart-${new Date().getTime()}.svg`);
    } else if (type === "CSV") {
      const { currentYear, data } = ref;
      let csvContent = "Country,Date,gdp\n";

      data.forEach((item) => {
        csvContent += `${item.country},${item.year},${item.gdp}\n`;
      });

      const csvBlob = new Blob([csvContent], {
        type: "text/csv;charset=utf-8",
      });
      saveAs(csvBlob, `data-${currentYear}-${new Date().getTime()}.csv`);
    } else if (type === "FullCSV") {
      const { data } = ref;
      const years = Object.keys(data[0]).filter((key) => !isNaN(parseInt(key)));

      let csvContent = "country,year,gdp" + "\n";

      data.forEach((item) => {
        csvContent += `${item.country},${item.year},${item.gdp}`;
        csvContent += "\n";
      });

      const csvBlob = new Blob([csvContent], {
        type: "text/csv;charset=utf-8",
      });
      saveAs(csvBlob, `data-full-${new Date().getTime()}.csv`);
    }
  };

  // Update chart dimensions on window resize
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 640) {
        setScreenSize("small");
      } else if (width < 1024) {
        setScreenSize("medium");
      } else {
        setScreenSize("large");
      }

      if (chartContainerRef.current) {
        const containerWidth = chartContainerRef.current.clientWidth;
        setChartDimensions({
          width: containerWidth, // 90% of container width
          height: Math.min(Math.max(containerWidth * 0.6, 300), 650), // Increased height range
        });
      }
    };

    // Initial call
    handleResize();

    // Add listener
    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [chartContainerRef, isFullscreen]);

  // Initialize visible countries
  useEffect(() => {
    const initialVisibility = {};
    countries.forEach((country) => {
      initialVisibility[country] = true;
    });
    setVisibleCountries(initialVisibility);
  }, []);

  const getLegendLayout = () => {
    if (screenSize === "small") {
      // Stack vertically on mobile, 2 columns
      const itemsPerRow = 2;
      const itemWidth = innerWidth / itemsPerRow;
      return countries.map((country, i) => ({
        country,
        x: (i % itemsPerRow) * itemWidth,
        y: Math.floor(i / itemsPerRow) * 30,
      }));
    } else if (screenSize === "medium") {
      // 3 columns on medium screens
      const itemsPerRow = 3;
      const itemWidth = innerWidth / itemsPerRow;
      return countries.map((country, i) => ({
        country,
        x: (i % itemsPerRow) * itemWidth,
        y: Math.floor(i / itemsPerRow) * 30,
      }));
    } else {
      // Single row on large screens
      const itemWidth = innerWidth / countries.length;
      return countries.map((country, i) => ({
        country,
        x: i * itemWidth,
        y: 0,
      }));
    }
  };

  const legendLayout = getLegendLayout();

  return (
    <div className="min-h-screen bg-gray-50 mx-auto flex items-center py-10">
      <div className="bg-white p-6 rounded-lg shadow-md mb-8 max-w-5xl mx-auto">
        <div className="mb-2 flex h-fit items-center gap-3">
          <h3 className="text-sm md:text-xl font-semibold flex-1">
            Solar Electricity Generation Trends (2000 – 2023)
          </h3>
          {/* RHS - Action buttons */}
          <div className="w-fit h-8 flex justify-center gap-2 ">
            {/* Fullscreen toggle button */}
            <div
              onClick={() => toggleFullscreen(chartContainerRef)}
              onMouseEnter={() => {
                setIconTooltip({
                  visible: true,
                  content: isFullscreen ? `Exit Fullscreen` : `Fullscreen`,
                });
              }}
              onMouseLeave={() => {
                setIconTooltip({
                  visible: false,
                  content: ``,
                });
              }}
              className="relative w-fit rounded-sm hover:bg-gray-300 p-1.5 bg-gray-200 flex items-center justify-center cursor-pointer"
            >
              {iconTooltip?.visible &&
                (iconTooltip?.content === "Fullscreen" ||
                  iconTooltip?.content === "Exit Fullscreen") && (
                  <div className="absolute bg-white border border-[#ccc] px-[10px] py-[6px] -top-9 text-xs rounded-sm">
                    {iconTooltip?.content}
                  </div>
                )}
              <Icon
                icon={
                  isFullscreen
                    ? "material-symbols-light:fullscreen-exit"
                    : "material-symbols-light:fullscreen"
                }
                className="w-5 h-5"
              />
            </div>

            {/* Download button */}
            <div
              onClick={() => setIsModalOpen(true)}
              onMouseEnter={() => {
                setIconTooltip({
                  visible: true,
                  content: `Download`,
                });
              }}
              onMouseLeave={() => {
                setIconTooltip({
                  visible: false,
                  content: ``,
                });
              }}
              className="relative rounded-sm hover:bg-gray-300 p-1.5 bg-gray-200 flex items-center justify-center cursor-pointer"
            >
              {iconTooltip?.visible && iconTooltip?.content === "Download" && (
                <div className="absolute bg-white border border-[#ccc] px-[10px] py-[6px] -top-9 text-xs rounded-sm">
                  {iconTooltip?.content}
                </div>
              )}
              <Icon
                icon={"material-symbols-light:download-sharp"}
                className="w-5 h-5"
              />
            </div>
          </div>
        </div>
        <div className=" min-h-64 flex items-center justify-center rounded-lg border border-gray-200">
          <div className="relative w-full min-h-fit h-auto">
            {/* Hidden Chart  */}
            <div ref={chartRef} className="fixed -top-[300%]">
              <svg width={width} height={height}>
                <g transform={`translate(${margin.left}, ${margin.top})`}>
                  {/* X Grid & Labels */}
                  {xTicks.map((year, index) => (
                    <g key={`x-${year}-${index}`}>
                      <line
                        x1={xScale(year)}
                        x2={xScale(year)}
                        y1={0}
                        y2={innerHeight}
                        stroke="#ddd"
                        strokeDasharray="4,4"
                      />
                      <text
                        x={xScale(year)}
                        y={innerHeight + 20}
                        textAnchor="middle"
                        fontSize={12}
                        fill="#555"
                      >
                        {year}
                      </text>
                    </g>
                  ))}

                  {/* Y Axis */}
                  {yScale.ticks(5).map((tick) => (
                    <g key={`y-${tick}`}>
                      <line
                        x1={0}
                        x2={innerWidth}
                        y1={yScale(tick)}
                        y2={yScale(tick)}
                        stroke="#eee"
                      />
                      <text
                        x={-10}
                        y={yScale(tick)}
                        textAnchor="end"
                        alignmentBaseline="middle"
                        fontSize={12}
                        fill="#555"
                      >
                        {tick}
                      </text>
                    </g>
                  ))}

                  {/* Lines */}
                  {grouped.map((group) => (
                    <path
                      key={`line-${group.country}`}
                      d={line(group.values)}
                      fill="none"
                      stroke={color(group.country)}
                      strokeWidth={
                        activeCountry === null ||
                        activeCountry === group.country
                          ? screenSize === "small"
                            ? 1.5
                            : 3
                          : 1
                      }
                      opacity={
                        activeCountry === null ||
                        activeCountry === group.country
                          ? 1
                          : 0.3
                      }
                    />
                  ))}

                  {/* Dots */}
                  {grouped.map((group) =>
                    group.values.map((d, i) => (
                      <circle
                        key={`${group.country}-${i}`}
                        opacity={
                          activeCountry === null ||
                          activeCountry === group.country
                            ? 1
                            : 0.3
                        }
                        cx={xScale(d.year)}
                        cy={yScale(d.gdp)}
                        r={screenSize === "small" ? 1.5 : 4}
                        fill={color(group.country)}
                        onMouseEnter={() =>
                          setTooltip({
                            x: xScale(d.year),
                            y: yScale(d.gdp),
                            country: d.country,
                            year: d.year,
                            gdp: d.gdp,
                          })
                        }
                        onMouseLeave={() => setTooltip(null)}
                      />
                    ))
                  )}

                  {/* Title */}
                  {isFullscreen && (
                    <text
                      x={innerWidth / 2}
                      y={-20}
                      textAnchor="middle"
                      fontSize={18}
                      fontWeight="bold"
                      fill="#333"
                    >
                      Solar Generation Growth in Selected African Nations
                    </text>
                  )}

                  {/* Y Axis Label */}
                  <text
                    transform={`rotate(-90)`}
                    x={-innerHeight / 2}
                    y={-50}
                    textAnchor="middle"
                    fontSize={14}
                    fill="#333"
                  >
                    GDP (Billions USD)
                  </text>
                </g>

                {/* Responsive Legend at Bottom */}
                <g
                  transform={`translate(${margin.left}, ${
                    innerHeight + margin.top + 40
                  })`}
                >
                  {legendLayout.map(({ country, x, y }) => (
                    <g
                      key={country}
                      transform={`translate(${x}, ${y})`}
                      onMouseEnter={() => setActiveCountry(country)}
                      onMouseLeave={() => setActiveCountry(null)}
                      onClick={() => toggleCountryVisibility(country)}
                      style={{ cursor: "pointer" }}
                    >
                      <rect
                        width={15}
                        height={15}
                        fill={color(country)}
                        opacity={1}
                        stroke={activeCountry === country ? "#999" : "none"}
                        strokeWidth={2}
                        style={{ transition: "opacity 0.3s, stroke 0.3s" }}
                      />
                      <text
                        x={20}
                        y={12}
                        fontSize={screenSize === "small" ? 11 : 13}
                        fill="#333"
                        opacity={visibleCountries[country] ? 1 : 0.5}
                        style={{ transition: "opacity 0.3s" }}
                      >
                        {screenSize === "small" && country === "South Africa"
                          ? "S. Africa"
                          : country}
                      </text>
                    </g>
                  ))}
                </g>

                {/* tooltip */}
                {tooltip && (
                  <foreignObject
                    x={
                      screenSize === "small"
                        ? "calc(50% - 128px)"
                        : tooltip.x + 700 > window.innerWidth
                        ? `${tooltip.x - 60}px`
                        : `${tooltip.x + margin.left + 10}px`
                    }
                    // x={tooltip.x + margin.left + 10}

                    y={tooltip.y + margin.top - 30}
                    width={120}
                    height={150}
                  >
                    <div
                      xmlns="http://www.w3.org/1999/xhtml"
                      style={{
                        background: "white",
                        border: "1px solid #ccc",
                        borderRadius: "4px",
                        padding: "5px 8px",
                        fontSize: 12,
                        pointerEvents: "none",
                      }}
                    >
                      <div>
                        <strong>{tooltip.country}</strong>
                      </div>
                      <div>Year: {tooltip.year}</div>
                      <div>GDP: {tooltip.gdp} billions (USD)</div>
                    </div>
                  </foreignObject>
                )}
              </svg>
            </div>

            {/* Main Chart  */}
            <div
              ref={chartContainerRef}
              className={`bg-white flex justify-center px-3 my-5 mx-auto w-full max-w-screen-xl rounded-md relative ${
                isFullscreen ? "h-full" : ""
              }`}
            >
              {/* Download Modal */}
              {isModalOpen && (
                <div className="absolute w-full h-full flex items-start justify-center">
                  <div
                    onClick={() => setIsModalOpen(false)}
                    className="cursor-pointer absolute w-full h-full z-[10] bg-black opacity-40"
                  ></div>
                  <div className="mt-10 rounded-sm w-[80%] h-auto p-4 bg-white z-[20] cursor-pointer">
                    <div className="flex justify-between items-center text-xs font-semibold text-gray-500">
                      <div className="">DOWNLOAD</div>
                      <Icon
                        icon="ic:round-cancel"
                        className="hover:rotate-45 transition-all ease-in-out duration-300"
                        width="24"
                        height="24"
                        onClick={() => setIsModalOpen(false)}
                      />
                    </div>
                    <div className="mt-4 flex items-center gap-1.5 w-full justify-center">
                      <div
                        onClick={() => setActiveDownloadTab("Chart")}
                        className={`${
                          activeDownloadTab === "Chart" && "bg-gray-300"
                        } flex-1 bg-gray-100 hover:bg-gray-200 text-sm flex items-center justify-center w-fit p-1 gap-1 cursor-pointer`}
                      >
                        <Icon icon={"hugeicons:chart"} className="h-4 w-4" />
                        <span>Chart</span>
                      </div>
                      <div
                        onClick={() => setActiveDownloadTab("Data")}
                        className={`text-sm flex-1 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-sm flex items-center justify-center w-fit p-1 gap-1 cursor-pointer ${
                          activeDownloadTab === "Data" && "bg-gray-300"
                        }`}
                      >
                        <Icon
                          icon={"icon-park-twotone:data-four"}
                          className="h-4 w-4"
                        />
                        <span>Data</span>
                      </div>
                    </div>

                    {/* Download options */}
                    {activeDownloadTab === "Chart" && (
                      <div className="mt-4 flex flex-col w-full items-center gap-1.5">
                        <div
                          onClick={handleDownload}
                          className="w-full h-[100px] rounded-sm hover:bg-slate-200 items-center justify-center flex flex-col bg-slate-100"
                        >
                          <div className="font-medium text-sm md:text-lg">
                            Image (PNG)
                          </div>
                          <div className="text-xs md:text-sm">
                            Suitable for most use cases
                          </div>
                        </div>
                        {/* <div
                    onClick={handleSVGDownload}
                    className="w-full cursor-not-allowed opacity-50 rounded-sm hover:bg-slate-200 items-center h-[100px] justify-center flex flex-col bg-slate-100 cursor-pointer"
                  >
                    <div className="font-medium text-lg">
                      Vector Image (SVG){" "}
                      <span className="ml-2 text-red-950 font-bold">
                        Not Available
                      </span>
                    </div>
                    <div className="text-sm">
                      Scalable format, ideal for editing
                    </div>
                  </div> */}
                      </div>
                    )}

                    {activeDownloadTab === "Data" && (
                      <div className="mt-4 flex flex-col w-full items-center gap-1.5">
                        {/* Data source */}
                        <div className="flex justify-start w-full mb-4 py-2 border-b border-gray-200">
                          <div className="text-xs text-gray-600">
                            <div className="font-semibold">
                              Data source:{" "}
                              <span className="font-normal">
                                Our World in Data - Energy Dataset
                              </span>
                            </div>
                            <div className="mt-1 flex items-center gap-1">
                              <a
                                href="https://github.com/owid/energy-data"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 underline"
                              >
                                Learn more about this data
                              </a>
                            </div>
                          </div>
                        </div>
                        <div
                          onClick={handleFullCSVDownload}
                          className="w-full h-[100px] rounded-sm hover:bg-slate-200 items-center justify-center flex flex-col bg-slate-100 cursor-pointer"
                        >
                          <div className="font-medium md:text-lg text-sm">
                            Complete Dataset (CSV)
                          </div>
                          <div className="text-xs md:text-sm text-center">
                            Download all years (2000 - 2023)
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <svg width={width} height={height}>
                <g transform={`translate(${margin.left}, ${margin.top})`}>
                  {/* X Grid & Labels */}
                  {xTicks.map((year, index) => (
                    <g key={`x-${year}-${index}`}>
                      <line
                        x1={xScale(year)}
                        x2={xScale(year)}
                        y1={0}
                        y2={innerHeight}
                        stroke="#ddd"
                        strokeDasharray="4,4"
                      />
                      <text
                        x={xScale(year)}
                        y={innerHeight + 20}
                        textAnchor="middle"
                        fontSize={12}
                        fill="#555"
                      >
                        {year}
                      </text>
                    </g>
                  ))}

                  {/* Y Axis */}
                  {yScale.ticks(5).map((tick) => (
                    <g key={`y-${tick}`}>
                      <line
                        x1={0}
                        x2={innerWidth}
                        y1={yScale(tick)}
                        y2={yScale(tick)}
                        stroke="#eee"
                      />
                      <text
                        x={-10}
                        y={yScale(tick)}
                        textAnchor="end"
                        alignmentBaseline="middle"
                        fontSize={12}
                        fill="#555"
                      >
                        {tick}
                      </text>
                    </g>
                  ))}

                  {/* Lines */}
                  {grouped.map((group) => (
                    <path
                      key={`line-${group.country}`}
                      d={line(group.values)}
                      fill="none"
                      stroke={color(group.country)}
                      strokeWidth={
                        activeCountry === null ||
                        activeCountry === group.country
                          ? screenSize === "small"
                            ? 1.5
                            : 3
                          : 1
                      }
                      opacity={
                        activeCountry === null ||
                        activeCountry === group.country
                          ? 1
                          : 0.3
                      }
                    />
                  ))}

                  {/* Dots */}
                  {grouped.map((group) =>
                    group.values.map((d, i) => (
                      <circle
                        key={`${group.country}-${i}`}
                        opacity={
                          activeCountry === null ||
                          activeCountry === group.country
                            ? 1
                            : 0.3
                        }
                        cx={xScale(d.year)}
                        cy={yScale(d.gdp)}
                        r={screenSize === "small" ? 1.5 : 4}
                        fill={color(group.country)}
                        onMouseEnter={() =>
                          setTooltip({
                            x: xScale(d.year),
                            y: yScale(d.gdp),
                            country: d.country,
                            year: d.year,
                            gdp: d.gdp,
                          })
                        }
                        onMouseLeave={() => setTooltip(null)}
                      />
                    ))
                  )}

                  {/* Title */}
                  {isFullscreen && (
                    <text
                      x={innerWidth / 2}
                      y={-20}
                      textAnchor="middle"
                      fontSize={18}
                      fontWeight="bold"
                      fill="#333"
                    >
                      Solar Generation Growth in Selected African Nations
                    </text>
                  )}

                  {/* Y Axis Label */}
                  <text
                    transform={`rotate(-90)`}
                    x={-innerHeight / 2}
                    y={-50}
                    textAnchor="middle"
                    fontSize={14}
                    fill="#333"
                  >
                    GDP (Billions USD)
                  </text>
                </g>

                {/* Responsive Legend at Bottom */}
                <g
                  transform={`translate(${margin.left}, ${
                    innerHeight + margin.top + 40
                  })`}
                >
                  {legendLayout.map(({ country, x, y }) => (
                    <g
                      key={country}
                      transform={`translate(${x}, ${y})`}
                      onMouseEnter={() => setActiveCountry(country)}
                      onMouseLeave={() => setActiveCountry(null)}
                      onClick={() => toggleCountryVisibility(country)}
                      style={{ cursor: "pointer" }}
                    >
                      <rect
                        width={15}
                        height={15}
                        fill={color(country)}
                        opacity={1}
                        stroke={activeCountry === country ? "#999" : "none"}
                        strokeWidth={2}
                        style={{ transition: "opacity 0.3s, stroke 0.3s" }}
                      />
                      <text
                        x={20}
                        y={12}
                        fontSize={screenSize === "small" ? 11 : 13}
                        fill="#333"
                        opacity={visibleCountries[country] ? 1 : 0.5}
                        style={{ transition: "opacity 0.3s" }}
                      >
                        {screenSize === "small" && country === "South Africa"
                          ? "S. Africa"
                          : country}
                      </text>
                    </g>
                  ))}
                </g>

                {/* tooltip */}
                {tooltip && (
                  <foreignObject
                    x={
                      screenSize === "small"
                        ? "calc(50% - 128px)"
                        : tooltip.x + 700 > window.innerWidth
                        ? `${tooltip.x - 60}px`
                        : `${tooltip.x + margin.left + 10}px`
                    }
                    // x={tooltip.x + margin.left + 10}

                    y={tooltip.y + margin.top - 30}
                    width={120}
                    height={150}
                  >
                    <div
                      xmlns="http://www.w3.org/1999/xhtml"
                      style={{
                        background: "white",
                        border: "1px solid #ccc",
                        borderRadius: "4px",
                        padding: "5px 8px",
                        fontSize: 12,
                        pointerEvents: "none",
                      }}
                    >
                      <div>
                        <strong>{tooltip.country}</strong>
                      </div>
                      <div>Year: {tooltip.year}</div>
                      <div>GDP: {tooltip.gdp} billions (USD)</div>
                    </div>
                  </foreignObject>
                )}
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AfricaGDPComparison;
