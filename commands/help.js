const modules = require('../modules');
const prefix = modules.constObj.prefix;
var devTag;
var devIcon;

module.exports = {
    name: modules.cmdList.helpCmd,
    description: modules.cmdTxt.helpGeneric,
    execute(Discord, bot, msg, args) {
        msg.delete();

        var showCmdList = true;
        var embedDM = false;

        cmd = args[0];

        dev = bot.users.cache.get(modules.constObj.devID);
        devTag = dev.tag;
        devIcon = dev.avatarURL();

        if (msg.guild === null) {
            if (args[0] === modules.cmdList.leaveCmd) {
                helpEmbed = new Discord.MessageEmbed()
                .setTitle(`Command: ${prefix}${modules.cmdList.leaveCmd}`)
                .setColor(modules.constObj.grey)
                .setDescription(modules.helpObj.helpLeave);
                msg.author.send(helpEmbed);
            }
            
            return;
        }

        commandList = modules.helpObj.helpAll;

        if (cmd === 'help') {
            helpEmbed = new Discord.MessageEmbed()
                .setTitle(`Command: ${prefix}help`)
                .setDescription(modules.helpObj.helpHelp);
            showCmdList = false;
        }

        if (!msg.member.roles.cache.some(roles=>modules.constObj.nonCadet.includes(roles.id))) {
            commandList = modules.helpObj.helpCadet;

            if (cmd === modules.cmdList.leaveCmd) {
                helpEmbed = new Discord.MessageEmbed()
                    .setTitle(`Command: ${prefix}${modules.cmdList.leaveCmd}`)
                    .setDescription(modules.helpObj.helpLeave);
                showCmdList = false;
            }
        }

        if (msg.member.roles.cache.some(roles=>modules.constObj.tacPlus.includes(roles.id))) {
            commandList = modules.helpObj.helpTacPlus;

            if (cmd === modules.cmdList.leaveForCmd) {
                helpEmbed = new Discord.MessageEmbed()
                    .setTitle(`Command: ${prefix}${modules.cmdList.leaveForCmd}`)
                    .setDescription(modules.helpObj.helpLeaveFor);
                showCmdList = false;
            }

            else if (cmd === modules.cmdList.attendanceCmd) {
                helpEmbed = new Discord.MessageEmbed()
                    .setTitle(`Command: ${prefix}${modules.cmdList.attendanceCmd}`)
                    .setDescription(modules.helpObj.helpAttendance);
                showCmdList = false;
            }
        }

        if (msg.member.roles.cache.some(roles=>modules.constObj.sgtPlus.includes(roles.id))) {
            commandList = modules.helpObj.helpSgtPlus;

            if (cmd === modules.cmdList.connectedCmd) {
                helpEmbed = new Discord.MessageEmbed()
                    .setTitle(`Command: ${prefix}${modules.cmdList.connectedCmd}`)
                    .setDescription(modules.helpObj.helpConnected);
                showCmdList = false;
            }
        }

        if (msg.member.roles.cache.some(roles=>modules.constObj.cqmsPlus.includes(roles.id))) {
            commandList = modules.helpObj.helpCqmsPlus;

            if (cmd === modules.cmdList.archiveCmd) {
                helpEmbed = new Discord.MessageEmbed()
                    .setTitle(`Command: ${prefix}${modules.cmdList.archiveCmd}`)
                    .setDescription(modules.helpObj.helpArchive);
                showCmdList = false;
            }
        }

        if (msg.member.roles.cache.some(roles=>modules.constObj.adjPlus.includes(roles.id))) {
            commandList = modules.helpObj.helpAdjPlus;

            if (cmd === modules.cmdList.purgeCmd) {
                helpEmbed = new Discord.MessageEmbed()
                    .setTitle(`Command: ${prefix}${modules.cmdList.purgeCmd}`)
                    .setDescription(modules.helpObj.helpPurge);
                showCmdList = false;
            }
        }

        if (msg.author.id === modules.constObj.devID) {
            commandList = modules.helpObj.helpDev;

            if (cmd === modules.cmdList.pingCmd) {
                helpEmbed = new Discord.MessageEmbed()
                    .setTitle(`Command: ${prefix}${modules.cmdList.pingCmd}`)
                    .setDescription(modules.helpObj.helpPing);
                showCmdList = false;
            }
        }

        if (showCmdList === true) {
            helpEmbed = new Discord.MessageEmbed()
                .setTitle('Commands List')
                .setThumbnail('https://i.imgur.com/EzmJVyV.png')
                .setColor(modules.constObj.yellow)
                .setDescription(commandList)
                .setFooter('Developed by ' + devTag, devIcon);
            embedDM = true;

            if (!msg.member.roles.cache.some(roles=>modules.constObj.adjPlus.includes(roles.id))) {
                helpEmbed.addField('Note', `Only displaying commands available to ${msg.author}.`)
            }
        }

        else {
            helpEmbed.setColor(modules.constObj.grey);
            helpEmbed.setFooter(`Requested by ${msg.member.displayName}`)
        }
        
        if (embedDM === false) {
            msg.channel.send(helpEmbed);
        }

        else if (embedDM === true) {
            msg.author.send(helpEmbed);
        }
    },
};