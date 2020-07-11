class SetClass {
    constructor(id, gender, clubLevel, colorable, selectable, preselectable) {
        this.Id = id;
        this.Gender = gender;
        this.ClubLevel = clubLevel;
        this.Colorable = colorable;
        this.Selectable = selectable;
        this.Preselectable = preselectable;
        this.Parts = []
    }
}

module.exports = SetClass;