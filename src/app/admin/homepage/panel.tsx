"use client";

import { useEffect, useRef, useState } from "react";

export function HomepagePanel() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [progressPct, setProgressPct] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const xhrRef = useRef<XMLHttpRequest | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch("/api/admin/homepage/video");
        const j = await r.json();
        if (j.ok) setUrl(j.url || "");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const saveUrl = async (next: string) => {
    setError(null);
    setUrl(next);
    const r = await fetch("/api/admin/homepage/video", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: next }),
    });
    const j = await r.json();
    if (!j.ok) {
      setError(j.error || "Save failed");
      return false;
    }
    setSavedAt(new Date().toLocaleTimeString());
    return true;
  };

  const uploadFile = async (file: File) => {
    setError(null);
    setUploading(true);
    setProgressPct(0);

    // XHR for upload progress (fetch doesn't expose it natively).
    const form = new FormData();
    form.append("file", file);

    await new Promise<void>((resolve) => {
      const xhr = new XMLHttpRequest();
      xhrRef.current = xhr;
      xhr.open("POST", "/api/admin/homepage/upload-video");
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          setProgressPct(Math.round((e.loaded / e.total) * 100));
        }
      };
      xhr.onload = async () => {
        try {
          const j = JSON.parse(xhr.responseText);
          if (j.ok) {
            await saveUrl(j.url);
          } else {
            setError(j.error || `Upload failed (${xhr.status})`);
          }
        } catch {
          setError(`Upload failed (${xhr.status})`);
        }
        resolve();
      };
      xhr.onerror = () => {
        setError("Network error");
        resolve();
      };
      xhr.send(form);
    });

    setUploading(false);
    setProgressPct(null);
    xhrRef.current = null;
  };

  const clearVideo = async () => {
    await saveUrl("");
  };

  return (
    <div className="bg-white border border-neutral-200 rounded-sm p-5 space-y-5">
      <div className="grid md:grid-cols-2 gap-6">
        {/* Drop / pick zone */}
        <div className="space-y-3">
          <label
            className={`block border-2 border-dashed cursor-pointer transition-colors ${
              uploading
                ? "border-neutral-300 bg-neutral-50"
                : "border-neutral-300 hover:border-black bg-white"
            } p-6 text-center`}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const f = e.dataTransfer.files?.[0];
              if (f) uploadFile(f);
            }}
          >
            <input
              type="file"
              accept="video/mp4,video/webm,video/quicktime,video/x-m4v"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) uploadFile(f);
                e.target.value = "";
              }}
            />
            <p className="text-[10px] font-bold uppercase tracking-[0.3em]">
              {uploading
                ? `Uploading… ${progressPct ?? 0}%`
                : url
                ? "Replace video"
                : "Click or drop to upload"}
            </p>
            <p className="text-[9px] uppercase tracking-[0.25em] opacity-50 mt-1">
              MP4 · WebM · MOV · max 50 MB
            </p>
            {uploading && (
              <div className="mt-3 h-1 w-full bg-neutral-200 overflow-hidden">
                <div
                  className="h-full bg-black transition-all"
                  style={{ width: `${progressPct ?? 0}%` }}
                />
              </div>
            )}
          </label>

          <details className="text-[10px]">
            <summary className="cursor-pointer text-[9px] uppercase tracking-[0.3em] opacity-50 hover:opacity-100">
              Or paste a URL instead
            </summary>
            <div className="mt-2 flex gap-2">
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://…"
                className="flex-1 h-[36px] border border-neutral-200 px-3 text-[12px] outline-none focus:border-black transition-colors"
              />
              <button
                onClick={() => saveUrl(url)}
                className="px-3 h-[36px] border border-neutral-300 text-[10px] uppercase tracking-[0.3em] hover:bg-black hover:text-white transition-colors"
              >
                Save
              </button>
            </div>
          </details>

          {error && (
            <p className="text-[10px] text-red-600 uppercase tracking-[0.2em]">
              {error}
            </p>
          )}
          {savedAt && !error && (
            <p className="text-[10px] uppercase tracking-[0.3em] text-neutral-500">
              Saved {savedAt}
            </p>
          )}
        </div>

        {/* Live preview */}
        <div className="space-y-2">
          <p className="text-[9px] font-bold uppercase tracking-[0.4em] opacity-60">
            Preview
          </p>
          {loading ? (
            <p className="text-[10px] uppercase tracking-[0.3em] opacity-40">
              Loading…
            </p>
          ) : url ? (
            <div className="border border-neutral-200 bg-neutral-50 p-2 space-y-2">
              <video
                key={url}
                src={url}
                autoPlay
                muted
                loop
                playsInline
                controls
                className="w-full max-h-80 object-contain bg-black"
              />
              <div className="flex items-center justify-between">
                <a
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[9px] uppercase tracking-[0.3em] text-neutral-500 hover:text-black truncate max-w-[60%]"
                  title={url}
                >
                  {url.replace(/^https?:\/\//, "").slice(0, 60)}…
                </a>
                <button
                  onClick={clearVideo}
                  className="text-[9px] uppercase tracking-[0.3em] opacity-50 hover:opacity-100 hover:text-red-600 transition-colors"
                >
                  Remove
                </button>
              </div>
            </div>
          ) : (
            <p className="text-[10px] uppercase tracking-[0.3em] opacity-40">
              No video uploaded yet.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
