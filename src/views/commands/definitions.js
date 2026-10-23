const { ApplicationCommandOptionType: Type, PermissionFlagsBits } = require('discord.js');
const { RepeatMode } = require('../../models/RepeatMode');

const queryOption = { name: 'query', type: Type.String, description: 'The song you want to play', required: true };
const trackOption = (name, description) => ({ name, type: Type.Integer, description, required: true });

/** Slash-command metadata only; behaviour lives in handlers.js. */
module.exports = [
  { name: 'play', description: 'Play a song in your channel!', options: [queryOption] },
  { name: 'playtop', description: 'Play a song before the next in your channel!', options: [queryOption] },
  { name: 'pause', description: 'Pause current song!' },
  { name: 'resume', description: 'Resume current song!' },
  { name: 'skip', description: 'Skip a song!' },
  { name: 'stop', description: 'Stop all songs in the queue!' },
  {
    name: 'volume',
    description: 'Change the volume!',
    options: [trackOption('volume', 'Number between 0-200')],
  },
  {
    name: 'repeat',
    description: 'Sets loop mode',
    options: [
      {
        name: 'mode',
        type: Type.Integer,
        description: 'Loop type',
        required: true,
        choices: [
          { name: 'Off', value: RepeatMode.OFF },
          { name: 'Track', value: RepeatMode.TRACK },
          { name: 'Queue', value: RepeatMode.QUEUE },
          { name: 'Autoplay', value: RepeatMode.AUTOPLAY },
        ],
      },
    ],
  },
  { name: 'queue', description: 'View the queue of current songs!' },
  { name: 'playing', description: 'Get the song that is currently playing.' },
  { name: 'shuffle', description: 'shuffle the queue!' },
  {
    name: 'move',
    description: 'move song position in the queue!',
    options: [trackOption('track', 'The track number you want to move'), trackOption('position', 'The position to move it to')],
  },
  {
    name: 'swap',
    description: 'swap song positions in the queue!',
    options: [trackOption('track1', 'The track number you want to swap'), trackOption('track2', 'The track number you want to swap')],
  },
  { name: 'remove', description: 'remove a song from the queue!', options: [trackOption('number', 'The queue number you want to remove')] },
  {
    name: 'ban',
    description: 'Ban a player',
    defaultMemberPermissions: PermissionFlagsBits.BanMembers,
    options: [{ name: 'user', type: Type.User, description: 'The user you want to ban', required: true }],
  },
  {
    name: 'purge',
    description: 'Delete the last messages in this channel.',
    defaultMemberPermissions: PermissionFlagsBits.ManageMessages,
    options: [{ ...trackOption('num', 'The number of messages you want to delete. (max 100)'), minValue: 2, maxValue: 100 }],
  },
  {
    name: 'getuser',
    description: 'Get information about a user.',
    options: [{ name: 'user', type: Type.User, description: 'The user you want to get info about', required: true }],
  },
  { name: 'help', description: 'List all available commands.' },
];
