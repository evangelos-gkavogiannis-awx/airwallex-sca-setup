import dotenv from 'dotenv';

import express from 'express';
import cors from 'cors';
import axios from 'axios';
import { generateCodeVerifier, generateCodeChallenge } from './utils/pkce.js';

dotenv.config();

const app = express();
const PORT = 5001;

app.use(cors());
app.use(express.json());

let cachedToken = null;
let tokenExpiry = null;

async function getAirwallexToken() {
  if (cachedToken && Date.now() < tokenExpiry) {
    return cachedToken;
  }

  const response = await axios.post(`${process.env.AIRWALLEX_BASE_URL}/api/v1/authentication/login`, null, {
    headers: {
      'x-client-id': process.env.AIRWALLEX_CLIENT_ID,
      'x-api-key': process.env.AIRWALLEX_API_KEY,
    },
  });

  cachedToken = response.data.token;
  tokenExpiry = new Date(response.data.expires_at).getTime() - 60 * 1000; // refresh 1 minute before expiry

  return cachedToken;
}

const token = await getAirwallexToken();


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
        identity: "test190813"
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
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

app.post('/get-balance', async (req, res) => {
  const { connectedAccountId } = req.body;

  try {
    const response = await axios.get(
      'https://api-demo.airwallex.com/api/v1/balances/current',
      {
        headers: {
          Authorization: `Bearer ${token}`, 
          'x-on-behalf-of': connectedAccountId,
        }
      }
    );

    res.json({ balance: response.data });
  } catch (error) {
    const errData = error.response?.data || {};
    console.error('SCA Triggered:', errData);

    if (errData.code === 'sca_token_missing') {
      const sessionCode = error.response.headers['x-sca-session-code'];
      res.json({
        code: 'sca_token_missing',
        sca_session_code: sessionCode
      });
    } else {
      res.status(500).json({ error: 'Failed to fetch balance' });
    }
  }
});

app.post('/get-balance-verified', async (req, res) => {
  const { connectedAccountId, scaToken, scaSessionCode } = req.body;

  try {
    const response = await axios.get(
      'https://api-demo.airwallex.com/api/v1/balances/current',
      {
        headers: {
          Authorization: `Bearer ${token}`, 
          'x-on-behalf-of': connectedAccountId,
          'x-sca-token': scaToken,
          'x-sca-session-code': scaSessionCode,
        }
      }
    );

    res.json({ balance: response.data });
  } catch (error) {
    console.error('Verified balance error:', error.response?.data || error.message);
    res.status(500).json({ error: 'SCA verification failed' });
  }
});


app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
