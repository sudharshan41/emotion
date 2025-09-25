import { emotionDistribution, emotionOverTime, drowsinessAlerts, emotionDataForSummary } from "@/lib/mock-data";
import { DashboardClient } from "./components/dashboard-client";

export default function DashboardPage() {
  const dashboardData = {
    emotionDistribution,
    emotionOverTime,
    drowsinessAlerts,
    emotionDataForSummary,
  };

  return <DashboardClient data={dashboardData} />;
}
