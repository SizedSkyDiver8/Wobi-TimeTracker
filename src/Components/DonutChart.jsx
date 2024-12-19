import React, { useEffect, useState, useRef } from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

const DonutChart = ({ nameOfUser, closeChart }) => {
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [
      {
        data: [],
        backgroundColor: [],
      },
    ],
  });

  useEffect(() => {
    ChartJS.unregister(centerTextPlugin);
    ChartJS.register(centerTextPlugin);
  }, [nameOfUser]);

  const chartRef = useRef(null);

  const fetchData = async () => {
    try {
      const response = await fetch(
        `http://localhost:3001/getHours/${nameOfUser}`
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const months = await response.json();
      const parseHours = (timeStr) => {
        const match = timeStr.match(/(\d+)h (\d+)min/);
        if (match) {
          const hours = parseInt(match[1], 10);
          const minutes = parseInt(match[2], 10);
          return hours + minutes / 60;
        }
        return 0;
      };
      setChartData({
        labels: months.map((item) => item.month),
        datasets: [
          {
            data: months.map((item) => parseHours(item.time)),
            backgroundColor: [
              "#4D7FFF",
              "#8D6E63",
              "#9C27B0",
              "#FFC107",
              "#FF7043",
              "#FF5252",
              "#90A4AE",
              "#4DB6AC",
              "#E57373",
              "#81C784",
              "#FFD54F",
              "#9575CD",
            ],
          },
        ],
      });
    } catch (error) {
      console.error("Error fetching chart data:", error);
    }
  };

  // Custom plugin to add text in the center of the chart
  const centerTextPlugin = {
    id: "centerText",
    beforeDraw: (chart) => {
      const { width } = chart;
      const { height } = chart;
      const ctx = chart.ctx;
      ctx.restore();
      const chartText = nameOfUser || "No Data";
      const fontSize = (height / 150).toFixed(2);
      ctx.font = `${fontSize}em sans-serif`;
      ctx.fillStyle = "#333";
      ctx.textBaseline = "middle";
      const textX = Math.round((width - ctx.measureText(chartText).width) / 2);
      const textY = height / 2;
      ctx.fillText(chartText, textX, textY);
      ctx.save();
    },
  };

  // Register the custom plugin
  ChartJS.register(centerTextPlugin);

  // Fetch chart data on component mount
  useEffect(() => {
    fetchData();
  }, [nameOfUser]);

  // Close chart when clicking outside the container
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (chartRef.current && !chartRef.current.contains(event.target)) {
        closeChart(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [closeChart]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context) => `${context.label}: ${context.raw} hours`,
        },
      },
      centerText: { nameOfUser },
    },
    cutout: "60%",
  };

  return (
    <div className="donut-overlay">
      <div className="donut-chart-container" ref={chartRef}>
        <Doughnut data={chartData} options={options} />
      </div>
      <div className="donut-legend">
        <h3>Monthly Hours</h3>
        <ul>
          {chartData.labels.map((label, index) => (
            <li key={index}>
              <span
                className="legend-color"
                style={{
                  backgroundColor: chartData.datasets[0].backgroundColor[index],
                }}
              ></span>
              {label}:{" "}
              <strong>
                {chartData.datasets[0].data[index].toFixed(2) || 0} hours
              </strong>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default DonutChart;
