export const MONTHS = [
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

export const WEEKDAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export const formatCurrency = (amount, currency = "USD") => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
    currencyDisplay: "symbol",
  }).format(amount);
};

export const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export const calculateDayProfits = (
  initialBalance,
  depositInfo = null,
  whenDepositHappened = null
) => {
  // First trade calculations
  const firstTradeTotalAmount = initialBalance * 0.01;
  const firstTradeProfit = firstTradeTotalAmount * 0.88;

  // Calculate balance after first trade
  let balanceAfterFirstTrade = initialBalance + firstTradeProfit;

  // Handle deposit if it's in-between trades
  let effectiveSecondTradeBalance = balanceAfterFirstTrade;
  if (depositInfo && whenDepositHappened === "inbetween-trade") {
    effectiveSecondTradeBalance +=
      depositInfo.depositedAmount + (depositInfo.depositBonus || 0);
  }

  // Second trade calculations based on the effective balance
  const secondTradeTotalAmount = effectiveSecondTradeBalance * 0.01;
  const secondTradeProfit = secondTradeTotalAmount * 0.88;

  // Calculate final balance
  let finalBalance = effectiveSecondTradeBalance + secondTradeProfit;

  // Handle deposit if it's after trades
  if (depositInfo && whenDepositHappened === "after-trade") {
    finalBalance +=
      depositInfo.depositedAmount + (depositInfo.depositBonus || 0);
  }

  // Calculate total profit
  let totalProfit;
  if (depositInfo) {
    if (whenDepositHappened === "inbetween-trade") {
      totalProfit = firstTradeProfit + secondTradeProfit;
    } else if (whenDepositHappened === "after-trade") {
      totalProfit = firstTradeProfit + secondTradeProfit;
    } else {
      totalProfit = firstTradeProfit + secondTradeProfit;
    }
  } else {
    totalProfit = firstTradeProfit + secondTradeProfit;
  }

  return {
    startingCapital: initialBalance,
    signal1Capital: firstTradeTotalAmount,
    signal1Profit: firstTradeProfit,
    signal2Capital: secondTradeTotalAmount,
    signal2Profit: secondTradeProfit,
    totalProfit: totalProfit,
    finalBalance: finalBalance,
  };
};
export class TradingSchedule {
  constructor(initialCapital) {
    this.yearlyData = [];
    this.initialCapital = initialCapital;
    this.processedDates = new Set();
  }

  generateYearlyData(deposits = []) {
    const currentDate = new Date("2025-02-23");
    let runningCapital = this.initialCapital;
    const currentYear = currentDate.getFullYear();

    this.yearlyData = [];
    this.processedDates.clear();

    for (
      let monthIndex = currentDate.getMonth();
      monthIndex < 12;
      monthIndex++
    ) {
      const daysInMonth = new Date(currentYear, monthIndex + 1, 0).getDate();
      const startDay =
        monthIndex === currentDate.getMonth() ? currentDate.getDate() : 1;

      for (let day = startDay; day <= daysInMonth; day++) {
        const date = new Date(currentYear, monthIndex, day);
        const dateString = new Date(
          currentYear,
          monthIndex,
          day
        ).toLocaleDateString("en-CA");
        const depositInfo = deposits.find(
          (d) => d?.dateOfDeposit === dateString
        );

        if (depositInfo && depositInfo.whenDepositHappened === "before-trade") {
          runningCapital +=
            depositInfo.amount + (depositInfo.depositBonus || 0);
        }

        if (this.processedDates.has(dateString)) continue;

        this.processedDates.add(dateString);
        const weekday = WEEKDAYS[date.getDay()];
        const month = MONTHS[monthIndex];
        const daySuffix = this.getDaySuffix(day);
        const formattedDate = `${weekday} ${day}${daySuffix}`;

        const { firstSignalPassed, secondSignalPassed } = this.checkTime(date);
        // const profits = calculateDayProfits(runningCapital);

        let dayProfits;
        if (depositInfo) {
          // Only pass deposit info to calculateDayProfits for "in-between" and "completed" cases
          if (depositInfo.whenDepositHappened !== "before-trade") {
            dayProfits = calculateDayProfits(
              runningCapital,
              {
                depositedAmount: depositInfo.amount,
                depositBonus: depositInfo.depositBonus || 0,
              },
              depositInfo.whenDepositHappened
            );
          } else {
            // For "before-trade" deposits, we've already added it to runningCapital
            dayProfits = calculateDayProfits(runningCapital);
          }
        } else {
          dayProfits = calculateDayProfits(runningCapital);
        }

        let adjustedTotalProfit = dayProfits.totalProfit;
        if (depositInfo) {
          // Don't subtract deposit amount from total profit for "before-trade" deposits
          // as it's already handled in calculateDayProfits
          if (depositInfo.whenDepositHappened !== "before-trade") {
            adjustedTotalProfit =
              dayProfits.finalBalance - runningCapital - depositInfo.amount;
          }
        }

        const tradeData = {
          month,
          weekday,
          date: formattedDate,
          fullDate: dateString,
          balanceBeforeTrade: runningCapital,
          signal1Capital: dayProfits.signal1Capital,
          signal1Profit: dayProfits.signal1Profit,
          signal2Capital: dayProfits.signal2Capital,
          signal2Profit: dayProfits.signal2Profit,
          totalProfit: adjustedTotalProfit,
          balanceAfterTrade: dayProfits.finalBalance,
          firstSignalPassed,
          secondSignalPassed,
          scheduledWithdraw: false,
          withdrawalAmount: 0,
          withdrawalTime: null,
          depositInfo,
        };

        this.yearlyData.push(tradeData);
        runningCapital = dayProfits.finalBalance;
      }
    }

    return this.yearlyData;
  }

