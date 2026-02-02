# Agentic API Capabilities Research

**Research Date:** 2026-01-30
**Focus:** Multi-step task orchestration for browser-based applications

## Executive Summary

This document compares agentic capabilities across **Google Gemini API**, **OpenAI API**, and **Anthropic Claude API** for orchestrating multi-step task execution in browser-based applications.

**Key Finding:** All three providers support function/tool calling, but they differ significantly in:
- Orchestration models (assistants vs. stateless messages)
- Browser compatibility
- Built-in capabilities (code execution, search grounding)
- Error handling patterns

---

## Comparison Table: Agentic Features

| Feature | Google Gemini API | OpenAI API | Anthropic Claude API |
|---------|-------------------|------------|---------------------|
| **Function/Tool Calling** | ✅ Yes | ✅ Yes | ✅ Yes |
| **Multi-turn Conversations** | ✅ Yes (Interactions API) | ✅ Yes (Threads & Messages) | ✅ Yes (Messages API) |
| **Built-in Code Execution** | ✅ Yes (`codeExecution` tool) | ❌ No | ❌ No |
| **Built-in Web Search** | ✅ Yes (`googleSearch` tool) | ❌ No (requires custom tool) | ❌ No (requires custom tool) |
| **Parallel Tool Calls** | ✅ Yes | ✅ Yes | ✅ Yes |
| **Structured Outputs** | ⚠️ Via JSON schema | ✅ Yes (`strict: true`) | ⚠️ Via JSON schema |
| **Stateful Orchestration** | ⚠️ Limited (Interactions API) | ✅ Yes (Assistants API) | ❌ No (client-managed) |
| **Browser Compatibility** | ✅ REST API + CORS | ✅ REST API + CORS | ✅ REST API + CORS |
| **Streaming Support** | ✅ Yes | ✅ Yes | ✅ Yes |
| **Extended Thinking** | ❌ No | ❌ No | ✅ Yes (thinking blocks) |
| **Context Caching** | ✅ Yes | ⚠️ Limited | ✅ Yes |
| **Client SDK (JS/TS)** | ✅ `@google/genai` | ✅ `openai` | ✅ `@anthropic-ai/sdk` |

---

## 1. Google Gemini API

### Function Calling & Tool Use

**What It Does:**
- Define tools with JSON schemas describing function parameters
- Model analyzes user input and decides when to call functions
- Returns `function_call` objects with parsed arguments
- Supports multiple tool types: custom functions, code execution, Google Search

**REST API Format:**

**Request:**
```json
POST https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent
Headers:
  x-goog-api-key: YOUR_API_KEY
  Content-Type: application/json

{
  "contents": [{
    "role": "user",
    "parts": [{"text": "Schedule a meeting with Bob for 03/14/2025 at 10:00 AM"}]
  }],
  "tools": [{
    "functionDeclarations": [{
      "name": "schedule_meeting",
      "description": "Schedules a meeting with specified attendees",
      "parameters": {
        "type": "object",
        "properties": {
          "attendees": {"type": "array", "items": {"type": "string"}},
          "date": {"type": "string"},
          "time": {"type": "string"}
        },
        "required": ["attendees", "date", "time"]
      }
    }]
  }]
}
```

**Response:**
```json
{
  "candidates": [{
    "content": {
      "parts": [{
        "functionCall": {
          "name": "schedule_meeting",
          "args": {
            "attendees": ["Bob"],
            "date": "2025-03-14",
            "time": "10:00"
          }
        }
      }]
    }
  }]
}
```

**Submitting Tool Results (Interactions API):**
```json
POST https://generativelanguage.googleapis.com/v1beta/interactions
{
  "model": "gemini-3-flash-preview",
  "previous_interaction_id": "INTERACTION_ID",
  "input": [{
    "type": "function_result",
    "name": "schedule_meeting",
    "call_id": "FUNCTION_CALL_ID",
    "result": "Meeting scheduled successfully"
  }]
}
```

