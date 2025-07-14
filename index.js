// GCM Aprovação Bot – Aprovar ou Reprovar Recrutas

const { Client, GatewayIntentBits, Partials, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle, Events } = require('discord.js');
require('dotenv').config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages
  ],
  partials: [Partials.Message, Partials.Channel, Partials.GuildMember]
});

const TOKEN = process.env.TOKEN;
const CANAL_ID = process.env.CANAL_ID;
const CARGO_APROVADO_REC_ID = process.env.CARGO_APROVADO_REC_ID;
const CANAL_APROVADOS_ID = process.env.CANAL_APROVADOS_ID;
const CANAL_REPROVADOS_ID = process.env.CANAL_REPROVADOS_ID;
const CANAL_REGISTRO_ID = process.env.CANAL_REGISTRO_ID;
const express = require('express');

client.once('ready', async () => {
  console.log(`🤖 Bot de Aprovação online como ${client.user.tag}`);

  const canal = await client.channels.fetch(CANAL_ID);

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('aprovar_modal')
      .setLabel('✅ Aprovar')
      .setStyle(ButtonStyle.Success),

    new ButtonBuilder()
      .setCustomId('reprovar_modal')
      .setLabel('❌ Reprovar')
      .setStyle(ButtonStyle.Danger)
  );

  await canal.send({
    content: '**📋 BOTÕES DE AVALIAÇÃO – USE PARA APROVAR OU REPROVAR USUÁRIOS**',
    components: [row]
  });
});

client.on(Events.InteractionCreate, async interaction => {
  if (interaction.isButton()) {
    if (interaction.customId === 'aprovar_modal' || interaction.customId === 'reprovar_modal') {
      const modal = new ModalBuilder()
        .setCustomId(interaction.customId === 'aprovar_modal' ? 'modal_aprovar' : 'modal_reprovar')
        .setTitle(interaction.customId === 'aprovar_modal' ? 'Aprovar Recruta' : 'Reprovar Recruta')
        .addComponents(
          new ActionRowBuilder().addComponents(
            new TextInputBuilder()
              .setCustomId('mencao')
              .setLabel('Mencione o usuário (@user)')
              .setStyle(TextInputStyle.Short)
              .setRequired(true)
          )
        );
      await interaction.showModal(modal);
    }
  }

  if (interaction.isModalSubmit()) {
    const mencao = interaction.fields.getTextInputValue('mencao');
    const idMatch = mencao.match(/<@!?(\d+)>/) || mencao.match(/(\d{17,19})/);
    if (!idMatch) {
      return await interaction.reply({ content: '❌ Mencione um usuário válido ou cole o ID correto.', ephemeral: true });
    }

    const membro = await interaction.guild.members.fetch(idMatch[1]).catch(() => null);
    if (!membro) {
      return await interaction.reply({ content: '❌ Usuário não encontrado no servidor.', ephemeral: true });
    }



    if (!membro) {
      return await interaction.reply({ content: '❌ Usuário não encontrado no servidor.', ephemeral: true });
    }

    if (interaction.customId === 'modal_aprovar') {
      try {
        await membro.roles.add(CARGO_APROVADO_REC_ID);

        const canalAprovados = await client.channels.fetch(CANAL_APROVADOS_ID);
        await canalAprovados.send(
          `**Parabénsss <@${membro.id}> 👏👏👏!! Você Foi Aprovado no Recrutamento/Edital Da GCM TÁTICA 👮**\n` +
          `Faça seu registro em <#${CANAL_REGISTRO_ID}>\n` +
          `Aprovado Por ${interaction.user}`
        );

        await interaction.reply({ content: `✅ ${mencao} aprovado com sucesso.`, ephemeral: true });
      } catch (err) {
        console.error(err);
        await interaction.reply({ content: '❌ Erro ao aprovar o usuário.', ephemeral: true });
      }
    }

    if (interaction.customId === 'modal_reprovar') {
      try {
        const canalReprovados = await client.channels.fetch(CANAL_REPROVADOS_ID);
        await canalReprovados.send(
          `**Olá <@${membro.id}> ! ❌Infelizmente Você Foi Reprovado no Recrutamento/Edital Da GCM TÁTICA! Estude Mais e Tente Novamente Outro Dia, Boa Sorte**!`
        );

        await interaction.reply({ content: `❌ ${mencao} reprovado.`, ephemeral: true });
      } catch (err) {
        console.error(err);
        await interaction.reply({ content: '❌ Erro ao reprovar o usuário.', ephemeral: true });
      }
    }
  }
});

client.login(TOKEN);

// Servidor web para manter o bot online com UptimeRobot
const app = express();

app.get('/', (req, res) => {
  res.send('🤖 Bot de Registro GCM TÁTICA está online!');
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🌐 Servidor web iniciado na porta ${PORT} para UptimeRobot`);
});

