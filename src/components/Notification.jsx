import React, { useEffect, useState } from "react";

import styled from "styled-components";
import Signals from "./Signals";
import Notify from "./Notify";

const Container = styled.div`
  flex: 0.9;
  padding: 15px;
  background: #25262b;
  position: relative;
  height: fit-content;
  border-radius: 12px;
  margin-top: 25px;

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

const NotificationBadge = styled.div`
  /* background: #ff0000; */
  color: #ff0000;
  border-radius: 50px;
  font-size: 13px;
  font-weight: bold;
  /* box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); */
  /* display: inline-block; */
  /* height: 20px; */
  /* width: 20px; */
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Notification = () => {
  const [isThirtyMinsAway, setIsThirtyMinsAway] = useState(false);

  const signalTime = [
    { id: 1, message: "Signal 1", time: "14:00-14:30" },
    { id: 2, message: "Signal 2", time: "19:00-19:30" },
  ];

  const checkIfThirtyMinsAway = () => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTime = currentHour * 60 + currentMinute;

    return signalTime.some((signal) => {
      const [startHour, startMinute] = signal.time
        .split("-")[0]
        .split(":")
        .map(Number);
      const signalStartTime = startHour * 60 + startMinute;
      return currentTime === signalStartTime - 30; // Exactly 30 mins before the signal starts
    });
  };

  useEffect(() => {
    setIsThirtyMinsAway(checkIfThirtyMinsAway());

    const interval = setInterval(() => {
      setIsThirtyMinsAway(checkIfThirtyMinsAway());
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);
  return (
    <Container>
      <div className="header">
        <p>All Notification</p>
        {isThirtyMinsAway && <NotificationBadge>1</NotificationBadge>}
      </div>
      <Notify />

      <div className="body">
        {/* <h3>Signal</h3> */}
        <Signals />
      </div>
    </Container>
  );
};

export default Notification;
