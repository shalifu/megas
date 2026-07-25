const jwt = require('jsonwebtoken');

function authenticate(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ')
    ? authHeader.split(' ')[1]
    : req.cookies?.token;

  if (!token) {
    return res.status(401).json({ message: 'Access denied.' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'replace-with-secret', (err, user) => {
    if (err) {
      return res.status(401).json({ message: 'Invalid token.' });
    }

    req.user = user;
    next();
  });
}

function authorizeRoles(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden.' });
    }

    next();
  };
}

module.exports = {
  authenticate,
  authorizeRoles,
};
