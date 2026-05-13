**CommonGround Architecture**


**Platforms**

Our frontend will run on web browsers like Google Chrome, Safari, etc. and it’s framework will use React running within a Node.js development environment. The benefit of a website-based fronten is accessibility; almost every device has access to the internet and a website and our product doesn’t require downloading of any type as an app would. The tradeoff is that websites have less access to device hardware compared to apps and sometimes browser-based geolocation is less accurate. However, we hope to combat this with our use of the Google Maps API, which is industry standard and one of the best geolocation programs.

The backend server will run on cloud infrastructure such as AWS EC2, AWS Elastic Beanstalk, or Google Cloud Platform using a Node.js runtime environment. The benefit of using cloud infrastructure is that it is extremely scalable, aka it can handle the future potential growth of our user base. Moreover, it has a level of built-in security and efficiency. The tradeoff is that cloud hosting means overhead costs on the host platform and potentially more hoops to jump through to deploy our product.

The database system will run on a cloud database management platform such as MongoDB Atlas or Firebase Firestore that uses SQL. The cloud database has benefits like automatic backups to the cloud, which means less manual saving/backup implementation on our part. Similarly to the backend cloud infrastructure, the cloud database also creates scalability in the case that our users increase. Cloud databases also have automatic maintenance. Some tradeoffs is that we have less control over database’s behind the scenes infrastructure and implementation and there may potentially be costs using a cloud database.

The messaging system will run on WebSocket-compatible cloud servers. The benefit of these servers is that they facilitate client-server connections with live chat and notifications. These features are intuitive and helpful for our users. The tradeoff is that these cloud servers have continuous socket connections which consume more server resources than HTTP requests.


**Programming Languages**

The frontend portion of our app will use React and TypeScript. This allows users to interact with the map, live chat, and interest grid directly in their browser without full page reloads.

Benefits:
- CommonGround's UI sections (map, chat, profile, missions, etc.) can be built and tested independently and composed together
- Almost every device with an internet connection can reach it, and users do not need to download or install anything as they would with an app
- React's virtual DOM efficiently re-renders only the parts of the UI that change, which is important for a live map that updates user pins every 30 seconds without changing the entire page
- TypeScript catches data shape mismatches at compile time
- Many libraries like Leaflet.js or Google Maps React handle the map layer, Socket.IO handles real-time chat, and component libraries like shadcn/ui accelerate building the interest grid and profile forms

Trade offs:
- React's flexibility means architectural decisions must be made deliberately. If organized poorly, React’s codebase becomes difficult to maintain 
- TypeScript is difficult if we are not familiar with it. Plain JavaScript is faster to start with but increases the risk of runtime bugs as the codebase grows.
- Heavy reliance on client-side rendering can hurt initial load performance on slower mobile connections
- Websites have less access to device hardware compared to apps, which can limit certain capabilities and make the experience feel less integrated with the user's device
- Browser-based location is sometimes less accurate than native app location services. We intend to mitigate this with the Google Maps API

The backend of the website will run on cloud infrastructure such as AWS EC2, AWS Elastic Beanstalk, or Google Cloud Platform using a Node.js runtime environment.

Benefits:
- Cloud infrastructure is highly scalable. As CommonGround's user base grows beyond UCI, the backend can be scaled up to handle increased load without a fundamental architectural change
- Cloud platforms provide built-in security features and reliability guarantees such as uptime SLAs, distributed access, automatic failovers, that would be difficult and time-consuming for a student team to replicate on self-hosted infrastructure
- Node.js is event-driven and non-blocking, making it well-suited to CommonGround's two most demanding backend tasks: handling many simultaneous - WebSocket connections for real-time chat, and processing frequent location updates from many active users concurrently
- Using JavaScript on both the frontend (React) and backend (Node.js) allows us to share type definitions, utility functions, and data models across both layers, reducing duplication and the risk of frontend and backend having mismatched assumptions about data shapes

Trade offs:
- Cloud hosting introduces deployment complexity. Environment variables, networking configuration, and service integration all require careful setup and ongoing maintenance that a local server would not
- Cloud infrastructure carries ongoing hosting costs that will increase as the user base and data volume grow, which is a meaningful consideration for a student team operating without a budget

The database runs on a managed cloud database platform such as MongoDB Atlas or Firebase Firestore (NoSQL).

Benefits:
- Managed cloud databases provide automatic backups, built-in scaling, and easier maintenance
- Both MongoDB Atlas and Firebase Firestore have generous free tiers appropriate for a UCI-scoped launch and scale automatically as data volume grows
- NoSQL document models can be flexible during early development when the data schema is still evolving 

