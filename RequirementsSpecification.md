**Title: CommonGround**
**Team Members:**
- Gisele Dao, gbdao
- Jenny Tong, xinchant
- Stephanie Jing, ssjing
- Elaine Kao, eakao

**Executive Summary:**
CommonGround is a web-based social platform designed to help users make new friends through shared interests, local discovery, and gamified social interaction. Many people want to meet others with similar hobbies but struggle to initiate friendships in real life. CommonGround solves this problem by turning friendship-building into an engaging experience through missions and rewards.
Users create profiles, complete an onboarding quiz, and choose interests such as gaming, fitness, music, anime, coding, sports, or art. The website then recommends nearby compatible users and encourages interaction through fun tasks like starting conversations, attending meetups, or completing group challenges.
Rather than focusing only on geolocation, CommonGround emphasizes motivation and connection. Users earn points, badges, streaks, and achievements for participating socially and building friendships. Core features include profile creation, friend matching, in-site chat, missions, and a live friends tab. The goal is to reduce loneliness, increase confidence, and make meeting new people feel rewarding and enjoyable.

**Application Context / Environmental Constraints:**
Since we are UCI students, we intend to initially launch the product within UCI and the local Irvine area, with the potential to scale in America. Our tool will launch as a website you can log on to on a computer browser, phone safari/chrome app, or any other device with a screen and a mobile browser. Users will also need an internet connection and a GPS-enabled device to enable the location-based aspect of our product.
The more behind-the-scenes software of our product includes a browser to host the website, a maps/location API (likely one by Google Maps), a real-time messaging service, and a cloud backend/database. To use the map/location API, we’ll need browser geolocation permission while complying with data/privacy laws in our access of user location. The chat function will also be reliant on the messaging service and its servers.

**Functional Requirements:**

Functional Requirement #1: chat
Analysis: The user can begin a chat with anyone else on the website after chat requests have been sent, received, and accepted. Chats consist of messages sent back and forth. The chat option only becomes available if other users fall within the primary user’s desired range and have similar tags. Once a chat is accepted between users, the chat is saved and users can return back to the chat even if the range/tag conditions aren’t met.
Pros:
- Users are able to connect with other users; meaningful conversations
- privacy/security in both parties needing to agree to chat before chat is initiated (someone has to send request, other person has to accept)
- reqest/accept reduces spam
Cons:
- Relies on messaging server (potentially finicky)
- Range-reliant
- Tag-based matching doesn’t guarantee compatibility between people before initiating chats
- Saved chats may get cluttered
Use cases:
Basic
1. User A browses matching tagged users in range
2. User A sends chat request to User B
3. User B accepts request
4. Chat window opens
5. Messages are sent back and forth
Alternative
1. User A browses matching tagged users in range
2. User A sends chat request to User B
3. User B doesn’t see request
4. Request remains pending
5. User B finally accepts a day later
6. Chat window opens
7. Messages are send back and forth
Exceptional
1. User A browses matching tagged users in range
2. User A sends chat request to User B
3. Server issue causes message to not be sent, User A receives error message
4. User A tries again later and succeeds or User B goes out of range and User A can no longer send a message request



























