import React, { createContext, useState } from "react";

export const ScheduleContext = createContext();

export const ScheduleProvider = ({ children }) => {
  const [gameSlots, setGameSlots] = useState([]);
  const [savedSchedules, setSavedSchedules] = useState([]);

  return (
    <ScheduleContext.Provider value={{ gameSlots, setGameSlots, savedSchedules, setSavedSchedules }}>
      {children}
    </ScheduleContext.Provider>
  );
};