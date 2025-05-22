import { extent, scaleLinear, line, curveMonotoneX } from "d3";
import React, { useEffect, useRef, useState } from "react";
import { Icon } from "@iconify/react";

import html2canvas from "html2canvas";

const SolarShareInGeneration = ({
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

  const [chartDimensions, setChartDimensions] = useState({
    width: 0,
    height: 0,
  });

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
  // X-axis scale
  const xScale = scaleLinear()
    .domain([2000, 2022])
    .range([0, innerWidth])
    .nice();

  // Y-scale
  const yScale = scaleLinear()
    .domain([0, Math.max(...data.map((d) => d.solar_share_elec)) * 1.1]) // Add 10% padding at the top
    .range([innerHeight, 0])
    .nice();

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
    console.log("left");
    setSelectedPoint(null);
  };

  // Handle downloads
  const handleDownload = () => {
    if (onDownload && typeof onDownload === "function") {
      console.log("should download");
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
    <div className="w-full h-full font-sans">
      {/* Hidden chart container */}
      <div ref={chartRef} className="fixed -top-[2000%]">
        {/* The chart */}
        <svg width={width} height={height}>
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
        className={`bg-white  flex flex-col-reverse justify-center  mx-auto w-full max-w-screen-2xl rounded-lg relative ${
          isFullscreen ? "fixed inset-0 z-50 max-w-none rounded-none" : ""
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
        <svg width={width} height={height}>
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
          {isFullscreen && (
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
          )}

          <g transform={`translate(${margins.left}, ${margins.top})`}>
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
                {/* Invisible hitbox circle */}
                <circle
                  cx={xScale(datum.year)}
                  cy={yScale(datum.solar_share_elec)}
                  r={10} // Larger hit area
                  fill="transparent"
                  onMouseEnter={() => handlePointHover(datum)}
                  onMouseLeave={handlePointLeave}
                />

                {/* Visible circle */}
                <circle
                  cx={xScale(datum.year)}
                  cy={yScale(datum.solar_share_elec)}
                  r={
                    selectedPoint === datum
                      ? screenSize === "small"
                        ? 1.5
                        : 4
                      : screenSize === "small"
                      ? 3
                      : 6
                  }
                  fill={
                    selectedPoint === datum
                      ? THEME.accentColor
                      : THEME.primaryColor
                  }
                  stroke={THEME.backgroundColor}
                  strokeWidth={screenSize === "small" ? 1 : 2}
                  style={{ cursor: "pointer", transition: "r 0.2s" }}
                  pointerEvents="none" // Let the invisible circle handle events
                />
              </g>
            ))}

            {/* Tooltip for selected point */}
            {selectedPoint && (
              <g style={{ pointerEvents: "none" }}>
                <rect
                  x={xScale(selectedPoint.year) - 70}
                  y={yScale(selectedPoint.solar_share_elec) - 40}
                  width={110}
                  height={30}
                  rx={4}
                  fill={THEME.backgroundColor}
                  filter="url(#dropShadow)"
                />
                <text
                  x={xScale(selectedPoint.year) - 15}
                  y={yScale(selectedPoint.solar_share_elec) - 20}
                  textAnchor="middle"
                  fontSize={12}
                  fontWeight="500"
                  fill={THEME.textColor}
                >
                  {selectedPoint.year}:{" "}
                  {selectedPoint.solar_share_elec?.toFixed(2)} %
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
              Solar Share of Electricity Generation (%)
            </text>
          </g>
        </svg>
      </div>
    </div>
  );
};

export default SolarShareInGeneration;
