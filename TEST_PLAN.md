**Test plan (Strategic)**

This is CommonGround’s overarching quality strategy. The plan describes what we ideally want to test across all components of the system, even where the implementation may not reach everything described here.

**1.1 Scope: what's in, what's out (and why)**

|In scope|Why This Matters|
|---|---|
|User signup and login|This is the entry point for all users and touches every layer of the stack, so a bug here makes the entire app inaccessible.|
|Onboarding quiz (interest selection, 1-10 limit)|Interest data drives the core matching logic, and the Figma enforces a hard cap of 10 interests with a warning banner, making correctness essential.|
|Discovery range slider (default 2 miles)|This setting controls which users appear on the map, so an incorrect range calculation would silently show the wrong people.|
|Visible on Map toggle (invisible mode)|This is a privacy guarantee, not a cosmetic feature, so a bug here exposes a user’s location against their explicit choice.|
|User profile (display name, About Me, interests, avatar)|Profile data is displayed to other users, so validation failures here directly affect matching accuracy and user trust.|
|Map display (nearby user pins, own location pin)|This is the core Home screen experience that users interact with most, making it the highest-visibility feature to get right.|
|Interest filtering on map|Incorrect filtering silently shows wrong users on the map, which users may never notice but which breaks the core value of the app.|
|Chat request flow (send, accept, decline)|This feature involves multiple steps, so if one part fails, the chat may stop working correctly and users might not be able to reconnect.|
|Real-time messaging (WebSocket)|Chat depends on persistent WebSocket connections, so message loss or latency directly and visibly degrades the user experience.|
|Missions system (progress, completion, points)|Points must be awarded exactly once per mission, and any double-awarding or missed completion is a data integrity bug.|
|Friends list (online status, shared interests, nearby label)|Incorrect status or interest tags on the Friends screen can lead users to make incorrect social decisions based on inaccurate information.|
|Backend API endpoints (all HTTP routes)|All routes must validate inputs and return correct status codes to prevent silent data corruption or unhandled crashes.|
|SQLite database operations|This is the actual database in use after replacing MongoDB, so its correctness underpins every feature in the app.|

|Out of scope|Why Excluded|
|---|---|
|Leaflet.js map tile rendering|This is a third-party library with its own test suite, so we mock its output and test only our own business logic.|
|Google/ Facebook/ Instagram OAuth login|These are third-party authentication services that we cannot control, so we mock their responses rather than testing them directly.|
|Browser compatibility (Safari, Firefox)|Only Chrome is officially supported for this release due to time constraints, and this decision is documented.|
|Mobile native app behavior|CommonGround is a web app only, so native app testing does not apply to this project.|
|Email delivery/ external push notifications|No external email service is integrated in the current version, making this out of scope by default.|
|Admin dashboard or moderation tools|These tools are not part of the current feature set and were never in scope for this release.|
|Accessibility/ screen reader compliance|This is noted as a future area for improvement and has been excluded from this release due to time constraints.|
|“Refer Us to Friends” referral banner|This is a marketing feature visible in the Figma Friends screen but not a core functional requirement for this release.|

**1.2 Quality Goals - What does "good enough" look like?**
- No critical bugs in the signup, login, or onboarding flows
- Onboarding enforces the 1-10 interest limit with a warning banner on the 11th selection
- Discovery range slider setting is correctly applied by the backend when filtering nearby users
- Invisible mode reliably excludes the user from all other users’ map results
- Chat request flow completes successfully in the happy path with zero unhandled errors
- Interest filtering returns only users who match all selected tags with no false positives
- Missions system awards points exactly once per completed mission, including after an offline reconnect
- User location coordinates are never permanently stored in the database
- All backend API endpoints return appropriate HTTP status codes (200, 400, 404, 500) for both valid and invalid inputs
- Unit test coverage of at least 50% on backend utility and logic functions
- All integration tests pass on a fresh clone with a seeded test database

**1.3 Risks & Priorities - Where are bugs most likely or most costly?**

