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
  SolarShare,
  SolarShareInGeneration,
  SolarSurgeCountryComparison,
} from "../charts";
import { csv } from "d3";
import { Icon } from "@iconify/react";

export default function AfricaSolarSurge() {
  const THEME = {
    borderColor: "#E5E2E0",
    primaryColor: "#f97316",
    primaryColorLight: "#f97316",
    accentColor: "#FFB845",
    textColor: "#333333",
    backgroundColor: "#FFFFFF",
  };
  const [activeTab, setActiveTab] = useState("overview");
  // Overview tab
  const chartContainerRef = useRef(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-4xl font-bold mb-2">
            Africa's Solar Surge: Hope for a Green Future
          </h1>
          <p className="text-xl">
            Exploring the growth and impact of solar energy across the African
            continent (2000-2023)
          </p>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white shadow-md sticky top-0 z-[999]">
        <div className="max-w-5xl mx-auto px-4">
          <ul className="flex overflow-x-auto">
            <li>
              <button
                onClick={() => setActiveTab("overview")}
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
                onClick={() => setActiveTab("adoption")}
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
                onClick={() => setActiveTab("impact")}
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
                onClick={() => setActiveTab("country")}
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
                onClick={() => setActiveTab("future")}
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
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold mb-2 flex items-center">
                  <Sun className="mr-2 h-5 w-5 text-yellow-500" />
                  Solar Electricity Generation
                </h3>
                <p className="text-4xl font-bold text-orange-500 mb-2">
                  +271,300%
                </p>
                <p className="text-gray-600">
                  Growth in solar electricity generation since 2000
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold mb-2 flex items-center">
                  <Zap className="mr-2 h-5 w-5 text-yellow-500" />
                  Energy Mix Growth
                </h3>
                <p className="text-4xl font-bold text-orange-500 mb-2">
                  +154,400%
                </p>
                <p className="text-gray-600">
                  Increase in solar's share of total electricity (2000-2023)
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold mb-2 flex items-center">
                  <Globe className="mr-2 h-5 w-5 text-yellow-500" />
                  Current Share
                </h3>
                <p className="text-4xl font-bold text-orange-500 mb-2">3.09%</p>
                <p className="text-gray-600">
                  Solar's share in Africa's total electricity mix in 2023
                </p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md mb-8">
              <div className="mb-2 flex h-fit items-center gap-3">
                <h3 className="text-sm md:text-xl font-semibold flex-1">
                  Solar Generation Growth in Africa (2000-2023)
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
                  Africa's Growing Solar Share of Electricity (2000-2023)
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
            <h2 className="text-3xl font-bold mb-6">Country Comparison</h2>
            <p className="text-gray-700 mb-6">
              Solar adoption varies significantly across African countries,
              influenced by factors such as policy frameworks, investment
              climates, and natural resources.
            </p>
            <div className="bg-white p-6 rounded-lg shadow-md mb-8">
              <div className="mb-2 flex h-fit items-center gap-3">
                <h3 className="text-sm md:text-xl font-semibold flex-1">
                  Africa's Growing Solar Share of Electricity (2000-2023)
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
                  // Bar chart
                  <SolarSurgeCountryComparison
                    data={adoptionData}
                    adoptionData={adoptionData}
                    title="Solar Generation"
                    width={900}
                    height={500}
                    years={{ min: 2000, max: 2023 }}
                    defaultYear={2023}
                    colorByRegion={true}
                    isFullscreen={isFullscreen}
                    enableCompareMode={true}
                    enableSharing={true}
                    toggleFullscreen={toggleFullscreen}
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

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold mb-4">
                  Growth Rate Comparison
                </h3>
                <div className="bg-gray-100 h-64 flex items-center justify-center rounded-lg border border-gray-200">
                  <div className="text-center text-gray-500">
                    <TrendingUp className="h-12 w-12 mx-auto mb-2" />
                    <p className="text-sm font-medium">
                      Line Chart: Growth Trajectories for Key Countries
                    </p>
                  </div>
                </div>
                <p className="mt-4 text-gray-700">
                  This chart shows how solar adoption has grown at different
                  rates across selected African nations.
                </p>
              </div>
            </div>
          </section>
        )}

        {activeTab === "future" && (
          <section>
            <h2 className="text-3xl font-bold mb-6">Future Outlook</h2>
            <p className="text-gray-700 mb-6">
              The future of solar energy in Africa looks promising, with
              continued technological improvements, decreasing costs, and
              increasing policy support.
            </p>

            <div className="bg-white p-6 rounded-lg shadow-md mb-8">
              <div className="mb-2 flex h-fit items-center gap-3">
                <h3 className="text-sm md:text-xl font-semibold flex-1">
                  Africa's Growing Solar Share of Electricity (2000-2023)
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

            <div className="bg-white p-6 rounded-lg shadow-md mb-8">
              <h3 className="text-xl font-semibold mb-4">
                Key Factors Influencing Future Growth
              </h3>

              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                  <h4 className="font-medium mb-2 text-orange-600">
                    Policy Support
                  </h4>
                  <p className="text-gray-700">
                    Government initiatives, renewable energy targets, and
                    supportive regulatory frameworks will play crucial roles in
                    accelerating solar adoption.
                  </p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                  <h4 className="font-medium mb-2 text-orange-600">
                    Investment Trends
                  </h4>
                  <p className="text-gray-700">
                    Increasing private sector involvement and international
                    climate finance are creating new opportunities for
                    large-scale solar projects.
                  </p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                  <h4 className="font-medium mb-2 text-orange-600">
                    Technological Advancements
                  </h4>
                  <p className="text-gray-700">
                    Improvements in solar panel efficiency, energy storage
                    solutions, and mini-grid technologies will continue to drive
                    adoption.
                  </p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                  <h4 className="font-medium mb-2 text-orange-600">
                    Climate Commitments
                  </h4>
                  <p className="text-gray-700">
                    National and international climate goals are pushing for
                    accelerated transitions to renewable energy sources,
                    including solar.
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold mb-4">
                About This Analysis
              </h3>
              <p className="text-gray-300">
                This article examines solar energy adoption and impact across
                Africa from 2000 to 2022, using data on electricity generation,
                consumption, and renewable energy adoption.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-4">Data Sources</h3>
              <p className="text-gray-300">
                Data compiled from national energy agencies, international
                energy organizations, and renewable energy tracking initiatives
                across the African continent.
              </p>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-700 text-center text-gray-400">
            <p>
              © 2025 Africa's Solar Surge Analysis. All data visualizations
              created with React and Recharts.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
