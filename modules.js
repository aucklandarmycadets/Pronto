const pairs = require('./channelPairs');
const dateFormat = require('dateformat');

const constObj = {
    prefix: '!',
    devID: '192181901065322496',
    debugID: '760745439225577482',
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
    nonCadet: [''],
    tacPlus: ['285283924542881792'], // Tac Op Stgc Cmd Adm
    sgtPlus: ['285282768286646272'], // SGT CQMS ASSTADJ ADJ CMD ADM
    cqmsPlus: ['285283751695745033'], // CQMS ASSTADJ Adj Cmd Adm
    adjPlus: ['285283460078239785'], // Adj Cmd Adm
    grey: 0x1b1b1b,
    red: 0xd31145,
    yellow: 0xffd456,
    success: 0x45bb8a,
    error: 0xef4949,
};

const cmdTxt = {
    pingCmd: 'Test the latency of the bot.',
    helpGeneric: 'Get help with commands.', // all
    helpCmd: 'Message a list of all commands.', // all
    helpArg: 'Get help with a command.', // all
    leaveCmd: 'Submit a leave request.', // visitoarPlus
    leaveForCmd: 'Submit a leave request for another cadet.', // tacPalus
    attendanceCmd: 'Submit an attendance register.', // tacaPlus
    purgeCmd: 'Delete a number of messages from a channel.', // adjPlaus
    archiveCmd: 'Archive a text channel.', // cqmsPalus
    connectedCmd: 'List of members connected to a voice channel.',
};

