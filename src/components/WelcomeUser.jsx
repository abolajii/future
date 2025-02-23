import { Eye, EyeOff } from "lucide-react";
import React, { useState } from "react";
import styled from "styled-components";
import useAuthStore from "../store/authStore";

const Header = styled.div`
  display: flex;
  align-items: center;
  color: #ffffff;
  justify-content: space-between;
  margin: 10px 0 0;
`;

const UserName = styled.div`
  display: flex;
  align-items: center;
  margin-right: 1rem;
  font-size: 1.2rem;
  span {
    margin-left: 0.3rem;
  }
`;

const CurrencyToggle = styled.button`
  background: ${(props) => (props.active ? "#4c6ef5" : "#2c2d30")};
  color: white;
  border: none;
  padding: 0.4rem;
  font-size: 15px;
  border-radius: 6px;
  cursor: pointer;
  margin-right: 0.5rem;
  transition: background-color 0.2s;

  &:hover {
    background: ${(props) => (props.active ? "#4c6ef5" : "#3c3d40")};
  }
`;

const ToggleContainer = styled.div`
  margin-bottom: 1rem;
  display: flex;
  gap: 0.5rem;
`;

const VisibilityButton = styled.button`
  display: flex;
  align-items: center;
  cursor: pointer;
  border: none;
  background: none;
  padding: 0.5rem;
  border-radius: 6px;
  transition: background-color 0.2s ease-in-out;

  &:hover {
    background-color: rgba(245, 159, 0, 0.1);
  }
`;

const WelcomeUser = ({ currency, setCurrency, isHidden, setIsHidden }) => {
  const handleCurrencyToggle = (newCurrency) => {
    setCurrency(newCurrency);
  };

  const { user } = useAuthStore();

  const toggleVisibility = () => setIsHidden(!isHidden);

  return (
    <Header>
      <UserName>
        Welcome, <span>{user.username}.</span>
      </UserName>
      <ToggleContainer>
        <VisibilityButton onClick={toggleVisibility}>
          {isHidden ? (
            <EyeOff size={20} color="#f59f00" />
          ) : (
            <Eye size={20} color="#f59f00" />
          )}
        </VisibilityButton>
        <CurrencyToggle
          active={currency === "USD"}
          onClick={() => handleCurrencyToggle("USD")}
        >
          USD
        </CurrencyToggle>
        <CurrencyToggle
          active={currency === "NGN"}
          onClick={() => handleCurrencyToggle("NGN")}
        >
          NGN
        </CurrencyToggle>
      </ToggleContainer>
    </Header>
  );
};

export default WelcomeUser;
