import React from "react";
import { Rnd } from "react-rnd";
import GameSlot from "./GameSlot";
import "./Timeline.css";

const TimelineItem = ({
  slot,
  globalIndex,
  startMinutes,
  endMinutes,
  x,
  width,
  isBeingDragged,
  dragInfo,
  hasOverlap,
  responsiveScale,
  slotDurationMins,
  handleDragStart,
  handleDrag,
  handleDragStop,
  handleResizeStop,
  updateParticipant,
  updateType,
  removeGameSlot,
  teams,
  players,
  selectedSport,
}) => {
  const positionX = isBeingDragged ? dragInfo.x : x;
  const effectiveHasOverlap = isBeingDragged ? dragInfo.tempHasOverlap : hasOverlap;

  return (
    <Rnd
      key={globalIndex}
      size={{ width: width, height: 80 }}
      position={{ x: positionX, y: 30 }}
      onDragStart={(e, d) => handleDragStart(globalIndex, e, d)}
      onDrag={(e, d) => handleDrag(globalIndex, e, d)}
      onDragStop={(e, d) => handleDragStop(globalIndex, e, d)}
      onResizeStop={(e, direction, ref, delta, newPos) => handleResizeStop(globalIndex, e, direction, ref, delta, newPos)}
      bounds="parent"
      enableResizing={{ left: true, right: true, top: false, bottom: false, topLeft: false, topRight: false, bottomLeft: false, bottomRight: false }}
      dragAxis="x"
      dragGrid={[responsiveScale * slotDurationMins, 1]}
      resizeGrid={[responsiveScale * slotDurationMins, 1]}
      minWidth={responsiveScale * slotDurationMins}
      cancel=".non-draggable-content"
    >
      <div
        className={`timeline-item${effectiveHasOverlap ? ' overlap' : ''}`}
        style={{
          boxShadow: effectiveHasOverlap ? '0 0 0 3px #ef4444' : '0 2px 6px rgba(0,0,0,0.1)',
          border: effectiveHasOverlap ? '2px solid #ef4444' : 'none',
        }}
        title={effectiveHasOverlap ? 'Conflict: Overlapping slot!' : 'Game slot'}
      >
        <div className="timeline-item-time">{slot.startTime} - {slot.endTime}</div>
        <div className="timeline-item-sport">{selectedSport}</div>
        <div className="non-draggable-content">
          <GameSlot
            slot={slot}
            globalIndex={globalIndex}
            updateParticipant={updateParticipant}
            updateType={updateType}
            removeGameSlot={removeGameSlot}
            teams={teams}
            players={players}
            selectedSport={selectedSport}
          />
        </div>
        {effectiveHasOverlap && (
          <span className="timeline-item-conflict-indicator">
            Conflict!
          </span>
        )}
      </div>
    </Rnd>
  );
};

export default React.memo(TimelineItem);