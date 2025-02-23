import React, { useState, useEffect } from "react";
import styled from "styled-components";
import {
  TradingSchedule,
  formatCurrency,
  formatDate,
} from "./utils/tradingUtils";
import WithdrawModal from "./WithdrawModal";

const USD_TO_NGN = 1600;

const Container = styled.div`
  padding: 2rem;
`;

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  color: #1a202c;
  font-size: 1.5rem;
`;

const CurrencyButtons = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const CurrencyButton = styled.button`
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  border: none;
  cursor: pointer;
  background-color: ${(props) => (props.active ? "#3498db" : "#e2e8f0")};
  color: ${(props) => (props.active ? "white" : "#4a5568")};
`;

const MonthSection = styled.div`
  margin-bottom: 2rem;
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
`;

const MonthHeader = styled.div`
  background: #3498db;
  color: white;
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const MonthTitle = styled.h2`
  margin: 0;
  font-size: 1.25rem;
`;

const ScheduleButton = styled.button`
  background: white;
  color: #3498db;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  border: none;
  cursor: pointer;

  &:hover {
    background: #f8fafc;
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const Th = styled.th`
  background: #f8fafc;
  padding: 1rem;
  text-align: left;
  border-bottom: 2px solid #e2e8f0;
`;

const Td = styled.td`
  padding: 1rem;
  border-bottom: 1px solid #e2e8f0;
`;

const ProfitCell = styled(Td)`
  color: ${(props) => (props.positive ? "#2f855a" : "inherit")};
  font-weight: ${(props) => (props.positive ? "500" : "normal")};
`;

const WithdrawBadge = styled.span`
  background: #e53e3e;
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.875rem;
`;

// Modal Styles
const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 0.5rem;
  padding: 1.5rem;
  max-width: 42rem;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
`;

const TradingDashboard = () => {
  const [tradingData, setTradingData] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currency, setCurrency] = useState("USD");
  const [tradingSchedule] = useState(() => new TradingSchedule(2461.3));

  useEffect(() => {
    const data = tradingSchedule.generateYearlyData();
    setTradingData(data);
  }, []);

  const formatAmount = (amount) => {
    const value = currency === "NGN" ? amount * USD_TO_NGN : amount;
    return formatCurrency(value, currency);
  };

  const groupedByMonth = tradingData.reduce((acc, item) => {
    if (!acc[item.month]) acc[item.month] = [];
    acc[item.month].push(item);
    return acc;
  }, {});

  return (
    <Container>
      <Header>
        <Title>Dashboard</Title>
        <CurrencyButtons>
          <CurrencyButton
            active={currency === "USD"}
            onClick={() => setCurrency("USD")}
          >
            USD
          </CurrencyButton>
          <CurrencyButton
            active={currency === "NGN"}
            onClick={() => setCurrency("NGN")}
          >
            NGN
          </CurrencyButton>
        </CurrencyButtons>
      </Header>

      {Object.entries(groupedByMonth).map(([month, data]) => (
        <MonthSection key={month}>
          <MonthHeader>
            <MonthTitle>{month}</MonthTitle>
            <ScheduleButton
              onClick={() => {
                setSelectedMonth(data);
                setIsModalOpen(true);
              }}
            >
              Schedule Withdraw
            </ScheduleButton>
          </MonthHeader>
          <div style={{ overflowX: "auto" }}>
            <Table>
              <thead>
                <tr>
                  <Th>Date</Th>
                  <Th>Balance Before</Th>
                  <Th>Total Profit</Th>
                  <Th>Final Balance</Th>
                  <Th>Withdrawal</Th>
                </tr>
              </thead>
              <tbody>
                {data.map((day) => (
                  <tr key={day.date}>
                    <Td>{day.date}</Td>
                    <Td>{formatAmount(day.balanceBeforeTrade)}</Td>
                    <ProfitCell positive={day.totalProfit > 0}>
                      {formatAmount(day.totalProfit)}
                    </ProfitCell>
                    <Td>{formatAmount(day.balanceAfterTrade)}</Td>
                    <Td>
                      {day.scheduledWithdraw && (
                        <WithdrawBadge>
                          {formatAmount(day.withdrawalAmount)} (
                          {day.withdrawalTime})
                        </WithdrawBadge>
                      )}
                    </Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </MonthSection>
      ))}

      <WithdrawModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedMonth(null);
        }}
        monthData={selectedMonth || []}
        onSubmit={(date, amount, withdrawalTime) => {
          const result = tradingSchedule.scheduledWithdraw(
            date.fullDate,
            parseFloat(amount),
            withdrawalTime
          );
          if (result.success) {
            setTradingData([...tradingSchedule.yearlyData]);
            setIsModalOpen(false);
          } else {
            alert(result.message);
          }
        }}
        currency={currency}
        usdToNgn={USD_TO_NGN}
      />
    </Container>
  );
};

export default TradingDashboard;