Trade-offs:
- NoSQL databases provide less rigid structure compared to traditional relational SQL systems, which means data consistency and relationship integrity must be enforced at the application level rather than by the database itself. For CommonGround, this is particularly relevant for the 
- The relationship between users, tags, and matches would not be linked or enforced automatically

The real-time communication system runs on WebSocket which is compatible cloud servers, enabling persistent client-server connections for live chat and map updates.

Benefits:
- WebSockets maintain a persistent bidirectional connection between the browser and the server, allowing the server to push new messages and location updates to the client instantly rather than waiting for the client to repeatedly poll for changes.
- This directly supports CommonGround's two most latency-sensitive features: chat message delivery and live map pin updates, both of which would feel slow or unreliable over standard HTTP request-response cycles.

Trade-offs:
- Persistent socket connections consume significantly more resources than standard HTTP requests


**Communication Protocols**

Describe what messages need to be sent and/or requested from each component or part of the system to other components or parts of the system. Define how those messages will be sent (e.g., HTTP requests, remote procedure calls (RPC), TCP sockets, UDP sockets). 

The CommonGround system consists of two primary components: the Frontend (web browser client) and the Backend Server (cloud-based API and database). Communication between these components uses HTTP requests for standard data operations and WebSockets for real-time features. RPC, TCP sockets, and UDP sockets were considered but not adopted, as HTTP and WebSocket provide sufficient functionality for a web-based application while offering higher-level abstractions that simplify development.

Onboarding quiz:
- Frontend → Backend Server
- Protocol: HTTP POST
- Trigger: User completes interest selection and taps “Continue.”
- When a new user completes the onboarding quiz, the Frontend requests the Backend to store the user’s chosen display name, optional profile photo, and list of selected interest tags (minimum 1, maximum 10). The Backend responds with a confirmation that the user profile has been created and the system is ready to begin matching.

User Profile&Bio:
- Frontend → Backend Server
- Protocol: HTTP PUT
- Trigger: User saves or updates their profile/bio
- When a user saves or updates their profile, the Frontend sends an HTTP PUT request to the Backend containing the user’s ID, display name, bio text, optional profile picture URL, and optional age. The Backend validates the inputs, for example, checking that required fields are present and that the bio does not exceed the character limit, and responds with a confirmation that the profile has been saved. If validation fails, the backend responds with an error message indicating which fields need to be corrected.

Range (Location Updates):
- Frontend → Backend Server
- Protocol: HTTP POST
- Trigger: Every 30s when user has location sharing enabled
- Every 30s while the user has location sharing enabled, the Frontend sends the user’s current GPS coordinates and visibility status (visible or invisible) to the Backend. The Backend uses this data to determine which other users fall within the requesting user’s configured range and share at least one interest. It responds with a list of matched nearby users. If the user is set to invisible, their location is not included in any other user’s results. Location data is not permanently stored on the server.

User-Defined Filtering:
- Fronted → Backend Server
- Protocol: HTTP GET
- Trigger: User applies ot updates interest filters on the map
- When a user applies or changes their interest filters on the map, the Frontend requests the Backend to return only those nearby users who match all of the selected filter interests within the user’s set range. The Backend responds with a filtered list of matching users. If no users match the criteria, the Backend includes a notification flag so the Frontend can prompt the user to adjust their filters.

Chat:

A. Sending a chat request
- Frontend → Backend Server
- Protocol: HTTP POST
- Trigger: User A sends a chat request  to User B
- When a user sends a request to another user, the Frontend sends the sender’s IP and the receiver’s ID to the Backend. The Backend records the pending request and responds with a request ID and a pending status. The receiver is notified of the incoming request.

B. Accepting or declining a chat request
- Frontend → Backend Server
- Protocol: HTTP PUT
- Trigger: User B accepts or declines the request
- When a user responds to a chat request, the Frontend sends the request ID and the user’s action (accept/decline) to the Backend. If accepted, the Backend creates a new chat channel and responds with the channel ID. If declined, the Backend updates the request status and no chat channel is created.

C. Real-time messaging 
- Frontend → Backend Chat Service
- Protocol: WebSocket
- Trigger: Chat channel is open, user sends a message
Once a chat channel is open, messages are sent and received via WebSocket, which maintains a persistent two-way connection between the Frontend and the Backend Chat Service. Each message contains the chat channel ID, the sender’s user ID, the message text, and a timestamp. WebSocket is used here instead of HTTP because it allows real-time, low-latency delivery without the need for repeated polling.

Missions:

