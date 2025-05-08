import { useState, useEffect, useRef } from "react";
import * as d3 from "d3";
import { Range } from "../../components";

// Mock data for solar adoption across African countries
// In a real application, you would replace this with your actual data
const solarData = [
  { id: "DZA", name: "Algeria", value: 12.7 },
  { id: "AGO", name: "Angola", value: 5.3 },
  { id: "BEN", name: "Benin", value: 3.8 },
  { id: "BWA", name: "Botswana", value: 18.9 },
  { id: "BFA", name: "Burkina Faso", value: 7.2 },
  { id: "BDI", name: "Burundi", value: 2.1 },
  { id: "CMR", name: "Cameroon", value: 4.5 },
  { id: "CPV", name: "Cape Verde", value: 20.4 },
  { id: "CAF", name: "Central African Republic", value: 1.8 },
  { id: "TCD", name: "Chad", value: 2.3 },
  { id: "COM", name: "Comoros", value: 3.7 },
  { id: "COD", name: "Democratic Republic of Congo", value: 2.9 },
  { id: "DJI", name: "Djibouti", value: 7.8 },
  { id: "EGY", name: "Egypt", value: 25.6 },
  { id: "GNQ", name: "Equatorial Guinea", value: 3.4 },
  { id: "ERI", name: "Eritrea", value: 4.2 },
  { id: "ETH", name: "Ethiopia", value: 12.3 },
  { id: "GAB", name: "Gabon", value: 5.1 },
  { id: "GMB", name: "Gambia", value: 6.7 },
  { id: "GHA", name: "Ghana", value: 9.8 },
  { id: "GIN", name: "Guinea", value: 3.1 },
  { id: "GNB", name: "Guinea-Bissau", value: 2.5 },
  { id: "CIV", name: "Ivory Coast", value: 5.6 },
  { id: "KEN", name: "Kenya", value: 19.2 },
  { id: "LSO", name: "Lesotho", value: 8.9 },
  { id: "LBR", name: "Liberia", value: 2.7 },
  { id: "LBY", name: "Libya", value: 14.5 },
  { id: "MDG", name: "Madagascar", value: 7.3 },
  { id: "MWI", name: "Malawi", value: 8.7 },
  { id: "MLI", name: "Mali", value: 9.4 },
  { id: "MRT", name: "Mauritania", value: 11.2 },
  { id: "MUS", name: "Mauritius", value: 22.8 },
  { id: "MAR", name: "Morocco", value: 28.7 },
  { id: "MOZ", name: "Mozambique", value: 10.3 },
  { id: "NAM", name: "Namibia", value: 21.5 },
  { id: "NER", name: "Niger", value: 6.3 },
  { id: "NGA", name: "Nigeria", value: 8.4 },
  { id: "COG", name: "Republic of Congo", value: 3.8 },
  { id: "RWA", name: "Rwanda", value: 15.7 },
  { id: "STP", name: "Sao Tome and Principe", value: 4.8 },
  { id: "SEN", name: "Senegal", value: 12.4 },
  { id: "SYC", name: "Seychelles", value: 25.9 },
  { id: "SLE", name: "Sierra Leone", value: 3.2 },
  { id: "SOM", name: "Somalia", value: 8.7 },
  { id: "ZAF", name: "South Africa", value: 27.8 },
  { id: "SDS", name: "South Sudan", value: 1.5 },
  { id: "SDN", name: "Sudan", value: 9.6 },
  { id: "SWZ", name: "Swaziland", value: 7.8 },
  { id: "TZA", name: "Tanzania", value: 13.4 },
  { id: "TGO", name: "Togo", value: 4.5 },
  { id: "TUN", name: "Tunisia", value: 19.7 },
  { id: "UGA", name: "Uganda", value: 11.2 },
  { id: "ZMB", name: "Zambia", value: 14.8 },
  { id: "ZWE", name: "Zimbabwe", value: 10.9 },
];

