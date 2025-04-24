import React, { useState, useEffect } from "react";
import html2canvas from "html2canvas";
import { saveAs } from "file-saver";
import BarChart from "./BarChart";
import { Navbar } from "../../components";

const AppTest = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching data from API
    const fetchData = async () => {
      try {
        // In a real application, this would be an API call
        // For now, let's use sample data
        const sampleData = [
          {
            Country: "China",
            Region: "Asia",
            1950: 554419000,
            1960: 660408000,
            1970: 827601000,
            1980: 1000089000,
            1990: 1172445000,
            2000: 1290550000,
            2010: 1368811000,
            2020: 1424929000,
          },
          {
            Country: "India",
            Region: "Asia",
            1950: 376325000,
            1960: 450548000,
            1970: 555189000,
            1980: 696783000,
            1990: 873277000,
            2000: 1056576000,
            2010: 1234281000,
            2020: 1396387000,
          },
          {
            Country: "United States",
            Region: "North America",
            1950: 158804000,
            1960: 186176000,
            1970: 209464000,
            1980: 229476000,
            1990: 252120000,
            2000: 282398000,
            2010: 311182000,
            2020: 335942000,
          },
          {
            Country: "Indonesia",
            Region: "Asia",
            1950: 79538000,
            1960: 97085000,
            1970: 120998000,
            1980: 150938000,
            1990: 182156000,
            2000: 211540000,
            2010: 244016000,
            2020: 271857000,
          },
          {
            Country: "Pakistan",
            Region: "Asia",
            1950: 36984000,
            1960: 47120000,
            1970: 61634000,
            1980: 80492000,
            1990: 115414000,
            2000: 142344000,
            2010: 176745000,
            2020: 227196000,
          },
          {
            Country: "Brazil",
            Region: "South America",
            1950: 53975000,
            1960: 72774000,
            1970: 96056000,
            1980: 123613000,
            1990: 149004000,
            2000: 174790000,
            2010: 196796000,
            2020: 213196000,
          },
          {
            Country: "Nigeria",
            Region: "Africa",
            1950: 37860000,
            1960: 45138000,
            1970: 55982000,
            1980: 73423000,
            1990: 95212000,
            2000: 122352000,
            2010: 158503000,
            2020: 208327000,
          },
          {
            Country: "Bangladesh",
            Region: "Asia",
            1950: 41783000,
            1960: 50727000,
            1970: 67541000,
            1980: 83930000,
            1990: 107386000,
            2000: 129193000,
            2010: 148391000,
            2020: 167420000,
          },
          {
            Country: "Russia",
            Region: "Europe",
            1950: 102800000,
            1960: 119906000,
            1970: 130127000,
            1980: 139010000,
            1990: 147531000,
            2000: 146405000,
            2010: 143479000,
            2020: 145617000,
          },
          {
            Country: "Mexico",
            Region: "North America",
            1950: 28013000,
            1960: 38578000,
            1970: 50289000,
            1980: 67705000,
            1990: 81720000,
            2000: 97873000,
            2010: 112322000,
            2020: 126705000,
          },
          {
            Country: "Japan",
            Region: "Asia",
            1950: 82802000,
            1960: 92500000,
            1970: 103708000,
            1980: 116782000,
            1990: 123686000,
            2000: 126776000,
            2010: 128105000,
            2020: 126255000,
          },
          {
            Country: "Germany",
            Region: "Europe",
            1950: 68375000,
            1960: 72638000,
            1970: 77783000,
            1980: 78289000,
            1990: 79053000,
            2000: 81400000,
            2010: 82302000,
            2020: 83369000,
          },
          {
            Country: "France",
            Region: "Europe",
            1950: 41818000,
            1960: 45684000,
            1970: 50524000,
            1980: 53868000,
            1990: 56667000,
            2000: 58775000,
            2010: 62879000,
            2020: 67564000,
          },
          {
            Country: "United Kingdom",
            Region: "Europe",
            1950: 50128000,
            1960: 52372000,
            1970: 55632000,
            1980: 56265000,
            1990: 57170000,
            2000: 58850000,
            2010: 62760000,
            2020: 67281000,
          },
          {
            Country: "Italy",
            Region: "Europe",
            1950: 46599000,
            1960: 49941000,
            1970: 53822000,
            1980: 56312000,
            1990: 56719000,
            2000: 56942000,
            2010: 59277000,
            2020: 60627000,
          },
        ];

        setData(sampleData);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Regions map and colors
  const regionsMap = {};
  data.forEach((item) => {
    regionsMap[item.Country] = item.Region;
  });

  const regionColors = {
    Asia: "#4f46e5", // indigo
    "North America": "#10b981", // emerald
    "South America": "#f59e0b", // amber
    Europe: "#ef4444", // red
    Africa: "#8b5cf6", // violet
    Oceania: "#06b6d4", // cyan
  };

  // Helper functions for download handlers
  const handleDownload = (type, ref) => {
    if (type === "PNG") {
      html2canvas(ref.current).then((canvas) => {
        canvas.toBlob((blob) => {
          saveAs(blob, `population-chart-${new Date().getTime()}.png`);
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
      let csvContent = "Country,Region,Population\n";

      data.forEach((item) => {
        csvContent += `${item.Country},${item.Region},${item[currentYear]}\n`;
      });

      const csvBlob = new Blob([csvContent], {
        type: "text/csv;charset=utf-8",
      });
      saveAs(
        csvBlob,
        `population-data-${currentYear}-${new Date().getTime()}.csv`
      );
    } else if (type === "FullCSV") {
      const { data } = ref;
      const years = Object.keys(data[0]).filter((key) => !isNaN(parseInt(key)));

      let csvContent = "Country,Region," + years.join(",") + "\n";

      data.forEach((item) => {
        csvContent += `${item.Country},${item.Region},`;
        csvContent += years.map((year) => item[year]).join(",");
        csvContent += "\n";
      });

      const csvBlob = new Blob([csvContent], {
        type: "text/csv;charset=utf-8",
      });
      saveAs(csvBlob, `population-data-full-${new Date().getTime()}.csv`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">World Population Data</h1>

        <BarChart
          data={data}
          title="Population by Country"
          width={900}
          height={500}
          years={{ min: 1950, max: 2020 }}
          defaultYear={2020}
          colorByRegion={true}
          regionsMap={regionsMap}
          regionColors={regionColors}
          enableCompareMode={true}
          onDownload={handleDownload}
          enableSharing={true}
        />
      </div>
    </div>
  );
};

export default AppTest;
