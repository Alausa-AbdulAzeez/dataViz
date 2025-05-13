import { useState, useEffect, useRef } from "react";
import { Icon } from "@iconify/react";
import * as d3 from "d3";
import { Range } from "../../components";
import html2canvas from "html2canvas";

export default function AfricaSolarChoropleth({
  data,
  isFullscreen,
  svgRef,
  isModalOpen,
  setIsModalOpen,
}) {
  const tooltipRef = useRef(null);
  const containerRef = useRef(null);

  const chartRef = useRef(null);

  const [solarData, setSolarData] = useState(null);
  const [africaGeoData, setAfricaGeoData] = useState(null);

  const [currentYear, setCurrentYear] = useState(2023);
  const [years, setYears] = useState({ min: 2000, max: 2023 });
  const [tooltipInfo, setTooltipInfo] = useState({
    visible: false,
    x: 0,
    y: 0,
    country: "",
    value: 0,
  });

  // Add state for filtering
  const [activeDownloadTab, setActiveDownloadTab] = useState("Chart");
  const [hoveredBin, setHoveredBin] = useState(null);
  const [isHovering, setIsHovering] = useState(false);
  const [selectedBins, setSelectedBins] = useState([]);
  // Responsive state
  const [dimensions, setDimensions] = useState({
    width: 1700,
    height: 800,
  });
  const [currentWidth, SetCurrentWidth] = useState(1700);

  // Define bin ranges for our filter categories
  const bins = [
    { min: null, max: null, label: "No data", color: "#CCCCCC" },
    { min: 0, max: 10, label: "0 – 10", color: "#fff5eb" },
    { min: 10, max: 30, label: "10 – 30", color: "#fdd0a2" },
    { min: 30, max: 100, label: "30 – 100", color: "#fdae6b" },
    { min: 100, max: 200, label: "100 – 200", color: "#fd8d3c" },
    { min: 200, max: 260, label: "200 – 260", color: "#d94801" },
  ];

  // Define dimensions
  const width = 1700;
  const height = 800;
  const margin = { top: 30, right: 20, bottom: 80, left: 20 };
  const legendWidth = 1000;
  const legendHeight = 25;
  const legendY = height - margin.bottom;
  const binWidth = legendWidth / bins.length;

  // Helper functions for download handlers
  const onDownload = (type, ref) => {
    console.log(type, ref);
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
      saveAs(svgBlob, `population-chart-${new Date().getTime()}.svg`);
    } else if (type === "CSV") {
      const { currentYear, data } = ref;
      let csvContent = "Country,Date,solar_elec_per_capita\n";

      data.forEach((item) => {
        csvContent += `${item.country},${item.year},${item.solar_elec_per_capita}\n`;
      });

      const csvBlob = new Blob([csvContent], {
        type: "text/csv;charset=utf-8",
      });
      saveAs(csvBlob, `data-${currentYear}-${new Date().getTime()}.csv`);
    } else if (type === "FullCSV") {
      const { data } = ref;
      const years = Object.keys(data[0]).filter((key) => !isNaN(parseInt(key)));

      let csvContent = "country,year,solar_elec_per_capita" + "\n";

      data.forEach((item) => {
        csvContent += `${item.country},${item.year},${item.solar_elec_per_capita}`;
        csvContent += "\n";
      });

      const csvBlob = new Blob([csvContent], {
        type: "text/csv;charset=utf-8",
      });
      saveAs(csvBlob, `data-full-${new Date().getTime()}.csv`);
    }
  };

  function rgbToRgba(rgbValue, opacity) {
    // Regular expression to extract the r, g, and b values
    const rgbMatch = rgbValue.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);

    if (!rgbMatch) {
      return "Invalid RGB value";
    }

    const r = parseInt(rgbMatch[1], 10);
    const g = parseInt(rgbMatch[2], 10);
    const b = parseInt(rgbMatch[3], 10);

    // Check if the opacity is within the valid range (0 to 1)
    if (opacity < 0 || opacity > 1) {
      return "Opacity value must be between 0 and 1";
    }

    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }

  // Initialize with all bins selected
  useEffect(() => {
    setSelectedBins(bins.map((_, i) => i));
  }, []);

  function getColorWithOpacity(hex, opacity) {
    // Remove the leading '#' if present
    hex = hex.replace(/^#/, "");

    // Expand shorthand hex codes like "abc" to "aabbcc"
    if (hex.length === 3) {
      hex = hex
        .split("")
        .map((char) => char + char)
        .join("");
    }

    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);

    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }

  // Function to toggle all bins
  const toggleAllBins = () => {
    if (selectedBins.length === bins.length) {
      // If all bins are selected, clear selection
      setSelectedBins([]);
    } else {
      // Otherwise, select all bins
      setSelectedBins(bins.map((_, i) => i));
    }
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

  // // Fullscreen toggle functionality
  // const handleDataFilter = () => {
  //   return data?.filter((datum) => datum?.year === currentYear);
  // };

  // useEffect(() => {
  //   setSolarData(handleDataFilter());
  // }, [data, currentYear]);

  const africanCountryCodes = [
    "DZA",
    "AGO",
    "BEN",
    "BWA",
    "BFA",
    "BDI",
    "CMR",
    "CPV",
    "CAF",
    "TCD",
    "COM",
    "COD",
    "DJI",
    "EGY",
    "GNQ",
    "ERI",
    "ETH",
    "GAB",
    "GMB",
    "GHA",
    "GIN",
    "GNB",
    "CIV",
    "KEN",
    "LSO",
    "LBR",
    "LBY",
    "MDG",
    "MWI",
    "MLI",
    "MRT",
    "MUS",
    "MAR",
    "MOZ",
    "NAM",
    "NER",
    "NGA",
    "COG",
    "RWA",
    "STP",
    "SEN",
    "SYC",
    "SLE",
    "SOM",
    "ZAF",
    "SDS",
    "SDN",
    "SWZ",
    "TZA",
    "TGO",
    "TUN",
    "UGA",
    "ZMB",
    "ZWE",
  ];

  // Fetch the GeoJSON data
  useEffect(() => {
    // Define African country ISO codes

    const fetchGeoData = async () => {
      try {
        const response = await fetch(
          "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson"
        );
        const worldData = await response.json();

        // Filter for African countries only
        const africaData = {
          type: "FeatureCollection",
          features: worldData.features.filter((d) =>
            africanCountryCodes.includes(d.id)
          ),
        };

        setAfricaGeoData(africaData);
      } catch (error) {
        console.error("Error fetching geo data:", error);
      }
    };

    fetchGeoData();
  }, []);

  // Filter data based on current year
  useEffect(() => {
    const filteredData = data?.filter((datum) => datum?.year === currentYear);
    setSolarData(filteredData);
  }, [data, currentYear]);

  // Helper functions
  function rgbToRgba(rgbValue, opacity) {
    const rgbMatch = rgbValue.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
    if (!rgbMatch) return "Invalid RGB value";

    const r = parseInt(rgbMatch[1], 10);
    const g = parseInt(rgbMatch[2], 10);
    const b = parseInt(rgbMatch[3], 10);

    if (opacity < 0 || opacity > 1)
      return "Opacity value must be between 0 and 1";

    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }

  function getColorWithOpacity(hex, opacity) {
    hex = hex.replace(/^#/, "");

    if (hex.length === 3) {
      hex = hex
        .split("")
        .map((char) => char + char)
        .join("");
    }

    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);

    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }

  // Function to determine which bin a value belongs to
  const getBinIndex = (value) => {
    if (value === null || value === undefined) return 0; // "No data" bin

    // Find which data bin the value belongs to (for bins 1-5)
    for (let i = 1; i < bins.length; i++) {
      if (value >= bins[i].min && value < bins[i].max) {
        return i;
      }
    }

    return 0; // Default to "No data" if no match
  };

  // Function to determine color based on data value
  const getCountryColor = (countryName) => {
    if (!solarData) return bins[0].color; // Use "No data" color if no solar data loaded

    const countryData = solarData.find((item) => item.country === countryName);

    // Determine if country has no data
    if (
      !countryData ||
      countryData.solar_elec_per_capita === null ||
      countryData.solar_elec_per_capita === undefined
    ) {
      // Handle No data - check if "No data" bin is selected or being hovered
      const isSelected = selectedBins.includes(0);
      const isHovered = isHovering && hoveredBin === 0;

      return isSelected || isHovered
        ? bins[0].color
        : getColorWithOpacity(bins[0].color, 0.1);
    }

    const value = countryData.solar_elec_per_capita;
    const binIndex = getBinIndex(value);

    // Check if this bin is selected or being hovered
    const isSelected = isInSelectedBins(value);

    // Return color with appropriate opacity
    return isSelected
      ? bins[binIndex].color
      : getColorWithOpacity(bins[binIndex].color, 0.1);
  };

  // Check if a value is in the selected bins or hover state
  const isInSelectedBins = (value) => {
    // If hovering over a bin, only show countries in that bin
    if (isHovering && hoveredBin !== null) {
      const bin = bins[hoveredBin];
      return value >= bin.min && value < bin.max;
    }

    // Otherwise, use the clicked selection
    if (selectedBins.length === 0) return false; // No bins selected

    return selectedBins.some((index) => {
      const bin = bins[index];
      return value >= bin.min && value < bin.max;
    });
  };

  // Handle map feature hover
  const handleCountryMouseOver = (event, feature) => {
    const countryData = solarData?.find(
      (item) => item.country === feature.properties?.name
    );

    const rect = event.currentTarget.getBoundingClientRect();
    const svgRect = svgRef.current.getBoundingClientRect();

    setTooltipInfo({
      visible: true,
      x: event.clientX - svgRect.left + 10,
      y: event.clientY - svgRect.top,
      country: feature.properties.name,
      value: countryData
        ? countryData.solar_elec_per_capita.toFixed(3)
        : "No data",
    });
  };

  const handleCountryMouseOut = () => {
    setTooltipInfo((prev) => ({ ...prev, visible: false }));
  };

  // Handle bin interactions
  const handleBinMouseEnter = (index) => {
    setHoveredBin(index);
    setIsHovering(true);
  };

  const handleBinMouseLeave = () => {
    setIsHovering(false);
  };

  const handleBinClick = (index) => {
    const newSelectedBins = [...selectedBins];

    if (newSelectedBins.includes(index)) {
      // Remove from selection
      setSelectedBins(newSelectedBins.filter((binIndex) => binIndex !== index));
    } else {
      // Add to selection
      setSelectedBins([...newSelectedBins, index]);
    }
  };

  // D3 projection setup
  const createProjection = () => {
    if (!africaGeoData) return null;

    // Calculate dynamic scale based on current dimensions
    const getScaleForWidth = (width) => {
      const minScreenWidth = 320; // Typical mobile
      const maxScreenWidth = 1024; // Typical large desktop

      const minScale = 1000; // For mobile (smaller width → larger scale to zoom in)
      const maxScale = 400; // For desktop (larger width → smaller scale)

      if (width <= minScreenWidth) return minScale;
      if (width >= maxScreenWidth) return maxScale;

      // Linear interpolation
      const t = (width - minScreenWidth) / (maxScreenWidth - minScreenWidth);
      return minScale + t * (maxScale - minScale); // interpolated scale
    };

    // Calculate center position adjustments (optional)

    const projection = d3
      .geoMercator()
      .scale(getScaleForWidth(currentWidth))
      .center([15, 5])
      .translate([width / 2, height / 2]);

    const pathGenerator = d3.geoPath().projection(projection);

    return { projection, pathGenerator };
  };

  // Add this function to calculate the legend's Y position
  const getLegendYPosition = (screenWidth) => {
    const baseY = legendY + 80; // Your current position

    // For screens smaller than 1000px, we need to push the legend down
    if (screenWidth <= 460) {
      // Calculate additional offset based on screen width
      // More offset as screen gets smaller
      const additionalOffset =
        Math.max(0, ((1000 - screenWidth) / 1000) * 100) + 400;
      return baseY + additionalOffset;
    }
    if (screenWidth <= 600) {
      // Calculate additional offset based on screen width
      // More offset as screen gets smaller
      const additionalOffset =
        Math.max(0, ((1000 - screenWidth) / 1000) * 100) + 270;
      console.log(additionalOffset);
      return baseY + additionalOffset;
    }
    if (screenWidth <= 660) {
      // Calculate additional offset based on screen width
      // More offset as screen gets smaller
      const additionalOffset =
        Math.max(0, ((1000 - screenWidth) / 1000) * 100) + 200;
      console.log(additionalOffset);
      return baseY + additionalOffset;
    }
    if (screenWidth <= 730) {
      // Calculate additional offset based on screen width
      // More offset as screen gets smaller
      const additionalOffset =
        Math.max(0, ((1000 - screenWidth) / 1000) * 100) + 150;
      console.log(additionalOffset);
      return baseY + additionalOffset;
    }
    if (screenWidth <= 800) {
      // Calculate additional offset based on screen width
      // More offset as screen gets smaller
      const additionalOffset =
        Math.max(0, ((1000 - screenWidth) / 1000) * 100) + 120;
      console.log(additionalOffset);
      return baseY + additionalOffset;
    }
    if (screenWidth <= 970) {
      // Calculate additional offset based on screen width
      // More offset as screen gets smaller
      const additionalOffset =
        Math.max(0, ((1000 - screenWidth) / 1000) * 100) + 120;
      console.log(additionalOffset);
      return baseY + additionalOffset;
    }

    return baseY; // Default position for larger screens
  };

  // Effect to handle resize events
  useEffect(() => {
    // Handler to call on window resize
    function handleResize() {
      // Update dimensions
      SetCurrentWidth(window.innerWidth);
    }

    // Add event listener
    window.addEventListener("resize", handleResize);

    console.log(window.innerWidth);

    // Call handler right away to update dimensions on first render
    handleResize();

    // Remove event listener on cleanup
    return () => window.removeEventListener("resize", handleResize);
  }, []); // Empty array ensures that effect is only run on mount and unmount

  const { pathGenerator } = createProjection() || {};

  // Dynamic font sizes based on viewport
  const getFontSize = (baseFontSize) => {
    const minScreenWidth = 320;
    const maxScreenWidth = 1700;
    const minFontSize = baseFontSize * 0.6;

    if (dimensions.width <= minScreenWidth) return `${minFontSize}px`;
    if (dimensions.width >= maxScreenWidth) return `${baseFontSize}px`;

    // Linear scaling between min and max
    const scale =
      (dimensions.width - minScreenWidth) / (maxScreenWidth - minScreenWidth);
    const fontSize = minFontSize + scale * (baseFontSize - minFontSize);

    return `${fontSize}px`;
  };

  return (
    <div className="relative w-full h-full pb-2 ">
      {/* Hidden chart container */}
      <div className="fixed top-[-2000%] w-full h-full" ref={chartRef}>
        <svg
          className={`bg-white ${
            isFullscreen ? "fixed inset-0 z-50 max-w-none rounded-none" : ""
          } w-full h-full min-h-[500px]`}
        >
          <g transform={`translate(${margin.left}, -100)`}>
            {/* Title */}(
            <text
              x={width / 2 - margin.left - margin.right}
              y={140}
              textAnchor="middle"
              fontSize={getFontSize(20)}
              fontWeight={500}
            >
              Solar Electricity Generation per Capita (kWh) Across African
              Nations
            </text>
            ){/* Map */}
            {africaGeoData && pathGenerator && solarData && (
              <g>
                {africaGeoData.features.map((feature, i) => (
                  <path
                    key={`country-${feature.id || i}`}
                    d={pathGenerator(feature)}
                    fill={getCountryColor(feature.properties?.name)}
                    stroke="#000"
                    strokeWidth={0.5}
                    onMouseOver={(e) => handleCountryMouseOver(e, feature)}
                    onMouseOut={handleCountryMouseOut}
                    style={{
                      transition: "fill 0.3s",
                      cursor: "pointer",
                    }}
                  />
                ))}
              </g>
            )}
            {/* Legend */}
            <g
              className="legend"
              transform={`translate(${
                (width - margin.right - legendWidth) / 2
              }, ${legendY + 80})`}
            >
              {/* Legend title */}
              <text
                x={legendWidth / 2}
                y={-40}
                textAnchor="middle"
                fontSize={getFontSize(20)}
                fontWeight="semi-bold"
              >
                Solar Electricity Generation per Capita (kWh) - Hover to Filter,
                Click to Toggle
              </text>

              {/* Legend bins */}
              {bins.map((bin, i) => (
                <g key={`bin-${i}`}>
                  <rect
                    x={i * binWidth}
                    y={-20}
                    width={binWidth}
                    height={legendHeight}
                    fill={
                      isHovering && hoveredBin !== null
                        ? hoveredBin === i
                          ? bin.color
                          : getColorWithOpacity(bin.color, 0.1)
                        : selectedBins.includes(i)
                        ? bin.color
                        : getColorWithOpacity(bin.color, 0.1)
                    }
                    stroke="#333"
                    strokeWidth={1}
                    style={{ cursor: "pointer" }}
                    onMouseEnter={() => handleBinMouseEnter(i)}
                    onMouseLeave={handleBinMouseLeave}
                    onClick={() => handleBinClick(i)}
                  />
                  <text
                    x={i * binWidth + binWidth / 2}
                    y={25}
                    textAnchor="middle"
                    fill="#000"
                    fontSize={getFontSize(18)}
                    fontWeight="500"
                    style={{ cursor: "pointer" }}
                  >
                    {bin.label}
                  </text>
                </g>
              ))}
            </g>
          </g>
        </svg>
      </div>

      {/* Main visible chart */}
      <div className="relative w-full h-full bg-white " ref={svgRef}>
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

        <svg
          ref={svgRef}
          viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
          className={`bg-white ${
            isFullscreen ? "fixed inset-0 z-50 max-w-none rounded-none" : ""
          } w-full md:h-full h-[400px] md:min-h-[500px]`}
        >
          <g transform={`translate(${margin.left}, -100)`}>
            {/* Title */}
            {isFullscreen && (
              <text
                x={width / 2 - margin.left - margin.right}
                y={
                  currentWidth < 600 ? "-30%" : currentWidth < 900 ? "-10%" : 80
                }
                textAnchor="middle"
                fontSize={getFontSize(20)}
                fontWeight={500}
              >
                Solar Electricity Generation per Capita (kWh) Across African
                Nations
              </text>
            )}

            {/* Map */}
            {africaGeoData && pathGenerator && solarData && (
              <g>
                {africaGeoData.features.map((feature, i) => (
                  <path
                    key={`country-${feature.id || i}`}
                    d={pathGenerator(feature)}
                    fill={getCountryColor(feature.properties?.name)}
                    stroke="#000"
                    strokeWidth={0.5}
                    onMouseOver={(e) => handleCountryMouseOver(e, feature)}
                    onMouseOut={handleCountryMouseOut}
                    style={{
                      transition: "fill 0.3s",
                      cursor: "pointer",
                    }}
                  />
                ))}
              </g>
            )}

            {/* Legend */}
            <g
              className="legend"
              transform={`translate(${
                (width - margin.right - legendWidth) / 2
              }, ${getLegendYPosition(currentWidth)})`}
            >
              {/* Legend title */}
              <text
                x={legendWidth / 2}
                y={-40}
                textAnchor="middle"
                fontSize={getFontSize(20)}
                fontWeight="semi-bold"
              >
                Solar Electricity Generation per Capita (kWh) - Hover to Filter,
                Click to Toggle
              </text>

              {/* Legend bins */}
              {bins.map((bin, i) => (
                <g key={`bin-${i}`}>
                  <rect
                    x={i * binWidth}
                    y={-20}
                    width={binWidth}
                    height={legendHeight}
                    fill={
                      isHovering && hoveredBin !== null
                        ? hoveredBin === i
                          ? bin.color
                          : getColorWithOpacity(bin.color, 0.1)
                        : selectedBins.includes(i)
                        ? bin.color
                        : getColorWithOpacity(bin.color, 0.1)
                    }
                    stroke="#333"
                    strokeWidth={1}
                    style={{ cursor: "pointer" }}
                    onMouseEnter={() => handleBinMouseEnter(i)}
                    onMouseLeave={handleBinMouseLeave}
                    onClick={() => handleBinClick(i)}
                  />
                  <text
                    x={i * binWidth + binWidth / 2}
                    y={25}
                    textAnchor="middle"
                    fill="#000"
                    fontSize={getFontSize(20)}
                    fontWeight="500"
                    style={{ cursor: "pointer" }}
                  >
                    {bin.label}
                  </text>
                </g>
              ))}
            </g>
          </g>
        </svg>

        {/* Tooltip */}
        <div
          ref={tooltipRef}
          className="absolute pointer-events-none bg-white p-2 rounded shadow-md border border-gray-300 text-sm"
          style={{
            opacity: tooltipInfo.visible ? 1 : 0,
            left: `${tooltipInfo.x}px`,
            top: `${tooltipInfo.y}px`,
            transition: "opacity 0.3s",
          }}
        >
          <strong>{tooltipInfo.country}</strong>
          <br />
          Solar Energy: {tooltipInfo.value}{" "}
          {tooltipInfo.value !== "No data" && "KWh"}
        </div>
      </div>

      {/* Range */}
      <div className="w-[80%] mx-auto flex items-center">
        <Range
          min={years?.min || 0}
          max={years?.max || 2000}
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
  );
}
