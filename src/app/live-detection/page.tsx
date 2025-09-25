import { LiveDetectionClient } from "./components/live-detection-client";

export default function LiveDetectionPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-start">
        <div>
            <h2 className="text-2xl font-bold tracking-tight">Live Emotion & Drowsiness Detection</h2>
            <p className="text-muted-foreground">Real-time analysis of driver's state using your camera and microphone.</p>
        </div>
      </div>
      <LiveDetectionClient />
    </div>
  );
}
