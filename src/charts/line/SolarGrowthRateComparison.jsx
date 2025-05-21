import React, { useEffect, useMemo, useState } from "react";
import * as d3 from "d3";

const SolarElectricityChart = ({
  isFullscreen,
  chartContainerRef,
  screenSize,
  setScreenSize,
}) => {
  const [chartDimensions, setChartDimensions] = useState({
    width: 0,
    height: 0,
  });

  const data = [
    // Nigeria
    { country: "Nigeria", solar_electricity: 0.5, year: 2018 },
    { country: "Nigeria", solar_electricity: 0.7, year: 2019 },
    { country: "Nigeria", solar_electricity: 0.8, year: 2020 },
    { country: "Nigeria", solar_electricity: 1.0, year: 2021 },
    { country: "Nigeria", solar_electricity: 1.1, year: 2022 },
    { country: "Nigeria", solar_electricity: 1.2, year: 2023 },

    // Kenya
    { country: "Kenya", solar_electricity: 0.9, year: 2018 },
    { country: "Kenya", solar_electricity: 1.2, year: 2019 },
    { country: "Kenya", solar_electricity: 1.8, year: 2020 },
    { country: "Kenya", solar_electricity: 2.3, year: 2021 },
    { country: "Kenya", solar_electricity: 2.7, year: 2022 },
    { country: "Kenya", solar_electricity: 3.1, year: 2023 },

    // Morocco
    { country: "Morocco", solar_electricity: 1.5, year: 2018 },
    { country: "Morocco", solar_electricity: 1.9, year: 2019 },
    { country: "Morocco", solar_electricity: 2.4, year: 2020 },
    { country: "Morocco", solar_electricity: 3.0, year: 2021 },
    { country: "Morocco", solar_electricity: 3.5, year: 2022 },
    { country: "Morocco", solar_electricity: 4.2, year: 2023 },

    // South Africa
    { country: "South Africa", solar_electricity: 2.1, year: 2018 },
    { country: "South Africa", solar_electricity: 2.5, year: 2019 },
    { country: "South Africa", solar_electricity: 2.8, year: 2020 },
    { country: "South Africa", solar_electricity: 3.2, year: 2021 },
    { country: "South Africa", solar_electricity: 3.9, year: 2022 },
    { country: "South Africa", solar_electricity: 4.6, year: 2023 },

    // Egypt
    { country: "Egypt", solar_electricity: 0.7, year: 2018 },
    { country: "Egypt", solar_electricity: 1.0, year: 2019 },
    { country: "Egypt", solar_electricity: 1.6, year: 2020 },
    { country: "Egypt", solar_electricity: 2.4, year: 2021 },
    { country: "Egypt", solar_electricity: 3.2, year: 2022 },
    { country: "Egypt", solar_electricity: 3.8, year: 2023 },
  ];

  const width = chartDimensions.width || 800;
  const height = chartDimensions.height || 500;
  const margin = { top: 50, right: 150, bottom: 60, left: 80 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const years = [...new Set(data.map((d) => d.year))];
  const countries = [...new Set(data.map((d) => d.country))];
  const color = d3
    .scaleOrdinal()
    .domain(countries)
    .range(["#ff9e4a", "#1f77b4", "#2ca02c", "#d62728", "#9467bd"]);

  const xScale = useMemo(
    () => d3.scaleLinear().domain(d3.extent(years)).range([0, innerWidth]),
    [data]
  );

  const yScale = useMemo(
    () =>
      d3
        .scaleLinear()
        .domain([0, d3.max(data, (d) => d.solar_electricity) * 1.1])
        .range([innerHeight, 0]),
    [data]
  );

  const line = d3
    .line()
    .x((d) => xScale(d.year))
    .y((d) => yScale(d.solar_electricity))
    .curve(d3.curveMonotoneX);

  const grouped = useMemo(() => {
    return countries.map((country) => ({
      country,
      values: data.filter((d) => d.country === country),
    }));
  }, [data]);

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
          height: Math.min(Math.max(containerWidth * 0.6, 300), 650), // Increased height range
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

  return (
    <svg
      ref={chartContainerRef}
      width={width}
      height={height}
      className={`${
        isFullscreen
          ? "w-full h-full fixed inset-0 z-50 max-w-none rounded-none"
          : ""
      } bg-white rounded shadow border`}
    >
      <g transform={`translate(${margin.left}, ${margin.top})`}>
        {/* X Grid & Labels */}
        {years.map((year) => (
          <g key={`x-${year}`}>
            <line
              x1={xScale(year)}
              x2={xScale(year)}
              y1={0}
              y2={innerHeight}
              stroke="#ddd"
              strokeDasharray="4,4"
            />
            <text
              x={xScale(year)}
              y={innerHeight + 20}
              textAnchor="middle"
              fontSize={12}
              fill="#333"
            >
              {year}
            </text>
          </g>
        ))}

        {/* Y Axis */}
        {yScale.ticks(5).map((tick) => (
          <g key={`y-${tick}`}>
            <line
              x1={0}
              x2={innerWidth}
              y1={yScale(tick)}
              y2={yScale(tick)}
              stroke="#eee"
            />
            <text
              x={-10}
              y={yScale(tick)}
              textAnchor="end"
              alignmentBaseline="middle"
              fontSize={12}
              fill="#555"
            >
              {tick}
            </text>
          </g>
        ))}

        {/* Lines */}
        {grouped.map((group) => (
          <path
            key={`line-${group.country}`}
            d={line(group.values)}
            fill="none"
            stroke={color(group.country)}
            strokeWidth={2.5}
          />
        ))}

        {/* Dots */}
        {grouped.map((group) =>
          group.values.map((d, i) => (
            <circle
              key={`${group.country}-${i}`}
              cx={xScale(d.year)}
              cy={yScale(d.solar_electricity)}
              r={4}
              fill={color(group.country)}
            />
          ))
        )}

        {/* Title */}
        <text
          x={innerWidth / 2}
          y={-20}
          textAnchor="middle"
          fontSize={18}
          fontWeight="bold"
          fill="#333"
        >
          Solar Generation Growth in Selected African Nations
        </text>

        {/* Y Axis Label */}
        <text
          transform={`rotate(-90)`}
          x={-innerHeight / 2}
          y={-50}
          textAnchor="middle"
          fontSize={14}
          fill="#333"
        >
          Solar Electricity (TWh)
        </text>
      </g>

      {/* Legend */}
      <g transform={`translate(${width - margin.right + 10}, ${margin.top})`}>
        {countries.map((country, i) => (
          <g key={country} transform={`translate(0, ${i * 25})`}>
            <rect width={15} height={15} fill={color(country)} />
            <text x={20} y={12} fontSize={13} fill="#333">
              {country}
            </text>
          </g>
        ))}
      </g>
    </svg>
  );
};

export default SolarElectricityChart;
