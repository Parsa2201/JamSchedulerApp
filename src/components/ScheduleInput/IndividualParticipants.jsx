import React from "react";

const IndividualParticipants = ({ slot, globalIndex, updateParticipant, players }) => {
  return (
    <div className="participant-group">
      <div className="participant-column">
        <label className="participant-label">Player A</label>
        <select
          className="custom-select compact participant-select"
          value={slot.participants.sideA || ""}
          onChange={(e) => updateParticipant(globalIndex, "sideA", e.target.value)}
        >
          <option value="">Select Player A</option>
          {players.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>
      <div className="participant-column">
        <label className="participant-label">Player B</label>
        <select
          className="custom-select compact participant-select"
          value={slot.participants.sideB || ""}
          onChange={(e) => updateParticipant(globalIndex, "sideB", e.target.value)}
        >
          <option value="">Select Player B</option>
          {players.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default IndividualParticipants;