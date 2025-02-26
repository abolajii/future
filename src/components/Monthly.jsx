import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { TradingSchedule } from "../utils/tradingUtils";
import useAuthStore from "../store/authStore";
import WithdrawModal from "./WithdrawModal";
import {
  creatExpense,
  deleteWithdrawal,
  getAllDeposits,
  getExpenses,
} from "../api/request";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const Card = styled.div`
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
  margin-bottom: 1rem;
  border: 1px solid #ff980020;
  background: #25262b;
  width: 100%;
`;

const CardHeader = styled.div`
  padding: 1.25rem;
  border-bottom: 1px solid #ff980020;
  display: flex;
  justify-content: space-between;
`;

const CardTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  color: ${(props) => props.theme.text};
  margin: 0;
`;

const CardContent = styled.div`
  padding: 1.25rem;
`;

const HeaderActions = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
`;

const CurrencyToggle = styled.button`
  width: 100%;
  color: white;
  outline: none;
  border-radius: 0.375rem;
  font-weight: 500;
  font-size: 0.875rem;

  cursor: pointer;
  transition: opacity 0.2s;
  border: none;
  border: 1px solid #ff980020;
  padding: 0.5rem 1rem;
  &:hover {
    opacity: 0.9;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  background-color: #25262b;

  &:hover {
    background-color: #222222;
    border: 1px solid #ff980020;
  }
`;

const MonthSection = styled.div`
  border: 1px solid #ff980020;
  border-radius: 0.5rem;
  padding: 1rem;
  margin-bottom: 1rem;
`;

const MonthHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
`;

const ScheduleButton = styled.button`
  /* background: #ffffff;  */
  color: #ff9800;
  padding: 0.5rem 1rem;
  border: none;
  background: #f9f2e71f;
  cursor: pointer;
  border-radius: 0.375rem;
  font-weight: 500;
  font-size: 0.875rem;

  &:hover {
    background: #cfc6b91f;
  }
`;

const TableContainer = styled.div`
  overflow-x: auto;
  max-height: 28rem;
  border: 1px solid #ff980020;
  border-radius: 8px;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const Th = styled.th`
  text-align: left;
  padding: 1rem;
  background: #1a1a1a;
  color: #a0a0a0;
  font-weight: 500;
  position: sticky;
  top: 0;
  z-index: 1;
  &:first-child {
    border-top-left-radius: 8px;
  }
  &:last-child {
    border-top-right-radius: 8px;
  }
`;

const Td = styled.td`
  padding: 1rem;
  /* border-bottom: 1px solid #ff980020; */
  color: #ffffff;

  ${(props) =>
    props.withdraw &&
    `
    background-color: #cfc6b91f;
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

