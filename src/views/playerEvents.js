/** Player events → messages in the text channel where the queue was started. */
module.exports = function registerPlayerEvents(playerRepository) {
  const send = (event, content) => event.textChannel.send(content).catch(console.error);

  playerRepository.subscribe({
    error: e => console.log(`[${e.guildName}] Error emitted from the queue: ${e.message}`),
    connectionError: e => console.log(`[${e.guildName}] Error emitted from the connection: ${e.message}`),
    trackStart: e => send(e, `▶ | Started playing: **${e.track.title}** in **${e.voiceChannelName}**!`),
    tracksAdd: e => send(e, `🎶 | **${e.count}** tracks queued!`),
    trackAdd: e => send(e, `🎶 | Track **${e.track.title}** queued!`),
    botDisconnect: e => send(e, '❌ | I was manually disconnected from the voice channel, clearing queue!'),
    channelEmpty: e => send(e, '❌ | Nobody is in the voice channel, leaving...'),
    queueEnd: e => send(e, '✅ | Queue finished!'),
  });
};
