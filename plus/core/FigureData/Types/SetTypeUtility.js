class SetTypeUtility {
    
    constructor() {}

	GetSetType(type) {
		var types = ["HR","HD","CH","LG","SH","HA","HE","EA","FA","CA","WA","CC","CP"];
		return types.indexOf(type.toUpperCase());
	}
}

module.exports = SetTypeUtility