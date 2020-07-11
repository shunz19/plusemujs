var xmlreader = require("xml-reader").create();
var fs = require("fs");
var Palette = require("./Types/Palette.js");
var Color = require("./Types/Color.js")
class FigureDataManager {
	constructor() {
		this._palettes = [];
		this._setTypes = [];
		this._requirements = ["hd","ch","lg"]
	}

	Init() {
		if (this._palettes.length > 0) this._palettes = [];
		if (this._setTypes.length > 0) this._setTypes = [];
		var _this = this;
		xmlreader.on("done", data=> {
			for(var i = 0; i < data.children[0].children.length; i++) {
				var palette = data.children[0].children[i];
				var id = parseInt(palette.attributes.id)
				_this._palettes[id] = new Palette(id);
				for(var j = 0, len2 = palette.children.length; j < len2; j++) {
					var child = palette.children[j];
					_this._palettes[id].Colors[child.attributes.id] = new Color(child.attributes.id, child.attributes.index, child.attributes.club, child.attributes.selectable, child.children[0].value)
				}
			}
			for(var i = 0; i < data.children[1].children.length; i++) {
				var setType = data.children[1].children[i];
			}
		})
		xmlreader.parse(fs.readFileSync(__dirname + "/extra/figuredata.xml") + "");
	}
}

module.exports = FigureDataManager