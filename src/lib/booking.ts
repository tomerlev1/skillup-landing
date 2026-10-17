/** Booking wizard URL; an optional slot id preselects that time. */
export function bookHref(teacherId: string, slotId?: string): string {
  const base = `/tutors/${teacherId}/book`;
  return slotId ? `${base}?slot=${encodeURIComponent(slotId)}` : base;
}
