const { RepeatMode } = require('../models/RepeatMode');

const trim = (text, max) => (text.length > max ? `${text.slice(0, max - 3)}...` : text);
const numbered = tracks => tracks.map((t, i) => `${i + 1}. ${t.title}`).join('\n');
const text = content => ({ content });
const hidden = content => ({ content, ephemeral: true });

const errors = {
  NOT_IN_VOICE: hidden('You are not in a voice channel!'),
  NOT_IN_BOT_VOICE: hidden('You are not in my voice channel!'),
  NO_PERMISSION: hidden("You don't have permission to use this command."),
  INVALID_COUNT: hidden('Please provide a number between 2 and 100 for the number of messages to delete'),
  BAN_FAILED: hidden('Sorry, an error occured.'),
  PURGE_FAILED: hidden("Couldn't delete messages."),
  NOT_PLAYING: text('❌ | No music is being played!'),
  NO_RESULTS: text('No results were found!'),
  CANNOT_JOIN: text('Could not join your voice channel!'),
  INVALID_POSITION: text('❌ | That track number is not in the queue!'),
  EMPTY_QUEUE: text('There is no song in the queue!'),
  REPEAT_FAILED: text('❌ | Could not update loop mode!'),
  UNKNOWN: text('❌ | Something went wrong!'),
};

const repeatIcon = mode => (mode === RepeatMode.TRACK ? '🔂' : mode === RepeatMode.QUEUE ? '🔁' : '▶');

const queueEmbed = ({ current, upcoming }) => {
  const next = upcoming.length ? `\n\nUp next:\n${numbered(upcoming)}` : '';
  return { embeds: [{ title: 'Now Playing', description: trim(`🎶 | **${current.title}**!${next}`, 4095) }] };
};

const success = {
  started: () => null, // already announced through onLoading and the trackStart event
  paused: () => text('⏸ | Paused!'),
  resumed: () => text('▶ | Resumed!'),
  stopped: () => text('🛑 | Stopped the player!'),
  skipped: ({ track }) => text(`✅ | Skipped **${track.title}**!`),
  volume: ({ volume }) => text(`🔊 | Volume set to ${volume}!`),
  repeat: ({ mode }) => text(`${repeatIcon(mode)} | Updated loop mode!`),
  removed: ({ track }) => text(`✅ | Removed **${track.title}**!`),
  moved: ({ track }) => text(`✅ | Moved **${track.title}**!`),
  swapped: ({ first, second }) => text(`✅ | Swapped **${first.title}** & **${second.title}**!`),
  queue: queueEmbed,
  nowPlaying: ({ current, percent, bar }) => ({
    embeds: [
      {
        title: 'Now Playing',
        description: `🎶 | **${current.title}**! (\`${percent}%\`)`,
        fields: [{ name: '\u200b', value: bar }],
        color: 0xffffff,
      },
    ],
  }),
  banned: ({ username }) => hidden(`${username} was banned.`),
  purged: () => hidden('Successfully deleted messages'),
  userInfo: ({ username, id, avatarUrl }) => hidden(`Name: ${username}, ID: ${id}, Avatar: ${avatarUrl}`),
  help: ({ commands }) => hidden(commands.map(c => `Name: ${c.name}, Description: ${c.description}`).join('\n')),
};

/** ViewModel result → Discord message payload (or null when there is nothing to send). */
module.exports = function present(result) {
  if (!result.ok) return errors[result.error] ?? errors.UNKNOWN;
  return success[result.type]?.(result.data) ?? null;
};
