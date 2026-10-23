// Needs discord.js installed: guarantees every slash command has a handler and vice versa.
const test = require('node:test');
const assert = require('node:assert/strict');
const definitions = require('../src/views/commands/definitions');
const createHandlers = require('../src/views/commands/handlers');

test('definitions and handlers stay in sync', () => {
  const handlers = createHandlers({ playback: {}, queue: {}, moderation: {}, help: {} });
  assert.deepEqual(definitions.map(d => d.name).sort(), Object.keys(handlers).sort());
});
