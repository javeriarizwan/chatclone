import { useState, useRef, useEffect } from "react";
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
  const [playableUrl, setPlayableUrl] = useState<string>("");
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    // Convert base64 audio to playable URL if needed
    if (audioUrl.startsWith('data:')) {
      // It's already a data URL, use it directly
      setPlayableUrl(audioUrl);
    } else if (audioUrl.startsWith('blob:')) {
      // It's a blob URL, use it directly
      setPlayableUrl(audioUrl);
    } else {
      // Assume it's base64 encoded audio data
      setPlayableUrl(audioUrl);
    }

    return () => {
      // Cleanup blob URLs to prevent memory leaks
      if (playableUrl.startsWith('blob:')) {
        URL.revokeObjectURL(playableUrl);
      }
    };
  }, [audioUrl]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const togglePlayback = async () => {
    if (audioRef.current && playableUrl) {
      try {
        if (isPlaying) {
          audioRef.current.pause();
          setIsPlaying(false);
        } else {
          // Reset to beginning if at end
          if (currentTime >= duration) {
            audioRef.current.currentTime = 0;
            setCurrentTime(0);
          }
          
          console.log('Attempting to play audio:', playableUrl.substring(0, 50) + '...');
          await audioRef.current.play();
          setIsPlaying(true);
        }
      } catch (error) {
        console.error('Error playing audio:', error);
        console.log('Audio URL format:', playableUrl.substring(0, 100));
        console.log('Audio element readyState:', audioRef.current?.readyState);
        console.log('Audio element networkState:', audioRef.current?.networkState);
        
        // Show user-friendly error
        alert('Unable to play audio. The audio format may not be supported by your browser.');
        
        // Fallback to simulation if real audio fails
        simulatePlayback();
        setIsPlaying(true);
      }
    }
  };

  const simulatePlayback = () => {
    let elapsed = currentTime;
    const interval = setInterval(() => {
      elapsed += 0.1;
      setCurrentTime(elapsed);
      
      if (elapsed >= duration) {
        clearInterval(interval);
        setIsPlaying(false);
        setCurrentTime(0);
      }
    }, 100);

    // Store interval in a ref so we can clear it if needed
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
              ? (isOwnMessage ? 'bg-primary-foreground' : 'bg-primary') 
              : (isOwnMessage ? 'bg-primary-foreground/40' : 'bg-muted-foreground/40')
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
            ? 'hover:bg-primary-foreground/20 text-primary-foreground' 
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
        ${isOwnMessage ? 'text-primary-foreground/70' : 'text-muted-foreground/70'}
      `}>
        {isPlaying ? formatTime(currentTime) : formatTime(duration)}
      </span>
      
      {/* Audio element for playback */}
      <audio
        ref={audioRef}
        src={playableUrl}
        onTimeUpdate={() => {
          if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
          }
        }}
        onEnded={() => {
          setIsPlaying(false);
          setCurrentTime(0);
        }}
        onPause={() => {
          setIsPlaying(false);
        }}
        onPlay={() => {
          setIsPlaying(true);
        }}
        onLoadStart={() => {
          console.log('Audio loading started');
        }}
        onCanPlay={() => {
          console.log('Audio can play');
        }}
        onError={(e) => {
          console.error('Audio element error:', e);
          const target = e.target as HTMLAudioElement;
          if (target.error) {
            console.error('Audio error details:', {
              code: target.error.code,
              message: target.error.message
            });
          }
        }}
        style={{ display: 'none' }}
      />
    </div>
  );
};