### Built-in Code Execution

**What It Does:**
- Model can write and execute Python code automatically
- Returns both the code and execution results
- Useful for mathematical computations, data analysis

**Request:**
```json
{
  "contents": [{
    "role": "user",
    "parts": [{"text": "Calculate the sum of the first 50 prime numbers"}]
  }],
  "tools": [{"codeExecution": {}}]
}
```

**Response:**
```json
{
  "candidates": [{
    "content": {
      "parts": [
        {
          "executableCode": {
            "language": "PYTHON",
            "code": "def is_prime(n):\n  ...\nsum(primes[:50])"
          }
        },
        {
          "codeExecutionResult": {
            "outcome": "OUTCOME_OK",
            "output": "5117"
          }
        }
      ]
    }
  }]
}
```

### Built-in Google Search Grounding

**What It Does:**
- Model can search the web in real-time
- Returns grounded responses with citations
- Includes search queries, snippets, and source URLs

**Request:**
```json
{
  "contents": [{
    "role": "user",
    "parts": [{"text": "Who won the euro 2024?"}]
  }],
  "tools": [{"google_search": {}}]
}
```

**Response includes:**
```json
{
  "groundingMetadata": {
    "searchQueries": ["euro 2024 winner"],
    "groundingSupports": [{
      "segment": {"text": "Spain won Euro 2024"},
      "groundingChunkIndices": [0],
      "confidenceScores": [0.95]
    }],
    "webSearchQueries": ["euro 2024 winner"],
    "retrievalMetadata": [{
      "webDynamicRetrievalScore": 0.89
    }]
  }
}
```

### Browser Compatibility

✅ **Fully Browser Compatible**
- REST API with CORS support
- API key authentication (can be exposed in browser - use with caution or proxy)
- JavaScript SDK: `@google/genai`
- Streaming supported via Server-Sent Events

⚠️ **Security Consideration:** API keys in browser code are visible to users. For production, use a backend proxy.

### Multi-Step Orchestration

**Pattern: Interactions API (Beta)**
```javascript
// Step 1: Initial request with tools
let interaction = await client.interactions.create({
  model: 'gemini-3-flash-preview',
  input: 'Extract concepts, cluster them, then generate a report',
  tools: [extractConceptsTool, clusterTool, reportTool]
});

// Step 2: Handle tool calls iteratively
for (const output of interaction.outputs) {
  if (output.type === 'function_call') {
    const result = await executeFunction(output.name, output.arguments);

    // Step 3: Send result back
    interaction = await client.interactions.create({
      model: 'gemini-3-flash-preview',
      previous_interaction_id: interaction.id,
      input: [{
        type: 'function_result',
        name: output.name,
        call_id: output.id,
        result: result
      }]
    });
  }
}
```

**Orchestration Capabilities:**
- ✅ Plan sequences of tool calls
- ✅ Chain outputs from one step as inputs to the next
- ⚠️ Error handling: Manual (check response, handle errors in client code)
- ⚠️ Progress reporting: Manual (client tracks interaction state)
- ⚠️ Retry logic: Client-side implementation required

---

## 2. OpenAI API

### Function Calling

**What It Does:**
- Define tools with JSON schemas
- Model returns `function` tool calls with arguments
- Supports `strict: true` for guaranteed schema adherence
- Parallel function calling supported

**REST API Format:**

**Request (Chat Completions):**
```json
POST https://api.openai.com/v1/chat/completions
Headers:
  Authorization: Bearer YOUR_API_KEY
  Content-Type: application/json

{
  "model": "gpt-4o",
  "messages": [{
    "role": "user",
    "content": "What's the weather in San Francisco?"
  }],
  "tools": [{
    "type": "function",
    "function": {
      "name": "get_current_temperature",
      "description": "Get the current temperature for a location",
      "parameters": {
        "type": "object",
        "properties": {
          "location": {
            "type": "string",
            "description": "City and state, e.g. San Francisco, CA"
          },
          "unit": {
            "type": "string",
            "enum": ["Celsius", "Fahrenheit"]
          }
        },
        "required": ["location", "unit"],
        "additionalProperties": false
      },
      "strict": true
    }
  }]
}
```

