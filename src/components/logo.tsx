import { Car } from "lucide-react";

export function Logo() {
  return (
    <div className="flex items-center gap-2">
      <Car className="h-6 w-6 text-primary" />
      <h1 className="text-lg font-bold tracking-tight">Driver Emotion Tracking System</h1>
    </div>
  );
}
