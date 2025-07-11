import React from "react";
import sportTypes from "../../data/sportTypes";
import TeamParticipants from "./TeamParticipants";
import IndividualParticipants from "./IndividualParticipants";
import MixedParticipants from "./MixedParticipants";
import { hasTimeOverlap } from "../../utils/scheduleUtils";

const GameSlot = ({
  slot,
  globalIndex,
  gameSlots,
  updateGameSlotField,
  updateParticipant,
  updateType,
  removeGameSlot,
  teams,
  players,
  selectedSport,
}) => {
  const sportType = sportTypes[selectedSport];
  const overlap = hasTimeOverlap(slot, globalIndex, gameSlots);

  return (
    <div className={`game-slot ${overlap ? "overlap" : ""}`}>
      <div className="time-group">
        <div>
          <label>Start Time</label>
          <input
            type="time"
            value={slot.startTime}
            onChange={(e) => updateGameSlotField(globalIndex, "startTime", e.target.value)}
          />
        </div>
        <div>
          <label>End Time</label>
          <input
            type="time"
            value={slot.endTime}
            onChange={(e) => updateGameSlotField(globalIndex, "endTime", e.target.value)}
          />
        </div>
      </div>
      {sportType === "team" && (
        <TeamParticipants
          slot={slot}
          globalIndex={globalIndex}
          updateParticipant={updateParticipant}
          teams={teams}
        />
      )}
      {sportType === "individual" && (
        <IndividualParticipants
          slot={slot}
          globalIndex={globalIndex}
          updateParticipant={updateParticipant}
          players={players}
        />
      )}
      {sportType === "mixed" && (
        <MixedParticipants
          slot={slot}
          globalIndex={globalIndex}
          updateParticipant={updateParticipant}
          updateType={updateType}
          players={players}
        />
      )}
      <button className="remove-button" onClick={() => removeGameSlot(globalIndex)}>
        ✕
      </button>
    </div>
  );
};

export default GameSlot;