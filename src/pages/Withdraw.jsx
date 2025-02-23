import React, { useState } from "react";
import styled from "styled-components";
import { formatValue } from "../utils/tradingUtils";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import Monthly from "../components/Monthly";
import useAuthStore from "../store/authStore";

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;

  .empty {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.25rem;
    color: #ffffff;
    font-weight: 600;
  }
`;

const Card = styled.div`
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
  margin-bottom: 1rem;
  border: 1px solid #ff980020;
  background: #25262b;
  max-width: 400px;
  width: 100%;
`;

const CardHeader = styled.div`
  padding: 1.25rem;
  border-bottom: 1px solid #ff980020;
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

const Title = styled.p``;

const Balance = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: ${(props) => props.theme.text};
  display: flex;
  align-items: center;
  /* justify-content: center; */
`;

const CurrencyToggle = styled.button`
  width: 100%;
  padding: 0.5rem 1rem;
  color: white;
  outline: none;
  border-radius: 0.375rem;
  font-weight: 500;
  font-size: 0.875rem;

  cursor: pointer;
  transition: opacity 0.2s;
  border: none;
  border: 1px solid #ff980020;

  &:hover {
    opacity: 0.9;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  margin-top: 5px;
  background-color: #25262b;

  &:hover {
    background-color: #222222;
    border: 1px solid #ff980020;
  }
`;

const Withdraw = () => {
  const [isBalanceVisible, setIsBalanceVisible] = useState(false);
  const [currency, setCurrency] = useState("USD");
  const { user } = useAuthStore();
  const toggleBalanceVisibility = () => {
    setIsBalanceVisible((prev) => !prev);
  };
  const toggleCurrency = () => {
    setCurrency((prev) => (prev === "USD" ? "NGN" : "USD"));
    // setAmount("");
  };
  return (
    <div>
      <Header>
        <div className="empty"></div>
        <Card>
          <CardHeader>
            <CardTitle>Current Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <Balance>
              {isBalanceVisible
                ? formatValue(user.running_capital, currency)
                : "****"}
              <button
                onClick={toggleBalanceVisibility}
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  marginLeft: "10px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  {isBalanceVisible ? (
                    <FaEyeSlash color="#fff" size={18} />
                  ) : (
                    <FaEye color="#fff" size={18} />
                  )}
                </div>
              </button>
            </Balance>
            <CurrencyToggle onClick={toggleCurrency}>
              Switch to {currency === "USD" ? "NGN" : "USD"}
            </CurrencyToggle>
          </CardContent>
        </Card>
      </Header>
      <Monthly formatAmount={formatValue} />
    </div>
  );
};

export default Withdraw;
