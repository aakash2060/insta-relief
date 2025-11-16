const Anthropic = require("@anthropic-ai/sdk");
const { tools } = require("./tools");
const { toolHandlers } = require("./handlers");

const client = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY
});

exports.runClaudeAgent = async function (userQuery) {
  const msg = await client.messages.create({
    model: "claude-3-5-sonnet",
    max_tokens: 1000,
    tools,
    messages: [
      {
        role: "system",
        content: `
          You are the Admin Automation Agent.
          You generate simulated disasters, validate users, and automate admin tasks.
          NEVER produce real emergency alerts.
        `
      },
      {
        role: "user",
        content: userQuery
      }
    ]
  });

  const toolCall = msg.content?.find(x => x.type === "tool_use");

  if (!toolCall) {
    return msg.content;
  }

  const handler = toolHandlers[toolCall.name];
  const result = await handler(toolCall.input);

  const final = await client.messages.create({
    model: "claude-3-5-sonnet",
    max_tokens: 800,
    messages: [
      ...msg.messages,
      {
        role: "tool",
        content: JSON.stringify(result),
        tool_call_id: toolCall.id
      }
    ]
  });

  return final.content;
};
