import React, { useState, useEffect, useContext } from "react";
import "./ScheduleInput.css";
import { ScheduleContext } from "../../contexts/ScheduleContext";
import GameSlot from "./GameSlot";
import { incrementTime } from "../../utils/scheduleUtils";
import sportTypes from "../../data/sportTypes";

const ScheduleInput = ({ selectedSport, teams = [], players = [] }) => {
  const [numGrounds, setNumGrounds] = useState(1);
  const [gameSlots, setGameSlots] = useState([]);
  const [selectedDay, setSelectedDay] = useState(1);
  const [lastRemoved, setLastRemoved] = useState(null);
  const { schedules, saveSchedule } = useContext(ScheduleContext);

  const sportType = sportTypes[selectedSport];

  useEffect(() => {
    const existingSchedule = schedules[selectedSport] || [];
    setGameSlots(existingSchedule);
  }, [selectedSport, schedules]);

  const handleSave = () => {
    saveSchedule(selectedSport, gameSlots);
  };

  const addGameSlot = (ground) => {
    const lastSlot = gameSlots
      .filter((s) => s.day === selectedDay && s.ground === ground)
      .slice(-1)[0];
    const newStartTime = lastSlot ? incrementTime(lastSlot.endTime) : "09:00";
    const newSlot = {
      day: selectedDay,
      ground,
      startTime: newStartTime,
      endTime: incrementTime(newStartTime),
      participants: sportType === "mixed" ? { sideA: null, sideB: null } : { sideA: null, sideB: null },
      type: sportType === "mixed" ? "singles" : null,
    };
    setGameSlots([...gameSlots, newSlot]);
  };

  const removeGameSlot = (index) => {
    const removedSlot = gameSlots[index];
    setLastRemoved({ slot: removedSlot, index });
    setGameSlots(gameSlots.filter((_, i) => i !== index));
  };

  const undoRemove = () => {
    if (!lastRemoved) return;
    const newSlots = [...gameSlots];
    newSlots.splice(lastRemoved.index, 0, lastRemoved.slot);
    setGameSlots(newSlots);
    setLastRemoved(null);
  };

  const updateGameSlotField = (index, field, value) => {
    setGameSlots(gameSlots.map((slot, i) => (i === index ? { ...slot, [field]: value } : slot)));
  };

  const updateParticipant = (index, side, value, playerIndex = null) => {
    setGameSlots(
      gameSlots.map((slot, i) => {
        if (i !== index) return slot;
        const newParticipants = { ...slot.participants };
        if (playerIndex !== null) {
          if (!Array.isArray(newParticipants[side])) newParticipants[side] = [null, null];
          newParticipants[side] = [...newParticipants[side]];
          newParticipants[side][playerIndex] = value;
        } else {
          newParticipants[side] = value;
        }
        return { ...slot, participants: newParticipants };
      })
    );
  };

  const updateType = (index, type) => {
    setGameSlots(
      gameSlots.map((slot, i) =>
        i === index
          ? {
              ...slot,
              type,
              participants: type === "singles" ? { sideA: null, sideB: null } : { sideA: [null, null], sideB: [null, null] },
            }
          : slot
      )
    );
  };

  return (
    <div className="schedule-input">
      <h2 className="schedule-title">Schedule for {selectedSport}</h2>
      <div className="day-selector">
        <label>Select Day:</label>
        <select
          className="custom-select"
          value={selectedDay}
          onChange={(e) => setSelectedDay(parseInt(e.target.value))}
        >
          {[1, 2, 3, 4, 5].map((day) => (
            <option key={day} value={day}>Day {day}</option>
          ))}
        </select>
      </div>
      <div className="grounds-control">
        <label>Number of Grounds:</label>
        <input
          type="number"
          value={numGrounds}
          onChange={(e) => setNumGrounds(Math.max(1, parseInt(e.target.value)))}
          min="1"
        />
      </div>
      {lastRemoved && (
        <button className="undo-button" onClick={undoRemove}>
          Undo Last Removal
        </button>
      )}
      {[...Array(numGrounds)].map((_, i) => {
        const ground = i + 1;
        const slotsForGround = gameSlots.filter((slot) => slot.day === selectedDay && slot.ground === ground);
        return (
          <div key={ground} className="ground-section">
            <h3>Ground {ground}</h3>
            {slotsForGround.map((slot, slotIndex) => {
              const globalIndex = gameSlots.indexOf(slot);
              return (
                <GameSlot
                  key={slotIndex}
                  slot={slot}
                  globalIndex={globalIndex}
                  gameSlots={gameSlots}
                  updateGameSlotField={updateGameSlotField}
                  updateParticipant={updateParticipant}
                  updateType={updateType}
                  removeGameSlot={removeGameSlot}
                  teams={teams}
                  players={players}
                  selectedSport={selectedSport}
                />
              );
            })}
            <button className="add-button" onClick={() => addGameSlot(ground)}>
              Add Slot for Ground {ground}
            </button>
          </div>
        );
      })}
      <button onClick={handleSave}>Save Schedule</button>
    </div>
  );
};

export default ScheduleInput;