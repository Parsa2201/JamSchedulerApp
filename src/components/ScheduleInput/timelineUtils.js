import { timeToMinutes } from "../../utils/scheduleUtils";

export const snapMinutes = (minutes, slotDurationMins) => Math.round(minutes / slotDurationMins) * slotDurationMins;

export const wouldOverlap = (potentialStartMinutes, potentialEndMinutes, currentSlotGlobalIndex, gameSlots) => {
  const currentSlot = gameSlots[currentSlotGlobalIndex];
  if (!currentSlot) return false;
  return gameSlots.some((s, i) => {
    if (i === currentSlotGlobalIndex || s.day !== currentSlot.day || s.ground !== currentSlot.ground) {
      return false;
    }
    const existingSlotStartMinutes = timeToMinutes(s.startTime);
    const existingSlotEndMinutes = timeToMinutes(s.endTime);
    return (
      potentialStartMinutes < existingSlotEndMinutes &&
      existingSlotStartMinutes < potentialEndMinutes
    );
  });
};
