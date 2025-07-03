import React, { useState } from 'react';
import { init, createElement } from '@airwallex/components-sdk';

function App() {
  const [initialized, setInitialized] = useState(false);
  const [balanceData, setBalanceData] = useState(null);



  const initializeAirwallex = async () => {
    if (initialized) return;

    const res = await fetch('http://localhost:5001/authorize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: 'user_123',
        connectedAccountId: 'acct_00FoImfvNpSvgbw5YGmSkA',
      }),
    });

    const { authCode, clientId, codeVerifier } = await res.json();

    await init({
      locale: 'en',
      env: 'demo',
      enabledElements: ['risk'],
      authCode,
      clientId,
      codeVerifier,
    });

    setInitialized(true);
  };


  const handleLaunchSCA = async () => {
    try {

      await initializeAirwallex();

      // const res = await fetch('http://localhost:5001/authorize', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     userId: 'user_123',
      //     connectedAccountId: 'acct_00FoImfvNpSvgbw5YGmSkA', // Use your demo connected account ID
      //   }),
      // });

      //const { authCode, clientId, codeVerifier } = await res.json();

      // await init({
      //   locale: 'en',
      //   env: 'demo',
      //   enabledElements: ['risk'],
      //   authCode,
      //   clientId,
      //   codeVerifier,
      // });

      const scaElement = await createElement('scaSetup', {
        userEmail: 'test@gmail.com',
        prefilledMobileInfo: {
          // countryCode: '44',
          // nationalNumber: '7123456789', // omit the leading 0
        },
      });

      await scaElement.mount('sca-setup-container');
      setInitialized(true);
    } catch (error) {
      console.error('Error during SCA setup:', error);
    }
  };

  const handleGetBalance = async () => {
    try {

      await initializeAirwallex();

      const res = await fetch('http://localhost:5001/get-balance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          connectedAccountId: 'acct_00FoImfvNpSvgbw5YGmSkA',
        }),
      });

      const result = await res.json();

      if (result.code === 'sca_token_missing') {
        const scaElement = await createElement('scaVerify', {
          userEmail: 'vagkavo1908@gmail.com',
          scaSessionCode: result.sca_session_code,
        });

        await scaElement.mount('sca-verify-container');

        scaElement.on('verificationSucceed', async ({ token: scaToken }) => {
          const verifiedRes = await fetch('http://localhost:5001/get-balance-verified', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              connectedAccountId: 'acct_00FoImfvNpSvgbw5YGmSkA',
              scaToken,
            }),
          });

          const verifiedData = await verifiedRes.json();
          setBalanceData(verifiedData.balance);
        });

        scaElement.on('verificationFailed', ({ reason }) => {
          console.error('SCA verification failed:', reason);
          alert('Verification failed. Please try again.');
        });

        scaElement.on('cancel', () => {
          console.warn('User canceled SCA verification.');
        });

        scaElement.on('error', (e) => {
          console.error('SCA error:', e);
          alert('Something went wrong. Please try again.');
        });

      } else {
        setBalanceData(result.balance);
      }

    } catch (err) {
      console.error('Error:', err);
    }
  };


  return (
    <div className="App">
      <h2>Airwallex SCA Setup (React)</h2>
      <button onClick={handleLaunchSCA}>Launch SCA Setup</button>
      <button onClick={handleGetBalance}>GET Balance</button>
      <div id="sca-setup-container" style={{ marginTop: 20 }} />
      <div id="sca-verify-container" style={{ marginTop: 20 }} />
      {balanceData && (
        <div style={{ marginTop: 20 }}>
          <h4>Balance Response:</h4>
          <pre style={{ background: '#f5f5f5', padding: 10 }}>
            {JSON.stringify(balanceData, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

export default App;
