const generateWeeklyDetails = (
  weekOffset = 0,
  currentDate = new Date(),
  initialCapital = 3343.84,
  deposits = [],
  withdrawals = []
) => {
  //   console.log(`Generating weekly details with week offset: ${weekOffset}`);
  //   console.log(`Reference date: ${currentDate.toISOString().split("T")[0]}`);

  // Constants for date formatting
  const MONTHS = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const WEEKDAYS = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  // Get day suffix helper
  const getDaySuffix = (day) => {
    if (day > 3 && day < 21) return "th";
    switch (day % 10) {
      case 1:
        return "st";
      case 2:
        return "nd";
      case 3:
        return "rd";
      default:
        return "th";
    }
  };

  // Calculate the start of the current week (Sunday)
  const targetDate = new Date(currentDate);
  targetDate.setDate(targetDate.getDate() + weekOffset * 7);

  const startOfWeek = new Date(targetDate);
  const day = startOfWeek.getDay(); // 0 = Sunday, 1 = Monday, etc.
  startOfWeek.setDate(startOfWeek.getDate() - day); // Go back to Sunday

  // Calculate the end of the week (Saturday)
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(endOfWeek.getDate() + 6);

  // Format date ranges for display
  const formatDate = (date) => {
    const day = date.getDate();
    const month = MONTHS[date.getMonth()].substring(0, 3);
    const year = date.getFullYear();
    return `${month} ${day}, ${year}`;
  };

  const weekDateRange = `${formatDate(startOfWeek)} - ${formatDate(endOfWeek)}`;

  // Generate daily details for the week
  const dailyDetails = [];
  let runningCapital = initialCapital;
  let weeklyProfit = 0;

  // Find the most recent capital value before this week starts
  // In a real implementation, you would retrieve this from your data store
  // For this example, we'll simulate capital growth up to the start of this week
  if (weekOffset > 0 || (weekOffset < 0 && currentDate > startOfWeek)) {
    // Simulate daily growth to estimate starting capital for this week
    const daysToSimulate = Math.abs(
      Math.floor((startOfWeek - currentDate) / (1000 * 60 * 60 * 24))
    );

    for (let i = 0; i < daysToSimulate; i++) {
      const dailyProfit = calculateDailyProfit(runningCapital);
      runningCapital += dailyProfit;

      // Apply any deposits or withdrawals that would have occurred
      const simulationDate = new Date(currentDate);
      simulationDate.setDate(simulationDate.getDate() + i);
      const dateString = simulationDate.toISOString().split("T")[0];

      runningCapital = applyTransactions(
        runningCapital,
        dateString,
        deposits,
        withdrawals
      );
    }
  }

  const weekStartingCapital = runningCapital;

  // Process each day in the week
  for (let i = 0; i < 7; i++) {
    const currentDay = new Date(startOfWeek);
    currentDay.setDate(startOfWeek.getDate() + i);
    const dateString = currentDay.toISOString().split("T")[0];

    // Find any transactions for this day
    const dayDeposits = deposits.filter((d) => d.dateOfDeposit === dateString);
    const dayWithdrawals = withdrawals.filter(
      (w) => w.dateOfWithdrawal === dateString
    );

    // Calculate profits for this day
    let dayResult;

    if (dayDeposits.length > 0 || dayWithdrawals.length > 0) {
      // Apply transactions in the correct order

      dayResult = processDayWithTransactions(
        runningCapital,
        dayDeposits,
        dayWithdrawals
      );
    } else {
      // Normal day without transactions
      dayResult = calculateDayProfits(runningCapital);
    }

    // Log the results for debugging

    // Update running capital for next day - THIS IS THE CRITICAL FIX
    runningCapital = dayResult.finalBalance;

    weeklyProfit += dayResult.totalProfit;

    // Format day of week
    const weekday = WEEKDAYS[currentDay.getDay()];
    const dayNum = currentDay.getDate();
    const daySuffix = getDaySuffix(dayNum);
    const formattedDate = `${weekday} ${dayNum}${daySuffix}`;

    // Add to daily details
    dailyDetails.push({
      date: currentDay,
      formattedDate,
      startingCapital: dayResult.startingCapital,
      signal1Capital: dayResult.signal1Capital,
      signal1Profit: dayResult.signal1Profit,
      signal2Capital: dayResult.signal2Capital,
      signal2Profit: dayResult.signal2Profit,
      totalProfit: dayResult.totalProfit,
      finalBalance: dayResult.finalBalance,
      transactions: {
        deposits: dayDeposits,
        withdrawals: dayWithdrawals,
      },
    });
  }

  // Calculate previous week's profit for comparison
  const previousWeekProfit =
    weekOffset !== 0
      ? getPreviousWeekProfit(
          startOfWeek,
          initialCapital,
          deposits,
          withdrawals
        )
      : null;

  // Calculate profit comparison if previous week data is available
  let profitComparison = null;
  if (previousWeekProfit !== null) {
    const profitDifference = weeklyProfit - previousWeekProfit;
    const percentageChange =
      previousWeekProfit !== 0
        ? (profitDifference / Math.abs(previousWeekProfit)) * 100
        : 0;

    profitComparison = {
      previousWeekProfit,
      currentWeekProfit: weeklyProfit,
      difference: profitDifference,
      percentageChange: percentageChange.toFixed(2) + "%",
      increased: profitDifference >= 0,
    };
  }

  return {
    weekDateRange,
    startDate: startOfWeek,
    endDate: endOfWeek,
    weekStartingCapital,
    weekEndingCapital: runningCapital,
    weeklyProfit,
    dailyDetails,
    profitComparison,
    navigation: {
      previousWeek: weekOffset - 1,
      currentWeek: 0,
      nextWeek: weekOffset + 1,
    },
  };
};

