const { ok, fail } = require('./result');
const { voiceGuard, withPlayingSession } = require('./guards');

const MIN_VOLUME = 0;
const MAX_VOLUME = 200;

class PlaybackViewModel {
  constructor(playerRepository) {
    this.repository = playerRepository;
  }

  /**
   * hooks.onSearching: called once the user passed validation (View may defer its reply)
   * hooks.onLoading(isPlaylist): called right before playback starts
   */
  async play(ctx, query, { top = false, onSearching, onLoading } = {}) {
    const denied = voiceGuard(ctx);
    if (denied) return denied;

    try {
      await onSearching?.();
      const found = await this.repository.search(query, ctx.user);
      if (!found) return fail('NO_RESULTS');

      let session;
      try {
        session = await this.repository.openSession(ctx);
      } catch {
        return fail('CANNOT_JOIN');
      }

      await onLoading?.(found.isPlaylist);
      session.add(found, { top });
      await session.playIfIdle();
      return ok('started');
    } catch (error) {
      console.error(error);
      return fail('UNKNOWN');
    }
  }

  pause(ctx) {
    return withPlayingSession(this.repository, ctx, s => (s.pause() ? ok('paused') : fail('UNKNOWN')));
  }

  resume(ctx) {
    return withPlayingSession(this.repository, ctx, s => (s.resume() ? ok('resumed') : fail('UNKNOWN')));
  }

  stop(ctx) {
    return withPlayingSession(this.repository, ctx, s => {
      s.destroy();
      return ok('stopped');
    });
  }

  skip(ctx) {
    return withPlayingSession(this.repository, ctx, s => {
      const track = s.current;
      return s.skip() ? ok('skipped', { track }) : fail('UNKNOWN');
    });
  }

  setVolume(ctx, requested) {
    const volume = Math.min(MAX_VOLUME, Math.max(MIN_VOLUME, requested));
    return withPlayingSession(this.repository, ctx, s =>
      s.setVolume(volume) ? ok('volume', { volume }) : fail('UNKNOWN'),
    );
  }

  setRepeat(ctx, mode) {
    return withPlayingSession(this.repository, ctx, s =>
      s.setRepeatMode(mode) ? ok('repeat', { mode }) : fail('REPEAT_FAILED'),
    );
  }
}

module.exports = { PlaybackViewModel };