**Response:**
```json
{
  "choices": [{
    "message": {
      "role": "assistant",
      "tool_calls": [{
        "id": "call_abc123",
        "type": "function",
        "function": {
          "name": "get_current_temperature",
          "arguments": "{\"location\": \"San Francisco, CA\", \"unit\": \"Fahrenheit\"}"
        }
      }]
    },
    "finish_reason": "tool_calls"
  }]
}
```

**Submitting Tool Results:**
```json
{
  "model": "gpt-4o",
  "messages": [
    {"role": "user", "content": "What's the weather in San Francisco?"},
    {
      "role": "assistant",
      "tool_calls": [{
        "id": "call_abc123",
        "type": "function",
        "function": {
          "name": "get_current_temperature",
          "arguments": "{\"location\": \"San Francisco, CA\", \"unit\": \"Fahrenheit\"}"
        }
      }]
    },
    {
      "role": "tool",
      "tool_call_id": "call_abc123",
      "content": "72"
    }
  ]
}
```

### Assistants API (Stateful Orchestration)

**What It Does:**
- Server-managed conversation threads
- Automatic tool execution polling
- Built-in run lifecycle management
- Persistent state across requests

**REST API Format:**

**Create Assistant:**
```json
POST https://api.openai.com/v1/assistants
Headers:
  Authorization: Bearer YOUR_API_KEY
  OpenAI-Beta: assistants=v2

{
  "model": "gpt-4o",
  "instructions": "You are a helpful assistant",
  "tools": [{
    "type": "function",
    "function": {
      "name": "get_weather",
      "description": "Get weather for a location",
      "parameters": {...},
      "strict": true
    }
  }]
}
```

**Create Thread & Run:**
```json
POST https://api.openai.com/v1/threads
{
  "messages": [{
    "role": "user",
    "content": "What's the weather?"
  }]
}

POST https://api.openai.com/v1/threads/{thread_id}/runs
{
  "assistant_id": "asst_123"
}
```

**Poll Run Status:**
```json
GET https://api.openai.com/v1/threads/{thread_id}/runs/{run_id}

Response when tools needed:
{
  "id": "run_123",
  "status": "requires_action",
  "required_action": {
    "type": "submit_tool_outputs",
    "submit_tool_outputs": {
      "tool_calls": [{
        "id": "call_123",
        "type": "function",
        "function": {
          "name": "get_weather",
          "arguments": "{\"location\": \"SF\"}"
        }
      }]
    }
  }
}
```

**Submit Tool Outputs:**
```json
POST https://api.openai.com/v1/threads/{thread_id}/runs/{run_id}/submit_tool_outputs
{
  "tool_outputs": [{
    "tool_call_id": "call_123",
    "output": "72 degrees and sunny"
  }]
}
```

### Browser Compatibility

✅ **Fully Browser Compatible**
- REST API with CORS support
- API key or OAuth authentication
- JavaScript SDK: `openai`
- Streaming supported

⚠️ **Security Consideration:** For Assistants API, consider using a backend proxy to avoid exposing API keys.

### Multi-Step Orchestration

**Pattern 1: Chat Completions (Stateless)**
```javascript
// Client manages conversation state
let messages = [
  {role: 'user', content: 'Extract concepts from this document'}
];

let response = await openai.chat.completions.create({
  model: 'gpt-4o',
  messages,
  tools: [extractConceptsTool]
});

// Handle tool calls
if (response.choices[0].finish_reason === 'tool_calls') {
  const toolCalls = response.choices[0].message.tool_calls;

  // Execute tools
  for (const call of toolCalls) {
    const result = await executeFunction(call.function.name, JSON.parse(call.function.arguments));

    messages.push(response.choices[0].message);
    messages.push({
      role: 'tool',
      tool_call_id: call.id,
      content: JSON.stringify(result)
    });
  }

  // Continue conversation
  response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages
  });
}
```

