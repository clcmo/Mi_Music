const { fail } = require('./result');

/** ctx is a plain object built by the View: { voiceChannelId, botVoiceChannelId, guildId, ... } */
function voiceGuard(ctx) {
  if (!ctx.voiceChannelId) return fail('NOT_IN_VOICE');
  if (ctx.botVoiceChannelId && ctx.botVoiceChannelId !== ctx.voiceChannelId) return fail('NOT_IN_BOT_VOICE');
  return null;
}

/** Runs `action(session)` only if the user is in the bot's channel and something is playing. */
async function withPlayingSession(repository, ctx, action) {
  const denied = voiceGuard(ctx);
  if (denied) return denied;

  const session = repository.getSession(ctx.guildId);
  if (!session || !session.isPlaying) return fail('NOT_PLAYING');

  try {
    return await action(session);
  } catch (error) {
    console.error(error);
    return fail('UNKNOWN');
  }
}

module.exports = { voiceGuard, withPlayingSession };
