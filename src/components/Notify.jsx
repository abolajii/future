import React, { useState, useEffect, useRef } from "react";
import { Volume1 } from "lucide-react";
import styled, { keyframes, css } from "styled-components";
// import useAuthStore from "../store/authStore";

const slideOutUp = keyframes`
  from {
    transform: translateY(0);
    opacity: 1;
  }
  to {
    transform: translateY(-100%);
    opacity: 0;
  }
`;

const slideInUp = keyframes`
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
`;

const NotificationContainer = styled.div`
  display: flex;
  align-items: center;
  margin: 20px 0;
`;

const IconContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  color: #49e98e;
  margin-right: 5px;
`;

const NotificationWrapper = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  cursor: pointer;

  .info-content {
    animation: ${(props) => (props.isAnimating ? slideOutUp : slideInUp)} 0.3s
      ease-in-out forwards;
  }
`;

const Information = styled.div`
  font-size: 0.9rem;
`;

const Notify = ({ profit }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isThirtyMinsAway, setIsThirtyMinsAway] = useState(false);
  const intervalRef = useRef(null);
  const timeoutRef = useRef(null);
  // const { user } = useAuthStore();

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

  const lastMessage = `If you miss this, you lost $${30}`;
  const notifications = [
    { id: 1, info: "Be ready to trade! 📈" },
    { id: 2, info: "30 mins to next signal! ⏰" },
    { id: 3, info: lastMessage },
  ];

  const handleMouseEnter = () => {
    setIsPaused(true);
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  };

  const handleMouseLeave = () => {
    setIsPaused(false);
    startInterval();
  };

  const startInterval = () => {
    intervalRef.current = setInterval(() => {
      setIsAnimating(true);
      timeoutRef.current = setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % notifications.length);
        setIsAnimating(false);
      }, 500);
    }, 3000);
  };

  useEffect(() => {
    startInterval();
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    isThirtyMinsAway && (
      <NotificationContainer>
        <IconContainer>
          <Volume1 size={20} />
        </IconContainer>
        <NotificationWrapper
          isAnimating={isAnimating}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <div className="info-content">
            <Information>{notifications[currentIndex].info}</Information>
          </div>
        </NotificationWrapper>
      </NotificationContainer>
    )
  );
};

export default Notify;
