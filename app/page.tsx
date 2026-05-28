
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
    if (playing) {
      play();
    }
    const audio = videoRef.current;
    if (!audio) return;
    audio.onloadedmetadata = () => {
      setDuration(audio.duration);
    }

    audio.ontimeupdate = () => {
      setCurrentTime(audio.currentTime);
    }

    audio.onended = () => {
      setAudioIndex(videoIndex + 1);
    }
  }, [videoIndex])

  useEffect(()=>{
    configAudio(0);
    const audio = videoRef.current;
    if (!audio) return;
    setDuration(audio.duration);
  }, []);

  const formatTime = (time: number) => {
    const minutes = Math.trunc(time/60);
    const seconds = Math.trunc(time % 60);
    return ("0" + minutes).slice(-2) + ":" + ("0" + seconds).slice(-2);
  }

  const play = () => {
    const video = videoRef.current;
    if (!video) return;
    video.play();
  }

  const pause = () => {
    const video = videoRef.current;
    if (!video) return;
    video.pause();
  }

  const playPause = () => {
    if (playing) {
      pause();
    }
    else {
      play();
      draw();
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
    if (index >= videos.length) {
      index = 0; 
    } else if (index < 0){
      index = videos.length - 1;
    }
    setAudioIndex(index);
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
    video.currentTime = time;
    setCurrentTime(time);
  }

  const draw = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    requestAnimationFrame(draw);
  }

  return (
    <div className="flex bg-amber-400 w-250 mr-auto ml-auto">
      <div>
        <ul>
          {
            videos.map((music, index) => {
              return (
                <li key={index} onClick={() => configAudio(index)} className="w-50">
                  <h1>{music.nome}</h1>
                  <img src={music.imagem} alt={"Imagem da música " + music.nome} />
                </li>
              )
            })
          }
        </ul>
      </div>
      <div className="mt-5 items-center flex flex-col w-[80%] m-0 mr-auto ml-auto">
        <canvas ref={canvasRef} className="w-[80%] bg-pink-500">

        </canvas>
        <video className="w-[80%]" ref={videoRef} src={videos[videoIndex].url} hidden></video>
        <button onClick={() => playPause()} >
          {
            playing ? <FaPauseCircle /> : <FaPlayCircle />
          }
        </button>
        <input type="range"
          min={0}
          max={1}
          step={0.001}
          value={volume}
          onChange={(e) => configVolume(Number(e.target.value))}
        />
        <div className="flex">
          <p>{formatTime(currentTime)}</p>
          <input 
            type="range"
            min={0}
            step={0.001}
            max={duration}
            value={currentTime}
            onChange={(e) => configCurrentTime(Number(e.target.value))}
          />
          <p>{formatTime(duration)}</p>
        </div>
        <div>
          <button className="mr-4" onClick={()=>configCurrentTime(currentTime - 10)}>
            <FaBackward />
          </button>

          <button onClick={() => configCurrentTime(currentTime + 10)}>
             <FaForward />
          </button>
        </div>
        <div>
          <button onClick={()=> configAudio(videoIndex - 1)} className="mr-4">
                <FaStepBackward />
          </button>

          <button onClick={() => configAudio(videoIndex + 1)}>
            <FaStepForward />
          </button>

          <button onClick={() => configVelocity(velocity + 0.5)} className="bg-blue-500 rounded-[360px] w-6">
            {velocity}
          </button>
        </div>
      </div>
    </div>
  );
}
