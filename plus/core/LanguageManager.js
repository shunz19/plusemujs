class LanguageManager {
	constructor() {
		this._values = {};
	}

	Init(dbman) {
		if (this._values.length > 0) this._values = {};
		var _this = this;
		return new Promise((res, rej) => {
			dbman.query("SELECT * FROM `server_locale`", function (e, res) {
				if(e) throw e;
				for(var i=0, len=res.length; i < len; ++i) {
					_this._values[res[i]["key"]] = res[i]["value"];
				}
				console.log("Loaded " + res.length + " language locales.");
				res()
			})
		});
	}

	TryGetValue(value) {
		return this._values[value] || "No language locale found for [" + value + "]";
	}
}

module.exports = LanguageManager;