A. Fetching Mission Status
- Frontend → Backend Server
- Protocol: HTTP GET
- Trigger: User opens the Mission page
- When a user navigates to the Mission page, the Frontend requests the Backend to return the user’s current mission list. The Backend responds with each mission’s title, progress, completion status, and points awarded, along with the user’s total accumulated points.

B. Mission Completion Notification
- Backend Server → Frontend
- Protocol: WebSocket
- Trigger: Backend detects a mission condition has been met
- When the Backend detects that a user has met the conditions for a mission, it immediately pushes a notification to the Frontend via WebSocket. The notification includes the mission title, points awarded, and the user’s updated total points. WebSocket is used here so the notification is delivered instantly without requiring the user to manually refresh the page. In the case of an internet disconnection, the Backend retroactively checks mission completion upon reconnection and delivers any missed notifications at that time.

C. Friends Leaderboard
- Frontend → Backend Server
- Protocol: HTTP GET
- Trigger: User taps “ Friends Leaderboard” on the Missions page
- When a user opens the Friends Leaderboard on the Missions page, the Frontend requests the Backend to return the top 10 point-earners among the user’s friends list. The Backend responds with each friend’s display name, total points, and the requesting user’s own rank within the list.


**Examples of Component Functions and Connector Communications**

**Functional Requirement 1: Chat**
**Basic Flow:** Successful Chat Request and Conversation

Step 1: User A views nearby matched users
- Function: The Browser Client calls a “load nearby users” function, which asks the Backend Server for a list of users in range who share at least one interest.
- Connector: The Browser Client sends the current user’s ID to the Backend Server. The Backend Server returns a list of nearby users and their shared interest tags.

Step 2: User A sends a chat request to User B
- Function: The Browser Client calls a “send chat request” function, which submits the request to the Backend Server. The Backend Server stores the pending request and notifies User B.
- Connector: Connector: The Browser Client sends User A’s ID and User B’s ID to the Backend Server. The Backend Server sends a real-time notification to User B via the WebSocket Server.

Step 3: User B accepts the request
- Function: The Browser Client (User B) calls an “accept request” function. The Backend Server creates a chat channel and notifies User A.
- Connector: User B’s Browser Client sends the request ID and acceptance decision to the Backend Server. The Backend Server sends a real-time notification to User A with the new channel ID.

Step 4: Messages are exchanged.
- Function: The Browser Client calls a “send message” function, which passes the message to the WebSocket Server. The WebSocket Server delivers it to the other user’s Browser Client and tells the Backend Server to save it.
- Connector: Each Browser Client sends message text and a timestamp through the WebSocket server. The WebSocket Server forwards the message to the recipient and the Backend Server writes it to the Database.

**Alternative Flow:** Delayed Acceptance

Step 1 - 2: Same as Basic Flow steps 1-2. The request is stored as “pending” in the Database.

Step 3: User B logs in later and sees the pending request.
- Function: The Browser Client calls a “load pending requests” function on page load.
- Connector: The Browser Client sends User B’s ID to the Backend Server. The Backend Server returns a list of any outstanding chat requests from the Database.

Step 4: User B accepts. Same as basic flow Step 3.

**Exceptional Flow:** Server Error during request send

Step 1: User A submits a chat request. Same as Basic Flow Step 2.

Step 2: Backend cannot process the request
- Function: The Backend Server’s “create request” function fails and returns an error status.
- Connector: The Backend Server sends an error message back to the Browser Client. The Browser Client displays an error notification to User A.

Step 3: User goes out of range before retrying.

**Functional Requirement 2: Range**
**Basic Flow:** Both users can see each other

Step 1: App reads device location
- Function: The Location Service calls a "get current position" function using the browser's built-in GPS access.
- Connector: The browser's Location Service returns the device's latitude and longitude to the Browser Client.

Step 2: Location is shared with the backend
- Function: The Browser Client calls an "update location" function, sending the current coordinates to the Backend Server every 30 seconds.
- Connector: The Browser Client sends the user's ID and current coordinates to the Backend Server via the WebSocket Server. The Backend Server temporarily stores this (not permanently, for privacy).

Step 3: Backend checks who is in range
- Function: The Backend Server's "compute visible users" function calculates the distance between each pair of active users and returns only those where both users' range settings cover the distance.
- Connector: The Backend Server returns a list of mutually in-range users to each Browser Client. Each Browser Client passes this list to the Maps API to place pins.

**Alternative Flow:** Assymetric Range

Step 1 - 2: Same as Basic Flow steps 1-2.

