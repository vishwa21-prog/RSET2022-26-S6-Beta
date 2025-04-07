import React from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const COLORS = ["#ff6b6b", "#6b8aff", "#42b883", "#ffc107"];

const dummyData = [
  { name: "YouTube", value: 120 },
  { name: "Instagram", value: 90 },
  { name: "WhatsApp", value: 60 },
  { name: "Others", value: 30 },
];

const DailyStats = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h2 className="text-2xl font-bold mb-4">📅 Daily Screen Time</h2>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <ResponsiveContainer width={350} height={350}>
          <PieChart>
            <Pie data={dummyData} dataKey="value" cx="50%" cy="50%" outerRadius={100}>
              {dummyData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default DailyStats;
