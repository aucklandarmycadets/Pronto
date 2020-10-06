const dateFormat = require('dateformat');

const constObj = {
    prefix: '-',
    serverID: '285276130284404750',
    devID: '192181901065322496',
    debugID: '760745439225577482',
    logID: '761907992332861440',
    attendanceID: '760820697542426644',
    recruitingID: '761160822008315915',
    newMembersID: '761162254498136084',
    archivedID: '761180123336146974',
    tacticalID: '285345887365103628',
    classroomID: '761191298614558720',
    visitorID: '285284113655791617',
    successEmoji: 'success',
    errorEmoji: 'error',
    formations: ['285282771189104640'],
    nonCadet: ['285284113655791617'],
    tacPlus: ['285282771189104640', '285283924542881792', '285283751695745033', '285283460078239785', '285282768286646272'],
    sgtPlus: ['285283924542881792', '285283751695745033', '285283460078239785', '285282768286646272'],
    cqmsPlus: ['285283751695745033', '285283460078239785', '285282768286646272'],
    adjPlus: ['285283460078239785', '285282768286646272'],
    administratorID: '285282768286646272',
    grey: 0x1b1b1b,
    red: 0xd31145,
    yellow: 0xffd456,
    success: 0x45bb8a,
    error: 0xef4949,
    dateOutput: 'HHMM "h" ddd, dd mmm yy',
    version: '1.7.2'
};

const cmdList = {
    pingCmd: 'ping',
    uptimeCmd: 'uptime',
    restartCmd: 'restart',
    helpCmd: 'help',
    leaveCmd: 'leave',
    leaveForCmd: 'leavefor',
    attendanceCmd: 'attendance',
    connectedCmd: 'connected',
    archiveCmd: 'archive',
    purgeCmd: 'purge',
};

const cmdTxt = {
    pingDesc: 'Test the latency of the bot.',
    uptimeDesc: 'Time since last restart.',
    restartDesc: 'Restart the bot.',
    helpGeneric: 'Get help with commands.',
    helpDesc: 'Message a list of all commands.',
    helpArg: 'Get help with a command.',
    leaveDesc: 'Submit a leave request.',
    leaveForDesc: 'Submit a leave request for another cadet.',
    attendanceDesc: 'Submit an attendance register.',
    connectedDesc: 'List of members connected to a voice channel.',
    archiveDesc: 'Archive a text channel.',
    purgeDesc: 'Delete a number of messages from a channel.',
};

const dmCmds = [
    `${constObj.prefix}${cmdList.pingCmd}`,
    `${constObj.prefix}${cmdList.uptimeCmd}`,
    `${constObj.prefix}${cmdList.helpCmd} ${cmdList.leaveCmd}`,
];

