/** `!deploy` (bot owner only) registers the slash commands in the current guild. */
module.exports = function registerDeploy(client, definitions) {
  client.on('messageCreate', async message => {
    if (message.author.bot || !message.guild || message.content !== '!deploy') return;

    if (!client.application?.owner) await client.application?.fetch();
    const owner = client.application?.owner;
    const ownerId = owner?.ownerId ?? owner?.id; // Team owners expose ownerId
    if (message.author.id !== ownerId) return;

    try {
      await message.guild.commands.set(definitions);
      await message.reply('Deployed!');
    } catch (error) {
      console.error(error);
      await message.reply('Could not deploy commands! Make sure the bot has the application.commands permission!');
    }
  });
};
