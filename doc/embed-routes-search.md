# Embed Routes Search

Looking for embed chat routes to implement userContext feature:

## Common locations for embed routes:
- server/routes/embed.js
- server/routes/api/embed/
- server/endpoints/embed/
- server/routes/embedChat.js

## Files that might need updating:
1. Embed route handler (to extract userContext from request)
2. Embed model (to store context property)
3. Frontend embed script (to send context property)

## Expected flow:
Frontend embed widget → API endpoint → streamChatWithForEmbed with userContext parameter
