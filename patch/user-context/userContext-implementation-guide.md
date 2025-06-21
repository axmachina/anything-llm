# UserContext Implementation Guide

## Overview
This guide shows the minimal changes needed to implement the userContext feature across the embed chat system.

## 1. Core Function Updated ✅

**File**: `server/utils/chats/embed.js`

### Changes Made:
- Added `userContext` parameter to function signature
- Add `userContext` field to LLM connector (alongside existing `userPrompt`)
- Store `userContext` in database response object

```javascript
// Function signature
async function streamChatWithForEmbed(
  response,
  embed,
  message,
  sessionId,
  userContext, // NEW - Optional user context that follows system prompt
  { promptOverride, modelOverride, temperatureOverride, username }
)

// Message processing
const messages = await LLMConnector.compressMessages(
  {
    systemPrompt: await chatPrompt(embed.workspace, username),
    userPrompt: message, // The user's actual question/input (PRESERVED)
    userContext: userContext, // NEW - Optional user context that follows system prompt
    contextTexts,
    chatHistory,
  },
  rawHistory
);

// Database storage
await EmbedChats.new({
  embedId: embed.id,
  prompt: message,
  response: {
    text: completeText,
    type: chatMode,
    sources,
    metrics,
    userContext: userContext || null // NEW - Store user context for tracking
  },
  // ...rest unchanged
});
```

## 2. Route Handler Updates Needed

**File**: `server/routes/api/embed.js` (or wherever embed chat endpoint is defined)

### Required Changes:
```javascript
// Before
app.post('/api/embed/:embedId/chat', async (req, res) => {
  const { message, sessionId } = req.body;

  await streamChatWithForEmbed(
    res,
    embed,
    message,
    sessionId,
    null, // No userContext
    { username }
  );
});

// After
app.post('/api/embed/:embedId/chat', async (req, res) => {
  const { message, sessionId, context } = req.body; // Extract context

  await streamChatWithForEmbed(
    res,
    embed,
    message,
    sessionId,
    context || null, // Pass userContext from request
    { username }
  );
});
```

## 3. Frontend Embed Script Updates Needed

**File**: Frontend embed widget JavaScript

### Required Changes:
```javascript
// Before
fetch('/api/embed/123/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: userMessage,
    sessionId: sessionId
  })
});

// After
fetch('/api/embed/123/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: userMessage,
    sessionId: sessionId,
    context: userContext || null // NEW - Optional user context
  })
});
```

### Embed Widget Configuration:
```html
<!-- Before -->
<script>
  window.embeddedChatbotConfig = {
    chatbotId: "embed-123",
    domain: "http://localhost:3001"
  }
</script>

<!-- After -->
<script>
  window.embeddedChatbotConfig = {
    chatbotId: "embed-123",
    domain: "http://localhost:3001",
    context: "User is a new employee starting tomorrow" // NEW - Optional
  }
</script>
```

## 4. Optional: Embed Model Schema Updates

**File**: `server/models/embedConfig.js` (or equivalent)

### Optional Enhancement:
```javascript
// Add context field to embed configuration if needed
const embedConfigSchema = {
  // ...existing fields
  defaultContext: String, // Optional default context for all chats
  allowContextOverride: Boolean, // Whether to allow per-message context
  // ...rest unchanged
};
```

## 5. Testing the Implementation

### Basic Test Cases:
```javascript
// Test 1: Chat without userContext (backward compatibility)
await streamChatWithForEmbed(
  res, embed, "Hello", sessionId, null, { username: "test" }
);

// Test 2: Chat with userContext
await streamChatWithForEmbed(
  res, embed, "Hello", sessionId, "I am a new employee", { username: "test" }
);

// Test 3: Verify database storage
const chatRecord = await EmbedChats.findById(chatId);
console.log(chatRecord.response.userContext); // Should contain context or null
```

## 6. Migration Strategy

### Phase 1: Backend Changes ✅
- Update `streamChatWithForEmbed` function (DONE)
- Update route handlers to accept `context` parameter

### Phase 2: Frontend Changes
- Update embed widget to send `context` in requests
- Add configuration option for default context

### Phase 3: Optional Enhancements
- Add admin interface for managing default contexts
- Add analytics for context usage
- Add validation for context length/content

## 7. Backward Compatibility

The implementation maintains full backward compatibility:
- `userContext` parameter is optional (defaults to null)
- Existing embed widgets continue to work without changes
- No breaking changes to existing APIs
- Database changes are additive only

## Next Steps

1. ✅ Update core function signature and logic
2. 🔄 Find and update embed route handler
3. 🔄 Update frontend embed script
4. 🔄 Test end-to-end functionality
5. 🔄 Optional: Add configuration options
