**HW4: Testing**

**Part 2 — Tests Implemented + Report**

2.3 Tests by category

Last updated: 2026-06-02 (commit 44d425d)

|Category|Count|Examples|
|--------|-----|---------|
|Unit|9|hashPassword() produces a hash different from the plaintext input & haversine distance between the same point returns 0|
|Integration|10|POST /api/auth/register with valid data returns 200 + token & GET /api/profile/:userId returns correct user data|

2.4 Where the tests live + how to run them

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

bash

git clone https://github.com/ssjing-pixel/IN4MATX43-Project.git

cd IN4MATX43-Project

git checkout claude/loving-cray-aKudC

cd server

npm install

npm test

|Category|Time|Where It Runs|
|--------|----|-------------|
|Unit|~3s|Local + CI|
|Integration|~5s|Local + CI|

2.5 Coverage achieved

Last updated: 2026-06-02 (commit 44d425d)

|Test Type|Coverage|Coverage %|
|--------|-------|-------------|
|Unit|Jest --coverage|100%|
|Integration|Jest --coverage|62.26%|
|Combined|Merged Report|74.05% statements, 33.89% branches, 59.09% functions, 80.84% lines|

routes/location.ts is only 15% covered as it requires pre-seeded geographic location data and is better fit for end-to-end tests; however, Its core distance calculation is 100% covered by unit tests. routes/friends.ts and routes/chat.ts are not covered because they require two users interacting simultaneously, which needs more complex multi-session test fixtures. Branch coverage is low because many error-handling paths (missing fields, DB errors) aren't hit in every test case.

2.6 Plan-vs-implementation gap

|What the Plan Called for|What you Actually Shipped|What Blocked you/What you'd Add Next|
|-------------|-------|------------------|
|Unit tests for React frontend components using Vitest and React Testing Library|Not shipped|The frontend is a Vite/React app and the plan called for Vitest, but setting up React Testing Library with jsdom for component-level tests required more configuration time than available. We would test the interest selection limit and onboarding form validation next if possible|
|Unit and integration tests for all Node.js backend routes using Jest|Shipped unit tests for auth helpers and distance utility and integration tests for auth, profile, missions, and location routes|friends.ts and chat.ts routes were not covered because they require two authenticated users interacting simultaneously, which needs a more complex multi-session test setup. This would be added next with more time|
|WebSocket integration tests using a ws test client + Jest to verify real-time message delivery|Not shipped|Socket.io tests require a locally spun-up WebSocket server with a connected client. The chat request state machine was identified as high-priority in the plan but can not be tested without this infrastructure|
|SQLite in-memory database integration tests for queries, constraints, and data integrity|Shipped as all integration tests use an in-memory SQLite database reset before each suite|N/A — implemented as planned|
|Light load test for concurrent location updates using k6 or a custom script|Not shipped|We would simulate multiple users sending location pings simultaneously to surface race conditions the unit tests cannot catch but had little time to complete|
|Invisible mode integration test verifying users with visible=false are excluded from all map results|Not shipped|We would add a test that sets a user invisible, posts a nearby location, and asserts they do not appear in any other user's /api/nearby response|