Step 3: Backend evaluates range asymmetry.
- Function: The Backend Server's "compute visible users" function checks range settings for both users. Since User B's range does not reach User A, User B does not appear in User A's results, but User A does appear in User B's results.
- Connector: The Backend Server returns different nearby-user lists to each user's Browser Client — User A's list includes User B, but User B's list does not include User A.

**Exceptional Flow:** User goes invisible

Step 1: User A enables invisible mode
- Function: The Browser Client calls a "set visibility" function, sending the updated preference to the Backend Server.
- Connector: The Browser Client sends User A's ID and the new invisible setting to the Backend Server. The Backend Server saves this to the Database.

Step 2: User A is excluded from all nearby-user results
- Function: The Backend Server's "compute visible users" function filters out any user with invisible mode active.
- Connector: On the next refresh, the Backend Server returns a nearby-user list to all other users' Browser Clients that no longer includes User A. Their Browser Clients remove User A's pin from the map.

**Functional Requirement 3: User-Defined Filtering**
**Basic Flow:** Filter returns a match

Step 1: User A applies a filter
- Function: The Browser Client calls an "apply filter" function, saving the selected tags to the Backend Server.
- Connector: The Browser Client sends the user's ID and the list of required tags to the Backend Server. The Backend Server stores this filter preference in the Database.

Step 2: Nearby-user query respects the filter
- Function: The Backend Server's "get filtered nearby users" function retrieves only users who have all of the required tags and are within range.
- Connector: The Backend Server returns a filtered list of nearby users to the Browser Client. The Browser Client passes this to the Maps API to update the map pins.

**Alternative Flow:** Field Yields no results → User broadens filter

Step 1: User A applies a 4-tag filter. The backend Server returns an empty list. The Browser Client displays a “no matches found” message with a suggestion to adjust the filter.

Step 2: User A reduces the filter
- Function: Same "apply filter" function as Basic Flow Step 1, but with fewer tags.
- Connector: The Browser Client sends the updated, shorter tag list to the Backend Server. The Backend Server returns a now non-empty list of nearby users.


**Exceptional Flow:** No matches and user takes no action

Step 1: Filter is applied. Backend returns an empty list. Browser Client shows the suggestion banner.

Step 2: User dismisses the suggestion.
- Function: The Browser Client calls a "dismiss banner" function, which is handled entirely on the client side — no data is sent to the backend.
- Connector: No connector involved. The UI state changes locally; the filter remains unchanged in the Database.

Step 3: System continues polling.
- Function: The Browser Client's location polling function continues to run on its 30-second cycle, re-sending the same filter criteria each time.
- Connector: Each cycle, the Browser Client sends the user's location and filter tags to the Backend Server. The Backend Server returns an empty list until a matching user enters range.

**Functional Requirement 4: User Profile**
**Basic Flow:** User creates a Profile

Step 1: User submits the sign-up form
- Function: The Browser Client calls a "register user" function, sending the completed form to the Backend Server.
- Connector: The Browser Client sends the display name, email, password, age, and selected interests to the Backend Server. The Backend Server validates the data and writes it to the Database, then returns a session token.

Step 2: User uploads a profile picture
- Function: The Browser Client calls an "upload avatar" function.
- Connector: The Browser Client sends the image file to the Backend Server. The Backend Server stores it and returns the URL of the saved image, which is then linked to the user's profile in the Database.

Step 3: Profile becomes visible to matched users
- Function: When another user's Browser Client requests profile details, the Backend Server's "get profile" function retrieves and returns the data.
- Connector: Another user's Browser Client sends a profile request with the target user's ID. The Backend Server returns the display name, bio, avatar, interests, and point total.

**Alternative Flow:** User skips optional fields

Step 1: User submits the sign-up form without a photo or age. The Backend Server's "register user" function checks that only the required fields (display name, interests) are present, then saves the profile with a default placeholder avatar.

Step 2: Profile is still created and visible to others with default avatar and no age shown. All matching and map functionality works normally.

**Exceptional Flow:** Missing Required Field

Step 1: User submits the sign-up form with an empty display name.
- Function: The Browser Client's "validate form" function catches the missing field before sending any data and displays an inline error message.
- Connector: No connector involved — the error is caught on the client side before a request is made.

Step 2 (if the check is bypassed):
- Function: The Backend Server's "register user" function detects the missing field and rejects the submission.
- Connector: The Backend Server returns an error message to the Browser Client indicating which field is invalid. The Browser Client displays the error to the user.

**Functional Requirement 5: Missions**
**Basic Flow:** Completing the "Accept Your First Chat Request" Mission

