"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, Loader2, Trash2 } from "lucide-react";
import Avatar from "@/components/ui/Avatar";
import { createClient } from "@/lib/supabase/client";

interface AvatarUploaderProps {
  userId: string;
  table: "students" | "teachers";
  name: string;
  initialUrl: string | null;
}

const MAX_BYTES = 8 * 1024 * 1024;
const OUT = 512;

/** Center-crop to a square and re-encode as a 512px JPEG (smaller, faster). */
async function toSquareJpeg(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const side = Math.min(bitmap.width, bitmap.height);
  const sx = (bitmap.width - side) / 2;
  const sy = (bitmap.height - side) / 2;
  const canvas = document.createElement("canvas");
  canvas.width = OUT;
  canvas.height = OUT;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas");
  ctx.drawImage(bitmap, sx, sy, side, side, 0, 0, OUT, OUT);
  return await new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("encode"))), "image/jpeg", 0.88),
  );
}

// Profile photo with add / replace / remove. Uploads to the public `avatars`
// bucket under the user's own folder (storage policy: first folder = uid),
// then saves the public URL on the user's own row.
export default function AvatarUploader({ userId, table, name, initialUrl }: AvatarUploaderProps) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const inputRef = useRef<HTMLInputElement>(null);
  const [url, setUrl] = useState<string | null>(initialUrl);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setError(null);
    if (!file.type.startsWith("image/")) return setError("אפשר להעלות רק קובץ תמונה.");
    if (file.size > MAX_BYTES) return setError("התמונה גדולה מדי. עד 8MB.");

    setBusy(true);
    try {
      const blob = await toSquareJpeg(file);
      const path = `${userId}/avatar-${Date.now()}.jpg`;
      const { error: upErr } = await supabase.storage
        .from("avatars")
        .upload(path, blob, { contentType: "image/jpeg", upsert: true });
      if (upErr) throw upErr;
      const publicUrl = supabase.storage.from("avatars").getPublicUrl(path).data.publicUrl;
      const { error: dbErr } = await supabase.from(table).update({ avatar_url: publicUrl }).eq("id", userId);
      if (dbErr) throw dbErr;
      setUrl(publicUrl);
      router.refresh();
    } catch {
      setError("העלאת התמונה נכשלה. נסו שוב.");
    } finally {
      setBusy(false);
    }
  }

  async function onRemove() {
    setBusy(true);
    setError(null);
    const { error: dbErr } = await supabase.from(table).update({ avatar_url: null }).eq("id", userId);
    setBusy(false);
    if (dbErr) return setError("ההסרה נכשלה. נסו שוב.");
    setUrl(null);
    router.refresh();
  }

  return (
    <div className="flex flex-col items-center text-center">
      <div className="group relative">
        <span className="block rounded-full p-1 ring-2 ring-brand-200 ring-offset-4 ring-offset-surface">
          <Avatar src={url} name={name} size={112} />
        </span>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          aria-label={url ? "החלפת תמונת פרופיל" : "הוספת תמונת פרופיל"}
          className="absolute -bottom-1 end-0 grid size-10 cursor-pointer place-items-center rounded-full bg-action text-on-action shadow-[0_8px_18px_-8px_rgba(79,70,229,0.9)] ring-4 ring-surface transition-transform hover:scale-105 disabled:opacity-60"
        >
          {busy ? <Loader2 size={18} className="animate-spin" /> : <Camera size={18} strokeWidth={2} />}
        </button>
        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={onPick} />
      </div>
      <div className="mt-4 flex flex-wrap justify-center gap-2">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className="inline-flex min-h-9 cursor-pointer items-center rounded-pill bg-tint-indigo px-3.5 text-sm font-bold text-tint-indigo-fg transition-colors hover:bg-brand-100 disabled:opacity-60"
        >
          {url ? "החלפת תמונה" : "הוספת תמונה"}
        </button>
        {url && (
          <button
            type="button"
            onClick={onRemove}
            disabled={busy}
            className="inline-flex min-h-9 cursor-pointer items-center gap-1.5 rounded-pill px-3 text-sm font-semibold text-ink-3 transition-colors hover:bg-canvas hover:text-danger-text disabled:opacity-60"
          >
            <Trash2 size={15} strokeWidth={2} aria-hidden="true" />
            הסרה
          </button>
        )}
      </div>
      {error && (
        <p role="alert" className="mt-2 text-sm text-danger-text">
          {error}
        </p>
      )}
    </div>
  );
}