const Monthly = ({ formatAmount }) => {
  const [currency, setCurrency] = useState("USD");
  const [tradingData, setTradingData] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const { user } = useAuthStore();
  const [deposits, setDeposits] = useState([]);
  const [trading] = useState(new TradingSchedule(user.monthly_capital)); // You'll need to import your Trading class
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expenses, setExpenses] = useState([]);

  const fetchDeposits = async () => {
    try {
      const response = await getAllDeposits();
      const withdrawResponse = await getExpenses();

      const formattedExpenses = withdrawResponse.withdraw.map((e) => ({
        dateOfWithdraw: e.date.split("T")[0],
        amount: e.amount,
        whenWithdrawHappened: e.whenWithdraw,
        id: e._id,
      }));

      setDeposits(response.deposits);
      setExpenses(formattedExpenses);
    } catch (error) {
      console.error("Error fetching deposits:", error);
    }
  };

  useEffect(() => {
    fetchDeposits();
  }, []);

  // console.log(expenses);

  const generateWeeklyData = () => {
    const formattedDeposits = deposits.map((d) => ({
      dateOfDeposit: d.date.split("T")[0],
      amount: d.amount,
      depositBonus: d.bonus,
      whenDepositHappened: d.whenDeposited,
    }));

    const newWeeklyData = trading.generateYearlyData(
      formattedDeposits,
      expenses
    );
    setTradingData(newWeeklyData);
  };

  useEffect(() => {
    generateWeeklyData();
  }, [deposits, expenses]);

  const handleDeleteWithdrawal = async (id) => {
    try {
      await deleteWithdrawal(id);
      setExpenses(expenses.filter((e) => e.id !== id));
    } catch (error) {
      console.error("Error deleting withdrawal:", error);
    }
  };

  const groupedByMonth = tradingData.reduce((acc, item) => {
    if (!acc[item.month]) acc[item.month] = [];
    acc[item.month].push(item);
    return acc;
  }, {});

  return (
    <Container>
      <WithdrawModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedMonth(null);
        }}
        monthData={selectedMonth || []}
        onSubmit={async (date, amount, withdrawalTime, resetForm) => {
          const result = trading.scheduledWithdraw(
            date.fullDate,
            parseFloat(amount),
            withdrawalTime
          );
          if (result.success) {
            const data = {
              date: date.fullDate,
              amount: parseFloat(amount),
              whenWithdraw: withdrawalTime,
            };

            try {
              setIsModalOpen(false);
              await creatExpense(data);
              setTradingData([...trading.yearlyData]);
              resetForm();
            } catch (e) {}
          } else {
            alert(result.message);
          }
        }}
      />
      <Card>
        <CardHeader>
          <CardTitle>Future</CardTitle>
          <HeaderActions>
            <CurrencyToggle
              onClick={() =>
                setCurrency((prev) => (prev === "USD" ? "NGN" : "USD"))
              }
            >
              Switch to {currency === "USD" ? "NGN" : "USD"}
            </CurrencyToggle>
          </HeaderActions>
        </CardHeader>
        <CardContent>
          {Object.entries(groupedByMonth).map(([month, data], index) => {
            return (
              <MonthSection key={index}>
                <MonthHeader>
                  <h3>{month}</h3>
                  <ScheduleButton
                    onClick={() => {
                      setSelectedMonth(data);
                      setIsModalOpen(true);
                    }}
                  >
                    Schedule Withdraw
                  </ScheduleButton>
                </MonthHeader>
                <TableContainer>
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
                      </tr>
                    </thead>
                    <tbody>
                      {data.map((day, index) => (
                        <tr key={index}>
                          <Td withdraw={day.scheduledWithdraw}>{day.date}</Td>
                          <Td>
                            {formatAmount(day.balanceBeforeTrade, currency)}
                          </Td>
                          <Td>{formatAmount(day.signal1Capital, currency)}</Td>
                          <ProfitCell signalPassed={day.firstSignalPassed}>
                            {formatAmount(day.signal1Profit, currency)}
                          </ProfitCell>
                          <Td>{formatAmount(day.signal2Capital, currency)}</Td>
                          <ProfitCell signalPassed={day.secondSignalPassed}>
                            {formatAmount(day.signal2Profit, currency)}
                          </ProfitCell>
                          <ProfitCell signalPassed={day.secondSignalPassed}>
                            {formatAmount(day.totalProfit, currency)}
                          </ProfitCell>
                          <ProfitCell signalPassed={day.secondSignalPassed}>
                            {formatAmount(day.balanceAfterTrade, currency)}
                          </ProfitCell>
                          <Td>
                            {day.scheduledWithdraw && (
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "0.5rem",
                                }}
                              >
                                <WithdrawBadge>
                                  {formatAmount(day.withdrawalAmount, currency)}
                                  ({day.withdrawalTime})
                                </WithdrawBadge>
                                <button
                                  onClick={() =>
                                    handleDeleteWithdrawal(day.withdrawalId)
                                  }
                                  style={{
                                    background: "transparent",
                                    border: "none",
                                    cursor: "pointer",
                                    color: "#dc3545",
                                  }}
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="16"
                                    height="16"
                                    fill="currentColor"
                                    viewBox="0 0 16 16"
                                  >
                                    <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z" />
                                    <path
                                      fillRule="evenodd"
                                      d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"
                                    />
                                  </svg>
                                </button>
                              </div>
                            )}
                          </Td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </TableContainer>
              </MonthSection>
            );
          })}
        </CardContent>
      </Card>
    </Container>
  );
};

export default Monthly;
