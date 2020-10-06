const modules = require('../modules');
const prefix = modules.constObj.prefix;

module.exports = {
    name: modules.cmdList.helpCmd,
    description: modules.cmdTxt.helpGeneric,
    execute(Discord, bot, msg, args) {
        'use strict';

        const dev = bot.users.cache.get(modules.constObj.devID);
        const devTag = dev.tag;
        const devIcon = dev.avatarURL();

        const helpEmbed = new Discord.MessageEmbed();

        const cmd = args[0];
        let cmdHelp;

        if (!msg.guild && args[0] === modules.cmdList.leaveCmd) {
            if (!bot.guilds.cache.get(modules.constObj.serverID).available) return;

            const memberRoles = bot.guilds.cache.get(modules.constObj.serverID).members.cache.get(msg.author.id).roles.cache;

            if (!memberRoles.some(roles => modules.constObj.nonCadet.includes(roles.id))) {
                helpEmbed.setTitle(`Command: ${prefix}${modules.cmdList.leaveCmd}`);
                helpEmbed.setColor(modules.constObj.grey);
                helpEmbed.setDescription(modules.helpObj.helpLeave);
                msg.author.send(helpEmbed);
            }
            return;
        }

        if (msg.guild) msg.delete().catch(error => modules.debugError(Discord, bot, error, `Error deleting message in ${msg.channel}.`, 'Message', msg.content));

        let commandList = modules.helpObj.helpAll;

        if (cmd === modules.cmdList.helpCmd) createHelpEmbed(modules.cmdList.helpCmd, modules.helpObj.helpHelp);

        if (!msg.member.roles.cache.some(roles => modules.constObj.nonCadet.includes(roles.id))) {
            commandList = modules.helpObj.helpCadet;

            if (cmd === modules.cmdList.leaveCmd) createHelpEmbed(modules.cmdList.leaveCmd, modules.helpObj.helpLeave);
        }

        if (msg.member.roles.cache.some(roles => modules.constObj.tacPlus.includes(roles.id))) {
            commandList = modules.helpObj.helpTacPlus;

            if (cmd === modules.cmdList.leaveForCmd) createHelpEmbed(modules.cmdList.leaveForCmd, modules.helpObj.helpLeaveFor);
            else if (cmd === modules.cmdList.attendanceCmd) createHelpEmbed(modules.cmdList.attendanceCmd, modules.helpObj.helpAttendance);
        }

        if (msg.member.roles.cache.some(roles => modules.constObj.sgtPlus.includes(roles.id))) {
            commandList = modules.helpObj.helpSgtPlus;

            if (cmd === modules.cmdList.connectedCmd) createHelpEmbed(modules.cmdList.connectedCmd, modules.helpObj.helpConnected);
        }

        if (msg.member.roles.cache.some(roles => modules.constObj.cqmsPlus.includes(roles.id))) {
            commandList = modules.helpObj.helpCqmsPlus;

            if (cmd === modules.cmdList.archiveCmd) createHelpEmbed(modules.cmdList.archiveCmd, modules.helpObj.helpArchive);
        }

        if (msg.member.roles.cache.some(roles => modules.constObj.adjPlus.includes(roles.id))) {
            commandList = modules.helpObj.helpAdjPlus;

            if (cmd === modules.cmdList.purgeCmd) createHelpEmbed(modules.cmdList.purgeCmd, modules.helpObj.helpPurge);
        }

        if (msg.author.id === modules.constObj.devID) {
            commandList = modules.helpObj.helpDev;

            if (cmd === modules.cmdList.pingCmd) createHelpEmbed(modules.cmdList.pingCmd, modules.helpObj.helpPing);
            else if (cmd === modules.cmdList.uptimeCmd) createHelpEmbed(modules.cmdList.uptimeCmd, modules.helpObj.helpUptime);
            else if (cmd === modules.cmdList.restartCmd) createHelpEmbed(modules.cmdList.restartCmd, modules.helpObj.helpRestart);
        }

        if (!cmdHelp) {
            helpEmbed.setTitle('Commands List');
            helpEmbed.setThumbnail('https://i.imgur.com/EzmJVyV.png');
            helpEmbed.setColor(modules.constObj.yellow);
            helpEmbed.setDescription(commandList);
            helpEmbed.setFooter('Developed by ' + devTag, devIcon);

            if (!msg.member.roles.cache.some(roles => modules.constObj.adjPlus.includes(roles.id)) && msg.author.id !== modules.constObj.devID) {
                helpEmbed.addField('Note', `Only displaying commands available to ${msg.author}.`);
            }

            msg.author.send(helpEmbed).catch(error => modules.dmError(Discord, bot, msg));
        }

        else msg.channel.send(helpEmbed);

        function createHelpEmbed(command, text) {
            helpEmbed.setTitle(`Command: ${prefix}${command}`);
            helpEmbed.setColor(modules.constObj.grey);
            helpEmbed.setDescription(text);
            helpEmbed.setFooter(`Requested by ${msg.member.displayName}`);
            cmdHelp = true;
        }
    },
};