**Pattern 2: Assistants API (Stateful)**
```javascript
// Create assistant with tools
const assistant = await openai.beta.assistants.create({
  model: 'gpt-4o',
  tools: [extractConceptsTool, clusterTool, reportTool]
});

// Create thread and run
const thread = await openai.beta.threads.create({
  messages: [{role: 'user', content: 'Extract, cluster, and report on concepts'}]
});

let run = await openai.beta.threads.runs.create(thread.id, {
  assistant_id: assistant.id
});

// Poll for completion
while (run.status === 'in_progress' || run.status === 'queued') {
  await new Promise(resolve => setTimeout(resolve, 1000));
  run = await openai.beta.threads.runs.retrieve(thread.id, run.id);
}

// Handle required actions
if (run.status === 'requires_action') {
  const toolCalls = run.required_action.submit_tool_outputs.tool_calls;
  const toolOutputs = [];

  for (const call of toolCalls) {
    const result = await executeFunction(call.function.name, JSON.parse(call.function.arguments));
    toolOutputs.push({
      tool_call_id: call.id,
      output: JSON.stringify(result)
    });
  }

  // Submit and poll again
  run = await openai.beta.threads.runs.submitToolOutputsAndPoll(
    thread.id,
    run.id,
    {tool_outputs: toolOutputs}
  );
}

// Get final messages
const messages = await openai.beta.threads.messages.list(thread.id);
```

**Orchestration Capabilities:**
- ✅ Plan sequences of tool calls
- ✅ Chain outputs (via conversation history)
- ✅ Error handling: `status: 'failed'`, `last_error` field
- ✅ Progress reporting: `status` field (`queued`, `in_progress`, `requires_action`, `completed`)
- ⚠️ Retry logic: Manual (check status, re-create run)
- ✅ Automatic polling helpers (`submitToolOutputsAndPoll`)

---

## 3. Anthropic Claude API

### Tool Use

**What It Does:**
- Define tools with JSON schemas
- Model returns `tool_use` content blocks
- Client executes tools and returns `tool_result` blocks
- Supports multiple tool calls in single response

**REST API Format:**

**Request:**
```json
POST https://api.anthropic.com/v1/messages
Headers:
  x-api-key: YOUR_API_KEY
  anthropic-version: 2023-06-01
  Content-Type: application/json

{
  "model": "claude-3-5-sonnet-20241022",
  "max_tokens": 1024,
  "tools": [{
    "name": "get_stock_price",
    "description": "Get the current stock price for a ticker symbol",
    "input_schema": {
      "type": "object",
      "properties": {
        "ticker": {
          "type": "string",
          "description": "Stock ticker symbol, e.g. AAPL"
        }
      },
      "required": ["ticker"]
    }
  }],
  "messages": [{
    "role": "user",
    "content": "What's the current price of Apple stock?"
  }]
}
```

**Response:**
```json
{
  "id": "msg_123",
  "type": "message",
  "role": "assistant",
  "content": [
    {
      "type": "text",
      "text": "I'll check the current Apple stock price for you."
    },
    {
      "type": "tool_use",
      "id": "toolu_01D7FLrfh4GYq7yT1ULFeyMV",
      "name": "get_stock_price",
      "input": {"ticker": "AAPL"}
    }
  ],
  "stop_reason": "tool_use"
}
```

