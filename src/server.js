import { create, router as _router, defaults, bodyParser } from 'json-server';
import SHA1 from 'crypto-js/sha1';
import cors from 'cors';
import jwt from 'jsonwebtoken';

const server = create();
const router = _router('db.json');

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

     const token = authHeader.split(' ')[1];
     const decoded = jwt.verify(token, JWT_SECRET);
     req.user = decoded;
     next(); 


// Catch-All for 404
server.use((req, res) => {
  console.log(`Catch-All Route: ${req.method} ${req.url}`);
  res.status(404).json({ error: `Route not found: ${req.method} ${req.url}` });
});

    }
);
// JSON Server Router
server.use(router);

