import React, { useEffect, useState } from "react";
import { TradingSchedule } from "../utils/tradingUtils";

const OtherWeek = ({ lastWeekEndCapital, lastWeekEndDate, weekOffset }) => {
  const [trading] = useState(new TradingSchedule()); // You'll need to import your Trading class
  const [weeklyData, setWeeklyData] = useState([]);
  const [upperWeek, setUpperWeek] = useState(lastWeekEndDate);
  const [upperWeekCapital, setUpperWeekCapital] = useState(lastWeekEndCapital);

  const generateWeeklyData = () => {
    const newWeeklyData = trading.generateWeeklyDetails(
      [],
      upperWeekCapital,
      upperWeek
    );
    setWeeklyData(newWeeklyData);
  };

  useEffect(() => {
    generateWeeklyData();
  }, [weekOffset]);

  //   useEffect(() => {
  //     // generateWeeklyData();
  //     const lastWeekEndDate = weeklyData[weeklyData.length - 1]?.fullDate;
  //     const lastWeekEndCapital =
  //       weeklyData[weeklyData.length - 1]?.balanceAfterSecondTrade;

  //     setUpperWeek(lastWeekEndDate);
  //     setUpperWeekCapital(lastWeekEndCapital);
  //   }, [weekOffset]);

  console.log(weeklyData, "Weekly data", weekOffset);
  return <div>OtherWeek</div>;
};

export default OtherWeek;
