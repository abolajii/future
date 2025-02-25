import {
  ArrowLeft,
  ArrowRight,
  ArrowUpCircle,
  BarChart2,
  Calendar,
  TrendingUp,
  Wallet,
} from "lucide-react";
import React, { useEffect, useState } from "react";

import styled from "styled-components";
import { TradingSchedule } from "../utils/tradingUtils";
import useAuthStore from "../store/authStore";
import { getAllDeposits } from "../api/request";

const Container = styled.div``;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 0.5rem;

  @media (max-width: 768px) {
    flex-direction: row;
    width: 100%;

    button {
      flex: 1;
    }
  }
`;

const Button = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background-color: #2d2d2d;
  color: white;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: background-color 0.2s;
  white-space: nowrap;

  &:hover {
    background-color: #3d3d3d;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  @media (max-width: 768px) {
    font-size: 0.875rem;
    padding: 0.5rem;
  }
`;

const CurrencyToggle = styled.button`
  background: ${(props) => (props.active ? "#4c6ef5" : "#2c2d30")};
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  margin-right: 0.5rem;
  transition: background-color 0.2s;

  &:hover {
    background: ${(props) => (props.active ? "#4c6ef5" : "#3c3d40")};
  }
`;

const ToggleContainer = styled.div`
  margin-bottom: 1rem;
  display: flex;
  gap: 0.5rem;
`;

const Widget = styled.div`
  background-color: #2d2d2d;
  padding: 1.25rem;
  border-radius: 1rem;

  ${(props) =>
    props.fullWidth &&
    `
    @media (min-width: 768px) {
      grid-column: 1 / -1;
    }
  `}
`;

const WidgetGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;

  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  }
`;

const CalendarWidget = styled.div`
  ${(props) =>
    props.fullWidth &&
    `
    @media (min-width: 768px) {
      grid-column: 1 / -1;
    }
  `}
`;

const WidgetHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
`;

const WidgetTitle = styled.h3`
  color: #a0a0a0;
  margin: 0;
  font-size: 0.875rem;

  @media (min-width: 768px) {
    font-size: 1rem;
  }
`;

const WidgetValue = styled.p`
  font-size: 1.25rem;
  font-weight: bold;
  color: ${(props) => props.color || "white"};
  margin: 0;

  @media (min-width: 768px) {
    font-size: 1.5rem;
  }
`;

const DetailValue = styled.p`
  font-weight: bold;
  font-size: 0.875rem;

  @media (min-width: 768px) {
    font-size: 1rem;
  }
`;

const DailyReportGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const DailyReport = styled.div`
  background-color: #2d2d2d;
  padding: 1.25rem;
  border-radius: 1rem;

  @media (min-width: 768px) {
    padding: 1.5rem;
  }
`;
const DailyReportHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: start;
  margin-bottom: 1rem;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

const DayTitle = styled.h3`
  color: white;
  font-size: 1.125rem;
  font-weight: bold;
  margin: 0;

  @media (min-width: 768px) {
    font-size: 1.25rem;
  }
`;

const DetailGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;

  @media (min-width: 768px) {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  }
`;
const DetailSection = styled.div`
  color: white;
`;

const DetailLabel = styled.div`
  color: #a0a0a0;
  margin-bottom: 0.25rem;
`;

// const DetailValue = styled.p`
//   font-weight: bold;
//   margin: 0;
//   font-size: 0.875rem;

//   @media (min-width: 768px) {
//     font-size: 1rem;
//   }
// `;

const SignalDetails = styled.div`
  display: flex;
  gap: 1rem;
`;

const DepositInfo = styled.div`
  margin-top: 1rem;
  padding: 1rem;
  background-color: rgba(59, 130, 246, 0.1);
  border-radius: 0.5rem;
`;
const ProfitCell = styled.div`
  border-bottom: 1px solid #2c2d30;
  color: #ffffff;
  font-weight: bold;

  ${(props) =>
    props.signalPassed &&
    `
    color: #28a745;
  `}
`;

const StatusTag = styled.span`
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.6rem;
  font-weight: 500;
  display: inline-flex;
  align-items: center;

  ${(props) => {
    switch (props.$status.toLowerCase()) {
      case "not started":
      case "awaiting next signal":
        return `
          background-color: #416cc1d8;
          color: #bbc2ff;
        `;
      case "pending":
        return `
          background-color: #374151;
          color: #9CA3AF;
        `;
      case "inprogress":
        return `
          background-color: #854D0E;
          color: #FDE68A;
        `;
      case "done":
      case "completed":
        return `
      background-color: #065F46;
          color: #A7F3D0;
        `;
      default:
        return `
          background-color: #374151;
          color: #9CA3AF;
        `;
    }
  }}
`;

