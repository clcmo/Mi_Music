const { ok, fail } = require('./result');

const MIN_PURGE = 2;
const MAX_PURGE = 100;

class ModerationViewModel {
  constructor(moderationRepository) {
    this.repository = moderationRepository;
  }

  async ban(ctx, user) {
    if (!ctx.permissions.canBan) return fail('NO_PERMISSION');
    try {
      await this.repository.ban(ctx.guild, user);
      return ok('banned', { username: user.username });
    } catch (error) {
      console.error(error);
      return fail('BAN_FAILED');
    }
  }

  async purge(ctx, count) {
    if (!ctx.permissions.canManageMessages) return fail('NO_PERMISSION');
    if (!Number.isInteger(count) || count < MIN_PURGE || count > MAX_PURGE) return fail('INVALID_COUNT');
    try {
      await this.repository.purge(ctx.textChannel, count);
      return ok('purged');
    } catch (error) {
      console.error(error);
      return fail('PURGE_FAILED');
    }
  }

  userInfo(user) {
    return ok('userInfo', user); // { username, id, avatarUrl }
  }
}

module.exports = { ModerationViewModel };
