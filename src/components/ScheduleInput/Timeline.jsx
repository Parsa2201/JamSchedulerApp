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
const trackPadding = 20; // Padding of .timeline-track in pixels

const Timeline = ({
  ground,
  slots,
  selectedDay,
  gameSlots,
  updateGameSlotField,
  updateParticipant,
  updateType,
  removeGameSlot,
  teams,
  players,
  selectedSport,
}) => {
  const timelineRef = React.useRef();
  const [responsiveScale, setResponsiveScale] = React.useState(1);
  const [dragInfo, setDragInfo] = React.useState({
    isDragging: false,
    index: null,
    x: 0,
    tempHasOverlap: false,
  });

  React.useEffect(() => {
    const updateScale = () => {
      if (timelineRef.current) {
        const width = timelineRef.current.clientWidth;
        setResponsiveScale(width / timelineDuration);
      }
    };
    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);

  const handleDragStart = React.useCallback((globalIndex, e, d) => {
    setDragInfo({
      isDragging: true,
      index: globalIndex,
      x: d.x,
      tempHasOverlap: false,
    });
  }, []);

  const handleDrag = React.useCallback((globalIndex, e, d) => {
    const slot = gameSlots[globalIndex];
    if (!slot) return;
    const duration = timeToMinutes(slot.endTime) - timeToMinutes(slot.startTime);
    const exactStartMinutes = timelineStart + ((d.x - trackPadding) / responsiveScale);
    const tempStartMinutes = snapMinutes(exactStartMinutes, slotDurationMins);
    const tempEndMinutes = tempStartMinutes + duration;
    const tempHasOverlap = gameSlots.some(
      (s, i) =>
        i !== globalIndex &&
        s.day === slot.day &&
        s.ground === slot.ground &&
        timeToMinutes(s.startTime) < tempEndMinutes &&
        tempStartMinutes < timeToMinutes(s.endTime)
    );
    setDragInfo({
      isDragging: true,
      index: globalIndex,
      x: d.x,
      tempHasOverlap,
    });
  }, [gameSlots, responsiveScale, timelineStart, slotDurationMins]);

  const findNearestValidSlot = React.useCallback((startMinutes, duration, globalIndex, gameSlots) => {
    let testStart = snapMinutes(startMinutes, slotDurationMins);
    const testEnd = testStart + duration;
    if (!wouldOverlap(testStart, testEnd, globalIndex, gameSlots)) {
      return testStart;
    }
    // Try earlier and later slots
    for (let offset = slotDurationMins; offset <= timelineDuration; offset += slotDurationMins) {
      const earlierStart = snapMinutes(startMinutes - offset, slotDurationMins);
      const laterStart = snapMinutes(startMinutes + offset, slotDurationMins);
      if (earlierStart >= timelineStart && !wouldOverlap(earlierStart, earlierStart + duration, globalIndex, gameSlots)) {
        return earlierStart;
      }
      if (laterStart + duration <= timelineEnd && !wouldOverlap(laterStart, laterStart + duration, globalIndex, gameSlots)) {
        return laterStart;
      }
    }
    return null; // No valid position found
  }, [timelineStart, timelineEnd, slotDurationMins, gameSlots]);

  const handleDragStop = React.useCallback((globalIndex, e, d) => {
    const slot = gameSlots[globalIndex];
    if (!slot) {
      console.warn(`No slot found at index ${globalIndex}`);
      setDragInfo({ isDragging: false, index: null, x: 0, tempHasOverlap: false });
      return;
    }

    const duration = timeToMinutes(slot.endTime) - timeToMinutes(slot.startTime);
    const exactStartMinutes = timelineStart + ((d.x - trackPadding) / responsiveScale);
    let newStartMinutes = snapMinutes(exactStartMinutes, slotDurationMins);
    let newEndMinutes = newStartMinutes + duration;

    // Enforce timeline boundaries
    if (newStartMinutes < timelineStart) {
      newStartMinutes = timelineStart;
      newEndMinutes = newStartMinutes + duration;
    }
    if (newEndMinutes > timelineEnd) {
      newEndMinutes = timelineEnd;
      newStartMinutes = newEndMinutes - duration;
      newStartMinutes = snapMinutes(newStartMinutes, slotDurationMins);
    }

    // Ensure minimum duration
    if (newEndMinutes - newStartMinutes < slotDurationMins) {
      newEndMinutes = newStartMinutes + slotDurationMins;
      if (newEndMinutes > timelineEnd) {
        newEndMinutes = timelineEnd;
        newStartMinutes = newEndMinutes - slotDurationMins;
        newStartMinutes = snapMinutes(newStartMinutes, slotDurationMins);
      }
    }

    // Check for overlaps and find a valid position
    if (wouldOverlap(newStartMinutes, newEndMinutes, globalIndex, gameSlots)) {
      console.warn(`Overlap detected for slot ${globalIndex} at ${minutesToTime(newStartMinutes)}-${minutesToTime(newEndMinutes)}`);
      const validStart = findNearestValidSlot(newStartMinutes, duration, globalIndex, gameSlots);
      if (validStart !== null) {
        newStartMinutes = validStart;
        newEndMinutes = newStartMinutes + duration;
      } else {
        setDragInfo({ isDragging: false, index: null, x: 0, tempHasOverlap: true });
        setTimeout(() => setDragInfo((prev) => ({ ...prev, tempHasOverlap: false })), 1000);
        return;
      }
    }

    // Update the slot
    setDragInfo({ isDragging: false, index: null, x: 0, tempHasOverlap: false });
    updateGameSlotField(globalIndex, "startTime", minutesToTime(newStartMinutes));
    updateGameSlotField(globalIndex, "endTime", minutesToTime(newEndMinutes));
  }, [gameSlots, updateGameSlotField, timelineStart, timelineEnd, responsiveScale, slotDurationMins, findNearestValidSlot]);

  const handleResizeStop = React.useCallback((globalIndex, e, direction, ref, delta, newPos) => {
    const slot = gameSlots[globalIndex];
    if (!slot) return;
    const exactStartMinutes = timelineStart + ((newPos.x - trackPadding) / responsiveScale);
    const exactEndMinutes = exactStartMinutes + (ref.offsetWidth / responsiveScale);
    let newStartMinutes = snapMinutes(exactStartMinutes, slotDurationMins);
    let newEndMinutes = snapMinutes(exactEndMinutes, slotDurationMins);
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
      console.warn(`Overlap detected during resize for slot ${globalIndex}`);
      return;
    }
    console.log(newStartMinutes);
    console.log(newEndMinutes);
      updateGameSlotField(globalIndex, "startTime", minutesToTime(newStartMinutes));
      console.log(gameSlots);
      updateGameSlotField(globalIndex, "endTime", minutesToTime(newEndMinutes));
      console.log(gameSlots);
  }, [gameSlots, updateGameSlotField, timelineStart, timelineEnd, responsiveScale, slotDurationMins]);

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
            const x = (startMinutes - timelineStart) * responsiveScale + trackPadding;
            const width = (endMinutes - startMinutes) * responsiveScale;
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