const formatWeekDateRange = (weekDetails) => {
  if (!weekDetails || weekDetails.length === 0) return "";

  const firstDay = weekDetails[0]?.date;
  const lastDay = weekDetails[6]?.date;

  return `${firstDay} - ${lastDay}`;
};

const WeeklyDetails = ({ weeklyData, setWeeklyData }) => {
  const { user } = useAuthStore();
  const [currency, setCurrency] = useState("USD");
  const [startingCapital, setStartingCapital] = useState(user.weekly_capital);
  const [trading] = useState(new TradingSchedule()); // You'll need to import your Trading class
  const [deposits, setDeposits] = useState([]);
  const [weekOffset, setWeekOffset] = useState(0);

  const formattedDeposits = deposits.map((d) => ({
    dateOfDeposit: d.date.split("T")[0],
    amount: d.amount,
    depositBonus: d.bonus,
    whenDepositHappened: d.whenDeposited,
  }));

  const formatAmount = (value = 0, nairaRate = 1600) => {
    const options = {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    };

    const amount = currency === "NGN" ? value * nairaRate : value;
    const formattedAmount = amount.toLocaleString("en-US", options);
    return `${currency === "NGN" ? "₦" : "$"}${formattedAmount}`;
  };

  const handleCurrencyToggle = (newCurrency) => {
    setCurrency(newCurrency);
  };
  // const [lastWeekEndDate, setLastWeekEndDate] = useState(null);
  const lastWeekEndDate = weeklyData[weeklyData.length - 1];

  const navigateWeek = (direction) => {
    const newWeeklyData = trading.generateSevenDaysDetails(
      startingCapital,
      formattedDeposits,
      lastWeekEndDate
    );
  };

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
    // const deposit = {
    //   amount: 1000,
    //   dateOfDeposit: "2025-02-23",
    //   whenDepositHappened: "inbetween-trade",
    //   depositBonus: 0,
    // };

    const newWeeklyData = trading.generateWeeklyDetails(
      formattedDeposits,
      startingCapital
    );
    setWeeklyData(newWeeklyData);
  };

  useEffect(() => {
    generateWeeklyData();
  }, [deposits]);

  const totalSignal1Profit = weeklyData.reduce(
    (sum, day) => sum + day.signal1Profit,
    0
  );
  const totalSignal2Profit = weeklyData.reduce(
    (sum, day) => sum + day.signal2Profit,
    0
  );

  const totalProfit = totalSignal1Profit + totalSignal2Profit;

  const weeklySummary =
    weeklyData.length > 0
      ? {
          runningCapital: weeklyData[0].startingCapital,
          startingCapital: weeklyData[0].startingCapital,
          totalWeeklyProfit: weeklyData.reduce(
            (sum, day) => sum + day.totalProfit,
            0
          ),
          totalSignal1Profit: weeklyData.reduce(
            (sum, day) => sum + day.signal1Profit,
            0
          ),
          totalSignal2Profit: weeklyData.reduce(
            (sum, day) => sum + day.signal2Profit,
            0
          ),
          finalBalance: weeklyData[6]?.balanceAfterSecondTrade || 0,
        }
      : null;

  return (
    <Container>
      <Header>
        <p>Weekly Details</p>
        <ButtonGroup>
          <Button
            onClick={() => navigateWeek("prev")}
            // disabled={weekOffset === 0}
          >
            <ArrowLeft size={20} /> Previous Week
          </Button>
          <Button
          //    onClick={() => navigateWeek("next")}
          >
            Next Week <ArrowRight size={20} />
          </Button>
        </ButtonGroup>
        <ToggleContainer>
          <CurrencyToggle
            active={currency === "USD"}
            onClick={() => handleCurrencyToggle("USD")}
          >
            USD
          </CurrencyToggle>
          <CurrencyToggle
            active={currency === "NGN"}
            onClick={() => handleCurrencyToggle("NGN")}
          >
            NGN
          </CurrencyToggle>
        </ToggleContainer>
      </Header>
      <WidgetGrid>
        <CalendarWidget>
          <WidgetHeader>
            <Calendar color="#a78bfa" />
            <WidgetTitle>
              {weekOffset === 0 ? "Current " : weekOffset + " "}
              Week Days
            </WidgetTitle>
          </WidgetHeader>
          <DetailValue color="#a78bfa">
            {formatWeekDateRange(weeklyData)}
          </DetailValue>
        </CalendarWidget>
      </WidgetGrid>
      <WidgetGrid>
        <Widget>
          <WidgetHeader>
            <Wallet color="#60a5fa" />
            <WidgetTitle>Starting Capital</WidgetTitle>
          </WidgetHeader>
          <WidgetValue>
            {formatAmount(
              weeklySummary?.startingCapital || user.starting_capital
            )}
          </WidgetValue>
        </Widget>

        <Widget>
          <WidgetHeader>
            <TrendingUp color="#4ade80" />
            <WidgetTitle>Weekly Profit</WidgetTitle>
          </WidgetHeader>
          <WidgetValue color="#4ade80">{formatAmount(totalProfit)}</WidgetValue>
        </Widget>

        <Widget>
          <WidgetHeader>
            <ArrowUpCircle color="#a78bfa" />
            <WidgetTitle>Signal 1 Profits</WidgetTitle>
          </WidgetHeader>
          <WidgetValue color="#a78bfa">
            {formatAmount(weeklySummary?.totalSignal1Profit)}
          </WidgetValue>
        </Widget>

        <Widget>
          <WidgetHeader>
            <ArrowUpCircle color="#818cf8" />
            <WidgetTitle>Signal 2 Profits</WidgetTitle>
          </WidgetHeader>
          <WidgetValue color="#818cf8">
            {formatAmount(weeklySummary?.totalSignal2Profit)}
          </WidgetValue>
        </Widget>

        <Widget>
          <WidgetHeader>
            <BarChart2 color="#fbbf24" />
            <WidgetTitle>Final Balance</WidgetTitle>
          </WidgetHeader>
          <WidgetValue color="#fbbf24">
            {formatAmount(weeklySummary?.finalBalance)}
          </WidgetValue>
        </Widget>
      </WidgetGrid>
      <DailyReportGrid>
        {weeklyData.map((day, index) => {
          const status =
            day.firstSignalPassed && day.secondSignalPassed
              ? "completed"
              : day.firstSignalPassed && !day.secondSignalPassed
              ? "awaiting next signal"
              : "pending";
          return (
            <DailyReport key={day.day}>
              <DailyReportHeader>
                <div>
                  <DayTitle>
                    {day.date} {day.month}
                  </DayTitle>
                  <StatusTag $status={status}>
                    {status.toLocaleUpperCase()}
                  </StatusTag>
                </div>
                <ProfitCell signalPassed={day.secondSignalPassed}>
                  {formatAmount(day.totalProfit)}
                </ProfitCell>
              </DailyReportHeader>

              <DetailGrid>
                <DetailSection>
                  <DetailLabel>Starting Capital</DetailLabel>
                  <DetailValue>{formatAmount(day.startingCapital)}</DetailValue>
                </DetailSection>

                <DetailSection>
                  <DetailLabel>Signal 1</DetailLabel>
                  <SignalDetails>
                    <div>
                      <DetailLabel>Capital</DetailLabel>
                      <DetailValue>
                        {formatAmount(day.signal1Capital)}
                      </DetailValue>
                    </div>
                    <div>
                      <DetailLabel>Profit</DetailLabel>
                      <DetailValue style={{ color: "#4ade80" }}>
                        <ProfitCell signalPassed={day.firstSignalPassed}>
                          {formatAmount(day.signal1Profit)}
                        </ProfitCell>
                      </DetailValue>
                    </div>
                  </SignalDetails>
                </DetailSection>

                <DetailSection>
                  <DetailLabel>Signal 2</DetailLabel>
                  <SignalDetails>
                    <div>
                      <DetailLabel>Capital</DetailLabel>
                      <DetailValue>
                        {formatAmount(day.signal2Capital)}
                      </DetailValue>
                    </div>
                    <div>
                      <DetailLabel>Profit</DetailLabel>
                      <DetailValue style={{ color: "#4ade80" }}>
                        <ProfitCell signalPassed={day.secondSignalPassed}>
                          {formatAmount(day.signal2Profit)}
                        </ProfitCell>
                      </DetailValue>
                    </div>
                  </SignalDetails>
                </DetailSection>
              </DetailGrid>

              {day.depositInfo && (
                <DepositInfo>
                  <DetailLabel style={{ color: "#60a5fa", fontWeight: "bold" }}>
                    Deposit Information
                  </DetailLabel>
                  <DetailGrid>
                    <div>
                      <DetailLabel>Amount</DetailLabel>
                      <DetailValue>
                        {formatAmount(day.depositInfo.amount)}
                      </DetailValue>
                    </div>
                    <div>
                      <DetailLabel>Bonus</DetailLabel>
                      <DetailValue style={{ color: "#4ade80" }}>
                        {formatAmount(day.depositInfo.depositBonus)}
                      </DetailValue>
                    </div>
                    <div>
                      <DetailLabel>When</DetailLabel>
                      <DetailValue>
                        {day.depositInfo.whenDepositHappened}
                      </DetailValue>
                    </div>
                  </DetailGrid>
                </DepositInfo>
              )}
            </DailyReport>
          );
        })}
      </DailyReportGrid>
    </Container>
  );
};

export default WeeklyDetails;
