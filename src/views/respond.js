/** Replies, or follows up if the interaction was already deferred/answered. */
module.exports = function respond(interaction, payload) {
  return interaction.deferred || interaction.replied ? interaction.followUp(payload) : interaction.reply(payload);
};
