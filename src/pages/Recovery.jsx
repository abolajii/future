import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { getExpenses } from "../api/request";
import { formatDate } from "../utils/tradingUtils";
import useAuthStore from "../store/authStore";

const Container = styled.div`
  margin-bottom: 20px;
`;

const StatsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
`;

const StatCard = styled.div`
  background: #25262b;
  border-radius: 0.5rem;
  padding: 1.25rem;
  border: 1px solid #ff980020;
`;

const StatTitle = styled.p`
  color: #a0a0a0;
  font-size: 0.875rem;
  margin: 0 0 0.5rem 0;
`;

const StatValue = styled.p`
  color: #fff;
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
`;

const ExpensesTable = styled.div`
  background: #25262b;
  border-radius: 0.5rem;
  overflow: hidden;
  border: 1px solid #ff980020;
`;

const TableHeader = styled.div`
  background: #1a1a1a;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #ff980020;
`;

const TableTitle = styled.h3`
  color: #fff;
  font-size: 1.25rem;
  font-weight: 500;
  margin: 0;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const Th = styled.th`
  text-align: left;
  padding: 1rem;
  color: #a0a0a0;
  font-weight: 500;
  background: #1a1a1a;
`;

const Td = styled.td`
  padding: 1rem;
  color: #ffffff;
  /* border-bottom: 1px solid #ff980020; */
`;

const WithdrawType = styled.span`
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 500;

  background-color: ${(props) => {
    if (props.type === "before-trade") return "#dc354520";
    if (props.type === "inbetween-trade") return "#ffc10720";
    return "#28a74520";
  }};

  color: ${(props) => {
    if (props.type === "before-trade") return "#dc3545";
    if (props.type === "inbetween-trade") return "#ffc107";
    return "#28a745";
  }};
`;

const RecoveryInfo = styled.div`
  background: #1a1a1a;
  border-radius: 0.25rem;
  padding: 0.75rem;
  margin-top: 0.5rem;
`;

const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;

  &:last-child {
    margin-bottom: 0;
  }
`;

const InfoLabel = styled.span`
  color: #a0a0a0;
  font-size: 0.75rem;
`;

const InfoValue = styled.span`
  color: #fff;
  font-size: 0.75rem;
  font-weight: 500;
`;

const EmptyState = styled.div`
  padding: 3rem;
  text-align: center;
  color: #a0a0a0;
`;

const InfoSeparator = styled.div`
  height: 1px;
  background: #ff980020;
  margin: 0.75rem 0;
`;

const YearlyProfitSection = styled.div`
  border-top: 1px solid #ff980020;
  padding-top: 0.75rem;
  margin-top: 0.75rem;
`;

const YearlyProfitTitle = styled.div`
  color: #ff9800;
  font-size: 0.8rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
