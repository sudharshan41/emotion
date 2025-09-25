"use client";

import React, { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { MetricCard } from "./metric-card";
import { EmotionCharts } from "./emotion-charts";
import { AlertTriangle, Bot, Clock, Smile } from "lucide-react";
import { summarizeEmotionsAfterDrive, type SummarizeEmotionsAfterDriveInput } from "@/ai/flows/summarize-emotions-after-drive";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel } from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";

type DashboardClientProps = {
  data: {
    emotionDistribution: any[];
    emotionOverTime: any[];
    drowsinessAlerts: string[];
    emotionDataForSummary: any[];
  };
};

export function DashboardClient({ data }: DashboardClientProps) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const [summary, setSummary] = useState("");
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);

  const handleGetSummary = () => {
    setIsSummaryOpen(true);
    setSummary(""); // Clear previous summary
    startTransition(async () => {
      const input: SummarizeEmotionsAfterDriveInput = {
        emotionData: data.emotionDataForSummary,
        drowsinessAlerts: data.drowsinessAlerts,
      };
      const result = await summarizeEmotionsAfterDrive(input);
      if (result?.summary) {
        setSummary(result.summary);
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to generate drive summary.",
        });
        setIsSummaryOpen(false);
      }
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-start">
          <h2 className="text-2xl font-bold tracking-tight">Last Drive Overview</h2>
          <Button onClick={handleGetSummary} disabled={isPending}>
            <Bot className="mr-2 h-4 w-4" />
            Get AI Summary
          </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Primary Emotion"
          value="Neutral"
          icon={<Smile className="h-4 w-4 text-muted-foreground" />}
          description="The most frequent emotion detected."
        />
        <MetricCard
          title="Drowsiness Alerts"
          value={data.drowsinessAlerts.length.toString()}
          icon={<AlertTriangle className="h-4 w-4 text-muted-foreground" />}
          description="Number of times drowsiness was detected."
        />
        <MetricCard
          title="Drive Duration"
          value="32 minutes"
          icon={<Clock className="h-4 w-4 text-muted-foreground" />}
          description="Total time for the last recorded trip."
        />
        <MetricCard
          title="Peak Stress"
          value="15:34"
          icon={<AlertTriangle className="h-4 w-4 text-muted-foreground" />}
          description="Time of highest detected stress level."
        />
      </div>

      <EmotionCharts
        emotionDistribution={data.emotionDistribution}
        emotionOverTime={data.emotionOverTime}
      />

      <AlertDialog open={isSummaryOpen} onOpenChange={setIsSummaryOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>AI Drive Summary</AlertDialogTitle>
            <AlertDialogDescription>
              {isPending ? (
                 <div className="space-y-2 pt-4">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                 </div>
              ) : (
                summary
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Close</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
