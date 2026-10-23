const buildContext = require('./interactionContext');
const present = require('./presenters');
const respond = require('./respond');

module.exports = function registerInteractionRouter(client, handlers) {
  client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;
    const handler = handlers[interaction.commandName.toLowerCase()];
    if (!handler) return;

    try {
      const result = await handler(interaction, buildContext(interaction));
      const payload = present(result);
      if (payload) await respond(interaction, payload);
    } catch (error) {
      console.error(error);
      await respond(interaction, {
        content: 'There was an error trying to execute that command!',
        ephemeral: true,
      }).catch(() => {});
    }
  });
};
