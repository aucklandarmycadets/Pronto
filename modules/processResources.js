'use strict';

const Discord = require('discord.js');

/**
 * `modules.processResources()` processes an input of lesson resource(s) into a string of the format
 * required by [`<Lesson.submittedResources>`]{@link models.Lesson}
 * @example
 * // <MessageAttachment.name> = 'Message_Attachment_Name'
 * // <MessageAttachment.url> = 'https://cdn.discordapp.com/attachments/...'
 *
 * // returns {string}:
 * // [Message_Attachment_Name](https://cdn.discordapp.com/attachments/...)\n
 * // [Resource](https://...)\n
 * // [Resource](https://...)
 * modules.processResources(<MessageAttachment>, ['https://...', 'https://...']);
 * @function modules.processResources
 * @param {Discord.MessageAttachment} [attachment] An input \<MessageAttachment>
 * @param {string[]} [URLs] An input \<string[]> of URLs
 * @returns {string} A formatted string of Markdown hyperlinks, where each resource is separated by a newline
 */
module.exports = (attachment, URLs) => {
	// Format the link for the <MessageAttachment> if one exists
	const attachmentLink = (attachment)
		// If there is an attachment, format the link using the <MessageAttachment.name>
		? `[${Discord.escapeMarkdown(attachment.name)}](${attachment.url})\n`
		// Otherwise, set it to be an empty string
		: '';

	// Map each URL to the format of [Resource](URL), then join the string[] with a newline separator and append it to the attachment link
	return attachmentLink + URLs.map(url => `[Resource](${url})`).join('\n');
};