export default function AfricaSolarChoropleth({ data }) {
  const svgRef = useRef(null);
  const chartRef = useRef(null);
  const tooltipRef = useRef(null);
  const [solarData, setSolarData] = useState(null);
  const [currentYear, setCurrentYear] = useState(2023);
  const [years, setYears] = useState({ min: 2000, max: 2023 });

  // Add state for filtering
  const [hoveredBin, setHoveredBin] = useState(null);
  const [isHovering, setIsHovering] = useState(false);
  const [selectedBins, setSelectedBins] = useState([]);

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

  // Define bin ranges for our filter categories
  const bins = [
    { min: 0, max: 52, label: "0 – 52 kWh", color: "#fff5eb" },
    { min: 52, max: 104, label: "52 – 104 kWh", color: "#fed8a6" },
    { min: 104, max: 156, label: "104 – 156 kWh", color: "#fd9243" },
    { min: 156, max: 208, label: "156 – 208 kWh", color: "#f05b23" },
    { min: 208, max: 260, label: "208 – 260 kWh", color: "#bd2e1e" },
  ];

  // Initialize with all bins selected
  useEffect(() => {
    setSelectedBins(bins.map((_, i) => i));
  }, []);

  useEffect(() => {
    const createHiddenChoropleth = async () => {
      // Clear previous chart if any
      d3.select(chert.current).selectAll("*").remove();

      // Define African country ISO codes
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

      // Get GeoJSON data
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

      // Set up dimensions
      const width = 1700;
      const height = 800;
      const margin = { top: 30, right: 20, bottom: 80, left: 20 }; // Increased bottom margin for legend

      // Create SVG
      const svg = d3
        .select(chartRef.current)
        .attr("viewBox", `0 0 ${width} ${height - 50}`)
        .append("g")
        .attr("transform", `translate(${margin.left}, -100)`);

      // Create a tooltip div
      const tooltip = d3.select(tooltipRef.current);

      // Define color scale
      const colorScale = solarData
        ? d3
            .scaleSequential(d3.interpolateYlOrRd)
            .domain(
              d3.extent(solarData, (datum) => datum?.solar_elec_per_capita)
            )
        : null; // Assuming max value is 30 KWh

      // Create projection and path generator
      const projection = d3
        .geoMercator()
        .scale(400)
        .center([15, 5]) // Center on Africa
        .translate([width / 2, height / 2]);

      const pathGenerator = d3.geoPath().projection(projection);

      // Create interactive legend
      const legendWidth = 1000;
      const legendHeight = 25;
      const legendY = height - margin.bottom;

      const legend = svg
        .append("g")
        .attr("class", "legend")
        .attr(
          "transform",
          `translate(${(width - margin.right - legendWidth) / 2}, ${
            legendY + 80
          })`
        );

      // Create legend title
      legend
        .append("text")
        .attr("x", legendWidth / 2)
        .attr("y", -40)
        .attr("text-anchor", "middle")
        .style("font-size", "20px")
        .style("font-weight", "semi-bold")
        .text(
          "Solar Energy Consumption (KWh) - Hover to Filter, Click to Select"
        );

      // Create the bin rectangles for the interactive legend
      const binWidth = legendWidth / bins.length;

      legend
        .selectAll(".legend-bin")
        .data(bins)
        .enter()
        .append("rect")
        .attr("class", "legend-bin")
        .attr("x", (d, i) => i * binWidth)
        .attr("y", -20)
        .attr("width", binWidth)
        .attr("height", legendHeight)
        .attr("fill", (d, i) => {
          // When hovering, highlight only the hovered bin
          if (isHovering && hoveredBin !== null) {
            return hoveredBin === i
              ? d.color
              : getColorWithOpacity(d.color, 0.1);
          }
          // Otherwise show selected bins
          return selectedBins.includes(i)
            ? d.color
            : getColorWithOpacity(d.color, 0.1);
        })
        .attr("stroke", "#333")
        .attr("stroke-width", 1)
        .style("cursor", "pointer")
        .on("mouseenter", (event, d) => {
          const index = bins.findIndex((bin) => bin.min === d.min);
          setHoveredBin(index);
          setIsHovering(true);
        })
        .on("mouseleave", () => {
          setIsHovering(false);
        })
        .on("click", (event, d) => {
          const index = bins.findIndex((bin) => bin.min === d.min);
          const newSelectedBins = [...selectedBins];

          if (newSelectedBins.includes(index)) {
            // Remove from selection
            setSelectedBins(
              newSelectedBins.filter((binIndex) => binIndex !== index)
            );
          } else {
            // Add to selection
            setSelectedBins([...newSelectedBins, index]);
          }
        });

      // Add legend labels (moved below the bins)
      legend
        .selectAll(".legend-label")
        .data(bins)
        .enter()
        .append("text")
        .attr("class", "legend-label")
        .attr("x", (d, i) => i * binWidth + binWidth / 2)
        .attr("y", 25) // Moved below the bins
        .attr("text-anchor", "middle")
        .attr("fill", "#000")
        .style("font-size", "18px")
        .style("font-weight", "500")
        .style("cursor", "pointer")
        .text((d) => d.label);

      // Title would be visible for the hidden chart
      svg
        .append("text")
        .attr("x", width / 2 - margin.left - margin.right)
        .attr("y", -10)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .style("font-weight", "bold")
        .text("Solar Energy Consumption Across Africa (KWh)");

      // Helper function to check if a value is in the selected bins or hover state
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

      // Draw map
      svg
        .selectAll(".country")
        .data(africaData.features)
        .enter()
        .append("path")
        .attr("class", "country")
        .attr("d", pathGenerator)
        .attr("fill", (d) => {
          const countryData = solarData?.find(
            (item) => item.country === d?.properties?.name
          );
          if (!countryData) return "#222";

          // Apply filter
          const value = countryData.solar_elec_per_capita;
          const isSelected = isInSelectedBins(value);

          // If the value is in a selected bin (or the hovered bin if hovering),
          // show it at full opacity, otherwise show it with reduced opacity
          return isSelected
            ? colorScale(value)
            : rgbToRgba(colorScale(value), 0.1);
        })
        .attr("stroke", "#000")
        .attr("stroke-width", 0.5)
        .on("mouseover", function (event, d) {
          const countryData = solarData.find(
            (item) => item.country === d.properties?.name
          );
        })
        .on("mouseout", function () {
          d3.select(this).attr("stroke-width", 0.5).attr("stroke", "#000");

          tooltip.style("opacity", 0);
        });
    };

    const createChoropleth = async () => {
      // Clear previous chart if any
      d3.select(svgRef.current).selectAll("*").remove();

      // Define African country ISO codes
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

      // Get GeoJSON data
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

      // Set up dimensions
      const width = 1700;
      const height = 800;
      const margin = { top: 30, right: 20, bottom: 80, left: 20 }; // Increased bottom margin for legend

      // Create SVG
      const svg = d3
        .select(svgRef.current)
        .attr("viewBox", `0 0 ${width} ${height - 50}`)
        .append("g")
        .attr("transform", `translate(${margin.left}, -100)`);

      // Create a tooltip div
      const tooltip = d3.select(tooltipRef.current);

      // Define color scale
      const colorScale = solarData
        ? d3
            .scaleSequential(d3.interpolateYlOrRd)
            .domain(
              d3.extent(solarData, (datum) => datum?.solar_elec_per_capita)
            )
        : null; // Assuming max value is 30 KWh

      // Create projection and path generator
      const projection = d3
        .geoMercator()
        .scale(400)
        .center([15, 5]) // Center on Africa
        .translate([width / 2, height / 2]);

      const pathGenerator = d3.geoPath().projection(projection);

      // Create interactive legend
      const legendWidth = 1000;
      const legendHeight = 25;
      const legendY = height - margin.bottom;

      const legend = svg
        .append("g")
        .attr("class", "legend")
        .attr(
          "transform",
          `translate(${(width - margin.right - legendWidth) / 2}, ${
            legendY + 80
          })`
        );

      // Create legend title
      legend
        .append("text")
        .attr("x", legendWidth / 2)
        .attr("y", -40)
        .attr("text-anchor", "middle")
        .style("font-size", "20px")
        .style("font-weight", "semi-bold")
        .text(
          "Solar Energy Consumption (KWh) - Hover to Filter, Click to Select"
        );

      // Create the bin rectangles for the interactive legend
      const binWidth = legendWidth / bins.length;

      legend
        .selectAll(".legend-bin")
        .data(bins)
        .enter()
        .append("rect")
        .attr("class", "legend-bin")
        .attr("x", (d, i) => i * binWidth)
        .attr("y", -20)
        .attr("width", binWidth)
        .attr("height", legendHeight)
        .attr("fill", (d, i) => {
          // When hovering, highlight only the hovered bin
          if (isHovering && hoveredBin !== null) {
            return hoveredBin === i
              ? d.color
              : getColorWithOpacity(d.color, 0.1);
          }
          // Otherwise show selected bins
          return selectedBins.includes(i)
            ? d.color
            : getColorWithOpacity(d.color, 0.1);
        })
        .attr("stroke", "#333")
        .attr("stroke-width", 1)
        .style("cursor", "pointer")
        .on("mouseenter", (event, d) => {
          const index = bins.findIndex((bin) => bin.min === d.min);
          setHoveredBin(index);
          setIsHovering(true);
        })
        .on("mouseleave", () => {
          setIsHovering(false);
        })
        .on("click", (event, d) => {
          const index = bins.findIndex((bin) => bin.min === d.min);
          const newSelectedBins = [...selectedBins];

          if (newSelectedBins.includes(index)) {
            // Remove from selection
            setSelectedBins(
              newSelectedBins.filter((binIndex) => binIndex !== index)
            );
          } else {
            // Add to selection
            setSelectedBins([...newSelectedBins, index]);
          }
        });

      // Add legend labels (moved below the bins)
      legend
        .selectAll(".legend-label")
        .data(bins)
        .enter()
        .append("text")
        .attr("class", "legend-label")
        .attr("x", (d, i) => i * binWidth + binWidth / 2)
        .attr("y", 25) // Moved below the bins
        .attr("text-anchor", "middle")
        .attr("fill", "#000")
        .style("font-size", "18px")
        .style("font-weight", "500")
        .style("cursor", "pointer")
        .text((d) => d.label);

      // Add title
      // svg
      //   .append("text")
      //   .attr("x", width / 2 - margin.left - margin.right)
      //   .attr("y", -10)
      //   .attr("text-anchor", "middle")
      //   .style("font-size", "16px")
      //   .style("font-weight", "bold")
      //   .text("Solar Energy Consumption Across Africa (KWh)");

      // Helper function to check if a value is in the selected bins or hover state
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

      // Draw map
      svg
        .selectAll(".country")
        .data(africaData.features)
        .enter()
        .append("path")
        .attr("class", "country")
        .attr("d", pathGenerator)
        .attr("fill", (d) => {
          const countryData = solarData?.find(
            (item) => item.country === d?.properties?.name
          );
          if (!countryData) return "#222";

          // Apply filter
          const value = countryData.solar_elec_per_capita;
          const isSelected = isInSelectedBins(value);

          // If the value is in a selected bin (or the hovered bin if hovering),
          // show it at full opacity, otherwise show it with reduced opacity
          return isSelected
            ? colorScale(value)
            : rgbToRgba(colorScale(value), 0.1);
        })
        .attr("stroke", "#000")
        .attr("stroke-width", 0.5)
        .on("mouseover", function (event, d) {
          const countryData = solarData.find(
            (item) => item.country === d.properties?.name
          );
          // console.log(solarData[0]);
          // console.log(d);
          const svgRect =
            event.currentTarget.ownerSVGElement.getBoundingClientRect();
          d3.select(this).attr("stroke-width", 1.5).attr("stroke", "#333");

          tooltip
            .style("opacity", 1)
            .style("left", `${event.clientX - svgRect.left + 10}px`)
            .style("top", `${event.clientY - svgRect.top}px`).html(`
              <strong>${d.properties.name}</strong><br>
              Solar Energy: ${
                countryData
                  ? countryData.solar_elec_per_capita.toFixed(3)
                  : "No data"
              } KWh
            `);
        })
        .on("mouseout", function () {
          d3.select(this).attr("stroke-width", 0.5).attr("stroke", "#000");

          tooltip.style("opacity", 0);
        });
    };

    createChoropleth();
    createHiddenChoropleth();
  }, [selectedBins, hoveredBin, isHovering, currentYear]); // Re-render when filters or hover state changes

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

  // Fullscreen toggle functionality
  const handleDataFilter = () => {
    return data?.filter((datum) => datum?.year === currentYear);
  };

  useEffect(() => {
    setSolarData(handleDataFilter());
  }, [data, currentYear]);

  console.log(solarData);

  return (
    <div className="relative w-full h-full ">
      {/* Hidden chart  */}
      <svg
        ref={chartRef}
        className="fixed -top-[2000%] w-full h-full min-h-[500px]"
      />
      <svg ref={svgRef} className="w-full h-full min-h-[500px]" />
      <div
        ref={tooltipRef}
        className="absolute pointer-events-none bg-white p-2 rounded shadow-md opacity-0 border border-gray-300 text-sm"
        style={{ transition: "opacity 0.3s" }}
      />
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