const processDayWithTransactions = (startingCapital, deposits, withdrawals) => {
  let capital = startingCapital;

  // Apply before-trade transactions
  const beforeTradeDeposits = deposits.filter(
    (d) => d.whenDepositHappened === "before-trade"
  );
  const beforeTradeWithdrawals = withdrawals.filter(
    (w) => w.whenWithdrawalHappened === "before-trade"
  );

  // Apply deposits first, then withdrawals
  for (const deposit of beforeTradeDeposits) {
    const totalDeposit = deposit.amount + (deposit.depositBonus || 0);
    capital += totalDeposit;
  }

  for (const withdrawal of beforeTradeWithdrawals) {
    console.log(`Subtracting before-trade withdrawal: ${withdrawal.amount}`);
    capital -= withdrawal.amount;
  }

  // First trade
  const firstTradeTotalAmount = capital * 0.01;
  const firstTradeProfit = firstTradeTotalAmount * 0.88;
  let balanceAfterFirstTrade = capital + firstTradeProfit;

  // Apply in-between trade transactions
  const inbetweenDeposits = deposits.filter(
    (d) => d.whenDepositHappened === "inbetween-trade"
  );
  const inbetweenWithdrawals = withdrawals.filter(
    (w) => w.whenWithdrawalHappened === "inbetween-trade"
  );

  for (const deposit of inbetweenDeposits) {
    const totalDeposit = deposit.amount + (deposit.depositBonus || 0);
    balanceAfterFirstTrade += totalDeposit;
  }

  for (const withdrawal of inbetweenWithdrawals) {
    balanceAfterFirstTrade -= withdrawal.amount;
  }

  // Second trade
  const secondTradeTotalAmount = balanceAfterFirstTrade * 0.01;
  const secondTradeProfit = secondTradeTotalAmount * 0.88;
  let finalBalance = balanceAfterFirstTrade + secondTradeProfit;

  // Apply after-trade transactions
  const afterTradeDeposits = deposits.filter(
    (d) => d.whenDepositHappened === "after-trade"
  );
  const afterTradeWithdrawals = withdrawals.filter(
    (w) => w.whenWithdrawalHappened === "after-trade"
  );

  for (const deposit of afterTradeDeposits) {
    const totalDeposit = deposit.amount + (deposit.depositBonus || 0);
    finalBalance += totalDeposit;
  }

  for (const withdrawal of afterTradeWithdrawals) {
    finalBalance -= withdrawal.amount;
  }

  const totalProfit = firstTradeProfit + secondTradeProfit;

  return {
    startingCapital: capital,
    balanceAfterFirstTrade,
    signal1Capital: firstTradeTotalAmount,
    signal1Profit: firstTradeProfit,
    signal2Capital: secondTradeTotalAmount,
    signal2Profit: secondTradeProfit,
    totalProfit,
    finalBalance,
  };
};

