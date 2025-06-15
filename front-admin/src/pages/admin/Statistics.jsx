import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const data = [
  { name: '1월', 가입자수: 30 },
  { name: '2월', 가입자수: 50 },
  { name: '3월', 가입자수: 80 },
  { name: '4월', 가입자수: 60 },
  { name: '5월', 가입자수: 90 },
];

function Statistics() {
  return (
    <div>
      <h2>통계</h2>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="가입자수" stroke="#8884d8" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default Statistics;
