import React from "react";
import ScheduleInput from "./components/ScheduleInput/ScheduleInput";
import { ScheduleProvider } from "./contexts/ScheduleContext";
import { teams, players } from "./data/MockData";

const App = () => {
  return (
    <ScheduleProvider>
      <div>
        <ScheduleInput teams={teams} players={players} />
      </div>
    </ScheduleProvider>
  );
};

export default App;