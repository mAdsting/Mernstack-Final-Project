import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';

function Analytics() {
  const [trends, setTrends] = useState(null);

  useEffect(() => {
    fetch('/api/analytics/trends')
      .then(res => res.json())
      .then(setTrends);
  }, []);

  if (!trends) return <div>Loading analytics...</div>;

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Analytics & Reports</h2>
      <div className="mb-8">
        <h3 className="font-semibold mb-2">Monthly Rent Collected (Last 12 Months)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={trends.monthly}>
            <XAxis dataKey="_id" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="total" fill="#6366f1" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="mb-8">
        <h3 className="font-semibold mb-2">6-Month Blocks (Last 3 Years)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={trends.sixMonth.map(d => ({...d, label: `${d._id.year} H${d._id.half}`}))}>
            <XAxis dataKey="label" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="total" fill="#10b981" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="mb-8">
        <h3 className="font-semibold mb-2">Yearly Rent Collected</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={trends.yearly}>
            <XAxis dataKey="_id" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="total" stroke="#f59e42" />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div>
        <h3 className="font-semibold mb-2">Monthly Arrears (Last 12 Months)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={trends.arrearsMonthly}>
            <XAxis dataKey="_id" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="total" stroke="#ef4444" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default Analytics; 