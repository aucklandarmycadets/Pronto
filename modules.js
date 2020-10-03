const pairs = require('./channelPairs');
const dateFormat = require('dateformat');

const constObj = {
    prefix: '!',
    serverID: '748336465465049230',
    devID: '192181901065322496',
    debugID: '758217147187986432',
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
    version: '1.5.1'
};

const cmdList = {
    helpCmd: 'help',
    leaveCmd: 'leave',
    leaveForCmd: 'leavefor',
    attendanceCmd: 'attendance',
    connectedCmd: 'connected',
    archiveCmd: 'archive',
    purgeCmd: 'purge',
    pingCmd: 'ping',
}

const cmdTxt = {
    helpGeneric: 'Get help with commands.',
    helpDesc: 'Message a list of all commands.',
    helpArg: 'Get help with a command.',
    leaveDesc: 'Submit a leave request.',
    leaveForDesc: 'Submit a leave request for another cadet.',
    attendanceDesc: 'Submit an attendance register.',
    connectedDesc: 'List of members connected to a voice channel.',
    archiveDesc: 'Archive a text channel.',
    purgeDesc: 'Delete a number of messages from a channel.',
    pingDesc: 'Test the latency of the bot.',
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
        }, '`', '` - ')
    },

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

    helpPing: helpText({
        'Description': cmdTxt.pingDesc,
        'Usage': `${constObj.prefix}${cmdList.pingCmd}`,
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

function rolesOutput(array) {
    var rolesString = '';

    for (index in array.reverse()) {
        if (array[index] === constObj.administratorID) continue;

        if (index % 3 === 0) {
            rolesString += '\n';
        }
        rolesString += `<@&${array[index]}> `;
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

function newMember(Discord, bot, member) {
    if (member.user.bot) return;
    
    const visitorRole = member.guild.roles.cache.find(role => role.id === constObj.visitorID);
    member.roles.add(visitorRole);

    welcomeEmbed = new Discord.MessageEmbed()
            .setColor(constObj.yellow)
            .setAuthor(member.user.tag, member.user.displayAvatarURL())
            .setDescription(`${member.user} has just entered ${member.guild.channels.cache.get(constObj.newStatesID)}.\n\nMake them feel welcome!`)
            .setFooter(`${dateFormat(member.joinedAt.toString(), constObj.dateOutput)}`);
    member.guild.channels.cache.get(constObj.recruitingID).send(welcomeEmbed);
};

function channelPair(Discord, bot, oldState, newState) {
    let oldID;
    let newID;
    if (oldState.channel) oldID = oldState.channelID;
    if (newState.channel) newID = newState.channelID;

    for (let i = 0; i < pairs.length; i++) {
        const textChannel = newState.guild.channels.cache.get(pairs[i].text);
        if (!textChannel) {
            console.log('Invalid text channel ID in JSON.');
            continue;
        }

        const vcID = pairs[i].voice;

        if (oldID !== vcID && newID === vcID) {
            textChannel.updateOverwrite(newState.id, { VIEW_CHANNEL: true, SEND_MESSAGES: true })
                .catch(console.error);

            joinEmbed = new Discord.MessageEmbed()
                .setColor(constObj.success)
                .setAuthor(newState.member.displayName, newState.member.user.displayAvatarURL())
                .setDescription(`${newState.member} has joined the channel.`)
                .setFooter(`${dateFormat(Date(), constObj.dateOutput)}`);
            textChannel.send(joinEmbed);
        } 

        else if (oldID === vcID && newID !== vcID) {
            textChannel.updateOverwrite(newState.id, { VIEW_CHANNEL: false, SEND_MESSAGES: false })
                .catch(console.error);

            leaveEmbed = new Discord.MessageEmbed()
                .setColor(constObj.error)
                .setAuthor(newState.member.displayName, newState.member.user.displayAvatarURL())
                .setDescription(`${newState.member} has left the channel.`)
                .setFooter(`${dateFormat(Date(), constObj.dateOutput)}`);
            textChannel.send(leaveEmbed);

            if (oldState.channel.members.size === 0) {
                purgeEmbed = new Discord.MessageEmbed()
                    .setTitle('Purge Text Channel')
                    .setColor(constObj.success)
                    .setDescription(`Click on the ${newState.guild.emojis.cache.find(emoji => emoji.name === constObj.successEmoji)} reaction to purge this channel.`);
                textChannel.send(purgeEmbed).then(msg => {
                    msg.react(newState.guild.emojis.cache.find(emoji => emoji.name === constObj.successEmoji));

                    const filter = (reaction, user) => {
                        return reaction.emoji.name === constObj.successEmoji;
                    };

                    const collector = msg.createReactionCollector(filter, { time: 60000, dispose: true });

                    collector.on('collect', (reaction, user) => {
                        if (msg.guild.members.cache.get(user.id).roles.cache.some(roles=>constObj.adjPlus.includes(roles.id))) {
                            msg.channel.messages.fetch({ limit: 100 })
                                .then((messages) => {
                                    msg.channel.bulkDelete(messages).catch(error => console.log(error.stack));
                                    collector.stop();
                                });
                        }
                        
                        else if (!user.bot) {
                            errorEmbed = new Discord.MessageEmbed()
                                .setColor(constObj.error)
                                .setAuthor(newState.member.displayName, newState.member.user.displayAvatarURL())
                                .setDescription(`${user} Insufficient permissions. ${helpObj.errorPurge}`);
                            textChannel.send(errorEmbed);
                        }
                    });

                    collector.on('remove', (reaction, user) => {
                        if (msg.guild.members.cache.get(user.id).roles.cache.some(roles=>constObj.adjPlus.includes(roles.id))) {
                            msg.channel.messages.fetch({ limit: 100 })
                                .then((messages) => {
                                    msg.channel.bulkDelete(messages).catch(error => console.log(error.stack));
                                    collector.stop();
                                });
                        }
                    });

                    collector.on('end', (collected, reason) => {
                        if (reason === 'time') {
                            msg.reactions.removeAll();
                            timeEmbed = new Discord.MessageEmbed()
                                .setColor(constObj.error)
                                .setAuthor(bot.user.tag, bot.user.avatarURL())
                                .setDescription(`Timed out. Type \`${constObj.prefix}${cmdList.purgeCmd} 100\` to clear this channel manually.`);
                            textChannel.send(timeEmbed);
                        }
                    });
                });

            }
        }
    }
};

exports.constObj = constObj;
exports.cmdList = cmdList;
exports.cmdTxt = cmdTxt;
exports.helpObj = helpObj;
exports.capitalise = capitalise;
exports.sendErrorEmbed = sendErrorEmbed;
exports.newMember = newMember;
exports.channelPair = channelPair;