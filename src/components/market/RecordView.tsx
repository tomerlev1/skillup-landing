"use client";

import { useEffect } from "react";
import { recordView } from "@/lib/recently-viewed";

interface RecordViewProps {
  teacher: {
    id: string;
    display_name: string;
    image: string | null;
    subject: string | null;
    city_name: string | null;
    hourly_rate: number | null;
    rating_avg: number;
    review_count: number;
  };
}

// Invisible: stores a card snapshot in localStorage so the homepage
// "recently viewed" rail can render with zero backend calls.
export default function RecordView({ teacher }: RecordViewProps) {
  useEffect(() => {
    recordView(teacher);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teacher.id]);

  return null;
}
