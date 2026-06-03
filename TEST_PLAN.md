**Reflection**


**What did your tests catch that you missed before?**

The integration tests caught a real bug in the missions system. When triggered on a fresh in-memory database without the correct pre-seeded state, the endpoint awarded points incorrectly. This wasn’t visible during manual testing because the development database already has the right seed data. The test’s clean-slate setup exposed that the route was implicitly depending on existing rows, which is a data integrity bug invisible in production until a user hit the edge case.


**What was hardest to test, and why?**

The hardest components were friends.ts and chats.ts, for a structural reason. Both require two authenticated users interacting simultaneously. Simulating a second user accepting a chat request requires either parallel test clients or a mock that accurately represents a second session’s state machine. Socket.io tests depend on persistent connections, so without that infrastructure the chat state transitions (pending → accepted → active) flagged as highest-priority in the plan were never exercised.


**What test would you add next?**

The invisible mode test. It was rated the highest-priority risk in the strategic plan and is mechanically straightforward: set visible = false, POST a location update, call /api/nearby as a second user, and assert the invisible user doesn’t appear. The fact that this wasn’t shipped despite being explicitly planned makes it the clearest gap.


**Where did Claude help and where did it get things wrong?**

Claude was most useful for scaffolding quickly like generating the testApp.ts helper, in-memory SQLite setup, and boilerplate for auth and profile tests. Where it fell short was understanding runtime coupling. It would produce tests that looked correct but assumed routes were stateless when they depended on session middleware. Those required reading the actual implementation to debug, which Claude couldn’t do without full file context.

