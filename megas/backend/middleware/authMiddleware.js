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

function authorizeChiefAccess(req, res, next) {
  const isChiefUser = req.user?.role === 'preadmin' ||
    (req.user?.role === 'admin' && (req.user?.chief_position || req.user?.username === 'Admin User'));

  if (!isChiefUser) {
    return res.status(403).json({ message: 'Chief access only.' });
  }

  next();
}

module.exports = {
  authenticate,
  authorizeRoles,
  authorizeChiefAccess,
};