|Area|Why it's risky/costly|Priority (H/M/L)|
|---|---|---|
|Invisible mode leaking location data|A user who enabled invisible mode explicitly opted out of being discovered, so any location exposure is a direct privacy violation that destroys user trust.|H|
|Duplicate user registration (concurrent race condition)|Concurrent signups could create duplicate accounts with the same username, corrupting the matching data that the entire app depends on.|H|
|Chat request state machine (pending → accepted/declined)|This chat feature depends on several WebSocket steps, and if one transition is missed, the chat channel can break with no easy way to recover.|H|
|Interest matching logic (range + tag intersection)|Incorrect matching silently shows the wrong users on the map, which is the core value of the app and something users may never notice is broken.|H|
|Mission double-awarding on reconnect|The spec explicitly handles offline reconnection scenarios, so awarding points twice in that case is a data integrity bug that undermines the missions system.|M|
|WebSocket disconnection|Real-time chat depends on persistent connections, so unhandled drops leave users stuck in a broken chat state with no feedback.|M|
|Profile field validation (character limits, required fields)|Missing or oversized inputs such as an empty display name or an oversized bio can crash the backend or silently corrupt profile data.|M|
|Onboarding interest limit bypass at the API level|The frontend enforces the 10-interest maximum, but without server-side validation the limit can be bypassed by sending a direct API request.|M|
|Onboarding flow failing midway|If onboarding fails silently at any step, the user is left without a profile and cannot use any feature of the app.|M|
|Friends leaderboard returning incorrect rankings|Wrong rankings reduce trust in the social layer of the app, though the data can be corrected without permanent damage.|L|
|Map page UI layout/ cosmetic issues|Visual issues on the map do not affect any underlying data or functionality and are immediately visible to users who can report them.|L|
|Scrolling/ pagination on long friends lists|At the current small scale, this has minimal user impact and can be fixed without touching any core logic.|L|

**1.4 Strategy - Test types and approach per component**

**Definitions:**
- Unit test: A test that checks one function or module by itself, while replacing things like the database, network, or other modules with mocks or stubs to make sure the code works correctly on its own.
- Integration test: A test that checks whether multiple components work correctly together, such as an API route connecting to a test database, to make sure different parts of the system communicate properly.

**Test strategy by component**
|Component|Test types you'll apply|Framework|Why This Fits|
|---|---|---|---|
|React frontend (components, forms, UI state)|Unit|Vitest + React Testing Library|Vitest is native to Vite projects with zero config overhead; React Testing Library tests components the way real users interact with them, not internal implementation details|
|Node.js backend (route handlers, business logic, utility functions)|Unit, Integration|Vitest or Jest|Both integrate cleanly with Node.js; Jest has the largest ecosystem of mocking utilities for isolating complex dependencies like database calls|
|SQLite database (queries, constraints, data integrity)|Integration|Better-SQLite3 in-memory DB + Jest/Vitest|In-memory SQLite runs real queries against a fresh database on every test run without leaving side effects or requiring a running database server|
|WebSocket/ real-time messaging|Integration|Ws test client + Jest|Testing real WebSocket connections end-to-end helps confirm that real-time chat messages are delivered properly, not just that the chat logic works by itself.|
|Cross-cutting: concurrent location updates|Light load test (manual or scripted)|Custom script or k6 (time permitting)|Simulates multiple users sending location pings simultaneously to surface race conditions that unit tests cannot catch|

**1.5 Environment & Assumptions**
- Tests assume a Node.js 20 runtime on the backend.
- Frontend tests assume a jsdom browser environment (provided automatically by Vitest/ Jest).
- The tests use an in-memory SQLite database that is reset before each test suite, so each test runs independently without shared data from other tests.
- The production database is never touched during testing.
- Leaflet.js is mocked in all tests, so the tests focus on our own application logic instead of third-party map rendering.
- Google, Facebook, and Instagram OAuth responses are mocked in tests, so the system does not rely on live third-party authentication services.
- WebSocket integration tests use a locally spun-up test server, not any cloud deployment.
- Test data like users, interests, and chat messages is generated separately for each test run and cleaned up afterward, so no persistent fixtures are shared between tests.
- CI testing runs on Ubuntu through GitHub Actions, while local development is done on team members’ own macOS or Windows machines.
- The test suite can run on a fresh project clone without needing any local secrets or machine-specific configuration files.

**1.6 Team Roles**
|Member|Owns which test categories/ components|
|---|---|
|Xinchang Tong|Test plan document (part1): overall quality strategy, scope definition, risk analysis, and test approach|
|Elaine Kao|Test implementation (part2): writing and running unit and integration tests, generating the coverage report|
|Gisele Dao|Website implementation: building and running the prototype (Leaflet.js, SQLite) that the test suite runs against|
|Stephanie Jing|Reflection (Part 3): post-implementation reflection on bugs caught, hardest things to test, and next steps|

**Reflection**

**What did your tests catch that you missed before?**

The integration tests caught a real bug in the missions system. When triggered on a fresh in-memory database without the correct pre-seeded state, the endpoint awarded points incorrectly. This wasn’t visible during manual testing because the development database already has the right seed data. The test’s clean-slate setup exposed that the route was implicitly depending on existing rows, which is a data integrity bug invisible in production until a user hit the edge case.

