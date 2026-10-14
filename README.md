# Tip Tracker

A small React Native (Expo) app for restaurant servers and their customers.

- **Customers** work out a fair tip using the South African norm (10-15%). No account needed. Each use leaves an
  anonymous record (bill, tip chosen, which display they saw) for the A/B analytics.
- **Servers** register or sign in, log the tips they receive (works offline), and see their tip history with totals.
- **Administrators** see how the two calculator displays compare (A/B analytics).

Built with Expo SDK 57, Firebase Authentication and Cloud Firestore.

## Run the app

You need Node.js 20.19 or newer and the Expo Go app on your phone.

1. Create a Firebase project at https://console.firebase.google.com.
2. **Authentication** > Sign-in method > enable **Email/Password**.
3. **Firestore Database** > Create database.
4. **Firestore Database > Rules** > paste the contents of `firestore.rules` > Publish.
5. **Project settings > Your apps** > add a **Web app** and copy the config values.
6. Copy `.env.example` to `.env` and paste the values in.
7. Install and start:

   ```
   npm install
   npx expo start
   ```

If you change `.env`, restart with `npx expo start -c`.

### Make an administrator

1. Register an account in the app.
2. In the Firebase console open Firestore > `users` > that user's document.
3. Change `role` from `server` to `admin`.

The Account screen then shows **View A/B analytics**. The app cannot grant this role itself; the security rules block it.

## Checks

```
npm test        # unit tests for tip maths and validation
npm run lint    # ESLint (Expo rules)
npm run format  # Prettier
```

## Screens

| Screen | Who | What it does |
| --- | --- | --- |
| Home | Everyone | Choose customer or server |
| Tip calculator | Customer | Bill + tip % = total to pay |
| Sign in / Create account / Reset password | Server | Email and password; a reset link by email |
| Log a tip | Server | Date, bill, tip received and party size; the tip % is worked out for you |
| Tip history | Server | All logged tips, newest first, with total and average. Delete an entry |
| Account | Server | Sync offline tips, sign out, or delete the account and all its tips |
| A/B analytics | Administrator | Compare the two calculator displays |

## Project structure

```
App.js                  Entry point: fonts and providers
firestore.rules         Database security rules
src/
  config/               Firebase set-up and constants
  theme/                Colours, spacing, fonts
  context/              Shared state: sign-in, tips, toast messages
  navigation/           Public stack and signed-in tabs
  services/             Firebase and local-storage calls (auth, users, tips, offline queue, calculator sessions)
  utils/                Pure logic: calculations, validation, dates, formatting
  components/           Reusable UI
  screens/              One file per screen
tests/                  Unit tests
```

## A/B test

Each customer is randomly shown one of two displays: **A** shows the tip choices as percentages only; **B** also
shows the rand amount under each choice and a line about the South African norm. When the customer taps Done,
one anonymous record is saved to `calculatorSessions`. The analytics screen compares the average tip chosen,
how often the suggested tip was kept, and the average bill for each display.

## Offline behaviour

- A tip logged without signal is saved on the phone and marked "Waiting to sync". It uploads automatically
  when the connection returns, or from **Sync now** on the Account screen.
- The last loaded tips are cached, so the history still opens offline.
- Deleting a synced tip needs a connection. Tips still waiting to sync can be deleted offline.

## Data

| Collection | Fields |
| --- | --- |
| `users` | name, email, role (`server` or `admin`), createdAt |
| `tipEntries` | userId, shiftDate, billAmount, tipAmount, partySize, tipPercentage, createdAt, synced |
| `calculatorSessions` | displayVariantId, billAmount, suggestedPercentage, selectedPercentage, createdAt |

The rules let a server read, write and delete only their own tips. Only administrators can read
`calculatorSessions`.
