"use client";

import { useAuth } from "@/components/auth/AuthProvider";

// Renders children only for logged-out visitors (registration CTAs etc.);
// logged-in users see the fallback instead. Renders nothing while the
// session resolves, so there is no flash of the wrong state.
export default function GuestOnly({
  children,
  fallback = null,
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  if (loading) return null;
  return <>{user ? fallback : children}</>;
}
