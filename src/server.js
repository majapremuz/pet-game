import { create, router as _router, defaults, bodyParser } from 'json-server';
import SHA1 from 'crypto-js/sha1';
import cors from 'cors';
import jwt from 'jsonwebtoken';

const server = create();
const router = _router('db.json');
//const middlewares = defaults();

const JWT_SECRET = 'your_secret_key';
const JWT_EXPIRY = '1d';

server.use(cors({
  origin: 'http://localhost:8100',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

server.use(bodyParser.json());
server.use(bodyParser.urlencoded({ extended: false }));

// Middleware for authenticating requests using JWT
server.use((req, res, next) => {
  if (req.method !== 'GET' && req.url.startsWith('/users')) {
    const authHeader = req.headers.authorization || req.cookies.token;
    if (!authHeader) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    try {
      const token = authHeader.startsWith('Bearer ')
        ? authHeader.split(' ')[1]
        : authHeader;
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
      next();
    } catch (err) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }
  } else {
    next();
  }
});


// JSON Server Router
server.use(router);

// Catch-All for 404
server.use((req, res) => {
  console.log(`Catch-All Route: ${req.method} ${req.url}`);
  res.status(404).json({ error: `Route not found: ${req.method} ${req.url}` });
});

// Start Server
const PORT = 3000;
server.listen(PORT, () => {
  console.log(`JSON Server is running on http://localhost:${PORT}`);
});
