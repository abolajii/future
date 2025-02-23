import React, { useState } from "react";
import styled from "styled-components";
import { addDeposit } from "../api/request";

const FormContainer = styled.div`
  background: #25262b;
  width: 100%;
`;

const FormHeader = styled.h2`
  margin: 0 0 1.5rem 0;
  color: #ffffff;
  font-size: 1.5rem;
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  color: #ffffff;
  font-weight: 500;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  background: #2c2d32;
  border: 1px solid #ff980020;
  border-radius: 4px;
  font-size: 1rem;
  color: #ffffff;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: #ff9800;
    box-shadow: 0 0 0 2px rgba(255, 152, 0, 0.2);
  }

  &::-webkit-calendar-picker-indicator {
    filter: invert(1);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  &::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }
`;

const RadioGroup = styled.div`
  display: flex;
  gap: 1.5rem;
  margin-top: 0.5rem;
`;

const CustomRadio = styled.div`
  width: 20px;
  height: 20px;
  border: 2px solid ${(props) => props.color};
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 8px;
  transition: all 0.2s ease;

  &:after {
    content: "";
    width: 12px;
    height: 12px;
    background: ${(props) => (props.checked ? props.color : "transparent")};
    border-radius: 2px;
    transition: all 0.2s;
  }
`;

const RadioLabel = styled.label`
  display: flex;
  align-items: center;
  cursor: pointer;
  color: #ffffff;
  transition: opacity 0.2s ease;

  input {
    display: none;
  }

  &:hover ${CustomRadio} {
    border-color: ${(props) => props.color};
    transform: scale(1.05);
  }

  ${(props) =>
    props.disabled &&
    `
    opacity: 0.7;
    cursor: not-allowed;
    &:hover ${CustomRadio} {
      transform: none;
    }
  `}
`;

const SubmitButton = styled.button`
  background: #ff9800;
  color: #ffffff;
  border: none;
  border-radius: 4px;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  cursor: pointer;
  width: 100%;
  font-weight: 600;
  transition: all 0.2s ease;

  &:hover {
    background: #f57c00;
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    background: #ff980080;
    cursor: not-allowed;
    transform: none;
  }
`;

const ErrorMessage = styled.div`
  color: #ff4444;
  margin: 0.5rem 0;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:before {
    content: "⚠";
  }
`;

const SuccessMessage = styled.div`
  color: #4caf50;
  margin: 0.5rem 0;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:before {
    content: "✓";
  }
`;

const LoadingSpinner = styled.div`
  display: inline-block;
  width: 1rem;
  height: 1rem;
  border: 2px solid #ffffff;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-right: 0.5rem;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

const DepositForm = ({ fetchDeposits, onClose }) => {
  const [formData, setFormData] = useState({
    amount: "",
    date: new Date().toISOString().split("T")[0],
    tradeTime: "before-trade",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const radioOptions = [
    { value: "before-trade", label: "Before Trade", color: "#4CAF50" },
    { value: "inbetween-trade", label: "During Trade", color: "#2196F3" },
    { value: "after-trade", label: "After Trade", color: "#9C27B0" },
  ];

  const validateForm = () => {
    const amount = parseFloat(formData.amount);
    if (!amount || isNaN(amount) || amount <= 0) {
      setError("Please enter a valid amount greater than 0");
      return false;
    }
    if (!formData.date) {
      setError("Please select a date");
      return false;
    }
    if (!formData.tradeTime) {
      setError("Please select trade timing");
      return false;
    }
    return true;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const response = await addDeposit(formData);

      if (response.success) {
        setSuccess("Deposit added successfully!");
        setFormData({
          amount: "",
          date: new Date().toISOString().split("T")[0],
          tradeTime: "before-trade",
        });
        fetchDeposits();
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        throw new Error(response.message || "Failed to process deposit");
      }
    } catch (err) {
      setError(err.message || "Failed to process deposit. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <FormContainer>
      <form onSubmit={handleSubmit}>
        <FormHeader>Make a Deposit</FormHeader>

        <FormGroup>
          <Label htmlFor="amount">Amount (USD)</Label>
          <Input
            id="amount"
            name="amount"
            type="number"
            value={formData.amount}
            onChange={handleChange}
            placeholder="Enter deposit amount"
            required
            disabled={isSubmitting}
            min="0"
            step="0.01"
          />
        </FormGroup>

        <FormGroup>
          <Label htmlFor="date">Date</Label>
          <Input
            id="date"
            name="date"
            type="date"
            value={formData.date}
            onChange={handleChange}
            required
            disabled={isSubmitting}
            max={new Date().toISOString().split("T")[0]}
          />
        </FormGroup>

        <FormGroup>
          <Label>Trade Timing</Label>
          <RadioGroup>
            {radioOptions.map((option) => (
              <RadioLabel
                key={option.value}
                color={option.color}
                disabled={isSubmitting}
              >
                <input
                  type="radio"
                  name="tradeTime"
                  value={option.value}
                  checked={formData.tradeTime === option.value}
                  onChange={handleChange}
                  disabled={isSubmitting}
                />
                <CustomRadio
                  color={option.color}
                  checked={formData.tradeTime === option.value}
                />
                {option.label}
              </RadioLabel>
            ))}
          </RadioGroup>
        </FormGroup>

        {error && <ErrorMessage>{error}</ErrorMessage>}
        {success && <SuccessMessage>{success}</SuccessMessage>}

        <SubmitButton type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <LoadingSpinner />
              Processing...
            </>
          ) : (
            "Submit Deposit"
          )}
        </SubmitButton>
      </form>
    </FormContainer>
  );
};

export default DepositForm;
