import { useState, useRef } from "react";
import { Mic, MicOff, Send, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface AudioRecorderProps {
  onSendAudio: (audioBlob: Blob, duration: number) => void;
  onCancel: () => void;
}

export const AudioRecorder = ({ onSendAudio, onCancel }: AudioRecorderProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      const chunks: Blob[] = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/wav' });
        setAudioBlob(blob);
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      
      // Start timer
      setRecordingTime(0);
      intervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
    } catch (error) {
      toast({
        title: "Microphone Access Required",
        description: "Please allow microphone access to record audio messages.",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      if (isPaused) {
        mediaRecorderRef.current.resume();
        intervalRef.current = setInterval(() => {
          setRecordingTime(prev => prev + 1);
        }, 1000);
      } else {
        mediaRecorderRef.current.pause();
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      }
      setIsPaused(!isPaused);
    }
  };

  const handleSend = () => {
    if (audioBlob) {
      onSendAudio(audioBlob, recordingTime);
      cleanup();
    }
  };

  const handleCancel = () => {
    cleanup();
    onCancel();
  };

  const cleanup = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    setIsRecording(false);
    setRecordingTime(0);
    setAudioBlob(null);
    setIsPaused(false);
  };

  const getWaveformBars = () => {
    const bars = [];
    const barCount = 15;
    
    for (let i = 0; i < barCount; i++) {
      const height = isRecording && !isPaused 
        ? Math.random() * 20 + 5 // Animated bars when recording
        : 10; // Static bars when not recording
      
      bars.push(
        <div
          key={i}
          className={`
            w-1 rounded-full transition-all duration-150
            ${isRecording ? 'bg-primary animate-pulse' : 'bg-muted-foreground/40'}
          `}
          style={{ height: `${height}px` }}
        />
      );
    }
    
    return bars;
  };

  return (
    <div className="flex items-center gap-3 p-4 bg-card border-t border-border">
      <div className="flex items-center gap-2 flex-1">
        {/* Recording visualizer */}
        <div className="flex items-center gap-1 flex-1 min-w-0">
          {getWaveformBars()}
        </div>
        
        {/* Recording time */}
        <span className="text-sm text-muted-foreground tabular-nums min-w-0">
          {formatTime(recordingTime)}
        </span>
      </div>

      {/* Control buttons */}
      <div className="flex items-center gap-2">
        {!isRecording && !audioBlob && (
          <Button
            onClick={startRecording}
            className="bg-primary hover:bg-primary-dark text-primary-foreground rounded-full h-10 w-10 p-0"
          >
            <Mic className="h-5 w-5" />
          </Button>
        )}
        
        {isRecording && (
          <>
            <Button
              onClick={pauseRecording}
              variant="outline"
              className="rounded-full h-10 w-10 p-0"
            >
              {isPaused ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
            </Button>
            
            <Button
              onClick={stopRecording}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded-full h-10 w-10 p-0"
            >
              <MicOff className="h-5 w-5" />
            </Button>
          </>
        )}
        
        {audioBlob && !isRecording && (
          <>
            <Button
              onClick={handleCancel}
              variant="outline"
              className="rounded-full h-10 w-10 p-0"
            >
              <Trash2 className="h-5 w-5" />
            </Button>
            
            <Button
              onClick={handleSend}
              className="bg-primary hover:bg-primary-dark text-primary-foreground rounded-full h-10 w-10 p-0"
            >
              <Send className="h-5 w-5" />
            </Button>
          </>
        )}
      </div>
    </div>
  );
};