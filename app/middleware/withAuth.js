import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

export function withRole(handler, requiredRole) {
  return async (req, res) => {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) return res.status(401).json({ message: 'Unauthorized' });

      const decoded = jwt.verify(token, JWT_SECRET);

      if (requiredRole && decoded.role !== requiredRole) {
        return res.status(403).json({ message: 'Forbidden' });
      }

      req.user = decoded; // attach user data to request
      return handler(req, res);
    } catch (err) {
      return res.status(401).json({ message: 'Invalid token' });
    }
  };
}
