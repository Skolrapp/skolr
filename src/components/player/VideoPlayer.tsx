'use client';
import { useEffect, useRef, useState, useCallback } from 'react';
import Hls from 'hls.js';

interface Props {
  hlsUrl: string;
  posterUrl?: string;
  title?: string;
  startAt?: number;
  onProgress?: (seconds: number) => void;
  previewSeconds?: number;
  onPreviewLimit?: () => void;
}

type Quality = 'excellent' | 'good' | 'fair' | 'poor';
const Q_COLORS: Record<Quality, string> = { excellent: '#34d399', good: '#10B981', fair: '#fbbf24', poor: '#ef4444' };
function bwToQ(bps: number): Quality {
  if (bps > 2_000_000) return 'excellent';
  if (bps > 800_000)   return 'good';
  if (bps > 300_000)   return 'fair';
  return 'poor';
}

export default function VideoPlayer({ hlsUrl, posterUrl, title, startAt = 0, onProgress, previewSeconds = 0, onPreviewLimit }: Props) {
  const vRef     = useRef<HTMLVideoElement>(null);
  const hlsRef   = useRef<Hls | null>(null);
  const progRef  = useRef<ReturnType<typeof setInterval> | null>(null);
  const ctrlRef  = useRef<ReturnType<typeof setTimeout> | null>(null);
  const previewTriggeredRef = useRef(false);

  const [ready,    setReady]    = useState(false);
  const [playing,  setPlaying]  = useState(false);
  const [muted,    setMuted]    = useState(false);
  const [buffering,setBuffering]= useState(false);
  const [showCtrl, setShowCtrl] = useState(true);
  const [error,    setError]    = useState<string | null>(null);
  const [levels,   setLevels]   = useState<Array<{ index: number; label: string }>>([]);
  const [curLevel, setCurLevel] = useState(-1);
  const [showQ,    setShowQ]    = useState(false);
  const [bw,       setBw]       = useState(0);
  const [quality,  setQuality]  = useState<Quality>('good');

  const activity = useCallback(() => {
    setShowCtrl(true);
    if (ctrlRef.current) clearTimeout(ctrlRef.current);
    ctrlRef.current = setTimeout(() => setShowCtrl(false), 3200);
  }, []);

  useEffect(() => {
    const video = vRef.current;
    if (!video) return;
    if (Hls.isSupported()) {
      const hls = new Hls({ enableWorker: true, startLevel: -1, maxBufferLength: 30, abrBandWidthFactor: 0.95, fragLoadingMaxRetry: 6 });
      hls.loadSource(hlsUrl);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, (_, d) => {
        setLevels(d.levels.map((l, i) => ({ index: i, label: l.height ? `${l.height}p` : `${Math.round(l.bitrate/1000)}k` })));
        setReady(true);
        if (startAt > 0) video.currentTime = startAt;
      });
      hls.on(Hls.Events.LEVEL_SWITCHED, (_, d) => setCurLevel(d.level));
      hls.on(Hls.Events.FRAG_LOADED, () => { const b = hls.bandwidthEstimate; setBw(b); setQuality(bwToQ(b)); });
      hls.on(Hls.Events.ERROR, (_, d) => {
        if (d.fatal) {
          if (d.type === Hls.ErrorTypes.NETWORK_ERROR) hls.startLoad();
          else if (d.type === Hls.ErrorTypes.MEDIA_ERROR) hls.recoverMediaError();
          else { setError('Video failed to load.'); hls.destroy(); }
        }
      });
      hlsRef.current = hls;
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = hlsUrl;
      video.addEventListener('loadedmetadata', () => { setReady(true); if (startAt > 0) video.currentTime = startAt; });
    } else {
      setError('Your browser does not support video playback.');
    }

    progRef.current = setInterval(() => { if (!video.paused && onProgress) onProgress(Math.floor(video.currentTime)); }, 5000);
    return () => { hlsRef.current?.destroy(); if (progRef.current) clearInterval(progRef.current); };
  }, [hlsUrl, startAt, onProgress]);

  useEffect(() => {
    previewTriggeredRef.current = false;
  }, [hlsUrl, previewSeconds]);

  useEffect(() => {
    const video = vRef.current;
    if (!video || !previewSeconds) return;

    const handleTimeUpdate = () => {
      if (previewTriggeredRef.current || video.currentTime < previewSeconds) return;
      previewTriggeredRef.current = true;
      video.pause();
      setPlaying(false);
      onPreviewLimit?.();
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    return () => video.removeEventListener('timeupdate', handleTimeUpdate);
  }, [previewSeconds, onPreviewLimit]);

  const togglePlay = () => {
    const v = vRef.current;
    if (!v) return;
    if (v.paused) { v.play(); setPlaying(true); } else { v.pause(); setPlaying(false); }
    activity();
  };

  const setLevel = (l: number) => { if (hlsRef.current) hlsRef.current.currentLevel = l; setCurLevel(l); setShowQ(false); };
  const qlabel   = curLevel === -1 ? 'Auto' : (levels[curLevel]?.label ?? 'Auto');
  const bwKbps   = Math.round(bw / 1000);

  if (error) return (
    <div className="aspect-video bg-black rounded-2xl flex items-center justify-center">
      <div className="text-center px-6">
        <p className="text-white text-sm mb-4">{error}</p>
        <button className="btn-primary w-auto px-6" onClick={() => window.location.reload()}>Retry</button>
      </div>
    </div>
  );

  return (
    <div className="relative bg-black rounded-2xl overflow-hidden aspect-video select-none"
      onClick={togglePlay} onMouseMove={activity} onTouchStart={activity}>
      <video ref={vRef} className="w-full h-full object-contain" poster={posterUrl} playsInline muted={muted}
        onWaiting={() => setBuffering(true)}
        onPlaying={() => { setBuffering(false); setPlaying(true); }}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)} />

      {buffering && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 pointer-events-none">
          <div className="w-10 h-10 rounded-full border-4 border-white/20 border-t-white animate-spin" />
        </div>
      )}

      {!playing && ready && !buffering && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: '#10B981' }}>
            <svg className="w-6 h-6 text-black ml-1" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
          </div>
        </div>
      )}

      {showCtrl && (
        <>
          <div className="absolute top-0 left-0 right-0 p-3 bg-gradient-to-b from-black/60 to-transparent pointer-events-none">
            <div className="flex items-center justify-between">
              {title && <p className="text-white text-xs font-medium truncate max-w-[70%]">{title}</p>}
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-bold" style={{ background: Q_COLORS[quality] + '25', color: Q_COLORS[quality] }}>
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: Q_COLORS[quality] }} />
                {quality} {bwKbps > 0 && `· ${bwKbps}k`}
              </div>
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/70 to-transparent" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3">
              <button className="text-white !min-h-0 !min-w-0 p-1" onClick={togglePlay}>
                {playing
                  ? <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>
                  : <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>}
              </button>
              <button className="text-white !min-h-0 !min-w-0 p-1" onClick={() => { setMuted(m => !m); if (vRef.current) vRef.current.muted = !muted; }}>
                {muted
                  ? <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 5L6 9H2v6h4l5 4V5z"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>
                  : <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 010 14.14M15.54 8.46a5 5 0 010 7.07"/></svg>}
              </button>
              <div className="flex-1" />
              <div className="relative">
                <button className="text-white text-xs bg-white/20 rounded px-2 py-0.5 !min-h-0 !min-w-0 font-mono" onClick={() => setShowQ(q => !q)}>{qlabel}</button>
                {showQ && (
                  <div className="absolute bottom-8 right-0 rounded-xl overflow-hidden min-w-[90px] z-10" style={{ background: '#0a0a0a', border: '1px solid #2a2a2a' }}>
                    <button className={`w-full text-left px-3 py-2 text-xs text-white hover:bg-white/10 ${curLevel === -1 ? 'font-bold' : ''}`} style={curLevel === -1 ? { color: '#10B981' } : {}} onClick={() => setLevel(-1)}>Auto (ABR)</button>
                    {[...levels].reverse().map(l => (
                      <button key={l.index} className={`w-full text-left px-3 py-2 text-xs text-white hover:bg-white/10 ${curLevel === l.index ? 'font-bold' : ''}`} style={curLevel === l.index ? { color: '#10B981' } : {}} onClick={() => setLevel(l.index)}>{l.label}</button>
                    ))}
                  </div>
                )}
              </div>
              <button className="text-white !min-h-0 !min-w-0 p-1" onClick={() => { const el = vRef.current?.closest('.relative') as HTMLElement; el?.requestFullscreen?.(); }}>
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
