const dateFormat = require('dateformat');

const constObj = {
    prefix: '!',
    serverID: '748336465465049230',
    devID: '192181901065322496',
    debugID: '758217147187986432',
    logID: '755289400954454047',
    attendanceID: '748360212754464779',
    recruitingID: '748516417137278985',
    newMembersID: '749150106669940748',
    archivedID: '760421058687139860',
    tacticalID: '748342934880911371',
    classroomID: '748677930778886144',
    visitorID: '748411879923253259',
    successEmoji: 'success',
    errorEmoji: 'error',
    formations: ['761143813632294963', '748341753249136672', '748341787336376370', '748342048788316181'],
    nonCadet: ['748411879923253259', '748343310124580894'],
    tacPlus: ['748340800093552731', '748337961321496637', '748338027402756142', '748337933194625104', '748346409853517896'],
    sgtPlus: ['748340611521839115', '748340221719871558', '748340045689389176', '750959240578859018', '748339616112836619', '748338095446949908', '748337933194625104', '748346409853517896'],
    cqmsPlus: ['748340045689389176', '748339616112836619', '748338095446949908', '748337933194625104', '748346409853517896'],
    adjPlus: ['748338095446949908', '748337933194625104', '748346409853517896'],
    administratorID: '748346409853517896',
    grey: 0x1b1b1b,
    red: 0xd31145,
    yellow: 0xffd456,
    success: 0x45bb8a,
    error: 0xef4949,
    dateOutput: 'HHMM "h" ddd, dd mmm yy',
    version: '1.6.5'
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
}

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
        return this.helpAdjPlus + '\n' + helpText({
            [`${constObj.prefix}${cmdList.pingCmd}`]: cmdTxt.pingDesc,
            [`${constObj.prefix}${cmdList.uptimeCmd}`]: cmdTxt.uptimeDesc,
            [`${constObj.prefix}${cmdList.restartCmd}`]: cmdTxt.restartDesc,
        }, '`', '` - ')
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
}

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
    msg.react(msg.guild.emojis.cache.find(emoji => emoji.name === constObj.errorEmoji));
    errorEmbed = new Discord.MessageEmbed()
        .setColor(constObj.error)
        .setAuthor(msg.member.displayName, msg.author.displayAvatarURL())
        .setDescription(`${msg.author} ${errMsg} ${cmdErr}`);

    if (footer) errorEmbed.setFooter(footer);

    msg.channel.send(errorEmbed);
}

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
}

exports.constObj = constObj;
exports.cmdList = cmdList;
exports.cmdTxt = cmdTxt;
exports.helpObj = helpObj;
exports.rolesOutput = rolesOutput;
exports.capitalise = capitalise;
exports.sendErrorEmbed = sendErrorEmbed;
exports.formatAge = formatAge;