  scheduledWithdraw(dateString, amount, withdrawalTime = "after-trade") {
    if (
      !["before-trade", "inbetween-trade", "after-trade"].includes(
        withdrawalTime
      )
    ) {
      throw new Error("Invalid withdrawal time");
    }

    const dayIndex = this.yearlyData.findIndex(
      (entry) => entry.fullDate === dateString
    );
    if (dayIndex === -1) {
      return {
        success: false,
        message: "No matching date found for withdrawal.",
      };
    }

    const tradeDay = this.yearlyData[dayIndex];
    const relevantBalance =
      withdrawalTime === "before-trade"
        ? tradeDay.balanceBeforeTrade
        : withdrawalTime === "inbetween-trade"
        ? tradeDay.balanceBeforeTrade + tradeDay.signal1Profit
        : tradeDay.balanceAfterTrade;

    if (relevantBalance < amount) {
      return {
        success: false,
        message: "Insufficient balance for withdrawal.",
      };
    }

    tradeDay.scheduledWithdraw = true;
    tradeDay.withdrawalAmount = amount;
    tradeDay.withdrawalTime = withdrawalTime;

    // Update the current day's calculations based on withdrawal timing
    if (withdrawalTime === "before-trade") {
      const newProfits = calculateDayProfits(
        tradeDay.balanceBeforeTrade - amount
      );
      Object.assign(tradeDay, {
        balanceBeforeTrade: tradeDay.balanceBeforeTrade - amount,
        signal1Capital: newProfits.signal1Capital,
        signal1Profit: newProfits.signal1Profit,
        signal2Capital: newProfits.signal2Capital,
        signal2Profit: newProfits.signal2Profit,
        totalProfit: newProfits.totalProfit,
        balanceAfterTrade: newProfits.finalBalance,
      });
    } else if (withdrawalTime === "inbetween-trade") {
      const newProfits = calculateDayProfits(
        tradeDay.balanceBeforeTrade,
        { withdrawalAmount: amount },
        "in-between"
      );
      Object.assign(tradeDay, {
        signal2Capital: newProfits.signal2Capital,
        signal2Profit: newProfits.signal2Profit,
        totalProfit: newProfits.totalProfit,
        balanceAfterTrade: newProfits.finalBalance - amount,
      });
    } else {
      // after-trade
      tradeDay.balanceAfterTrade -= amount;
    }

    // Critical fix: Update all subsequent days with new running capital
    let newRunningCapital = tradeDay.balanceAfterTrade;
    for (let i = dayIndex + 1; i < this.yearlyData.length; i++) {
      const profits = calculateDayProfits(newRunningCapital);

      this.yearlyData[i] = {
        ...this.yearlyData[i],
        balanceBeforeTrade: newRunningCapital,
        signal1Capital: profits.signal1Capital,
        signal1Profit: profits.signal1Profit,
        signal2Capital: profits.signal2Capital,
        signal2Profit: profits.signal2Profit,
        totalProfit: profits.totalProfit,
        balanceAfterTrade: profits.finalBalance,
      };

      newRunningCapital = profits.finalBalance;
    }

    return {
      success: true,
      message: `Withdrawal of ${amount} scheduled for ${dateString} ${withdrawalTime}.`,
    };
  }