**Submitting Tool Results:**
```json
{
  "model": "claude-3-5-sonnet-20241022",
  "max_tokens": 1024,
  "tools": [{...}],
  "messages": [
    {
      "role": "user",
      "content": "What's the current price of Apple stock?"
    },
    {
      "role": "assistant",
      "content": [
        {"type": "text", "text": "I'll check the current Apple stock price for you."},
        {
          "type": "tool_use",
          "id": "toolu_01D7FLrfh4GYq7yT1ULFeyMV",
          "name": "get_stock_price",
          "input": {"ticker": "AAPL"}
        }
      ]
    },
    {
      "role": "user",
      "content": [{
        "type": "tool_result",
        "tool_use_id": "toolu_01D7FLrfh4GYq7yT1ULFeyMV",
        "content": "150.25 USD"
      }]
    }
  ]
}
```

### Extended Thinking Mode

**What It Does:**
- Model shows internal reasoning process
- Returns `thinking` content blocks before text/tool_use
- Helps with complex multi-step reasoning
- Configurable thinking budget

**Request:**
```json
{
  "model": "claude-3-5-sonnet-20241022",
  "max_tokens": 2048,
  "thinking": {
    "type": "enabled",
    "budget_tokens": 1000
  },
  "tools": [{...}],
  "messages": [{
    "role": "user",
    "content": "Analyze this dataset and recommend next steps"
  }]
}
```

**Response:**
```json
{
  "content": [
    {
      "type": "thinking",
      "thinking": "Let me break this down: First I need to understand the data structure, then identify patterns, then formulate recommendations..."
    },
    {
      "type": "tool_use",
      "id": "toolu_123",
      "name": "analyze_data",
      "input": {...}
    }
  ]
}
```

### Browser Compatibility

✅ **Fully Browser Compatible**
- REST API with CORS support
- API key authentication (x-api-key header)
- JavaScript SDK: `@anthropic-ai/sdk`
- Streaming supported via Server-Sent Events

⚠️ **Security Consideration:** API keys should be protected; consider backend proxy for production.

### Multi-Step Orchestration

**Pattern: Client-Managed Conversation Loop**
```javascript
const anthropic = new Anthropic({apiKey: 'YOUR_KEY'});

let messages = [{
  role: 'user',
  content: 'Extract concepts, cluster them, and generate a report'
}];

const tools = [extractConceptsTool, clusterTool, reportTool];

// Agentic loop
let continueLoop = true;
while (continueLoop) {
  const response = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 4096,
    tools: tools,
    messages: messages
  });

  console.log(`Stop reason: ${response.stop_reason}`);

  // Add assistant response to conversation
  messages.push({
    role: 'assistant',
    content: response.content
  });

  if (response.stop_reason === 'tool_use') {
    // Extract tool use blocks
    const toolUseBlocks = response.content.filter(block => block.type === 'tool_use');

    // Execute tools
    const toolResults = [];
    for (const toolUse of toolUseBlocks) {
      console.log(`Executing: ${toolUse.name}`);
      const result = await executeFunction(toolUse.name, toolUse.input);

      toolResults.push({
        type: 'tool_result',
        tool_use_id: toolUse.id,
        content: JSON.stringify(result)
      });
    }

    // Add tool results to conversation
    messages.push({
      role: 'user',
      content: toolResults
    });
  } else if (response.stop_reason === 'end_turn') {
    continueLoop = false;
  } else {
    // Handle error
    console.error(`Unexpected stop reason: ${response.stop_reason}`);
    continueLoop = false;
  }
}

// Extract final text response
const finalText = messages[messages.length - 1].content
  .filter(block => block.type === 'text')
  .map(block => block.text)
  .join('\n');
```

**Orchestration Capabilities:**
- ✅ Plan sequences of tool calls (via extended thinking)
- ✅ Chain outputs (client manages conversation history)
- ⚠️ Error handling: Manual (check `stop_reason`, parse error messages)
- ⚠️ Progress reporting: Manual (client tracks conversation state)
- ⚠️ Retry logic: Client-side implementation required
- ✅ Parallel tool use: Multiple `tool_use` blocks in single response

---

## Multi-Step Pipeline Orchestration Patterns

### Pattern: Extract → Cluster → Generate Document