`;

// Import or implement the calculateDayProfits function
const calculateDayProfits = (
  initialBalance,
  transactionInfo = null,
  transactionTiming = null
) => {
  // First trade calculations
  const firstTradeTotalAmount = initialBalance * 0.01;
  const firstTradeProfit = firstTradeTotalAmount * 0.88;

  // Calculate balance after first trade
  let balanceAfterFirstTrade = initialBalance + firstTradeProfit;

  // Handle transaction if it's in-between trades
  let effectiveSecondTradeBalance = balanceAfterFirstTrade;

  if (transactionInfo) {
    if (transactionTiming === "inbetween-trade") {
      // Handle deposit
      if (transactionInfo.depositedAmount !== undefined) {
        effectiveSecondTradeBalance +=
          transactionInfo.depositedAmount + (transactionInfo.depositBonus || 0);
      }
      // Handle withdrawal
      else if (transactionInfo.withdrawAmount !== undefined) {
        // Ensure we don't withdraw more than available
        const maxWithdrawal = Math.min(
          transactionInfo.withdrawAmount,
          balanceAfterFirstTrade
        );
        effectiveSecondTradeBalance -= maxWithdrawal;
      }
    }
  }

  // Second trade calculations based on the effective balance
  const secondTradeTotalAmount = effectiveSecondTradeBalance * 0.01;
  const secondTradeProfit = secondTradeTotalAmount * 0.88;

  // Calculate final balance
  let finalBalance = effectiveSecondTradeBalance + secondTradeProfit;

  // Handle transaction if it's after trades
  if (transactionInfo && transactionTiming === "after-trade") {
    // Handle deposit
    if (transactionInfo.depositedAmount !== undefined) {
      finalBalance +=
        transactionInfo.depositedAmount + (transactionInfo.depositBonus || 0);
    }
    // Handle withdrawal
    else if (transactionInfo.withdrawAmount !== undefined) {
      // Ensure we don't withdraw more than available
      const maxWithdrawal = Math.min(
        transactionInfo.withdrawAmount,
        finalBalance
      );
      finalBalance -= maxWithdrawal;
    }
  }

  // Calculate total profit (always the same formula since we're tracking actual trading profit)
  const totalProfit = firstTradeProfit + secondTradeProfit;

  return {
    startingCapital: initialBalance,
    balanceAfterFirstTrade: balanceAfterFirstTrade,
    signal1Capital: firstTradeTotalAmount,
    signal1Profit: firstTradeProfit,
    signal2Capital: secondTradeTotalAmount,
    signal2Profit: secondTradeProfit,
    totalProfit: totalProfit,
    finalBalance: finalBalance,
  };
};

// Calculate the yearly profit correctly using the calculateDayProfits function
const calculateYearlyProfit = (initialCapital, startDate = new Date()) => {
  let runningCapital = initialCapital;
  let totalProfit = 0;
  let dailyProfits = [];

  // Get starting date
  const currentDate = new Date(startDate);

  // Calculate the end date (same day next year)
  const endDate = new Date(startDate);
  endDate.setFullYear(endDate.getFullYear() + 1);

  // Loop through each day until we reach the same date next year
  while (currentDate < endDate) {
    const dayResults = calculateDayProfits(runningCapital);
    const dayProfit = dayResults.totalProfit;

    totalProfit += dayProfit;
    dailyProfits.push(dayProfit);
    runningCapital = dayResults.finalBalance;

    // Move to the next day
    currentDate.setDate(currentDate.getDate() + 1);
  }

  // Get the actual number of days calculated (typically 365 or 366 in leap years)
  const daysCalculated = dailyProfits.length;

  return {
    totalProfit,
    finalCapital: runningCapital,
    dailyProfits,
    daysCalculated,
    averageDailyProfit: totalProfit / daysCalculated,
  };
};

// Function to calculate recovery days with correct yearly profit calculations
const calculateRecoveryDays = (
  amount,
  withdrawalDate,
  whenWithdraw,
  currentCapital = 2500, // Current capital as of today
  currentDate = new Date(), // Today's date
  signalStatus = 0 // 0: two signals, 1: one signal, 2: no signals for today
) => {
  // Parse dates
  const today = new Date(currentDate);
  const withdrawDate = new Date(withdrawalDate);

  // First, calculate what the capital will be on the withdrawal date
  let runningCapital = currentCapital;
  let currentDay = new Date(today);

  // Check if withdrawal date is in the future
  if (withdrawDate > today) {
    // Process today's trades based on signalStatus
    if (signalStatus === 0) {
      // Run 2 signals for today
      const result = calculateDayProfits(runningCapital);
      runningCapital = result.finalBalance;
    } else if (signalStatus === 1) {
      // Run just 1 signal for today
      const result = calculateDayProfits(runningCapital);
      // Only apply first signal
      runningCapital = result.balanceAfterFirstTrade;
    }
    // If signalStatus is 2, run no signals for today

    // Move to the next day
    currentDay.setDate(currentDay.getDate() + 1);

    // Calculate capital growth for each day until the withdrawal date
    while (currentDay < withdrawDate) {
      const result = calculateDayProfits(runningCapital);
      runningCapital = result.finalBalance;

      // Move to the next day
      currentDay.setDate(currentDay.getDate() + 1);
    }
  }

  // Calculate yearly profit BEFORE withdrawal
  const yearlyProfitBeforeWithdraw = calculateYearlyProfit(runningCapital);

  // Apply the withdrawal based on whenWithdraw
  let capitalAfterWithdraw;

  if (whenWithdraw === "before-trade") {
    // If withdrawal happens before trades, simply subtract the amount
    capitalAfterWithdraw = runningCapital - amount;
  } else if (whenWithdraw === "inbetween-trade") {
    // If withdrawal happens between trades, we need to simulate the first trade first
    const firstTradeResult = {
      startingCapital: runningCapital,
      balanceAfterFirstTrade: runningCapital + runningCapital * 0.01 * 0.88,
    };
    capitalAfterWithdraw = firstTradeResult.balanceAfterFirstTrade - amount;
  } else {
    // after-trade
    // If withdrawal happens after both trades, simulate a full day of trading first
    const dayResult = calculateDayProfits(runningCapital);
    capitalAfterWithdraw = dayResult.finalBalance - amount;
  }

  // Calculate yearly profit AFTER withdrawal
  const yearlyProfitAfterWithdraw = calculateYearlyProfit(capitalAfterWithdraw);

  // Calculate the profit difference
  const profitDifference =
    yearlyProfitBeforeWithdraw.totalProfit -
    yearlyProfitAfterWithdraw.totalProfit;

  // Calculate deposit needed to match the original yearly profit
  // Use a more precise calculation method
  let depositNeeded = 0;
  let step = 100;

  while (step >= 1) {
    while (true) {
      const testCapital = capitalAfterWithdraw + depositNeeded + step;
      const testProfit = calculateYearlyProfit(testCapital);

      if (testProfit.totalProfit >= yearlyProfitBeforeWithdraw.totalProfit) {
        break;
      }

      depositNeeded += step;

      // Safety check
      if (depositNeeded > amount * 2) {
        break;
      }
    }

    step = step / 10;
  }

  // Calculate days needed to deposit this amount
  let daysToMeetUp = 0;
  let signalingDay = 0;
  let meetUpCapital = capitalAfterWithdraw;
  let amountNeeded = depositNeeded;
  let meetUpSignals = 0;

  while (amountNeeded > 0) {
    if (signalingDay === 0) {
      // First signal
      const firstSignalProfit = meetUpCapital * 0.01 * 0.88;
      amountNeeded -= firstSignalProfit;
      meetUpCapital += firstSignalProfit;
      meetUpSignals++;

      if (amountNeeded <= 0) break;

      // Second signal
      const secondSignalProfit = meetUpCapital * 0.01 * 0.88;
      amountNeeded -= secondSignalProfit;
      meetUpCapital += secondSignalProfit;
      meetUpSignals++;

      // Move to next day
      daysToMeetUp++;
    } else {
      // Only second signal left for this day
      const secondSignalProfit = meetUpCapital * 0.01 * 0.88;
      amountNeeded -= secondSignalProfit;
      meetUpCapital += secondSignalProfit;
      meetUpSignals++;

      // Move to next day
      daysToMeetUp++;
      signalingDay = 0;
    }
  }

  // Now calculate standard recovery details
  let amountToRecover = amount;
  let daysNeeded = 0;
  let dailyProfits = [];
  signalingDay = 0; // Reset
  let recoveryDate = new Date(withdrawDate);
  let recoveryCapital = capitalAfterWithdraw;

  // Adjust starting point based on the whenWithdraw parameter
  if (whenWithdraw === "after-trade") {
    // If withdrawal happens after trade, start from the next day
    recoveryDate.setDate(recoveryDate.getDate() + 1);
    signalingDay = 0; // Both signals for the next day
  } else if (whenWithdraw === "inbetween-trade") {
    // If withdrawal happens between trades, we've had one signal
    signalingDay = 1; // Only the second signal for today
  } else if (whenWithdraw === "before-trade") {
    // If withdrawal happens before trade, no signals processed yet
    signalingDay = 0; // Both signals for today
  }

  // Continue calculating until we recover the amount
  while (amountToRecover > 0) {
    if (signalingDay === 1) {
      // Second signal only
      const secondSignalProfit = recoveryCapital * 0.01 * 0.88;
      amountToRecover -= secondSignalProfit;
      dailyProfits.push(secondSignalProfit);
      recoveryCapital += secondSignalProfit;

      // Reset for next day
      signalingDay = 0;
      recoveryDate.setDate(recoveryDate.getDate() + 1);
    } else {
      // First signal
      const firstSignalProfit = recoveryCapital * 0.01 * 0.88;
      amountToRecover -= firstSignalProfit;
      dailyProfits.push(firstSignalProfit);
      recoveryCapital += firstSignalProfit;

      if (amountToRecover <= 0) break;

      // Second signal
      const secondSignalProfit = recoveryCapital * 0.01 * 0.88;
      amountToRecover -= secondSignalProfit;
      dailyProfits.push(secondSignalProfit);
      recoveryCapital += secondSignalProfit;

      // Move to next day
      recoveryDate.setDate(recoveryDate.getDate() + 1);
      daysNeeded++;
    }
  }

  // Calculate average daily profit
  const averageProfitPerSignal =
    dailyProfits.reduce((sum, profit) => sum + profit, 0) / dailyProfits.length;
  const averageProfitPerDay = averageProfitPerSignal * 2; // Two signals per day

  // Format the recovery date
  const formattedRecoveryDate = recoveryDate.toISOString().split("T")[0];

  return {
    success: true,
    daysNeeded,
    numberOfSignals: dailyProfits.length,
    estimatedRecoveryDate: formattedRecoveryDate,
    averageProfitPerSignal: averageProfitPerSignal,
    averageProfitPerDay: averageProfitPerDay,
    finalCapital: recoveryCapital,
    withdrawalAmount: amount,
    dailyProfits: dailyProfits,

    // Yearly profit comparison values - now correctly calculated
    totalYearlyProfitBeforeWithdraw: yearlyProfitBeforeWithdraw.totalProfit,
    totalYearlyProfitAfterWithdraw: yearlyProfitAfterWithdraw.totalProfit,
    differenceBetweenProfit: profitDifference,
    amountToDepositToMeetUp: depositNeeded,
    daysToDepositToMeetUp: daysToMeetUp,
  };
};

// Main component
const Recovery = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();

  // Format currency amounts
  const formatAmount = (amount, currency = "USD") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 2,
    }).format(amount);
  };

  // Fetch expenses data
  const fetchDeposits = async () => {
    setLoading(true);
    try {
      const withdrawResponse = await getExpenses();

      const formattedExpenses = withdrawResponse.withdraw.map((e) => {
        // Determine signal status based on whenWithdraw
        let signalStatus = 0;
        if (e.whenWithdraw === "inbetween-trade") {
          signalStatus = 1;
        } else if (e.whenWithdraw === "after-trade") {
          signalStatus = 2;
        }

        return {
          dateOfWithdraw: e.date.split("T")[0],
          amount: e.amount,
          whenWithdrawHappened: e.whenWithdraw,
          id: e._id,
          // Calculate recovery info with signalStatus
          recoveryInfo: calculateRecoveryDays(
            e.amount,
            e.date.split("T")[0],
            e.whenWithdraw,
            user.running_capital,
            new Date(),
            signalStatus
          ),
        };
      });

      setExpenses(formattedExpenses);
    } catch (error) {
      console.error("Error fetching deposits:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeposits();
  }, []);

  // Calculate total withdrawn amount
  const totalWithdrawn = expenses.reduce(
    (total, expense) => total + expense.amount,
    0
  );

  // Calculate average recovery time
  const averageRecoveryDays =
    expenses.length > 0
      ? expenses.reduce(
          (total, expense) => total + expense.recoveryInfo.daysNeeded,
          0
        ) / expenses.length
      : 0;

  return (
    <Container>
      <StatsContainer>
        <StatCard>
          <StatTitle>Total Withdrawals</StatTitle>
          <StatValue>{expenses.length}</StatValue>
        </StatCard>
        <StatCard>
          <StatTitle>Total Amount Withdrawn</StatTitle>
          <StatValue>{formatAmount(totalWithdrawn)}</StatValue>
        </StatCard>
        <StatCard>
          <StatTitle>Average Recovery Time</StatTitle>
          <StatValue>{averageRecoveryDays.toFixed(1)} days</StatValue>
        </StatCard>
      </StatsContainer>

      <ExpensesTable>
        <TableHeader>
          <TableTitle>Withdrawal History</TableTitle>
        </TableHeader>

        {expenses.length > 0 ? (
          <Table>
            <thead>
              <tr>
                <Th>Date</Th>
                <Th>Amount</Th>
                <Th>Withdrawal Type</Th>
                <Th>Recovery Details</Th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((expense) => (
                <tr key={expense.id}>
                  <Td>{formatDate(expense.dateOfWithdraw)}</Td>
                  <Td>{formatAmount(expense.amount)}</Td>
                  <Td>
                    <WithdrawType type={expense.whenWithdrawHappened}>
                      {expense.whenWithdrawHappened === "before-trade"
                        ? "Before Trade"
                        : expense.whenWithdrawHappened === "inbetween-trade"
                        ? "Between Trades"
                        : "After Trade"}
                    </WithdrawType>
                  </Td>
                  <Td>
                    <RecoveryInfo>
                      <InfoRow>
                        <InfoLabel>Recovery Time:</InfoLabel>
                        <InfoValue>
                          {expense.recoveryInfo.daysNeeded}{" "}
                          {expense.recoveryInfo.daysNeeded > 1 ? "days" : "day"}
                        </InfoValue>
                      </InfoRow>
                      <InfoRow>
                        <InfoLabel>Signals Needed:</InfoLabel>
                        <InfoValue>
                          {expense.recoveryInfo.numberOfSignals}
                        </InfoValue>
                      </InfoRow>
                      <InfoRow>
                        <InfoLabel>Estimated Recovery Date:</InfoLabel>
                        <InfoValue>
                          {formatDate(
                            expense.recoveryInfo.estimatedRecoveryDate
                          )}
                        </InfoValue>
                      </InfoRow>
                      <InfoRow>
                        <InfoLabel>Average Daily Profit:</InfoLabel>
                        <InfoValue>
                          {formatAmount(
                            expense.recoveryInfo.averageProfitPerDay
                          )}
                        </InfoValue>
                      </InfoRow>

                      <YearlyProfitSection>
                        <YearlyProfitTitle>
                          Yearly Profit Impact
                        </YearlyProfitTitle>
                        <InfoRow>
                          <InfoLabel>Before Withdrawal:</InfoLabel>
                          <InfoValue>
                            {formatAmount(
                              expense.recoveryInfo
                                .totalYearlyProfitBeforeWithdraw
                            )}
                          </InfoValue>
                        </InfoRow>
                        <InfoRow>
                          <InfoLabel>After Withdrawal:</InfoLabel>
                          <InfoValue>
                            {formatAmount(
                              expense.recoveryInfo
                                .totalYearlyProfitAfterWithdraw
                            )}
                          </InfoValue>
                        </InfoRow>
                        <InfoRow>
                          <InfoLabel>Difference:</InfoLabel>
                          <InfoValue>
                            {formatAmount(
                              expense.recoveryInfo.differenceBetweenProfit
                            )}
                          </InfoValue>
                        </InfoRow>
                        <InfoRow>
                          <InfoLabel>Amount to Match:</InfoLabel>
                          <InfoValue>
                            {formatAmount(
                              expense.recoveryInfo.amountToDepositToMeetUp
                            )}
                          </InfoValue>
                        </InfoRow>
                        <InfoRow>
                          <InfoLabel>Days to Match:</InfoLabel>
                          <InfoValue>
                            {expense.recoveryInfo.daysToDepositToMeetUp}
                          </InfoValue>
                        </InfoRow>
                      </YearlyProfitSection>
                    </RecoveryInfo>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        ) : (
          <EmptyState>
            {loading ? "Loading withdrawal data..." : "No withdrawals found"}
          </EmptyState>
        )}
      </ExpensesTable>
    </Container>
  );
};

export default Recovery;
