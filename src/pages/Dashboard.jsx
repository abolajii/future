import React, { useState } from "react";
import Stats from "../components/Stats";
import WelcomeUser from "../components/WelcomeUser";
import styled from "styled-components";
import Chart from "../components/Chart";
import Notification from "../components/Notification";
import DailyProfit from "../components/DailyProfit";

const FlexContainer = styled.div`
  display: flex;
  gap: 20px;
  margin-bottom: 30px;
  /* align-items: start; */
  /* background-color: red; */
`;
const Dashboard = () => {
  const [currency, setCurrency] = useState("USD");
  const [isHidden, setIsHidden] = useState(true);
  const [loading, setLoading] = useState(true);

  const formatValue = (value = 0, nairaRate = 1600) => {
    const options = {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    };

    const amount = currency === "NGN" ? value * nairaRate : value;
    const formattedAmount = amount.toLocaleString("en-US", options);
    return `${currency === "NGN" ? "₦" : "$"}${formattedAmount}`;
  };

  return (
    <div>
      {/* welcome user */}
      {/* stats widget */}
      <WelcomeUser
        currency={currency}
        setCurrency={setCurrency}
        isHidden={isHidden}
        setIsHidden={setIsHidden}
      />
      {/* <Notification /> */}
      <Stats isHidden={isHidden} formatValue={formatValue} />
      <FlexContainer>
        <Chart isHidden={loading} />
        <Notification setIsHidden={setLoading} />
      </FlexContainer>
      <DailyProfit formatAmount={formatValue} />

      {/* charts */}
      {/* daily signals */}
    </div>
  );
};

export default Dashboard;
