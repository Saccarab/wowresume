// to do guild prototype methods

// [[[[--------------------------------Helper Functions ---------------------------------------]]]]
// [[[[--------------------------------Helper Functions ---------------------------------------]]]]


// [[[[--------------------------------Formatter--------------------------]]]]

function buildArmoryLink(locale, realm, character){
	locale = localeTransform(locale);
	let armory = "https://worldofwarcraft.com/en-" + locale + "character/" + realm.replace(/\s+/g, '-') + "/" + character;
	return armory;
}

function buildTrackUrl(locale, realm, character){ 
	realm = realm.replace("-", "%20")
	let track = "https://wowtrack.org/characters" + "/" + locale + "/"	 + realm + "/" + character; 
	return track;
}

function fixName(name){
	return upperCaseFirstL(name.toLowerCase()).trim();
}

function toTitleCase(str){
	return str.replace(/\w\S*/g, function(txt){
		return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
	});
}

function upperCaseFirstL(word){
	return word.charAt(0).toUpperCase() + word.slice(1);
}

function lowerCaseFirstL(word){
	return word.charAt(0).toLowerCase() + word.slice(1);
}

function localeTransform(locale){
	if(locale == "EU")
		return localeCode = "gb/";
	else
		return localeCode = "us/"; // handle kr??
}

function formatDate(string){ // convert to timestamp from Mar 06 2016 format
	let date = string.substring(string.lastIndexOf('s"')+3, string.lastIndexOf('</')).replace(",","");
	splitted = date.split(" ");
	formattedJoin = getMonth(splitted[0]) + "/" + splitted[1] + "/" + splitted[2]
	return (new Date(formattedJoin).getTime());
}

function spaceToBlizzspace(convertMe){
	return convertMe.replace(" ", "%20");
}

function blizzspaceToSpace(convertMe){
	return convertMe.replace("%20", " ");
}

function convertQuotes(str){
	return str.replace('%27', "'")
}

function conv(str){
	str = blizzspaceToSpace(str)
	return convertQuotes(str)
}

function removeParanthesis(str){
	return str.replace('(', "").replace(')', "")
}

// [[[[--------------------------------Build/Equality--------------------------]]]]

function guildEquals(obj1, obj2){
	if (obj1.guildName === obj2.guildName && obj1.guildLocale === obj2.guildLocale && obj1.guildRealm === obj2.guildRealm)
		return true
	else
		return false
}

function copyObject(initObj, arrayToPush){
	let temp = initObj.dateJoin
	let temp2 = initObj.dateLeave
	delete initObj.dateJoin //patchwerk solution
	delete initObj.dateLeave
	if (initObj.boss) delete initObj.boss
	arrayToPush.push(JSON.parse(JSON.stringify(initObj)))
	initObj.dateJoin = temp
	initObj.dateLeave = temp2
}

function loading(){
	let load = document.createElement("img");
	load.setAttribute("id", "loading");
	load.src = 'https://github.com/Saccarab/WoW-Resume/blob/master/images/Loading.gif?raw=true'
	load.alt = 'Loading'
	let kills = document.getElementById('kills').appendChild(load)
}

function notLoading(){ //hardcode
	let load = document.getElementById("loading")
	if (load)
		load.parentNode.removeChild(load);
}

function triggerTooltip(text){
	let tooltip = document.getElementById('button_1')
	let prev = tooltip.getAttribute('data-content')
	let insert = prev + `- ${text}.<br>`
	tooltip.setAttribute('data-content', insert)
}

function openers(){
	process = true;
	tooltip = true
	fresh = []
	playerGuilds = []
	altsArray = []
	guildRequestList = []
	uniqueRequest = []
	stamps = []
	callCount = 0
	callbackCount = 0
	submitHtml.innerHTML = "\n----------------First Kill Rankings----------------\n"
	altsHtml = "\n----------------Alt Characters----------------\n"
	clicked = true
}

