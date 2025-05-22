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
  const [visibleCountries, setVisibleCountries] = useState({});
  const [tooltip, setTooltip] = useState(null);
  const [activeCountry, setActiveCountry] = useState(null);

  const data = [
    // Nigeria
    {
      country: "Nigeria",
      year: 2000,
      solar_electricity: 0,
    },
    {
      country: "Nigeria",
      year: 2001,
      solar_electricity: 0,
    },
    {
      country: "Nigeria",
      year: 2002,
      solar_electricity: 0,
    },
    {
      country: "Nigeria",
      year: 2003,
      solar_electricity: 0,
    },
    {
      country: "Nigeria",
      year: 2004,
      solar_electricity: 0,
    },
    {
      country: "Nigeria",
      year: 2005,
      solar_electricity: 0,
    },
    {
      country: "Nigeria",
      year: 2006,
      solar_electricity: 0,
    },
    {
      country: "Nigeria",
      year: 2007,
      solar_electricity: 0,
    },
    {
      country: "Nigeria",
      year: 2008,
      solar_electricity: 0,
    },
    {
      country: "Nigeria",
      year: 2009,
      solar_electricity: 0,
    },
    {
      country: "Nigeria",
      year: 2010,
      solar_electricity: 0,
    },
    {
      country: "Nigeria",
      year: 2011,
      solar_electricity: 0,
    },
    {
      country: "Nigeria",
      year: 2012,
      solar_electricity: 0.02,
    },
    {
      country: "Nigeria",
      year: 2013,
      solar_electricity: 0.02,
    },
    {
      country: "Nigeria",
      year: 2014,
      solar_electricity: 0.02,
    },
    {
      country: "Nigeria",
      year: 2015,
      solar_electricity: 0.03,
    },
    {
      country: "Nigeria",
      year: 2016,
      solar_electricity: 0.03,
    },
    {
      country: "Nigeria",
      year: 2017,
      solar_electricity: 0.03,
    },
    {
      country: "Nigeria",
      year: 2018,
      solar_electricity: 0.03,
    },
    {
      country: "Nigeria",
      year: 2019,
      solar_electricity: 0.04,
    },
    {
      country: "Nigeria",
      year: 2020,
      solar_electricity: 0.04,
    },
    {
      country: "Nigeria",
      year: 2021,
      solar_electricity: 0.05,
    },
    {
      country: "Nigeria",
      year: 2022,
      solar_electricity: 0.05,
    },
    {
      country: "Nigeria",
      year: 2023,
      solar_electricity: 0.05,
    },

    // Kenya
    {
      country: "Kenya",
      year: 2000,
      solar_electricity: 0,
    },
    {
      country: "Kenya",
      year: 2001,
      solar_electricity: 0,
    },
    {
      country: "Kenya",
      year: 2002,
      solar_electricity: 0,
    },
    {
      country: "Kenya",
      year: 2003,
      solar_electricity: 0,
    },
    {
      country: "Kenya",
      year: 2004,
      solar_electricity: 0,
    },
    {
      country: "Kenya",
      year: 2005,
      solar_electricity: 0,
    },
    {
      country: "Kenya",
      year: 2006,
      solar_electricity: 0,
    },
    {
      country: "Kenya",
      year: 2007,
      solar_electricity: 0,
    },
    {
      country: "Kenya",
      year: 2008,
      solar_electricity: 0,
    },
    {
      country: "Kenya",
      year: 2009,
      solar_electricity: 0,
    },
    {
      country: "Kenya",
      year: 2010,
      solar_electricity: 0,
    },
    {
      country: "Kenya",
      year: 2011,
      solar_electricity: 0.01,
    },
    {
      country: "Kenya",
      year: 2012,
      solar_electricity: 0.01,
    },
    {
      country: "Kenya",
      year: 2013,
      solar_electricity: 0.03,
    },
    {
      country: "Kenya",
      year: 2014,
      solar_electricity: 0.05,
    },
    {
      country: "Kenya",
      year: 2015,
      solar_electricity: 0.05,
    },
    {
      country: "Kenya",
      year: 2016,
      solar_electricity: 0.06,
    },
    {
      country: "Kenya",
      year: 2017,
      solar_electricity: 0.07,
    },
    {
      country: "Kenya",
      year: 2018,
      solar_electricity: 0.09,
    },
    {
      country: "Kenya",
      year: 2019,
      solar_electricity: 0.09,
    },
    {
      country: "Kenya",
      year: 2020,
      solar_electricity: 0.09,
    },
    {
      country: "Kenya",
      year: 2021,
      solar_electricity: 0.17,
    },
    {
      country: "Kenya",
      year: 2022,
      solar_electricity: 0.38,
    },
    {
      country: "Kenya",
      year: 2023,
      solar_electricity: 0.49,
    },
    // Morocco
    {
      country: "Morocco",
      year: 2000,
      solar_electricity: 0,
    },
    {
      country: "Morocco",
      year: 2001,
      solar_electricity: 0,
    },
    {
      country: "Morocco",
      year: 2002,
      solar_electricity: 0,
    },
    {
      country: "Morocco",
      year: 2003,
      solar_electricity: 0,
    },
    {
      country: "Morocco",
      year: 2004,
      solar_electricity: 0,
    },
    {
      country: "Morocco",
      year: 2005,
      solar_electricity: 0,
    },
    {
      country: "Morocco",
      year: 2006,
      solar_electricity: 0,
    },
    {
      country: "Morocco",
      year: 2007,
      solar_electricity: 0,
    },
    {
      country: "Morocco",
      year: 2008,
      solar_electricity: 0,
    },
    {
      country: "Morocco",
      year: 2009,
      solar_electricity: 0,
    },
    {
      country: "Morocco",
      year: 2010,
      solar_electricity: 0,
    },
    {
      country: "Morocco",
      year: 2011,
      solar_electricity: 0,
    },
    {
      country: "Morocco",
      year: 2012,
      solar_electricity: 0,
    },
    {
      country: "Morocco",
      year: 2013,
      solar_electricity: 0,
    },
    {
      country: "Morocco",
      year: 2014,
      solar_electricity: 0,
    },
    {
      country: "Morocco",
      year: 2015,
      solar_electricity: 0,
    },
    {
      country: "Morocco",
      year: 2016,
      solar_electricity: 0.4,
    },
    {
      country: "Morocco",
      year: 2017,
      solar_electricity: 0.41,
    },
    {
      country: "Morocco",
      year: 2018,
      solar_electricity: 0.95,
    },
    {
      country: "Morocco",
      year: 2019,
      solar_electricity: 1.58,
    },
    {
      country: "Morocco",
      year: 2020,
      solar_electricity: 1.52,
    },
    {
      country: "Morocco",
      year: 2021,
      solar_electricity: 1.82,
    },
    {
      country: "Morocco",
      year: 2022,
      solar_electricity: 1.45,
    },
    {
      country: "Morocco",
      year: 2023,
      solar_electricity: 2.05,
    },

    // South Africa
    {
      country: "South Africa",
      year: 2000,
      solar_electricity: 0.01,
    },
    {
      country: "South Africa",
      year: 2001,
      solar_electricity: 0.01,
    },
    {
      country: "South Africa",
      year: 2002,
      solar_electricity: 0.01,
    },
    {
      country: "South Africa",
      year: 2003,
      solar_electricity: 0.01,
    },
    {
      country: "South Africa",
      year: 2004,
      solar_electricity: 0.02,
    },
    {
      country: "South Africa",
      year: 2005,
      solar_electricity: 0.02,
    },
    {
      country: "South Africa",
      year: 2006,
      solar_electricity: 0.02,
    },
    {
      country: "South Africa",
      year: 2007,
      solar_electricity: 0.02,
    },
    {
      country: "South Africa",
      year: 2008,
      solar_electricity: 0.02,
    },
    {
      country: "South Africa",
      year: 2009,
      solar_electricity: 0.02,
    },
    {
      country: "South Africa",
      year: 2010,
      solar_electricity: 0.03,
    },
    {
      country: "South Africa",
      year: 2011,
      solar_electricity: 0.08,
    },
    {
      country: "South Africa",
      year: 2012,
      solar_electricity: 0.09,
    },
    {
      country: "South Africa",
      year: 2013,
      solar_electricity: 0.24,
    },
    {
      country: "South Africa",
      year: 2014,
      solar_electricity: 1.07,
    },
    {
      country: "South Africa",
      year: 2015,
      solar_electricity: 2.75,
    },
    {
      country: "South Africa",
      year: 2016,
      solar_electricity: 3.27,
    },
    {
      country: "South Africa",
      year: 2017,
      solar_electricity: 4.24,
    },
    {
      country: "South Africa",
      year: 2018,
      solar_electricity: 4.57,
    },
    {
      country: "South Africa",
      year: 2019,
      solar_electricity: 4.9,
    },
    {
      country: "South Africa",
      year: 2020,
      solar_electricity: 5.7,
    },
    {
      country: "South Africa",
      year: 2021,
      solar_electricity: 6.78,
    },
    {
      country: "South Africa",
      year: 2022,
      solar_electricity: 10.13,
    },
    {
      country: "South Africa",
      year: 2023,
      solar_electricity: 15.57,
    },

    // Egypt
    {
      country: "Egypt",
      year: 2000,
      solar_electricity: 0,
    },
    {
      country: "Egypt",
      year: 2001,
      solar_electricity: 0,
    },
    {
      country: "Egypt",
      year: 2002,
      solar_electricity: 0,
    },
    {
      country: "Egypt",
      year: 2003,
      solar_electricity: 0,
    },
    {
      country: "Egypt",
      year: 2004,
      solar_electricity: 0,
    },
    {
      country: "Egypt",
      year: 2005,
      solar_electricity: 0,
    },
    {
      country: "Egypt",
      year: 2006,
      solar_electricity: 0,
    },
    {
      country: "Egypt",
      year: 2007,
      solar_electricity: 0,
    },
    {
      country: "Egypt",
      year: 2008,
      solar_electricity: 0,
    },
    {
      country: "Egypt",
      year: 2009,
      solar_electricity: 0,
    },
    {
      country: "Egypt",
      year: 2010,
      solar_electricity: 0.03,
    },
    {
      country: "Egypt",
      year: 2011,
      solar_electricity: 0.24,
    },
    {
      country: "Egypt",
      year: 2012,
      solar_electricity: 0.5,
    },
    {
      country: "Egypt",
      year: 2013,
      solar_electricity: 0.03,
    },
    {
      country: "Egypt",
      year: 2014,
      solar_electricity: 0.14,
    },
    {
      country: "Egypt",
      year: 2015,
      solar_electricity: 0.04,
    },
    {
      country: "Egypt",
      year: 2016,
      solar_electricity: 0.23,
    },
    {
      country: "Egypt",
      year: 2017,
      solar_electricity: 0.6,
    },
    {
      country: "Egypt",
      year: 2018,
      solar_electricity: 0.55,
    },
    {
      country: "Egypt",
      year: 2019,
      solar_electricity: 1.49,
    },
    {
      country: "Egypt",
      year: 2020,
      solar_electricity: 4.45,
    },
    {
      country: "Egypt",
      year: 2021,
      solar_electricity: 5.08,
    },
    {
      country: "Egypt",
      year: 2022,
      solar_electricity: 5.03,
    },
    {
      country: "Egypt",
      year: 2023,
      solar_electricity: 4.67,
    },
  ];

  const width = chartDimensions.width || 800;
  const height = chartDimensions.height || 500;
  const margin = {
    top: 50,
    right: screenSize === "small" ? 20 : 10,
    bottom: screenSize === "small" ? 120 : 100,
    left: screenSize === "small" ? 60 : 80,
  };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const years = [...new Set(data.map((d) => d.year))];
  const countries = [...new Set(data.map((d) => d.country))];
  const color = d3
    .scaleOrdinal()
    .domain(countries)
    .range(["#ff9e4a", "#1f77b4", "#2ca02c", "#d62728", "#9467bd"]);

  // Setup scales and generators
  const xScale = useMemo(() => {
    return d3
      .scaleLinear()
      .domain(d3.extent(data, (d) => d.year))
      .range([0, innerWidth])
      .nice();
  }, [data, innerWidth]);

  // Create X axis ticks - reduce number for better visibility
  const xTicks = useMemo(() => {
    const allYears = [...new Set(data.map((d) => d.year))];
    // For years 2000-2023, show only every 4th or 5th year on mobile, every 2nd or 3rd year otherwise
    const step = screenSize === "small" ? 5 : 2;
    return allYears.filter((_, index) => index % step === 0);
  }, [data, screenSize]);

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
          width: containerWidth, // 90% of container width
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

  // Initialize visible countries
  useEffect(() => {
    const initialVisibility = {};
    countries.forEach((country) => {
      initialVisibility[country] = true;
    });
    setVisibleCountries(initialVisibility);
  }, []);

  const getLegendLayout = () => {
    if (screenSize === "small") {
      // Stack vertically on mobile, 2 columns
      const itemsPerRow = 2;
      const itemWidth = innerWidth / itemsPerRow;
      return countries.map((country, i) => ({
        country,
        x: (i % itemsPerRow) * itemWidth,
        y: Math.floor(i / itemsPerRow) * 30,
      }));
    } else if (screenSize === "medium") {
      // 3 columns on medium screens
      const itemsPerRow = 3;
      const itemWidth = innerWidth / itemsPerRow;
      return countries.map((country, i) => ({
        country,
        x: (i % itemsPerRow) * itemWidth,
        y: Math.floor(i / itemsPerRow) * 30,
      }));
    } else {
      // Single row on large screens
      const itemWidth = innerWidth / countries.length;
      return countries.map((country, i) => ({
        country,
        x: i * itemWidth,
        y: 0,
      }));
    }
  };

  const legendLayout = getLegendLayout();

  return (
    <svg
      ref={chartContainerRef}
      width={width}
      height={height}
      className={`${
        isFullscreen
          ? "w-full h-full fixed inset-0 z-50 max-w-none rounded-none"
          : ""
      } bg-white `}
    >
      <g transform={`translate(${margin.left}, ${margin.top})`}>
        {/* X Grid & Labels */}
        {xTicks.map((year, index) => (
          <g key={`x-${year}-${index}`}>
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
              fill="#555"
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
            strokeWidth={
              activeCountry === null || activeCountry === group.country
                ? screenSize === "small"
                  ? 1.5
                  : 3
                : 1
            }
            opacity={
              activeCountry === null || activeCountry === group.country
                ? 1
                : 0.3
            }
          />
        ))}

        {/* Dots */}
        {grouped.map((group) =>
          group.values.map((d, i) => (
            <circle
              key={`${group.country}-${i}`}
              opacity={
                activeCountry === null || activeCountry === group.country
                  ? 1
                  : 0.3
              }
              cx={xScale(d.year)}
              cy={yScale(d.solar_electricity)}
              r={screenSize === "small" ? 1.5 : 4}
              fill={color(group.country)}
              onMouseEnter={() =>
                setTooltip({
                  x: xScale(d.year),
                  y: yScale(d.solar_electricity),
                  country: d.country,
                  year: d.year,
                  solar_electricity: d.solar_electricity,
                })
              }
              onMouseLeave={() => setTooltip(null)}
            />
          ))
        )}

        {/* Title */}
        {isFullscreen && (
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
        )}

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

      {/* Responsive Legend at Bottom */}
      <g
        transform={`translate(${margin.left}, ${
          innerHeight + margin.top + 40
        })`}
      >
        {legendLayout.map(({ country, x, y }) => (
          <g
            key={country}
            transform={`translate(${x}, ${y})`}
            onMouseEnter={() => setActiveCountry(country)}
            onMouseLeave={() => setActiveCountry(null)}
            onClick={() => toggleCountryVisibility(country)}
            style={{ cursor: "pointer" }}
          >
            <rect
              width={15}
              height={15}
              fill={color(country)}
              opacity={1}
              stroke={activeCountry === country ? "#999" : "none"}
              strokeWidth={2}
              style={{ transition: "opacity 0.3s, stroke 0.3s" }}
            />
            <text
              x={20}
              y={12}
              fontSize={screenSize === "small" ? 11 : 13}
              fill="#333"
              opacity={visibleCountries[country] ? 1 : 0.5}
              style={{ transition: "opacity 0.3s" }}
            >
              {screenSize === "small" && country === "South Africa"
                ? "S. Africa"
                : country}
            </text>
          </g>
        ))}
      </g>

      {/* tooltip */}
      {tooltip && (
        <foreignObject
          x={
            screenSize === "small"
              ? "calc(50% - 128px)"
              : tooltip.x + 700 > window.innerWidth
              ? `${tooltip.x - 60}px`
              : `${tooltip.x + margin.left + 10}px`
          }
          // x={tooltip.x + margin.left + 10}

          y={tooltip.y + margin.top - 30}
          width={120}
          height={150}
        >
          <div
            xmlns="http://www.w3.org/1999/xhtml"
            style={{
              background: "white",
              border: "1px solid #ccc",
              borderRadius: "4px",
              padding: "5px 8px",
              fontSize: 12,
              pointerEvents: "none",
            }}
          >
            <div>
              <strong>{tooltip.country}</strong>
            </div>
            <div>Year: {tooltip.year}</div>
            <div>Solar: {tooltip.solar_electricity} TWh</div>
          </div>
        </foreignObject>
      )}
    </svg>
  );
};

export default SolarElectricityChart;
