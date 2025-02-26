import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { getAllDeposits, getExpenses } from "../api/request";

const Container = styled.div`
  flex: 0.9;
  position: relative;
  height: fit-content;
  margin-top: 10px;

  .bg {
    padding: 15px;
    border-radius: 12px;
    background: #25262b;
  }

  .header {
    display: flex;
    align-items: center;
    padding-bottom: 10px;
    border-bottom: 1px solid #343a40;
    color: #a0a0a0;

    p {
      margin-right: 5px;
      font-size: 19px;
      font-weight: bold;
      color: #f9fafb;
    }
  }

  h3 {
    font-size: 1rem;
    color: #f9fafb;
    margin-top: 5px;
  }
`;

const TransactionList = styled.div`
  margin-top: 15px;
`;

const TransactionItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #343a40;

  &:last-child {
    border-bottom: none;
  }
`;

const TransactionDetails = styled.div`
  display: flex;
  flex-direction: column;
`;

const TransactionName = styled.div`
  font-size: 16px;
  font-weight: 500;
  color: #f9fafb;
`;

const TransactionDate = styled.div`
  font-size: 14px;
  color: #a0a0a0;
  margin-top: 4px;
`;

const TransactionAmount = styled.div`
  font-size: 16px;
  font-weight: bold;
  color: ${(props) => (props.type === "withdraw" ? "#ff6b6b" : "#51cf66")};
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 20px 0;
  color: #a0a0a0;
`;

const ViewAllButton = styled.button`
  width: 100%;
  padding: 10px;
  margin-top: 15px;
  background-color: #2c2d32;
  color: #f9fafb;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s;

  &:hover {
    background-color: #3a3b41;
  }
`;

const Transactions = () => {
  const [deposits, setDeposits] = useState([]);
  const [expenses, setExpenses] = useState([]);

  const fetchDeposits = async () => {
    try {
      const depositResponse = await getAllDeposits();
      const withdrawResponse = await getExpenses();

      const formattedDeposits = depositResponse.deposits.map((deposit) => ({
        id: deposit._id,
        name: "Deposit",
        amount: deposit.amount,
        type: "deposit",
        date: new Date(deposit.date),
        status: "completed",
      }));

      const formattedWithdrawals = withdrawResponse.withdraw.map(
        (withdraw) => ({
          id: withdraw._id,
          name: "Withdrawal",
          amount: withdraw.amount,
          type: "withdraw",
          date: new Date(withdraw.date),
          status: "completed",
        })
      );

      setDeposits(formattedDeposits);
      setExpenses(formattedWithdrawals);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    }
  };

  useEffect(() => {
    fetchDeposits();
  }, []);

  const transactions = [...deposits, ...expenses].sort(
    (a, b) => b.date - a.date
  );

  // Function to format date as "Feb 25, 2025 at 2:30 PM"
  const formatDate = (date) => {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Function to format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  return (
    transactions.length > 0 && (
      <Container>
        <div className="bg">
          <div className="header">
            <p>Recent Transactions</p>
          </div>

          <TransactionList>
            {transactions.map((transaction) => (
              <TransactionItem key={transaction.id}>
                <TransactionDetails>
                  <TransactionName>{transaction.name}</TransactionName>
                  <TransactionDate>
                    {formatDate(transaction.date)}
                  </TransactionDate>
                </TransactionDetails>
                <TransactionAmount type={transaction.type}>
                  {transaction.type === "withdraw" ? "-" : "+"}
                  {formatCurrency(transaction.amount)}
                </TransactionAmount>
              </TransactionItem>
            ))}
          </TransactionList>

          {/* <ViewAllButton>View All Transactions</ViewAllButton> */}
        </div>
      </Container>
    )
  );
};

export default Transactions;
