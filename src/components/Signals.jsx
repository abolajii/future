import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { getSignalForTheDay } from "../api/request";

const WidgetGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  margin: 10px 0;
`;

const Card = styled.div`
  background: #25262b;
  border-radius: 12px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  overflow: hidden;
  border-left: 5px solid ${(props) => getStatusColor(props.status)};
  padding: 1rem 1rem;
  position: relative;
`;

const CardHeader = styled.div`
  font-size: 1rem;
  font-weight: 600;
  color: #f9fafb;
`;

const CardContent = styled.div`
  font-size: 0.95rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 3px 0;
`;

const Time = styled.span`
  font-size: 0.875rem;
  color: #9ca3af;
`;

const StatusBadge = styled.span`
  font-size: 0.75rem;
  padding: 2px 8px;
  border-radius: 12px;
  background-color: ${(props) => {
    switch (props.status) {
      case "not-started":
        return "#343a40";
      case "in-progress":
        return "#ffec99";
      case "completed":
        return "#28a74550";
      default:
        return "#343a40";
    }
  }};
  color: ${(props) => {
    switch (props.status) {
      case "not-started":
        return "#9ca3af";
      case "in-progress":
        return "#f59f00";
      case "completed":
        return "#28a790";
      default:
        return "#9ca3af";
    }
  }};
`;

const NotificationDot = styled.div`
  position: absolute;
  top: 8px;
  right: 8px;
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background-color: #ff0000;
  animation: pulse 1.5s infinite;

  @keyframes pulse {
    0% {
      transform: scale(0.95);
      box-shadow: 0 0 0 0 rgba(255, 0, 0, 0.7);
    }
    70% {
      transform: scale(1);
      box-shadow: 0 0 0 6px rgba(255, 0, 0, 0);
    }
    100% {
      transform: scale(0.95);
      box-shadow: 0 0 0 0 rgba(255, 0, 0, 0);
    }
  }
`;

const getStatusColor = (status) => {
  switch (status) {
    case "not-started":
      return "#9ca3af";
    case "in-progress":
      return "#facc15";
    case "completed":
      return "#10b981";
    default:
      return "#9ca3af";
  }
};

const Signals = ({ signals: propSignals, setSignals: propSetSignals }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [signals, setSignals] = useState([]);

  useEffect(() => {
    if (propSignals) {
      // Use signals passed from parent if available
      setSignals(propSignals);
      setLoading(false);
      fetchSignals();
    } else {
      // Otherwise fetch signals from the API
      fetchSignals();
    }
  }, []);

  const fetchSignals = async () => {
    try {
      setLoading(true);
      const response = await getSignalForTheDay();
      console.log("running");
      if (response && response.signals) {
        const formattedSignals = response.signals.map((signal) => {
          // Parse the datetime string properly
          const [datePart, startTime, , endTime] = signal.time.split(" ");
          const [startHour, startMinute] = startTime.split(":").map(Number);
          const [endHour, endMinute] = endTime.split(":").map(Number);

          return {
            ...signal,
            id: signal._id,
            title: signal.title || `Signal ${signal.id}`,
            time: `${startTime} - ${endTime}`,
            originalDate: datePart,
            startHour,
            startMinute,
            endHour,
            endMinute,
            status: signal.status || "not-started",
            traded: signal.traded || false,
            capitalUpdated: signal.capitalUpdated || false,
            hasNotification: false,
          };
        });
        setSignals(formattedSignals);
        if (propSetSignals) {
          propSetSignals(formattedSignals);
        }
      }
    } catch (err) {
      setError("Failed to fetch signals");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={{ color: "#f9fafb" }}>Loading signals...</div>;
  }

  if (error) {
    return <div style={{ color: "#f9fafb" }}>{error}</div>;
  }

  return (
    <div>
      <WidgetGrid>
        {signals.length > 0 ? (
          signals.map((signal) => (
            <Card key={signal.id || signal.title} status={signal.status}>
              {signal.hasNotification && <NotificationDot />}
              <CardContent>
                <CardHeader>{signal.title}</CardHeader>
                <StatusBadge status={signal.status}>
                  {signal.status.replace("-", " ")}
                </StatusBadge>
              </CardContent>
              <Time>{signal.time}</Time>
            </Card>
          ))
        ) : (
          <div style={{ color: "#f9fafb", gridColumn: "1 / -1" }}>
            No signals available for today
          </div>
        )}
      </WidgetGrid>
    </div>
  );
};

export default Signals;
