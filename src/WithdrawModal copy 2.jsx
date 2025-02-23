import React, { useState } from "react";
import styled from "styled-components";
import { formatDate, formatCurrency } from "./utils/tradingUtils";
const CurrencyButtons = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const CurrencyButton = styled.button`
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  border: none;
  cursor: pointer;
  background-color: ${(props) => (props.active ? "#3498db" : "#e2e8f0")};
  color: ${(props) => (props.active ? "white" : "#4a5568")};
`;
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 8px;
  width: 100%;
  max-width: 500px;
`;

const ModalHeader = styled.h2`
  margin-top: 0;
  margin-bottom: 1.5rem;
  color: #2c3e50;
  font-size: 1.5rem;
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: bold;
  color: #2c3e50;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;

  &:focus {
    outline: none;
    border-color: #3498db;
    box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  background-color: white;

  &:focus {
    outline: none;
    border-color: #3498db;
    box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
  }
`;

const DateGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
  margin-bottom: 1.5rem;
`;

const DateButton = styled.button`
  padding: 0.5rem;
  border-radius: 0.375rem;
  border: 1px solid ${(props) => (props.selected ? "#3498db" : "#e2e8f0")};
  background: ${(props) => (props.selected ? "#ebf8ff" : "white")};
  opacity: ${(props) => (props.disabled ? 0.5 : 1)};
  cursor: ${(props) => (props.disabled ? "not-allowed" : "pointer")};

  &:hover:not(:disabled) {
    border-color: #bee3f8;
  }
`;

const DateText = styled.div`
  font-size: 0.875rem;
`;

const DateBalance = styled.div`
  font-size: 0.75rem;
  color: #718096;
`;

const DisplayValue = styled.div`
  padding: 0.75rem;
  background-color: #f8f9fa;
  border-radius: 4px;
  border: 1px solid #dee2e6;
  color: #495057;
  font-size: 1rem;
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
`;

const ModalTitle = styled.h2`
  margin-top: 0;
  margin-bottom: 1.5rem;
  color: #2c3e50;
  font-size: 1.5rem;
`;

const Button = styled.button`
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.2s ease;

  ${(props) =>
    props.primary
      ? `
    background: #3498db;
    color: white;
    &:hover {
      background: #2980b9;
    }
  `
      : `
    background: #e9ecef;
    color: #212529;
    &:hover {
      background: #dee2e6;
    }
  `}

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  color: #dc3545;
  font-size: 0.875rem;
  margin-top: 0.5rem;
`;

const WithdrawModal = ({
  isOpen,
  onClose,
  monthData,
  onSubmit,
  currency,
  usdToNgn,
}) => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [amount, setAmount] = useState("");
  const [withdrawalTime, setWithdrawalTime] = useState("after-trade");
  const [error, setError] = useState("");

  const formatAmount = (amount) => {
    const value = currency === "NGN" ? amount * usdToNgn : amount;
    return formatCurrency(value, currency);
  };

  const getMaxWithdrawal = () => {
    if (!selectedDate) return 0;
    switch (withdrawalTime) {
      case "before-trade":
        return selectedDate.balanceBeforeTrade;
      case "inbetween-trade":
        return selectedDate.balanceBeforeTrade + selectedDate.signal1Profit;
      case "after-trade":
        return selectedDate.balanceAfterTrade;
      default:
        return 0;
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const withdrawalAmount = parseFloat(amount);
    const maxAmount = getMaxWithdrawal();

    if (withdrawalAmount <= 0) {
      setError("Withdrawal amount must be greater than 0");
      return;
    }

    if (withdrawalAmount > maxAmount) {
      setError(`Maximum withdrawal amount is ${formatAmount(maxAmount)}`);
      return;
    }

    onSubmit(selectedDate, withdrawalAmount, withdrawalTime);
  };

  if (!isOpen) return null;

  return (
    <ModalOverlay>
      <ModalContent>
        <ModalTitle>Schedule Withdrawal</ModalTitle>

        <div>
          <h3>Select Date</h3>
          <DateGrid>
            {monthData.map((day) => (
              <DateButton
                key={day.date}
                onClick={() => setSelectedDate(day)}
                selected={selectedDate?.date === day.date}
                disabled={day.scheduledWithdraw}
              >
                <DateText>{day.date}</DateText>
                <DateBalance>{formatAmount(day.balanceAfterTrade)}</DateBalance>
              </DateButton>
            ))}
          </DateGrid>
        </div>

        {selectedDate && (
          <form onSubmit={handleSubmit}>
            <FormGroup>
              <Label>Withdrawal Timing</Label>
              <Select
                value={withdrawalTime}
                onChange={(e) => {
                  setWithdrawalTime(e.target.value);
                  setError("");
                }}
                required
              >
                <option value="before-trade">Before Trade</option>
                <option value="inbetween-trade">Between Trades</option>
                <option value="after-trade">After Trade</option>
              </Select>
            </FormGroup>

            <FormGroup>
              <Label>Withdrawal Amount</Label>
              <Input
                type="number"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  setError("");
                }}
                placeholder={`Maximum: ${formatAmount(getMaxWithdrawal())}`}
                required
                min="0"
                step="0.01"
                max={getMaxWithdrawal()}
              />
              {error && <ErrorMessage>{error}</ErrorMessage>}
            </FormGroup>

            <ButtonGroup>
              <Button type="button" onClick={onClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                primary
                disabled={!selectedDate || !amount || parseFloat(amount) <= 0}
              >
                Schedule Withdrawal
              </Button>
            </ButtonGroup>
          </form>
        )}
      </ModalContent>
    </ModalOverlay>
  );
};

export default WithdrawModal;
