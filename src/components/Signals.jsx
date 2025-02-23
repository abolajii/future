import React, { useState } from "react";

import styled from "styled-components";
import useAuthStore from "../store/authStore";
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
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
  overflow: hidden;
  border-left: 5px solid ${(props) => getStatusColor(props.status)};
  padding: 1rem 1rem;
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

const Signals = () => {
  const [signals, setSignals] = useState([
    {
      title: "Signal 1",
      time: "14:00 - 14:30",
      status: "not-started",
      startHour: 14,
      endHour: 14,
      endMinute: 30,
      traded: false,
      capitalUpdated: false, // New flag to track if capital was updated early
    },
    {
      title: "Signal 2",
      time: "19:00 - 19:30",
      status: "not-started",
      startHour: 19,
      endHour: 19,
      endMinute: 30,
      traded: false,
      capitalUpdated: false,
    },
  ]);

  // const [signals, setSignals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuthStore();

  const fetchSignals = async () => {
    try {
      setLoading(true);
      const response = await getSignalForTheDay();
      const formattedSignals = response.signals.map((signal) => {
        // Parse the datetime string properly
        const [datePart, startTime, , endTime] = signal.time.split(" ");
        return {
          ...signal,
          id: signal._id,
          time: `${startTime} - ${endTime}`,
          originalDate: datePart,
        };
      });
      setSignals(formattedSignals);
    } catch (err) {
      setError("Failed to fetch signals");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchSignals();
  }, []);
  return (
    <div>
      <WidgetGrid>
        {signals.map((signal) => (
          <Card key={signal.title} status={signal.status}>
            <CardContent>
              <CardHeader>{signal.title}</CardHeader>
              <span>{signal.status}</span>
            </CardContent>
            <Time>{signal.time}</Time>
          </Card>
        ))}
      </WidgetGrid>
    </div>
  );
};

export default Signals;
