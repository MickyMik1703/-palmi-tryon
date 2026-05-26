const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
const path = require('path');
const app = express();

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.static(path.join(__dirname)));

const FASHN_KEY = 'fa-mwdfHKC0aOZR-WwURC7zths1wG02NRwDyixOQ';

app.post('/api/run', async (req, res) => {
  const { model_image, garment_image } = req.body;
  if (!model_image || !garment_image) {
    return res.status(400).json({ error: 'Missing fields' });
  }
  try {
    const modelUrl = `data:image/jpeg;base64,${model_image}`;
    const garmentUrl = `data:image/jpeg;base64,${garment_image}`;
    const r = await fetch('https://api.fashn.ai/v1/run', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + FASHN_KEY
      },
      body: JSON.stringify({
        model_name: 'tryon-v1.6',
        inputs: { model_image: modelUrl, garment_image: garmentUrl }
      })
    });
    const data = await r.json();
    if (!r.ok) return res.status(r.status).json(data);
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/status/:id', async (req, res) => {
  try {
    const r = await fetch('https://api.fashn.ai/v1/status/' + req.params.id, {
      headers: { 'Authorization': 'Bearer ' + FASHN_KEY }
    });
    const data = await r.json();
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('PALMI Try-On Server running on port ' + PORT));
