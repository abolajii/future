import React from "react";
import styled from "styled-components";
import { TrendingUp, TrendingDown } from "lucide-react";

const ComparisonContainer = styled.div`
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  background-color: ${(props) =>
    props.increased ? "rgba(74, 222, 128, 0.1)" : "rgba(248, 113, 113, 0.1)"};
  border-radius: 0.5rem;
  margin-top: 0.5rem;
`;

const IconContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  background-color: ${(props) =>
    props.increased ? "rgba(74, 222, 128, 0.2)" : "rgba(248, 113, 113, 0.2)"};
  margin-right: 1rem;
`;

const ComparisonDetails = styled.div`
  display: flex;
  flex-direction: column;
`;

const PercentageChange = styled.div`
  font-weight: bold;
  font-size: 1rem;
  color: ${(props) => (props.increased ? "#4ade80" : "#f87171")};
`;

const ComparisonText = styled.div`
  color: #a0a0a0;
  font-size: 0.75rem;
`;

const Comparison = ({ comparison, currency = "USD" }) => {
  if (!comparison) return null;

  const { increased, percentageChange, difference } = comparison;

  const formatAmount = (value = 0, nairaRate = 1600) => {
    const options = {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    };

    const amount = currency === "NGN" ? value * nairaRate : value;
    const formattedAmount = amount.toLocaleString("en-US", options);
    return `${currency === "NGN" ? "₦" : "$"}${formattedAmount}`;
  };

  return (
    <ComparisonContainer increased={increased}>
      <IconContainer increased={increased}>
        {increased ? (
          <TrendingUp size={18} color="#4ade80" />
        ) : (
          <TrendingDown size={18} color="#f87171" />
        )}
      </IconContainer>
      <ComparisonDetails>
        <PercentageChange increased={increased}>
          {/* {increased ? "+" : "-"} */}
          {/* {percentageChange} */}
          {/* <div className="info">
            <div>A</div>
            <div>B</div>
          </div> */}
          {formatAmount(Math.abs(difference, currency))}
        </PercentageChange>
        <ComparisonText>
          {/* {increased ? "Increase" : "Decrease"} of{" "} */}
          more than last week
        </ComparisonText>
      </ComparisonDetails>
    </ComparisonContainer>
  );
};

export default Comparison;
