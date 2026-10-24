const { GuildMember, PermissionFlagsBits } = require('discord.js');

/** Turns a Discord interaction into the plain context object ViewModels work with. */
module.exports = function buildContext(interaction) {
  const member = interaction.member instanceof GuildMember ? interaction.member : null;
  const voiceChannel = member?.voice.channel ?? null;
  const perms = interaction.memberPermissions;

  return {
    guild: interaction.guild,
    guildId: interaction.guildId,
    user: interaction.user,
    textChannel: interaction.channel,
    voiceChannel,
    voiceChannelId: voiceChannel?.id ?? null,
    botVoiceChannelId: interaction.guild?.members.me?.voice.channelId ?? null,
    permissions: {
      canBan: Boolean(perms?.has(PermissionFlagsBits.BanMembers)),
      canManageMessages: Boolean(perms?.has(PermissionFlagsBits.ManageMessages)),
    },
  };
};
