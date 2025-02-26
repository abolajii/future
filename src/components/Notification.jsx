import React, { useEffect, useState } from "react";
import styled from "styled-components";
import Signals from "./Signals";
import Notify from "./Notify";
import Transactions from "../pages/Transactions";

const Container = styled.div`
  flex: 0.9;
  position: relative;
  /* height: fit-content; */
  margin-top: 25px;

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

const NotificationBadge = styled.div`
  color: #ff0000;
  border-radius: 50px;
  font-size: 13px;
  font-weight: bold;
  margin-left: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Notification = () => {
  const [notificationCount, setNotificationCount] = useState(0);
  const [signals, setSignals] = useState([
    {
      id: 1,
      title: "Signal 1",
      time: "14:00 - 14:30",
      status: "not-started",
      startHour: 14,
      startMinute: 0,
      endHour: 14,
      endMinute: 30,
      traded: false,
      capitalUpdated: false,
    },
    {
      id: 2,
      title: "Signal 2",
      time: "19:00 - 19:30",
      status: "not-started",
      startHour: 19,
      startMinute: 0,
      endHour: 19,
      endMinute: 30,
      traded: false,
      capitalUpdated: false,
    },
  ]);

  const checkUpcomingSignals = () => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTime = currentHour * 60 + currentMinute;

    let count = 0;
    const updatedSignals = signals.map((signal) => {
      const signalStartTime = signal.startHour * 60 + signal.startMinute;
      const timeDiff = signalStartTime - currentTime;

      // Check if signal is exactly 30 minutes away
      if (timeDiff > 0 && timeDiff <= 30 && signal.status === "not-started") {
        count++;
        return { ...signal, hasNotification: true };
      }

      // Update signal status based on current time
      let status = signal.status;
      if (
        currentTime >= signalStartTime &&
        currentTime < signal.endHour * 60 + signal.endMinute
      ) {
        status = "in-progress";
      } else if (currentTime >= signal.endHour * 60 + signal.endMinute) {
        status = "completed";
      }

      return { ...signal, status, hasNotification: false };
    });

    setNotificationCount(count);
    setSignals(updatedSignals);
  };

  useEffect(() => {
    checkUpcomingSignals();

    const interval = setInterval(() => {
      checkUpcomingSignals();
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  return (
    <Container>
      <div className="bg">
        <div className="header">
          <p>All Notification</p>
          {notificationCount > 0 && (
            <NotificationBadge>{notificationCount}</NotificationBadge>
          )}
        </div>
        <Notify signals={signals} />
        <div className="body">
          <Signals signals={signals} setSignals={setSignals} />
        </div>
      </div>
      <Transactions />
    </Container>
  );
};

export default Notification;
