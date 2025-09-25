"use client";

import { useState, useRef, useEffect, useCallback, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { Progress } from "@/components/ui/progress";
import {
  Camera,
  Mic,
  Video,
  VideoOff,
  AlertTriangle,
  Smile,
  Frown,
  Meh,
  Loader2,
} from "lucide-react";
import { alertOnDrowsiness } from "@/ai/flows/alert-on-drowsiness";
import { analyzeUploadedMedia } from "@/ai/flows/analyze-uploaded-media";
import { useToast } from "@/hooks/use-toast";

const EMOTION_ICONS: { [key: string]: React.ReactNode } = {
  happy: <Smile className="w-8 h-8 text-green-500" />,
  sad: <Frown className="w-8 h-8 text-blue-500" />,
  neutral: <Meh className="w-8 h-8 text-gray-500" />,
  stressed: <Frown className="w-8 h-8 text-orange-500" />,
  angry: <Frown className="w-8 h-8 text-red-500" />,
  drowsy: <AlertTriangle className="w-8 h-8 text-yellow-500" />,
};

export function LiveDetectionClient() {
  const [isDetecting, setIsDetecting] = useState(false);
  const [isDrowsy, setIsDrowsy] = useState(false);
  const [drowsyAlertMessage, setDrowsyAlertMessage] = useState("");
  const [emotion, setEmotion] = useState("Neutral");
  const [lastAnalysis, setLastAnalysis] = useState("");
  const [permissionsGranted, setPermissionsGranted] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const analysisIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const drowsyCounterRef = useRef(0);
  const audioContextRef = useRef<AudioContext | null>(null);

  const [isProcessing, startTransition] = useTransition();
  const { toast } = useToast();

  const playBuzzer = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    const audioCtx = audioContextRef.current;
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    oscillator.type = 'square';
    oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); // A6 note
    gainNode.gain.setValueAtTime(1, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.5);

    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.5);
  };

  const requestPermissions = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setPermissionsGranted(true);
    } catch (error) {
      console.error("Error accessing media devices.", error);
      toast({
        variant: "destructive",
        title: "Permission Denied",
        description: "Please allow camera and microphone access to use this feature.",
      });
      setPermissionsGranted(false);
    }
  }, [toast]);

  useEffect(() => {
    requestPermissions();
    return () => {
      stopDetection();
       if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [requestPermissions]);

  const analyzeFrame = useCallback(async () => {
    if (!videoRef.current || !mediaStreamRef.current || videoRef.current.paused) return;

    startTransition(async () => {
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current!.videoWidth;
      canvas.height = videoRef.current!.videoHeight;
      const context = canvas.getContext("2d");
      context?.drawImage(videoRef.current!, 0, 0, canvas.width, canvas.height);
      const dataUri = canvas.toDataURL("image/jpeg");
      
      // Drowsiness check
      const drowsyResult = await alertOnDrowsiness({ faceVideoDataUri: dataUri });
      if (drowsyResult.isDrowsy) {
        drowsyCounterRef.current += 1;
        if (drowsyCounterRef.current >= 2) {
          playBuzzer();
          setIsDrowsy(true);
          setDrowsyAlertMessage(drowsyResult.alertMessage || "Drowsiness detected! Please take a break.");
        }
      } else {
        drowsyCounterRef.current = 0;
      }

      // Emotion check (run less frequently if needed, or in parallel)
      if (drowsyCounterRef.current === 0) { // Only check emotion if not drowsy
        const emotionResult = await analyzeUploadedMedia({ mediaDataUri: dataUri });
        if (emotionResult.summary) {
          setLastAnalysis(emotionResult.summary);
          const lowerSummary = emotionResult.summary.toLowerCase();
          const foundEmotion = Object.keys(EMOTION_ICONS).find(em => lowerSummary.includes(em));
          setEmotion(foundEmotion || "Neutral");
        }
      }
    });
  }, []);

  const startDetection = () => {
    if (!permissionsGranted) {
      requestPermissions();
      return;
    }
    setIsDetecting(true);
    drowsyCounterRef.current = 0;
    if(videoRef.current) videoRef.current.play().catch(e => console.error("Video play failed", e));
    analysisIntervalRef.current = setInterval(analyzeFrame, 1000); // Analyze every second
  };

  const stopDetection = () => {
    setIsDetecting(false);
    if (analysisIntervalRef.current) {
      clearInterval(analysisIntervalRef.current);
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    if(videoRef.current) {
        videoRef.current.srcObject = null;
    }
    drowsyCounterRef.current = 0;
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="relative aspect-video bg-muted rounded-lg overflow-hidden border">
            <video ref={videoRef} muted autoPlay playsInline className="w-full h-full object-cover"></video>
            {!isDetecting && (
              <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white">
                <VideoOff className="w-16 h-16" />
                <p className="mt-2">Detection is off</p>
              </div>
            )}
            {isProcessing && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white">
                <Loader2 className="w-16 h-16 animate-spin" />
              </div>
            )}
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex gap-2">
                {!isDetecting ? (
                <Button onClick={startDetection} disabled={!permissionsGranted} className="w-full">
                    <Video className="mr-2 h-4 w-4" /> Start Detection
                </Button>
                ) : (
                <Button onClick={stopDetection} variant="destructive" className="w-full">
                    <VideoOff className="mr-2 h-4 w-4" /> Stop Detection
                </Button>
                )}
            </div>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Current Status</CardTitle>
                {EMOTION_ICONS[emotion.toLowerCase()] || <Meh className="w-4 h-4 text-muted-foreground" />}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold capitalize">{emotion}</div>
                <p className="text-xs text-muted-foreground">
                  Real-time emotional state.
                </p>
              </CardContent>
            </Card>

            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Last AI Analysis</AlertTitle>
              <AlertDescription>
                {isProcessing ? "Analyzing..." : (lastAnalysis || "No analysis yet.")}
              </AlertDescription>
            </Alert>
            
            {!permissionsGranted && (
                 <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Permissions Required</AlertTitle>
                    <AlertDescription>
                        Camera and microphone access is required for live detection.
                        <Button variant="link" onClick={requestPermissions} className="p-0 h-auto ml-1">Grant Permissions</Button>
                    </AlertDescription>
                </Alert>
            )}

            <Progress value={isDetecting ? (isProcessing ? 50 : 100) : 0} className="w-full" />
          </div>
        </div>
        
        <AlertDialog open={isDrowsy} onOpenChange={setIsDrowsy}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <AlertTriangle className="text-destructive w-6 h-6" /> Drowsiness Alert!
              </AlertDialogTitle>
              <AlertDialogDescription>{drowsyAlertMessage}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction onClick={() => { setIsDrowsy(false); drowsyCounterRef.current = 0; } }>I'm awake</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
}
