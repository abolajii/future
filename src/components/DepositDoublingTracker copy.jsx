import React, { useState, useEffect } from "react";
import styled from "styled-components";
import {
  Calendar,
  Clock,
  DollarSign,
  TrendingUp,
  ArrowUpCircle,
} from "lucide-react";
import useAuthStore from "../store/authStore";

// Styled Components
const Container = styled.div`
  margin: 0 auto;
  color: #e0e0e0;
  font-family: "Inter", sans-serif;
`;

const Header = styled.div`
  margin-bottom: 1.5rem;
`;

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

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;

  @media (min-width: 768px) {
    grid-template-columns: repeat(3, 1fr);
  }
`;

const Card = styled.div`
  background-color: #1e1e1e;
  border-radius: 0.5rem;
  overflow: hidden;
  border: 1px solid #333333;
`;

const CardHeader = styled.div`
  padding: 1rem;
  background-color: #121212;
  color: white;
  border-bottom: 1px solid #333333;
`;

const CardHeaderFlex = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const CardBody = styled.div`
  padding: 1.5rem;
`;

const CardTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  color: #ffffff;
  margin: 0;
`;

const DateDisplay = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #a0a0a0;
  font-size: 0.875rem;
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const InfoItem = styled.div`
  display: flex;
  flex-direction: column;
`;

const InfoLabel = styled.span`
  font-size: 0.75rem;
  color: #a0a0a0;
  margin-bottom: 0.25rem;
`;

const InfoValue = styled.div`
  font-size: 1.125rem;
  font-weight: 600;
  color: #ffffff;
  display: flex;
  align-items: center;
  gap: 0.375rem;
`;

const IconWrapper = styled.div`
  display: flex;
  align-items: center;
  color: ${(props) => props.color || "#ffffff"};
`;

const ProgressContainer = styled.div`
  margin: 1.5rem 0;
`;

const ProgressLabel = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
`;

const ProgressLabelText = styled.span`
  font-size: 0.875rem;
  color: #a0a0a0;
`;

const ProgressValue = styled.span`
  font-size: 0.875rem;
  font-weight: 500;
  color: #ffffff;
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
  background: linear-gradient(90deg, #3a1c71, #d76d77, #ffaf7b);
  transition: width 1s ease-in-out;
  width: ${(props) => props.progress || "0%"};
`;

const EstimatedDate = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 1rem;
  padding: 0.75rem;
  background-color: #252525;
  border-radius: 0.375rem;
  font-size: 0.875rem;
`;

const EstimatedDateLabel = styled.span`
  color: #a0a0a0;
`;

const EstimatedDateValue = styled.span`
  font-weight: 500;
  color: #ffffff;
  margin-left: auto;
`;

// Main Component
const DepositDoublingTracker = () => {
  const { user } = useAuthStore();

  const trackDepositDoubling = (initialCapital, depositInfo) => {
    // Validate inputs
    if (!depositInfo || !depositInfo.amount) {
      console.error("Invalid deposit information");
      return { error: "Invalid deposit information" };
    }

    // Extract deposit details
    const depositAmount = depositInfo.amount;
    const depositBonus = depositInfo.depositBonus || 0;
    const totalDeposit = depositAmount + depositBonus;
    const depositDate = new Date(depositInfo.dateOfDeposit);
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

  const deposits = [
    {
      initialCapital: 2711.26,
      amount: 118.56,
      depositBonus: 0,
      dateOfDeposit: "2025-02-26",
      whenDepositHappened: "inbetween-trade",
    },
    {
      initialCapital: 2956.64,
      amount: 330.1,
      depositBonus: 0,
      dateOfDeposit: "2025-03-01",
      whenDepositHappened: "before-trade",
    },
    {
      initialCapital: 3200.0,
      amount: 250.0,
      depositBonus: 25.0,
      dateOfDeposit: "2025-03-02",
      whenDepositHappened: "before-trade",
    },
  ];

  const [results, setResults] = useState([]);
  const [currentDate] = useState(new Date());

  useEffect(() => {
    const calculatedResults = deposits.map((deposit) => {
      return trackDepositDoubling(deposit.initialCapital, deposit);
    });
    setResults(calculatedResults);
  }, []);

  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(value);
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

  return (
    <Container>
      <Header>
        <Title>Deposit Doubling Tracker</Title>
        <Subtitle>Track when your deposits will double in value</Subtitle>
      </Header>

      <Grid>
        {results.map((result, index) => {
          const currentProgress = calculateCurrentProgress(
            deposits[index].dateOfDeposit,
            result.estimatedDate
          );

          return (
            <Card key={index}>
              <CardHeader>
                <CardHeaderFlex>
                  <CardTitle>Deposit #{index + 1}</CardTitle>
                  <DateDisplay>
                    <Calendar size={16} />
                    <span>{deposits[index].dateOfDeposit}</span>
                  </DateDisplay>
                </CardHeaderFlex>
              </CardHeader>

              <CardBody>
                <InfoGrid>
                  <InfoItem>
                    <InfoLabel>Initial Capital</InfoLabel>
                    <InfoValue>
                      <IconWrapper color="#4ade80">
                        <DollarSign size={18} />
                      </IconWrapper>
                      {formatCurrency(result.originalCapital)}
                    </InfoValue>
                  </InfoItem>

                  <InfoItem>
                    <InfoLabel>Deposit Amount</InfoLabel>
                    <InfoValue>
                      <IconWrapper color="#60a5fa">
                        <ArrowUpCircle size={18} />
                      </IconWrapper>
                      {formatCurrency(result.depositAmount)}
                    </InfoValue>
                  </InfoItem>

                  <InfoItem>
                    <InfoLabel>Target Amount</InfoLabel>
                    <InfoValue>
                      <IconWrapper color="#c084fc">
                        <TrendingUp size={18} />
                      </IconWrapper>
                      {formatCurrency(result.targetAmount)}
                    </InfoValue>
                  </InfoItem>

                  <InfoItem>
                    <InfoLabel>Days to Double</InfoLabel>
                    <InfoValue>
                      <IconWrapper color="#facc15">
                        <Clock size={18} />
                      </IconWrapper>
                      {result.daysToDouble}
                    </InfoValue>
                  </InfoItem>
                </InfoGrid>

                <ProgressContainer>
                  <ProgressLabel>
                    <ProgressLabelText>Progress</ProgressLabelText>
                    <ProgressValue>{currentProgress}%</ProgressValue>
                  </ProgressLabel>
                  <ProgressBarOuter>
                    <ProgressBarInner progress={`${currentProgress}%`} />
                  </ProgressBarOuter>
                </ProgressContainer>

                <EstimatedDate>
                  <Calendar size={16} />
                  <EstimatedDateLabel>
                    Estimated completion date:
                  </EstimatedDateLabel>
                  <EstimatedDateValue>
                    {result.estimatedDate}
                  </EstimatedDateValue>
                </EstimatedDate>
              </CardBody>
            </Card>
          );
        })}
      </Grid>
    </Container>
  );
};

export default DepositDoublingTracker;
