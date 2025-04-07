import React from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const weeklyData = [
  { name: "Mon", screenTime: 120 },
  { name: "Tue", screenTime: 90 },
  { name: "Wed", screenTime: 150 },
  { name: "Thu", screenTime: 80 },
  { name: "Fri", screenTime: 200 },
  { name: "Sat", screenTime: 180 },
  { name: "Sun", screenTime: 140 },
];

const WeeklyStats = () => {
  return (
    <div className="stats-container">
      <h2 className="stats-title">📆 Weekly Screen Time</h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={weeklyData}>
          <XAxis dataKey="name" stroke="#ffffff" />
          <YAxis stroke="#ffffff" />
          <Tooltip />
          <Line type="monotone" dataKey="screenTime" stroke="#6B8AFF" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default WeeklyStats;
