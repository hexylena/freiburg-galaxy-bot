// Description:
//   Example scripts for you to examine and try out.
//
// Commands:
//   hubot galaxy restart - restarts the Freiburg Galaxy server
//   hubot galaxy status - checks the status of the server
//   cancel restart - Cancels any running restart.
//
// Notes:
//   They are commented out by default, because most of them are pretty silly and
//   wouldn't be useful and amusing enough for day to day huboting.
//   Uncomment the ones you want to try and experiment with.
//
//   These are from the scripting documentation: https://github.com/github/hubot/blob/master/docs/scripting.md

var BOTNAME = '[**FreiburgerBot**]: ';
var execSync = require('child_process').execSync;
var serverRestart = null;
var permissions = {
	restart: ['bgruening', 'erasche']
}
var serverRestartTimer;

module.exports = function(robot) {

	robot.respond(/galaxy restart/i, function(res) {
		// The user issuing the request
		requestingUser = res.message.user.username;
		// Must be in the set of people who are permitted to restart the serve.r
		if(permissions.restart.indexOf(requestingUser) > -1){
			// If they are, send a message indicating the scheduling of the reboot
			res.send(BOTNAME + res.message.user.displayName + ' (@' + res.message.user.username + ") requested a restart of the galaxy server. You have **5 minutes**. Just say '**cancel restart**' and I'll stop.");
			// And build a serverRestart information object.
			serverRestart = {
				owner: res.message.user.username,
			};
			// Now, set a timeout indicating we'll actually do this.
			serverRestartTimer = setTimeout(function(){
				if(serverRestart){
					res.send(BOTNAME + "Restarting Galaxy");
					t = execSync("ssh galaxy@galaxy.uni-freiburg.de 'cd galaxy-dist; . .venv/bin/activate; supervisorctl restart gx:'");
					res.send(BOTNAME + "```\n" + t.toString() + "\n```\n");
					res.send(BOTNAME + "@" + serverRestart.owner + " the restart command finished. Please check that everything is OK.");
				} else {
					res.send(BOTNAME + "*coughs* hey @erasche, might be a bug here.");
				}
			// ms   * minute * 5
			}, 1000 * 60 * 5);

		} 
	});

	robot.hear(/cancel restart/i, function(res) {
		if(res.message.text.indexOf(BOTNAME) === -1 && serverRestart){
			res.send(BOTNAME + 'Hey @' + serverRestart.owner + ', ' + res.message.user.displayName + ' (@' + res.message.user.username + ") cancelled the reboot.");
			serverRestart = null;
			clearTimeout(serverRestartTimer);
		}
	});

	robot.respond(/galaxy status/i, function(res) {
		var t;
		t = execSync("ssh galaxy@galaxy.uni-freiburg.de 'cd galaxy-dist; . .venv/bin/activate; supervisorctl status'");
		res.send(BOTNAME + "\n```\n" + t.toString() + "\n```\n");
	});

};

return module;
