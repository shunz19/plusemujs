var xmlreader = require("xml-reader").create();
var fs = require("fs");
var Palette = require("./Types/Palette.js");
var Color = require("./Types/Color.js")
var FigureSet = require("./Types/FigureSet.js")
var SetClass = require("./Types/SetClass.js")
var SetTypeUtility = require("./Types/SetTypeUtility.js")

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
		return new Promise((res, rej) => {
			xmlreader.on("done", data=> {
				for(var i = 0, len = data.children[0].children.length; i < len; ++i) {
					var palette = data.children[0].children[i];
					var id = palette.attributes.id
					_this._palettes[id] = new Palette(id);
					for(var j = 0, len2 = palette.children.length; j < len2; ++j) {
						var child = palette.children[j];
						_this._palettes[id].Colors[child.attributes.id] = new Color(child.attributes.id, child.attributes.index, child.attributes.club, child.attributes.selectable, child.children[0].value)
					}
				}
				for(var i = 0, len = data.children[1].children.length; i < len; ++i) {
					var setType = data.children[1].children[i];
					_this._setTypes[setType.attributes.type] = new FigureSet(SetTypeUtility.GetSetType(setType.attributes.type), setType.attributes.paletteid);

					for(var j = 0, len2 = setType.children.length; j < len2; ++j) {
						var set = setType.children[j];
						_this._setTypes[setType.attributes.type].Sets[set.attributes.id] = new SetClass(set.attributes.id, set.attributes.gender, set.attributes.club, set.attributes.colorable, set.attributes.selectable, set.attributes.preselectable);

						for(var k = 0, len3 = set.children.length; k < len3; ++k) {
							var part = set.children[k];
							if(!part.attributes.type) continue;
							_this._setTypes[setType.attributes.type].Sets[set.attributes.id].Parts[part.attributes.id + "-" + part.attributes.type] = new Part(part.attributes.id, SetTypeUtility.GetSetType(part.attributes.type), part.attributes.colorable, part.attributes.index, part.attributes.colorindex);
						}
					}
				}

				_this._setTypes["hd"].Sets[99999] = new SetClass(99999, "U", 0, true, false, false);
	            console.log("Loaded " + _this._palettes.length + " Color Palettes");
	            console.log("Loaded " + _this._setTypes.length + " Set Types");

				res();
			})

			xmlreader.parse(fs.readFileSync(__dirname + "/extra/figuredata.xml") + "");
		})
	}

	ProcessFigure(figure, gender, clothingParts, hasHabboClub) {

	}

	GetPalette(colorId) {

	}

	TryGetPalette(paletteId, palette) {

	}
}

module.exports = FigureDataManager