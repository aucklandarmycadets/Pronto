const modules = require('../modules');

module.exports = {
    name: 'purge',
    description: 'Delete a number of messages from a channel.',
    execute(Discord, bot, msg, args) {
        sendError = false;

        if (!msg.member.roles.cache.some(roles=>modules.constObj.adjPlus.includes(roles.id))) {
            bot.commands.get('help').execute(Discord, bot, msg, args);
            return;
        }

        if (args.length === 0) {
            errorMessage = 'Insufficent arguments.';
            sendError = true;
        }

        else if (msg.mentions.members.size > 1) {
            errorMessage = 'You cannot purge multiple users simultaneously.';
            sendError = true;
        }


        else if (args.length > 2) {
            errorMessage = 'Too many arguments.';
            sendError = true;
        }

        const user = msg.mentions.users.first();

        const purgeCount = !!parseInt(msg.content.split(' ')[1]) ? parseInt(msg.content.split(' ')[1]) : parseInt(msg.content.split(' ')[2])
        
        if (!purgeCount && !user && !sendError) {
            errorMessage = 'Invalid input.';
            sendError = true;
        }

        else if (!purgeCount && !sendError) {
            errorMessage = 'You must specify an amount to delete.';
            sendError = true;
        }

        if (purgeCount > 100 && !sendError) {
            errorMessage = 'You cannot purge more than 100 messages at a time.';
            sendError = true;
        }

        if (sendError === true) {
            msg.react(bot.emojis.cache.find(emoji => emoji.name === modules.constObj.errorEmoji));
            errorEmbed = new Discord.MessageEmbed()
                .setColor(modules.constObj.error)
                .setAuthor(msg.member.displayName, msg.author.displayAvatarURL())
                .setDescription(`${msg.author} ${errorMessage} ${modules.helpObj.errorPurge}`);
            msg.channel.send(errorEmbed);
        }

        else {
            msg.delete();

            msg.channel.messages.fetch({ limit: 100 })
                .then((messages) => {
                    if (user) {
                        const filterBy = user ? user.id : Client.user.id;
                        messages = messages.filter(message => message.author.id === filterBy).array().slice(0, purgeCount);
                    }

                    else {
                        messages = messages.array().slice(0, purgeCount);
                    };

                msg.channel.bulkDelete(messages).catch(error => console.log(error.stack));
            });
        }
    },
};