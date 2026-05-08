**CommonGround Architecture**


**Platforms**
Our frontend will run on web browsers like Google Chrome, Safari, etc. and it’s framework will use React running within a Node.js development environment. The benefit of a website-based fronten is accessibility; almost every device has access to the internet and a website and our product doesn’t require downloading of any type as an app would. The tradeoff is that websites have less access to device hardware compared to apps and sometimes browser-based geolocation is less accurate. However, we hope to combat this with our use of the Google Maps API, which is industry standard and one of the best geolocation programs.

The backend server will run on cloud infrastructure such as AWS EC2, AWS Elastic Beanstalk, or Google Cloud Platform using a Node.js runtime environment. The benefit of using cloud infrastructure is that it is extremely scalable, aka it can handle the future potential growth of our user base. Moreover, it has a level of built-in security and efficiency. The tradeoff is that cloud hosting means overhead costs on the host platform and potentially more hoops to jump through to deploy our product.

The database system will run on a cloud database management platform such as MongoDB Atlas or Firebase Firestore that uses SQL. The cloud database has benefits like automatic backups to the cloud, which means less manual saving/backup implementation on our part. Similarly to the backend cloud infrastructure, the cloud database also creates scalability in the case that our users increase. Cloud databases also have automatic maintenance. Some tradeoffs is that we have less control over database’s behind the scenes infrastructure and implementation and there may potentially be costs using a cloud database.

The messaging system will run on WebSocket-compatible cloud servers. The benefit of these servers is that they facilitate client-server connections with live chat and notifications. These features are intuitive and helpful for our users. The tradeoff is that these cloud servers have continuous socket connections which consume more server resources than HTTP requests.


**Programming Languages**


**Communication Protocols**


**Examples of Component Functions and Connector Communications**