**Scenario:** User uploads documents → extract concepts → cluster by similarity → generate summary report

#### Gemini API Approach

```javascript
async function orchestratePipeline(documents) {
  const tools = [
    {functionDeclarations: [{name: 'extract_concepts', ...}]},
    {functionDeclarations: [{name: 'cluster_concepts', ...}]},
    {functionDeclarations: [{name: 'generate_report', ...}]}
  ];

  let interaction = await client.interactions.create({
    model: 'gemini-3-flash-preview',
    input: `Process these documents: ${documents}. First extract concepts, then cluster them, finally generate a report.`,
    tools: tools
  });

  const pipeline = ['extract_concepts', 'cluster_concepts', 'generate_report'];
  let pipelineIndex = 0;
  let pipelineData = {documents};

  while (pipelineIndex < pipeline.length) {
    for (const output of interaction.outputs) {
      if (output.type === 'function_call') {
        console.log(`Step ${pipelineIndex + 1}: ${output.name}`);

        // Execute function
        const result = await executePipelineStep(output.name, output.arguments);
        pipelineData[output.name] = result;

        // Send result back
        interaction = await client.interactions.create({
          model: 'gemini-3-flash-preview',
          previous_interaction_id: interaction.id,
          input: [{
            type: 'function_result',
            name: output.name,
            call_id: output.id,
            result: JSON.stringify(result)
          }]
        });

        pipelineIndex++;
      }
    }
  }

  return pipelineData;
}
```

#### OpenAI Assistants API Approach

```javascript
async function orchestratePipeline(documents) {
  // Create assistant with all tools
  const assistant = await openai.beta.assistants.create({
    model: 'gpt-4o',
    instructions: 'You orchestrate a pipeline: extract → cluster → report',
    tools: [
      {type: 'function', function: extractConceptsSchema},
      {type: 'function', function: clusterConceptsSchema},
      {type: 'function', function: generateReportSchema}
    ]
  });

  // Create thread with initial request
  const thread = await openai.beta.threads.create({
    messages: [{
      role: 'user',
      content: `Process documents through pipeline: ${JSON.stringify(documents)}`
    }]
  });

  // Run with automatic polling
  let run = await openai.beta.threads.runs.createAndPoll(thread.id, {
    assistant_id: assistant.id
  });

  // Handle tool calls in sequence
  while (run.status === 'requires_action') {
    const toolCalls = run.required_action.submit_tool_outputs.tool_calls;
    const toolOutputs = [];

    for (const call of toolCalls) {
      console.log(`Executing: ${call.function.name}`);
      const result = await executePipelineStep(
        call.function.name,
        JSON.parse(call.function.arguments)
      );

      toolOutputs.push({
        tool_call_id: call.id,
        output: JSON.stringify(result)
      });
    }

    // Submit and poll for next step
    run = await openai.beta.threads.runs.submitToolOutputsAndPoll(
      thread.id,
      run.id,
      {tool_outputs: toolOutputs}
    );
  }

  // Get final messages
  const messages = await openai.beta.threads.messages.list(thread.id);
  return messages.data[0].content[0].text.value;
}
```

#### Claude API Approach

```javascript
async function orchestratePipeline(documents) {
  const tools = [
    {name: 'extract_concepts', input_schema: {...}},
    {name: 'cluster_concepts', input_schema: {...}},
    {name: 'generate_report', input_schema: {...}}
  ];

  let messages = [{
    role: 'user',
    content: `Process documents: ${JSON.stringify(documents)}. Pipeline: extract concepts → cluster → generate report.`
  }];

  let continueLoop = true;
  const pipelineResults = {};

  while (continueLoop) {
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4096,
      thinking: {type: 'enabled', budget_tokens: 1000},
      tools: tools,
      messages: messages
    });

    // Add assistant response
    messages.push({role: 'assistant', content: response.content});

    if (response.stop_reason === 'tool_use') {
      const toolUseBlocks = response.content.filter(b => b.type === 'tool_use');
      const toolResults = [];

      for (const toolUse of toolUseBlocks) {
        console.log(`Executing: ${toolUse.name}`);
        const result = await executePipelineStep(toolUse.name, toolUse.input);
        pipelineResults[toolUse.name] = result;

        toolResults.push({
          type: 'tool_result',
          tool_use_id: toolUse.id,
          content: JSON.stringify(result)
        });
      }

      messages.push({role: 'user', content: toolResults});
    } else {
      continueLoop = false;
    }
  }

  return pipelineResults;
}
```