const applyTransactions = (capital, dateString, deposits, withdrawals) => {
  let updatedCapital = capital;

  // Apply deposits
  const dayDeposits = deposits.filter((d) => d.dateOfDeposit === dateString);
  for (const deposit of dayDeposits) {
    updatedCapital += deposit.amount + (deposit.depositBonus || 0);
  }

  // Apply withdrawals
  const dayWithdrawals = withdrawals.filter(
    (w) => w.dateOfWithdrawal === dateString
  );
  for (const withdrawal of dayWithdrawals) {
    updatedCapital -= withdrawal.amount;
  }

  return updatedCapital;
};

const getPreviousWeekProfit = (
  currentWeekStart,
  initialCapital,
  deposits,
  withdrawals
) => {
  const previousWeekStart = new Date(currentWeekStart);
  previousWeekStart.setDate(previousWeekStart.getDate() - 7);

  const previousWeekEnd = new Date(currentWeekStart);
  previousWeekEnd.setDate(previousWeekEnd.getDate() - 1);

  let simulatedCapital = initialCapital;
  let previousWeekProfit = 0;

  // Simulate up to previous week start (if needed)
  // In a real implementation, you would retrieve this data from your store
  const daysToSimulateToPreviousWeek = Math.max(
    0,
    Math.floor(
      (previousWeekStart - new Date("2025-02-23")) / (1000 * 60 * 60 * 24)
    )
  );

  for (let i = 0; i < daysToSimulateToPreviousWeek; i++) {
    const simulationDate = new Date("2025-02-23");
    simulationDate.setDate(simulationDate.getDate() + i);
    const dateString = simulationDate.toISOString().split("T")[0];

    const dayDeposits = deposits.filter((d) => d.dateOfDeposit === dateString);
    const dayWithdrawals = withdrawals.filter(
      (w) => w.dateOfWithdrawal === dateString
    );

    let dayResult;
    if (dayDeposits.length > 0 || dayWithdrawals.length > 0) {
      dayResult = processDayWithTransactions(
        simulatedCapital,
        dayDeposits,
        dayWithdrawals
      );
    } else {
      dayResult = calculateDayProfits(simulatedCapital);
    }

    // Critical fix - properly update the simulated capital
    simulatedCapital = dayResult.finalBalance;
  }

  // Simulate previous week to calculate profit
  for (let i = 0; i < 7; i++) {
    const currentDay = new Date(previousWeekStart);
    currentDay.setDate(previousWeekStart.getDate() + i);
    const dateString = currentDay.toISOString().split("T")[0];

    const dayDeposits = deposits.filter((d) => d.dateOfDeposit === dateString);
    const dayWithdrawals = withdrawals.filter(
      (w) => w.dateOfWithdrawal === dateString
    );

    let dayResult;
    if (dayDeposits.length > 0 || dayWithdrawals.length > 0) {
      dayResult = processDayWithTransactions(
        simulatedCapital,
        dayDeposits,
        dayWithdrawals
      );
    } else {
      dayResult = calculateDayProfits(simulatedCapital);
    }

    // Critical fix - properly update the simulated capital
    simulatedCapital = dayResult.finalBalance;
    previousWeekProfit += dayResult.totalProfit;
  }

  return previousWeekProfit;
};

