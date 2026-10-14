# Tip Tracker

Mobile app for South African restaurant servers and customers.

- **Customers** work out a fair tip using the South African norm (10-15%). No account needed.
- **Servers** log tips after each shift, see their earnings trend and compare their average with the benchmark.
- **Administrators** recalculate the benchmark from anonymised tip data and view A/B results.

Built with React Native (Expo SDK 57), Firebase Authentication and Cloud Firestore.

## Run the app

You need Node.js 20.19 or newer (22 recommended) and the Expo Go app on your phone.

1. **Create a Firebase project** at https://console.firebase.google.com.
2. **Authentication** > Sign-in method > enable **Email/Password**.
3. **Firestore Database** > Create database (production mode).
4. **Firestore Database > Rules** > paste the contents of `firestore.rules` > Publish.
5. **Project settings > Your apps** > add a **Web app** > copy the config values.
6. Copy `.env.example` to `.env` and paste the values in.
7. Install and start:

   ```
   npm install
   npx expo start
   ```

8. Scan the QR code with Expo Go (Android) or the Camera app (iOS).

If you change `.env`, restart with `npx expo start -c`.

### Make an administrator

1. Register an account in the app.
2. In the Firebase console open Firestore > `users` > that user's document.
3. Change `role` from `server` to `admin`.

The Profile screen then shows the administrator tools. The app cannot grant this role itself; the security rules block it.

## Checks

```
npm test        # unit tests for tip maths and validation
npm run lint    # ESLint (Expo rules)
npm run format  # Prettier
```

## Project structure

```
App.js                  Entry point: fonts and providers
firestore.rules         Database security rules
src/
  config/               Firebase set-up and app constants
  theme/                Colours, spacing, fonts
  context/              Shared state: login, tips, feedback messages
  navigation/           Stack and tab navigators
  services/             All Firebase and local-storage calls
  utils/                Pure logic: calculations, validation, dates, formatting
  components/           Reusable UI: buttons, inputs, chart, dialogs
  screens/              One file per screen (auth/, server/, admin/)
tests/                  Unit tests
```

Screens never call Firebase directly. They call a service or a context, which keeps the UI, the logic and the data access separate.

## How the app meets Deliverable 4

| Requirement | Where |
| --- | --- |
| 1. Screen development | 12 working screens: Home, Tip calculator, Sign in, Create account, Reset password, Dashboard, Log a tip, Tip history, Edit entry, Profile, Benchmarks, A/B analytics. Shared `ScreenLayout`, `AppButton`, `AppInput` and `theme.js` keep the styling consistent with the wireframes. |
| 2. Authentication | `services/authService.js`: register, login, logout, password reset, delete account. Firebase hashes passwords and issues tokens. Server screens only exist for signed-in users (`navigation/RootNavigator.js`). |
| 3. Backend integration | Cloud Firestore through `services/`. `firestore.rules` limits each server to their own data. |
| 4. Core functionality (CRUD) | **Tip entries**: create (Log a tip), read (Dashboard, History), update and delete (Edit entry, History). **Profile**: create (register), read and update (Profile), delete (Delete my account). **Benchmarks** (administrator): create (Recalculate), read, update (Correct), delete. |
| 5. Navigation and routing | Native stack plus bottom tabs. Logging in or out swaps the whole stack, so the back button can never return to a screen the user should not see. |
| 6. UI feedback | Inline validation errors on every field, success and error messages, loading spinners on buttons, confirmation dialogs before deleting, offline banner, empty states. |
| 7. Code quality | Layered structure above, comments on every module and non-obvious function, ESLint and Prettier, unit tests. |

## Data model

Collections mirror the entities in the Deliverable 3 ERD.

| Collection | Fields |
| --- | --- |
| `restaurants` | name, address, active |
| `users` | restaurantId, name, email, role, createdAt |
| `tipEntries` | restaurantId, userId, shiftDate, shift, billAmount, tipAmount, partySize, tipPercentage, synced, createdAt |
| `benchmarks` | restaurantId, periodStart, periodEnd, averageTipPercentage, entryCount, calculatedAt, source |
| `calculatorSessions` | displayVariantId, billAmount, suggestedPercentage, selectedPercentage, createdAt |

## Differences from the design document

- **Firestore instead of a relational database behind a REST API.** Firebase is on the approved technology list and provides authentication and security rules without a separate server. The collections keep the same entities, fields and relationships as the ERD. Benchmark averages are calculated in the app (`calculateBenchmark`) rather than by SQL.
- **No `password_hash` field on users.** Firebase Authentication stores the hashed password, so the app never handles it.
- **`shift` and `entryCount` fields added.** `shift` is in the functional requirements and wireframe but was missing from the ERD. `entryCount` shows how many entries a benchmark is based on.
- **Display variants are defined in code** (`config/constants.js`) rather than in a table, because there are only two fixed variants.
- **Benchmark recalculation is started by an administrator** from the Benchmarks screen rather than on a timer.

## Offline behaviour

- A tip logged without signal is saved on the phone and marked "Waiting to sync". It uploads automatically when the connection returns.
- The last loaded entries and benchmark are cached, so the dashboard and calculator still open offline.
- Editing and deleting synced entries need a connection.
