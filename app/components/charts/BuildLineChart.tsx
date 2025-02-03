'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { date: '1/3', fails: 4, passes: 15 },
  { date: '2/3', fails: 3, passes: 16 },
  { date: '3/3', fails: 5, passes: 14 },
  { date: '4/3', fails: 7, passes: 12 },
  { date: '5/3', fails: 2, passes: 17 },
  { date: '6/3', fails: 6, passes: 13 },
  { date: '7/3', fails: 3, passes: 16 },
];

export function BuildLineChart() {
  return (
    <div className="w-full h-[200px] mt-4">
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis 
            dataKey="date" 
            stroke="#9CA3AF"
            tick={{ fill: '#9CA3AF', fontSize: 12 }}
          />
          <YAxis 
            stroke="#9CA3AF"
            tick={{ fill: '#9CA3AF', fontSize: 12 }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#18181B',
              border: '1px solid #374151',
              borderRadius: '4px'
            }}
            labelStyle={{ color: '#9CA3AF' }}
            itemStyle={{ color: '#9CA3AF' }}
          />
          <Line 
            type="monotone" 
            dataKey="fails" 
            stroke="#EF4444" 
            strokeWidth={2}
            dot={false}
          />
          <Line 
            type="monotone" 
            dataKey="passes" 
            stroke="#10B981" 
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
} 