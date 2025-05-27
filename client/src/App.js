import React, { useState } from 'react';
import { init, createElement } from '@airwallex/components-sdk';

function App() {
  const [initialized, setInitialized] = useState(false);

  const handleLaunchSCA = async () => {
    try {
      const res = await fetch('http://localhost:5001/authorize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'user_123',
          connectedAccountId: 'acct_eDWgRsz1PB2U4_TcLsKTzw', // Use your demo connected account ID
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

      const scaElement = await createElement('scaSetup', {
        userEmail: 'user@example.com',
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

  return (
    <div className="App">
      <h2>Airwallex SCA Setup (React)</h2>
      <button onClick={handleLaunchSCA}>Launch SCA Setup</button>
      <div id="sca-setup-container" style={{ marginTop: 20 }} />
    </div>
  );
}

export default App;
