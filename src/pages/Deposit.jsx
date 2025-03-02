import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { deleteDeposit, getAllDeposits } from "../api/request";
import useAuthStore from "../store/authStore";
import { format } from "date-fns";
import { formatValue } from "../utils/tradingUtils";
import Modal from "../components/Modal";
import DepositForm from "../components/DepositForm";
import DeleteModal from "../components/DeleteModal";
import { useNavigate } from "react-router-dom";

const PageTitle = styled.h1`
  font-size: 1.5rem;
  color: #ffffff;
  margin-bottom: 2rem;
  font-weight: 600;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;

  .action {
    display: flex;
    gap: 1rem;
  }
`;

const TableContainer = styled.div`
  overflow-x: auto;
  max-height: 28rem;
  border: 1px solid #ff980020;
  border-radius: 8px;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const Th = styled.th`
  text-align: left;
  padding: 1rem;
  background: #25262b;
  color: #a0a0a0;
  font-weight: 500;
  position: sticky;
  top: 0;
  z-index: 1;
  &:first-child {
    border-top-left-radius: 8px;
  }
  &:last-child {
    border-top-right-radius: 8px;
  }
`;

const Td = styled.td`
  padding: 1rem;
  border-bottom: 1px solid #ff980020;
  color: #ffffff;
`;

const FilterSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const DateInputGroup = styled.div`
  display: flex;
  gap: 1rem;
`;

const DateInputWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const InputLabel = styled.label`
  font-size: 0.875rem;
  color: #a0a0a0;
`;

const DateInput = styled.input`
  background: #1a1a1a;
  border: 1px solid #ff980020;
  border-radius: 4px;
  color: white;
  padding: 0.5rem;
  min-width: 150px;
  &:focus {
    outline: none;
    border-color: #ff9800;
  }
`;

const Button = styled.button`
  color: #ff9800;
  padding: 0.5rem 1rem;
  border: none;
  background: #f9f2e71f;
  cursor: pointer;
  border-radius: 0.375rem;
  font-weight: 500;
  border: none;
  font-size: 0.875rem;
  border: 1px solid #ff980020;
  outline: none;
  &:hover {
    background: #cfc6b91f;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 2rem;
  color: #a0a0a0;
`;

const Status = styled.span`
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.875rem;
  font-weight: 500;
  text-transform: capitalize;

  ${(props) => {
    switch (props.status) {
      case "completed":
        return `
          background: #2e7d32;
          color: #c8e6c9;
        `;
      case "pending":
        return `
          background: #ef6c00;
          color: #ffe0b2;
        `;
      case "failed":
        return `
          background: #c62828;
          color: #ffcdd2;
        `;
      default:
        return "";
    }
  }}
`;

const TradeTime = styled.span`
  text-transform: capitalize;
`;

const Action = styled.button`
  border: 1px solid #dd3e3e;
  color: #dd3e3e;
  cursor: pointer;
  transition: background-color 0.2s;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  font-size: 0.875rem;
  font-weight: 500;
  background-color: transparent;

  &:hover {
    background-color: #e0313150;
    border: 1px solid transparent;
  }
`;

const Amount = styled.span`
  color: #4caf50;
  font-weight: 500;
`;

const CurrencyToggle = styled.button`
  width: auto;
  color: white;
  outline: none;
  border-radius: 0.375rem;
  font-weight: 500;
  font-size: 0.875rem;
  cursor: pointer;
  transition: opacity 0.2s;
  border: 1px solid #ff980020;
  padding: 0.5rem 1rem;
  background-color: #25262b;

  &:hover {
    background-color: #222222;
    border: 1px solid #ff980040;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const Deposit = () => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [deposits, setDeposits] = useState([]);
  const { setUser, user } = useAuthStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedDeposit, setSelectedDeposit] = useState(null);

  const fetchDeposits = async () => {
    try {
      const response = await getAllDeposits();
      setDeposits(response.deposits);
    } catch (error) {
      console.error("Error fetching deposits:", error);
    }
  };

  useEffect(() => {
    fetchDeposits();
  }, []);

  const handleCreateDeposit = () => {
    setIsModalOpen(true);
  };

  const handleDelete = (deposit) => {
    console.log("Delete deposit:", deposit);
    setDeleteModalOpen(true);
    setSelectedDeposit(deposit);
  };

  const navigate = useNavigate();

  return (
    <div>
      {/* <PageTitle>Deposits</PageTitle> */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
        }}
        f
      >
        <DepositForm fetchDeposits={fetchDeposits} />
      </Modal>

      <DeleteModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
        }}
        onConfirm={async () => {
          try {
            const response = await deleteDeposit(selectedDeposit._id);
            console.log(response);

            const clonedDeposits = [...deposits];
            const index = clonedDeposits.findIndex(
              (d) => d._id === selectedDeposit._id
            );
            setDeleteModalOpen(false);
            clonedDeposits.splice(index, 1);
            setDeposits(clonedDeposits);

            const startingCapital = response.data.startingCapital;
            const updatedUser = { ...user, startingCapital };
            setUser(updatedUser);
          } catch (error) {}
        }}
        itemName={selectedDeposit?.amount}
      />
      <Header>
        <FilterSection>
          <DateInputGroup>
            <DateInputWrapper>
              <InputLabel>Start Date</InputLabel>
              <DateInput
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </DateInputWrapper>
            <DateInputWrapper>
              <InputLabel>End Date</InputLabel>
              <DateInput
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </DateInputWrapper>
          </DateInputGroup>
        </FilterSection>
        <div className="action">
          <CurrencyToggle
            onClick={() =>
              setCurrency((prev) => (prev === "USD" ? "NGN" : "USD"))
            }
          >
            Switch to {currency === "USD" ? "NGN" : "USD"}
          </CurrencyToggle>
          <Button onClick={handleCreateDeposit}>Create Deposit</Button>
          <Button onClick={() => navigate("/doubling")}>
            View Deposit Stats
          </Button>
        </div>
      </Header>

      <TableContainer>
        <Table>
          <thead>
            <tr>
              <Th>Amount ({currency})</Th>
              <Th>Date</Th>
              <Th>Trade Time</Th>
              <Th>Status</Th>
              <Th>Action</Th>
            </tr>
          </thead>
          <tbody>
            {deposits.length > 0 ? (
              deposits.map((deposit) => (
                <tr key={deposit._id}>
                  <Td>
                    <Amount>{formatValue(deposit.amount, currency)}</Amount>
                  </Td>
                  <Td>{format(new Date(deposit.date), "MMM dd, yyyy")}</Td>
                  <Td>
                    <TradeTime>
                      {deposit?.whenDeposited?.split("-").join(" ")}
                    </TradeTime>
                  </Td>
                  <Td>
                    <Status status={deposit.status || "completed"}>
                      {deposit.status || "completed"}
                    </Status>
                  </Td>
                  <Td>
                    <Action onClick={() => handleDelete(deposit)}>
                      Delete
                    </Action>
                  </Td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5">
                  <EmptyState>No deposits found</EmptyState>
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default Deposit;
