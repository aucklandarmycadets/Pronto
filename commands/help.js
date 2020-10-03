const modules = require('../modules');
const prefix = modules.constObj.prefix;
var devTag;
var devIcon;

module.exports = {
    name: modules.cmdList.helpCmd,
    description: modules.cmdTxt.helpGeneric,
    execute(Discord, bot, msg, args) {
        var showCmdList = true;
        var embedDM = false;

        cmd = args[0];

        dev = bot.users.cache.get(modules.constObj.devID);
        devTag = dev.tag;
        devIcon = dev.avatarURL();

        if (msg.guild === null && args[0] === modules.cmdList.leaveCmd) {
            var memberRoles = bot.guilds.cache.get(modules.constObj.serverID).members.cache.get(msg.author.id).roles.cache;

            if (!memberRoles.some(roles=>modules.constObj.nonCadet.includes(roles.id))) {
                helpEmbed = new Discord.MessageEmbed()
                    .setTitle(`Command: ${prefix}${modules.cmdList.leaveCmd}`)
                    .setColor(modules.constObj.grey)
                    .setDescription(modules.helpObj.helpLeave);
                msg.author.send(helpEmbed);
            }
            return;
        }

        if (msg.guild) msg.delete();

        commandList = modules.helpObj.helpAll;

        if (cmd === modules.cmdList.helpCmd) createHelpEmbed(modules.cmdList.helpCmd, modules.helpObj.helpHelp);

        if (!msg.member.roles.cache.some(roles=>modules.constObj.nonCadet.includes(roles.id))) {
            commandList = modules.helpObj.helpCadet;

            if (cmd === modules.cmdList.leaveCmd) createHelpEmbed(modules.cmdList.leaveCmd, modules.helpObj.helpLeave);
        }

        if (msg.member.roles.cache.some(roles=>modules.constObj.tacPlus.includes(roles.id))) {
            commandList = modules.helpObj.helpTacPlus;

            if (cmd === modules.cmdList.leaveForCmd) createHelpEmbed(modules.cmdList.leaveForCmd, modules.helpObj.helpLeaveFor);

            else if (cmd === modules.cmdList.attendanceCmd) createHelpEmbed(modules.cmdList.attendanceCmd, modules.helpObj.helpAttendance);
        }

        if (msg.member.roles.cache.some(roles=>modules.constObj.sgtPlus.includes(roles.id))) {
            commandList = modules.helpObj.helpSgtPlus;

            if (cmd === modules.cmdList.connectedCmd) createHelpEmbed(modules.cmdList.connectedCmd, modules.helpObj.helpConnected);
        }

        if (msg.member.roles.cache.some(roles=>modules.constObj.cqmsPlus.includes(roles.id))) {
            commandList = modules.helpObj.helpCqmsPlus;

            if (cmd === modules.cmdList.archiveCmd) createHelpEmbed(modules.cmdList.archiveCmd, modules.helpObj.helpArchive);
        }

        if (msg.member.roles.cache.some(roles=>modules.constObj.adjPlus.includes(roles.id))) {
            commandList = modules.helpObj.helpAdjPlus;

            if (cmd === modules.cmdList.purgeCmd) createHelpEmbed(modules.cmdList.purgeCmd, modules.helpObj.helpPurge);
        }

        if (msg.author.id === modules.constObj.devID) {
            commandList = modules.helpObj.helpDev;

            if (cmd === modules.cmdList.pingCmd) createHelpEmbed(modules.cmdList.pingCmd, modules.helpObj.helpPing);
        }

        if (showCmdList) {
            helpEmbed = new Discord.MessageEmbed()
                .setTitle('Commands List')
                .setThumbnail('https://i.imgur.com/EzmJVyV.png')
                .setColor(modules.constObj.yellow)
                .setDescription(commandList)
                .setFooter('Developed by ' + devTag, devIcon);
            embedDM = true;

            if (!msg.member.roles.cache.some(roles=>modules.constObj.adjPlus.includes(roles.id)) && msg.author.id !== modules.constObj.devID) {
                helpEmbed.addField('Note', `Only displaying commands available to ${msg.author}.`)
            }
        }
        
        if (!embedDM) msg.channel.send(helpEmbed);

        else if (embedDM) msg.author.send(helpEmbed);

        function createHelpEmbed(command, text) {
            helpEmbed = new Discord.MessageEmbed()
                .setTitle(`Command: ${prefix}${command}`)
                .setColor(modules.constObj.grey)
                .setDescription(text)
                .setFooter(`Requested by ${msg.member.displayName}`);
            showCmdList = false;
        };
    },
};