  checkTime(date) {
    const now = new Date();
    const signalTimes = {
      firstSignalTime: 15,
      secondSignalTime: 20,
    };

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const inputDate = new Date(date);
    inputDate.setHours(0, 0, 0, 0);

    if (inputDate < today) {
      return { firstSignalPassed: true, secondSignalPassed: true };
    } else if (inputDate.getTime() === today.getTime()) {
      const currentHour = now.getHours();
      return {
        firstSignalPassed: currentHour >= signalTimes.firstSignalTime,
        secondSignalPassed: currentHour >= signalTimes.secondSignalTime,
      };
    }
    return { firstSignalPassed: false, secondSignalPassed: false };
  }

  getDaySuffix(day) {
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
  }
  // fix only thiis code here
  generateWeeklyDetails(
    deposits = [],
    startingCapital = 0,
    lastWeekEndDate = null
  ) {
    const daysOfWeek = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];

    const MS_IN_A_DAY = 24 * 60 * 60 * 1000;

    const startDate = lastWeekEndDate
      ? new Date(new Date(lastWeekEndDate).getTime() + 7 * MS_IN_A_DAY)
      : new Date();

    const sundayDate = new Date(startDate);
    sundayDate.setDate(startDate.getDate() - startDate.getDay());
    sundayDate.setUTCHours(0, 0, 0, 0);

    let runningCapital = startingCapital;
    const weeklyDetails = [];

    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(sundayDate);
      currentDate.setDate(sundayDate.getDate() + i);
      currentDate.setUTCHours(0, 0, 0, 0);

      const dateString = currentDate.toISOString().split("T")[0];
      const depositInfo = deposits.find((d) => d?.dateOfDeposit === dateString);

      // Apply deposit before calculating profits if deposit time is "before-trade"
      if (depositInfo && depositInfo.whenDepositHappened === "before-trade") {
        runningCapital += depositInfo.amount + (depositInfo.depositBonus || 0);
      }

      const { firstSignalPassed, secondSignalPassed } =
        this.checkTime(currentDate);

      let dayProfits;
      if (depositInfo) {
        // Only pass deposit info to calculateDayProfits for "in-between" and "completed" cases
        if (depositInfo.whenDepositHappened !== "before-trade") {
          dayProfits = calculateDayProfits(
            runningCapital,
            {
              depositedAmount: depositInfo.amount,
              depositBonus: depositInfo.depositBonus || 0,
            },
            depositInfo.whenDepositHappened
          );
        } else {
          // For "before-trade" deposits, we've already added it to runningCapital
          dayProfits = calculateDayProfits(runningCapital);
        }
      } else {
        dayProfits = calculateDayProfits(runningCapital);
      }

      const formattedDate = `${
        daysOfWeek[currentDate.getDay()]
      } ${currentDate.getDate()}${this.getDaySuffix(currentDate.getDate())}`;

      // Calculate total profit correctly based on deposit timing
      let adjustedTotalProfit = dayProfits.totalProfit;
      if (depositInfo) {
        // Don't subtract deposit amount from total profit for "before-trade" deposits
        // as it's already handled in calculateDayProfits
        if (depositInfo.whenDepositHappened !== "before-trade") {
          adjustedTotalProfit =
            dayProfits.finalBalance - runningCapital - depositInfo.amount;
        }
      }

      weeklyDetails.push({
        date: formattedDate,
        startingCapital: runningCapital,
        fullDate: dateString,
        balanceBeforeFirstTrade: dayProfits.startingCapital,
        signal1Capital: dayProfits.signal1Capital,
        signal2Capital: dayProfits.signal2Capital,
        signal1Profit: dayProfits.signal1Profit,
        signal2Profit: dayProfits.signal2Profit,
        totalProfit: adjustedTotalProfit,
        balanceAfterSecondTrade: dayProfits.finalBalance,
        firstSignalPassed,
        secondSignalPassed,
        scheduledWithdraw: false,
        withdrawalAmount: 0,
        withdrawalTime: null,
        depositInfo,
      });

