import React, { useState, useContext, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { ScheduleContext } from "../../contexts/ScheduleContext";
import FullCalendar from "@fullcalendar/react";
import resourceTimelinePlugin from "@fullcalendar/resource-timeline";
import interactionPlugin from "@fullcalendar/interaction";
import GameSlot from "./GameSlot";
import "./ScheduleInput.css";
import sportTypes from "../../data/sportTypes";
import { timeToMinutes, minutesToTime } from "../../utils/scheduleUtils";
import SportSelector from "../../SportSelector";

const ScheduleInput = ({ teams, players }) => {
  let { gameSlots = [], setGameSlots, savedSchedules, setSavedSchedules } = useContext(ScheduleContext);
  const [selectedSport, setSelectedSport] = useState(Object.keys(sportTypes)[0]);
  const [selectedDay, setSelectedDay] = useState("1");
  const [numGrounds, setNumGrounds] = useState(1);

  const days = ["1", "2", "3", "4", "5"];

  // Define resources (grounds)
  const resources = Array.from({ length: numGrounds }, (_, i) => ({
    id: `${i + 1}`,
    title: `Ground ${i + 1}`,
  }));

  // Base date for the selected day
  const baseDate = new Date(2023, 0, parseInt(selectedDay)); // January 1–5, 2023

  // Transform game slots into calendar events
  const events = gameSlots
    .filter((slot) => slot.day === selectedDay)
    .map((slot) => {
      const [startHour, startMin] = slot.startTime.split(":").map(Number);
      const [endHour, endMin] = slot.endTime.split(":").map(Number);

      const startDate = new Date(baseDate);
      if (startHour >= 24) {
        startDate.setDate(startDate.getDate() + 1);
        startDate.setHours(startHour - 24, startMin, 0, 0);
      } else {
        startDate.setHours(startHour, startMin, 0, 0);
      }

      const endDate = new Date(baseDate);
      if (endHour >= 24) {
        endDate.setDate(endDate.getDate() + 1);
        endDate.setHours(endHour - 24, endMin, 0, 0);
      } else {
        endDate.setHours(endHour, endMin, 0, 0);
      }

      return {
        id: slot.id,
        start: startDate,
        end: endDate,
        resourceId: slot.ground,
        title: `${slot.sport}`,
        extendedProps: { data: slot },
      };
    });

  // Add a new game slot
  const addGameSlot = (ground) => {
    const slotsForGround = gameSlots.filter(
      (slot) => slot.day === selectedDay && slot.ground === ground
    );
    const sortedSlots = slotsForGround.sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));
    const startBound = timeToMinutes("17:00");
    const endBound = timeToMinutes("28:00");
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
    if (!found && slotEnd > endBound) return;

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

  // Remove a game slot by ID
  const removeGameSlot = (id) => {
    setGameSlots(gameSlots.filter((slot) => slot.id !== id));
  };

  // Update a game slot with multiple fields
  const updateGameSlotField = (id, updates) => {
    setGameSlots(
      gameSlots.map((slot) => (slot.id === id ? { ...slot, ...updates } : slot))
    );
  };

  // Update participants by ID
  const updateParticipant = (id, side, value, subIndex = null) => {
    setGameSlots(
      gameSlots.map((slot) => {
        if (slot.id !== id) return slot;
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

  // Update type for mixed sports by ID
  const updateType = (id, type) => {
    setGameSlots(
      gameSlots.map((slot) =>
        slot.id === id
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

  // Handle event move
  const handleEventMove = (info) => {
    const { event } = info;
    const id = event.id;
    const start = event.start;
    const end = event.end;
    const resourceId = event.getResources()[0]?.id;

    if (!resourceId) {
      console.error("No resourceId found for event");
      info.revert();
      return;
    }

    const startHour = start.getHours() + (start.getDate() > baseDate.getDate() ? 24 : 0);
    const endHour = end.getHours() + (end.getDate() > baseDate.getDate() ? 24 : 0);
    const newStartTime = `${startHour.toString().padStart(2, "0")}:${start.getMinutes().toString().padStart(2, "0")}`;
    const newEndTime = `${endHour.toString().padStart(2, "0")}:${end.getMinutes().toString().padStart(2, "0")}`;

    console.log(`Moving event ${id} to start: ${newStartTime}, end: ${newEndTime}, ground: ${resourceId}`);

    // Overlap check
    const newStartMinutes = timeToMinutes(newStartTime);
    const newEndMinutes = timeToMinutes(newEndTime);
    const hasOverlap = gameSlots.some(
      (s) =>
        s.id !== id &&
        s.day === selectedDay &&
        s.ground === resourceId &&
        newStartMinutes < timeToMinutes(s.endTime) &&
        newEndMinutes > timeToMinutes(s.startTime)
    );
    if (hasOverlap) {
      alert("Cannot move: Slot overlaps with another slot on the same ground.");
      info.revert();
      return;
    }

    // Batch update
    updateGameSlotField(id, {
      startTime: newStartTime,
      endTime: newEndTime,
      ground: resourceId,
    });
  };

  // Handle event resize
  const handleEventResize = (info) => {
    const { event } = info;
    const id = event.id;
    const start = event.start;
    const end = event.end;
    const resourceId = event.getResources()[0]?.id;

    if (!resourceId) {
      console.error("No resourceId found for event");
      info.revert();
      return;
    }

    const startHour = start.getHours() + (start.getDate() > baseDate.getDate() ? 24 : 0);
    const endHour = end.getHours() + (end.getDate() > baseDate.getDate() ? 24 : 0);
    const newStartTime = `${startHour.toString().padStart(2, "0")}:${start.getMinutes().toString().padStart(2, "0")}`;
    const newEndTime = `${endHour.toString().padStart(2, "0")}:${end.getMinutes().toString().padStart(2, "0")}`;

    console.log(`Resizing event ${id} to start: ${newStartTime}, end: ${newEndTime}, ground: ${resourceId}`);

    // Overlap check
    const newStartMinutes = timeToMinutes(newStartTime);
    const newEndMinutes = timeToMinutes(newEndTime);
    const hasOverlap = gameSlots.some(
      (s) =>
        s.id !== id &&
        s.day === selectedDay &&
        s.ground === resourceId &&
        newStartMinutes < timeToMinutes(s.endTime) &&
        newEndMinutes > timeToMinutes(s.startTime)
    );
    if (hasOverlap) {
      alert("Cannot resize: Slot overlaps with another slot on the same ground.");
      info.revert();
      return;
    }

    // Batch update
    updateGameSlotField(id, {
      startTime: newStartTime,
      endTime: newEndTime,
    });
  };

  // Custom event rendering
  const renderEventContent = ({ event }) => {
    const slot = event.extendedProps.data;
    const hasOverlap = gameSlots.some(
      (s) =>
        s.id !== slot.id &&
        s.day === selectedDay &&
        s.ground === slot.ground &&
        timeToMinutes(s.startTime) < timeToMinutes(slot.endTime) &&
        timeToMinutes(s.endTime) > timeToMinutes(slot.startTime)
    );
    return (
      <div className={hasOverlap ? "overlap" : ""}>
        <GameSlot
          slot={slot}
          globalIndex={slot.id}
          updateParticipant={updateParticipant}
          updateType={updateType}
          removeGameSlot={() => removeGameSlot(slot.id)}
          teams={teams}
          players={players}
          selectedSport={selectedSport}
        />
        {hasOverlap && <span className="timeline-item-conflict-indicator">Conflict!</span>}
      </div>
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

  // Log state updates for debugging
  useEffect(() => {
    console.log("gameSlots updated:", gameSlots);
  }, [gameSlots]);

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
      <div className="ground-section">
        <h3>Schedule for Day {selectedDay}</h3>
        {resources.map((resource) => (
          <button
            key={resource.id}
            className="add-button"
            onClick={() => addGameSlot(resource.id)}
            aria-label={`Add Slot to ${resource.title}`}
          >
            <span className="add-slot-icon">➕ Add Slot to {resource.title}</span>
          </button>
        ))}
        <div style={{ height: "600px", marginTop: "20px" }}>
          <FullCalendar
            plugins={[resourceTimelinePlugin, interactionPlugin]}
            initialView="resourceTimelineDay"
            initialDate={baseDate}
            resources={resources}
            events={events}
            editable={true}
            droppable={true}
            eventDrop={handleEventMove}
            eventResize={handleEventResize} // Uncommented and implemented
            eventContent={renderEventContent}
            slotDuration="00:15:00"
            slotMinTime="17:00:00"
            slotMaxTime="28:00:00"
            resourceAreaWidth="150px"
            slotMinWidth={50}
            height="auto"
            schedulerLicenseKey="GPL-My-Project-Is-Open-Source"
          />
        </div>
      </div>
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