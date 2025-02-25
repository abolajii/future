import React, { useState, useEffect, useRef } from "react";
import { Volume1 } from "lucide-react";
import styled, { keyframes } from "styled-components";
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
  color: #f9fafb;
`;

const EmptyNotification = styled.div`
  font-size: 0.9rem;
  color: #9ca3af;
  margin: 10px 0;
`;

const Notify = ({ signals }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [upcomingSignals, setUpcomingSignals] = useState([]);
  const intervalRef = useRef(null);
  const timeoutRef = useRef(null);
  // const { user } = useAuthStore();

  const checkUpcomingSignals = () => {
    if (!signals || signals.length === 0) return [];

    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTime = currentHour * 60 + currentMinute;

    return signals.filter((signal) => {
      const signalStartTime = signal.startHour * 60 + (signal.startMinute || 0);
      const timeDiff = signalStartTime - currentTime;
      // Signal is between 25 and 35 minutes away (to give some flexibility)
      return timeDiff > 0 && timeDiff <= 35 && signal.status === "not-started";
    });
  };

  useEffect(() => {
    const updateUpcomingSignals = () => {
      const upcoming = checkUpcomingSignals();
      setUpcomingSignals(upcoming);
    };

    // Initial check
    updateUpcomingSignals();

    // Set up interval to check every minute
    const interval = setInterval(() => {
      updateUpcomingSignals();
    }, 60000);

    return () => clearInterval(interval);
  }, [signals]);

  const generateNotifications = () => {
    if (upcomingSignals.length === 0) return [];

    // Use the first upcoming signal for notifications
    const signal = upcomingSignals[0];
    const estimatedValue = Math.floor(Math.random() * 50) + 20; // Random value between 20-70 for example

    return [
      {
        id: 1,
        info: `Be ready to trade ${signal.title || "upcoming"}! 📈`,
      },
      { id: 2, info: `${signal.time} signal starting soon! ⏰` },
      {
        id: 3,
        info: `If you miss this signal, you could lose $${estimatedValue}!`,
      },
    ];
  };

  const notifications = generateNotifications();

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
    if (notifications.length === 0) return;

    intervalRef.current = setInterval(() => {
      setIsAnimating(true);
      timeoutRef.current = setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % notifications.length);
        setIsAnimating(false);
      }, 500);
    }, 3000);
  };

  useEffect(() => {
    if (notifications.length > 0) {
      startInterval();
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [notifications.length]);

  if (upcomingSignals.length === 0) {
    return null; // Don't show anything if no upcoming signals
  }

  return (
    <NotificationContainer>
      <IconContainer>
        <Volume1 size={20} />
      </IconContainer>
      {notifications.length > 0 ? (
        <NotificationWrapper
          isAnimating={isAnimating}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <div className="info-content">
            <Information>{notifications[currentIndex].info}</Information>
          </div>
        </NotificationWrapper>
      ) : (
        <EmptyNotification>No upcoming signals at this time</EmptyNotification>
      )}
    </NotificationContainer>
  );
};

export default Notify;
