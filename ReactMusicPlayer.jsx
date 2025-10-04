import React, { useEffect, useRef, useState } from "react";
const initialPlaylist = [
  {
    id: 1,
    title: "Sample Track 1",
    artist: "Artist A",
    src: "/audio/sample1.mp3", // put files in public/audio/ or use absolute URLs
    cover: "https://via.placeholder.com/120?text=Cover+1",
  },
  {
    id: 2,
    title: "Sample Track 2",
    artist: "Artist B",
    src: "/audio/sample2.mp3",
    cover: "https://via.placeholder.com/120?text=Cover+2",
  },

];

export default function ReactMusicPlayer({ playlist = initialPlaylist }) {
  const audioRef = useRef(null);
  const [tracks, setTracks] = useState(playlist);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0); // 0 - duration
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [shuffle, setShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState("none"); // none | one | all
  const [query, setQuery] = useState("");

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => setProgress(audio.currentTime);
    const onLoaded = () => setDuration(audio.duration || 0);
    const onEnded = () => handleTrackEnd();

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("loadedmetadata", onLoaded);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("loadedmetadata", onLoaded);
      audio.removeEventListener("ended", onEnded);
    };
  }, [currentIndex, repeatMode, shuffle]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = volume;
  }, [volume]);

  useEffect(() => {
    if (isPlaying) audioRef.current.play().catch((e) => console.warn(e));
    else audioRef.current.pause();
  }, [isPlaying, currentIndex]);

  const playPause = () => setIsPlaying((p) => !p);

  const seekTo = (seconds) => {
    audioRef.current.currentTime = seconds;
    setProgress(seconds);
  };

  const prev = () => {
    if (audioRef.current.currentTime > 3) {
      seekTo(0);
      return;
    }
    setCurrentIndex((i) => (i - 1 + tracks.length) % tracks.length);
    setIsPlaying(true);
  };

  const next = () => {
    if (shuffle) {
      const idx = Math.floor(Math.random() * tracks.length);
      setCurrentIndex(idx);
    } else {
      setCurrentIndex((i) => (i + 1) % tracks.length);
    }
    setIsPlaying(true);
  };

  const handleTrackEnd = () => {
    if (repeatMode === "one") {
      seekTo(0);
      setIsPlaying(true);
      return;
    }
    if (repeatMode === "all") {
      next();
      return;
    }
    // none
    if (currentIndex < tracks.length - 1) next();
    else setIsPlaying(false);
  };

  const toggleShuffle = () => setShuffle((s) => !s);
  const toggleRepeat = () => {
    setRepeatMode((r) => (r === "none" ? "all" : r === "all" ? "one" : "none"));
  };

  const addLocalFiles = (files) => {
    const newTracks = Array.from(files).map((file, i) => ({
      id: Date.now() + i,
      title: file.name,
      artist: "Local",
      src: URL.createObjectURL(file),
      cover: "E:\Bhajans\Ganesh Chaturthi\Ganpati Bappa Morya\Ganpati Bappa Morya.jpg",
    }));
    setTracks((t) => [...t, ...newTracks]);
  };

  const removeTrack = (id) => {
    setTracks((t) => t.filter((x) => x.id !== id));
    if (tracks[currentIndex]?.id === id) {
      setIsPlaying(false);
      setCurrentIndex(0);
    }
  };

  const filtered = tracks.filter((t) =>
    (t.title + " " + t.artist).toLowerCase().includes(query.toLowerCase())
  );

  const humanTime = (sec = 0) => {
    if (isNaN(sec)) return "0:00";
    const s = Math.floor(sec % 60).toString().padStart(2, "0");
    const m = Math.floor(sec / 60);
    return `${m}:${s}`;
  };

  useEffect(() => {
    const onKey = (e) => {
      if (e.code === "Space") {
        e.preventDefault();
        playPause();
      } else if (e.code === "ArrowRight") {
        seekTo(Math.min(progress + 5, duration));
      } else if (e.code === "ArrowLeft") {
        seekTo(Math.max(progress - 5, 0));
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [progress, duration]);

  return (
    <div className="max-w-3xl mx-auto p-4 bg-white/80 backdrop-blur rounded-2xl shadow-lg">
      <div className="flex gap-4">
        <img
          src={tracks[currentIndex]?.cover}
          alt="cover"
          className="w-28 h-28 object-cover rounded-lg"
        />
        <div className="flex-1">
          <h3 className="text-lg font-semibold">
            {tracks[currentIndex]?.title || "No track"}
          </h3>
          <p className="text-sm text-gray-600">{tracks[currentIndex]?.artist}</p>

          <div className="mt-4">
            <input
              type="range"
              min={0}
              max={duration || 0}
              value={progress}
              onChange={(e) => seekTo(Number(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-600 mt-1">
              <span>{humanTime(progress)}</span>
              <span>{humanTime(duration)}</span>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-3">
            <button onClick={prev} className="p-2 rounded-full hover:bg-gray-100">
              ⏮
            </button>
            <button
              onClick={playPause}
              className="px-4 py-2 rounded-full border"
            >
              {isPlaying ? "⏸ Pause" : "▶ Play"}
            </button>
            <button onClick={next} className="p-2 rounded-full hover:bg-gray-100">
              ⏭
            </button>

            <div className="ml-4 flex items-center gap-2">
              <button onClick={toggleShuffle} className="p-2 rounded-md">
                {shuffle ? "🔀 On" : "🔀"}
              </button>
              <button onClick={toggleRepeat} className="p-2 rounded-md">
                {repeatMode === "none" ? "🔁" : repeatMode === "all" ? "🔁 All" : "🔂 One"}
              </button>
            </div>

            <div className="ml-auto flex items-center gap-2">
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                title="Volume"
                className="w-24"
              />
              <label className="text-xs">Vol</label>
            </div>
          </div>

          <div className="mt-3 flex gap-2 items-center">
            <input
              type="file"
              accept="audio/*"
              multiple
              onChange={(e) => addLocalFiles(e.target)}
            />
            <input
              type="text"
              placeholder="Search playlist..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="ml-2 p-1 rounded border"
            />
          </div>
        </div>
      </div>

      <div className="mt-4">
        <h4 className="font-medium">Playlist</h4>
        <ul className="mt-2 space-y-2 max-h-48 overflow-auto">
          {filtered.map((t, idx) => (
            <li
              key={t.id}
              className={`flex items-center justify-between p-2 rounded hover:bg-gray-50 cursor-pointer ${
                tracks[currentIndex]?.id === t.id ? "bg-gray-100" : ""
              }`}
              onClick={() => {
                const realIndex = tracks.findIndex((x) => x.id === t.id);
                if (realIndex >= 0) setCurrentIndex(realIndex);
                setIsPlaying(true);
              }}
            >
              <div className="flex items-center gap-3">
                <img src={t.cover} className="w-10 h-10 object-cover rounded" alt="c" />
                <div>
                  <div className="text-sm font-medium">{t.title}</div>
                  <div className="text-xs text-gray-800">{t.artist}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeTrack(t.id);
                  }}
                  className="text-xs px-2 py-1 rounded border"
                >
                  Remove
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const realIndex = tracks.findIndex((x) => x.id === t.id);
                    if (realIndex >= 0) setCurrentIndex(realIndex);
                    setIsPlaying(true);
                  }}
                  className="text-xs px-2 py-1 rounded border"
                >
                  Play
                </button>
              </div>
            </li>
          ))}
          {filtered.length === 0 && (
            <li className="text-sm text-gray-500">No tracks match "{query}"</li>
          )}
        </ul>
      </div>

      <audio
        ref={audioRef}
        src={tracks[currentIndex]?.src}
        preload="metadata"
        crossOrigin="anonymous"
      />
    </div>
  );
}
