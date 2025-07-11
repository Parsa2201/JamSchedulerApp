import React, { useState, useContext, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { ScheduleContext } from "../../contexts/ScheduleContext";
import Timeline from "./Timeline";
import "./ScheduleInput.css";
import sportTypes from "../../data/sportTypes";
import { timeToMinutes, minutesToTime } from "../../utils/scheduleUtils";
import SportSelector from '../../SportSelector';

const ScheduleInput = ({ teams, players }) => {
  const { gameSlots = [], setGameSlots, savedSchedules, setSavedSchedules } = useContext(ScheduleContext);
  const [selectedSport, setSelectedSport] = useState(Object.keys(sportTypes)[0]);
  const [selectedDay, setSelectedDay] = useState("1");
  const [numGrounds, setNumGrounds] = useState(1);

  const days = ["1", "2", "3", "4", "5"];

  const addGameSlot = (ground) => {
    // Find all slots for this day and ground
    const slotsForGround = gameSlots.filter(
      (slot) => slot.day === selectedDay && slot.ground === ground
    );
    // Sort by start time
    const sortedSlots = slotsForGround.sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));
    // Timeline bounds
    const startBound = timeToMinutes("17:00");
    const endBound = timeToMinutes("28:00");
    // Find first available 1 hour interval
    let slotStart = startBound;
    let slotEnd = slotStart + 60;
    let found = false;
    for (let i = 0; i <= sortedSlots.length; i++) {
      const nextSlot = sortedSlots[i];
      const nextStart = nextSlot ? timeToMinutes(nextSlot.startTime) : endBound;
      if (nextStart - slotStart >= 60) {
        found = true;
        break;
      }
      slotStart = timeToMinutes(nextSlot.endTime);
      slotEnd = slotStart + 60;
    }
    if (!found && slotEnd > endBound) {
      // No available slot
      return;
    }
    const newSlot = {
      id: uuidv4(),
      day: selectedDay,
      ground,
      startTime: minutesToTime(slotStart),
      endTime: minutesToTime(slotStart + 60),
      sport: selectedSport,
      participants: sportTypes[selectedSport] === "mixed" ? { sideA: [], sideB: [], type: "singles" } : { sideA: "", sideB: "" },
    };
    setGameSlots([...gameSlots, newSlot]);
  };

  const removeGameSlot = (index) => {
    setGameSlots(gameSlots.filter((_, i) => i !== index));
  };

  const updateGameSlotField = (index, field, value) => {
    setGameSlots(
      gameSlots.map((slot, i) =>
        i === index ? { ...slot, [field]: value } : slot
      )
    );
  };

  const updateParticipant = (index, side, value, subIndex = null) => {
    setGameSlots(
      gameSlots.map((slot, i) => {
        if (i !== index) return slot;
        const newParticipants = { ...slot.participants };
        if (subIndex !== null) {
          newParticipants[side] = [...newParticipants[side]];
          newParticipants[side][subIndex] = value;
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
              participants:
                type === "singles" ? { sideA: "", sideB: "" } : { sideA: ["", ""], sideB: ["", ""] },
            }
          : slot
      )
    );
  };

  const saveSchedule = () => {
    setSavedSchedules([...savedSchedules, { sport: selectedSport, days: { [selectedDay]: gameSlots } }]);
    setGameSlots([]);
    setNumGrounds(1);
  };

  const undoSchedule = () => {
    setGameSlots([]);
    setNumGrounds(1);
  };

  useEffect(() => {
    setGameSlots([]);
    setNumGrounds(1);
  }, [selectedSport, selectedDay, setGameSlots]);

  return (
    <div className="schedule-input">
      <h1 className="schedule-title">Jam Schedule App</h1>
      <p className="subtitle">
        Plan and manage games for Jam. Add slots for each ground, assign teams/players, and detect conflicts instantly!
      </p>
      <div className="day-selector">
        <label className="sport-label">Sport:</label>
        <SportSelector selectedSport={selectedSport} onSelectSport={setSelectedSport} />
        <label className="day-label">Day:</label>
        <select
          value={selectedDay}
          onChange={(e) => setSelectedDay(e.target.value)}
          className="custom-select"
          aria-label="Select Day"
        >
          {days.map((day) => (
            <option key={day} value={day}>
              {day}
            </option>
          ))}
        </select>
      </div>
      <div className="grounds-control">
        <label>Number of Grounds:</label>
        <input
          type="number"
          min="1"
          value={numGrounds}
          onChange={(e) => setNumGrounds(Math.max(1, parseInt(e.target.value) || 1))}
          aria-label="Number of Grounds"
        />
        <button className="add-ground-button" onClick={() => setNumGrounds(numGrounds + 1)} aria-label="Add Ground">
          <span className="add-ground-icon">+</span>
        </button>
      </div>
      {Array.from({ length: numGrounds }, (_, i) => i + 1).map((ground) => (
        <div key={ground} className="ground-section">
          <h3>Ground {ground}</h3>
          <button className="add-button" onClick={() => addGameSlot(ground)} aria-label={`Add Slot to Ground ${ground}`}>
            <span className="add-slot-icon">➕ Add Slot</span>
          </button>
          <Timeline
            ground={ground}
            slots={gameSlots.filter((slot) => slot.day === selectedDay && slot.ground === ground) || []}
            selectedDay={selectedDay}
            gameSlots={gameSlots}
            updateGameSlotField={updateGameSlotField}
            updateParticipant={updateParticipant}
            updateType={updateType}
            removeGameSlot={removeGameSlot}
            teams={teams}
            players={players}
            selectedSport={selectedSport}
          />
        </div>
      ))}
      <div className="action-buttons">
        <button className="undo-button" onClick={undoSchedule} aria-label="Undo Schedule">
          <span className="undo-icon">⟲ Undo</span>
        </button>
        <button className="save-button" onClick={saveSchedule} aria-label="Save Schedule">
          <span className="save-icon">💾 Save Schedule</span>
        </button>
      </div>
    </div>
  );
};

export default ScheduleInput;