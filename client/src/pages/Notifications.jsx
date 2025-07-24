import React, { useEffect, useState } from 'react';

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/notifications')
      .then(res => res.json())
      .then(data => {
        setNotifications(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Notifications</h2>
      {loading ? (
        <div className="text-gray-500">Loading...</div>
      ) : notifications.length === 0 ? (
        <div className="text-gray-500">No notifications yet.</div>
      ) : (
        <ul className="space-y-2">
          {notifications.map((n, i) => (
            <li key={i} className="bg-indigo-50 rounded p-3 shadow">
              <div>{n.message}</div>
              <div className="text-xs text-gray-400">{new Date(n.date).toLocaleString()}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Notifications; 