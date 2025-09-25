export const emotionDistribution = [
  { emotion: 'Neutral', count: 75, fill: 'var(--chart-1)' },
  { emotion: 'Happy', count: 15, fill: 'var(--chart-2)' },
  { emotion: 'Stressed', count: 8, fill: 'var(--chart-3)' },
  { emotion: 'Sad', count: 2, fill: 'var(--chart-4)' },
];

export const emotionOverTime = [
  { time: '0:00', Neutral: 9, Happy: 1, Stressed: 0 },
  { time: '5:00', Neutral: 8, Happy: 2, Stressed: 0 },
  { time: '10:00', Neutral: 7, Happy: 3, Stressed: 0 },
  { time: '15:00', Neutral: 6, Happy: 2, Stressed: 2 },
  { time: '20:00', Neutral: 5, Happy: 1, Stressed: 4 },
  { time: '25:00', Neutral: 6, Happy: 2, Stressed: 2 },
  { time: '30:00', Neutral: 8, Happy: 2, Stressed: 0 },
];

export const drowsinessAlerts = [
  "2024-05-21T14:22:10Z",
  "2024-05-21T14:45:30Z",
];

export const emotionDataForSummary = [
  { timestamp: "2024-05-21T14:15:00Z", emotion: "Neutral", confidence: 0.9 },
  { timestamp: "2024-05-21T14:20:00Z", emotion: "Happy", confidence: 0.8 },
  { timestamp: "2024-05-21T14:22:10Z", emotion: "Drowsy", confidence: 0.95 },
  { timestamp: "2024-05-21T14:30:00Z", emotion: "Stressed", confidence: 0.7 },
  { timestamp: "2024-05-21T14:45:30Z", emotion: "Drowsy", confidence: 0.98 },
  { timestamp: "2024-05-21T14:50:00Z", emotion: "Neutral", confidence: 0.85 },
];
