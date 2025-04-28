import { csv, max, scaleBand, scaleLinear } from "d3";
import React, { useState, useEffect } from "react";

const AfricasSolarSurge = () => {
  const width = 900;
  const height = 500;

  const margins = { top: 20, right: 30, bottom: 40, left: 120 };
  const innerWidth = width - margins.left - margins.right;
  const innerHeight = height - margins.top - margins.bottom;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const res = (
        await csv("/assets/data/energyData.csv", (d) => {
          if (d.year === "2020") {
            return {
              country: d.country,
              year: +d.year,
              solar_consumption: +d.solar_consumption || 0,
            };
          }
        })
      ).filter(Boolean);

      setData(res);
      setLoading(false);
    } catch (error) {
      console.log("Error fetching data:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) return <div>Loading...</div>;

  const xScale = scaleLinear()
    .domain([0, max(data, (d) => d.solar_consumption)])
    .range([0, innerWidth]);

  const yScale = scaleBand()
    .domain(data.map((d) => d.country))
    .range([0, innerHeight])
    .padding(0.1);

  return (
    <div>
      AfricasSolarSurge
      <svg width={width} height={height}>
        <g transform={`translate(${margins.left},${margins.top})`}>
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
        </g>
      </svg>
    </div>
  );
};

export default AfricasSolarSurge;
