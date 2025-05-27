import express from 'express';
import cors from 'cors';
import axios from 'axios';
import { generateCodeVerifier, generateCodeChallenge } from './utils/pkce.js';

const app = express();
const PORT = 5001;

app.use(cors());
app.use(express.json());

app.post('/authorize', async (req, res) => {
  const { userId, connectedAccountId } = req.body;

  const codeVerifier = generateCodeVerifier();
  const codeChallenge = generateCodeChallenge(codeVerifier);

  try {
    const response = await axios.post(
      'https://api-demo.airwallex.com/api/v1/authentication/authorize',
      {
        code_challenge: codeChallenge,
        scope: ['w:awx_action:sca_edit', 'r:awx_action:sca_view'],
        identity: userId
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer eyJhbGciOiJIUzI1NiJ9.eyJ0eXBlIjoiY2xpZW50IiwiZGMiOiJISyIsImRhdGFfY2VudGVyX3JlZ2lvbiI6IkhLIiwiaXNzZGMiOiJVUyIsImp0aSI6IjZlZTEwMjE2LWI0NDAtNDk4Zi1hMzRiLTNlMzZiZjBlOGE5YyIsInN1YiI6ImY5MjE5NTMwLTFhNzAtNDlkMy05ZjMzLTBlYzljNjBiNzlmMiIsImlhdCI6MTc0ODM3NzA5MCwiZXhwIjoxNzQ4Mzc4ODkwLCJhY2NvdW50X2lkIjoiMjZjNmNmNGEtMWVhZC00YjM0LWI2MWEtNDEwNTE2ODBiZGU4IiwiYXBpX3ZlcnNpb24iOiIyMDI0LTA5LTI3IiwicGVybWlzc2lvbnMiOlsicjphd3g6KjoqIiwidzphd3g6KjoqIl19.vOwBHd4VI-TYhu-3rfBeT7rYZqPnGqF-qlI5rNqc5b0`,
          'x-on-behalf-of': connectedAccountId
        }
      }
    );

    const { authorization_code } = response.data;

    res.json({
      authCode: authorization_code,
      clientId: '-SGVMBpwSdOfMw7Jxgt58g',
      codeVerifier
    });
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).json({ error: 'Authorization failed' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