const helpObj = {
    helpAll: helpText({
        [`${constObj.prefix}${cmdList.helpCmd}`]: cmdTxt.helpDesc,
        [`${constObj.prefix}${cmdList.helpCmd} (command)`]: cmdTxt.helpArg,
    }, '`', '` - '),

    get helpCadet() {
        return this.helpAll + '\n' + helpText({
            [`${constObj.prefix}${cmdList.leaveCmd}`]: cmdTxt.leaveDesc,
        }, '`', '` - ')
    },

    get helpTacPlus() {
        return this.helpCadet + '\n' + helpText({
            [`${constObj.prefix}${cmdList.leaveForCmd}`]: cmdTxt.leaveForDesc,
            [`${constObj.prefix}${cmdList.attendanceCmd}`]: cmdTxt.attendanceDesc,
        }, '`', '` - ')
    },

    get helpSgtPlus() {
        return this.helpTacPlus + '\n' + helpText({
            [`${constObj.prefix}${cmdList.connectedCmd}`]: cmdTxt.connectedDesc,
        }, '`', '` - ')
    },

    get helpCqmsPlus() {
        return this.helpSgtPlus + '\n' + helpText({
            [`${constObj.prefix}${cmdList.archiveCmd}`]: cmdTxt.archiveDesc,
        }, '`', '` - ')
    },

    get helpAdjPlus() {
        return this.helpCqmsPlus + '\n' + helpText({
            [`${constObj.prefix}${cmdList.purgeCmd}`]: cmdTxt.purgeDesc,
        }, '`', '` - ')
    },

    get helpDev() {
        return helpText({
            [`${constObj.prefix}${cmdList.pingCmd}`]: cmdTxt.pingDesc,
            [`${constObj.prefix}${cmdList.uptimeCmd}`]: cmdTxt.uptimeDesc,
            [`${constObj.prefix}${cmdList.restartCmd}`]: cmdTxt.restartDesc,
        }, '`', '` - ') + '\n' + this.helpAdjPlus
    },

    helpPing: helpText({
        'Description': cmdTxt.pingDesc,
        'Usage': `${constObj.prefix}${cmdList.pingCmd}`,
    }, '**', ':** '),

    helpUptime: helpText({
        'Description': cmdTxt.uptimeDesc,
        'Usage': `${constObj.prefix}${cmdList.uptimeCmd}`,
    }, '**', ':** '),

    helpRestart: helpText({
        'Description': cmdTxt.restartDesc,
        'Usage': `${constObj.prefix}${cmdList.restartCmd}`,
    }, '**', ':** '),

    helpHelp: helpText({
        'Description': cmdTxt.helpGeneric,
        'Usage': `${constObj.prefix}${cmdList.helpCmd} (command)`,
        'Example': `${constObj.prefix}${cmdList.helpCmd}, ${constObj.prefix}${cmdList.helpCmd} ${cmdList.leaveCmd}`,
    }, '**', ':** '),

    helpLeave: helpText({
        'Description': cmdTxt.leaveDesc,
        'Usage': `${constObj.prefix}${cmdList.leaveCmd} [dates] [activity] [reason] (additional remarks)`,
        'Example': `${constObj.prefix}${cmdList.leaveCmd} 01 Jan for Parade Night due to an appointment`,
    }, '**', ':** '),

    helpLeaveFor: helpText({
        'Description': cmdTxt.leaveForDesc,
        'Usage': `${constObj.prefix}${cmdList.leaveForCmd} [user] [dates] [activity] [reason] (additional remarks)`,
        'Example': `${constObj.prefix}${cmdList.leaveForCmd} <@${constObj.devID}> 01 Jan for Parade Night due to an appointment`,
        'Allowed Roles': rolesOutput(constObj.tacPlus),
    }, '**', ':** '),

    helpAttendance: helpText({
        'Description': cmdTxt.attendanceDesc,
        'Usage': `${constObj.prefix}${cmdList.attendanceCmd} [message]`,
        'Allowed Roles': rolesOutput(constObj.tacPlus),
    }, '**', ':** '),

    helpConnected: helpText({
        'Description': cmdTxt.connectedDesc,
        'Usage': `${constObj.prefix}${cmdList.connectedCmd} [voice channel]`,
        'Example': `${constObj.prefix}${cmdList.connectedCmd} <#${constObj.classroomID}>`,
        'Allowed Roles': rolesOutput(constObj.sgtPlus),
    }, '**', ':** '),

    helpArchive: helpText({
        'Description': cmdTxt.archiveDesc,
        'Usage': `${constObj.prefix}${cmdList.archiveCmd} [text channel]`,
        'Example': `${constObj.prefix}${cmdList.archiveCmd} <#${constObj.tacticalID}>`,
        'Allowed Roles': rolesOutput(constObj.cqmsPlus),
    }, '**', ':** '),

    helpPurge: helpText({
        'Description': cmdTxt.purgeDesc,
        'Usage': `\n${constObj.prefix}${cmdList.purgeCmd} [count]\n!purge [user] [count]`,
        'Example': `\n${constObj.prefix}${cmdList.purgeCmd} 10\n!purge <@${constObj.devID}> 5`,
        'Allowed Roles': rolesOutput(constObj.adjPlus),
    }, '**', ':** '),

    get errorLeave() {
        return errorText(this.helpLeave, cmdList.leaveCmd);
    },

    get errorLeaveFor() {
        return errorText(this.helpLeaveFor, cmdList.leaveForCmd);
    },

    get errorAttendance() {
        return errorText(this.helpAttendance, cmdList.attendanceCmd);
    },

    get errorConnected() {
        return errorText(this.helpConnected, cmdList.connectedCmd);
    },

    get errorArchive() {
        return errorText(this.helpArchive, cmdList.archiveCmd);
    },

    get errorPurge() {
        return errorText(this.helpPurge, cmdList.purgeCmd);
    },
};

function helpText(object, startFormat, endFormat) {
    var helpString = '';
    var objProperties = [];
    var objValues = [];

    for (var property in object) {
        var value = object[property];

        objProperties.push(property);
        objValues.push(value);
    }

    for (var i = 0; i < objProperties.length; i++) {
        helpString += `${startFormat}${objProperties[i]}${endFormat}${objValues[i]}`;

        if (i < (objProperties.length - 1)) {
            helpString += '\n';
        }
    }

    return helpString;
};

function errorText(helpTxt, cmd) {
    return '\n\n' + helpTxt + '\n' + helpText({
        'Help Command': `${constObj.prefix}${cmdList.helpCmd} ${cmd}`,
    }, '**', ':** ')
};

function rolesOutput(array, skipFormat) {
    var rolesString = '';
    var filteredArray = array.filter(function(role, index, arr) { 
        return role !== constObj.administratorID && role.name !== '@everyone'; 
    });

    for (index in filteredArray) {
        if (index % 3 === 0) {
            rolesString += '\n';
        }
        if (skipFormat) rolesString += `${filteredArray[index]} `;
        else rolesString += `<@&${filteredArray[index]}> `;
    }

    return rolesString;
};

