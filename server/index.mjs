import express from 'express';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

const NVIDIA_API_URL = 'https://integrate.api.nvidia.com/v1/chat/completions';

// Simple proxy endpoint that forwards POST bodies to NVIDIA Integrate
app.post('/api/ai', async (req, res) => {
  try {
    const apiKey = process.env.VITE_NVIDIA_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'Server missing NVIDIA API key (VITE_NVIDIA_API_KEY) in environment.' });
    }

    const upstream = await fetch(NVIDIA_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
        Accept: 'text/event-stream',
      },
      body: JSON.stringify(req.body),
    });

    // Pass through status and headers (at least content-type)
    res.status(upstream.status);
    const contentType = upstream.headers.get('content-type');
    if (contentType) res.setHeader('Content-Type', contentType);

    // Stream response body back to client
    if (!upstream.body) {
      const text = await upstream.text().catch(() => '');
      return res.send(text);
    }

    // upstream.body is a WHATWG ReadableStream in Node >=18; read and pipe
    const reader = upstream.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      res.write(decoder.decode(value));
    }

    res.end();
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[proxy] Error forwarding request:', err);
    res.status(502).json({ error: 'Bad gateway when contacting NVIDIA API' });
  }
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`[proxy] Listening on http://localhost:${PORT}`);
});
