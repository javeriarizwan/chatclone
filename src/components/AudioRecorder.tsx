import { useState, useRef } from "react";
import { Mic, Square, Send, X } from "lucide-react";
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
  };

  const AnimatedWave = () => (
    <div className="flex items-center gap-1 px-3">
      {[...Array(8)].map((_, i) => (
        <div
          key={i}
          className={`w-1 bg-primary rounded-full transition-all duration-300 ${
            isRecording ? 'animate-pulse' : ''
          }`}
          style={{
            height: isRecording 
              ? `${12 + Math.sin((Date.now() / 200) + i) * 6}px`
              : '8px',
            animationDelay: `${i * 100}ms`
          }}
        />
      ))}
    </div>
  );

  return (
    <div className="flex items-center gap-3 p-3 bg-background border-t border-border">
      {/* Recording State */}
      {!audioBlob && (
        <>
          {isRecording ? (
            <div className="flex items-center flex-1 bg-primary/10 rounded-full px-4 py-2">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse mr-3" />
              <AnimatedWave />
              <span className="text-sm font-medium text-primary ml-3">
                {formatTime(recordingTime)}
              </span>
            </div>
          ) : (
            <div className="flex-1" />
          )}
          
          <div className="flex items-center gap-2">
            {!isRecording ? (
              <Button
                onClick={startRecording}
                size="icon"
                className="rounded-full h-12 w-12 bg-primary hover:bg-primary/90"
              >
                <Mic className="h-5 w-5" />
              </Button>
            ) : (
              <Button
                onClick={stopRecording}
                size="icon"
                className="rounded-full h-12 w-12 bg-red-500 hover:bg-red-600"
              >
                <Square className="h-4 w-4 fill-white" />
              </Button>
            )}
          </div>
        </>
      )}

      {/* Preview State */}
      {audioBlob && !isRecording && (
        <>
          <div className="flex items-center flex-1 bg-muted rounded-full px-4 py-2">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-3" />
            <span className="text-sm text-muted-foreground">
              Audio recorded • {formatTime(recordingTime)}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              onClick={handleCancel}
              size="icon"
              variant="ghost"
              className="rounded-full h-10 w-10"
            >
              <X className="h-4 w-4" />
            </Button>
            
            <Button
              onClick={handleSend}
              size="icon"
              className="rounded-full h-12 w-12 bg-primary hover:bg-primary/90"
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </>
      )}
    </div>
  );
};