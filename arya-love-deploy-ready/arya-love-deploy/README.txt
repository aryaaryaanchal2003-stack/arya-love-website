ARYA'S LOVE WEBSITE — DEPLOY GUIDE

The project has two parts:
- public/ = upload this folder's CONTENTS to Netlify (index.html, admin.html, background.jpeg)
- server/ = deploy this Node API on Render
- MongoDB Atlas stores answers so Arya can see Subin's answers from her own phone.

IMPORTANT: Never put your MongoDB URI, ADMIN_PASSWORD, or JWT_SECRET in public HTML or GitHub.

STEP 1 — MongoDB Atlas (free tier, if available in your region)
1. Create/sign in to https://www.mongodb.com/atlas/database
2. Create a free database/cluster.
3. In Database Access, create a database user and password.
4. In Network Access, add 0.0.0.0/0 for Render access (use a strong database password; this permits network access but still requires database credentials).
5. Click Connect > Drivers and copy the connection string. Replace <password> with the database user's password and add a database name, e.g. /loveanswers before any ? options.

STEP 2 — Deploy API on Render
1. Put the server/ folder in a GitHub repository (the server folder's package.json and server.js must be at repository root for this step), OR create a repo with the contents of server/ at its root.
2. On https://render.com choose New > Web Service and connect that repo.
3. Runtime: Node. Build command: npm install. Start command: npm start.
4. Add Environment Variables in Render:
   MONGODB_URI = your Atlas connection string
   ADMIN_PASSWORD = a strong private password only you know
   JWT_SECRET = a long random secret (at least 32 random characters)
5. Deploy. Copy the Render service URL, e.g. https://your-service.onrender.com.
6. Open https://your-service.onrender.com/health and check database says connected.

STEP 3 — Add the Render URL to the website
1. Open public/index.html and public/admin.html in a text editor.
2. In BOTH files find: https://YOUR-BACKEND-URL.onrender.com
3. Replace it with your actual Render URL (no trailing slash).
4. Save both files.

STEP 4 — Deploy the website on Netlify
1. Open https://app.netlify.com/drop
2. Drag the public folder onto the drop area (or upload the folder's files using the Netlify deploy UI).
3. Netlify will give you a website URL. Open it on your phone to test.

STEP 5 — Use it
- Send the Netlify URL to Subin.
- Your private admin page is the same URL plus /admin.html
- Enter the ADMIN_PASSWORD you set in Render.
- Answers are stored in MongoDB and can be viewed from another phone/computer.

Troubleshooting:
- If you see a connection error, check the URL in BOTH HTML files and Render logs.
- If /health says database not connected, recheck MONGODB_URI and Atlas network access.
- Render free services may sleep when idle, so the first request can take a little time.
- Keep the admin URL/password private. Do not share the admin password with Subin.
