import React, { useState } from "react";
import styled from "styled-components";
import FirstWeek from "./FirstWeek";
import OtherWeek from "./OtherWeek";

const Container = styled.div`
  button {
    color: #fff;
  }
`;

const WeeklyDetails = () => {
  const [weekOffset, setWeekOffset] = useState(0);
  const [weeklyData, setWeeklyData] = useState([]);
  const lastWeekEndDate = weeklyData[weeklyData.length - 1]?.fullDate;
  const lastWeekEndCapital =
    weeklyData[weeklyData.length - 1]?.balanceAfterSecondTrade;

  return (
    <Container>
      {/* <button
        disabled={weekOffset === 0}
        onClick={() => setWeekOffset((prev) => prev - 1)}
      >
        Prev week
      </button>
      <button
        onClick={() => {
          setWeekOffset((prev) => prev + 1);
        }}
      >
        Next week
      </button> */}

      {weekOffset === 0 && (
        <FirstWeek weeklyData={weeklyData} setWeeklyData={setWeeklyData} />
      )}
      {weekOffset > 0 && (
        <OtherWeek
          lastWeekEndDate={lastWeekEndDate}
          lastWeekEndCapital={lastWeekEndCapital}
          weekOffset={weekOffset}
        />
      )}
    </Container>
  );
};

export default WeeklyDetails;
