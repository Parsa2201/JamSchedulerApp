import React from "react";
import TimelineRuler from "./TimelineRuler";
import TimelineItem from "./TimelineItem";
import { snapMinutes, wouldOverlap } from "./timelineUtils";
import { timeToMinutes, minutesToTime } from "../../utils/scheduleUtils";
import "./Timeline.css";

// Constants for timeline configuration
const slotDurationMins = 15; // Snap to 15-minute increments
const timelineStart = 17 * 60; // 5 PM (17:00) in minutes from midnight
const timelineEnd = 28 * 60; // 4 AM (28:00) in minutes from midnight (next day)
const timelineDuration = timelineEnd - timelineStart; // Total duration of the timeline in minutes

const Timeline = ({
  ground, // The specific ground this timeline is for
  slots, // Game slots filtered for the current ground and selectedDay
  selectedDay, // The currently selected day
  gameSlots, // The complete list of all game slots across all grounds/days
  updateGameSlotField, // Function to update a field of a game slot
  updateParticipant, // Function to update a participant in a game slot
  updateType, // Function to update the type of a game slot
  removeGameSlot, // Function to remove a game slot
  teams, // List of available teams
  players, // List of available players
  selectedSport, // The currently selected sport
}) => {
  const timelineRef = React.useRef();
  const [responsiveScale, setResponsiveScale] = React.useState(1);

  // State to manage the drag operation for a controlled component
  const [dragInfo, setDragInfo] = React.useState({
    isDragging: false,
    index: null,
    x: 0,
  });

  React.useEffect(() => {
    const updateScale = () => {
      if (timelineRef.current) {
        const width = timelineRef.current.offsetWidth;
        setResponsiveScale(width / timelineDuration);
      }
    };
    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []); // timelineDuration is a constant, so empty dependency array is fine

  // Handler for when dragging starts
  const handleDragStart = (globalIndex, e, d) => {
    setDragInfo({
      isDragging: true,
      index: globalIndex,
      x: d.x, // d.x is the position from the Rnd component
    });
  };

  // Handler for during the drag
  const handleDrag = (globalIndex, e, d) => {
    // Update the position in our temporary drag state.
    // This makes the Rnd component move smoothly as a controlled component.
    setDragInfo(prev => ({ ...prev, x: d.x }));
  };

  // MODIFIED: handleDragStop now resets the drag state and performs the final update
  const handleDragStop = (globalIndex, e, d) => {
    // Reset the temporary drag state
    setDragInfo({ isDragging: false, index: null, x: 0 });

    const slot = gameSlots[globalIndex];
    if (!slot) return;

    const duration = timeToMinutes(slot.endTime) - timeToMinutes(slot.startTime);
    // Calculate new start minutes based on the final drag position (d.x)
    let newStartMinutes = timelineStart + Math.round(d.x / responsiveScale);
    newStartMinutes = snapMinutes(newStartMinutes, slotDurationMins);

    if (newStartMinutes < timelineStart) {
      newStartMinutes = timelineStart;
    }

    let newEndMinutes = newStartMinutes + duration;

    if (newEndMinutes > timelineEnd) {
      newEndMinutes = timelineEnd;
      newStartMinutes = newEndMinutes - duration;
      newStartMinutes = snapMinutes(newStartMinutes, slotDurationMins);
    }

    if (newEndMinutes - newStartMinutes < slotDurationMins) {
      newEndMinutes = newStartMinutes + slotDurationMins;
      if (newEndMinutes > timelineEnd) {
        newEndMinutes = timelineEnd;
        newStartMinutes = newEndMinutes - slotDurationMins;
        newStartMinutes = snapMinutes(newStartMinutes, slotDurationMins);
      }
    }

    // If overlap, return early. The component will snap back to its
    // original position because dragInfo is reset.
    if (wouldOverlap(newStartMinutes, newEndMinutes, globalIndex, gameSlots)) {
      return;
    }

    // Update the actual game slot data
    updateGameSlotField(globalIndex, "startTime", minutesToTime(newStartMinutes));
    updateGameSlotField(globalIndex, "endTime", minutesToTime(newEndMinutes));
  };

  const handleResizeStop = (globalIndex, e, direction, ref, delta, newPos) => {
    const slot = gameSlots[globalIndex];
    if (!slot) return;

    let newStartMinutes = timelineStart + Math.round(newPos.x / responsiveScale);
    let newEndMinutes = newStartMinutes + Math.round(ref.offsetWidth / responsiveScale);

    newStartMinutes = snapMinutes(newStartMinutes, slotDurationMins);
    newEndMinutes = snapMinutes(newEndMinutes, slotDurationMins);

    if (newStartMinutes < timelineStart) newStartMinutes = timelineStart;
    if (newEndMinutes > timelineEnd) newEndMinutes = timelineEnd;

    if (newEndMinutes - newStartMinutes < slotDurationMins) {
      if (direction === 'left') {
        newStartMinutes = newEndMinutes - slotDurationMins;
      } else {
        newEndMinutes = newStartMinutes + slotDurationMins;
      }
      newStartMinutes = snapMinutes(newStartMinutes, slotDurationMins);
      newEndMinutes = snapMinutes(newEndMinutes, slotDurationMins);
    }

    if (wouldOverlap(newStartMinutes, newEndMinutes, globalIndex, gameSlots)) {
      return;
    }

    updateGameSlotField(globalIndex, "startTime", minutesToTime(newStartMinutes));
    updateGameSlotField(globalIndex, "endTime", minutesToTime(newEndMinutes));
  };

  return (
    <div className="timeline-container">
      <div className="timeline-track" ref={timelineRef}>
        <TimelineRuler timelineStart={timelineStart} timelineDuration={timelineDuration} responsiveScale={responsiveScale} />
        <div className="timeline-items">
          {slots.map((slot) => {
            const globalIndex = gameSlots.indexOf(slot);
            if (globalIndex === -1) return null;

            const startMinutes = timeToMinutes(slot.startTime);
            const endMinutes = timeToMinutes(slot.endTime);

            const x = Math.max(0, (startMinutes - timelineStart) * responsiveScale);
            const width = Math.max(
              (endMinutes - startMinutes) * responsiveScale,
              responsiveScale * slotDurationMins
            );

            const hasOverlap = gameSlots.some(
              (s, i) =>
                i !== globalIndex &&
                s.day === slot.day &&
                s.ground === slot.ground &&
                timeToMinutes(s.startTime) < endMinutes &&
                startMinutes < timeToMinutes(s.endTime)
            );

            const isBeingDragged = dragInfo.isDragging && dragInfo.index === globalIndex;

            return (
              <TimelineItem
                key={globalIndex}
                slot={slot}
                globalIndex={globalIndex}
                startMinutes={startMinutes}
                endMinutes={endMinutes}
                x={x}
                width={width}
                isBeingDragged={isBeingDragged}
                dragInfo={dragInfo}
                hasOverlap={hasOverlap}
                responsiveScale={responsiveScale}
                slotDurationMins={slotDurationMins}
                handleDragStart={handleDragStart}
                handleDrag={handleDrag}
                handleDragStop={handleDragStop}
                handleResizeStop={handleResizeStop}
                updateParticipant={updateParticipant}
                updateType={updateType}
                removeGameSlot={removeGameSlot}
                teams={teams}
                players={players}
                selectedSport={selectedSport}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Timeline;