Step 1: User A accepts a chat request (same as Chat Basic Flow Step 3). Once the chat channel is created, the Backend Server's "check mission trigger" function is automatically called.

Step 2: Backend checks if the mission is already completed.
- Function: The Backend Server's "check mission trigger" function looks up whether User A has previously completed this mission.
- Connector: The Backend Server queries the Database for any prior record of this mission being completed by User A. The Database returns that no such record exists.

Step 3: Mission is awarded
- Function: The Backend Server's "award mission" function records the completion and adds points to User A's total.
- Connector: The Backend Server writes the completion record and updated point total to the Database, then sends a real-time notification to User A's Browser Client via the WebSocket Server. The Browser Client displays a congratulatory banner.

Step 4: User views the Missions page
- Function: The Browser Client calls a "load missions" function.
- Connector: The Browser Client sends the user's ID to the Backend Server. The Backend Server returns a list of completed missions, active missions, and the current point total from the Database.

**Alternative Flow:** Viewing the Friends Leaderboard

Step 1: User taps “Friends Leaderboard”
- Function: The Browser Client calls a "load friends leaderboard" function.
- Connector: The Browser Client sends the user's ID to the Backend Server. The Backend Server queries the Database for the top 10 point totals among the user's friends and returns them ranked, with the current user's own rank highlighted.

**Exceptional Flow:** Offline Mission Completion

Step 1: User A completes mission conditions while offline. The Browser Client's "queue event" function saves the completed action locally on the device.

Step 2: User A reconnects
- Function: The Browser Client's "reconnect" function detects the restored connection and calls a "replay events" function, sending the saved local actions to the Backend Server.
- Connector: The Browser Client sends the queued event and its timestamp to the Backend Server.

Step 3: Backend retroactively awards the mission
- Function: The Backend Server's "replay events" function verifies the event against server-side logs and, if valid, calls the "award mission" function.
- Connector: The Backend Server sends a delayed mission completion notification to the Browser Client via the WebSocket Server. The Browser Client displays the award banner.

**Functional Requirement 6: Onboarding Quiz**
**Basic Flow:** New user completes full onboarding

Step 1: Onboarding begins
- Function: The Browser Client calls a "start onboarding" function. No network is called yet and the state is kept locally.

Step 2: Interest grid is displayed
- Function: The Browser Client calls a "load interest categories" function to fetch the available interest options.
- Connector: The Browser Client requests the full interest list from the Backend Server. The Backend Server returns a structured list of categories and interests, each with a label and icon.

Step 3: User selects interests
- Function: The Browser Client's "toggle interest selection" function updates the local selection state each time a tile is tapped. A counter updates to show how many are selected out of 10.
- Connector: No connector yet and the selection

Step 4: User completes onboarding and submits
- Function: The Browser Client calls a "submit onboarding" function, sending all collected data to the Backend Server at once.
- Connector: The Browser Client sends the display name, selected interests, and proximity range setting to the Backend Server. The Backend Server creates the user's profile, saves their interests, and returns a confirmation to redirect the user to the map.

Step 5: Map loads with matching nearby users
- Function: The Browser Client calls the "load nearby users" function immediately on arriving at the map. (Same as Range Basic Flow Step 3.)
- Connector: The Backend Server returns nearby users who share at least one of the newly saved interests.

**Alternative Flow:** Existing User updates interests in settings

Step 1: User opens settings → My interests
- Function: The Browser Client calls a "load current interests" function.
- Connector: The Browser Client sends the user's ID to the Backend Server. The Backend Server returns the user's currently saved interests from the Database, and the grid displays them as already selected.

Step 2: User changes selections and saves
- Function: The Browser Client calls an "update interests" function.
- Connector: The Browser Client sends the updated interest list to the Backend Server. The Backend Server replaces the old interest records in the Database with the new ones and confirms the update.

Step 3: Map refreshes
- Function: The Browser Client calls the "load nearby users" function again with the new interest criteria.
- Connector: The Backend Server returns a fresh nearby-user list based on the updated interests. The Browser Client updates the map pins accordingly.

**Exceptional Flow:** User attempts to select an 11th interest

Step 1: User already has 10 interests selected and taps an 11th tile.
- Function: The Browser Client's "toggle interest selection" function checks the current count before updating. Since the limit is reached, it blocks the selection.
- Connector: No connector involved and this is handled entirely on the client side. No data is sent to the backend.

Step 2: The Browser Client displays a banner: "You've reached the 10-interest limit. Deselect an interest to add a new one."

Step 3: User deselects one tile and selects the new one successfully. The client state updates normally, and no data is sent until the user taps "Save" or "Continue."