      runningCapital = dayProfits.finalBalance;
    }

    return weeklyDetails;
  }

  generateSevenDaysDetails(
    startingCapital = 0,
    lastWeekEndDate = null,
    deposits = []
  ) {
    const daysOfWeek = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];

    // Calculate the start date (Sunday) for the next week
    const MS_IN_A_DAY = 24 * 60 * 60 * 1000;
    const lastWeekDate = new Date(lastWeekEndDate);

    // Get the next Sunday
    const sundayDate = new Date(lastWeekDate.getTime() + MS_IN_A_DAY);
    while (sundayDate.getDay() !== 0) {
      sundayDate.setTime(sundayDate.getTime() + MS_IN_A_DAY);
    }
    sundayDate.setUTCHours(0, 0, 0, 0);

    let runningCapital = startingCapital;
    const weeklyDetails = [];

    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(sundayDate);
      currentDate.setDate(sundayDate.getDate() + i);
      currentDate.setUTCHours(0, 0, 0, 0);

      const dateString = currentDate.toISOString().split("T")[0];
      const depositInfo = deposits.find((d) => d?.dateOfDeposit === dateString);

      // Apply deposit before calculating profits if deposit time is "before-trade"
      if (depositInfo && depositInfo.whenDepositHappened === "before-trade") {
        runningCapital += depositInfo.amount + (depositInfo.depositBonus || 0);
      }

      const { firstSignalPassed, secondSignalPassed } =
        this.checkTime(currentDate);

      let dayProfits;
      if (depositInfo) {
        // Only pass deposit info to calculateDayProfits for "in-between" and "completed" cases
        if (depositInfo.whenDepositHappened !== "before-trade") {
          dayProfits = calculateDayProfits(
            runningCapital,
            {
              depositedAmount: depositInfo.amount,
              depositBonus: depositInfo.depositBonus || 0,
            },
            depositInfo.whenDepositHappened
          );
        } else {
          // For "before-trade" deposits, we've already added it to runningCapital
          dayProfits = calculateDayProfits(runningCapital);
        }
      } else {
        dayProfits = calculateDayProfits(runningCapital);
      }

      const formattedDate = `${
        daysOfWeek[currentDate.getDay()]
      } ${currentDate.getDate()}${this.getDaySuffix(currentDate.getDate())}`;

      // Calculate total profit correctly based on deposit timing
      let adjustedTotalProfit = dayProfits.totalProfit;
      if (depositInfo) {
        // Don't subtract deposit amount from total profit for "before-trade" deposits
        // as it's already handled in calculateDayProfits
        if (depositInfo.whenDepositHappened !== "before-trade") {
          adjustedTotalProfit =
            dayProfits.finalBalance - runningCapital - depositInfo.amount;
        }
      }

      weeklyDetails.push({
        date: formattedDate,
        startingCapital: runningCapital,
        fullDate: dateString,
        balanceBeforeFirstTrade: dayProfits.startingCapital,
        signal1Capital: dayProfits.signal1Capital,
        signal2Capital: dayProfits.signal2Capital,
        signal1Profit: dayProfits.signal1Profit,
        signal2Profit: dayProfits.signal2Profit,
        totalProfit: adjustedTotalProfit,
        balanceAfterSecondTrade: dayProfits.finalBalance,
        firstSignalPassed,
        secondSignalPassed,
        scheduledWithdraw: false,
        withdrawalAmount: 0,
        withdrawalTime: null,
        depositInfo,
      });

      runningCapital = dayProfits.finalBalance;
    }

    return weeklyDetails;
  }
}

export const formatValue = (value = 0, currency, nairaRate = 1600) => {
  const options = {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  };

  const amount = currency === "NGN" ? value * nairaRate : value;
  const formattedAmount = amount.toLocaleString("en-US", options);
  return `${currency === "NGN" ? "₦" : "$"}${formattedAmount}`;
};
