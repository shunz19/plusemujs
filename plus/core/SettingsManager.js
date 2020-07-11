class SettingsManager {
	constructor() {
		this._settings = {}
	}

	Init(dbman) {
		if (this._settings.length > 0) this._settings = {};
		var _this = this;
		return new Promise((res, rej) => {
			dbman.query("SELECT * FROM `server_settings`", function (e, res) {
				if(e) throw e;
				for(var i=0, len=res.length; i < len; ++i) {
					_this._settings[res[i]["key"]] = res[i]["value"];
				}
	            console.log("Loaded " + res.length + " server settings.");
				res()
			})
		});
	}

	TryGetValue(value) {
		return typeof this._settings[value] != "undefined" ? this._settings[value] : "0";
	}
}

module.exports = SettingsManager