function capitalise(string) {
    if (typeof string !== 'string') return ''
    return string.charAt(0).toUpperCase() + string.slice(1)
};

function sendErrorEmbed(Discord, bot, msg, errMsg, cmdErr, footer) {
    msg.react(msg.guild.emojis.cache.find(emoji => emoji.name === constObj.errorEmoji))
        .catch(error => debugError(Discord, bot, error, `Error reacting to [message](${msg.url}) in ${msg.channel}.`));
    errorEmbed = new Discord.MessageEmbed()
        .setColor(constObj.error)
        .setAuthor(msg.member.displayName, msg.author.displayAvatarURL())
        .setDescription(`${msg.author} ${errMsg} ${cmdErr}`);

    if (footer) errorEmbed.setFooter(footer);

    msg.channel.send(errorEmbed);
};

function formatAge(raw) {
    var years = 0;
    var months = 0;
    var days = 0;
    var hours = 0;
    var minutes = 0;
    var seconds = 0;

    if (raw > 31556952000) years = Math.floor(raw / 31556952000);
    if ((raw - (years * 31556952000)) > 2629800000) months = Math.floor((raw - (years * 31556952000)) / 2629800000);
    if ((raw - (years * 31556952000) - (months * 2629800000)) > 86400000) days = Math.floor((raw - (years * 31556952000) - (months * 2629800000)) / 86400000);
    if ((raw - (years * 31556952000) - (months * 2629800000) - (days * 86400000)) > 3600000) hours = Math.floor((raw - (years * 31556952000) - (months * 2629800000) - (days * 86400000)) / 3600000);
    if ((raw - (years * 31556952000) - (months * 2629800000) - (days * 86400000) - (hours * 3600000)) > 60000) minutes = Math.floor((raw - (years * 31556952000) - (months * 2629800000) - (days * 86400000) - (hours * 3600000)) / 60000);
    if ((raw - (years * 31556952000) - (months * 2629800000) - (days * 86400000) - (hours * 3600000) - (minutes * 60000)) > 1000) seconds = Math.floor((raw - (years * 31556952000) - (months * 2629800000) - (days * 86400000) - (hours * 3600000) - (minutes * 60000)) / 1000);

    if (years) return `${years} years, ${months} months, ${days} days`;
    else if (months) return `${months} months, ${days} days, ${hours} hrs`;
    else if (days) return `${days} days, ${hours} hrs, ${minutes} min`;
    else if (hours) return `${hours} hrs, ${minutes} min, ${seconds} sec`;
    else if (minutes) return `${minutes} min, ${seconds} sec`;
    else return `${seconds} sec`;
};

function dmError(Discord, bot, msg, debug) {
    errorEmbed = new Discord.MessageEmbed()
        .setAuthor(bot.user.tag, bot.user.avatarURL())
        .setColor(constObj.error)
        .setDescription(`${msg.author} I can't send direct messages to you!`)
        .addField('More Information', '[support.discord.com](https://support.discord.com/hc/en-us/articles/217916488-Blocking-Privacy-Settings)')
        .setFooter(`${dateFormat(Date.now(), constObj.dateOutput)}`);
    
    if (debug) {
        errorEmbed = new Discord.MessageEmbed()
            .setAuthor(bot.user.tag, bot.user.avatarURL())
            .setColor(constObj.error)
            .setDescription(`Error sending direct message to ${msg.mentions.members.first()}.`)
            .setFooter(`${dateFormat(Date.now(), constObj.dateOutput)}`);
        bot.channels.cache.get(constObj.debugID).send(errorEmbed);
        return;
    }

    msg.channel.send(errorEmbed);
};

function debugError(Discord, bot, error, errorMsg, fieldTitle, fieldContent) {
    console.error(error.stack);
    debugEmbed = new Discord.MessageEmbed()
        .setAuthor(bot.user.tag, bot.user.avatarURL())
        .setColor(constObj.error)
        .setDescription(`${errorMsg}`)
        .setFooter(`${dateFormat(Date.now(), constObj.dateOutput)}`);

    if (fieldTitle) {
        debugEmbed.addField(fieldTitle, fieldContent);
    }

    bot.channels.cache.get(constObj.debugID).send(debugEmbed);
}

exports.constObj = constObj;
exports.cmdList = cmdList;
exports.cmdTxt = cmdTxt;
exports.dmCmds = dmCmds;
exports.helpObj = helpObj;
exports.rolesOutput = rolesOutput;
exports.capitalise = capitalise;
exports.sendErrorEmbed = sendErrorEmbed;
exports.formatAge = formatAge;
exports.dmError = dmError;
exports.debugError = debugError;