import React from "react";
import sportTypes from "../../data/sportTypes";
import TeamParticipants from "./TeamParticipants";
import IndividualParticipants from "./IndividualParticipants";
import MixedParticipants from "./MixedParticipants";
import "./GameSlot.css";

const GameSlot = ({
  slot,
  globalIndex,
  updateParticipant,
  updateType,
  removeGameSlot,
  teams,
  players,
  selectedSport,
}) => {
  const sportType = sportTypes[selectedSport];

  return (
    <div className="game-slot-content">
      {/* <div className="time-display">
        <span>{slot.startTime} - {slot.endTime}</span>
      </div>
      <div className="sport-display">
        <span>{selectedSport}</span>
      </div> */}
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
      <button className="remove-button" onClick={() => removeGameSlot(globalIndex)} aria-label="Remove Slot">
        ✕ Remove
      </button>
    </div>
  );
};

export default GameSlot;