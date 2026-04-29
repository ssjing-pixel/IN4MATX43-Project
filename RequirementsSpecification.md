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

Functional Requirement #2: range

Analysis: The user chooses their desired range where the default range is a radius of 1 mile, but users can input whichever number they want to set as their range and can change it whenever they want in the settings. Users with similar tags will be notified only when others fall within their own radius specifically. Users can then choose to chat with users within their range. User location is updated every 30 seconds and based on their settings other users in range will be notified. Users cannot see the exact location or distance of other users, only whether they fall in range or not. In addition, user location will not be permanently stored for user privacy. Users can choose to go invisible any time they want for privacy and any when invisible, even if one is in another's range, they cannot view that person.

Pros:
- Users have control over the area where they want to be discovered
- Invisibility can give users privacy at home or work
- Flexibility in the range can allow users to expand or shrink their range for different situations (eg. city compared to rural areas)

Cons:
- Mismatching ranges as in the alternative flow can be unintuitive and unethical when one user can see someone but the other cannot
- Updating every 30 seconds can be a little slow for live locations

Use cases:

Basic
1. User A and B opens the app
2. User A and User B are at the same hiking trail 0.5 miles apart
3. User A’s set range is 2 miles and User B’s set range is 1 mile so the system updates
4. Both users see there is a nearby #hiking lover and can chat
   
Alternative
1. User A and B opens the app
2. User A and User B are both in the #gaming tag 3 miles apart
3. User A’s range is set at 5 miles and User B’s is only 1.5 miles
4. User A can see User B is also a #gaming fan, but User B cannot see User A
5. User A can send a chat request to User B

Exceptional
1. User A and B opens the app
2. User A and User B are both under #guitar and are 0.5 miles apart
3. Both users’ ranges are set to 1 mile
4. User A decides to go invisible
5. User B cannot see User A

Functional Requirement #3: user-defined filtering
Analysis: Users can apply filtering criteria to control which users show up on their map. Users can choose to filter by tags and can choose to filter my specific tags. For example, a user can choose to filter all nearby users by tags #hiking and #gym and only users with both tags will show up. If there are no users with interests in the filter the system will notify the user and suggest they change their filter. These filters will persist across sections until the user decides to change it. This can be changed on the main screen of CommonGround by pressing buttons.
Pros:
- Users can choose to have more in common with others on their map
- Users only have to configure settings once and can change whenever they want
- Easy as the user only has to click buttons
Cons:
- Being too specific can cause the user to have no one matching with them
- May be too complex and crowded on the UI reducing the simplicity of the app
Use cases:

Basic
1. User A selects #cycling and #guitar as their filter
2. User B is in User A’s range and also has #cycling and #guitar
3. User B shows up on User A’s map

Alternative
1. User A selects #hiking, #gaming, #coffee, and #baking as their filter
2. No one shows up on their map
3. User A changes it to #coffee and #baking
4. User B and User C shows up on User A’s map as they both have #coffee and #baking
   
Exceptional
1. User A selects #bouldering and #fashion as their filter
2. No one shows up on their map and system notifies them and gives suggestion to change filter
3. User A rejects the suggestion and takes no action
4. System continues to run until someone with those interests show up
