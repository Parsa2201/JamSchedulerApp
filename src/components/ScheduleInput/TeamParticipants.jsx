import React from "react";

const TeamParticipants = ({ slot, globalIndex, updateParticipant, teams }) => {
  return (
    <div className="participant-group">
      <div>
        <label>Team A</label>
        <select
          className="custom-select"
          value={slot.participants.sideA || ""}
          onChange={(e) => updateParticipant(globalIndex, "sideA", e.target.value)}
        >
          <option value="">Select Team A</option>
          {teams.map((t) => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>
      </div>
      <div>
        <label>Team B</label>
        <select
          className="custom-select"
          value={slot.participants.sideB || ""}
          onChange={(e) => updateParticipant(globalIndex, "sideB", e.target.value)}
        >
          <option value="">Select Team B</option>
          {teams.map((t) => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default TeamParticipants;