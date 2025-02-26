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
import { getRevenue, getExpenses } from "../api/request";

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
  flex: 1.95;
  /* height: 500px; */
  /* margin: auto; */
`;

const LoadingMessage = styled.div`
  color: white;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
`;

const Charts = () => {
  const [monthlyData, setMonthlyData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Convert long month names to short month names
  const getShortMonth = (longMonth) => {
    const monthMap = {
      January: "Jan",
      February: "Feb",
      March: "Mar",
      April: "Apr",
      May: "May",
      June: "Jun",
      July: "Jul",
      August: "Aug",
      September: "Sep",
      October: "Oct",
      November: "Nov",
      December: "Dec",
    };
    return monthMap[longMonth] || longMonth;
  };

  // Convert date string to month
  const getMonthFromDate = (dateString) => {
    const date = new Date(dateString);
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    return monthNames[date.getMonth()];
  };

  // Process withdrawal data to monthly format
  const processWithdrawals = (withdrawals) => {
    // Group withdrawals by month
    const expensesByMonth = {};

    withdrawals.forEach((withdrawal) => {
      const month = getMonthFromDate(withdrawal.date);

      if (!expensesByMonth[month]) {
        expensesByMonth[month] = 0;
      }

      expensesByMonth[month] += withdrawal.amount;
    });

    return expensesByMonth;
  };

  // Ensure all 12 months are represented
  const ensureAllMonths = (data) => {
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const result = [];

    // Create a map for faster lookups
    const dataMap = {};
    data.forEach((item) => {
      dataMap[item.month] = item;
    });

    // Ensure all months exist
    months.forEach((month) => {
      if (dataMap[month]) {
        result.push(dataMap[month]);
      } else {
        // Add empty data for missing months
        result.push({
          month: month,
          revenue: 0,
          expenses: 0,
        });
      }
    });

    return result;
  };

  // Fetch data for monthly revenue and expenses
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch both revenue and expenses data
        const revenueResponse = await getRevenue();
        const expensesResponse = await getExpenses();

        // Get data arrays
        const revenueData = revenueResponse.data || [];
        const withdrawalData = [];

        // Process withdrawal data into monthly format
        const monthlyWithdrawals = processWithdrawals(withdrawalData);

        // Create a map to combine data
        const combinedDataMap = {};

        // Process revenue data
        revenueData.forEach((item) => {
          const shortMonth = getShortMonth(item.month);
          if (!combinedDataMap[shortMonth]) {
            combinedDataMap[shortMonth] = {
              month: shortMonth,
              revenue: item.total_revenue || 0,
              expenses: 0,
            };
          } else {
            combinedDataMap[shortMonth].revenue = item.total_revenue || 0;
          }
        });

        // Add withdrawal data to combined map
        Object.keys(monthlyWithdrawals).forEach((month) => {
          if (!combinedDataMap[month]) {
            combinedDataMap[month] = {
              month: month,
              revenue: 0,
              expenses: monthlyWithdrawals[month],
            };
          } else {
            combinedDataMap[month].expenses = monthlyWithdrawals[month];
          }
        });

        // Convert to array
        let formattedData = Object.values(combinedDataMap);

        // Ensure all months are represented
        formattedData = ensureAllMonths(formattedData);

        setMonthlyData(formattedData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Calculate max value for Y-axis scaling (with a minimum of 1000)
  const maxValue =
    monthlyData.length > 0
      ? Math.max(
          ...monthlyData.map((d) => d.revenue || 0),
          ...monthlyData.map((d) => d.expenses || 0),
          6000 // Ensure minimum scale
        )
      : 1000;

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        ticks: { color: "#ffffff" },
        grid: { color: "rgba(255, 255, 255, 0.2)" },
      },
      y: {
        beginAtZero: true,
        max: Math.ceil(maxValue / 1000) * 1000, // Round to next thousand
        grid: { color: "rgba(255, 255, 255, 0.2)" },
        ticks: {
          color: "#ffffff",
          callback: (value) => `$${value.toLocaleString()}`,
        },
      },
    },
    plugins: {
      legend: {
        display: true,
        position: "top",
        labels: {
          color: "#ffffff",
        },
      },
      tooltip: {
        callbacks: {
          label: (context) => `$${context.raw.toLocaleString()}`,
        },
      },
    },
  };

  const data = {
    labels: monthlyData.map((d) => d.month),
    datasets: [
      {
        label: "Revenue",
        data: monthlyData.map((d) => d.revenue || 0),
        backgroundColor: "rgba(75, 192, 77, 0.9)", // Light green bars
        borderColor: "#50ed3b",
        borderWidth: 1,
      },
      {
        label: "Withdrawals",
        data: monthlyData.map((d) => d.expenses || 0),
        backgroundColor: "rgba(255, 99, 132, 0.9)", // Red bars for withdrawals
        borderColor: "#ff6384",
        borderWidth: 1,
      },
    ],
  };

  return (
    <ChartContainer>
      {loading ? (
        <LoadingMessage>Loading financial data...</LoadingMessage>
      ) : (
        <Bar data={data} options={options} />
      )}
    </ChartContainer>
  );
};

export default Charts;