const calculateDailyProfit = (capital) => {
  const firstTradeAmount = capital * 0.01;
  const firstTradeProfit = firstTradeAmount * 0.88;

  const capitalAfterFirstTrade = capital + firstTradeProfit;

  const secondTradeAmount = capitalAfterFirstTrade * 0.01;
  const secondTradeProfit = secondTradeAmount * 0.88;

  return firstTradeProfit + secondTradeProfit;
};

const calculateDayProfits = (
  initialBalance,
  transactionInfo = null,
  transactionTiming = null
) => {
  //   console.log(`Starting calculation with balance: ${initialBalance}`);
  //   console.log(`Transaction info:`, transactionInfo);
  //   console.log(`Transaction timing: ${transactionTiming}`);

  // First trade calculations
  const firstTradeTotalAmount = initialBalance * 0.01;
  const firstTradeProfit = firstTradeTotalAmount * 0.88;
  //   console.log(
  //     `First trade amount: ${firstTradeTotalAmount}, profit: ${firstTradeProfit}`
  //   );

  // Calculate balance after first trade
  let balanceAfterFirstTrade = initialBalance + firstTradeProfit;
  //   console.log(`Balance after first trade: ${balanceAfterFirstTrade}`);

  // Handle transaction if it's in-between trades
  let effectiveSecondTradeBalance = balanceAfterFirstTrade;
  //   console.log(
  //     `Initial effective second trade balance: ${effectiveSecondTradeBalance}`
  //   );

  if (transactionInfo) {
    if (transactionTiming === "inbetween-trade") {
      // Handle deposit
      if (transactionInfo.depositedAmount !== undefined) {
        const depositAdd =
          transactionInfo.depositedAmount + (transactionInfo.depositBonus || 0);
        //  console.log(`Adding deposit of ${depositAdd} between trades`);
        effectiveSecondTradeBalance += depositAdd;
        // console.log(
        //   `Updated effective second trade balance: ${effectiveSecondTradeBalance}`
        // );
      }
    }
  }

  // Second trade calculations based on the effective balance
  const secondTradeTotalAmount = effectiveSecondTradeBalance * 0.01;
  const secondTradeProfit = secondTradeTotalAmount * 0.88;
  //   console.log(
  //     `Second trade amount: ${secondTradeTotalAmount}, profit: ${secondTradeProfit}`
  //   );

  //
  let finalBalance = effectiveSecondTradeBalance + secondTradeProfit;
  //   console.log(`Initial final balance: ${finalBalance}`);

  // Handle transaction if it's after trades
  if (transactionInfo && transactionTiming === "after-trade") {
    // Handle deposit
    if (transactionInfo.depositedAmount !== undefined) {
      const depositAdd =
        transactionInfo.depositedAmount + (transactionInfo.depositBonus || 0);
      //   console.log(`Adding deposit of ${depositAdd} after trades`);
      finalBalance += depositAdd;
      //   console.log(`Updated final balance: ${finalBalance}`);
    }
  }

  const totalProfit = firstTradeProfit + secondTradeProfit;
  //   console.log(`Total profit for day: ${totalProfit}`);

  const result = {
    startingCapital: initialBalance,
    balanceAfterFirstTrade: balanceAfterFirstTrade,
    signal1Capital: firstTradeTotalAmount,
    signal1Profit: firstTradeProfit,
    signal2Capital: secondTradeTotalAmount,
    signal2Profit: secondTradeProfit,
    totalProfit: totalProfit,
    finalBalance: finalBalance,
  };

  return result;
};

export {
  processDayWithTransactions,
  applyTransactions,
  getPreviousWeekProfit,
  generateWeeklyDetails,
};
