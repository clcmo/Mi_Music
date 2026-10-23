const { Client, GatewayIntentBits, PresenceUpdateStatus } = require('discord.js');
const config = require('../config.json');

const { PlayerRepository } = require('./models/PlayerRepository');
const { ModerationRepository } = require('./models/ModerationRepository');
const { PlaybackViewModel } = require('./viewmodels/PlaybackViewModel');
const { QueueViewModel } = require('./viewmodels/QueueViewModel');
const { ModerationViewModel } = require('./viewmodels/ModerationViewModel');
const { HelpViewModel } = require('./viewmodels/HelpViewModel');
const definitions = require('./views/commands/definitions');
const createHandlers = require('./views/commands/handlers');
const registerInteractionRouter = require('./views/InteractionRouter');
const registerPlayerEvents = require('./views/playerEvents');
const registerDeploy = require('./views/deployCommand');

async function start() {
  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildVoiceStates,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
    ],
  });

  // Model
  const players = new PlayerRepository(client);
  await players.init();
  const moderationData = new ModerationRepository();

  // ViewModel
  const handlers = createHandlers({
    playback: new PlaybackViewModel(players),
    queue: new QueueViewModel(players),
    moderation: new ModerationViewModel(moderationData),
    help: new HelpViewModel(definitions),
  });

  // View
  registerPlayerEvents(players);
  registerDeploy(client, definitions);
  registerInteractionRouter(client, handlers);

  client.once('ready', () => {
    console.log('Ready!');
    client.user.setPresence({
      activities: [{ name: config.activity, type: Number(config.activityType) }],
      status: PresenceUpdateStatus.Online,
    });
  });

  client.login(process.env.DISCORD_TOKEN);
  return client;
}

module.exports = { start };
