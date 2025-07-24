import express from 'express';
const router = express.Router();

let notifications = [];

export function addNotification(message) {
  notifications.unshift({ message, date: new Date() });
  if (notifications.length > 50) notifications.pop();
}

router.get('/', (req, res) => {
  res.json(notifications);
});

export default router; 