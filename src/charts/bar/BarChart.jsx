import React, { useState, useRef, useEffect, useCallback } from "react";
import { Icon } from "@iconify/react";
import { TableCellsMerge, ChartBar } from "lucide-react";
import * as d3 from "d3";
import { Range } from "../../components";

const BarChart = ({
  data,
  title = "Population by Country",
  width = 900,
  height = 500,
  years = { min: 1950, max: 2020 },
  defaultYear = 2020,
  colorByRegion = false,
  regionsMap = {}, // Map of countries to regions
  regionColors = {}, // Map of regions to colors
  defaultColor = "#4f46e5", // Default color if not using colorByRegion
  enableCompareMode = false,
  onDownload = () => {},
  enableSharing = false,
}) => {
  // State management
  const [currentYear, setCurrentYear] = useState(defaultYear);
  const [compareYear, setCompareYear] = useState(null);
  const [hoveredCountry, setHoveredCountry] = useState(null);
  const [showOnlySelected, setShowOnlySelected] = useState(false);
  const [selectedCountries, setSelectedCountries] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeDownloadTab, setActiveDownloadTab] = useState("Chart");
  const [showSort, setShowSort] = useState(false);
  const [selectedSortType, setSelectedSortType] =
    useState("Sort by Population");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const chartContainerRef = useRef(null);
  const [selectedSortForm, setSelectedSortForm] = useState("Sort Descending");
  const [tooltip, setTooltip] = useState({
    visible: false,
    x: 0,
    y: 0,
    content: "",
  });
  const [iconTooltip, setIconTooltip] = useState({
    visible: false,
    content: "",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [zoomRange, setZoomRange] = useState(null);
  const [isDataCardVisible, setIsDataCardVisible] = useState(false);
  const [dataCardInfo, setDataCardInfo] = useState(null);
  const [isSharingModalOpen, setIsSharingModalOpen] = useState(false);
  const [defaultData, setDefaultData] = useState([]);

  const chartRef = useRef(null);

  // Filtering and sorting data
  const filteredData = React.useMemo(() => {
    let filtered = [...data];
    if (showOnlySelected) {
      return filtered?.filter((datum) =>
        selectedCountries?.includes(datum?.Country)
      );
    } else {
      // Filter by search term
      if (searchTerm) {
        filtered = filtered.filter((d) =>
          d.Country.toLowerCase().includes(searchTerm.toLowerCase())
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
            ? b.Country.localeCompare(a.Country)
            : a.Country.localeCompare(b.Country);
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

  // Dimensions and scales
  const margins = { top: 20, right: 30, bottom: 40, left: 120 };
  const innerWidth = width - margins.left - margins.right;
  const innerHeight = height - margins.top - margins.bottom;

  // Create scales
  const yScale = d3
    .scaleBand()
    .domain(filteredData.map((d) => d.Country))
    .range([0, innerHeight])
    .padding(0.1);

  // Determine max value for x scale
  const maxValue = d3.max(filteredData, (d) => {
    if (compareYear) {
      return Math.max(d[currentYear] || 0, d[compareYear] || 0);
    }
    return d[currentYear] || 0;
  });

  // Apply zoom if active
  const xDomain = zoomRange ? [0, zoomRange.max] : [0, maxValue * 1.1]; // 10% padding

  const xScale = d3.scaleLinear().domain(xDomain).range([0, innerWidth]);

  // Get color for a country
  const getCountryColor = (country) => {
    if (!colorByRegion) return defaultColor;

    const region = regionsMap[country];
    return region ? regionColors[region] || defaultColor : defaultColor;
  };

  // Handle country selection
  const toggleCountrySelection = (country) => {
    setSelectedCountries((prev) =>
      prev.includes(country)
        ? prev.filter((c) => c !== country)
        : [...prev, country]
    );
  };

  // Handle zoom controls
  const applyZoom = (min, max) => {
    setZoomRange({ min, max });
  };

  const resetZoom = () => {
    setZoomRange(null);
  };

  // Show data card with statistics
  const showDataCard = (country) => {
    const countryData = data.find((d) => d.Country === country);
    if (!countryData) return;

    // Calculate some basic statistics
    const currentValue = countryData[currentYear] || 0;
    let growthRate = null;
    const prevYear = currentYear - 10;

    if (countryData[prevYear]) {
      growthRate = (currentValue / countryData[prevYear] - 1) * 100;
    }

    setDataCardInfo({
      country,
      currentValue,
      growthRate,
      region: regionsMap[country] || "Unknown",
      year: currentYear,
    });

    setIsDataCardVisible(true);
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

  // Handle sort changes
  const handleSortTypeChange = (sortType) => {
    setSelectedSortType(sortType);
  };

  const handleSortFormChange = (sortForm) => {
    setSelectedSortForm(sortForm);
    setShowSort(false);
  };

  // Sharing functionality
  const handleShare = (platform) => {
    const shareUrl = window.location.href;
    const shareTitle = `Population data for ${
      selectedCountries.length > 0 ? selectedCountries.join(", ") : "countries"
    } in ${currentYear}`;

    let shareLink = "";

    switch (platform) {
      case "twitter":
        shareLink = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
          shareTitle
        )}&url=${encodeURIComponent(shareUrl)}`;
        break;
      case "facebook":
        shareLink = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
          shareUrl
        )}`;
        break;
      case "linkedin":
        shareLink = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
          shareUrl
        )}`;
        break;
      case "email":
        shareLink = `mailto:?subject=${encodeURIComponent(
          shareTitle
        )}&body=${encodeURIComponent(
          `Check out this population data: ${shareUrl}`
        )}`;
        break;
      default:
        // Copy link to clipboard
        navigator.clipboard.writeText(shareUrl);
        alert("Link copied to clipboard!");
        setIsSharingModalOpen(false);
        return;
    }

    window.open(shareLink, "_blank");
    setIsSharingModalOpen(false);
  };

  // Toggle compare mode
  const toggleCompareMode = (year) => {
    if (compareYear === year) {
      setCompareYear(null);
    } else {
      setCompareYear(year);
    }
  };
  // Function to determine bar opacity based on selection state
  const getBarOpacity = (country) => {
    if (selectedCountries.length === 0) return 0.8; // Default opacity
    return selectedCountries.includes(country) ? 1 : 0.3; // Higher opacity for selected
  };

  // Function to determine bar color based on selection state
  const getBarFill = (country) => {
    const baseColor = colorByRegion ? getCountryColor(country) : "#3b82f6"; // Blue default or region color
    if (selectedCountries.length === 0) return baseColor;
    return selectedCountries.includes(country) ? baseColor : `${baseColor}80`; // Add transparency for non-selected
  };

  // Function to add visual highlight to selected countries
  const getBarStyle = (country) => {
    return selectedCountries.includes(country)
      ? { stroke: "#000", strokeWidth: 1 }
      : {};
  };

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

  // Add event listener for fullscreen change
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(
        document.fullscreenElement ||
          document.webkitFullscreenElement ||
          document.msFullscreenElement
      );
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    document.addEventListener("msfullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener(
        "webkitfullscreenchange",
        handleFullscreenChange
      );
      document.removeEventListener(
        "msfullscreenchange",
        handleFullscreenChange
      );
    };
  }, []);

  return (
    <div className="relative">
      {/* Hidden chart for export */}
      <div ref={chartRef} className="fixed -top-[200%]">
        <div className="px-3 my-10 mx-auto w-[1000px] rounded-md relative">
          <div className="mx-auto w-[90%] h-full py-5">
            <div className="mb-3 flex justify-between">
              <div className="text-lg font-semibold">
                {title}, {currentYear}
                {compareYear && ` vs ${compareYear}`}
              </div>
            </div>

            <svg width={width} height={height}>
              <g transform={`translate(${margins.left}, ${margins.top})`}>
                {/* Country labels */}
                {filteredData?.map((datum) => (
                  <text
                    key={`country-${datum.Country}`}
                    fill={"#000"}
                    x={-5}
                    y={yScale(datum?.Country) + yScale.bandwidth() / 2}
                    dy={".36em"}
                    fontSize={12}
                    fontWeight={400}
                    style={{ textAnchor: "end" }}
                  >
                    {datum?.Country}
                  </text>
                ))}

                {/* Bars for current year */}
                {filteredData?.map((datum) => (
                  <rect
                    key={`bar-${datum.Country}`}
                    x={0}
                    width={xScale(datum[currentYear] || 0)}
                    height={yScale.bandwidth()}
                    fill={getCountryColor(datum.Country)}
                    y={yScale(datum?.Country)}
                  />
                ))}

                {/* Bars for compare year if enabled */}
                {compareYear &&
                  filteredData?.map((datum) => (
                    <rect
                      key={`bar-compare-${datum.Country}`}
                      x={0}
                      width={xScale(datum[compareYear] || 0)}
                      height={yScale.bandwidth() / 2}
                      fill={"rgba(0,0,0,0.3)"}
                      y={yScale(datum?.Country) + yScale.bandwidth() / 2}
                    />
                  ))}

                {/* Values */}
                {filteredData?.map((datum) => (
                  <text
                    key={`pop-${datum.Country}`}
                    fill={"#000"}
                    x={xScale(datum[currentYear] || 0) + 5}
                    y={yScale(datum?.Country) + yScale.bandwidth() / 2}
                    dy={".36em"}
                    fontSize={12}
                    fontWeight={400}
                  >
                    {Number(datum[currentYear] || 0)?.toLocaleString()}
                  </text>
                ))}
              </g>
            </svg>

            {/* Chart footer */}
            <div className="mt-4 flex items-center justify-between">
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
            </div>
          </div>
        </div>
      </div>

      {/* Main chart container */}
      <div
        ref={chartContainerRef}
        className="bg-white px-3 my-10 mx-auto w-[1000px] rounded-md relative"
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
                    <div className="text-sm">
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

        {/* Data Card */}
        {isDataCardVisible && dataCardInfo && (
          <div className="absolute z-30 bg-white shadow-lg border rounded-md p-4 w-64 right-0 top-12">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold">{dataCardInfo.country}</h3>
              <button
                onClick={() => setIsDataCardVisible(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <Icon icon="ic:round-close" width="18" height="18" />
              </button>
            </div>

            <div className="mt-3 space-y-2">
              <div>Region: {dataCardInfo.region}</div>
              <div>
                Population ({dataCardInfo.year}):{" "}
                {dataCardInfo.currentValue.toLocaleString()}
              </div>
              {dataCardInfo.growthRate !== null && (
                <div>
                  10-Year Growth Rate:
                  <span
                    className={
                      dataCardInfo.growthRate >= 0
                        ? "text-green-600"
                        : "text-red-600"
                    }
                  >
                    {dataCardInfo.growthRate.toFixed(2)}%
                  </span>
                </div>
              )}
              <div className="pt-2">
                <button
                  onClick={() => toggleCountrySelection(dataCardInfo.country)}
                  className={`text-sm py-1 px-2 rounded ${
                    selectedCountries.includes(dataCardInfo.country)
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 hover:bg-gray-300"
                  }`}
                >
                  {selectedCountries.includes(dataCardInfo.country)
                    ? "Remove from Selection"
                    : "Add to Selection"}
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="mx-auto w-[90%] h-full py-5">
          {/* Controls bar */}
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <div className="text-sm flex items-center justify-center w-fit p-1 gap-1 cursor-pointer">
                <TableCellsMerge className="h-4 w-4" />
                <span>Table</span>
              </div>
              <div className="text-sm flex items-center justify-center w-fit p-1 gap-1 cursor-pointer">
                <ChartBar className="h-4 w-4" />
                <span>Chart</span>
              </div>
            </div>

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

          {/* Compare mode toggle */}
          {enableCompareMode && (
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

          {/* Selection indicator */}
          {selectedCountries.length > 0 && (
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <span className="text-sm">Selected:</span>
              {selectedCountries.map((country) => (
                <div
                  key={country}
                  className="flex items-center bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
                >
                  {country}
                  <button
                    className="ml-1 text-blue-800"
                    onClick={() => toggleCountrySelection(country)}
                  >
                    <Icon icon="ic:round-close" width="14" height="14" />
                  </button>
                </div>
              ))}
              <button
                className="text-xs text-gray-600 underline ml-2"
                onClick={() => setSelectedCountries([])}
              >
                Clear all
              </button>
            </div>
          )}

          {/* Zoom controls */}
          <div className="mb-4 flex items-center gap-2">
            <span className="text-sm">Zoom:</span>
            <button
              className={`text-xs py-1 px-2 rounded ${
                !zoomRange
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 hover:bg-gray-300"
              }`}
              onClick={resetZoom}
            >
              Full
            </button>
            <button
              className={`text-xs py-1 px-2 rounded ${
                zoomRange?.max === maxValue / 2
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 hover:bg-gray-300"
              }`}
              onClick={() => applyZoom(0, maxValue / 2)}
            >
              Top 50%
            </button>
            <button
              className={`text-xs py-1 px-2 rounded ${
                zoomRange?.max === maxValue / 4
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 hover:bg-gray-300"
              }`}
              onClick={() => applyZoom(0, maxValue / 4)}
            >
              Top 25%
            </button>
            <button
              className={`text-xs py-1 px-2 rounded ${
                zoomRange?.max === maxValue / 10
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 hover:bg-gray-300"
              }`}
              onClick={() => applyZoom(0, maxValue / 10)}
            >
              Top 10%
            </button>
          </div>

          {/* Chart header */}
          <div className="mb-3 flex justify-between">
            <div className="text-lg font-semibold">
              {title}, {currentYear}
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
                            sortType === selectedSortType && "bg-slate-300"
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
                            sortForm === selectedSortForm && "bg-slate-300"
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

          {/* The chart */}
          <svg width={width} height={height}>
            <g transform={`translate(${margins.left}, ${margins.top})`}>
              {/* Country labels */}
              {filteredData?.map((datum) => (
                <text
                  key={`country-${datum.Country}`}
                  className={`${
                    hoveredCountry === datum?.Country
                      ? "opacity-100"
                      : "opacity-60"
                  }`}
                  fill={"#000"}
                  x={-5}
                  y={yScale(datum?.Country) + yScale.bandwidth() / 2}
                  dy={".36em"}
                  fontSize={12}
                  fontWeight={400}
                  style={{ textAnchor: "end" }}
                >
                  {datum?.Country}
                </text>
              ))}
              {/* Bars for current year */}
              {filteredData?.map((datum) => (
                <rect
                  key={`bar-${datum.Country}`}
                  x={0}
                  width={xScale(datum[currentYear] || 0)}
                  height={yScale.bandwidth()}
                  fill={getCountryColor(datum.Country)}
                  y={yScale(datum?.Country)}
                  className={`${
                    hoveredCountry === datum?.Country
                      ? "opacity-100"
                      : "opacity-60"
                  }`}
                  onMouseEnter={() => setHoveredCountry(datum.Country)}
                  onMouseMove={(e) => {
                    const svgRect =
                      e.currentTarget.ownerSVGElement.getBoundingClientRect();
                    setTooltip({
                      visible: true,
                      x: e.clientX - svgRect.left + 10,
                      y: e.clientY - svgRect.top + 10,
                      content: `${datum.Country}: ${Number(
                        datum[currentYear]
                      ).toLocaleString()}`,
                    });
                  }}
                  onMouseLeave={() => {
                    setHoveredCountry(null);
                    setTooltip({ visible: false, x: 0, y: 0, content: "" });
                  }}
                  onClick={() => {
                    showDataCard(datum.Country);
                  }}
                />
              ))}

              {/* Bars for compare year if enabled */}
              {compareYear &&
                filteredData?.map((datum) => (
                  <rect
                    key={`bar-${datum.Country}`}
                    x={0}
                    width={xScale(datum[compareYear] || 0)}
                    height={yScale.bandwidth() / 2}
                    y={yScale(datum?.Country) + yScale.bandwidth() / 2}
                    fill={"rgba(0,0,0,0.3)"}
                  />
                ))}

              {/* Population values for current year */}
              {filteredData?.map((datum) => (
                <text
                  key={`pop-${datum.Country}`}
                  fill={"#000"}
                  x={xScale(datum[currentYear] || 0) + 5}
                  y={
                    yScale(datum?.Country) +
                    (compareYear
                      ? yScale.bandwidth() / 4
                      : yScale.bandwidth() / 2)
                  }
                  dy={".36em"}
                  fontSize={12}
                  className={`${
                    hoveredCountry === datum?.Country
                      ? "opacity-100"
                      : "opacity-60"
                  }`}
                  fontWeight={400}
                >
                  {Number(datum[currentYear] || 0)?.toLocaleString()}
                </text>
              ))}

              {/* Population values for compare year */}
              {compareYear &&
                filteredData?.map((datum) => (
                  <text
                    key={`pop-compare-${datum.Country}`}
                    fill={"#000"}
                    x={xScale(datum[compareYear] || 0) + 5}
                    y={yScale(datum?.Country) + (3 * yScale.bandwidth()) / 4}
                    dy={".36em"}
                    fontSize={12}
                    className={`${
                      hoveredCountry === datum?.Country
                        ? "opacity-100"
                        : "opacity-60"
                    }`}
                    fontWeight={400}
                  >
                    {Number(datum[compareYear] || 0)?.toLocaleString()}
                  </text>
                ))}
            </g>
          </svg>

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
                {showOnlySelected ? "Show all countries" : "Focus on selected"}
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
          <div className="mt-4 flex items-center justify-between">
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
                    content: isFullscreen ? `Exit Fullscreen` : `Fullscreen`,
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
                  {iconTooltip?.visible && iconTooltip?.content === "Share" && (
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
  );
};

export default BarChart;
