import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Sun,
  Zap,
  TrendingUp,
  Globe,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
} from "lucide-react";
import {
  AfricaSolarChoropleth,
  RenewableEnergyMix,
  SolarGrowthRateComparison,
  SolarShare,
  SolarShareInGeneration,
  SolarSurgeCountryComparison,
} from "../charts";
import { csv } from "d3";
import { Icon } from "@iconify/react";
import html2canvas from "html2canvas";

export default function AfricaSolarSurge() {
  const THEME = {
    borderColor: "#E5E2E0",
    primaryColor: "#f97316",
    primaryColorLight: "#f97316",
    accentColor: "#FFB845",
    textColor: "#333333",
    backgroundColor: "#FFFFFF",
  };

  // Get initial tab from URL or default to 'overview'
  const getInitialTab = () => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tabFromUrl = params.get("tab");
      const validTabs = ["overview", "adoption", "impact", "country", "future"];
      return validTabs.includes(tabFromUrl) ? tabFromUrl : "overview";
    }
    return "overview";
  };
  const [activeTab, setActiveTab] = useState(getInitialTab); // Overview tab
  const chartContainerRef = useRef(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Country comparison trab
  const barChartContainerRef = useRef(null);
  const multiLineChartContainerRef = useRef(null);
  const [isBarModalOpen, setIsBarModalOpen] = useState(false);
  const [isMultiLineModalOpen, setIsMultiLineModalOpen] = useState(false);

  // Adoption tab ref
  const svgRef = useRef(null);
  const [isChoroplethModalOpen, setIsChoroplethModalOpen] = useState(false);

  const [isFullscreen, setIsFullscreen] = useState(false);

  const [iconTooltip, setIconTooltip] = useState({
    visible: false,
    content: "",
  });
  const [data, setData] = useState(null);
  const [screenSize, setScreenSize] = useState("large");
  const [fullData, setFullData] = useState(null);
  const [adoptionData, setAdoptionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingMap, setLoadingMap] = useState(true);

  // Country comparison
  const [currentYear, setCurrentYear] = useState(2023);

  const fetchData = async () => {
    try {
      const res = await csv("/assets/data/cleaned_energy_data.csv", (d) => {
        if (d.country === `Africa (Ember)`) {
          d["solar_electricity"] = +d.solar_electricity;
          d["solar_consumption"] = +d.solar_consumption;
          d["solar_elec_per_capita"] = +d.solar_elec_per_capita;
          d["oil_electricity"] = +d?.oil_electricity;
          d["wind_electricity"] = +d?.wind_electricity;
          d["hydro_electricity"] = +d?.hydro_electricity;
          d["biofuel_electricity"] = +d?.biofuel_electricity;
          d["other_renewable_electricity"] = +d?.other_renewable_electricity;
          return d;
        }
      });
      const newRes = await csv("/assets/data/cleaned_energy_data.csv", (d) => {
        d["solar_electricity"] = +d.solar_electricity;
        d["solar_consumption"] = +d.solar_consumption;
        d["solar_elec_per_capita"] = +d.solar_elec_per_capita;
        d["solar_share_elec"] = +d.solar_share_elec;
        d["year"] = +d?.year;
        d["oil_electricity"] = +d?.oil_electricity;
        d["wind_electricity"] = +d?.wind_electricity;
        d["hydro_electricity"] = +d?.hydro_electricity;
        d["biofuel_electricity"] = +d?.biofuel_electricity;
        d["other_renewable_electricity"] = +d?.other_renewable_electricity;
        return d;
      });

      // Filter data for overview section
      const overviewData = newRes?.filter(
        (newSingleRes) => newSingleRes.country === `Africa (Ember)`
      );

      const skippedAdoptionSet = [
        "Africa",
        "Africa (EI)",
        "Africa (EIA)",
        "Africa (Ember)",
        "Africa (Shift)",
      ];

      // Filter data for adoption section
      const adoption_data = newRes?.filter(
        (newSingleRes) => !skippedAdoptionSet.includes(newSingleRes.country)
      );

      setData(overviewData);
      setAdoptionData(adoption_data);
      setFullData(newRes);
      setLoading(false);
    } catch (error) {
      console.log("Error fetching data:", error);
      setLoading(false);
    }
  };

  // Handle fullscreen change events (including Escape key)
  useEffect(() => {
    const handleFullscreenChange = () => {
      // Check if the document is currently in fullscreen mode
      const isDocumentFullscreen =
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement;

      // Update state based on actual fullscreen status
      setIsFullscreen(!!isDocumentFullscreen);
    };

    // Add event listeners for all browser variants
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    document.addEventListener("mozfullscreenchange", handleFullscreenChange);
    document.addEventListener("MSFullscreenChange", handleFullscreenChange);

    // Cleanup function to remove event listeners
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener(
        "webkitfullscreenchange",
        handleFullscreenChange
      );
      document.removeEventListener(
        "mozfullscreenchange",
        handleFullscreenChange
      );
      document.removeEventListener(
        "MSFullscreenChange",
        handleFullscreenChange
      );
    };
  }, []);

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
  const toggleAdoptionFullscreen = useCallback(() => {
    if (!svgRef.current) return;

    if (!isFullscreen) {
      if (svgRef.current.requestFullscreen) {
        svgRef.current.requestFullscreen();
      } else if (svgRef.current.webkitRequestFullscreen) {
        svgRef.current.webkitRequestFullscreen();
      } else if (svgRef.current.msRequestFullscreen) {
        svgRef.current.msRequestFullscreen();
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
  }, [isFullscreen]);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    console.log(adoptionData);
  }, [adoptionData]);

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
      saveAs(svgBlob, `population-chart-${new Date().getTime()}.svg`);
    } else if (type === "CSV") {
      const { currentYear, data } = ref;
      let csvContent = "Country,Date,solar_electricity\n";

      data.forEach((item) => {
        csvContent += `${item.country},${item.year},${item.solar_electricity}\n`;
      });

      const csvBlob = new Blob([csvContent], {
        type: "text/csv;charset=utf-8",
      });
      saveAs(csvBlob, `data-${currentYear}-${new Date().getTime()}.csv`);
    } else if (type === "FullCSV") {
      const { data } = ref;
      const years = Object.keys(data[0]).filter((key) => !isNaN(parseInt(key)));

      let csvContent = "country,year,solar_electricity" + "\n";

      data.forEach((item) => {
        csvContent += `${item.country},${item.year},${item.solar_electricity}`;
        csvContent += "\n";
      });

      const csvBlob = new Blob([csvContent], {
        type: "text/csv;charset=utf-8",
      });
      saveAs(csvBlob, `data-full-${new Date().getTime()}.csv`);
    }
  };

  // Enhanced tab change handler
  const handleTabChange = (newTab) => {
    // Update state
    setActiveTab(newTab);

    // Update URL without page reload
    const url = new URL(window.location);
    url.searchParams.set("tab", newTab);
    window.history.pushState({ tab: newTab }, "", url);

    // Scroll to top smoothly
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // Listen for browser back/forward navigation
  useEffect(() => {
    const handlePopState = (event) => {
      const params = new URLSearchParams(window.location.search);
      const tabFromUrl = params.get("tab");
      const validTabs = ["overview", "adoption", "impact", "country", "future"];

      if (validTabs.includes(tabFromUrl)) {
        setActiveTab(tabFromUrl);
        // Scroll to top when navigating via browser buttons
        window.scrollTo({
          top: 0,
          behavior: "smooth",
        });
      }
    };

    window.addEventListener("popstate", handlePopState);

    // Set initial URL if not already set
    if (
      typeof window !== "undefined" &&
      !window.location.search.includes("tab=")
    ) {
      const url = new URL(window.location);
      url.searchParams.set("tab", activeTab);
      window.history.replaceState({ tab: activeTab }, "", url);
    }

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-4xl font-bold mb-2">
            Africa's Solar Surge: Powering a Brighter Future
          </h1>
          <p className="text-xl">
            A data-driven look at the rise of solar energy across Africa (2000 –
            2023)
          </p>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white shadow-md sticky top-0 z-[999]">
        <div className="max-w-5xl mx-auto px-4">
          <ul className="flex overflow-x-auto">
            <li>
              <button
                onClick={() => handleTabChange("overview")}
                className={`flex items-center py-4 px-3 font-medium text-sm ${
                  activeTab === "overview"
                    ? "border-b-2 border-orange-500 text-orange-500"
                    : "text-gray-500"
                }`}
              >
                <Globe className="mr-2 h-4 w-4" />
                Overview
              </button>
            </li>
            <li>
              <button
                onClick={() => handleTabChange("adoption")}
                className={`flex items-center py-4 px-3 font-medium text-sm ${
                  activeTab === "adoption"
                    ? "border-b-2 border-orange-500 text-orange-500"
                    : "text-gray-500"
                }`}
              >
                <TrendingUp className="mr-2 h-4 w-4" />
                Adoption Trends
              </button>
            </li>
            <li>
              <button
                onClick={() => handleTabChange("impact")}
                className={`flex items-center py-4 px-3 font-medium text-sm ${
                  activeTab === "impact"
                    ? "border-b-2 border-orange-500 text-orange-500"
                    : "text-gray-500"
                }`}
              >
                <Zap className="mr-2 h-4 w-4" />
                Energy Impact
              </button>
            </li>
            <li>
              <button
                onClick={() => handleTabChange("country")}
                className={`flex items-center py-4 px-3 font-medium text-sm ${
                  activeTab === "country"
                    ? "border-b-2 border-orange-500 text-orange-500"
                    : "text-gray-500"
                }`}
              >
                <BarChartIcon className="mr-2 h-4 w-4" />
                Country Comparison
              </button>
            </li>
            <li>
              <button
                onClick={() => handleTabChange("future")}
                className={`flex items-center py-4 px-3 font-medium text-sm ${
                  activeTab === "future"
                    ? "border-b-2 border-orange-500 text-orange-500"
                    : "text-gray-500"
                }`}
              >
                <Sun className="mr-2 h-4 w-4" />
                Future Outlook
              </button>
            </li>
          </ul>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto py-8 px-4">
        {activeTab === "overview" && (
          <section>
            <h2 className="text-3xl font-bold mb-6">
              Solar Energy in Africa: An Overview
            </h2>
            <p className="text-gray-700 mb-6">
              Access to clean and renewable energy is vital for sustainable
              development and improving living standards across Africa. Solar
              energy has emerged as a transformative solution to address the
              continent's energy challenges, with electricity generation from
              solar growing from a mere <b>0.01 TWh</b> in 2000 to an impressive{" "}
              <b>27.14 TWh</b> by 2023. This remarkable
              <b>271,300%</b> increase represents one of the fastest growth
              rates for any energy source on the continent.
            </p>

            <div className="grid md:grid-cols-3 gap-6 mb-8">
              {/* Stat 1 */}
              <div className="bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition">
                <h3 className="text-lg font-semibold mb-2 flex items-center">
                  <Sun className="mr-2 h-6 w-6 text-orange-400 animate-pulse" />
                  Solar Electricity Generation
                </h3>
                <p className="text-4xl font-extrabold bg-gradient-to-r from-orange-500 to-yellow-400 text-transparent bg-clip-text mb-2">
                  +271,300%
                </p>
                <p className="text-gray-600">
                  Growth in solar electricity generation since 2000
                </p>
              </div>

              {/* Stat 2 */}
              <div className="bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition">
                <h3 className="text-lg font-semibold mb-2 flex items-center">
                  <Zap className="mr-2 h-6 w-6 text-orange-400 animate-pulse" />
                  Energy Mix Growth
                </h3>
                <p className="text-4xl font-extrabold bg-gradient-to-r from-orange-500 to-yellow-400 text-transparent bg-clip-text mb-2">
                  +154,400%
                </p>
                <p className="text-gray-600">
                  Increase in solar’s share of total electricity (2000–2023)
                </p>
              </div>

              {/* Stat 3 */}
              <div className="bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition">
                <h3 className="text-lg font-semibold mb-2 flex items-center">
                  <Globe className="mr-2 h-6 w-6 text-orange-400 animate-pulse" />
                  Current Share
                </h3>
                <p className="text-4xl font-extrabold bg-gradient-to-r from-orange-500 to-yellow-400 text-transparent bg-clip-text mb-2">
                  3.09%
                </p>
                <p className="text-gray-600">
                  Solar’s contribution to Africa’s electricity mix in 2023
                </p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md mb-8">
              <div className="mb-2 flex h-fit items-center gap-3">
                <h3 className="text-sm md:text-xl font-semibold flex-1">
                  Solar Generation Growth in Africa (2000 - 2023)
                </h3>
                {/* RHS - Action buttons */}
                <div className="w-fit h-8 flex justify-center gap-2 ">
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
                </div>
              </div>

              <div className=" min-h-64 flex items-center justify-center rounded-lg border border-gray-200">
                {/* Loading state */}
                {loading ? (
                  <div className="w-full flex justify-center items-center py-20">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-yellow-500"></div>
                  </div>
                ) : (
                  // Line chart
                  <SolarShare
                    data={data}
                    THEME={THEME}
                    isFullscreen={isFullscreen}
                    screenSize={screenSize}
                    setScreenSize={setScreenSize}
                    toggleFullscreen={toggleFullscreen}
                    iconTooltip={iconTooltip}
                    setIconTooltip={setIconTooltip}
                    chartContainerRef={chartContainerRef}
                    isModalOpen={isModalOpen}
                    setIsModalOpen={setIsModalOpen}
                  />
                )}
              </div>

              <p className="text-xs md:text-base mt-4 text-gray-700">
                This chart illustrates Africa's remarkable solar energy journey,
                with electricity generation growing from just <b>0.01 TWh</b> in
                2000 to <b>27.14 TWh</b> by 2023 — a <b>271,300%</b> increase
                over two decades.
              </p>
            </div>
          </section>
        )}

        {activeTab === "adoption" && (
          <section>
            <h2 className="text-3xl font-bold mb-6">
              Solar Power Divide: Mapping Africa's Renewable Energy Landscape
            </h2>
            <p className="text-gray-700 mb-6">
              Despite the region's abundant sunshine, solar adoption varies
              dramatically between countries due to differences in
              infrastructure investment, policy frameworks, and economic
              development. Understanding these patterns is crucial for
              addressing energy inequities and accelerating the continent's
              renewable energy transition.
            </p>

            <div className="bg-white h-fit p-6 rounded-lg shadow-md mb-8">
              <div className="mb-2 flex h-fit items-center gap-3 ">
                <h3 className="flex-1  text-xl font-semibold mb-4">
                  Solar Electricity Generation per Capita (kWh) Across African
                  Nations
                </h3>
                {/* RHS - Action buttons */}
                <div className="w-fit h-8 flex justify-center gap-2 ">
                  {/* Fullscreen toggle button */}
                  <div
                    onClick={toggleAdoptionFullscreen}
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
                    onClick={() => setIsChoroplethModalOpen(true)}
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
                </div>
              </div>
              <div className="bg-white max-h-[900px] flex items-center justify-center rounded-lg border border-gray-200">
                {/* Loading state */}
                {loading ? (
                  <div className="w-full flex justify-center items-center py-20">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-yellow-500"></div>
                  </div>
                ) : (
                  <div className="text-center  h-full">
                    {/* Choropleth map */}
                    <AfricaSolarChoropleth
                      isFullscreen={isFullscreen}
                      svgRef={svgRef}
                      data={adoptionData}
                      setLoadingMap={setLoadingMap}
                      loadingMap={loadingMap}
                      isModalOpen={isChoroplethModalOpen}
                      setIsModalOpen={setIsChoroplethModalOpen}
                      screenSize={screenSize}
                      setScreenSize={setScreenSize}
                    />
                  </div>
                )}
              </div>
              <p className="mt-4 text-gray-700">
                Countries like <b>Namibia</b>, <b>South Africa</b>, and{" "}
                <b>Egypt</b> are leading in solar electricity generation per
                capita, while many others remain in the early stages of
                development. These differences reflect broader issues in energy
                access, investment priorities, and regional capacity to harness
                renewable resources.
              </p>
            </div>
          </section>
        )}

        {activeTab === "impact" && (
          <section>
            <h2 className="text-3xl font-bold mb-6">
              Africa's Energy Landscape: Tracking the Shift (2000 - 2023)
            </h2>
            <p className="text-gray-700 mb-6">
              Over the past two decades, Africa's electricity generation
              landscape has gradually shifted. While hydropower remains
              dominant, sources like solar and wind have grown from obscurity to
              form an increasingly visible share of the mix. This section
              explores the continent’s changing energy dynamics — from solar’s
              emerging role to the broader composition of power generation — and
              the practical realities driving these trends.
            </p>

            <div className="bg-white p-6 rounded-lg shadow-md mb-8">
              <div className="mb-2 flex h-fit items-center gap-3">
                <h3 className="text-sm md:text-xl font-semibold flex-1">
                  Africa's Growing Solar Share of Electricity (2000 - 2023)
                </h3>
                {/* RHS - Action buttons */}
                <div className="w-fit h-8 flex justify-center gap-2 ">
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
                </div>
              </div>

              <div className=" min-h-64 flex items-center justify-center rounded-lg border border-gray-200">
                {/* Loading state */}
                {loading ? (
                  <div className="w-full flex justify-center items-center py-20">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-yellow-500"></div>
                  </div>
                ) : (
                  // Line chart
                  <SolarShareInGeneration
                    data={data}
                    THEME={THEME}
                    isFullscreen={isFullscreen}
                    screenSize={screenSize}
                    setScreenSize={setScreenSize}
                    toggleFullscreen={toggleFullscreen}
                    iconTooltip={iconTooltip}
                    setIconTooltip={setIconTooltip}
                    chartContainerRef={chartContainerRef}
                    isModalOpen={isModalOpen}
                    setIsModalOpen={setIsModalOpen}
                  />
                )}
              </div>

              <p className="text-xs md:text-base mt-4 text-gray-700">
                In <b>2000</b>, solar power contributed virtually <b>nothing</b>{" "}
                to Africa’s electricity generation. By <b>2023</b>, it had grown
                to <b>3.09%</b> — a modest but meaningful rise. This growth is
                less about environmental idealism and more about necessityThis
                growth also reflects the growing recognition of solar as a
                reliable and increasingly accessible power solution for many
                African communities
              </p>
            </div>
            <div className="bg-white p-1 md:p-6 rounded-lg shadow-md mb-8">
              <div className="mb-2 flex h-fit items-center gap-3">
                <h3 className="text-sm md:text-xl font-semibold flex-1">
                  Africa’s Electricity Generation Mix: 2000–2023{" "}
                </h3>
                {/* RHS - Action buttons */}
                <div className="w-fit h-8 flex justify-center gap-2 ">
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
                </div>
              </div>

              <div className=" min-h-64 flex items-center justify-center rounded-lg border border-gray-200">
                {/* Loading state */}
                {loading ? (
                  <div className="w-full flex justify-center items-center py-20">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-yellow-500"></div>
                  </div>
                ) : (
                  // Stacked Area chart
                  <RenewableEnergyMix
                    data={data}
                    THEME={THEME}
                    isFullscreen={isFullscreen}
                    screenSize={screenSize}
                    setScreenSize={setScreenSize}
                    toggleFullscreen={toggleFullscreen}
                    iconTooltip={iconTooltip}
                    setIconTooltip={setIconTooltip}
                    chartContainerRef={chartContainerRef}
                    isModalOpen={isModalOpen}
                    setIsModalOpen={setIsModalOpen}
                  />
                )}
              </div>

              <p className="text-xs md:text-base mt-4 text-gray-700">
                Within this selected group of energy sources, solar power's role
                has grown significantly —{" "}
                <b> growing from near-zero to nearly 10% by 2023</b>.{" "}
                <b>Hydropower continues to dominate at over 50%</b>, and{" "}
                <b>wind has matched solar's share in recent years</b>.This view
                of renewables (and optionally oil) shows Africa's energy
                diversification in progress, with scalable solutions like solar
                steadily gaining ground, even as they remain a smaller portion
                of total electricity generation.
              </p>
            </div>
          </section>
        )}
        {/* Country tab */}
        {activeTab === "country" && (
          <section>
            <h2 className="text-3xl font-bold mb-6">
              Leading Countries and Trends
            </h2>
            <p className="text-gray-700 mb-6">
              Africa’s solar energy journey is a story of both bold strides and
              quiet beginnings. Some countries are surging ahead with
              large-scale solar power adoption, while others are only just
              starting to harness the sun’s potential. This section compares
              solar electricity generation across selected African
              countries—highlighting the top producers over the past two decades
              and how their outputs have evolved over time.
            </p>
            <div className="bg-white p-6 rounded-lg shadow-md mb-8">
              <div className="mb-2 flex h-fit items-center gap-3">
                <h3 className="text-sm md:text-xl font-semibold flex-1">
                  Top 10 African Countries by Solar Electricity Generation in{" "}
                  <span className="text-orange-600 font-bold">
                    {currentYear}
                  </span>
                </h3>
                {/* RHS - Action buttons */}
                <div className="w-fit h-8 flex justify-center gap-2 ">
                  {/* Fullscreen toggle button */}
                  <div
                    onClick={() => toggleFullscreen(barChartContainerRef)}
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
                    onClick={() => setIsBarModalOpen(true)}
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
                </div>
              </div>

              <div className=" min-h-64 flex items-center justify-center rounded-lg border border-gray-200">
                {/* Loading state */}
                {loading ? (
                  <div className="w-full flex justify-center items-center py-20">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-yellow-500"></div>
                  </div>
                ) : (
                  // Bar chart
                  <SolarSurgeCountryComparison
                    data={adoptionData}
                    adoptionData={adoptionData}
                    title="Top 10 African Countries by Solar Electricity Generation"
                    width={900}
                    height={500}
                    years={{ min: 2000, max: 2023 }}
                    defaultYear={2023}
                    currentYear={currentYear}
                    setCurrentYear={setCurrentYear}
                    colorByRegion={true}
                    isFullscreen={isFullscreen}
                    enableCompareMode={true}
                    enableSharing={true}
                    chartContainerRef={barChartContainerRef}
                    isModalOpen={isBarModalOpen}
                    setIsModalOpen={setIsBarModalOpen}
                    onDownload={onDownload}
                  />
                )}
              </div>

              {/* Data source attribution */}
              <div className="mt-4 pt-2 border-t border-gray-200">
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

              {/* Conclusion/Outro */}
              <p className="text-xs md:text-base mt-4 text-gray-700">
                In 2023, <span className="font-semibold">South Africa</span> led
                the continent with
                <span className="font-semibold"> 15.57 TWh</span> of solar
                electricity—more than
                <span className="font-semibold"> three times</span> the output
                of
                <span className="font-semibold"> Egypt</span> in second place (
                <span className="font-semibold">4.67 TWh</span>).
                <span className="font-semibold"> Morocco</span> followed with
                <span className="font-semibold"> 2.05 TWh</span>, while
                <span className="font-semibold"> Kenya</span> reached
                <span className="font-semibold"> 0.49 TWh</span>—a notable
                climb.
                <span className="font-semibold"> Nigeria</span>, still in the
                early stages, produced just
                <span className="font-semibold"> 0.05 TWh</span>. The wide gap
                between countries reflects differences in investment, policy
                support, and infrastructure readiness.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md mb-8">
              <div className="mb-2 flex h-fit items-center gap-3">
                <h3 className="text-sm md:text-xl font-semibold flex-1">
                  Solar Electricity Generation Trends (2000 – 2023)
                </h3>
                {/* RHS - Action buttons */}
                <div className="w-fit h-8 flex justify-center gap-2 ">
                  {/* Fullscreen toggle button */}
                  <div
                    onClick={() => toggleFullscreen(multiLineChartContainerRef)}
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
                    onClick={() => setIsMultiLineModalOpen(true)}
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
                </div>
              </div>

              <div className=" min-h-64 flex items-center justify-center rounded-lg border border-gray-200">
                {/* Loading state */}
                {loading ? (
                  <div className="w-full flex justify-center items-center py-20">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-yellow-500"></div>
                  </div>
                ) : (
                  // Multi Line chart
                  <SolarGrowthRateComparison
                    data={data}
                    THEME={THEME}
                    isFullscreen={isFullscreen}
                    screenSize={screenSize}
                    setScreenSize={setScreenSize}
                    toggleFullscreen={toggleFullscreen}
                    iconTooltip={iconTooltip}
                    setIconTooltip={setIconTooltip}
                    chartContainerRef={multiLineChartContainerRef}
                    isModalOpen={isMultiLineModalOpen}
                    onDownload={onDownload}
                    setIsModalOpen={setIsMultiLineModalOpen}
                  />
                )}
              </div>

              {/* Data source attribution */}
              <div className="mt-4 pt-2 border-t border-gray-200">
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

              <p className="text-xs md:text-base mt-4 text-gray-700">
                <span className="font-semibold">South Africa</span>,
                <span className="font-semibold"> Egypt</span>, and
                <span className="font-semibold"> Morocco</span> have
                consistently led the continent in solar output.
                <span className="font-semibold">
                  {" "}
                  South Africa’s rapid growth after 2015
                </span>{" "}
                is especially striking.
                <span className="font-semibold"> Egypt</span> has shown steady
                progress, while
                <span className="font-semibold"> Kenya</span> began accelerating
                around 2020.
                <span className="font-semibold"> Nigeria</span> entered the
                chart in 2023 with a small but visible rise. These trends offer
                a snapshot of both mature and emerging players in Africa’s solar
                energy space.
              </p>
            </div>
          </section>
        )}

        {activeTab === "future" && (
          <section>
            <div className="text-center mb-8">
              <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-orange-600 to-amber-500 bg-clip-text text-transparent">
                The Solar Revolution Ahead
              </h2>
              <div className="w-24 h-1 bg-gradient-to-r from-orange-500 to-amber-400 mx-auto rounded-full"></div>
            </div>

            <div className="mb-8 space-y-6">
              <div className="relative">
                <div className="absolute left-0 top-0 w-1 h-full bg-gradient-to-b from-orange-500 to-transparent rounded-full"></div>
                <p className="text-lg text-gray-700 ml-6 leading-relaxed">
                  Africa stands at the threshold of an energy transformation.
                  With over{" "}
                  <span className="font-semibold text-orange-600">
                    600 million people
                  </span>{" "}
                  still lacking reliable electricity access, the continent faces
                  both its greatest challenge and its most promising
                  opportunity.
                </p>
              </div>

              <div className="bg-gradient-to-r from-orange-50 to-amber-50 p-6 rounded-xl border-l-4 border-orange-400">
                <p className="text-gray-700 text-lg leading-relaxed">
                  Solar power isn't just an energy solution for Africa — it's a{" "}
                  <span className="font-semibold">
                    catalyst for development
                  </span>
                  . With the world's highest solar irradiation levels and
                  rapidly declining technology costs, African nations are
                  uniquely positioned to bypass traditional energy
                  infrastructure and leap directly into a clean energy future.
                </p>
              </div>

              <p className="text-gray-700 text-lg leading-relaxed">
                The momentum is undeniable. From Morocco's massive Noor complex
                to Kenya's innovative off-grid solutions, pioneering projects
                across the continent are proving that solar energy can power
                everything from entire cities to remote villages. The question
                is no longer <em>if</em> Africa will embrace solar, but{" "}
                <em>how quickly</em> it can scale.
              </p>
            </div>

            <div className="  mb-8 ">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold mb-3 text-gray-800">
                  Forces Shaping Africa's Solar Future
                </h3>
                <p className="text-gray-600">
                  Critical factors that will determine the pace and scale of
                  solar adoption
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="group hover:scale-105 transition-transform duration-300">
                  <div className="bg-gradient-to-br  p-6 rounded-xl border  h-full">
                    <div className="flex items-center mb-3">
                      <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center mr-3">
                        <span className="text-white font-bold text-lg">🏛️</span>
                      </div>
                      <h4 className="font-bold text-blue-700 text-lg">
                        Policy & Governance
                      </h4>
                    </div>
                    <p className="text-gray-700 leading-relaxed">
                      Game-changing initiatives like the{" "}
                      <strong>Desert to Power</strong> program aim to generate
                      10,000 MW of solar capacity by 2030. Forward-thinking
                      policies in Rwanda, Ghana, and South Africa are creating
                      blueprints for continent-wide adoption.
                    </p>
                  </div>
                </div>

                <div className="group hover:scale-105 transition-transform duration-300">
                  <div className="bg-gradient-to-br  p-6 rounded-xl border h-full">
                    <div className="flex items-center mb-3">
                      <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center mr-3">
                        <span className="text-white font-bold text-lg">💰</span>
                      </div>
                      <h4 className="font-bold text-green-700 text-lg">
                        Capital & Investment
                      </h4>
                    </div>
                    <p className="text-gray-700 leading-relaxed">
                      Over <strong>$20 billion</strong> in clean energy
                      commitments are flowing into Africa. Development finance
                      institutions, pension funds, and impact investors are
                      recognizing solar's potential for both returns and
                      development impact.
                    </p>
                  </div>
                </div>

                <div className="group hover:scale-105 transition-transform duration-300">
                  <div className="bg-gradient-to-br p-6 rounded-xl border h-full">
                    <div className="flex items-center mb-3">
                      <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center mr-3">
                        <span className="text-white font-bold text-lg">⚡</span>
                      </div>
                      <h4 className="font-bold text-purple-700 text-lg">
                        Tech Innovation
                      </h4>
                    </div>
                    <p className="text-gray-700 leading-relaxed">
                      Revolutionary advances in <strong>battery storage</strong>
                      , mini-grids, and pay-as-you-go solar systems are making
                      clean energy accessible to Africa's most remote
                      communities. Local innovation hubs are driving solutions
                      designed for African contexts.
                    </p>
                  </div>
                </div>

                <div className="group hover:scale-105 transition-transform duration-300">
                  <div className="bg-gradient-to-br  p-6 rounded-xl border h-full">
                    <div className="flex items-center mb-3">
                      <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center mr-3">
                        <span className="text-white font-bold text-lg">👥</span>
                      </div>
                      <h4 className="font-bold text-orange-700 text-lg">
                        Human Capital
                      </h4>
                    </div>
                    <p className="text-gray-700 leading-relaxed">
                      A new generation of African energy entrepreneurs,
                      engineers, and technicians is emerging. Training programs
                      and local manufacturing are building the foundation for a{" "}
                      <strong>homegrown solar economy</strong>.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-amber-50 via-orange-50 to-red-50 p-6 rounded-xl border border-amber-200">
                <div className="flex items-start">
                  <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center mr-4 flex-shrink-0 mt-1">
                    <span className="text-white font-bold text-xl">☀️</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-800 text-lg mb-2">
                      The Transformation Promise
                    </h4>
                    <p className="text-gray-700 leading-relaxed">
                      Solar energy represents more than clean electricity for
                      Africa — it's a pathway to{" "}
                      <strong>economic independence</strong>,{" "}
                      <strong>industrial growth</strong>, and{" "}
                      <strong>social equity</strong>. As technology advances,
                      solar power could electrify the continent's rural
                      heartlands, power its growing cities, and fuel the next
                      chapter of African development.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center bg-gradient-to-r from-orange-600 to-amber-500 text-white p-8 rounded-2xl">
              <h3 className="text-2xl font-bold mb-4">
                The Next Decade is Critical
              </h3>
              <p className="text-lg leading-relaxed opacity-95">
                With the right investments, policies, and partnerships, Africa
                could become the world's fastest-growing solar market. The
                foundation is being laid today — the solar revolution starts
                now.
              </p>
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      {/* Footer */}
      <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_20%,rgba(251,191,36,0.3),transparent_50%)]"></div>
          <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_70%_80%,rgba(249,115,22,0.2),transparent_50%)]"></div>
        </div>

        <div className="relative z-10 py-12 px-4">
          <div className="max-w-6xl mx-auto">
            {/* Main Footer Content */}
            <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-8 mb-8">
              {/* About Section */}
              <div className="lg:col-span-1">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-amber-500 rounded-lg flex items-center justify-center mr-3">
                    <span className="text-white font-bold text-xl">☀️</span>
                  </div>
                  <h3 className="text-xl font-bold bg-gradient-to-r from-orange-400 to-amber-300 bg-clip-text text-transparent">
                    Africa's Solar Surge
                  </h3>
                </div>
                <p className="text-gray-300 leading-relaxed mb-4">
                  A comprehensive data-driven exploration of solar electricity
                  generation across Africa from 2000-2023, revealing the
                  continent's renewable energy transformation through
                  interactive visualizations and insights.
                </p>
                <div className="flex space-x-4">
                  <div className="flex items-center text-sm text-gray-400">
                    <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                    <span>Interactive Data</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-400">
                    <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
                    <span>Real Insights</span>
                  </div>
                </div>
              </div>

              {/* Data & Methodology */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <span className="w-6 h-6 bg-blue-500 rounded-md flex items-center justify-center mr-2 text-sm">
                    📊
                  </span>
                  Data & Methodology
                </h3>
                <div className="space-y-3">
                  <div className="bg-gray-800/50 p-3 rounded-lg border border-gray-700">
                    <p className="text-gray-300 text-sm leading-relaxed">
                      <strong className="text-white">Primary Source:</strong>{" "}
                      Our World in Data Energy Dataset
                    </p>
                    <a
                      href="https://ourworldindata.org/energy"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-orange-400 hover:text-orange-300 text-sm mt-1 group"
                    >
                      <span>Explore OWID Energy Data</span>
                      <span className="ml-1 group-hover:translate-x-1 transition-transform">
                        →
                      </span>
                    </a>
                  </div>
                  <div className="bg-gray-800/50 p-3 rounded-lg border border-gray-700">
                    <p className="text-gray-300 text-sm leading-relaxed">
                      <strong className="text-white">Key Metrics:</strong> Total
                      generation (TWh), per capita output (kWh), growth rates,
                      and regional comparisons
                    </p>
                  </div>
                </div>
              </div>

              {/* Technical & Resources */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <span className="w-6 h-6 bg-purple-500 rounded-md flex items-center justify-center mr-2 text-sm">
                    ⚡
                  </span>
                  Resources & Links
                </h3>
                <div className="space-y-3">
                  <a
                    href="https://github.com/owid/energy-data"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center p-3 bg-gray-800/50 rounded-lg border border-gray-700 hover:border-orange-500 hover:bg-gray-800/70 transition-all group"
                  >
                    <span className="w-8 h-8 bg-gray-700 rounded-lg flex items-center justify-center mr-3 group-hover:bg-orange-500 transition-colors">
                      <span className="text-sm">🔗</span>
                    </span>
                    <div>
                      <div className="text-white font-medium text-sm">
                        Dataset Repository
                      </div>
                      <div className="text-gray-400 text-xs">
                        Raw data & documentation
                      </div>
                    </div>
                  </a>
                </div>
              </div>
            </div>

            {/* Technology Stack */}
            <div className="bg-gradient-to-r from-gray-800/50 to-gray-700/50 p-6 rounded-xl border border-gray-600 mb-8">
              <h4 className="text-lg font-semibold mb-4 text-center">
                Built With
              </h4>
              <div className="flex flex-wrap justify-center gap-4">
                <div className="flex items-center bg-gray-700/50 px-4 py-2 rounded-full">
                  <span className="w-6 h-6 bg-blue-500 rounded-md flex items-center justify-center mr-2 text-xs">
                    ⚛️
                  </span>
                  <span className="text-sm font-medium">React</span>
                </div>
                <div className="flex items-center bg-gray-700/50 px-4 py-2 rounded-full">
                  <span className="w-6 h-6 bg-cyan-500 rounded-md flex items-center justify-center mr-2 text-xs">
                    🎨
                  </span>
                  <span className="text-sm font-medium">Tailwind CSS</span>
                </div>
                <div className="flex items-center bg-gray-700/50 px-4 py-2 rounded-full">
                  <span className="w-6 h-6 bg-orange-500 rounded-md flex items-center justify-center mr-2 text-xs">
                    📈
                  </span>
                  <span className="text-sm font-medium">D3.js</span>
                </div>
              </div>
            </div>

            {/* Bottom Section */}
            <div className="pt-8 border-t border-gray-700">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center space-x-6 text-sm text-gray-400">
                  <div className="flex items-center">
                    <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
                    <span>Data Updated: 23rd May, 2025</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
