import React, { useState, useRef, useEffect, useCallback } from "react";
import { Icon } from "@iconify/react";
import { TableCellsMerge, ChartBar } from "lucide-react";
import * as d3 from "d3";
import { Range } from "../../components";

const SolarSurgeCountryComparison = ({
  data,
  adoptionData,
  title = "Top 10 African Countries by Solar Electricity Generation",
  years = { min: 1950, max: 2020 },
  defaultYear = 2023,
  colorByRegion = false,
  regionsMap = {}, // Map of countries to regions
  regionColors = {}, // Map of regions to colors
  defaultColor = "#f97316", // Default color if not using colorByRegion
  enableCompareMode = false,
  onDownload = () => {},
  isModalOpen,
  chartContainerRef,
  setIsModalOpen,
  isFullscreen,
  currentYear,
  setCurrentYear,
}) => {
  // State management
  const [compareYear, setCompareYear] = useState(null);
  const [hoveredCountry, setHoveredCountry] = useState(null);
  const [showOnlySelected, setShowOnlySelected] = useState(false);
  const [selectedCountries, setSelectedCountries] = useState([]);
  const [activeDownloadTab, setActiveDownloadTab] = useState("Chart");
  const [showSort, setShowSort] = useState(false);
  const [selectedSortType, setSelectedSortType] = useState(
    "Sort by Power Generation"
  );
  const [selectedSortForm, setSelectedSortForm] = useState("Sort Descending");
  const [tooltip, setTooltip] = useState({
    visible: false,
    x: 0,
    y: 0,
    content: "",
  });
  const [dataCardPos, setDataCardPos] = useState({
    x: 0,
    y: 0,
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [zoomRange, setZoomRange] = useState(null);
  const [isDataCardVisible, setIsDataCardVisible] = useState(false);
  const [dataCardInfo, setDataCardInfo] = useState(null);
  const [isSharingModalOpen, setIsSharingModalOpen] = useState(false);
  const [defaultData, setDefaultData] = useState([]);
  const [screenSize, setScreenSize] = useState("large");

  const chartRef = useRef(null);
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

  // Chart margins and dimensions
  const margins = { top: 20, right: 80, bottom: 20, left: 120 };
  const width = chartDimensions.width || 800;
  const height = chartDimensions.height || 500;
  const innerWidth = width - margins.left - margins.right;
  const innerHeight = height - margins.top - margins.bottom;

  // Filtering and sorting data
  // Combined data processing
  const { filteredData, compareYearData } = React.useMemo(() => {
    // First, get the base filtered data for current year
    let currentYearFiltered = data
      ?.filter((datum) => datum?.year === currentYear)
      ?.sort((a, b) => b["solar_electricity"] - a["solar_electricity"])
      ?.slice(0, 11);

    if (showOnlySelected) {
      currentYearFiltered = currentYearFiltered?.filter((datum) =>
        selectedCountries?.includes(datum?.country)
      );
    } else {
      // Apply search and sorting logic here...
      if (searchTerm) {
        currentYearFiltered = data?.filter(
          (datum) =>
            datum?.year === currentYear &&
            datum.country.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      // Apply sorting...
      // Apply sorting
      if (selectedSortType === "Sort by Power Generation") {
        currentYearFiltered.sort((a, b) => {
          return selectedSortForm === "Sort Descending"
            ? b["solar_electricity"] - a["solar_electricity"]
            : a["solar_electricity"] - b["solar_electricity"];
        });
      } else if (selectedSortType === "Sort Alphabetically") {
        currentYearFiltered.sort((a, b) => {
          return selectedSortForm === "Sort Descending"
            ? b.country.localeCompare(a.country)
            : a.country.localeCompare(b.country);
        });
      }
    }

    // Now get compare year data for the same countries
    let compareFiltered = [];
    if (compareYear && currentYearFiltered) {
      const countriesInFiltered = currentYearFiltered.map((d) => d.country);
      compareFiltered = data?.filter(
        (datum) =>
          datum?.year === compareYear &&
          countriesInFiltered.includes(datum?.country)
      );
    }

    return {
      filteredData: currentYearFiltered,
      compareYearData: compareFiltered,
    };
  }, [
    data,
    currentYear,
    compareYear,
    selectedSortType,
    selectedSortForm,
    searchTerm,
    showOnlySelected,
    selectedCountries,
  ]);

  // Create scales
  const yScale = d3
    .scaleBand()
    .domain(filteredData.map((d) => d.country))
    .range(isFullscreen ? [0, innerHeight - 120] : [0, innerHeight])
    .padding(0.1);

  // Determine max value for x scale
  const maxValue = d3.max(filteredData, (d) => {
    if (compareYear) {
      const found = compareYearData?.find(
        (datum) => datum?.country === d?.country
      );

      console.log(found);
      return Math.max(
        d["solar_electricity"] || 0,
        found?.["solar_electricity"] || 0
      );
    }
    return d["solar_electricity"] || 0;
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

  // Show data card with statistics
  const showDataCard = (country) => {
    const countryData = data.find(
      (d) => d.country === country && d.year === currentYear
    );
    const prevYearCountryData = data.find(
      (d) => d.country === country && d.year === currentYear - 1
    );
    if (!countryData) return;

    // Calculate some basic statistics
    const currentValue = countryData["solar_electricity"] || 0;
    const prevValue = prevYearCountryData["solar_electricity"] || 0;
    let growthRate = null;

    if (prevYearCountryData) {
      growthRate = (currentValue / prevValue - 1) * 100;
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
    const shareTitle = `Power Generation data for ${
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
          `Check out this Power Generation data: ${shareUrl}`
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

  // Update chart dimensions on window resize
  useEffect(() => {
    const updateDimensions = () => {
      if (chartContainerRef.current) {
        const containerWidth = chartContainerRef.current.clientWidth;
        setChartDimensions({
          width:
            screenSize === "small"
              ? containerWidth * 1.1
              : containerWidth * 0.9, // 90% of container width
          height: Math.min(Math.max(containerWidth * 0.6, 300), 600), // Responsive height between 300-600px
        });
      }
    };

    // Initial calculation
    updateDimensions();

    // Add resize listener
    window.addEventListener("resize", updateDimensions);

    // Cleanup
    return () => window.removeEventListener("resize", updateDimensions);
  }, [screenSize, isFullscreen]);

  return (
    <div className="relative w-full min-h-fit h-auto">
      {/* Hidden chart container */}
      <div ref={chartRef} className="fixed -top-[300%]">
        <div className="mx-auto w-full md:w-[90%] h-full py-5">
          {/* Chart header */}
          <div className="mb-3 flex flex-wrap justify-between items-center gap-2">
            <div className={`text-lg font-semibold`}>
              {title}, {currentYear}
              {compareYear && ` vs ${compareYear}`}
            </div>
          </div>

          {/* The chart */}
          {filteredData?.length > 0 ? (
            <svg width={width} height={isFullscreen ? height - 120 : height}>
              <g transform={`translate(${margins.left - 25}, ${margins.top})`}>
                {/* country labels */}
                {filteredData?.map((datum) => (
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
                    {datum?.country === "Democratic Republic of Congo"
                      ? "DR Congo"
                      : datum?.country}
                  </text>
                ))}
                {/* Bars for current year */}
                {filteredData?.map((datum) => (
                  <rect
                    key={`bar-${datum.country}`}
                    x={0}
                    width={xScale(datum["solar_electricity"] || 0)}
                    height={yScale.bandwidth()}
                    fill={getCountryColor(datum.country)}
                    y={yScale(datum?.country)}
                    className={`${
                      hoveredCountry === datum?.country
                        ? "opacity-100"
                        : "opacity-60"
                    }`}
                    onMouseEnter={() => setHoveredCountry(datum.country)}
                    onMouseMove={(e) => {
                      setTooltip({
                        visible: true,
                        x: e.clientX + 12, // offset a bit to the right of cursor
                        y: e.clientY + 12, // offset slightly below the cursor
                        content: `${datum.country}: ${datum["solar_electricity"]} TWh`,
                      });
                    }}
                    onMouseLeave={() => {
                      setHoveredCountry(null);
                      setTooltip({ visible: false, x: 0, y: 0, content: "" });
                    }}
                    onClick={(e) => {
                      setDataCardPos({ x: e.clientX, y: e.clientY });
                      showDataCard(datum.country);
                    }}
                  />
                ))}

                {/* Bars for compare year if enabled */}
                {compareYear &&
                  compareYearData?.map((datum) => (
                    <rect
                      key={`bar-${datum.country}`}
                      x={0}
                      width={xScale(datum["solar_electricity"] || 0)}
                      height={yScale.bandwidth() / 2}
                      y={yScale(datum?.country) + yScale.bandwidth() / 2}
                      fill={"rgba(0,0,0,0.3)"}
                    />
                  ))}

                {/* Power Geeration values for current year */}
                {filteredData?.map((datum) => (
                  <text
                    key={`pop-${datum.country}`}
                    fill={"#000"}
                    x={xScale(datum["solar_electricity"] || 0) + 5}
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
                    {datum["solar_electricity"]} TWh
                  </text>
                ))}

                {/* Population values for compare year */}
                {compareYear &&
                  compareYearData?.map((datum) => (
                    <text
                      key={`pop-compare-${datum.country}`}
                      fill={"#000"}
                      x={xScale(datum["solar_electricity"] || 0) + 5}
                      y={yScale(datum?.country) + (3 * yScale.bandwidth()) / 4}
                      dy={".36em"}
                      fontSize={12}
                      className={`${
                        hoveredCountry === datum?.country
                          ? "opacity-100"
                          : "opacity-60"
                      }`}
                      fontWeight={400}
                    >
                      {datum["solar_electricity"]} TWh
                    </text>
                  ))}
              </g>
            </svg>
          ) : (
            <div className="w-full flex justify-center items-center py-20 text-textColor-80">
              <div>
                No data found for Country: "{searchTerm}" and Year: "
                {currentYear}"
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main chart container */}
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
                    onClick={handleCSVDownload}
                    className="w-full h-[100px] rounded-sm hover:bg-slate-200 items-center justify-center flex flex-col bg-slate-100 cursor-pointer"
                  >
                    <div className="font-medium text-sm md:text-lg">
                      Current Year Data (CSV)
                    </div>
                    <div className="text-xs md:text-sm">
                      Download data for {currentYear} only
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
                      Download all years
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Data Card */}
        {isDataCardVisible && dataCardInfo && (
          <div
            style={{
              left:
                screenSize === "small"
                  ? "calc(50% - 128px)"
                  : dataCardPos.x + 400 > window.innerWidth
                  ? `${dataCardPos.x - 420}px`
                  : `${dataCardPos.x + 20}px`,
              top:
                screenSize === "small"
                  ? window.innerHeight - 210
                  : dataCardPos.y + 200 > window.innerHeight
                  ? `${dataCardPos.y - 200}px`
                  : `${dataCardPos.y}px`,
              position: screenSize === "small" ? "fixed" : "fixed",
            }}
            className="z-30 bg-white shadow-lg border rounded-md p-4 w-64 right-0 top-12"
          >
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
              <div>
                Solar Power Generation ({dataCardInfo.year}):{" "}
                {dataCardInfo.currentValue} TWh
              </div>
              {dataCardInfo.growthRate !== null && (
                <div>
                  1-Year Growth Rate:{" "}
                  <span
                    className={`font-medium ${
                      dataCardInfo.growthRate >= 0
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
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

        <div className="mx-auto w-full md:w-[90%] h-full py-5">
          {/* Controls bar */}
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            {/* Compare mode toggle */}
            {enableCompareMode && screenSize !== "small" && (
              <div className="flex items-center">
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
            <div className="max-w-[300px] bg-neutral-100 h-10 flex items-center justify-center px-4 gap-[10px] w-full rounded-[6px] relative">
              <Icon
                icon={"material-symbols:search-rounded"}
                className="w-5 h-5 text-textColor-80"
              />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search countries..."
                className="h-full flex-1 text-sm text-neutral-600 placeholder:text-neutral-500 outline-none border-none bg-transparent"
              />
              {searchTerm && (
                <Icon
                  icon="material-symbols:close-rounded"
                  className="w-5 h-5 text-textColor-80 cursor-pointer"
                  onClick={() => setSearchTerm("")}
                />
              )}
            </div>
          </div>

          {/* Selection indicator */}
          {selectedCountries.length > 0 && (
            <div className="mb-4 flex items-center flex-wrap justify-between gap-3 md:gap-4">
              <div className="flex flex-wrap items-center gap-2">
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
                  onClick={() => {
                    setShowOnlySelected(false);
                    setSelectedCountries([]);
                  }}
                >
                  Clear all
                </button>
              </div>
              <div className=" flex items-center gap-2">
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
            </div>
          )}

          {/* Chart header */}
          <div className="mb-3 flex flex-wrap justify-between items-center gap-2">
            <div
              className={`${
                compareYear || isFullscreen ? "opacity-100" : "opacity-0"
              } text-lg font-semibold`}
            >
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
                    {["Sort by Power Generation", "Sort Alphabetically"]?.map(
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
          {filteredData?.length > 0 ? (
            <svg width={width} height={isFullscreen ? height - 120 : height}>
              <g transform={`translate(${margins.left - 25}, ${margins.top})`}>
                {/* country labels */}
                {filteredData?.map((datum) => (
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
                    {datum?.country === "Democratic Republic of Congo"
                      ? "DR Congo"
                      : datum?.country}
                  </text>
                ))}
                {/* Bars for current year */}
                {filteredData?.map((datum) => (
                  <rect
                    key={`bar-${datum.country}`}
                    x={0}
                    width={xScale(datum["solar_electricity"] || 0)}
                    height={yScale.bandwidth()}
                    fill={getCountryColor(datum.country)}
                    y={yScale(datum?.country)}
                    className={`${
                      hoveredCountry === datum?.country
                        ? "opacity-100"
                        : "opacity-60"
                    }`}
                    onMouseEnter={() => setHoveredCountry(datum.country)}
                    onMouseMove={(e) => {
                      setTooltip({
                        visible: true,
                        x: e.clientX + 12, // offset a bit to the right of cursor
                        y: e.clientY + 12, // offset slightly below the cursor
                        content: `${datum.country}: ${datum["solar_electricity"]} TWh`,
                      });
                    }}
                    onMouseLeave={() => {
                      setHoveredCountry(null);
                      setTooltip({ visible: false, x: 0, y: 0, content: "" });
                    }}
                    onClick={(e) => {
                      setDataCardPos({ x: e.clientX, y: e.clientY });
                      showDataCard(datum.country);
                    }}
                  />
                ))}

                {/* Bars for compare year if enabled */}
                {compareYear &&
                  compareYearData?.map((datum) => (
                    <rect
                      key={`bar-${datum.country}`}
                      x={0}
                      width={xScale(datum["solar_electricity"] || 0)}
                      height={yScale.bandwidth() / 2}
                      y={yScale(datum?.country) + yScale.bandwidth() / 2}
                      fill={"rgba(0,0,0,0.3)"}
                    />
                  ))}

                {/* Power Geeration values for current year */}
                {filteredData?.map((datum) => (
                  <text
                    key={`pop-${datum.country}`}
                    fill={"#000"}
                    x={xScale(datum["solar_electricity"] || 0) + 5}
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
                    {datum["solar_electricity"]} TWh
                  </text>
                ))}

                {/* Population values for compare year */}
                {compareYear &&
                  compareYearData?.map((datum) => (
                    <text
                      key={`pop-compare-${datum.country}`}
                      fill={"#000"}
                      x={xScale(datum["solar_electricity"] || 0) + 5}
                      y={yScale(datum?.country) + (3 * yScale.bandwidth()) / 4}
                      dy={".36em"}
                      fontSize={12}
                      className={`${
                        hoveredCountry === datum?.country
                          ? "opacity-100"
                          : "opacity-60"
                      }`}
                      fontWeight={400}
                    >
                      {datum["solar_electricity"]} TWh
                    </text>
                  ))}
              </g>
            </svg>
          ) : (
            <div className="w-full flex justify-center items-center py-20 text-textColor-80">
              <div>
                No data found for Country: "{searchTerm}" and Year: "
                {currentYear}"
              </div>
            </div>
          )}

          {/* Tooltip */}
          {tooltip.visible && (
            <div
              className="fixed text-xs bg-white shadow-md px-2 py-1 rounded border border-gray-300 pointer-events-none z-30"
              style={{
                left: `${tooltip.x + 10}px`,
                top: `${tooltip.y}px`,
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
              min={years?.min || 2000}
              max={years?.max || 2023}
              step={1}
              defaultValue={2023}
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
        </div>
      </div>
    </div>
  );
};

export default SolarSurgeCountryComparison;
