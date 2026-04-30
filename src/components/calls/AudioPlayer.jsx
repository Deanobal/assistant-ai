import React, { useRef, useState, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';

export default function AudioPlayer({ src, duration }) {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const [muted, setMuted] = useState(false);
  const [loading, setLoading] = useState(false);

  const hasAudio = !!src;

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onLoaded = () => setTotalDuration(audio.duration);
    const onEnded = () => { setPlaying(false); setCurrentTime(0); };
    const onWaiting = () => setLoading(true);
    const onCanPlay = () => setLoading(false);

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoaded);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('waiting', onWaiting);
    audio.addEventListener('canplay', onCanPlay);

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoaded);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('waiting', onWaiting);
      audio.removeEventListener('canplay', onCanPlay);
    };
  }, [src]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio || !hasAudio) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      audio.play();
      setPlaying(true);
    }
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.muted = !muted;
    setMuted(!muted);
  };

  const handleSeek = (e) => {
    const audio = audioRef.current;
    if (!audio || !totalDuration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    audio.currentTime = ratio * totalDuration;
  };

  const fmt = (s) => {
    if (!s || isNaN(s)) return duration || '0:00';
    return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
  };

  const progress = totalDuration > 0 ? (currentTime / totalDuration) * 100 : 0;

  return (
    <div className="flex items-center gap-3 p-4 rounded-lg bg-[#0a0a0f] border border-white/5">
      {src && <audio ref={audioRef} src={src} preload="metadata" />}

      <button
        onClick={togglePlay}
        disabled={!hasAudio}
        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all flex-shrink-0
          ${hasAudio
            ? 'bg-gradient-to-r from-cyan-500 to-blue-500 hover:shadow-lg hover:shadow-cyan-500/25'
            : 'bg-white/5 cursor-not-allowed opacity-40'}`}
      >
        {loading ? (
          <span className="w-3 h-3 border-2 border-white/50 border-t-white rounded-full animate-spin" />
        ) : playing ? (
          <Pause className="w-4 h-4 text-white" />
        ) : (
          <Play className="w-4 h-4 text-white ml-0.5" />
        )}
      </button>

      {/* Seek bar */}
      <div
        className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden cursor-pointer group"
        onClick={hasAudio ? handleSeek : undefined}
      >
        <div
          className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-100"
          style={{ width: `${progress}%` }}
        />
      </div>

      <span className="text-gray-500 text-xs w-20 text-right flex-shrink-0">
        {hasAudio && totalDuration > 0 ? `${fmt(currentTime)} / ${fmt(totalDuration)}` : fmt(null)}
      </span>

      <button
        onClick={toggleMute}
        disabled={!hasAudio}
        className={`text-gray-400 hover:text-white transition-colors ${!hasAudio ? 'opacity-30 cursor-not-allowed' : ''}`}
      >
        {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
      </button>

      {!hasAudio && (
        <span className="text-xs text-gray-600 ml-1 whitespace-nowrap">No recording</span>
      )}
    </div>
  );
}