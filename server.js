const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
const path = require('path');
const app = express();

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.static(path.join(__dirname)));

app.post('/api/run', async (req, res) => {
  const { fashn_key, model_image, garment_image } = req.body;
  if (!fashn_key || !model_image || !garment_image) {
    return res.status(400).json({ error: 'Missing fields' });
  }
  try {
    const modelUrl = `data:image/jpeg;base64,${model_image}`;
    const garmentUrl = `data:image/jpeg;base64,${garment_image}`;
    const r = await fetch('https://api.fashn.ai/v1/run', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + fashn_key
      },
      body: JSON.stringify({
        model_name: 'tryon-v1.6',
        inputs: {
          model_image: modelUrl,
          garment_image: garmentUrl,
          num_inference_steps: 50,
          guidance_scale: 2.5
        }
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
  const { fashn_key } = req.query;
  if (!fashn_key) return res.status(400).json({ error: 'Missing key' });
  try {
    const r = await fetch('https://api.fashn.ai/v1/status/' + req.params.id, {
      headers: { 'Authorization': 'Bearer ' + fashn_key }
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
