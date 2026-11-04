const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder, ChannelType, PermissionFlagsBits } = require('discord.js');
require('dotenv').config();

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

const commands = [
  new SlashCommandBuilder()
    .setName('setup-server')
    .setDescription('Set up Burger & Grill Cafe Discord server')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
].map(command => command.toJSON());

client.once('ready', async () => {
  console.log(`Logged in as ${client.user.tag}!`);

  const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

  try {
    await rest.put(
      Routes.applicationCommands(client.user.id),
      { body: commands }
    );
    console.log('Setup command registered!');
  } catch (error) {
    console.error(error);
  }
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;
  if (interaction.commandName !== 'setup-server') return;

  if (!interaction.memberPermissions.has(PermissionFlagsBits.Administrator)) {
    return interaction.reply({ content: 'You need Administrator permissions!', ephemeral: true });
  }

  await interaction.reply({ content: '🍔 Starting Burger & Grill Cafe setup!', ephemeral: true });

  const guild = interaction.guild;

  const roles = [
    'Founder',
    'Co-Founder',
    'President',
    'Vice President',
    'Chief Executive Officer',
    'Executive Director',
    'Corporate Director',
    'Chief Corporate Officer',
    'Senior Corporate Officer',
    'Corporate Officer',
    'Junior Corporate',
    'Corporate Intern',
    'General Manager',
    'Branch Manager',
    'Staff',
    'Customer'
  ];

  for (const role of roles) {
    if (!guild.roles.cache.some(r => r.name === role)) {
      await guild.roles.create({ name: role });
    }
  }

  const categories = {
    '🍔 INFORMATION': [
      'welcome',
      'announcements',
      'rules',
      'server-information'
    ],
    '☕ COMMUNITY': [
      'general-chat',
      'media',
      'suggestions'
    ],
    '🧑‍💼 MANAGEMENT': [
      'management-chat',
      'staff-announcements',
      'promotion-logs',
      'staff-discussion'
    ],
    '📋 APPLICATIONS': [
      'applications',
      'demotion-requests',
      'ranker-requests'
    ],
    '🎓 TRAINING': [
      'training-announcements',
      'training-chat',
      'mass-shifts'
    ]
  };

  for (const [category, channels] of Object.entries(categories)) {
    let parent = guild.channels.cache.find(
      c => c.name === category && c.type === ChannelType.GuildCategory
    );

    if (!parent) {
      parent = await guild.channels.create({
        name: category,
        type: ChannelType.GuildCategory
      });
    }

    for (const channel of channels) {
      if (!guild.channels.cache.some(c => c.name === channel)) {
        await guild.channels.create({
          name: channel,
          type: ChannelType.GuildText,
          parent: parent.id
        });
      }
    }
  }

  await interaction.followUp({
    content: '✅ Burger & Grill Cafe server setup completed!',
    ephemeral: true
  });
});

client.login(process.env.DISCORD_TOKEN);
