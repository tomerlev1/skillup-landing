import type { AvailabilitySlot, LessonMode } from "@/lib/types";

/** Booking wizard URL; an optional slot id preselects that time. */
export function bookHref(teacherId: string, slotId?: string): string {
  const base = `/tutors/${teacherId}/book`;
  return slotId ? `${base}?slot=${encodeURIComponent(slotId)}` : base;
}

/**
 * The `?slot=` the user arrived with. `stale` means they asked for a time
 * that is no longer an open, future slot (taken or past since they clicked).
 */
export function resolvePreselectedSlot(
  slots: AvailabilitySlot[],
  slotId: string | undefined,
  now: Date = new Date(),
): { slot: AvailabilitySlot | null; stale: boolean } {
  if (!slotId) return { slot: null, stale: false };
  const slot = slots.find(
    (s) => s.id === slotId && !s.is_booked && new Date(s.start_at).getTime() > now.getTime(),
  );
  return slot ? { slot, stale: false } : { slot: null, stale: true };
}

/** Wizard submit button: one request, or N separate requests. */
export function submitLabel(teacherName: string, count: number): string {
  return count > 1
    ? `שליחת ${count} בקשות ל${teacherName}`
    : `שליחת בקשה ל${teacherName}`;
}

/** A slot with no allowed_modes restriction fits every mode. */
export function slotFitsMode(
  slot: Pick<AvailabilitySlot, "allowed_modes">,
  mode: LessonMode | null,
): boolean {
  if (!mode) return true;
  if (!slot.allowed_modes || slot.allowed_modes.length === 0) return true;
  return slot.allowed_modes.includes(mode);
}
