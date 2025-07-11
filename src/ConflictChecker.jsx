import { useContext } from "react";
import { ScheduleContext } from "./contexts/ScheduleContext";

const sportTypes = {
  Football: "team",
  Basketball: "team",
  Volleyball: "team",
  Chess: "individual",
  "Ping-Pong": "mixed",
  Badminton: "mixed",
};

const ConflictChecker = () => {
  const { schedules, teams, players } = useContext(ScheduleContext);

  // Combine all schedules into one array
  const allGameSlots = Object.entries(schedules).flatMap(([sport, slots]) =>
    slots.map((slot) => ({ ...slot, sport }))
  );

  // Get players involved in a game slot
  const getPlayersFromSlot = (slot) => {
    const { sport, participants, type } = slot;
    const sportType = sportTypes[sport];

    if (sportType === "team") {
      const teamA = teams.find((t) => t.id === participants.sideA);
      const teamB = teams.find((t) => t.id === participants.sideB);
      return [...(teamA ? teamA.players : []), ...(teamB ? teamB.players : [])];
    } else if (sportType === "individual") {
      return [participants.sideA, participants.sideB].filter(Boolean);
    } else if (sportType === "mixed") {
      if (type === "singles") {
        return [participants.sideA, participants.sideB].filter(Boolean);
      } else if (type === "doubles") {
        return [
          ...(participants.sideA || []),
          ...(participants.sideB || []),
        ].filter(Boolean);
      }
    }
    return [];
  };

  // Group slots by day
  const slotsByDay = allGameSlots.reduce((acc, slot) => {
    const day = slot.day;
    if (!acc[day]) acc[day] = [];
    acc[day].push(slot);
    return acc;
  }, {});

  // Check if two time slots overlap
  const doSlotsOverlap = (slotA, slotB) => {
    const startA = timeToMinutes(slotA.startTime);
    const endA = timeToMinutes(slotA.endTime);
    const startB = timeToMinutes(slotB.startTime);
    const endB = timeToMinutes(slotB.endTime);
    return startA < endB && startB < endA;
  };

  // Convert time string to minutes
  const timeToMinutes = (time) => {
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
  };

  // Detect conflicts
  const conflicts = [];
  Object.entries(slotsByDay).forEach(([day, slots]) => {
    const playerSlots = {};
    slots.forEach((slot) => {
      const playersInSlot = getPlayersFromSlot(slot);
      playersInSlot.forEach((playerId) => {
        if (!playerSlots[playerId]) playerSlots[playerId] = [];
        playerSlots[playerId].push(slot);
      });
    });

    Object.entries(playerSlots).forEach(([playerId, playerSlots]) => {
      for (let i = 0; i < playerSlots.length; i++) {
        for (let j = i + 1; j < playerSlots.length; j++) {
          if (doSlotsOverlap(playerSlots[i], playerSlots[j])) {
            conflicts.push({
              playerId,
              day,
              slotA: playerSlots[i],
              slotB: playerSlots[j],
            });
          }
        }
      }
    });
  });

  // Display conflicts
  return (
    <div>
      <h2>Schedule Conflicts</h2>
      {conflicts.length === 0 ? (
        <p>No conflicts found.</p>
      ) : (
        <ul>
          {conflicts.map((conflict, index) => {
            const player = players.find((p) => p.id === conflict.playerId);
            return (
              <li key={index}>
                Player {player.name} has overlapping games on Day {conflict.day}:
                <ul>
                  <li>
                    {conflict.slotA.sport} on Ground {conflict.slotA.ground} from {conflict.slotA.startTime} to {conflict.slotA.endTime}
                  </li>
                  <li>
                    {conflict.slotB.sport} on Ground {conflict.slotB.ground} from {conflict.slotB.startTime} to {conflict.slotB.endTime}
                  </li>
                </ul>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default ConflictChecker;