import { create, router as _router, defaults, bodyParser } from 'json-server';
import SHA1 from 'crypto-js/sha1';
import cors from 'cors';

const server = create();
const router = _router('db.json');
//const middlewares = defaults();

server.use(cors({
  origin: 'http://localhost:8100',
  methods: ['GET', 'POST', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

server.use(bodyParser.json());
server.use(bodyParser.urlencoded({ extended: false }));

// Custom Login Route
server.post('/users/login', (req, res) => {
  console.log('Custom /users/login route hit');
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Missing username or password' });
  }

  const hashedUsername = SHA1(username).toString();
  const hashedPassword = SHA1(password).toString();

  const users = router.db.get('users').value();
  const user = users.find(
    (u) => u.username === hashedUsername && u.password === hashedPassword
  );

  if (user) {
    res.status(200).json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        petStats: user.petStats,
      },
    });
  } else {
    res.status(401).json({ success: false, message: 'Invalid username or password' });
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
