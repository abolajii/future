import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { getExpenses } from "../api/request";
import { formatDate } from "../utils/tradingUtils";
import useAuthStore from "../store/authStore";

// Styled Components
const Container = styled.div`
  margin-bottom: 20px;
`;

const StatsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
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

// Main component
const Recovery = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();
  //   // Updated calculation function
  //   const calculateRecoveryDays = (
  //     amount,
  //     withdrawalDate,
  //     whenWithdraw,
  //     currentCapital = 2500, // Current capital as of today
  //     currentDate = new Date() // Today's date
  //   ) => {
  //     // Daily profit calculation function (remains the same)
  //     const calculateProfit = (recentCapital) => {
  //       const balanceBeforeTrade = recentCapital;
  //       const tradingCapital = recentCapital * 0.01;
  //       const profitFromTrade = tradingCapital * 0.88;
  //       const balanceAfterTrade = balanceBeforeTrade + profitFromTrade;

  //       return {
  //         balanceBeforeTrade,
  //         tradingCapital,
  //         profitFromTrade,
  //         balanceAfterTrade,
  //       };
  //     };

  //     // Parse dates
  //     const today = new Date(currentDate);
  //     const withdrawDate = new Date(withdrawalDate);

  //     // First, we need to calculate what the capital will be on the withdrawal date
  //     let runningCapital = currentCapital;
  //     let currentDay = new Date(today);

  //     // Check if withdrawal date is in the future
  //     if (withdrawDate > today) {
  //       // Get current time
  //       const currentTime = today.getHours() * 60 + today.getMinutes();
  //       const cutoffTime = 14 * 60 + 30; // 14:30 in minutes

  //       // Initialize signal counter based on current time
  //       let signalingCount = 0;

  //       // Process today's trades if needed
  //       if (currentTime < cutoffTime) {
  //         // Before 14:30, we still have two signals today
  //         const result1 = calculateProfit(runningCapital);
  //         runningCapital = result1.balanceAfterTrade;

  //         const result2 = calculateProfit(runningCapital);
  //         runningCapital = result2.balanceAfterTrade;
  //       } else {
  //         // After 14:30, we only have one signal left today
  //         const result = calculateProfit(runningCapital);
  //         runningCapital = result.balanceAfterTrade;
  //       }

  //       // Move to the next day
  //       currentDay.setDate(currentDay.getDate() + 1);

  //       // Calculate capital growth for each day until the withdrawal date
  //       while (currentDay < withdrawDate) {
  //         // Two signals per day
  //         const result1 = calculateProfit(runningCapital);
  //         runningCapital = result1.balanceAfterTrade;

  //         const result2 = calculateProfit(runningCapital);
  //         runningCapital = result2.balanceAfterTrade;

  //         // Move to the next day
  //         currentDay.setDate(currentDay.getDate() + 1);
  //       }
  //     }

  //     // Now runningCapital is the capital at the time of withdrawal

  //     // Adjust the withdrawal impact based on whenWithdraw
  //     if (whenWithdraw === "after-trade") {
  //       // If withdrawal happens after trade, capital is already calculated correctly
  //       runningCapital -= amount;
  //       // Start recovery from the next day
  //       withdrawDate.setDate(withdrawDate.getDate() + 1);
  //       signalingDay = 0; // Start with both signals on the next day
  //     } else if (whenWithdraw === "inbetween-trade") {
  //       // If withdrawal happens between trades, we've had one signal
  //       runningCapital -= amount;
  //       signalingDay = 1; // Only do second signal for this day
  //     } else if (whenWithdraw === "before-trade") {
  //       // If withdrawal happens before trade, no signals processed yet
  //       runningCapital -= amount;
  //       signalingDay = 0; // Do both signals for this day
  //     }

  //     // Calculate recovery (similar to original, but using our adjusted capital)
  //     // ...Rest of the recovery calculation remains similar...

  //     // Initialize recovery variables
  //     let amountToRecover = amount;
  //     let daysNeeded = 0;
  //     let dailyProfits = [];
  //     let signalingDay = 0; // Reset signal day based on withdrawal type
  //     let recoveryDate = new Date(withdrawDate);

  //     // Determine the starting point based on when the withdrawal happened
  //     if (whenWithdraw === "after-trade") {
  //       // If withdrawal happens after trade, start counting from the next day
  //       recoveryDate.setDate(recoveryDate.getDate() + 1);
  //       signalingDay = 0;
  //     } else if (whenWithdraw === "inbetween-trade") {
  //       // If withdrawal happens between trades, start with the second signal of the same day
  //       signalingDay = 1;
  //     } else if (whenWithdraw === "before-trade") {
  //       // If withdrawal happens before trade, start counting from the same day
  //       signalingDay = 0;
  //     }

  //     // Continue calculating until we recover the amount
  //     while (amountToRecover > 0) {
  //       // If we're in the middle of a day (after first signal)
  //       if (signalingDay === 1) {
  //         // Calculate profit from the second signal
  //         const result = calculateProfit(runningCapital);
  //         amountToRecover -= result.profitFromTrade;
  //         dailyProfits.push(result.profitFromTrade);
  //         runningCapital = result.balanceAfterTrade;

  //         // Reset for the next day
  //         signalingDay = 0;
  //         // Move to the next day if this was the second signal
  //         recoveryDate.setDate(recoveryDate.getDate() + 1);
  //       } else {
  //         // Calculate profit from the first signal
  //         const result1 = calculateProfit(runningCapital);
  //         amountToRecover -= result1.profitFromTrade;
  //         dailyProfits.push(result1.profitFromTrade);
  //         runningCapital = result1.balanceAfterTrade;

  //         // If we've recovered the amount, break
  //         if (amountToRecover <= 0) break;

  //         // Calculate profit from the second signal
  //         const result2 = calculateProfit(runningCapital);
  //         amountToRecover -= result2.profitFromTrade;
  //         dailyProfits.push(result2.profitFromTrade);
  //         runningCapital = result2.balanceAfterTrade;

  //         // Move to the next day
  //         recoveryDate.setDate(recoveryDate.getDate() + 1);
  //       }

  //       // Increment days counter (counts full days, not signals)
  //       daysNeeded++;
  //     }

  //     // Calculate average daily profit
  //     const averageProfitPerSignal =
  //       dailyProfits.reduce((sum, profit) => sum + profit, 0) /
  //       dailyProfits.length;
  //     const averageProfitPerDay = averageProfitPerSignal * 2; // Two signals per day

  //     // Format the recovery date
  //     const formattedRecoveryDate = recoveryDate.toISOString().split("T")[0];

  //     return {
  //       success: true,
  //       daysNeeded,
  //       numberOfSignals: dailyProfits.length,
  //       estimatedRecoveryDate: formattedRecoveryDate,
  //       averageProfitPerSignal: averageProfitPerSignal,
  //       averageProfitPerDay: averageProfitPerDay,
  //       finalCapital: runningCapital,
  //       withdrawalAmount: amount,
  //       dailyProfits: dailyProfits,
  //     };
  //   };

  // Function to calculate recovery days
  const calculateRecoveryDays = (
    amount,
    withdrawalDate,
    whenWithdraw,
    currentCapital = 2500, // Current capital as of today
    currentDate = new Date()
  ) => {
    // Daily profit calculation function
    const calculateProfit = (recentCapital) => {
      const balanceBeforeTrade = recentCapital;
      const tradingCapital = recentCapital * 0.01;
      const profitFromTrade = tradingCapital * 0.88;
      const balanceAfterTrade = balanceBeforeTrade + profitFromTrade;

      return {
        balanceBeforeTrade,
        tradingCapital,
        profitFromTrade,
        balanceAfterTrade,
      };
    };

    const today = new Date(currentDate);
    const withdrawDate = new Date(withdrawalDate);

    // First, we need to calculate what the capital will be on the withdrawal date
    let runningCapital = currentCapital;
    let currentDay = new Date(today);

    // Check if withdrawal date is in the future
    if (withdrawDate > today) {
      // Get current time
      const currentTime = today.getHours() * 60 + today.getMinutes();
      const firstCutoffTime = 14 * 60 + 30; // 14:30 in minutes
      const secondCutoffTime = 19 * 60 + 30; // 19:30 in minutes

      // Process today's trades if needed
      if (currentTime < firstCutoffTime) {
        // Before 14:30, we still have two signals today
        const result1 = calculateProfit(runningCapital);
        runningCapital = result1.balanceAfterTrade;

        const result2 = calculateProfit(runningCapital);
        runningCapital = result2.balanceAfterTrade;
      } else if (currentTime < secondCutoffTime) {
        // Between 14:30 and 19:30, we only have one signal left today
        const result = calculateProfit(runningCapital);
        runningCapital = result.balanceAfterTrade;
      }
      // After 19:30, both signals for today are complete, so we start from the next day
      // No additional calculation needed for today

      // Move to the next day
      currentDay.setDate(currentDay.getDate() + 1);

      // Calculate capital growth for each day until the withdrawal date
      while (currentDay < withdrawDate) {
        // Two signals per day
        const result1 = calculateProfit(runningCapital);
        runningCapital = result1.balanceAfterTrade;

        const result2 = calculateProfit(runningCapital);
        runningCapital = result2.balanceAfterTrade;

        // Move to the next day
        currentDay.setDate(currentDay.getDate() + 1);
      }
    }

    let amountToRecover = amount;
    let daysNeeded = 0;
    let dailyProfits = [];
    let signalingDay = 0; // Reset signal day based on withdrawal type
    let recoveryDate = new Date(withdrawDate);

    // Determine the starting point based on when the withdrawal happened
    if (whenWithdraw === "after-trade") {
      // If withdrawal happens after trade, start counting from the next day
      recoveryDate.setDate(recoveryDate.getDate() + 1);
      signalingDay = 0;
    } else if (whenWithdraw === "inbetween-trade") {
      // If withdrawal happens between trades, start with the second signal of the same day
      signalingDay = 1;
    } else if (whenWithdraw === "before-trade") {
      // If withdrawal happens before trade, start counting from the same day
      signalingDay = 0;
    }

    // Continue calculating until we recover the amount
    while (amountToRecover > 0) {
      // If we're in the middle of a day (after first signal)
      if (signalingDay === 1) {
        // Calculate profit from the second signal
        const result = calculateProfit(runningCapital);
        amountToRecover -= result.profitFromTrade;
        dailyProfits.push(result.profitFromTrade);
        runningCapital = result.balanceAfterTrade;

        // Reset for the next day
        signalingDay = 0;
        // Move to the next day if this was the second signal
        recoveryDate.setDate(recoveryDate.getDate() + 1);
      } else {
        // Calculate profit from the first signal
        const result1 = calculateProfit(runningCapital);
        amountToRecover -= result1.profitFromTrade;
        dailyProfits.push(result1.profitFromTrade);
        runningCapital = result1.balanceAfterTrade;

        // If we've recovered the amount, break
        if (amountToRecover <= 0) break;

        // Calculate profit from the second signal
        const result2 = calculateProfit(runningCapital);
        amountToRecover -= result2.profitFromTrade;
        dailyProfits.push(result2.profitFromTrade);
        runningCapital = result2.balanceAfterTrade;

        // Move to the next day
        recoveryDate.setDate(recoveryDate.getDate() + 1);
      }

      // Increment days counter (counts full days, not signals)
      daysNeeded++;
    }

    // Calculate average daily profit
    const averageProfitPerSignal =
      dailyProfits.reduce((sum, profit) => sum + profit, 0) /
      dailyProfits.length;
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
      finalCapital: runningCapital,
      withdrawalAmount: amount,
      dailyProfits: dailyProfits,
    };
  };

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

      const formattedExpenses = withdrawResponse.withdraw.map((e) => ({
        dateOfWithdraw: e.date.split("T")[0],
        amount: e.amount,
        whenWithdrawHappened: e.whenWithdraw,
        id: e._id,
        // Calculate recovery info for each expense
        recoveryInfo: calculateRecoveryDays(
          e.amount,
          e.date.split("T")[0],
          e.whenWithdraw,
          user.running_capital
        ),
      }));

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
      {/* <Header>
      </Header> */}

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
                          {expense.recoveryInfo.daysNeeded} days
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