---

## Error Handling & Retry Patterns

### Gemini API

**Error Detection:**
```javascript
const output = interaction.outputs[0];
if (output.type === 'error') {
  console.error(`Error: ${output.error.message}`);
  // Retry logic
}
```

**Retry Pattern:**
```javascript
async function retryableInteraction(prompt, tools, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const interaction = await client.interactions.create({
        model: 'gemini-3-flash-preview',
        input: prompt,
        tools: tools
      });
      return interaction;
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(r => setTimeout(r, 1000 * (i + 1))); // Exponential backoff
    }
  }
}
```

### OpenAI API

**Error Detection (Assistants):**
```javascript
if (run.status === 'failed') {
  console.error(`Run failed: ${run.last_error.message}`);
  // Retry logic
}
```

**Retry Pattern:**
```javascript
async function retryableRun(threadId, assistantId, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      let run = await openai.beta.threads.runs.createAndPoll(threadId, {
        assistant_id: assistantId
      });

      if (run.status === 'failed') {
        if (i === maxRetries - 1) throw new Error(run.last_error.message);
        continue; // Retry
      }

      return run;
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(r => setTimeout(r, 1000 * (i + 1)));
    }
  }
}
```

### Claude API

**Error Detection:**
```javascript
if (response.stop_reason === 'max_tokens') {
  console.warn('Response truncated - increase max_tokens');
}

// Check for errors in tool results
const errorBlock = response.content.find(b => b.type === 'error');
if (errorBlock) {
  console.error(`Error: ${errorBlock.error}`);
}
```

**Retry Pattern:**
```javascript
async function retryableMessage(messages, tools, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4096,
        tools: tools,
        messages: messages
      });
      return response;
    } catch (error) {
      if (error.status === 529) { // Overloaded
        if (i === maxRetries - 1) throw error;
        await new Promise(r => setTimeout(r, 1000 * (i + 1)));
      } else {
        throw error; // Don't retry other errors
      }
    }
  }
}
```

---

## Progress Reporting Patterns

### Gemini API
```javascript
// Manual progress tracking
const steps = ['extract', 'cluster', 'report'];
let currentStep = 0;

for (const output of interaction.outputs) {
  if (output.type === 'function_call') {
    currentStep++;
    reportProgress({
      step: currentStep,
      total: steps.length,
      current: output.name,
      percentage: (currentStep / steps.length) * 100
    });
  }
}
```

### OpenAI Assistants API
```javascript
// Poll run status for progress
const pollInterval = setInterval(async () => {
  const run = await openai.beta.threads.runs.retrieve(threadId, runId);

  reportProgress({
    status: run.status,
    step: run.status === 'requires_action' ? 'awaiting_tool' : run.status
  });

  if (['completed', 'failed', 'cancelled'].includes(run.status)) {
    clearInterval(pollInterval);
  }
}, 1000);
```

### Claude API
```javascript
// Manual tracking via conversation turns
let turnCount = 0;
let toolCallCount = 0;

while (continueLoop) {
  const response = await anthropic.messages.create({...});
  turnCount++;

  const toolUses = response.content.filter(b => b.type === 'tool_use');
  toolCallCount += toolUses.length;

  reportProgress({
    turns: turnCount,
    toolCalls: toolCallCount,
    currentTools: toolUses.map(t => t.name)
  });
}
```

---

