import React from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const monthlyData = [
  { name: "Week 1", screenTime: 500 },
  { name: "Week 2", screenTime: 700 },
  { name: "Week 3", screenTime: 600 },
  { name: "Week 4", screenTime: 800 },
];

const MonthlyStats = () => {
  return (
    <div className="stats-container">
      <h2 className="stats-title">📅 Monthly Screen Time</h2>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={monthlyData}>
          <XAxis dataKey="name" stroke="#ffffff" />
          <YAxis stroke="#ffffff" />
          <Tooltip />
          <Area type="monotone" dataKey="screenTime" fill="#42B883" stroke="#42B883" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MonthlyStats;
