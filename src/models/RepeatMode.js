// Re-export so upper layers never import the player library directly.
const { QueueRepeatMode } = require('discord-player');

module.exports = { RepeatMode: QueueRepeatMode };
