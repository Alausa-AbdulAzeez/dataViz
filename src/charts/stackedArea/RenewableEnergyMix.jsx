import {
  extent,
  scaleLinear,
  line,
  curveMonotoneX,
  stack,
  max,
  ticks,
} from "d3";
import * as d3 from "d3";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Icon } from "@iconify/react";

import html2canvas from "html2canvas";

// Sample data - replace with actual data
// const data = [
//   {
//     year: 2010,
//     Solar: 2,
//     Hydro: 35,
//     Wind: 4,
//     Biofuel: 12,
//     OtherRenewable: 7,
//     Oil: 120,
//   },
//   {
//     year: 2012,
//     Solar: 4,
//     Hydro: 36,
//     Wind: 6,
//     Biofuel: 13,
//     OtherRenewable: 8,
//     Oil: 125,
//   },
//   {
//     year: 2014,
//     Solar: 8,
//     Hydro: 38,
//     Wind: 9,
//     Biofuel: 13,
//     OtherRenewable: 9,
//     Oil: 130,
//   },
//   {
//     year: 2016,
//     Solar: 15,
//     Hydro: 37,
//     Wind: 12,
//     Biofuel: 14,
//     OtherRenewable: 10,
//     Oil: 128,
//   },
//   {
//     year: 2018,
//     Solar: 25,
//     Hydro: 39,
//     Wind: 16,
//     Biofuel: 14,
//     OtherRenewable: 11,
//     Oil: 132,
//   },
//   {
//     year: 2020,
//     Solar: 38,
//     Hydro: 40,
//     Wind: 22,
//     Biofuel: 15,
//     OtherRenewable: 12,
//     Oil: 118,
//   },
//   {
//     year: 2022,
//     Solar: 55,
//     Hydro: 41,
//     Wind: 28,
//     Biofuel: 16,
//     OtherRenewable: 13,
//     Oil: 122,
//   },
//   {
//     year: 2024,
//     Solar: 75,
//     Hydro: 42,
//     Wind: 35,
//     Biofuel: 16,
//     OtherRenewable: 14,
//     Oil: 115,
//   },
// ];

