"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, FileVideo, FileAudio, Bot } from "lucide-react";
import { analyzeUploadedMedia } from "@/ai/flows/analyze-uploaded-media";
import { useToast } from "@/hooks/use-toast";

export function UploadClient() {
  const [file, setFile] = useState<File | null>(null);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [isProcessing, startTransition] = useTransition();
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setAnalysisResult(null);
    }
  };

  const handleAnalyze = () => {
    if (!file) {
      toast({
        variant: "destructive",
        title: "No file selected",
        description: "Please choose a video or audio file to analyze.",
      });
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const dataUri = reader.result as string;
      startTransition(async () => {
        try {
          const result = await analyzeUploadedMedia({ mediaDataUri: dataUri });
          if (result.summary) {
            setAnalysisResult(result.summary);
          } else {
            throw new Error("Analysis failed to produce a summary.");
          }
        } catch (error) {
          console.error(error);
          toast({
            variant: "destructive",
            title: "Analysis Failed",
            description: "There was an error analyzing your file. Please try again.",
          });
        }
      });
    };
    reader.onerror = (error) => {
        console.error("Error reading file:", error);
        toast({
            variant: "destructive",
            title: "File Read Error",
            description: "Could not read the selected file.",
        });
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Analyze Media</CardTitle>
        <CardDescription>Upload a video or audio file of a drive to receive an AI-powered emotion summary.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid w-full items-center gap-1.5">
          <Label htmlFor="media-file">Media File</Label>
          <Input id="media-file" type="file" accept="video/*,audio/*" onChange={handleFileChange} />
        </div>
        {file && (
            <Alert variant="default">
                {file.type.startsWith('video/') ? <FileVideo className="h-4 w-4" /> : <FileAudio className="h-4 w-4" />}
                <AlertTitle>{file.name}</AlertTitle>
                <AlertDescription>
                    {(file.size / (1024 * 1024)).toFixed(2)} MB
                </AlertDescription>
            </Alert>
        )}
      </CardContent>
      <CardFooter className="flex flex-col items-stretch gap-4">
        <Button onClick={handleAnalyze} disabled={isProcessing || !file}>
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing...
            </>
          ) : (
            "Analyze File"
          )}
        </Button>
        {analysisResult && (
            <Card className="bg-secondary">
                <CardHeader className="flex-row gap-2 items-center">
                    <Bot className="w-6 h-6"/>
                    <CardTitle>Analysis Summary</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-secondary-foreground">{analysisResult}</p>
                </CardContent>
            </Card>
        )}
      </CardFooter>
    </Card>
  );
}
