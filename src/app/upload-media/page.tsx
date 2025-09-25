import { UploadClient } from "./components/upload-client";

export default function UploadMediaPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-start">
        <div>
            <h2 className="text-2xl font-bold tracking-tight">Upload Recorded Media</h2>
            <p className="text-muted-foreground">Analyze a pre-recorded video or audio file to get an emotion summary.</p>
        </div>
      </div>
      <UploadClient />
    </div>
  );
}
