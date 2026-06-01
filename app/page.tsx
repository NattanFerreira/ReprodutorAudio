"use client"

import { useEffect, useRef, useState } from "react";
import { FaBackward, FaForward, FaPauseCircle, FaPlayCircle, FaStepBackward, FaStepForward } from "react-icons/fa";
import videos from "./data/videos";

export default function Home() {
  const [playing, isPlaying] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(1);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [videoIndex, setAudioIndex] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [velocity, setVelocity] = useState<number>(1);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.onloadedmetadata = () => {
      setDuration(video.duration);
      video.playbackRate = velocity;
    };

    video.ontimeupdate = () => {
      setCurrentTime(video.currentTime);
    };

    video.onended = () => {
      configAudio(videoIndex + 1);
    };

    if (playing) {
      video.play().then(() => {
        draw();
      }).catch((err) => console.error(err));
    }
  }, [videoIndex]);

  useEffect(() => {
    configAudio(0);
  }, []);

  const formatTime = (time: number) => {
    if (isNaN(time)) return "00:00";
    const minutes = Math.trunc(time / 60);
    const seconds = Math.trunc(time % 60);
    return ("0" + minutes).slice(-2) + ":" + ("0" + seconds).slice(-2);
  }

  const play = () => {
    const video = videoRef.current;
    if (!video) return;
    video.play();
    draw();
  }

  const pause = () => {
    const video = videoRef.current;
    if (!video) return;
    video.pause();
  }

  const playPause = () => {
    if (playing) {
      pause();
    } else {
      play();
    }
    isPlaying(!playing);
  }

  const configVolume = (value: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.volume = value;
    setVolume(value);
  }

  const configAudio = (index: number) => {
    let targetIndex = index;
    if (targetIndex >= videos.length) {
      targetIndex = 0; 
    } else if (targetIndex < 0) {
      targetIndex = videos.length - 1;
    }
    setAudioIndex(targetIndex);
  }

  const configVelocity = (number: number) => {
    let newVelocity = number;
    if (newVelocity > 3) {
      newVelocity = 1;
    }
    const audio = videoRef.current;
    if (!audio) return;
    audio.playbackRate = newVelocity;
    setVelocity(newVelocity);
  }

  const configCurrentTime = (time: number) => {
    const video = videoRef.current;
    if (!video) return;
    
    let targetTime = time;
    if (targetTime < 0) targetTime = 0;
    if (targetTime > duration) targetTime = duration;

    video.currentTime = targetTime;
    setCurrentTime(targetTime);
  }

  const draw = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.paused || video.ended) return;
    const context = canvas.getContext("2d");
    if (!context) return;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    requestAnimationFrame(draw);
  }

  return (
    <div className="flex bg-slate-900 text-white min-h-screen w-full max-w-5xl mx-auto rounded-lg shadow-xl overflow-hidden my-5">
      <div className="w-1/3 bg-slate-800 p-4 border-r border-slate-700 overflow-y-auto max-h-[600px]">
        <h2 className="text-xl font-bold mb-4 border-b border-slate-700 pb-2 text-amber-400">Playlist</h2>
        <ul className="space-y-2">
          {
            videos.map((music, index) => {
              const isCurrent = index === videoIndex;
              return (
                <li 
                  key={index} 
                  onClick={() => configAudio(index)} 
                  className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-all duration-200 ${
                    isCurrent ? 'bg-amber-500 text-slate-900 font-bold scale-[1.02] shadow-md' : 'hover:bg-slate-700 text-slate-300'
                  }`}
                >
                  <img src={music.imagem} alt={music.nome} className="w-12 h-12 object-cover rounded shadow" />
                  <div className="truncate">
                    <h1 className="text-sm truncate">{music.nome}</h1>
                    <span className="text-xs opacity-75">{isCurrent ? "Tocando agora" : "Faixa"}</span>
                  </div>
                </li>
              )
            })
          }
        </ul>
      </div>

      <div className="w-2/3 p-6 flex flex-col items-center justify-between bg-slate-850">
        <div className="w-full flex justify-center mb-4 relative aspect-video bg-black rounded-lg overflow-hidden shadow-inner">
          <canvas ref={canvasRef} width={640} height={360} className="w-full h-full object-contain"></canvas>
        </div>

        <video ref={videoRef} src={videos[videoIndex].url} hidden></video>

        <div className="text-center mb-4">
          <h3 className="text-lg font-semibold text-amber-400">{videos[videoIndex].nome}</h3>
        </div>

        <div className="w-full flex items-center justify-between gap-4 px-2 mb-4">
          <span className="text-xs font-mono text-slate-400 w-10 text-right">{formatTime(currentTime)}</span>
          <input 
            type="range"
            min={0}
            step={0.1}
            max={duration || 100}
            value={currentTime}
            onChange={(e) => configCurrentTime(Number(e.target.value))}
            className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
          />
          <span className="text-xs font-mono text-slate-400 w-10">{formatTime(duration)}</span>
        </div>

        <div className="flex flex-col items-center gap-4 w-full">
          <div className="flex items-center gap-6">
            <button onClick={() => configAudio(videoIndex - 1)} className="text-xl hover:text-amber-400 transition-colors">
              <FaStepBackward />
            </button>

            <button onClick={() => configCurrentTime(currentTime - 10)} className="text-xl hover:text-amber-400 transition-colors">
              <FaBackward />
            </button>

            <button onClick={playPause} className="text-5xl text-amber-400 hover:scale-105 active:scale-95 transition-transform">
              {playing ? <FaPauseCircle /> : <FaPlayCircle />}
            </button>

            <button onClick={() => configCurrentTime(currentTime + 10)} className="text-xl hover:text-amber-400 transition-colors">
              <FaForward />
            </button>

            <button onClick={() => configAudio(videoIndex + 1)} className="text-xl hover:text-amber-400 transition-colors">
              <FaStepForward />
            </button>
          </div>

          <div className="flex items-center justify-between w-full mt-2 border-t border-slate-700 pt-4 px-4">
            <div className="flex items-center gap-2 w-1/3">
              <span className="text-xs text-slate-400">🔊</span>
              <input 
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={volume}
                onChange={(e) => configVolume(Number(e.target.value))}
                className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Velocidade:</span>
              <button 
                onClick={() => configVelocity(velocity === 3 ? 1 : velocity + 0.5)} 
                className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold text-xs py-1 px-3 rounded-full transition-colors min-w-[45px]"
              >
                {velocity}x
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}