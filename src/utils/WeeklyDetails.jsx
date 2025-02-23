// WeeklyDetailsPage.js
import React, { useState } from "react";
import styled from "styled-components";
import { TradingSchedule } from "./tradingUtils";

const PageContainer = styled.div`
  padding: 2rem;
  margin: 0 auto;
`;

const Header = styled.header`
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 2rem;
  color: #1a1a1a;
  margin-bottom: 1rem;
`;

const ControlsSection = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
`;

const Input = styled.input`
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
`;

const Button = styled.button`
  padding: 0.5rem 1rem;
  background-color: #0066cc;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  outline: none;

  &:hover {
    background-color: #0052a3;
  }

  &:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }

  &:focus,
  &:active {
    outline: none;
  }
`;

const TabsContainer = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  border-bottom: 1px solid #ddd;
`;

const Tab = styled.button`
  padding: 0.5rem 1rem;
  border: none;
  background: none;
  cursor: pointer;
  font-size: 1rem;
  color: ${(props) => (props.active ? "#0066cc" : "#666")};
  border-bottom: 2px solid
    ${(props) => (props.active ? "#0066cc" : "transparent")};

  &:hover {
    color: #0066cc;
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 2rem;
  background-color: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const Th = styled.th`
  padding: 1rem;
  text-align: left;
  background-color: #f5f5f5;
  border-bottom: 2px solid #ddd;
  font-weight: 600;
`;

const Td = styled.td`
  padding: 1rem;
  border-bottom: 1px solid #ddd;
`;

const TotalRow = styled.tr`
  background-color: #f8f9fa;
  font-weight: 600;
`;

const StatusBadge = styled.span`
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.875rem;
  background-color: ${(props) => {
    switch (props.status) {
      case "completed":
        return "#e6f4ea";
      case "not-started":
        return "#fce8e6";
      case "awaiting":
        return "#fff8e1";
      default:
        return "#f5f5f5";
    }
  }};
  color: ${(props) => {
    switch (props.status) {
      case "completed":
        return "#137333";
      case "not-started":
        return "#c5221f";
      case "awaiting":
        return "#f57c00";
      default:
        return "#666666";
    }
  }};
`;

const WeeklyDetailsPage = () => {
  const [startingCapital, setStartingCapital] = useState(2461.3);
  const [weeklyData, setWeeklyData] = useState([]);
  const [lastWeekEndDate, setLastWeekEndDate] = useState(null);

  const generateWeeklyData = () => {
    const trading = new TradingSchedule(); // You'll need to import your Trading class

    const newWeeklyData = trading.generateWeeklyDetails(
      [],
      startingCapital,
      lastWeekEndDate
    );
    setWeeklyData(newWeeklyData);
  };

  return (
    <PageContainer>
      <Header>
        <Title>Weekly </Title>

        <ControlsSection>
          <Input
            type="number"
            value={startingCapital}
            onChange={(e) => setStartingCapital(Number(e.target.value))}
            placeholder="Starting Capital"
          />
          <Input
            type="date"
            value={lastWeekEndDate || ""}
            onChange={(e) => setLastWeekEndDate(e.target.value)}
            placeholder="Last Week End Date"
          />
          <Button onClick={generateWeeklyData}>Generate Weekly Details</Button>
        </ControlsSection>
      </Header>

      {weeklyData.length > 0 && (
        <Table>
          <thead>
            <tr>
              <Th>Date</Th>
              <Th>Starting Balance</Th>
              <Th>Signal 1 Capital</Th>
              <Th>Signal 1 Profit</Th>
              <Th>Signal 2 Capital</Th>
              <Th>Signal 2 Profit</Th>
              <Th>Total Profit</Th>
              <Th>Final Balance</Th>
              <Th>Signals Status</Th>
            </tr>
          </thead>
          <tbody>
            {weeklyData.map((day, index) => (
              <tr key={index}>
                <Td>{day.date}</Td>
                <Td>${day.balanceBeforeFirstTrade.toFixed(2)}</Td>
                <Td>${day.signal1Capital.toFixed(2)}</Td>
                <Td>${day.signal1Profit.toFixed(2)}</Td>
                <Td>${day.signal2Capital.toFixed(2)}</Td>
                <Td>${day.signal2Profit.toFixed(2)}</Td>
                <Td>${day.totalProfit.toFixed(2)}</Td>
                <Td>${day.balanceAfterSecondTrade.toFixed(2)}</Td>
                <Td>
                  <StatusBadge
                    status={
                      day.firstSignalPassed && day.secondSignalPassed
                        ? "completed"
                        : !day.firstSignalPassed && !day.secondSignalPassed
                        ? "not-started"
                        : "awaiting"
                    }
                  >
                    {day.firstSignalPassed && day.secondSignalPassed
                      ? "Completed"
                      : !day.firstSignalPassed && !day.secondSignalPassed
                      ? "Not Started"
                      : "Awaiting Signal"}
                  </StatusBadge>
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </PageContainer>
  );
};

export default WeeklyDetailsPage;
