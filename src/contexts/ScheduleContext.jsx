import React, { createContext, useState } from "react";

export const ScheduleContext = createContext();

export const ScheduleProvider = ({ children, teams, players }) => {
  const [schedules, setSchedules] = useState({});

  const saveSchedule = (sport, schedule) => {
    setSchedules((prev) => ({ ...prev, [sport]: schedule }));
  };

  return (
    <ScheduleContext.Provider value={{ schedules, saveSchedule, teams, players }}>
      {children}
    </ScheduleContext.Provider>
  );
};