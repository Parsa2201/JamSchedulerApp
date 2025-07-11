export const incrementTime = (time) => {
  const [hours, minutes] = time.split(":").map(Number);
  const newMinutes = minutes + 60;
  const newHours = hours + Math.floor(newMinutes / 60);
  return `${String(newHours % 24).padStart(2, "0")}:${String(newMinutes % 60).padStart(2, "0")}`;
};

export const hasTimeOverlap = (slot, index, gameSlots) => {
  return gameSlots.some(
    (s, i) =>
      i !== index &&
      s.day === slot.day &&
      s.ground === slot.ground &&
      s.startTime < slot.endTime &&
      slot.startTime < s.endTime
  );
};

export const timeToMinutes = (time) => {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

export const minutesToTime = (minutes) => {
  const hours = Math.floor(minutes / 60) % 24;
  const mins = minutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
};