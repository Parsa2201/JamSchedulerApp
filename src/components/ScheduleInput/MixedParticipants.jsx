import React from "react";

const MixedParticipants = ({ slot, globalIndex, updateParticipant, updateType, players }) => {
  return (
    <div className="mixed-group">
      <div className="custom-radio">
        <label>
          <input
            type="radio"
            name={`type-${globalIndex}`}
            value="singles"
            checked={slot.type === "singles"}
            onChange={() => updateType(globalIndex, "singles")}
          />
          Singles
        </label>
        <label>
          <input
            type="radio"
            name={`type-${globalIndex}`}
            value="doubles"
            checked={slot.type === "doubles"}
            onChange={() => updateType(globalIndex, "doubles")}
          />
          Doubles
        </label>
      </div>
      {slot.type === "singles" && (
        <div className="participant-group">
          <div>
            <label>Player A</label>
            <select
              className="custom-select"
              value={slot.participants.sideA || ""}
              onChange={(e) => updateParticipant(globalIndex, "sideA", e.target.value)}
            >
              <option value="">Select Player A</option>
              {players.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label>Player B</label>
            <select
              className="custom-select"
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
      )}
      {slot.type === "doubles" && (
        <div className="doubles-group">
          <div className="side-group">
            <label>Side A - Player 1</label>
            <select
              className="custom-select"
              value={slot.participants.sideA[0] || ""}
              onChange={(e) => updateParticipant(globalIndex, "sideA", e.target.value, 0)}
            >
              <option value="">Select Player 1</option>
              {players.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            <label>Side A - Player 2</label>
            <select
              className="custom-select"
              value={slot.participants.sideA[1] || ""}
              onChange={(e) => updateParticipant(globalIndex, "sideA", e.target.value, 1)}
            >
              <option value="">Select Player 2</option>
              {players.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <div className="side-group">
            <label>Side B - Player 1</label>
            <select
              className="custom-select"
              value={slot.participants.sideB[0] || ""}
              onChange={(e) => updateParticipant(globalIndex, "sideB", e.target.value, 0)}
            >
              <option value="">Select Player 1</option>
              {players.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            <label>Side B - Player 2</label>
            <select
              className="custom-select"
              value={slot.participants.sideB[1] || ""}
              onChange={(e) => updateParticipant(globalIndex, "sideB", e.target.value, 1)}
            >
              <option value="">Select Player 2</option>
              {players.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  );
};

export default MixedParticipants;