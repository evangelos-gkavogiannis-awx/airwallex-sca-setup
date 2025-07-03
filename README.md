Demo implementation of the [SCA setup element](https://www.airwallex.com/docs/js/sca/sca-setup/) and [SCA verify element](https://www.airwallex.com/docs/js/sca/sca-verify/)

In this implementation we handle `scaSetup` and `scaVerify` as separate components.
We usually recommend launching the `scaSetup` flow right after a user finishes onboarding. This helps them set up strong authentication early and makes the whole experience more secure and smooth.


How to run the app:
- Use a platform with SCA enabled and an EU/UK connected account (prerequisites to trigger SCA)
- update the `.env` file with you `client-id` and `api-key`
- update the `app.js` with your `connectedAccountId` wherever is needed
- `cd server` --> `npm install` and `node server.js` --> backend will run in port `5001`
- `cd client`--> `npm install` and `npm start` --> frontend will run in port `3000`
- Go to `http://localhost:3000/`


Simple explanation of the the implementation
1. You launch your app
- Go to `http://localhost:3000`
- This loads your React app with 2 buttons: `"Launch SCA Setup" `and `"GET Balance"`

2. You click "Launch SCA Setup"
- The app calls your backend (`localhost:5001/authorize`)
- The backend fetches an Airwallex OAuth2 auth code using a secure token
- The frontend initializes the `Airwallex SDK` using this auth code
- Then it mounts the SCA Setup UI so the user can enter their phone number and complete verification

3. You click "GET Balance"
- The app calls the backend (`localhost:5001/get-balance`)
- If SCA is not required, it immediately returns the account balance and shows it on screen


4. If SCA is required
- The API responds with `sca_token_missing`
- The app mounts the SCA Verify UI (OTP input)
- The user enters the OTP
- On success: The app gets a scaToken --> Sends it to your backend at `/get-balance-verified` --> That API fetches the balance again — now authenticated with the scaToken --> The balance is shown in the UI








