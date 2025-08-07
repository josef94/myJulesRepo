import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';

const app = express();
const port = 3001;

app.use(cors());
app.use(bodyParser.json());

let data: any = {};
let isLocked = false;
let lockedBy = '';

app.get('/api/data', (req, res) => {
  res.json(data);
});

app.post('/api/data', (req, res) => {
  if (isLocked) {
    return res.status(423).json({ message: `Locked by ${lockedBy}` });
  }
  data = req.body;
  res.json({ message: 'Data saved successfully' });
});

app.post('/api/lock', (req, res) => {
  if (isLocked) {
    return res.status(423).json({ message: `Locked by ${lockedBy}` });
  }
  isLocked = true;
  lockedBy = req.body.user;
  res.json({ message: 'Locked successfully' });
});

app.post('/api/unlock', (req, res) => {
  if (!isLocked) {
    return res.status(400).json({ message: 'Not locked' });
  }
  if (lockedBy !== req.body.user) {
    return res.status(403).json({ message: `Cannot unlock, locked by ${lockedBy}` });
  }
  isLocked = false;
  lockedBy = '';
  res.json({ message: 'Unlocked successfully' });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
