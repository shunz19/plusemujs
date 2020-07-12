const fs = require("fs");
const mysql = require("mysql");
const LanguageManager = require("./plus/core/LanguageManager.js")
const SettingsManager = require("./plus/core/SettingsManager.js")
const FigureDataManager = require("./plus/core/FigureData/FigureDataManager.js")

class PlusEnvironment {
	constructor() {
		this.PrettyVersion = "Plus EmuJS";
		this.PrettyBuild = "0.0.1"
	}

	Initialize() {
		console.log("Ported to nodeJS     ____  __           ________  _____  __");
		console.log("                    / __ \\/ /_  _______/ ____/  |/  / / / /");
		console.log("                   / /_/ / / / / / ___/ __/ / /|_/ / / / / ");
		console.log("                  / ____/ / /_/ (__  ) /___/ /  / / /_/ /  ");
		console.log("                 /_/   /_/\\__,_/____/_____/_/  /_/\\____/ ");
		console.log("                                " + this.PrettyVersion + " <Build " + this.PrettyBuild + ">");

		var config = JSON.parse(fs.readFileSync("./config.json") + "");

		var dbman = mysql.createConnection(config.db);
		dbman.connect();

		dbman.query("TRUNCATE `catalog_marketplace_data`",(e,res) => {});
		dbman.query("UPDATE `rooms` SET `users_now` = '0' WHERE `users_now` > '0';",(e,res) => {});
		dbman.query("UPDATE `users` SET `online` = '0' WHERE `online` = '1'",(e,res) => {});
		dbman.query("UPDATE `server_status` SET `users_online` = '0', `loaded_rooms` = '0'",(e,res) => {});

		var langman = new LanguageManager();
		var settingsman = new SettingsManager();
		var figureman = new FigureDataManager();

		Promise.all([langman.Init(dbman), settingsman.Init(dbman), figureman.Init()]).then(() => {
			
		})
	}
}

module.exports = PlusEnvironment;