**What was hardest to test, and why?**

The hardest components were friends.ts and chats.ts, for a structural reason. Both require two authenticated users interacting simultaneously. Simulating a second user accepting a chat request requires either parallel test clients or a mock that accurately represents a second session’s state machine. Socket.io tests depend on persistent connections, so without that infrastructure the chat state transitions (pending → accepted → active) flagged as highest-priority in the plan were never exercised.

**What test would you add next?**

The invisible mode test. It was rated the highest-priority risk in the strategic plan and is mechanically straightforward: set visible = false, POST a location update, call /api/nearby as a second user, and assert the invisible user doesn’t appear. The fact that this wasn’t shipped despite being explicitly planned makes it the clearest gap.

**Where did Claude help and where did it get things wrong?**

Claude was most useful for scaffolding quickly like generating the testApp.ts helper, in-memory SQLite setup, and boilerplate for auth and profile tests. Where it fell short was understanding runtime coupling. It would produce tests that looked correct but assumed routes were stateless when they depended on session middleware. Those required reading the actual implementation to debug, which Claude couldn’t do without full file context.


**Part 2 — Tests Implemented + Report**

**2.3 Tests by category**

Last updated: 2026-06-02 (commit 44d425d)

|Category|Count|Examples|
|--------|-----|---------|
|Unit|9|hashPassword() produces a hash different from the plaintext input & haversine distance between the same point returns 0|
|Integration|10|POST /api/auth/register with valid data returns 200 + token & GET /api/profile/:userId returns correct user data|

**2.4 Where the tests live + how to run them**

```
server/
  tests/
    unit/
      auth.unit.test.ts
      location.unit.test.ts
    integration/
      auth.integration.test.ts
      profile.integration.test.ts
      missions.integration.test.ts
    helpers/
      testApp.ts
```

```
bash
git clone https://github.com/ssjing-pixel/IN4MATX43-Project.git
cd IN4MATX43-Project
git checkout claude/loving-cray-aKudC
cd server
npm install
npm test
```

|Category|Time|Where It Runs|
|--------|----|-------------|
|Unit|~3s|Local + CI|
|Integration|~5s|Local + CI|

**2.5 Coverage achieved**

Last updated: 2026-06-02 (commit 44d425d)

|Test Type|Coverage|Coverage %|
|--------|-------|-------------|
|Unit|Jest --coverage|100%|
|Integration|Jest --coverage|62.26%|
|Combined|Merged Report|74.05% statements, 33.89% branches, 59.09% functions, 80.84% lines|

routes/location.ts is only 15% covered as it requires pre-seeded geographic location data and is better fit for end-to-end tests; however, Its core distance calculation is 100% covered by unit tests. routes/friends.ts and routes/chat.ts are not covered because they require two users interacting simultaneously, which needs more complex multi-session test fixtures. Branch coverage is low because many error-handling paths (missing fields, DB errors) aren't hit in every test case.

**2.6 Plan-vs-implementation gap**

|What the Plan Called for|What you Actually Shipped|What Blocked you/What you'd Add Next|
|-------------|-------|------------------|
|Unit tests for React frontend components using Vitest and React Testing Library|Not shipped|The frontend is a Vite/React app and the plan called for Vitest, but setting up React Testing Library with jsdom for component-level tests required more configuration time than available. We would test the interest selection limit and onboarding form validation next if possible|
|Unit and integration tests for all Node.js backend routes using Jest|Shipped unit tests for auth helpers and distance utility and integration tests for auth, profile, missions, and location routes|friends.ts and chat.ts routes were not covered because they require two authenticated users interacting simultaneously, which needs a more complex multi-session test setup. This would be added next with more time|
|WebSocket integration tests using a ws test client + Jest to verify real-time message delivery|Not shipped|Socket.io tests require a locally spun-up WebSocket server with a connected client. The chat request state machine was identified as high-priority in the plan but can not be tested without this infrastructure|
|SQLite in-memory database integration tests for queries, constraints, and data integrity|Shipped as all integration tests use an in-memory SQLite database reset before each suite|N/A — implemented as planned|
|Light load test for concurrent location updates using k6 or a custom script|Not shipped|We would simulate multiple users sending location pings simultaneously to surface race conditions the unit tests cannot catch but had little time to complete|
|Invisible mode integration test verifying users with visible=false are excluded from all map results|Not shipped|We would add a test that sets a user invisible, posts a nearby location, and asserts they do not appear in any other user's /api/nearby response|

