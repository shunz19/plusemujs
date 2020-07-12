var xmlreader = require("xml-reader").create();
var fs = require("fs");
var Palette = require("./Types/Palette.js");
var Color = require("./Types/Color.js")
var Part = require("./Types/Part.js")
var FigureSet = require("./Types/FigureSet.js")
var SetClass = require("./Types/SetClass.js")
var SetTypeUtility = new (require("./Types/SetTypeUtility.js"))()

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
				console.log("Loaded " + Object.keys(_this._palettes).length + " Color Palettes");
				console.log("Loaded " + Object.keys(_this._setTypes).length + " Set Types");

				res();
			})

			xmlreader.parse(fs.readFileSync(__dirname + "/extra/figuredata.xml") + "");
		})
	}

	ProcessFigure(figure, gender, clothingParts, hasHabboClub) {
		figure = figure.toLowerCase();
		gender = gender.toUpperCase();
		var rebuildFigure = "";
		var figureParts = figure.split(".");
		/* @region Check clothing, colors & Habbo Club */
		for(var i = 0, len = figureParts.length; i < len; i++) {
			var part = figureParts[i];
			var partSplit = part.split("-")
			var type = partSplit[0];
			var figureSet = this._setTypes[type];
			if(figureSet) {
				var partId = parseInt(partSplit[1]);
				var colorId = 0;
				var secondColorId = 0;
				var set = figureSet.Sets[partId];
				if(set) {
					// @region Gender Check
					if(set.Gender != gender && set.Gender != "U") {
						var filtered = figureSet.Sets.filter(x=>x.Gender == gender || x.Gender == "U");
						if(filtered.length > 0) {
							partId = filtered[0].Id;
							set = filtered[0];
						}
					}

					// @region Colors
					if(set.Colorable) {
						switch(partSplit.length - 1) {
							case 3:
							case 2:
								var _tn = parseInt(partSplit[2]);
								// @region First Color
								if(!isNaN(_tn)) {
									colorId = _tn;
									var palette = this.GetPalette(colorId);
									if(colorId != 0 && (!palette || figureSet.PalletId != palette.Id)) {
										this.GetRandomColor(figureSet.PalletId);
									}
								}

								// @region Second Color
								if(partSplit.length - 1 == 3) {
									_tn = parseInt(partSplit[3]);
									if(!isNaN(_tn)) {
										secondColorId = _tn;
										var palette = this.GetPalette(secondColorId);
										if(secondColorId != 0 && (!palette || figureSet.PalletId != palette.Id)) {
											this.GetRandomColor(figureSet.PalletId);
										}
									}
								}
							break;
						}
					}
					else {
						var ignore = ["ca","wa"];
						if(ignore.includes(type.toLowerCase()) && partSplit[2]) colorId = parseInt(partSplit[2]);
					}

					if(set.ClubLevel > 0 && !hasHabboClub) {
						var filtered = figureSet.Sets.filter(x=>(x.Gender == gender || x.Gender == "U") && x.ClubLevel == 0);
						if(filtered.length > 0) {
							partId = filtered[0].Id;
							set = filtered[0];
							colorId = this.GetRandomColor(figureSet.paletteId);
						}
					}
					rebuildFigure += type + "-" + partId + "-" + colorId + "." + (secondColorId == 0 ? "" : secondColorId);
				}
			}
		}

		/* @region check required clothing */
		for(var requirement of this._requirements) {
			if(requirement == "ch" && gender == "M") continue;
			if(!rebuildFigure.indexOf(requirement)) {
				var figureSet = this._setTypes[requirement];
				if(figureSet) {
					var filtered = figureSet.Sets.filter(x=>x.Gender == gender || x.Gender == "U");
					if(filtered.length > 0) {
						partId = filtered[0].Id;
						colorId = this.getRandomColor(figureSet.PalletId);
						rebuildFigure += requirement + "-" + partId + "-" + colorId + ".";
					}
				}
			}
		}

		/* @region Check purchasable clothing */
		if(clothingParts) {

		}

		return rebuildFigure
	}

	GetPalette(colorId) {
		for(var key in this._palettes) {
			if(this._palettes[key].Colors[colorId]) return this._palettes[key];
		}
	}


	TryGetPalette(paletteId, palette) {

	}


	GetRandomColor(palletId) {
		return this._palettes[palletId].Colors[Object.keys(this._palettes[palletId].Colors)[0]].id
	}
}

module.exports = FigureDataManager