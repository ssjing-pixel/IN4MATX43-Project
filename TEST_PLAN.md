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








**Reflection**


**What did your tests catch that you missed before?**

The integration tests caught a real bug in the missions system. When triggered on a fresh in-memory database without the correct pre-seeded state, the endpoint awarded points incorrectly. This wasn’t visible during manual testing because the development database already has the right seed data. The test’s clean-slate setup exposed that the route was implicitly depending on existing rows, which is a data integrity bug invisible in production until a user hit the edge case.


**What was hardest to test, and why?**

The hardest components were friends.ts and chats.ts, for a structural reason. Both require two authenticated users interacting simultaneously. Simulating a second user accepting a chat request requires either parallel test clients or a mock that accurately represents a second session’s state machine. Socket.io tests depend on persistent connections, so without that infrastructure the chat state transitions (pending → accepted → active) flagged as highest-priority in the plan were never exercised.


**What test would you add next?**

The invisible mode test. It was rated the highest-priority risk in the strategic plan and is mechanically straightforward: set visible = false, POST a location update, call /api/nearby as a second user, and assert the invisible user doesn’t appear. The fact that this wasn’t shipped despite being explicitly planned makes it the clearest gap.


**Where did Claude help and where did it get things wrong?**

Claude was most useful for scaffolding quickly like generating the testApp.ts helper, in-memory SQLite setup, and boilerplate for auth and profile tests. Where it fell short was understanding runtime coupling. It would produce tests that looked correct but assumed routes were stateless when they depended on session middleware. Those required reading the actual implementation to debug, which Claude couldn’t do without full file context.

