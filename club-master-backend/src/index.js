import app from './app.js';

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`CLUB MASTER API → http://localhost:${PORT}`);
});
