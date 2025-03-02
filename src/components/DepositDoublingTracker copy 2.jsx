import React, { useState, useEffect } from "react";
import styled from "styled-components";
import {
  Calendar,
  Clock,
  DollarSign,
  TrendingUp,
  ArrowUpCircle,
  ChevronRight,
  ChevronDown,
  Check,
} from "lucide-react";
import useAuthStore from "../store/authStore";
import { formatDate } from "../utils/tradingUtils";
import { getAllDeposits } from "../api/request";

// Styled Components
const Container = styled.div`
  color: #e0e0e0;
  font-family: "Inter", sans-serif;

  .btn {
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;

const Header = styled.div`
  margin-bottom: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const TitleSection = styled.div``;

const Title = styled.h1`
  font-size: 1.875rem;
  font-weight: bold;
  color: #ffffff;
  margin-bottom: 0.5rem;
`;

const Subtitle = styled.p`
  color: #a0a0a0;
  font-size: 1rem;
`;

const SwitchContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const SwitchLabel = styled.span`
  font-size: 0.875rem;
  color: #a0a0a0;
`;

const SwitchWrapper = styled.label`
  position: relative;
  display: inline-block;
  width: 48px;
  height: 24px;
`;

const SwitchInput = styled.input`
  opacity: 0;
  width: 0;
  height: 0;

  &:checked + span {
    background-color: #4ade80;
  }

  &:checked + span:before {
    transform: translateX(24px);
  }

  &:focus + span {
    box-shadow: 0 0 1px #4ade80;
  }
`;

const SwitchSlider = styled.span`
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #333333;
  transition: 0.4s;
  border-radius: 24px;

  &:before {
    position: absolute;
    content: "";
    height: 18px;
    width: 18px;
    left: 3px;
    bottom: 3px;
    background-color: white;
    transition: 0.4s;
    border-radius: 50%;
  }
`;

const TableContainer = styled.div`
  border-radius: 0.5rem;
  overflow: hidden;
  border: 1px solid #333333;
  background-color: #1e1e1e;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  text-align: left;
`;

const Th = styled.th`
  padding: 1rem;
  background-color: #121212;
  color: white;
  font-weight: 600;
  font-size: 0.9rem;
  border-bottom: 1px solid #333333;
`;

const Td = styled.td`
  padding: 1rem;
  border-bottom: 1px solid #333333;
  vertical-align: middle;
  font-size: 0.9rem;
`;

const ProgressCell = styled(Td)`
  width: 220px;
`;

const ProgressBarOuter = styled.div`
  height: 0.75rem;
  background-color: #2c2c2c;
  border-radius: 1rem;
  overflow: hidden;
`;

const ProgressBarInner = styled.div`
  height: 100%;
  border-radius: 1rem;
  background: #71d76d;
  transition: width 1s ease-in-out;
  width: ${(props) => props.progress || "0%"};
`;

const ProgressText = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  font-size: 0.75rem;
`;

const DepositNumber = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
`;

const IconWrapper = styled.div`
  display: flex;
  align-items: center;
  color: ${(props) => props.color || "#ffffff"};
`;

const DateDisplay = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #a0a0a0;
  font-size: 0.9rem;
`;

const StatusBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
  background-color: ${(props) => {
    if (props.status === "completed") return "rgba(74, 222, 128, 0.2)";
    if (props.status === "in-progress") return "rgba(96, 165, 250, 0.2)";
    return "rgba(156, 163, 175, 0.2)";
  }};
  color: ${(props) => {
    if (props.status === "completed") return "#4ade80";
    if (props.status === "in-progress") return "#60a5fa";
    return "#9ca3af";
  }};
`;

const ExpandableRow = styled.tr`
  background-color: ${(props) =>
    props.isExpanded ? "#252525" : "transparent"};
  transition: background-color 0.2s ease;
  cursor: pointer;

  &:hover {
    background-color: #252525;
  }
`;

const DetailsRow = styled.tr`
  background-color: #1a1a1a;
`;

