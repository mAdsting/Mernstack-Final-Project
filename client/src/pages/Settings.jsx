import React, { useState } from 'react';

function Settings() {
  // Profile state
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: ''
  });
  // Password state
  const [password, setPassword] = useState({
    current: '',
    new: '',
    confirm: ''
  });
  // Notification preferences
  const [notifications, setNotifications] = useState({
    sms: true,
    email: false
  });

  // Handlers (for demo, just update state)
  const handleProfileChange = e => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };
  const handlePasswordChange = e => {
    setPassword({ ...password, [e.target.name]: e.target.value });
  };
  const handleNotificationsChange = e => {
    setNotifications({ ...notifications, [e.target.name]: e.target.checked });
  };
  const handleProfileSave = e => {
    e.preventDefault();
    alert('Profile updated (demo only)');
  };
  const handlePasswordSave = e => {
    e.preventDefault();
    if (password.new !== password.confirm) {
      alert('New passwords do not match!');
      return;
    }
    alert('Password changed (demo only)');
  };
  const handleNotificationsSave = e => {
    e.preventDefault();
    alert('Notification preferences updated (demo only)');
  };

  return (
    <div className="p-6 max-w-xl mx-auto bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">Settings</h2>
      <form className="mb-6" onSubmit={handleProfileSave}>
        <div className="text-gray-700 font-semibold mb-2">Profile</div>
        <input
          className="w-full border rounded p-2 mb-2"
          name="name"
          placeholder="Name"
          value={profile.name}
          onChange={handleProfileChange}
        />
        <input
          className="w-full border rounded p-2 mb-2"
          name="email"
          placeholder="Email"
          value={profile.email}
          onChange={handleProfileChange}
        />
        <input
          className="w-full border rounded p-2 mb-2"
          name="phone"
          placeholder="Phone"
          value={profile.phone}
          onChange={handleProfileChange}
        />
        <button className="bg-indigo-600 text-white px-4 py-2 rounded" type="submit">Save Profile</button>
      </form>
      <form className="mb-6" onSubmit={handlePasswordSave}>
        <div className="text-gray-700 font-semibold mb-2">Change Password</div>
        <input
          className="w-full border rounded p-2 mb-2"
          name="current"
          type="password"
          placeholder="Current Password"
          value={password.current}
          onChange={handlePasswordChange}
        />
        <input
          className="w-full border rounded p-2 mb-2"
          name="new"
          type="password"
          placeholder="New Password"
          value={password.new}
          onChange={handlePasswordChange}
        />
        <input
          className="w-full border rounded p-2 mb-2"
          name="confirm"
          type="password"
          placeholder="Confirm New Password"
          value={password.confirm}
          onChange={handlePasswordChange}
        />
        <button className="bg-indigo-600 text-white px-4 py-2 rounded" type="submit">Change Password</button>
      </form>
      <form className="mb-6" onSubmit={handleNotificationsSave}>
        <div className="text-gray-700 font-semibold mb-2">Notification Preferences</div>
        <label className="flex items-center mb-2">
          <input
            type="checkbox"
            name="sms"
            checked={notifications.sms}
            onChange={handleNotificationsChange}
            className="mr-2"
          />
          SMS Notifications
        </label>
        <label className="flex items-center mb-2">
          <input
            type="checkbox"
            name="email"
            checked={notifications.email}
            onChange={handleNotificationsChange}
            className="mr-2"
          />
          Email Notifications
        </label>
        <button className="bg-indigo-600 text-white px-4 py-2 rounded" type="submit">Save Preferences</button>
      </form>
      <div>
        <div className="text-gray-700 font-semibold mb-2">Account</div>
        <button className="bg-red-600 text-white px-4 py-2 rounded" onClick={() => alert('Account deletion coming soon (demo only)')}>Delete Account</button>
        <button className="bg-gray-400 text-white px-4 py-2 rounded ml-2" onClick={() => { localStorage.clear(); window.location.href = '/login'; }}>Log Out</button>
      </div>
    </div>
  );
}

export default Settings; 