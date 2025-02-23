import { DollarSign, TrendingUp, Wallet } from "lucide-react";
import React, { useState } from "react";

import styled from "styled-components";
import { getStats } from "../api/request";
import useAuthStore from "../store/authStore";

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
  /* margin-top: 1.5rem; */

  @media (max-width: 767px) {
    grid-template-columns: 1fr;
    gap: 1rem;
    margin-bottom: 1.5rem;
  }
`;

const StatCard = styled.div`
  background: #25262b;
  padding: 1.25rem;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 1.25rem;
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  @media (max-width: 767px) {
    padding: 1rem;
  }
`;

const StatIcon = styled.div`
  background: ${(props) => props.color};
  padding: 0.875rem;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s ease-in-out;

  &:hover {
    transform: scale(1.05);
  }
`;

const StatInfo = styled.div`
  flex: 1;
`;

const StatLabel = styled.div`
  color: #a0a0a0;
  font-size: 0.875rem;
  margin-bottom: 0.25rem;
`;

const StatValue = styled.div`
  font-size: 1.375rem;
  font-weight: 600;
  color: #ffffff;
  letter-spacing: 0.5px;
`;

const Stats = ({ currency, isHidden, formatValue }) => {
  const [stats, setStats] = useState(null);
  const { user } = useAuthStore();

  React.useEffect(() => {
    const getSignalStats = async () => {
      try {
        const response = await getStats();
        setStats(response);
      } catch (error) {
        console.error(error);
        // TODO: Handle error
      }
    };
    getSignalStats();
  }, []);
  const hideValue = (value) => {
    return isHidden ? "••••••" : value;
  };

  return (
    <StatsGrid>
      <StatCard>
        <StatIcon color="#4c6ef5">
          <Wallet size={22} color="#ffffff" />
        </StatIcon>
        <StatInfo>
          <StatLabel>Current Balance</StatLabel>
          <StatValue>
            {hideValue(formatValue(user.running_capital, currency))}
          </StatValue>
        </StatInfo>
      </StatCard>

      <StatCard>
        <StatIcon color="#4caf50">
          <DollarSign size={22} color="#ffffff" />
        </StatIcon>
        <StatInfo>
          <StatLabel>Total Profit</StatLabel>
          <StatValue>
            {hideValue(formatValue(stats?.total_profit || 0, currency))}
          </StatValue>
        </StatInfo>
      </StatCard>

      <StatCard>
        <StatIcon color="#f59f00">
          <TrendingUp size={22} color="#ffffff" />
        </StatIcon>
        <StatInfo>
          <StatLabel>Average Profit</StatLabel>
          <StatValue>
            {hideValue(formatValue(stats?.average_profit || 0, currency))}
          </StatValue>
        </StatInfo>
      </StatCard>
    </StatsGrid>
  );
};

export default Stats;
