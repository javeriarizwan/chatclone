import { useState, useRef } from "react";
import { Play, Pause } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AudioPlayerProps {
  audioUrl: string;
  duration: number;
  isOwnMessage: boolean;
}

export const AudioPlayer = ({ audioUrl, duration, isOwnMessage }: AudioPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const togglePlayback = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        // Since we're using mock data, we'll simulate playback
        simulatePlayback();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const simulatePlayback = () => {
    let elapsed = 0;
    const interval = setInterval(() => {
      elapsed += 0.1;
      setCurrentTime(elapsed);
      
      if (elapsed >= duration) {
        clearInterval(interval);
        setIsPlaying(false);
        setCurrentTime(0);
      }
    }, 100);

    return () => clearInterval(interval);
  };

  const getWaveformBars = () => {
    const bars = [];
    const barCount = 20;
    
    for (let i = 0; i < barCount; i++) {
      const height = Math.random() * 20 + 5; // Random height between 5-25px
      const isActive = currentTime > 0 && (currentTime / duration) * barCount > i;
      
      bars.push(
        <div
          key={i}
          className={`
            w-1 rounded-full transition-all duration-150
            ${isActive 
              ? (isOwnMessage ? 'bg-message-sent-foreground' : 'bg-primary') 
              : (isOwnMessage ? 'bg-message-sent-foreground/40' : 'bg-muted-foreground/40')
            }
          `}
          style={{ height: `${height}px` }}
        />
      );
    }
    
    return bars;
  };

  return (
    <div className="flex items-center gap-3 py-1">
      <Button
        variant="ghost"
        size="sm"
        onClick={togglePlayback}
        className={`
          h-8 w-8 rounded-full p-0 shrink-0
          ${isOwnMessage 
            ? 'hover:bg-message-sent-foreground/20 text-message-sent-foreground' 
            : 'hover:bg-primary/20 text-primary'
          }
        `}
      >
        {isPlaying ? (
          <Pause className="h-4 w-4" />
        ) : (
          <Play className="h-4 w-4 ml-0.5" />
        )}
      </Button>
      
      <div className="flex items-center gap-1 flex-1">
        {getWaveformBars()}
      </div>
      
      <span className={`
        text-xs tabular-nums
        ${isOwnMessage ? 'text-message-sent-foreground/70' : 'text-message-received-foreground/70'}
      `}>
        {isPlaying ? formatTime(currentTime) : formatTime(duration)}
      </span>
      
      {/* Hidden audio element for future real implementation */}
      <audio
        ref={audioRef}
        src={audioUrl}
        onTimeUpdate={() => {
          if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
          }
        }}
        onEnded={() => {
          setIsPlaying(false);
          setCurrentTime(0);
        }}
        style={{ display: 'none' }}
      />
    </div>
  );
};