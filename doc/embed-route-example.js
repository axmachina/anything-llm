// Example embed route handler that needs to be updated to support userContext
// This would typically be in server/routes/api/embed.js or similar

// Before - typical embed chat endpoint
app.post('/api/embed/:embedId/chat', async (req, res) => {
  const { message, sessionId } = req.body;
  const { embedId } = req.params;

  // Get embed config
  const embed = await EmbedConfig.findById(embedId);

  // Call streamChatWithForEmbed
  await streamChatWithForEmbed(
    res,
    embed,
    message,
    sessionId,
    null, // userContext not implemented yet
    { username: req.user?.username }
  );
});

// After - with userContext support
app.post('/api/embed/:embedId/chat', async (req, res) => {
  const { message, sessionId, context } = req.body; // Extract context from request
  const { embedId } = req.params;

  // Get embed config
  const embed = await EmbedConfig.findById(embedId);

  // Call streamChatWithForEmbed with userContext
  await streamChatWithForEmbed(
    res,
    embed,
    message,
    sessionId,
    context || null, // Pass userContext from request body
    { username: req.user?.username }
  );
});

// Frontend embed script would need to send context in the request:
// fetch('/api/embed/123/chat', {
//   method: 'POST',
//   headers: { 'Content-Type': 'application/json' },
//   body: JSON.stringify({
//     message: 'Hello',
//     sessionId: 'session123',
//     context: 'User is a new employee starting tomorrow' // NEW
//   })
// });
