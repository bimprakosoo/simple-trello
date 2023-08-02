# Track Your Task
A simple trello clone to track your task using Next.js, React Drag and Drop, and Firebase.
### Example

![image](https://imgur.com/wkc3iRp)

* User can add new card on Todo to make a new task
* User can drag and drop the cards to the Progress or Done column

# Setup

* clone the repository


* Install dependencies by running `npm install`
---
## Firebase Configuration

1. Create a new Firebase project at https://console.firebase.google.com/.
2. Go to your project add add App with web platform with </> icon. 
![image](https://imgur.com/G51UYB3)
3. Register the app and copy the Firebase config object (apiKey, authDomain, projectId, etc.).
4. Create a `.env.local` file in the root directory of the project and add your Firebase config as environment variables:
  `NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-auth-domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-storage-bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
   NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id`
---

## Start the Development Server

### Generate an OpenAI API key
1. Run `npm run dev`

2. Open http://localhost:3000 in your browser to view the app.
---

