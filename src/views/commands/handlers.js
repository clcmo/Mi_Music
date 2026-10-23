const respond = require('../respond');

/** Maps each slash command to one ViewModel call. No business rules here. */
module.exports = function createHandlers({ playback, queue, moderation, help }) {
  const int = (i, name) => i.options.getInteger(name);
  const playHooks = i => ({
    onSearching: () => i.deferReply(),
    onLoading: isPlaylist => respond(i, { content: `⏱ | Loading your ${isPlaylist ? 'playlist' : 'track'}...` }),
  });

  return {
    play: (i, ctx) => playback.play(ctx, i.options.getString('query'), playHooks(i)),
    playtop: (i, ctx) => playback.play(ctx, i.options.getString('query'), { ...playHooks(i), top: true }),
    pause: (i, ctx) => playback.pause(ctx),
    resume: (i, ctx) => playback.resume(ctx),
    skip: (i, ctx) => playback.skip(ctx),
    stop: (i, ctx) => playback.stop(ctx),
    volume: (i, ctx) => playback.setVolume(ctx, int(i, 'volume')),
    repeat: (i, ctx) => playback.setRepeat(ctx, int(i, 'mode')),

    queue: (i, ctx) => queue.list(ctx),
    playing: (i, ctx) => queue.nowPlaying(ctx),
    shuffle: (i, ctx) => queue.shuffle(ctx),
    move: (i, ctx) => queue.move(ctx, int(i, 'track'), int(i, 'position')),
    swap: (i, ctx) => queue.swap(ctx, int(i, 'track1'), int(i, 'track2')),
    remove: (i, ctx) => queue.remove(ctx, int(i, 'number')),

    ban: (i, ctx) => moderation.ban(ctx, i.options.getUser('user')),
    purge: (i, ctx) => moderation.purge(ctx, int(i, 'num')),
    getuser: i => {
      const user = i.options.getUser('user');
      return moderation.userInfo({ username: user.username, id: user.id, avatarUrl: user.displayAvatarURL() });
    },
    help: () => help.list(),
  };
};