const RenewableEnergyMix = ({
  data,
  isFullscreen,
  chartContainerRef,
  isModalOpen,
  setIsModalOpen,
  THEME,
  screenSize,
  setScreenSize,
}) => {
  const [selectedPoint, setSelectedPoint] = useState(null);
  const chartRef = useRef(null);
  const [activeDownloadTab, setActiveDownloadTab] = useState("Chart");
  console.log(data);
  const [chartDimensions, setChartDimensions] = useState({
    width: 0,
    height: 0,
  });
  const [viewType, setViewType] = useState("absolute");
  const [tooltipData, setTooltipData] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [sourceView, setSourceView] = useState("all"); // 'all' or 'renewables'

  const colors = {
    solar_electricity: "#FDB813", // Yellow for sun
    hydro_electricity: "#3E97D1", // Blue for water
    wind_electricity: "#8CD9B3", // Light green for wind
    biofuel_electricity: "#7A9D54", // Dark green for biofuel
    other_renewable_electricity: "#9D54A2", // Purple for other renewables
    oil_electricity: "#4F4F4F", // Dark gray for oil
  };

  // Define keys based on view type
  const renewableKeys = [
    "solar_electricity",
    "hydro_electricity",
    "wind_electricity",
    "biofuel_electricity",
    "other_renewable_electricity",
  ];
  const allKeys = [...renewableKeys, "oil_electricity"];
  const activeKeys = sourceView === "renewables" ? renewableKeys : allKeys;

  // Chart margins and dimensions
  const margins = {
    top: 40,
    right: screenSize === "large" ? 85 : 10,
    bottom: 60,
    left: screenSize === "large" ? 80 : 50,
  };
  const width = chartDimensions.width || 600;
  const height = chartDimensions.height || 400;
  const innerWidth = width - margins.left - margins.right;
  const innerHeight = height - margins.top - margins.bottom;

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
          width: containerWidth * 0.98, // 90% of container width
          height: Math.min(Math.max(containerWidth * 0.6, 300), 450), // Increased height range
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

  // Format source names for display
  const formatSourceName = (key) => {
    return key
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  // Calculate percentage data
  const percentageData = useMemo(() => {
    return data.map((yearData) => {
      // Only include active keys in total calculation
      const total = activeKeys.reduce((sum, key) => sum + yearData[key], 0);
      const newEntry = { year: yearData.year };
      // Calculate percentages for all keys, but we'll only use active ones
      [...renewableKeys, "oil_electricity"].forEach((key) => {
        newEntry[key] = (yearData[key] / total) * 100;
      });
      return newEntry;
    });
  }, [data, activeKeys]);

  // Determine which dataset to use
  const currentData = viewType === "absolute" ? data : percentageData;

  // Setup scales and generators
  const xScale = useMemo(() => {
    return d3
      .scaleLinear()
      .domain(d3.extent(data, (d) => d.year))
      .range([0, width - 30])
      .nice();
  }, [data, width]);

  // Stack the data
  const stackedData = useMemo(() => {
    const stack = d3.stack().keys(activeKeys);
    return stack(currentData);
  }, [currentData, activeKeys]);

  const yScale = useMemo(() => {
    return d3
      .scaleLinear()
      .domain([
        0,
        viewType === "absolute"
          ? d3.max(stackedData[stackedData.length - 1], (d) => d[1])
          : 100,
      ])
      .nice()
      .range([height, 0]);
  }, [height, stackedData, viewType]);

  // Create the area paths
  const areaGenerator = useMemo(() => {
    return d3
      .area()
      .x((d) => xScale(d.data.year))
      .y0((d) => yScale(d[0]))
      .y1((d) => yScale(d[1]))
      .curve(d3.curveMonotoneX);
  }, [xScale, yScale]);

  // Create X axis ticks - reduce number for better visibility
  const xTicks = useMemo(() => {
    const allYears = data.map((d) => d.year);
    // For years 2000-2023, show only every 4th or 5th year on mobile, every 2nd or 3rd year otherwise
    const step = screenSize === "small" ? 5 : 2;
    return allYears.filter((_, index) => index % step === 0);
  }, [data, screenSize]);

  // Create Y axis ticks
  const yTicks = useMemo(() => {
    const maxValue =
      viewType === "absolute"
        ? d3.max(stackedData[stackedData.length - 1], (d) => d[1])
        : 100;
    return d3.ticks(0, maxValue, 10);
  }, [stackedData, viewType]);

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
      let csvContent = "Country,Date,solar_share_elec\n";

      data.forEach((item) => {
        csvContent += `${item.country},${item.year},${item.solar_share_elec}\n`;
      });

      const csvBlob = new Blob([csvContent], {
        type: "text/csv;charset=utf-8",
      });
      saveAs(csvBlob, `data-${currentYear}-${new Date().getTime()}.csv`);
    } else if (type === "FullCSV") {
      const { data } = ref;
      const years = Object.keys(data[0]).filter((key) => !isNaN(parseInt(key)));

      let csvContent = "country,year,solar_share_elec" + "\n";

      data.forEach((item) => {
        csvContent += `${item.country},${item.year},${item.solar_share_elec}`;
        csvContent += "\n";
      });

      const csvBlob = new Blob([csvContent], {
        type: "text/csv;charset=utf-8",
      });
      saveAs(csvBlob, `population-data-full-${new Date().getTime()}.csv`);
    }
  };

  // Handle mouse movement for tooltip
  const handleMouseMove = (event) => {
    const svgElement = event.currentTarget;
    const svgRect = svgElement.getBoundingClientRect();
    const mouseX = event.clientX - svgRect.left - margins.left;
    const mouseY = event.clientY - svgRect.top - margins.top;

    if (mouseX < 0 || mouseX > width || mouseY < 0 || mouseY > height) {
      setTooltipData(null);
      return;
    }

    const year = Math.round(xScale.invert(mouseX));
    const selectedData =
      currentData.find((d) => d.year === year) ||
      currentData.reduce((prev, curr) =>
        Math.abs(curr.year - year) < Math.abs(prev.year - year) ? curr : prev
      );

    if (selectedData) {
      const total = activeKeys.reduce((sum, key) => sum + selectedData[key], 0);

      setTooltipData({
        year: selectedData.year,
        values: activeKeys.map((key) => ({
          key,
          value: selectedData[key],
          color: colors[key],
        })),
        total,
      });

      setTooltipPos({
        x: event.clientX,
        y: event.clientY,
      });
    }
  };

  const handleMouseLeave = () => {
    setTooltipData(null);
  };

  // Create line generator
  const lineGenerator = line()
    .x((d) => xScale(d.year))
    .y((d) => yScale(d.solar_share_elec))
    .curve(curveMonotoneX);

  // Create area generator for the gradient fill
  const areaPath = `
    M ${xScale(data[0].year)} ${yScale(data[0].solar_share_elec)}
    ${lineGenerator(data).slice(1)}
    L ${xScale(data[data.length - 1].year)} ${innerHeight}
    L ${xScale(data[0].year)} ${innerHeight}
    Z
  `;

  const handlePointHover = (point) => {
    if (
      point?.country === selectedPoint?.country &&
      point.year === selectedPoint?.year &&
      point.solar_share_elec === selectedPoint?.solar_share_elec
    ) {
      return;
    } else {
      setSelectedPoint(point);
    }
  };

  const handlePointLeave = () => {
    setSelectedPoint(null);
  };

  // Handle downloads
  const handleDownload = () => {
    if (onDownload && typeof onDownload === "function") {
      onDownload("PNG", chartRef);
    }
  };

  const handleSVGDownload = () => {
    if (onDownload && typeof onDownload === "function") {
      onDownload("SVG", chartRef);
    }
  };

  const handleFullCSVDownload = () => {
    if (onDownload && typeof onDownload === "function") {
      onDownload("FullCSV", { data });
    }
  };

  // Format y-axis values with units
  const formatYValue = (value) => {
    return `${value}`;
  };

  return (
    <div className="w-full h-full font-sans relative">
      {/* Hidden chart container */}
      <div ref={chartRef} className="fixed -top-[2000%]">
        {/* The chart */}
        <svg
          width={width + margins.left + margins.right}
          height={height + margins.top + margins.bottom}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <defs>
            {/* Gradient for area fill */}
            <linearGradient id="solarGradient" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="0%"
                stopColor={THEME.primaryColorLight}
                stopOpacity="0.6"
              />
              <stop
                offset="100%"
                stopColor={THEME.primaryColorLight}
                stopOpacity="0.1"
              />
            </linearGradient>

            {/* Filter for drop shadow */}
            <filter id="dropShadow" height="130%">
              <feGaussianBlur in="SourceAlpha" stdDeviation="3" />
              <feOffset dx="0" dy="2" result="offsetblur" />
              <feComponentTransfer>
                <feFuncA type="linear" slope="0.2" />
              </feComponentTransfer>
              <feMerge>
                <feMergeNode />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Chart title and subtitle */}
          <text
            x={margins.left}
            y={20}
            fontSize={16}
            fontWeight="bold"
            fill={THEME.textColor}
          >
            Africa's Growing Solar Share of Electricity (2000-2023)
          </text>

          <g transform={`translate(${margins.left}, ${margins.top + 5})`}>
            {/* Area under the line */}
            <path d={areaPath} fill="url(#solarGradient)" />

            {/* X and Y axis lines */}
            <line
              x1={0}
              y1={innerHeight}
              x2={innerWidth}
              y2={innerHeight}
              stroke={THEME.borderColor}
              strokeWidth={1}
            />
            <line
              x1={0}
              y1={0}
              x2={0}
              y2={innerHeight}
              stroke={THEME.borderColor}
              strokeWidth={1}
            />

            {/* Vertical grids */}
            {xScale.ticks(6).map((datum) => (
              <g key={`x-${datum}`}>
                <line
                  stroke={THEME.borderColor}
                  strokeDasharray="4,4"
                  strokeOpacity={0.5}
                  y2={innerHeight}
                  x1={xScale(datum)}
                  x2={xScale(datum)}
                />
                <text
                  y={innerHeight + 16}
                  x={xScale(datum)}
                  textAnchor="middle"
                  fontSize={12}
                  fill={THEME.textColor}
                >
                  {datum}
                </text>
              </g>
            ))}

            {/* Horizontal grids */}
            {yScale.ticks(5).map((datum) => (
              <g key={`y-${datum}`}>
                <text
                  fill={THEME.textColor}
                  x={-10}
                  y={yScale(datum)}
                  fontSize={12}
                  dy={"0.36em"}
                  textAnchor="end"
                >
                  {formatYValue(datum)}
                </text>
                <line
                  stroke={THEME.borderColor}
                  strokeDasharray="4,4"
                  strokeOpacity={0.5}
                  x2={innerWidth}
                  y1={yScale(datum)}
                  y2={yScale(datum)}
                />
              </g>
            ))}

            {/* Line path */}
            <path
              d={lineGenerator(data)}
              fill="none"
              stroke={THEME.primaryColor}
              strokeWidth={3}
              filter="url(#dropShadow)"
            />

            {/* Data points */}
            {data.map((datum) => (
              <g key={datum.year}>
                <circle
                  cx={xScale(datum.year)}
                  cy={yScale(datum.solar_share_elec)}
                  r={selectedPoint === datum ? 6 : 4}
                  fill={
                    selectedPoint === datum
                      ? THEME.accentColor
                      : THEME.primaryColor
                  }
                  stroke={THEME.backgroundColor}
                  strokeWidth={2}
                  onMouseEnter={() => handlePointHover(datum)}
                  onMouseLeave={handlePointLeave}
                  style={{ cursor: "pointer", transition: "r 0.2s" }}
                />
              </g>
            ))}

            {/* Tooltip for selected point */}
            {selectedPoint && (
              <g>
                <rect
                  x={xScale(selectedPoint.year) - 50}
                  y={yScale(selectedPoint.solar_share_elec) - 40}
                  width={100}
                  height={30}
                  rx={4}
                  fill={THEME.backgroundColor}
                  stroke={THEME.borderColor}
                  filter="url(#dropShadow)"
                />
                <text
                  x={xScale(selectedPoint.year)}
                  y={yScale(selectedPoint.solar_share_elec) - 20}
                  textAnchor="middle"
                  fontSize={12}
                  fontWeight="bold"
                  fill={THEME.textColor}
                >
                  {selectedPoint.year}: {selectedPoint.solar_share_elec}%
                </text>
              </g>
            )}

            {/* X axis label */}
            <text
              x={innerWidth / 2}
              y={innerHeight + 40}
              textAnchor="middle"
              fontSize={14}
              fill={THEME.textColor}
            >
              Year
            </text>

            {/* Y axis label */}
            <text
              transform={`rotate(-90, -40, ${innerHeight / 2})`}
              x={-40}
              y={innerHeight / 2}
              textAnchor="middle"
              fontSize={14}
              fill={THEME.textColor}
            >
              Solar Generation Growth (%)
            </text>
          </g>
        </svg>
      </div>

      {/* Main chart container */}
      <div
        ref={chartContainerRef}
        className={`bg-white py-4  flex flex-col justify-center  mx-auto w-full max-w-screen-2xl rounded-lg relative ${
          isFullscreen ? "fixed inset-0 z-50 max-w-none rounded-none" : ""
        }`}
      >
        <div className="flex flex-wrap justify-center  gap-4 mb-4">
          {/* View Type Toggle: Absolute vs Percentage */}
          <div className="inline-flex rounded-md shadow-sm" role="group">
            <button
              type="button"
              className={`px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200  ${
                viewType === "absolute" ? "bg-gray-300 " : "bg-gray-100 "
              }`}
              onClick={() => setViewType("absolute")}
            >
              Absolute (TWh)
            </button>
            <button
              type="button"
              className={`px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 ${
                viewType === "percentage" ? "bg-gray-300 " : "bg-gray-100 "
              }`}
              onClick={() => setViewType("percentage")}
            >
              Percentage (%)
            </button>
          </div>

          {/* Energy Source Toggle: All vs Renewables Only */}
          <div className="inline-flex rounded-md shadow-sm" role="group">
            <button
              type="button"
              className={`px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 ${
                sourceView === "all" ? "bg-gray-300 " : "bg-gray-100 "
              }`}
              onClick={() => setSourceView("all")}
            >
              All Sources
            </button>
            <button
              type="button"
              className={`px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 ${
                sourceView === "renewables" ? "bg-gray-300 " : "bg-gray-100 "
              }`}
              onClick={() => setSourceView("renewables")}
            >
              Renewables Only
            </button>
          </div>
        </div>

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
                    <div className="font-medium text-lg">Image (PNG)</div>
                    <div className="text-sm">Suitable for most use cases</div>
                  </div>
                  <div
                    onClick={handleSVGDownload}
                    className="w-full rounded-sm hover:bg-slate-200 items-center h-[100px] justify-center flex flex-col bg-slate-100 cursor-pointer"
                  >
                    <div className="font-medium text-lg">
                      Vector Image (SVG)
                    </div>
                    <div className="text-sm">
                      Scalable format, ideal for editing
                    </div>
                  </div>
                </div>
              )}

              {activeDownloadTab === "Data" && (
                <div className="mt-4 flex flex-col w-full items-center gap-1.5">
                  <div
                    onClick={handleFullCSVDownload}
                    className="w-full h-[100px] rounded-sm hover:bg-slate-200 items-center justify-center flex flex-col bg-slate-100 cursor-pointer"
                  >
                    <div className="font-medium text-lg">
                      Complete Dataset (CSV)
                    </div>
                    <div className="text-sm text-center">
                      Download complete data
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* The chart */}
        <svg
          width={screenSize === "small" ? width - 8 : width}
          height={height + margins.top + margins.bottom}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          {/* Chart title and subtitle */}
          {/* {isFullscreen && (
            <g transform={`translate(0, -5)`}>
              <text
                x={screenSize === "small" ? 50 : margins.left}
                y={20}
                fontSize={screenSize === "small" ? 12 : 16}
                fontWeight="bold"
                fill={THEME.textColor}
                className="text-wrap"
              >
                <tspan x={margins.left} dy="0">
                  Africa's Growing Solar Share of Electricity
                </tspan>
                <tspan x={margins.left} dy="20">
                  (2000–2023)
                </tspan>
              </text>
            </g>
          )} */}

          <g
            transform={`translate(${
              screenSize === "small" ? margins.left + 10 : margins.left
            },${margins.top - 15})`}
          >
            {/* Chart title */}
            {isFullscreen && (
              <text
                x={width / 2 - margins.left}
                y={-15}
                textAnchor="middle"
                fontSize={screenSize === "small" ? 12 : 16}
                fontWeight="bold"
              >
                Renewable Energy Mix in Africa (2000 - 2023)
              </text>
            )}

            {/* X Axis */}
            <g transform={`translate(0,${height})`}>
              {xTicks.map((tick) => (
                <g
                  key={`x-tick-${tick}`}
                  transform={`translate(${xScale(tick)},0)`}
                >
                  <line y2="6" stroke="currentColor" />
                  <text
                    key={tick}
                    style={{ fontSize: "12px", textAnchor: "middle" }}
                    y={20}
                  >
                    {tick}
                  </text>
                </g>
              ))}
              {/* X Axis Label */}
              {/* <text x={width / 2} y={40} textAnchor="middle" fontSize="14px">
                Year
              </text> */}
            </g>

            {/* Y Axis */}
            <g>
              {yTicks.map((tick) => (
                <g
                  key={`y-tick-${tick}`}
                  transform={`translate(0,${yScale(tick)})`}
                >
                  <line x2="-6" stroke="currentColor" />
                  <text
                    key={tick}
                    style={{ fontSize: "12px", textAnchor: "end" }}
                    x="-10"
                    y="4"
                  >
                    {tick}
                  </text>
                  <line
                    x1="0"
                    x2={width}
                    stroke="#e0e0e0"
                    strokeDasharray="3,3"
                    opacity="0.5"
                  />
                </g>
              ))}
              {/* Y Axis Label */}
              <text
                transform={`rotate(-90) translate(${-height / 2}, ${-40})`}
                textAnchor="middle"
                fontSize="14px"
              >
                {viewType === "absolute"
                  ? "Energy Production (TWh)"
                  : "Percentage (%)"}
              </text>
            </g>

            {/* Stacked Areas */}
            {stackedData.map((layer, i) => (
              <path
                key={`area-${activeKeys[i]}`}
                d={areaGenerator(layer)}
                fill={colors[activeKeys[i]]}
                opacity="0.8"
                style={{ transition: "opacity 0.2s" }}
                onMouseOver={(e) => {
                  e.currentTarget.style.opacity = "1";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.opacity = "0.8";
                }}
              />
            ))}

            {/* Invisible overlay for tooltip */}
            <rect
              width={width}
              height={height}
              fill="transparent"
              pointerEvents="all"
            />
          </g>
        </svg>

        {/* Legend - MOVED outside of SVG for better placement and responsiveness */}
        <div className="flex flex-wrap justify-center mt-2 gap-4 px-4">
          {activeKeys.map((key) => (
            <div key={`legend-${key}`} className="flex items-center gap-2">
              <div
                className="w-4 h-4"
                style={{ backgroundColor: colors[key] }}
              ></div>
              <span className="text-sm">{formatSourceName(key)}</span>
            </div>
          ))}
        </div>
      </div>
      {/* Tooltip */}
      {tooltipData && (
        <div
          className=" bg-white border border-gray-200 shadow-lg rounded p-2 z-10 pointer-events-none"
          style={{
            position: screenSize === "small" ? "fixed" : "absolute",
            left:
              screenSize === "small"
                ? "50%"
                : tooltipPos.x + 350 > window.innerWidth
                ? tooltipPos.x - 420
                : tooltipPos.x - 100,
            top: screenSize === "small" ? "auto" : tooltipPos.y - 50,
            bottom: screenSize === "small" ? 20 : "auto",
            transform: screenSize === "small" ? "translateX(-50%)" : "none",
            width: screenSize === "small" ? "90vw" : "240px",
            zIndex: 10,
            pointerEvents: "none",
            backgroundColor: "white",
            border: "1px solid #e5e7eb", // Tailwind's border-gray-200
            borderRadius: "0.375rem",
            padding: "0.5rem",
            boxShadow: "0 5px 10px rgba(0,0,0,0.1)",
            opacity: 0.95,
          }}
        >
          <div className="font-bold mb-1">Year: {tooltipData.year}</div>
          {tooltipData.values.map((item) => (
            <div key={`tooltip-${item.key}`} className="flex items-center mb-1">
              <div
                className="w-3 h-3 mr-2"
                style={{ backgroundColor: item.color }}
              ></div>
              <span>
                {formatSourceName(item.key)}: {item?.value?.toFixed(1)}
                {viewType === "absolute" ? " TWh" : "%"}
              </span>
            </div>
          ))}
          {viewType === "absolute" && (
            <div className="font-bold mt-1">
              Total: {tooltipData?.total?.toFixed(1)} TWh
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RenewableEnergyMix;
