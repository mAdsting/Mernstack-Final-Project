export default function requireRole(role) {
  return (req, res, next) => {
    if (req.user.role !== role) {
      return res.status(403).json({ message: `${role.charAt(0).toUpperCase() + role.slice(1)} privileges required.` });
    }
    next();
  };
} 