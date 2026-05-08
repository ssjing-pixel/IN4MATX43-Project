**CommonGround Architecture**


**Platforms**

Our frontend will run on web browsers like Google Chrome, Safari, etc. and it’s framework will use React running within a Node.js development environment. The benefit of a website-based fronten is accessibility; almost every device has access to the internet and a website and our product doesn’t require downloading of any type as an app would. The tradeoff is that websites have less access to device hardware compared to apps and sometimes browser-based geolocation is less accurate. However, we hope to combat this with our use of the Google Maps API, which is industry standard and one of the best geolocation programs.

The backend server will run on cloud infrastructure such as AWS EC2, AWS Elastic Beanstalk, or Google Cloud Platform using a Node.js runtime environment. The benefit of using cloud infrastructure is that it is extremely scalable, aka it can handle the future potential growth of our user base. Moreover, it has a level of built-in security and efficiency. The tradeoff is that cloud hosting means overhead costs on the host platform and potentially more hoops to jump through to deploy our product.

The database system will run on a cloud database management platform such as MongoDB Atlas or Firebase Firestore that uses SQL. The cloud database has benefits like automatic backups to the cloud, which means less manual saving/backup implementation on our part. Similarly to the backend cloud infrastructure, the cloud database also creates scalability in the case that our users increase. Cloud databases also have automatic maintenance. Some tradeoffs is that we have less control over database’s behind the scenes infrastructure and implementation and there may potentially be costs using a cloud database.

The messaging system will run on WebSocket-compatible cloud servers. The benefit of these servers is that they facilitate client-server connections with live chat and notifications. These features are intuitive and helpful for our users. The tradeoff is that these cloud servers have continuous socket connections which consume more server resources than HTTP requests.


**Programming Languages**

The frontend portion of our app will use React and TypeScript. This allows users to interact with the map, live chat, and interest grid directly in their browser without full page reloads.
Benefits:
CommonGround's UI sections (map, chat, profile, missions, etc.) can be built and tested independently and composed together
Almost every device with an internet connection can reach it, and users do not need to download or install anything as they would with an app
React's virtual DOM efficiently re-renders only the parts of the UI that change, which is important for a live map that updates user pins every 30 seconds without changing the entire page
TypeScript catches data shape mismatches at compile time
Many libraries like Leaflet.js or Google Maps React handle the map layer, Socket.IO handles real-time chat, and component libraries like shadcn/ui accelerate building the interest grid and profile forms
Trade offs:
React's flexibility means architectural decisions must be made deliberately. If organized poorly, React’s codebase becomes difficult to maintain 
TypeScript is difficult if we are not familiar with it. Plain JavaScript is faster to start with but increases the risk of runtime bugs as the codebase grows.
Heavy reliance on client-side rendering can hurt initial load performance on slower mobile connections
Websites have less access to device hardware compared to apps, which can limit certain capabilities and make the experience feel less integrated with the user's device
Browser-based location is sometimes less accurate than native app location services. We intend to mitigate this with the Google Maps API

The backend of the website will run on cloud infrastructure such as AWS EC2, AWS Elastic Beanstalk, or Google Cloud Platform using a Node.js runtime environment.
Benefits:
Cloud infrastructure is highly scalable. As CommonGround's user base grows beyond UCI, the backend can be scaled up to handle increased load without a fundamental architectural change
Cloud platforms provide built-in security features and reliability guarantees such as uptime SLAs, distributed access, automatic failovers, that would be difficult and time-consuming for a student team to replicate on self-hosted infrastructure
Node.js is event-driven and non-blocking, making it well-suited to CommonGround's two most demanding backend tasks: handling many simultaneous WebSocket connections for real-time chat, and processing frequent location updates from many active users concurrently
Using JavaScript on both the frontend (React) and backend (Node.js) allows us to share type definitions, utility functions, and data models across both layers, reducing duplication and the risk of frontend and backend having mismatched assumptions about data shapes
Trade offs:
Cloud hosting introduces deployment complexity. Environment variables, networking configuration, and service integration all require careful setup and ongoing maintenance that a local server would not
Cloud infrastructure carries ongoing hosting costs that will increase as the user base and data volume grow, which is a meaningful consideration for a student team operating without a budget

The database runs on a managed cloud database platform such as MongoDB Atlas or Firebase Firestore (NoSQL).
Benefits:
Managed cloud databases provide automatic backups, built-in scaling, and easier maintenance
Both MongoDB Atlas and Firebase Firestore have generous free tiers appropriate for a UCI-scoped launch and scale automatically as data volume grows
NoSQL document models can be flexible during early development when the data schema is still evolving 
Trade-offs:
NoSQL databases provide less rigid structure compared to traditional relational SQL systems, which means data consistency and relationship integrity must be enforced at the application level rather than by the database itself. For CommonGround, this is particularly relevant for the 
The relationship between users, tags, and matches would not be linked or enforced automatically

The real-time communication system runs on WebSocket which is compatible cloud servers, enabling persistent client-server connections for live chat and map updates.
Benefits:
WebSockets maintain a persistent bidirectional connection between the browser and the server, allowing the server to push new messages and location updates to the client instantly rather than waiting for the client to repeatedly poll for changes.
This directly supports CommonGround's two most latency-sensitive features: chat message delivery and live map pin updates, both of which would feel slow or unreliable over standard HTTP request-response cycles.
Trade-offs:
Persistent socket connections consume significantly more resources than standard HTTP requests


**Communication Protocols**


**Examples of Component Functions and Connector Communications**


