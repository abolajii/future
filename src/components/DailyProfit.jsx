import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { TradingSchedule } from "../utils/tradingUtils";
import useAuthStore from "../store/authStore";
import { getAllDeposits } from "../api/request";

const TableWrapper = styled.div`
  overflow-x: auto;
`;

const Container = styled.div`
  background: #1a1b1e;
  border-radius: 12px;
  color: #ffffff;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 2rem;
`;

const Th = styled.th`
  text-align: left;
  padding: 1rem;
  background: #25262b;
  color: #a0a0a0;
  font-weight: 500;
  &:first-child {
    border-top-left-radius: 8px;
  }
  &:last-child {
    border-top-right-radius: 8px;
  }
`;

const Td = styled.td`
  padding: 1rem;
  border-bottom: 1px solid #2c2d30;
  color: #ffffff;
`;

const TableRow = styled.tr`
  &:hover {
    background: rgba(255, 255, 255, 0.05);
  }
`;

const StatusBadge = styled.span`
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.875rem;
  background-color: ${(props) => {
    switch (props.status) {
      case "completed":
        return "#065f46";
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
        return "#a1ebc9";
      case "not-started":
        return "#c5221f";
      case "awaiting":
        return "#f57c00";
      default:
        return "#666666";
    }
  }};
`;

const ProfitCell = styled(Td)`
  ${(props) =>
    props.signalPassed &&
    `
    color: #28a745;
    font-weight: 500;
  `}
`;

const DailyProfit = ({ formatAmount }) => {
  const { user } = useAuthStore();
  const [startingCapital, setStartingCapital] = useState(user.weekly_capital);
  const [weeklyData, setWeeklyData] = useState([]);
  const [lastWeekEndDate, setLastWeekEndDate] = useState(null);
  const [deposits, setDeposits] = useState([]);

  const fetchDeposits = async () => {
    try {
      const response = await getAllDeposits();
      setDeposits(response.deposits);
    } catch (error) {
      console.error("Error fetching deposits:", error);
    }
  };

  useEffect(() => {
    fetchDeposits();
  }, []);

  const generateWeeklyData = () => {
    const trading = new TradingSchedule(); // You'll need to import your Trading class

    // const deposit = {
    //   amount: 300,
    //   date: "2025-02-22",
    //   depositBonus: 0,
    //   whenDepositHappened: "inbetween-trade",
    // };

    const formattedDeposits = deposits.map((d) => ({
      dateOfDeposit: d.date.split("T")[0],
      amount: d.amount,
      depositBonus: d.bonus,
      whenDepositHappened: d.whenDeposited,
    }));

    const newWeeklyData = trading.generateWeeklyDetails(
      formattedDeposits,
      startingCapital,
      lastWeekEndDate
    );
    setWeeklyData(newWeeklyData);
  };

  useEffect(() => {
    generateWeeklyData();
  }, [deposits]);

  return (
    <Container>
      <TableWrapper>
        <Table>
          <thead>
            <tr>
              <Th>Date</Th>
              <Th>Signal 1 Capital</Th>
              <Th>Signal 1 Profit</Th>
              <Th>Signal 2 Capital</Th>
              <Th>Signal 2 Profit</Th>
              <Th>Total Profit</Th>
              <Th>Final Balance</Th>
              <Th>Status</Th>
            </tr>
          </thead>
          <tbody>
            {weeklyData.map((day, index) => (
              <tr key={index}>
                <Td>{day.date}</Td>
                {/* <Td>{formatAmount(day.balanceBeforeFirstTrade)}</Td> */}
                <Td>{formatAmount(day.signal1Capital)}</Td>
                <ProfitCell signalPassed={day.firstSignalPassed}>
                  {formatAmount(day.signal1Profit)}
                </ProfitCell>
                <Td>{formatAmount(day.signal2Capital)}</Td>
                <ProfitCell signalPassed={day.secondSignalPassed}>
                  {formatAmount(day.signal2Profit)}
                </ProfitCell>
                <ProfitCell signalPassed={day.secondSignalPassed}>
                  {formatAmount(day.totalProfit)}
                </ProfitCell>

                <Td>{formatAmount(day.balanceAfterSecondTrade)}</Td>
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
      </TableWrapper>
    </Container>
  );
};

export default DailyProfit;
