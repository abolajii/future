import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import styled from "styled-components";
import { getRevenue } from "../api/request";

// Register chart.js components
ChartJS.register(
  BarElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend
);

const ChartContainer = styled.div`
  /* width: 100%; */
  flex: 1.95;
  height: 500px;
  margin: auto;
`;

const options = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    x: {
      ticks: { color: "#ffffff" }, // White labels
      grid: { color: "rgba(255, 255, 255, 0.2)" }, // Soft grid lines
    },
    y: {
      beginAtZero: true,
      max: 5000,
      grid: { color: "rgba(255, 255, 255, 0.2)" }, // Soft grid lines

      ticks: {
        color: "#ffffff",
        callback: (value) => `$${value.toLocaleString()}`, // Format as currency
      },
    },
  },
  plugins: {
    legend: {
      display: true,
      position: "top",
    },
    tooltip: {
      callbacks: {
        label: (context) => `$${context.raw.toLocaleString()}`, // Format tooltip
      },
    },
  },
};

const Charts = () => {
  const [monthlyData, setMonthlyData] = useState([]);

  // Fetch data for monthly revenue from your API here
  React.useEffect(() => {
    const fetchMonthlyRevenue = async () => {
      const response = await getRevenue();
      const data = response.data;
      const formattedData = data.map((r) => ({
        month: r.month,
        revenue: r.total_revenue,
      }));
      setMonthlyData(formattedData);
    };

    fetchMonthlyRevenue();
  }, []);

  const data = {
    labels: monthlyData.map((d) => d.month),
    datasets: [
      {
        label: "Monthly Revenue ($)",
        data: monthlyData.map((d) => d.revenue),
        backgroundColor: "rgba(75, 192, 77, 0.9)", // Light green bars
        borderColor: "#50ed3b",
        borderWidth: 1,
      },
    ],
  };

  useEffect(() => {
    const fetchMonthlyRevenue = async () => {};

    fetchMonthlyRevenue();
  }, []);

  return (
    <ChartContainer>
      <Bar data={data} options={options} />
    </ChartContainer>
  );
};

export default Charts;
