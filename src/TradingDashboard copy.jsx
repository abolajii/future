import React, { useState, useEffect } from "react";
import styled from "styled-components";
import {
  TradingSchedule,
  formatCurrency,
  formatDate,
} from "./utils/tradingUtils";
import WithdrawModal from "./WithdrawModal";

const Container = styled.div`
  padding: 2rem;
  margin: 0 auto;
`;

const Header = styled.header`
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  color: #2c3e50;
  margin-bottom: 1rem;
`;

const MonthSection = styled.section`
  margin-bottom: 2rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
`;

const MonthHeader = styled.h2`
  background: #3498db;
  color: white;
  padding: 1rem;
  margin: 0;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const Th = styled.th`
  background: #f8f9fa;
  padding: 1rem;
  text-align: left;
  border-bottom: 2px solid #dee2e6;
`;

const Td = styled.td`
  padding: 1rem;
  border-bottom: 1px solid #dee2e6;
  ${(props) =>
    props.withdraw &&
    `
    background-color: #fff3cd;
  `}
`;

const ProfitCell = styled(Td)`
  ${(props) =>
    props.signalPassed &&
    `
    color: #28a745;
    font-weight: 500;
  `}
`;

const WithdrawBadge = styled.span`
  background: #dc3545;
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.875rem;
`;

const Button = styled.button`
  background: #3498db;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: #2980b9;
  }
`;

const TradingDashboard = () => {
  const [tradingData, setTradingData] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tradingSchedule] = useState(() => new TradingSchedule(2461.3));

  useEffect(() => {
    const data = tradingSchedule.generateYearlyData();
    setTradingData(data);
  }, []);

  const handleWithdraw = (amount, withdrawalTime) => {
    if (!selectedDate) return;

    const result = tradingSchedule.scheduledWithdraw(
      selectedDate.fullDate,
      parseFloat(amount),
      withdrawalTime
    );

    if (result.success) {
      setTradingData([...tradingSchedule.yearlyData]);
      setIsModalOpen(false);
    } else {
      alert(result.message);
    }
  };

  const groupedByMonth = tradingData.reduce((acc, item) => {
    if (!acc[item.month]) acc[item.month] = [];
    acc[item.month].push(item);
    return acc;
  }, {});

  return (
    <Container>
      <Header>
        <Title>
          Dashboard
          {/* a NGN and USD button */}
        </Title>
      </Header>

      {Object.entries(groupedByMonth).map(([month, data], index) => {
        console.log(data);
        return (
          <MonthSection key={index}>
            <MonthHeader>
              {month}

              {/* withdraw button  */}
            </MonthHeader>
            <Table>
              <thead>
                <tr>
                  <Th>Date</Th>
                  <Th>Balance Before</Th>
                  <Th>Signal 1</Th>
                  <Th>Signal 1 Profit</Th>
                  <Th>Signal 2</Th>
                  <Th>Signal 2 Profit</Th>
                  <Th>Total Profit</Th>
                  <Th>Final Balance</Th>
                  <Th>Withdrawal</Th>
                  <Th>Action</Th>
                </tr>
              </thead>
              <tbody>
                {data.map((day, index) => (
                  <tr key={index}>
                    <Td withdraw={day.scheduledWithdraw}>{day.date}</Td>
                    <Td>{formatCurrency(day.balanceBeforeTrade)}</Td>
                    <Td>{formatCurrency(day.signal1Capital)}</Td>
                    <ProfitCell signalPassed={day.firstSignalPassed}>
                      {formatCurrency(day.signal1Profit)}
                    </ProfitCell>
                    <Td>{formatCurrency(day.signal2Capital)}</Td>
                    <ProfitCell signalPassed={day.secondSignalPassed}>
                      {formatCurrency(day.signal2Profit)}
                    </ProfitCell>
                    <ProfitCell signalPassed={day.secondSignalPassed}>
                      {formatCurrency(day.totalProfit)}
                    </ProfitCell>
                    <Td>{formatCurrency(day.balanceAfterTrade)}</Td>
                    <Td>
                      {day.scheduledWithdraw && (
                        <WithdrawBadge>
                          {formatCurrency(day.withdrawalAmount)} (
                          {day.withdrawalTime})
                        </WithdrawBadge>
                      )}
                    </Td>
                    <Td>
                      <Button
                        disabled={!!day.scheduledWithdraw}
                        onClick={() => {
                          setSelectedDate(day);
                          setIsModalOpen(true);
                        }}
                      >
                        {day.scheduledWithdraw
                          ? "Withdrawn"
                          : "Schedule Withdraw"}
                      </Button>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </MonthSection>
        );
      })}

      {selectedDate && (
        <WithdrawModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleWithdraw}
          date={selectedDate}
        />
      )}
    </Container>
  );
};

export default TradingDashboard;