## Recommendation Matrix

| Use Case | Recommended API | Reason |
|----------|----------------|--------|
| **Simple tool calling** | Any | All support this equally well |
| **Complex multi-step orchestration** | OpenAI Assistants | Built-in state management, polling helpers |
| **Need code execution** | Gemini | Built-in `codeExecution` tool |
| **Need web search** | Gemini | Built-in `googleSearch` tool with grounding |
| **Browser-only app (no backend)** | Any | All support CORS and REST API |
| **Need deep reasoning** | Claude | Extended thinking mode |
| **Need structured outputs** | OpenAI | `strict: true` guarantees schema adherence |
| **Cost-sensitive** | Gemini | Generally lower pricing, free tier available |
| **Maximum control** | Claude | Client-managed state, flexible patterns |
| **Minimal implementation effort** | OpenAI Assistants | Automatic polling, state management |

---

## Implementation Checklist for Browser-Based App

### For All Providers:

- [ ] **Security:** Implement backend API proxy to protect API keys
- [ ] **CORS:** Configure CORS headers (usually handled automatically)
- [ ] **Error Handling:** Implement exponential backoff retry logic
- [ ] **Rate Limiting:** Track and respect API rate limits
- [ ] **Streaming:** Implement SSE parsing for real-time responses
- [ ] **State Management:** Store conversation history (IndexedDB or localStorage)
- [ ] **Progress UI:** Show loading states, current step, tool execution
- [ ] **Cancellation:** Allow user to cancel long-running operations

### Gemini-Specific:

- [ ] Implement Interactions API conversation flow
- [ ] Handle `function_call` responses and `function_result` submissions
- [ ] Parse `executableCode` and `codeExecutionResult` blocks
- [ ] Display grounding citations from `googleSearch` results

### OpenAI-Specific:

- [ ] Choose between Chat Completions (stateless) or Assistants (stateful)
- [ ] If using Assistants: implement thread/run polling logic
- [ ] Handle `requires_action` status and `submit_tool_outputs`
- [ ] Parse parallel tool calls correctly

### Claude-Specific:

- [ ] Implement agentic loop (`while` loop checking `stop_reason`)
- [ ] Handle multiple `tool_use` blocks in single response
- [ ] Submit multiple `tool_result` blocks in single message
- [ ] Parse `thinking` blocks if using extended thinking mode

---

## Sample Code: Complete Pipeline Orchestration

See individual sections above for provider-specific implementations.

**Key Principles for All Providers:**

1. **Define tools clearly** with detailed descriptions and schemas
2. **Manage conversation state** (client-side or server-side)
3. **Execute tools** when requested by the model
4. **Submit results** back to continue the conversation
5. **Handle errors** gracefully with retries
6. **Report progress** to keep users informed
7. **Loop until completion** (check `stop_reason` or `status`)

---

## Sources

- [Gemini API Function Calling Tutorial](https://ai.google.dev/gemini-api/docs/function-calling/tutorial_hl=sq)
- [Gemini API Code Execution](https://ai.google.dev/gemini-api/docs/migrate_hl=id)
- [Gemini API Google Search Grounding](https://ai.google.dev/gemini-api/docs/google-search)
- [Gemini API Interactions](https://ai.google.dev/gemini-api/docs/interactions_hl=ar)
- [OpenAI Assistants API Function Calling](https://platform.openai.com/docs/assistants/tools/function-calling)
- [OpenAI Function Calling Guide](https://platform.openai.com/docs/guides/function-calling)
- [OpenAI API Reference](https://platform.openai.com/docs/api-reference)
- [Claude API Tool Use](https://platform.claude.com/docs/en/api/messages/create)
- [Anthropic Cookbook - Tool Use Examples](https://github.com/anthropics/anthropic-cookbook)
- [Claude Extended Thinking](https://github.com/anthropics/anthropic-cookbook/blob/main/extended_thinking/extended_thinking_with_tool_use.ipynb)