const DetailsContent = styled.div`
  padding: 1.5rem;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
`;

const DetailItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const DetailLabel = styled.span`
  font-size: 0.75rem;
  color: #a0a0a0;
`;

const DetailValue = styled.div`
  font-size: 1rem;
  font-weight: 600;
  color: #ffffff;
  display: flex;
  align-items: center;
  gap: 0.375rem;
`;

const CurrencyToggle = styled.button`
  background: ${(props) => (props.active ? "#4c6ef5" : "#2c2d30")};
  color: white;
  border: none;
  padding: 0.5rem 1rem;
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

// Main Component
const DepositDoublingTracker = () => {
  const { user } = useAuthStore();
  const [showProjections, setShowProjections] = useState(true);

  const trackDepositDoubling = (initialCapital, depositInfo) => {
    // Validate inputs
    if (!depositInfo || !depositInfo.amount) {
      console.error("Invalid deposit information");
      return { error: "Invalid deposit information" };
    }

    console.log(depositInfo);
    // Extract deposit details
    const depositAmount = depositInfo.amount;
    const depositBonus = depositInfo.depositBonus || 0;
    const totalDeposit = depositAmount + depositBonus;
    const depositDate = new Date(depositInfo.date);
    const whenDeposited = depositInfo.whenDepositHappened || "inbetween-trade";

    // Initialize tracking variables
    let currentCapital = initialCapital;
    let daysCount = 0;
    let depositImpact = 0;
    let dailyProfits = [];
    let targetReached = false;
    const targetAmount = initialCapital + totalDeposit * 2;

    // Handle deposit based on timing
    if (whenDeposited === "before-trade") {
      currentCapital += totalDeposit;
    }

    // Calculate profits until deposit is doubled
    while (!targetReached && daysCount < 365) {
      // Cap at one year to prevent infinite loop
      daysCount++;

      // First trade
      const firstTradeAmount = currentCapital * 0.01;
      const firstTradeProfit = firstTradeAmount * 0.88;
      let balanceAfterFirstTrade = currentCapital + firstTradeProfit;

      // Handle in-between deposit
      if (daysCount === 1 && whenDeposited === "inbetween-trade") {
        balanceAfterFirstTrade += totalDeposit;
      }

      // Second trade
      const secondTradeAmount = balanceAfterFirstTrade * 0.01;
      const secondTradeProfit = secondTradeAmount * 0.88;
      const dailyTotalProfit = firstTradeProfit + secondTradeProfit;

      // Update capital
      currentCapital = balanceAfterFirstTrade + secondTradeProfit;

      // Handle after-trade deposit
      if (daysCount === 1 && whenDeposited === "after-trade") {
        currentCapital += totalDeposit;
      }

      // Track profit for this day
      depositImpact += dailyTotalProfit;
      dailyProfits.push({
        day: daysCount,
        profit: dailyTotalProfit,
        capital: currentCapital,
        doubleProgress: ((depositImpact / totalDeposit) * 100).toFixed(2),
      });

      // Check if target is reached
      if (currentCapital >= targetAmount) {
        targetReached = true;
      }
    }

    // Prepare results
    const result = {
      originalCapital: initialCapital,
      depositAmount: totalDeposit,
      targetAmount: targetAmount,
      daysToDouble: targetReached ? daysCount : "Not doubled within 365 days",
      finalCapital: currentCapital,
      totalProfit: depositImpact,
      dailyProgress: dailyProfits,
      estimatedDate: targetReached
        ? new Date(depositDate.getTime() + daysCount * 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0]
        : "Unknown",
      progressPercent: targetReached
        ? 100
        : ((depositImpact / totalDeposit) * 100).toFixed(2),
    };

    return result;
  };

  const [results, setResults] = useState([]);
  const [currentDate] = useState(new Date());
  const [expandedRow, setExpandedRow] = useState(null);
  const [currency, setCurrency] = useState("USD");
  const [deposits, setDeposits] = useState([]);

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

  useEffect(() => {
    const calculatedResults = deposits.map((deposit) => {
      return trackDepositDoubling(deposit.capital, deposit);
    });
    setResults(calculatedResults);
  }, [deposits]);

  const handleCurrencyToggle = (newCurrency) => {
    setCurrency(newCurrency);
  };

  const formatAmount = (value = 0, nairaRate = 1600) => {
    const options = {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    };

    const amount = currency === "NGN" ? value * nairaRate : value;
    const formattedAmount = amount.toLocaleString("en-US", options);
    return `${currency === "NGN" ? "₦" : "$"}${formattedAmount}`;
  };

  // Calculate days left
  const getDaysLeft = (estimatedDate) => {
    if (estimatedDate === "Unknown") return "Unknown";
    const targetDate = new Date(estimatedDate);
    const diffTime = targetDate - currentDate;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  // Calculate current progress percentage based on time elapsed
  const calculateCurrentProgress = (depositDate, estimatedDate) => {
    if (estimatedDate === "Unknown") return 0;

    const startDate = new Date(depositDate);
    const endDate = new Date(estimatedDate);
    const today = currentDate;

    // If we're past the estimated completion date, return 100%
    if (today >= endDate) return 100;

    // Calculate total duration and elapsed duration
    const totalDuration = endDate - startDate;
    const elapsedDuration = today - startDate;

    // Calculate percentage
    const percentage = (elapsedDuration / totalDuration) * 100;

    // Ensure the percentage is between 0 and 100
    return Math.max(0, Math.min(100, percentage)).toFixed(1);
  };

  // Get status based on progress
  const getStatus = (progress) => {
    if (progress >= 100) return "completed";
    if (progress > 0) return "in-progress";
    return "pending";
  };

  const toggleRowExpand = (index) => {
    if (expandedRow === index) {
      setExpandedRow(null);
    } else {
      setExpandedRow(index);
    }
  };

  const handleToggleProjections = () => {
    setShowProjections(!showProjections);
  };

  return (
    <Container>
      <Header>
        <TitleSection>
          <Title>Deposit Doubling Tracker</Title>
          <Subtitle>Track when your deposits will double in value</Subtitle>
        </TitleSection>
        <div className="btn">
          <ToggleContainer>
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
          <SwitchContainer>
            <SwitchLabel>Show Projections</SwitchLabel>
            <SwitchWrapper>
              <SwitchInput
                type="checkbox"
                checked={showProjections}
                onChange={handleToggleProjections}
              />
              <SwitchSlider />
            </SwitchWrapper>
          </SwitchContainer>
        </div>
      </Header>

      <TableContainer>
        <Table>
          <thead>
            <tr>
              <Th>Deposit</Th>
              <Th>Amount</Th>
              <Th>Target</Th>
              <Th>Days</Th>
              <Th>Progress</Th>
              <Th>Est. Completion</Th>
              <Th>Status</Th>
              <Th></Th>
            </tr>
          </thead>
          <tbody>
            {results.map((result, index) => {
              const currentProgress = showProjections
                ? result.progressPercent
                : calculateCurrentProgress(
                    deposits[index].dateOfDeposit,
                    result.estimatedDate
                  );
              const status = getStatus(parseFloat(currentProgress));
              const isExpanded = expandedRow === index;

              return (
                <React.Fragment key={index}>
                  <ExpandableRow
                    isExpanded={isExpanded}
                    onClick={() => toggleRowExpand(index)}
                  >
                    <Td>
                      <DepositNumber>#{index + 1}</DepositNumber>
                    </Td>
                    <Td>{formatAmount(result.depositAmount)}</Td>
                    <Td>{formatAmount(result.targetAmount)}</Td>
                    <Td>{result.daysToDouble}</Td>
                    <ProgressCell>
                      <ProgressText>
                        <span>{currentProgress}%</span>
                      </ProgressText>
                      <ProgressBarOuter>
                        <ProgressBarInner progress={`${currentProgress}%`} />
                      </ProgressBarOuter>
                    </ProgressCell>
                    <Td>
                      <DateDisplay>
                        <Calendar size={14} />
                        <span>{formatDate(result.estimatedDate)}</span>
                      </DateDisplay>
                    </Td>
                    <Td>
                      <StatusBadge status={status}>
                        {status === "completed" && <Check size={12} />}
                        {status === "completed" && "Completed"}
                        {status === "in-progress" && "In Progress"}
                        {status === "pending" && "Pending"}
                      </StatusBadge>
                    </Td>
                    <Td>
                      {isExpanded ? (
                        <ChevronDown size={16} />
                      ) : (
                        <ChevronRight size={16} />
                      )}
                    </Td>
                  </ExpandableRow>

                  {isExpanded && (
                    <DetailsRow>
                      <Td colSpan={8}>
                        <DetailsContent>
                          <DetailItem>
                            <DetailLabel>Initial Capital</DetailLabel>
                            <DetailValue>
                              <IconWrapper color="#4ade80">
                                <DollarSign size={16} />
                              </IconWrapper>
                              {formatAmount(result.originalCapital)}
                            </DetailValue>
                          </DetailItem>
                          <DetailItem>
                            <DetailLabel>Deposit Date</DetailLabel>
                            <DetailValue>
                              <IconWrapper>
                                <Calendar size={16} />
                              </IconWrapper>
                              {formatDate(deposits[index].dateOfDeposit)}
                            </DetailValue>
                          </DetailItem>
                          <DetailItem>
                            <DetailLabel>Deposit Method</DetailLabel>
                            <DetailValue>
                              {deposits[index].whenDepositHappened ===
                                "before-trade" && "Before Trade"}
                              {deposits[index].whenDepositHappened ===
                                "inbetween-trade" && "Between Trades"}
                              {deposits[index].whenDepositHappened ===
                                "after-trade" && "After Trade"}
                            </DetailValue>
                          </DetailItem>
                          {deposits[index].depositBonus > 0 && (
                            <DetailItem>
                              <DetailLabel>Bonus Amount</DetailLabel>
                              <DetailValue>
                                <IconWrapper color="#facc15">
                                  <DollarSign size={16} />
                                </IconWrapper>
                                {formatAmount(deposits[index].depositBonus)}
                              </DetailValue>
                            </DetailItem>
                          )}
                          <DetailItem>
                            <DetailLabel>Days Remaining</DetailLabel>
                            <DetailValue>
                              <IconWrapper>
                                <Clock size={16} />
                              </IconWrapper>
                              {getDaysLeft(result.estimatedDate)} days
                            </DetailValue>
                          </DetailItem>
                          <DetailItem>
                            <DetailLabel>Expected Profit</DetailLabel>
                            <DetailValue>
                              <IconWrapper color="#60a5fa">
                                <TrendingUp size={16} />
                              </IconWrapper>
                              {formatAmount(result.depositAmount)}
                            </DetailValue>
                          </DetailItem>
                          <DetailItem>
                            <DetailLabel>Current Progress</DetailLabel>
                            <DetailValue>
                              <IconWrapper color="#f472b6">
                                <ArrowUpCircle size={16} />
                              </IconWrapper>
                              {showProjections
                                ? result.progressPercent
                                : calculateCurrentProgress(
                                    deposits[index].dateOfDeposit,
                                    result.estimatedDate
                                  )}
                              %
                            </DetailValue>
                          </DetailItem>
                          <DetailItem>
                            <DetailLabel>Final Capital</DetailLabel>
                            <DetailValue>
                              <IconWrapper color="#4ade80">
                                <DollarSign size={16} />
                              </IconWrapper>
                              {formatAmount(result.finalCapital)}
                            </DetailValue>
                          </DetailItem>
                          <DetailItem>
                            <DetailLabel>Total Return</DetailLabel>
                            <DetailValue>
                              <IconWrapper color="#60a5fa">
                                <TrendingUp size={16} />
                              </IconWrapper>
                              {formatAmount(result.totalProfit)}
                            </DetailValue>
                          </DetailItem>
                        </DetailsContent>
                      </Td>
                    </DetailsRow>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default DepositDoublingTracker;
