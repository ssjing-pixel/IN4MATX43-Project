**Title: CommonGround**
**Team Members:**
- Gisele Dao, gbdao
- Xinchang Tong, xinchant
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

Functional Requirement #4: user profile

Analysis: The user profile feature allows users to create and manage their personal identity within the app. When signing up, users are required to input basic information such as username and interests, while additional fields such as age, profile picture, and preferences are optional. Users can edit or update their profile information at any time through the settings page. The system stores this information and uses it to support matching and filtering features. Users can also control the visibility of certain profile fields, allowing them to choose what information is shared with others. If required fields are missing or invalid, the system will prompt the user to complete or correct them before saving. Overall, it can help the system match users based on their shared interests and provide basic information for interaction.

Pros:
- Helps users present their identity and interests clearly
- Helps the system match users more accurately based on their profile information
- Supports better interaction between users
- Improves overall user experience&Encourage users to engage more actively with the app

Cons:
- Some users may feel uncomfortable sharing personal information
- Users may provide misleading or exaggerated information
- Too much profile information may make the profile harder to read
- Profiles may lead to biased matching or unfair judgment

Use cases:

Basic:
1. User signs up for the app
2. The system prompts the users to create a profile
3. User enters required information (e.g., name, age, interests)
4. User uploads a profile picture
5. The system validates and saves the profile information
6. The profile is displayed to other matched users

Alternative:
1. User skips optional fields (e.g., profile picture)
2. The system creates a partial profile
3. The system allows the user to continue matching with limited data

Exceptional:
1. User enters invalid or missing required information
2. The system detects the error
3. The system displays an error message
4. User must correct the input before proceeding

Functional Requirement #5: user bio

Analysis: The user bio feature allows users to add a short personal description to their profile. It enables users to express their personality, interests, and what they’re looking for, helping others better understand them. The bio has a character limit to ensure readability, and users can edit or update it at any time. The bio is displayed on the user’s profile and is visible to other users. The system may include basic content moderation, such as filtering inappropriate language or allowing users to report harmful content.

Pros:
- Allows users to express their personality and interests
- Improves communication and connection between users
- Makes profiles more engaging and interactive
  
Cons:
- Some users may leave an empty bio
- Users may provide misleading or exaggerated information
- Users may feel unsure about what to write
- Bios may include irrelevant information
- Incomplete or vague bios may reduce matching effectiveness
- There may be a need for content moderation

Use cases:

Basic:
1. User opens profile settings
2. User writes a short bio
3. User saves the bio
4. The system displays the bio on the user profile

Alternative:
1. Users edit their bios after creating them
2. The system updates the bio
3. The updated bio is displayed

Exceptional:
1. User exceeds the allowed character limit
2. The system detects the issue
3. The system displays an error message
4. User must shorten the bio before saving

Functional Requirement #6 (our unique feature): Missions

Analysis: The system shall include a Missions system which is a set of in-app challenges that reward users with points for engaging in real-world social interactions facilitated by the app.

Missions will be divided into the following tiers:
- Starter Missions (one-time, for new users): “Complete your profile,” “Accept your first chat request,” etc.
- Daily Missions: “Open the app and enable location sharing,” “Send a chat request today.”
- Milestone Missions: “Make your first friend,” “Chat with 5 different users,” “Join your first interest group.”

Points earned shall accumulate on the user’s profile and be visible to other users. Points are a social signal and there are no monetary rewards or premium features tied to points. Users shall be able to view their current missions and progress from a dedicated Missions page accessible from the main navigation. The system shall display a points award notification when a mission is completed. A leadership showing the top 10 point-earners among a user’s Friends list shall be accessible from the Missions page.

Pros: 
- Missions provide motivation for new users and encourage continued engagement. The friends-only leaderboard encourages friendly competition within a trusted group rather than creating an app-wide status hierarchy that could feel exclusionary or gamified in unhealthy ways.

Cons: 
- Gamification can shift user motivation from genuine social connection to point-farming, leading to low-quality or performative interactions. Some missions may inadvertently pressure users to share their location even when they would prefer not to, which runs counter to the app’s privacy commitments. Users who are naturally more introverted or privacy-conscious may find missions stressful rather than motivating. 

- Mission design must carefully avoid any framing that implies there is a “wrong” way to use the app or that low-scoring users are less valuable members of the community. Points are purely social. The system should ensure that missions never require users to share private information or accept interactions they are not comfortable with to earn points.

Use Cases:

Basic:
1. User A receives and accepts a chat request from User B.
2. The system detects that this is User A’s first accepted chat request.
3. A congratulatory notification is displayed, awarding User A 10 points and marking the Starter Mission as complete.
4. The points total on User A’s profile is updated.
5. User A navigates to the Missions page and sees the completed mission marked with a checkmark, plus a list of next suggested missions. 

Alternative:
1. User A navigates to the Missions page and taps “Friends Leaderboard.”
2. The system displays the top 10 point-earners among User A’s friends, sorted by total points.
3. User A’s own rank within their friends list is highlighted.

Exceptional:
1. User A completes the conditions for a Daily Mission but loses internet connection before the completion is recorded.
2. When User A reconnects, the system retroactively checks mission completion status based on the server-side activity log.
3. If the conditions were met during the offline period, the mission is awarded upon reconnection with a delayed congratulatory  notification.

Functional Requirement #7 (our unique feature): Onboarding Quiz

Analysis: New users will select their interests from a curated list of categories and subcategories during a guided onboarding page. Free-text tags are not supported. The interest list will be presented as a visual grid of selectable tiles. Each tile includes an icon and a short label. Selected tiles are highlighted. Users must select a minimum of 1 and a maximum of 10 interests. The system shall use the user’s selected interests to determine map visibility and chat request eligibility.

Pros:
- A predefined list significantly reduces the risk of users creating harmful, harassing, or offensive interest tags.
Predefined categories make the match algorithm simple and reliable.
The structured quiz format makes the onboarding experience feel intentional and friendly.

Cons:
- A predefined list cannot cover every hobby and interest, and some users may feel the app does not represent them.
The list requires ongoing maintenance by the development team to stay relevant.
Highly specific niche interests (which are often the most passionate communities) may not appear, losing the users who would benefit most from the app.

- The team should be intentional about ensuring the list is inclusive across different backgrounds, ages, and subcultures. A feedback mechanism allows users to suggest new interest, but the team must be transparent about how submissions are reviewed and why some may be declined.

Use Cases:

Basic:
1. The system presents the onboarding quiz, beginning with the display name and photo step.
2. The user enters a display name and skips the photo upload.
3. The system advances to the interest selection step and displays a visual grid of interest tiles organized by category.
4. The user selects 4 interest tiles: “Hiking,” “Photography,” “Board Games,” and “Cooking.”
5. Selected tiles are highlighted and a counter shows “4/10 selected.”
6. The user taps “Continue.”
7. The system advances to the proximity range step, then completes onboarding and navigates to the map.
8. The map immediately displays pins for nearby users who share at least one of the user’s four selected interests.

Alternative:
1. An existing user navigates to Settings → My Interests.
2. The system displays the full interest grid with the user’s currently selected interests highlighted.
3. The user deselects “Cooking” and adds “Guitar.”
4. The user taps “Save.”
5. The system updates the user’s interest profile and the map is refreshed to reflect the new matching criteria.

Exceptional:
1. The user has already selected 10 interests and taps an 11th tile.
2. The tile does not become selected.
3. The system displays a pop-up banner: “You’ve reached the 10-interest limit. Deselect an interest to add a new one.”
4. The user deselects one tile, then successfully selects the new one.
