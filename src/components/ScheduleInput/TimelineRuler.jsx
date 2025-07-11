import React from "react";
import "./Timeline.css";

const TimelineRuler = ({ timelineStart, timelineDuration, responsiveScale }) => (
  <div className="timeline-ruler">
    {Array.from({ length: timelineDuration / 60 + 1 }, (_, i) => {
      const mins = timelineStart + i * 60;
      const h = Math.floor(mins / 60) % 24;
      const label = `${h.toString().padStart(2, "0")}:00`;
      return (
        <div
          key={i}
          className="timeline-ruler-hour-mark"
          style={{ width: `${60 * responsiveScale}px` }}
        >
          <div className="timeline-ruler-line"></div>
          <span className="timeline-ruler-label">{label}</span>
        </div>
      );
    })}
  </div>
);

export default TimelineRuler;