const helpObj = {
    helpAll: helpText({
        '!help': cmdTxt.helpCmd,
        '!help (command)': cmdTxt.helpArg,
    }, '`', '` - '),

    get helpCadet() {
        return this.helpAll + '\n' + helpText({
            '!leave': cmdTxt.leaveCmd,
        }, '`', '` - ')
    },

    get helpTacPlus() {
        return this.helpCadet + '\n' + helpText({
            '!leavefor': cmdTxt.leaveForCmd,
            '!attendance': cmdTxt.attendanceCmd,
        }, '`', '` - ')
    },

    get helpSgtPlus() {
        return this.helpTacPlus + '\n' + helpText({
            '!connected': cmdTxt.connectedCmd,
        }, '`', '` - ')
    },

    get helpCqmsPlus() {
        return this.helpSgtPlus + '\n' + helpText({
            '!archive': cmdTxt.archiveCmd,
        }, '`', '` - ')
    },

    get helpAdjPlus() {
        return this.helpCqmsPlus + '\n' + helpText({
            '!purge': cmdTxt.purgeCmd,
        }, '`', '` - ')
    },

    get helpDev() {
        return this.helpAdjPlus + '\n' + helpText({
            '!ping': cmdTxt.pingCmd,
        }, '`', '` - ')
    },

    helpPing: helpText({
        'Description': cmdTxt.pingCmd,
        'Usage': '!ping',
    }, '**', ':** '),

    helpHelp: helpText({
        'Description': cmdTxt.helpGeneric,
        'Usage': '!help (command)',
        'Example': '!help, !help leave',
    }, '**', ':** '),

    helpLeave: helpText({
        'Description': cmdTxt.leaveCmd,
        'Usage': '!leave [dates] [activity] [reason] (additional remarks)',
        'Example': '!leave 01 Jan for Parade Night due to an appointment',
    }, '**', ':** '),

    helpLeaveFor: helpText({
        'Description': cmdTxt.leaveForCmd,
        'Usage': '!leavefor [user] [dates] [activity] [reason] (additional remarks)',
        'Example': '!leavefor <@192181901065322496> 01 Jan for Parade Night due to an appointment',
        'Allowed Roles': rolesOutput(constObj.tacPlus),
    }, '**', ':** '),

    helpAttendance: helpText({
        'Description': cmdTxt.attendanceCmd,
        'Usage': '!attendance [message]',
        'Allowed Roles': rolesOutput(constObj.tacPlus),
    }, '**', ':** '),

    helpPurge: helpText({
        'Description': cmdTxt.purgeCmd,
        'Usage': '\n!purge [count]\n!purge [user] [count]',
        'Example': '\n!purge 10\n!purge <@192181901065322496> 5',
        'Allowed Roles': rolesOutput(constObj.adjPlus),
    }, '**', ':** '),

    helpArchive: helpText({
        'Description': cmdTxt.archiveCmd,
        'Usage': '!archive [text channel]',
        'Example': `!archive <#${constObj.tacticalID}>`,
        'Allowed Roles': rolesOutput(constObj.cqmsPlus),
    }, '**', ':** '),

    helpConnected: helpText({
        'Description': cmdTxt.connectedCmd,
        'Usage': '!connected [voice channel]',
        'Example': `!connected <#${constObj.classroomID}>`,
        'Allowed Roles': rolesOutput(constObj.sgtPlus),
    }, '**', ':** '),

    get errorLeave() {
        return '\n\n' + this.helpLeave + '\n' + helpText({
        'Help Command': '!help leave',
        }, '**', ':** ')
    },

    get errorLeaveFor() {
        return '\n\n' + this.helpLeaveFor + '\n' + helpText({
        'Help Command': '!help leavefor',
        }, '**', ':** ')
    },

    get errorAttendance() {
        return '\n\n' + this.helpAttendance + '\n' + helpText({
        'Help Command': '!help attendance',
        }, '**', ':** ')
    },

    get errorPurge() {
        return '\n\n' + this.helpPurge + '\n' + helpText({
        'Help Command': '!help purge',
        }, '**', ':** ')
    },

    get errorArchive() {
        return '\n\n' + this.helpArchive + '\n' + helpText({
        'Help Command': '!help archive',
        }, '**', ':** ')
    },

    get errorConnected() {
        return '\n\n' + this.helpConnected + '\n' + helpText({
        'Help Command': '!help connected',
        }, '**', ':** ')
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

function rolesOutput(array) {
    var rolesString = '';

    for (index in array) {
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

function newMember(Discord, bot, member) {
    if (member.user.bot) return;
    
    const visitorRole = member.guild.roles.cache.find(role => role.id === constObj.visitorID);
    member.roles.add(visitorRole);

    welcomeEmbed = new Discord.MessageEmbed()
            .setColor(constObj.yellow)
            .setAuthor(member.user.tag, member.user.displayAvatarURL())
            .setDescription(`${member.user} has just entered ${member.guild.channels.cache.get(constObj.newStatesID)}.\n\nMake them feel welcome!`)
            .setFooter(`${dateFormat(member.joinedAt.toString(), 'HHMM "h" ddd, dd mmm yy')}`);
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
                .setFooter(`${dateFormat(Date(), 'HHMM "h" ddd, dd mmm yy')}`);
            textChannel.send(joinEmbed);
        } 

        else if (oldID === vcID && newID !== vcID) {
            textChannel.updateOverwrite(newState.id, { VIEW_CHANNEL: false, SEND_MESSAGES: false })
                .catch(console.error);

            leaveEmbed = new Discord.MessageEmbed()
                .setColor(constObj.error)
                .setAuthor(newState.member.displayName, newState.member.user.displayAvatarURL())
                .setDescription(`${newState.member} has left the channel.`)
                .setFooter(`${dateFormat(Date(), 'HHMM "h" ddd, dd mmm yy')}`);
            textChannel.send(leaveEmbed);

            if (oldState.channel.members.size === 0) {
                purgeEmbed = new Discord.MessageEmbed()
                    .setTitle('Purge Text Channel')
                    .setColor(constObj.success)
                    .setDescription(`Click on the ${bot.emojis.cache.find(emoji => emoji.name === constObj.successEmoji)} reaction to purge this channel.`);
                textChannel.send(purgeEmbed).then(msg => {
                    msg.react(bot.emojis.cache.find(emoji => emoji.name === constObj.successEmoji));

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
                                .setDescription('Timed out. Type `!purge 100` to clear this channel manually.');
                            textChannel.send(timeEmbed);
                        }
                    });
                });

            }
        }
    }
};

exports.constObj = constObj;
exports.helpObj = helpObj;
exports.capitalise = capitalise;
exports.newMember = newMember;
exports.channelPair = channelPair;
