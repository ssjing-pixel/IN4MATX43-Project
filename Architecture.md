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


