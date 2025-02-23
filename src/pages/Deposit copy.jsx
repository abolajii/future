import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { getAllDeposits } from "../api/request";
import useAuthStore from "../store/authStore";

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
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
  gap: 1rem;
  align-items: center;
`;

const DateInput = styled.input`
  background: #1a1a1a;
  border: 1px solid #ff980020;
  border-radius: 4px;
  color: white;
  padding: 0.5rem;
  &:focus {
    outline: none;
    border-color: #ff9800;
  }
`;

const Button = styled.button`
  /* background: #ffffff;  */
  color: #ff9800;
  padding: 0.5rem 1rem;
  border: none;
  background: #f9f2e71f;
  cursor: pointer;
  border-radius: 0.375rem;
  font-weight: 500;
  font-size: 0.875rem;
  border: 1px solid #ff980020;

  &:hover {
    background: #cfc6b91f;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 2rem;
  color: #a0a0a0;
`;

const Deposit = () => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);
  const [deposits, setDeposits] = useState([]);
  const [selectedDeposit, setSelectedDeposit] = useState(null);
  const { setUser, user } = useAuthStore();

  const fetchDeposits = async () => {
    const response = await getAllDeposits();
    console.log(response);
    setDeposits(response.deposits);
  };
  useEffect(() => {
    fetchDeposits();
  }, []);

  // Sample data - replace with your actual data

  return (
    <div>
      <Header>
        <FilterSection>
          {/* <DateInput
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            placeholder="Start Date"
          />
          <DateInput
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            placeholder="End Date"
          /> */}
        </FilterSection>
        <Button onClick={() => console.log("Create deposit clicked")}>
          Create Deposit
        </Button>
      </Header>

      <TableContainer>
        <Table>
          <thead>
            <tr>
              <Th>Amount</Th>
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
                    <Amount></Amount>
                  </Td>
                  <Td>{format(deposit.date, "MMM dd, yyyy")}</Td>
                  <Td>
                    <TradeTime>
                      {deposit.whenDeposited.split("-").join(" ")}
                    </TradeTime>
                  </Td>
                  <Td>
                    <Status status={"completed"}>{"completed"}</Status>
                  </Td>
                  <Td>
                    <Action
                      onClick={() => {
                        // handleDelete();
                        // setSelectedDeposit(deposit);
                      }}
                    >
                      Delete
                    </Action>
                  </Td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6">
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
