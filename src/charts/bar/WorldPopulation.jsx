import React, { useEffect, useRef, useState } from "react";
import { Navbar, Range } from "../../components";
import { csv, max, scaleBand, scaleLinear } from "d3";
import { ChartBar, TableCellsMerge } from "lucide-react";
import { Icon } from "@iconify/react";
import html2canvas from "html2canvas";

const height = 400;
const width = 900;

const margins = {
  left: 200,
  right: 100,
  bottom: 20,
  top: 20,
};

const colors = {
  primary: "#4682B4",
};

const config = {
  width,
  height,
  innerHeight: height - margins.top - margins.bottom,
  innerWidth: width - margins.left - margins.right,
  margins,
  colors,
};

const dataUrl =
  "https://gist.githubusercontent.com/performautodev/ab00b6300b1a235cde9c57600992b86d/raw/9c2f36181b2f090e91dac0b072405b6fe033e60d/UN_Population_2019.csv";

const WorldPopulation = () => {
  const chartRef = useRef(null);

  const [data, setData] = useState();
  const [fullData, setFullData] = useState();
  const [currentYear, setCurrentYear] = useState(2020);
  const [years, setYears] = useState({ min: "", max: "" });
  const [showSort, setShowSort] = useState(false);
  const [hoveredCountry, setHoveredCountry] = useState(null);
  const [activeDownloadTab, setActiveDownloadTab] = useState("Chart");
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
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [selectedSortType, setSelectedSortType] =
    useState("Sort by Population");
  const [selectedSortForm, setSelectedSortForm] = useState("Sort Descending");

  const fetchData = async () => {
    try {
      const res = await csv(dataUrl, (d) => {
        d[`${currentYear}`] = +d[currentYear];
        return d;
      });

      const a = Object.keys(res[0])
        ?.filter((datum) => !isNaN(datum))
        ?.map(Number)
        ?.sort();

      setYears({ min: a[0], max: a[a.length - 1] });
      setFullData(res);

      // Apply sorting to initial data
      const sortedData = sortData(res);
      setData(sortedData?.slice(0, 20));
    } catch (error) {
      console.log(error);
    }
  };

  // Sort data based on selected sorting options
  const sortData = (dataToSort) => {
    if (!dataToSort) return [];

    // Create a copy to avoid modifying the original data
    const dataCopy = [...dataToSort];

    // Sort by population
    if (selectedSortType === "Sort by Population") {
      dataCopy.sort((a, b) => {
        if (selectedSortForm === "Sort Descending") {
          return b[currentYear] - a[currentYear];
        } else {
          return a[currentYear] - b[currentYear];
        }
      });
    }
    // Sort alphabetically
    else if (selectedSortType === "Sort Alphabetically") {
      dataCopy.sort((a, b) => {
        if (selectedSortForm === "Sort Descending") {
          return b.Country.localeCompare(a.Country);
        } else {
          return a.Country.localeCompare(b.Country);
        }
      });
    }

    return dataCopy;
  };

  // Handle sort type change
  const handleSortTypeChange = (type) => {
    setSelectedSortType(type);
  };

  // Handle sort form change
  const handleSortFormChange = (form) => {
    setSelectedSortForm(form);
  };

  // Apply sorting when sort options change
  useEffect(() => {
    if (fullData) {
      const sortedData = sortData(fullData);
      setData(sortedData?.slice(0, 20));
    }
  }, [selectedSortType, selectedSortForm, currentYear]);

  //   X-scale
  const xScale = data
    ? scaleLinear()
        ?.domain([0, max(data, (d) => +d[currentYear])])
        .range([0, config.innerWidth])
    : null;

  // Y-scale
  const yScale = data
    ? scaleBand()
        .domain(data?.map((d) => d.Country))
        .range([0, config.innerHeight])
        .padding(0.1)
    : null;

  useEffect(() => {
    fetchData();
  }, []);

  const handleDownload = async () => {
    const canvas = await html2canvas(chartRef.current, {
      scale: 2, // Better quality
    });
    const image = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = image;
    link.download = `population_chart_${currentYear}.png`;
    link.click();
  };

  // Add this function to handle SVG download
  const handleSVGDownload = () => {
    // Get the SVG element we want to download
    const svgElement = chartRef.current.querySelector("svg");

    if (!svgElement) {
      console.error("SVG element not found");
      return;
    }

    // Create a clone of the SVG to avoid modifying the original
    const clonedSvg = svgElement.cloneNode(true);

    // Get title and footer content
    const title = `Population by Country, ${currentYear}`;
    const footer = `Data source: UN Population Data ${currentYear}\nOurWorldinData.org/population | CC BY`;

    // Add title to SVG
    const titleElement = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "text"
    );
    titleElement.setAttribute("x", "200");
    titleElement.setAttribute("y", "15");
    titleElement.setAttribute("font-size", "18");
    titleElement.setAttribute("font-weight", "600");
    titleElement.textContent = title;

    // Add footer to SVG
    const footerElement1 = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "text"
    );
    footerElement1.setAttribute("x", "200");
    footerElement1.setAttribute("y", height + 30);
    footerElement1.setAttribute("font-size", "12");
    footerElement1.setAttribute("font-weight", "600");
    footerElement1.textContent = `Data source: UN Population Data ${currentYear}`;

    const footerElement2 = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "text"
    );
    footerElement2.setAttribute("x", "200");
    footerElement2.setAttribute("y", height + 50);
    footerElement2.setAttribute("font-size", "12");
    footerElement2.textContent = "OurWorldinData.org/population | CC BY";

    // Append title and footer to the SVG
    clonedSvg.appendChild(titleElement);
    clonedSvg.appendChild(footerElement1);
    clonedSvg.appendChild(footerElement2);

    // Make sure viewBox is set for proper scaling
    if (!clonedSvg.getAttribute("viewBox")) {
      clonedSvg.setAttribute("viewBox", `0 0 ${width} ${height + 70}`);
    }

    // Set width and height to ensure all content is visible
    clonedSvg.setAttribute("width", width);
    clonedSvg.setAttribute("height", height + 70);

    // Get SVG as a string
    const svgString = new XMLSerializer().serializeToString(clonedSvg);
    const svgBlob = new Blob([svgString], {
      type: "image/svg+xml;charset=utf-8",
    });
    const svgUrl = URL.createObjectURL(svgBlob);

    // Create download link
    const downloadLink = document.createElement("a");
    downloadLink.href = svgUrl;
    downloadLink.download = `population_chart_${currentYear}.svg`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);

    // Clean up
    URL.revokeObjectURL(svgUrl);
  };

  // Add this function to handle CSV download
  const handleCSVDownload = () => {
    // Exit if there's no data to download
    if (!data || data.length === 0) {
      console.error("No data available to download");
      return;
    }

    try {
      // Get column headers (first row of CSV)
      // Start with "Country" and add the current year
      const headers = ["Country", currentYear.toString()];

      // Create CSV content starting with headers
      let csvContent = headers.join(",") + "\n";

      // Add each row of data
      data.forEach((row) => {
        // Format population with commas removed (plain numbers for CSV)
        const population = row[currentYear];
        const countryName = `"${row.Country.replace(/"/g, '""')}"`; // Escape quotes in country names

        csvContent += `${countryName},${population}\n`;
      });

      // Create a blob with the CSV content
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);

      // Create download link
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `population_data_${currentYear}.csv`);
      document.body.appendChild(link);

      // Trigger download and clean up
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error generating CSV:", error);
    }
  };

  // Alternative version with all years (if full data contains multiple years)
  const handleFullCSVDownload = () => {
    // Exit if there's no data to download
    if (!fullData || fullData.length === 0) {
      console.error("No data available to download");
      return;
    }

    try {
      // Get all the year columns from the data
      const sampleRow = fullData[0];
      const yearColumns = Object.keys(sampleRow).filter(
        (key) => !isNaN(Number(key))
      );

      // Create headers: Country followed by all years
      const headers = ["Country", ...yearColumns];

      // Create CSV content starting with headers
      let csvContent = headers.join(",") + "\n";

      // Add each row of data
      fullData.forEach((row) => {
        // Start with country name (properly escaped for CSV)
        const countryName = `"${row.Country.replace(/"/g, '""')}"`;

        // Add all year values
        const yearValues = yearColumns.map((year) => row[year]);

        csvContent += [countryName, ...yearValues].join(",") + "\n";
      });

      // Create a blob with the CSV content
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);

      // Create download link
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `population_data_all_years.csv`);
      document.body.appendChild(link);

      // Trigger download and clean up
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error generating full CSV:", error);
    }
  };

  console.log(data);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div ref={chartRef} className="fixed opacity-100  -top-[100%]">
        {/* Chart container */}
        <div className="px-3 my-10 mx-auto w-[1000px] rounded-md relative">
          <div className="mx-auto w-[90%]  h-full py-5">
            <div className="mb-3 flex justify-between">
              {/* Title */}
              <div className="text-lg font-semibold">
                Population by Country, {currentYear}
              </div>
            </div>

            <svg width={config.width} height={config.height}>
              <g transform={`translate(${margins.left}, ${margins.top})`}>
                {/* Country */}
                {data?.map((datum) => {
                  return (
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
                  );
                })}

                {/* Bars */}

                {data?.map((datum) => {
                  return (
                    <rect
                      key={`bar-${datum.Country}`}
                      x={0}
                      width={xScale(datum[currentYear])}
                      height={yScale.bandwidth()}
                      fill={config.colors.primary}
                      y={yScale(datum?.Country)}
                      className={`${"opacity-100"}`}
                    />
                  );
                })}

                {/* Population */}
                {data?.map((datum) => {
                  return (
                    <text
                      key={`pop-${datum.Country}`}
                      fill={"#000"}
                      x={xScale(datum[currentYear]) + 5}
                      y={yScale(datum?.Country) + yScale.bandwidth() / 2}
                      dy={".36em"}
                      fontSize={12}
                      fontWeight={400}
                      className={``}
                    >
                      {Number(datum[currentYear])?.toLocaleString()}
                    </text>
                  );
                })}
              </g>
            </svg>

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
            </div>
          </div>
        </div>
      </div>

      {/* Chart container */}
      <div className="px-3 my-10 mx-auto w-[1000px] rounded-md relative">
        {/* Backdrop */}
        {isModalOpen && (
          <div className="absolute w-full h-full  flex items-start justify-center">
            <div
              onClick={() => setIsModalOpen(false)}
              className="cursor-pointer absolute w-full h-full z-[10] bg-black opacity-40"
            ></div>
            <div className="mt-10 rounded-sm w-[80%] h-auto p-4 bg-white z-[20] cursor-pointer">
              {/* Top */}
              <div className="flex justify-between items-center text-xs font-semibold text-gray-500">
                <div className=""> DOWNLOAD</div>
                <Icon
                  icon="ic:round-cancel"
                  className="hover:rotate-45 transition-all ease-in-out duration-300"
                  width="24"
                  height="24"
                  onClick={() => setIsModalOpen(false)}
                />{" "}
              </div>
              <div className="mt-4 flex items-center gap-1.5 w-full justify-center">
                {" "}
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
              {/* Download buttons (Chart) */}
              {activeDownloadTab === "Chart" && (
                <div className="mt-4 flex flex-col w-full items-center gap-1.5">
                  {/* LHS */}
                  <div
                    onClick={handleDownload}
                    className="w-full h-[100px] rounded-sm hover:bg-slate-200 items-center justify-center  flex flex-col bg-slate-100"
                  >
                    <div className="font-medium text-lg">Image (PNG)</div>
                    <div className="text-sm">Suitable for most use cases</div>
                  </div>
                  {/* RHS */}
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
                  {/* Current Year Data */}
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

                  {/* All Years Data */}
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

        <div className="mx-auto w-[90%]  h-full py-5">
          <div className="flex items-center gap-1.5">
            {" "}
            <div className="text-sm flex items-center justify-center w-fit p-1 gap-1 cursor-pointer">
              <TableCellsMerge className="h-4 w-4" />
              <span>Table</span>
            </div>
            <div className="text-sm flex items-center justify-center w-fit p-1 gap-1 cursor-pointer">
              <ChartBar className="h-4 w-4" />
              <span>Chart</span>
            </div>
          </div>

          <div className="mb-3 flex justify-between">
            {/* Title */}
            <div className="text-lg font-semibold">
              Population by Country, {currentYear}
            </div>
            <div
              className="relative"
              onMouseEnter={() => setShowSort(true)}
              onMouseLeave={() => setShowSort(false)}
            >
              <button>
                {selectedSortForm === "Sort Descending"
                  ? "Sort Descending"
                  : "Sort Ascending"}
              </button>
              {showSort && (
                <div className="absolute min-w-full pt-1">
                  <div className="shadow-md min-w-full cursor-pointer bg-gray-100">
                    {["Sort by Population", "Sort Alphabetically"]?.map(
                      (sortType, index) => {
                        return (
                          <div
                            key={index}
                            className={`${
                              sortType === selectedSortType && "bg-slate-300"
                            } p-2 text-nowrap text-xs hover:bg-slate-200`}
                            onClick={() => handleSortTypeChange(sortType)}
                          >
                            {sortType}
                          </div>
                        );
                      }
                    )}

                    <div className="w-full h-[1px] bg-[#e6e6e6]"></div>
                    {["Sort Descending", "Sort Ascending"]?.map(
                      (sortForm, index) => {
                        return (
                          <div
                            key={index}
                            className={`${
                              sortForm === selectedSortForm && "bg-slate-300"
                            } p-2 text-nowrap text-xs hover:bg-slate-200`}
                            onClick={() => handleSortFormChange(sortForm)}
                          >
                            {sortForm}
                          </div>
                        );
                      }
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <svg width={config.width} height={config.height}>
            <g transform={`translate(${margins.left}, ${margins.top})`}>
              {/* Country */}
              {data?.map((datum) => {
                return (
                  <text
                    key={`country-${datum.Country}`}
                    fill={"#000"}
                    x={-5}
                    y={yScale(datum?.Country) + yScale.bandwidth() / 2}
                    dy={".36em"}
                    fontSize={12}
                    fontWeight={400}
                    style={{ textAnchor: "end" }}
                    className={`${hoveredCountry && "opacity-0"}`}
                  >
                    {datum?.Country}
                  </text>
                );
              })}
              {/* Country */}
              {data?.map((datum) => {
                return (
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
                );
              })}

              {/* Bars */}
              {data?.map((datum) => {
                return (
                  <rect
                    key={`bar-${datum.Country}`}
                    x={0}
                    width={xScale(datum[currentYear])}
                    height={yScale.bandwidth()}
                    fill={config.colors.primary}
                    y={yScale(datum?.Country)}
                    className={`${hoveredCountry && "opacity-0"}`}
                  />
                );
              })}
              {data?.map((datum) => {
                return (
                  <rect
                    key={`bar-${datum.Country}`}
                    x={0}
                    width={xScale(datum[currentYear])}
                    height={yScale.bandwidth()}
                    fill={config.colors.primary}
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
                        x: e.clientX - svgRect.left + 10, // slight right offset
                        y: e.clientY - svgRect.top + 10, // slight down offset
                        content: `${datum.Country}: ${Number(
                          datum[currentYear]
                        ).toLocaleString()}`,
                      });
                    }}
                    onMouseLeave={() => {
                      setHoveredCountry(null);
                      setTooltip({ visible: false, x: 0, y: 0, content: "" });
                    }}
                  />
                );
              })}

              {/* Population */}
              {data?.map((datum) => {
                return (
                  <text
                    key={`pop-${datum.Country}`}
                    fill={"#000"}
                    x={xScale(datum[currentYear]) + 5}
                    y={yScale(datum?.Country) + yScale.bandwidth() / 2}
                    dy={".36em"}
                    fontSize={12}
                    fontWeight={400}
                    className={`${hoveredCountry && "opacity-0"}`}
                  >
                    {Number(datum[currentYear])?.toLocaleString()}
                  </text>
                );
              })}
              {/* Population */}
              {data?.map((datum) => {
                return (
                  <text
                    key={`pop-${datum.Country}`}
                    fill={"#000"}
                    x={xScale(datum[currentYear]) + 5}
                    y={yScale(datum?.Country) + yScale.bandwidth() / 2}
                    dy={".36em"}
                    fontSize={12}
                    className={`${
                      hoveredCountry === datum?.Country
                        ? "opacity-100"
                        : "opacity-60"
                    }`}
                    fontWeight={400}
                  >
                    {Number(datum[currentYear])?.toLocaleString()}
                  </text>
                );
              })}
            </g>
          </svg>

          {/* Range */}
          <div className="flex items-center gap-2">
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
                className="rounded-sm hover:bg-gray-300 relative p-1.5 bg-gray-200 flex items-center justify-center cursor-pointer"
              >
                {iconTooltip?.visible && (
                  <div className="absolute bg-white border border-[#ccc]  px-[10px] py-[6px] -top-9 text-xs rounded-sm">
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
        </div>

        {tooltip.visible && (
          <div
            className="absolute text-xs bg-white shadow-md px-2 py-1 rounded border border-gray-300 pointer-events-none"
            style={{
              position: "absolute",
              left: `${tooltip.x + margins.left}px`,
              top: `${tooltip.y + margins.top + 120}px`,
              backgroundColor: "white",
              border: "1px solid #ccc",
              padding: "6px 10px",
              fontSize: "12px",
              borderRadius: "4px",
              boxShadow: "0px 2px 6px rgba(0,0,0,0.1)",
              pointerEvents: "none",
              zIndex: 10,
            }}
          >
            {tooltip.content}
          </div>
        )}
      </div>
    </div>
  );
};

export default WorldPopulation;
