class ModerationRepository {
  ban(guild, user) {
    return guild.members.ban(user);
  }

  async purge(channel, count) {
    const messages = await channel.messages.fetch({ limit: count });
    return channel.bulkDelete(messages, true); // true: skip messages older than 14 days instead of failing
  }
}

module.exports = { ModerationRepository };
