module.exports = {
	events: [],
	process: ['exit'],
	execute(event, code) {
		console.log(`Exiting with code ${code}`);
	},
};