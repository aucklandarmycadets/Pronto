const modules = require('../modules');

module.exports = {
    name: modules.cmdList.purgeCmd,
    description: modules.cmdTxt.purgeDesc,
    execute(Discord, bot, msg, args) {
        if (!msg.member.roles.cache.some(roles=>modules.constObj.adjPlus.includes(roles.id))) {
            bot.commands.get(modules.cmdList.helpCmd).execute(Discord, bot, msg, args);
            return;
        }

        if (args.length === 0) {
            modules.sendErrorEmbed(Discord, bot, msg, 'Insufficient arguments.', modules.helpObj.errorPurge);
        }

        else if (msg.mentions.members.size > 1) {
            modules.sendErrorEmbed(Discord, bot, msg, 'You cannot purge multiple users simultaneously.', modules.helpObj.errorPurge);
        }


        else if (args.length > 2) {
            modules.sendErrorEmbed(Discord, bot, msg, 'Too many arguments.', modules.helpObj.errorPurge);
        }

        const user = msg.mentions.users.first();

        const purgeCount = !!parseInt(msg.content.split(' ')[1]) ? parseInt(msg.content.split(' ')[1]) : parseInt(msg.content.split(' ')[2])
        
        if (!purgeCount && !user && !sendError) {
            modules.sendErrorEmbed(Discord, bot, msg, 'Invalid input.', modules.helpObj.errorPurge);
        }

        else if (!purgeCount && !sendError) {
            modules.sendErrorEmbed(Discord, bot, msg, 'You must specify an amount of messages to delete.', modules.helpObj.errorPurge);
        }

        if (purgeCount > 100 && !sendError) {
            modules.sendErrorEmbed(Discord, bot, msg, 'You cannot purge more than 100 messages at a time.', modules.helpObj.errorPurge);
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