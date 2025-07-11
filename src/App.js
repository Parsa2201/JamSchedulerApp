import React, { useState } from "react";
import SportSelector from "./SportSelector";
import ScheduleInput from "./components/ScheduleInput/ScheduleInput";
import ConflictChecker from "./ConflictChecker";
import { ScheduleProvider } from "./contexts/ScheduleContext";
import { players, teams } from "./data/MockData";

function App() {
  const [selectedSport, setSelectedSport] = useState("");
  const [showConflicts, setShowConflicts] = useState(false);

  return (
    <ScheduleProvider teams={teams} players={players}>
      <div style={{ textAlign: "center", marginTop: "50px" }}>
        <h1>Jam Schedule App</h1>
        <SportSelector onSelectSport={setSelectedSport} />
        {selectedSport && <ScheduleInput selectedSport={selectedSport} players={players} teams={teams} />}
        <button onClick={() => setShowConflicts(true)}>Check Conflicts</button>
        {showConflicts && <ConflictChecker />}
      </div>
    </ScheduleProvider>
  );
}

export default App;