import React, { useState, useEffect } from "react";
import styled from "styled-components";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { formatCurrency, formatValue } from "../utils/tradingUtils";

const StyledOverlay = styled(DialogPrimitive.Overlay)`
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  animation: overlayShow 150ms cubic-bezier(0.16, 1, 0.3, 1);
  z-index: 50;

  @keyframes overlayShow {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`;

const StyledContent = styled(DialogPrimitive.Content)`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 90%;
  max-width: 900px;
  max-height: 90vh;
  padding: 1.5rem;
  outline: none;
  border: 1px solid #ff980020;
  background: #25262b;
  border-radius: 0.75rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  animation: contentShow 150ms cubic-bezier(0.16, 1, 0.3, 1);
  z-index: 51;
  overflow-y: auto;

  &:focus {
    outline: none;
  }

  h5 {
    font-weight: 600;
    margin-bottom: 10px;
    margin-top: 6px;
  }

  @keyframes contentShow {
    from {
      opacity: 0;
      transform: translate(-50%, -48%) scale(0.96);
    }
    to {
      opacity: 1;
      transform: translate(-50%, -50%) scale(1);
    }
  }
`;

const StyledDialog = styled(DialogPrimitive.Root)``;

const StyledClose = styled(DialogPrimitive.Close)`
  position: absolute;
  top: 1rem;
  right: 1rem;
  padding: 0.5rem;
  border: none;
  background: transparent;
  color: #fff;
  cursor: pointer;

  &:hover {
    color: #ccc;
  }
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-right: 2rem;
`;

const ModalTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  padding-right: 2rem;
`;

const DateGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 0.5rem;
  margin-bottom: 1.5rem;
`;

const DateButton = styled.button`
  padding: 0.5rem;
  border-radius: 0.375rem;
  border: 1px solid ${(props) => (props.selected ? "#3498db" : "#ff980050")};
  background: ${(props) => (props.selected ? "#363636" : "#1a1a1a")};
  opacity: ${(props) => (props.disabled ? 0.5 : 1)};
  cursor: ${(props) => (props.disabled ? "not-allowed" : "pointer")};
  color: white;
  border: 1px solid #ff980020;

  &:hover:not(:disabled) {
    border-color: #ff980050;
    background-color: #252525;
    outline: none;
  }

  &:active {
    border-color: #ff980020;
    /* border-color: #1a1a1a;  */

    /* outline: none; */
  }
`;

const DateText = styled.div`
  font-size: 0.875rem;
`;

const DateBalance = styled.div`
  font-size: 0.75rem;
  color: #718096;
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: bold;
  color: #fff;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ff980050;
  border-radius: 4px;
  font-size: 1rem;
  color: #fff;

  background-color: #1a1a1a;

  &:focus {
    outline: none;
    border-color: #ff980050;
    box-shadow: 0 0 0 2px #ff980020;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ff980050;
  border-radius: 4px;
  font-size: 1rem;
  background-color: #1a1a1a;
  color: #fff;
  &:focus {
    outline: none;
    border-color: #ff980050;
    box-shadow: 0 0 0 2px #ff980020;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
`;
const ErrorMessage = styled.div`
  color: #dc3545;
  font-size: 0.875rem;
  margin-top: 0.5rem;
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
    background: #ff9800;
    color: white;
    &:hover {
    background: #e68900;

    }
  `
      : `
    background: #efece9;
    color: #212529;
    &:hover {
      background: #e6e3de;
    }
  `}

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const EstimatedBalanceBox = styled.div`
  padding: 0.75rem;
  border: 1px solid #ff980050;
  background-color: #1a1a1a;
  border-radius: 0.5rem;
  /* color: ${(props) => props.theme.text}; */
  font-family: monospace;
  font-size: 1.1rem;
`;

const WithdrawModal = ({
  isOpen,
  onClose,
  monthData,
  currency,
  usdToNgn,
  onSubmit,
}) => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [withdrawalTime, setWithdrawalTime] = useState("inbetween-trade");
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");

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

  const formatAmount = (amount) => {
    const value = currency === "NGN" ? amount * usdToNgn : amount;
    return formatCurrency(value, currency);
  };

  React.useEffect(() => {
    setSelectedDate(null);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const withdrawalAmount = parseFloat(amount);
    const maxAmount = formatAmount(getMaxWithdrawal());

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

  return (
    <StyledDialog open={isOpen} onOpenChange={onClose}>
      <StyledOverlay />
      <StyledContent>
        <ModalHeader>
          <ModalTitle>Schedule Withdrawal</ModalTitle>
        </ModalHeader>
        <StyledClose aria-label="Close">×</StyledClose>

        <div>
          <h5>Select Date - {monthData[0]?.month}</h5>
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
                max={formatAmount(getMaxWithdrawal())}
              />
              {error && <ErrorMessage>{error}</ErrorMessage>}
            </FormGroup>
            {selectedDate && (
              <FormGroup>
                <Label>Estimated Balance at Withdrawal Date</Label>
                <EstimatedBalanceBox>
                  {formatAmount(getMaxWithdrawal())}
                </EstimatedBalanceBox>
              </FormGroup>
            )}

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
      </StyledContent>
    </StyledDialog>
  );
};

export default WithdrawModal;
