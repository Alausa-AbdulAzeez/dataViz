import { csv, max, scaleBand, scaleLinear } from "d3";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { Navbar, Range } from "../../components";
import { Icon } from "@iconify/react";

const AfricasSolarSurge = () => {
  const defaultYear = 2020;
  const years = { min: 1950, max: 2023 };
  const colorByRegion = false;
  const enableSharing = true;

  const chartContainerRef = useRef(null);
  const [currentYear, setCurrentYear] = useState(defaultYear);
  const [showOnlySelected, setShowOnlySelected] = useState(false);

  const [compareYear, setCompareYear] = useState(null);
  const [activeDownloadTab, setActiveDownloadTab] = useState("Chart");
  const [isSharingModalOpen, setIsSharingModalOpen] = useState(false);

  const [selectedSortForm, setSelectedSortForm] = useState("Sort Descending");
  const [showSort, setShowSort] = useState(false);
  const [selectedSortType, setSelectedSortType] =
    useState("Sort by Population");
  const [selectedCountries, setSelectedCountries] = useState([]);
  const [iconTooltip, setIconTooltip] = useState({
    visible: false,
    content: "",
  });

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hoveredCountry, setHoveredCountry] = useState(null);

  const [enableCompareMode, setEnableCompareMode] = useState(false);
  const [defaultData, setDefaultData] = useState([]);

  const [screenSize, setScreenSize] = useState("large");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [tooltip, setTooltip] = useState({
    visible: false,
    x: 0,
    y: 0,
    content: "",
  });
  const chartRef = useRef(null);
  const [chartDimensions, setChartDimensions] = useState({
    width: 0,
    height: 0,
  });

  // Chart margins and dimensions
  const margins = { top: 20, right: 80, bottom: 20, left: 120 };
  const width = chartDimensions.width || 800;
  const height = chartDimensions.height || 500;
  const innerWidth = width - margins.left - margins.right;
  const innerHeight = height - margins.top - margins.bottom;

  // Filtering and sorting data
  const filteredData = React.useMemo(() => {
    let filtered = data?.length ? [...data] : [];
    if (showOnlySelected) {
      return filtered?.filter((datum) =>
        selectedCountries?.includes(datum?.country)
      );
    } else {
      // Filter by search term
      if (searchTerm) {
        filtered = filtered.filter((d) =>
          d.country.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      // Apply sorting
      if (selectedSortType === "Sort by Population") {
        filtered.sort((a, b) => {
          return selectedSortForm === "Sort Descending"
            ? b[currentYear] - a[currentYear]
            : a[currentYear] - b[currentYear];
        });
      } else if (selectedSortType === "Sort Alphabetically") {
        filtered.sort((a, b) => {
          return selectedSortForm === "Sort Descending"
            ? b.country.localeCompare(a.country)
            : a.country.localeCompare(b.country);
        });
      }
      setDefaultData(filtered);
      return filtered;
    }
  }, [
    data,
    currentYear,
    selectedSortType,
    selectedSortForm,
    searchTerm,
    showOnlySelected,
  ]);

  // Fullscreen toggle functionality
  const toggleFullscreen = useCallback(() => {
    if (!chartContainerRef.current) return;

    if (!isFullscreen) {
      if (chartContainerRef.current.requestFullscreen) {
        chartContainerRef.current.requestFullscreen();
      } else if (chartContainerRef.current.webkitRequestFullscreen) {
        chartContainerRef.current.webkitRequestFullscreen();
      } else if (chartContainerRef.current.msRequestFullscreen) {
        chartContainerRef.current.msRequestFullscreen();
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
      setIsFullscreen(false);
    }
  }, [isFullscreen]);

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
          width: containerWidth * 0.9, // 90% of container width
          height: Math.min(Math.max(containerWidth * 0.6, 300), 600), // between 300–600px
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

  const fetchData = async () => {
    try {
      const res = (
        await csv("/assets/data/energyData.csv", (d) => {
          if (d.year === `${currentYear}`) {
            return {
              country: d.country,
              year: +d.year,
              solar_consumption: +d.solar_consumption || 0,
            };
          }
        })
      ).filter(Boolean);

      console.log(res);
      setData(res);
      setLoading(false);
    } catch (error) {
      console.log("Error fetching data:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentYear]);

  // Determine max value for x scale
  const maxValue = max(filteredData, (d) => {
    // if (compareYear) {
    //   return Math.max(d[currentYear] || 0, d[compareYear] || 0);
    // }
    return d.solar_consumption;
  });

  const xDomain = [0, maxValue]; // 10% padding

  const xScale = filteredData
    ? scaleLinear().domain(xDomain).range([0, innerWidth])
    : null;

  const yScale = filteredData
    ? scaleBand()
        .domain(filteredData.map((d) => d.country))
        .range([0, innerHeight])
        .padding(0.1)
    : null;

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

  const handleCSVDownload = () => {
    if (onDownload && typeof onDownload === "function") {
      onDownload("CSV", { currentYear, data: filteredData });
    }
  };

  const handleFullCSVDownload = () => {
    if (onDownload && typeof onDownload === "function") {
      onDownload("FullCSV", { data });
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8 overflow-x-hidden w-full">
        {" "}
        <h1 className="text-2xl font-bold">World Population Data</h1>
        <div className="relative w-full min-h-fit h-auto">
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
                      onClick={handleCSVDownload}
                      className="w-full h-[100px] rounded-sm hover:bg-slate-200 items-center justify-center flex flex-col bg-slate-100 cursor-pointer"
                    >
                      <div className="font-medium text-lg">
                        Current Year Data (CSV)
                      </div>
                      <div className="text-sm">
                        Download data for {currentYear} only
                      </div>
                    </div>
                    <div
                      onClick={handleFullCSVDownload}
                      className="w-full h-[100px] rounded-sm hover:bg-slate-200 items-center justify-center flex flex-col bg-slate-100 cursor-pointer"
                    >
                      <div className="font-medium text-lg">
                        Complete Dataset (CSV)
                      </div>
                      <div className="text-sm text-center">
                        Download all years of population data
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Sharing Modal */}
          {isSharingModalOpen && (
            <div className="absolute w-full h-full flex items-start justify-center">
              <div
                onClick={() => setIsSharingModalOpen(false)}
                className="cursor-pointer absolute w-full h-full z-[10] bg-black opacity-40"
              ></div>
              <div className="mt-10 rounded-sm w-[80%] max-w-md h-auto p-4 bg-white z-[20]">
                <div className="flex justify-between items-center text-xs font-semibold text-gray-500">
                  <div className="">SHARE</div>
                  <Icon
                    icon="ic:round-cancel"
                    className="hover:rotate-45 transition-all ease-in-out duration-300 cursor-pointer"
                    width="24"
                    height="24"
                    onClick={() => setIsSharingModalOpen(false)}
                  />
                </div>

                <div className="mt-6 grid grid-cols-2 gap-4">
                  <div
                    onClick={() => handleShare("twitter")}
                    className="flex flex-col items-center p-4 bg-gray-100 hover:bg-gray-200 rounded cursor-pointer"
                  >
                    <Icon icon="mdi:twitter" width="24" height="24" />
                    <span className="mt-2 text-sm">Twitter</span>
                  </div>
                  <div
                    onClick={() => handleShare("facebook")}
                    className="flex flex-col items-center p-4 bg-gray-100 hover:bg-gray-200 rounded cursor-pointer"
                  >
                    <Icon icon="mdi:facebook" width="24" height="24" />
                    <span className="mt-2 text-sm">Facebook</span>
                  </div>
                  <div
                    onClick={() => handleShare("linkedin")}
                    className="flex flex-col items-center p-4 bg-gray-100 hover:bg-gray-200 rounded cursor-pointer"
                  >
                    <Icon icon="mdi:linkedin" width="24" height="24" />
                    <span className="mt-2 text-sm">LinkedIn</span>
                  </div>
                  <div
                    onClick={() => handleShare("email")}
                    className="flex flex-col items-center p-4 bg-gray-100 hover:bg-gray-200 rounded cursor-pointer"
                  >
                    <Icon icon="mdi:email" width="24" height="24" />
                    <span className="mt-2 text-sm">Email</span>
                  </div>
                  <div
                    onClick={() => handleShare("copy")}
                    className="flex flex-col items-center p-4 bg-gray-100 hover:bg-gray-200 rounded cursor-pointer col-span-2"
                  >
                    <Icon icon="mdi:content-copy" width="24" height="24" />
                    <span className="mt-2 text-sm">Copy Link</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Main chart container */}
          <div className="px-4 pb-8">
            <div
              ref={chartContainerRef}
              className={`bg-white flex justify-center px-3 my-5 mx-auto w-full max-w-screen-xl rounded-md relative ${
                isFullscreen ? "h-full" : ""
              }`}
            >
              <div className="mx-auto w-full md:w-[90%] h-full py-5">
                {/* Controls bar */}
                <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                  {/* Compare mode toggle */}
                  {enableCompareMode && screenSize !== "small" && (
                    <div className="mb-4 flex items-center">
                      <div className="mr-2 text-sm">Compare with year:</div>
                      <select
                        value={compareYear || ""}
                        onChange={(e) =>
                          toggleCompareMode(
                            e.target.value ? parseInt(e.target.value) : null
                          )
                        }
                        className="text-sm border rounded py-1 px-2"
                      >
                        <option value="">None</option>
                        {Array.from(
                          { length: years.max - years.min + 1 },
                          (_, i) => years.min + i
                        )
                          .filter((year) => year !== currentYear)
                          .map((year) => (
                            <option key={year} value={year}>
                              {year}
                            </option>
                          ))}
                      </select>
                    </div>
                  )}

                  {/* Search */}
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search countries..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="text-sm py-1 px-2 border rounded-md"
                    />
                    {searchTerm && (
                      <button
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500"
                        onClick={() => setSearchTerm("")}
                      >
                        <Icon icon="ic:round-close" width="16" height="16" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Chart header */}
                <div className="mb-3 flex flex-wrap justify-between items-center gap-2">
                  <div className="text-lg font-semibold">
                    Access to energy, {currentYear}
                    {compareYear && ` vs ${compareYear}`}
                  </div>

                  {/* Sort controls */}
                  <div
                    className="relative"
                    onMouseEnter={() => setShowSort(true)}
                    onMouseLeave={() => setShowSort(false)}
                  >
                    <button className="text-sm py-1 px-3 bg-gray-100 hover:bg-gray-200 rounded">
                      {selectedSortForm === "Sort Descending"
                        ? "Sort Descending"
                        : "Sort Ascending"}
                    </button>
                    {showSort && (
                      <div className="absolute right-0 min-w-full pt-1 z-20">
                        <div className="shadow-md min-w-full cursor-pointer bg-gray-100">
                          {["Sort by Population", "Sort Alphabetically"]?.map(
                            (sortType, index) => (
                              <div
                                key={index}
                                className={`${
                                  sortType === selectedSortType &&
                                  "bg-slate-300"
                                } p-2 text-nowrap text-xs hover:bg-slate-200`}
                                onClick={() => handleSortTypeChange(sortType)}
                              >
                                {sortType}
                              </div>
                            )
                          )}

                          <div className="w-full h-[1px] bg-[#e6e6e6]"></div>
                          {["Sort Descending", "Sort Ascending"]?.map(
                            (sortForm, index) => (
                              <div
                                key={index}
                                className={`${
                                  sortForm === selectedSortForm &&
                                  "bg-slate-300"
                                } p-2 text-nowrap text-xs hover:bg-slate-200`}
                                onClick={() => handleSortFormChange(sortForm)}
                              >
                                {sortForm}
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Main chart bars */}
                <svg width={width} height={height}>
                  {/* <g transform={`translate(${margins.left},${margins.top})`}>
                    {data.map((datum) => (
                      <rect
                        key={datum.country}
                        x={0}
                        y={yScale(datum.country)}
                        width={Math.max(1, xScale(datum.solar_consumption))} // make 0s visible
                        height={yScale.bandwidth()}
                        fill="#f2a900"
                      />
                    ))}
                  </g> */}
                  <g transform={`translate(${margins.left}, ${margins.top})`}>
                    {/* country labels */}
                    {/* {filteredData?.map((datum) => (
                      <text
                        key={`country-${datum.country}`}
                        className={`${
                          hoveredCountry === datum?.country
                            ? "opacity-100"
                            : "opacity-60"
                        }`}
                        fill={"#000"}
                        x={-5}
                        y={yScale(datum?.country) + yScale.bandwidth() / 2}
                        dy={".36em"}
                        fontSize={12}
                        fontWeight={400}
                        style={{ textAnchor: "end" }}
                      >
                        {datum?.country}
                      </text>
                    ))} */}
                    {/* Bars for current year */}
                    {filteredData?.map((datum) => {
                      console.log(datum);

                      return (
                        <rect
                          key={`bar-${datum.country}`}
                          x={0}
                          width={Math.max(2, xScale(datum.solar_consumption))}
                          height={yScale.bandwidth()}
                          fill={`#4682B4`}
                          y={yScale(datum?.country)}
                          className={`${
                            hoveredCountry === datum?.country
                              ? "opacity-100"
                              : "opacity-60"
                          }`}
                          onMouseEnter={() => setHoveredCountry(datum.country)}
                          onMouseMove={(e) => {
                            const svgRect =
                              e.currentTarget.ownerSVGElement.getBoundingClientRect();
                            setTooltip({
                              visible: true,
                              x: e.clientX - svgRect.left + 10,
                              y: e.clientY - svgRect.top + 10,
                              content: `${datum.country}: ${datum?.solar_consumption}`,
                            });
                          }}
                          onMouseLeave={() => {
                            setHoveredCountry(null);
                            setTooltip({
                              visible: false,
                              x: 0,
                              y: 0,
                              content: "",
                            });
                          }}
                          onClick={() => {
                            showDataCard(datum.country);
                          }}
                        />
                      );
                    })}

                    {/* Bars for compare year if enabled */}
                    {/* {compareYear &&
                      filteredData?.map((datum) => (
                        <rect
                          key={`bar-${datum.country}`}
                          x={0}
                          width={xScale(datum[compareYear] || 0)}
                          height={yScale.bandwidth() / 2}
                          y={yScale(datum?.country) + yScale.bandwidth() / 2}
                          fill={"rgba(0,0,0,0.3)"}
                        />
                      ))} */}

                    {/* Population values for current year */}
                    {/* {filteredData?.map((datum) => (
                      <text
                        key={`pop-${datum.country}`}
                        fill={"#000"}
                        x={xScale(datum[currentYear] || 0) + 5}
                        y={
                          yScale(datum?.country) +
                          (compareYear
                            ? yScale.bandwidth() / 4
                            : yScale.bandwidth() / 2)
                        }
                        dy={".36em"}
                        fontSize={12}
                        className={`${
                          hoveredCountry === datum?.country
                            ? "opacity-100"
                            : "opacity-60"
                        }`}
                        fontWeight={400}
                      >
                        {Number(datum[currentYear] || 0)?.toLocaleString()}
                      </text>
                    ))} */}

                    {/* Population values for compare year */}
                    {/* {compareYear &&
                      filteredData?.map((datum) => (
                        <text
                          key={`pop-compare-${datum.country}`}
                          fill={"#000"}
                          x={xScale(datum[compareYear] || 0) + 5}
                          y={
                            yScale(datum?.country) +
                            (3 * yScale.bandwidth()) / 4
                          }
                          dy={".36em"}
                          fontSize={12}
                          className={`${
                            hoveredCountry === datum?.country
                              ? "opacity-100"
                              : "opacity-60"
                          }`}
                          fontWeight={400}
                        >
                          {Number(datum[compareYear] || 0)?.toLocaleString()}
                        </text>
                      ))} */}
                  </g>
                </svg>

                {/* Filter toggle */}
                {selectedCountries.length > 0 && (
                  <div className="mt-4 flex items-center gap-2">
                    <button
                      className="text-sm py-1 px-3 bg-gray-100 hover:bg-gray-200 rounded flex items-center gap-1"
                      onClick={() => {
                        // Toggle between filtered and unfiltered view
                        // You can implement this by adding a state variable
                        setShowOnlySelected(!showOnlySelected);
                      }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M4 12a8 8 0 0 1 8-8"></path>
                        <path d="M12 4a8 8 0 0 1 8 8"></path>
                        <path d="M12 20a8 8 0 0 1-8-8"></path>
                        <path d="M20 12a8 8 0 0 1-8 8"></path>
                        <circle cx="12" cy="12" r="2"></circle>
                      </svg>
                      {showOnlySelected
                        ? "Show all countries"
                        : "Focus on selected"}
                    </button>
                  </div>
                )}

                {/* Tooltip */}
                {tooltip.visible && (
                  <div
                    className="absolute text-xs bg-white shadow-md px-2 py-1 rounded border border-gray-300 pointer-events-none z-30"
                    style={{
                      position: "absolute",
                      left: `${tooltip.x + margins.left}px`,
                      top: `${tooltip.y + margins.top}px`,
                      backgroundColor: "white",
                      border: "1px solid #ccc",
                      padding: "6px 10px",
                      fontSize: "12px",
                      borderRadius: "4px",
                      boxShadow: "0px 2px 6px rgba(0,0,0,0.1)",
                      pointerEvents: "none",
                    }}
                  >
                    {tooltip.content}
                  </div>
                )}

                {/* Year range slider */}
                <div className="mt-4 flex items-center gap-2">
                  <Range
                    min={years?.min || 0}
                    max={years?.max || 2000}
                    step={1}
                    defaultValue={2020}
                    showLabels={true}
                    thresholds={[]}
                    slideStyle="bg-green-500 h-1"
                    trackStyle="bg-gray-300 h-1"
                    thumbStyle="bg-green-600 border-2 border-white"
                    labelFormat={(value) => `${value}`}
                    showCurrentValue={true}
                    currentValuePosition="above"
                    height="4px"
                    thumbSize="20px"
                    onChange={(value) => setCurrentYear(value)}
                  />
                </div>

                {/* Legend for regions if colorByRegion is enabled */}
                {colorByRegion && (
                  <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
                    <span className="text-sm font-medium">Regions:</span>
                    {Object.entries(regionColors).map(([region, color]) => (
                      <div key={region} className="flex items-center gap-1">
                        <div
                          style={{ backgroundColor: color }}
                          className="w-3 h-3 rounded-sm"
                        />
                        <span className="text-xs">{region}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Chart footer */}
                <div className="mt-4 flex flex-wrap  items-center justify-between gap-4">
                  {/* LHS - Data source */}
                  <div className="">
                    <div className="text-xs font-semibold">
                      Data source:{" "}
                      <span className="font-normal">
                        UN Population Data {currentYear}
                      </span>
                    </div>
                    <div className="text-xs">
                      OurWorldinData.org/population | CC BY
                    </div>
                  </div>

                  {/* RHS - Action buttons */}
                  <div className="flex h-8 justify-center gap-2">
                    {/* Fullscreen toggle button */}
                    <div
                      onClick={toggleFullscreen}
                      onMouseEnter={() => {
                        setIconTooltip({
                          visible: true,
                          content: isFullscreen
                            ? `Exit Fullscreen`
                            : `Fullscreen`,
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
                      {iconTooltip?.visible &&
                        iconTooltip?.content === "Download" && (
                          <div className="absolute bg-white border border-[#ccc] px-[10px] py-[6px] -top-9 text-xs rounded-sm">
                            {iconTooltip?.content}
                          </div>
                        )}
                      <Icon
                        icon={"material-symbols-light:download-sharp"}
                        className="w-5 h-5"
                      />
                    </div>

                    {enableSharing && (
                      <div
                        onClick={() => setIsSharingModalOpen(true)}
                        onMouseEnter={() => {
                          setIconTooltip({
                            visible: true,
                            content: `Share`,
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
                        {iconTooltip?.visible &&
                          iconTooltip?.content === "Share" && (
                            <div className="absolute bg-white border border-[#ccc] px-[10px] py-[6px] -top-9 text-xs rounded-sm">
                              {iconTooltip?.content}
                            </div>
                          )}
                        <Icon
                          icon={"material-symbols-light:share"}
                          className="w-5 h-5"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AfricasSolarSurge;
