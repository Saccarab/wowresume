
// getFirstKill dates
// get all alt guilds in an array !!! not imp
// compare firstKill timestamps with guildFK's
// if smaller than 5 minutes 
// get that guild's world rank on that boss


// to do

// demon hunter check rankings by an alt char since you miss guild info
// guildscan
// could potentially have same issue on other toons due to created date
// same shit
// search alts!


var imperatorPersonal = 8965
var imperatorGuild = 9420
var blackhandPersonal = 8973
var blackhandGuild = 9421
var archimondePersonal = 10043
var archimondeGuild = 10176
var xaviusPersonal = 10827
var xaviusGuild = 11238
var helyaPersonal = 11398 
var helyaGuild = 11404
var guldanPersonal = 10850
var guldanGuild = 11239

var divClone;
var battleNetApiKey = "b7pycu6727tfgrnzawp6sn5bxeerh92z"; // Battle Net Api Key
var warcraftLogsApiKey = "bff965ef8c377f175a671dacdbdbc822"; // Warcraftlogs Api Key
var clicked;
var submitAlts = document.getElementById("alts");
var altsHtml = "Alts \n\n"
var playerGuilds = [];

// var killStamps = [ convert kill timestamps to JSON when pool gets bigger

$(document).ready(function(){
	submitAlts.innerHTML = "";
	clicked = false;
	divClone = $("#divid1").html();
	JFCustomWidget.subscribe("ready", function(){
		// fontSize = parseInt(JFCustomWidget.getWidgetSetting('fontSize'));
		// fontFamily = JFCustomWidget.getWidgetSetting('fontFamily');
		// fontColor = JFCustomWidget.getWidgetSetting('fontColor');
		});	
});

function buildArmoryLink(locale, realm, character){
	locale = localeTransform(locale);
	var armory = "https://worldofwarcraft.com/en-" + locale + "character/" + realm.replace(/\s+/g, '-') + "/" + character;
	return armory;
}

function buildTrackUrl(locale, realm, character){ 
	var track = "https://wowtrack.org/characters" + "/" + locale + "/"	 + realm + "/" + character; 
	return track;
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


function getClassColor(spec){
	switch(spec){
		case "priest":
			return "#FFFFFF";
			break;
		case "death knight":
			return "#C41F3B";
			break;
		case "demon hunter":
			return "#A330C9";
			break;
		case "hunter":
			return "#ABD473";
			break;
		case "druid":
			return "#FF7D0A";
			break;
		case "mage":
			return "#69CCF0";
			break;
		case "monk":
			return "#00FF96";
			break;
		case "paladin":
			return "#F58CBA";
			break;
		case "rogue":
			return "#FFF569";
			break;
		case "shaman":
			return "#0070DE";
			break;
		case "warlock":
			return "#9482C9";
			break;
		case "warrior":
			return "#C79C6E";
			break;
	}		
}


function getClassName(id){
	switch(id) {
		case 5:
			return "priest";
			break;
		case 6:
			return "death knight";
			break;
		case 12:
			return "demon hunter";
			break;
		case 3:
			return "hunter";
			break;
		case 11:
			return "druid";
			break;
		case 8:
			return "mage";
			break;
		case 10:
			return "monk";
			break;
		case 2:
			return "paladin";
			break;
		case 4:
			return "rogue";
			break;
		case 7:
			return "shaman";
			break;
		case 9:
			return "warlock";
			break;
		case 1:
			return "warrior";
			break;
	}		
}

function formatDate(string){
	var date = string.substring(string.lastIndexOf('s"')+3, string.lastIndexOf('</')).replace(",","");
	splitted = date.split(" ");
	formattedJoin = getMonth(splitted[0]) + "/" + splitted[1] + "/" + splitted[2]
	return (new Date(formattedJoin).getTime());
}

function getMonth(short){
	switch(short) {
		case "Jan":
			return 1;
			break;
		case "Feb":
			return 2;
			break;
		case "Mar":
			return 3;
			break;
		case "Apr":
			return 4;
			break;
		case "May":
			return 5;
			break;
		case "Jun":
			return 6;
			break;
		case "Jul":
			return 7;
			break;
		case "Aug":
			return 8;
			break;
		case "Sep":
			return 9;
			break;
		case "Oct":
			return 10;
			break;
		case "Nov":
			return 11;
			break;
		case "Dec":
			return 12;
			break;
	}		
}

function removeDiv(tag){
	var elem = document.getElementById(tag.id);
	elem.parentNode.parentNode.removeChild(tag.parentNode);
}

function getItemLevel(locale, realm, name , func){ //, div
	var request;

	if (locale == "EU")
		request = "https://eu.api.battle.net/wow/character/" + realm + "/" + name + "?fields=items&locale=en_GB&apikey=" + battleNetApiKey;
	else if (locale == "US")
		request = "https://us.api.battle.net/wow/character/" + realm + "/" + name + "?fields=items&locale=en_US&apikey=" + battleNetApiKey;

	$.ajax({
		async: true,
		type: 'GET',
		url: request,
		success: function(data) {
			var averageilvl = data.items.averageItemLevelEquipped;
			var classnm = getClassName(data.class);
			var obj = { 
				characterClass: classnm,
				characterilvl: averageilvl
			}
			func(locale, realm, name, obj)	
		}	
	});
}

function spaceToBlizzspace(convertMe){
	return convertMe.replace(" ", "%20");
}


function blizzspaceToSpace(convertMe){
	return convertMe.replace("%20", " ");

}
function addAltx(locale, realm, name, obj){ //, divid

	name = upperCaseFirstL(name);
	realm = toTitleCase(realm.toString());

	var alts = document.getElementById("alts");
	var link = document.createElement("a");
	var text = document.createElement('td1');
	var div = document.createElement("div"); 
	var button = document.createElement("img");

	button.style.border = "1.7px solid #000000"
	button.src = "images/remove.png";
	button.id = "button";
	button.width = "11";
	button.height = "11";

	button.addEventListener("click", function(e){
		removeDiv(this);
	});	

	text.innerHTML = " " + obj.characterilvl + " item level                               	"; //ilvl api

	link.setAttribute('target', '_blank');
	link.href = buildArmoryLink(locale, realm, name);
	link.innerHTML = name
	link.style.color = getClassColor(obj.characterClass);
	div.appendChild(link);
	div.appendChild(text);
	altsHtml = altsHtml + div.outerHTML + "\n";
	submitAlts.appendChild(div);

	div.appendChild(button);  //button on submission 
	alts.appendChild(div);	
}


function temp(){
	var altDiv = document.getElementById("alts");
	var altName = document.getElementById('altName').value;
	altName = upperCaseFirstL(altName);
	var locale = document.getElementById('locale').value;
	var altRealm = toTitleCase(document.getElementById('altRealm').value);
	getItemLevel( locale, altRealm, altName, addAltx); //(altDiv)
}

function fixName(name){
	return upperCaseFirstL(name.toLowerCase()).trim();
}

function guildRank(data, boss, personalAchiev, guildAchiev, rankText){
	var div = document.createElement("div");
	var img = document.createElement("img");	
	var text = document.createElement('td1');

	var index = data.achievements.achievementsCompleted.length;
	while (index-- && index >= 0){
		if (data.achievements.achievementsCompleted[index] == personalAchiev)
			break;
	}
	if (index != -1){
		var stamp = data.achievements.achievementsCompletedTimestamp[index];
		for (p = 0; p < playerGuilds.length ; p++){ 
			if (stamp < playerGuilds[p].dateLeave && stamp > playerGuilds[p].dateJoin){ //matching guild
				if ( playerGuilds[p].guildLocale == "eu")
					request = "https://eu.api.battle.net/wow/guild/" +  playerGuilds[p].guildRealm + "/" +  playerGuilds[p].guildName + "?fields=achievements&locale=en_GB&apikey=" + battleNetApiKey;
				else if ( playerGuilds[p].guildLocale == "us")
					request = "https://us.api.battle.net/wow/guild/" +  playerGuilds[p].guildRealm + "/" +  playerGuilds[p].guildName + "?fields=achievements&locale=en_US&apikey=" + battleNetApiKey;

				$.ajax({
					async: false,
					type: 'GET',
					url: request,
					success: function(aData) {
						var index = aData.achievements.achievementsCompleted.length;
						while (index--){
							if (aData.achievements.achievementsCompleted[index] == guildAchiev)
								break;
						}
						if (index != -1){
							var guildStamp = aData.achievements.achievementsCompletedTimestamp[index];
							var rank;	
							if (Math.abs(stamp - guildStamp) <= 150000){ //xav  swap this with wowprog First Kill
								$.ajax({
									async: false,
									type: 'GET',
									url: "rankings/"+boss+".txt",
									success: function(sData){
										var lines = sData.split("\n");
										lineCount = lines.length;
									    for (i=0 ; i < lineCount ; i++){
											if (lines[i].trim() === playerGuilds[p].guildLocale+playerGuilds[p].guildRealm+playerGuilds[p].guildName){ //temp fix??
												rank = i+1
												img.src = "images/" + boss + ".jpg";
												img.alt = boss+"_achiev";
												div.appendChild(img) //   
												text.innerHTML = rankText + rank + " in guild " + blizzspaceToSpace(playerGuilds[p].guildName) + "-" + blizzspaceToSpace(playerGuilds[p].guildRealm);
												div.appendChild(text)
												var kills = document.getElementById("kills");	
												kills.appendChild(div)
												break;
											}
										}
									},
									error: function(){ 
									  	alert("Couldnt load rankings data.")
			  						} 
								});						
							} // here
						}
					}
				});

			}
		}
	}
}
							
function mainPane(){

	playerGuilds = [];
	var kills = document.getElementById("kills").innerHTML = "Legion Raider.io First Kill Rankings\n"
	var charName = document.getElementById('char').value;
	charName = fixName(charName);
	var realm = toTitleCase(document.getElementById('realm').value).trim();
	var locale = document.getElementById('locale').value;
	var metric = document.getElementById('metric').value;
	var img = document.createElement("img");
	var proxy = "https://cors-anywhere.herokuapp.com/"; // proxy alternates/cors-anywhere.herokuapp.com
	var url = proxy + buildTrackUrl(locale, toTitleCase(realm.replace("-", "%20")), charName);
	// var killStamps;
	$.ajax({
	  url: url,
	  async: false,
	  success: function(data){

		var xavius;	  		
		var helya;
		var guldan;
	  	clicked = true;
	  	var loc;
		var name;
		var realm;
		var wClass;
		var grab;
		var ilvl;
		var lines = data.split("\n");
		var lineLength = lines.length;
		var merge = 0;
		var k = 0;
		document.getElementById("alts").innerHTML = "ALTS"; //Refresh on new submit
		
		for (i = 0; i < lineLength; i++){
			if (lines[i].indexOf("<a href=\"/characters") != -1 ) { // ALTS
				merge ++;
				var grab = lines[i].split("/");

				ilvl=lines[i+1].substring(lines[i+1].lastIndexOf("<td>") + 4,lines[i+1].lastIndexOf("</td>"));

				var grabLength = grab.length;

				for (j = 0; j < grabLength; j++){

					if (j == 2) //Grab Locale
				 		loc = grab[j];

				 	else if (j == 3) //Grab Realm

				 		realm = grab[j].replace(/%20/g, "-");

				 	else if (j == 4){ // Grab Class & Char Name

				 		//-----------------NAME----------------
				 		temp = grab[4];	
				 		temp = temp.split("\"");
				 		name = temp[3].replace(/['" ]+/g, '');
				 		name = name.replace("<", "");
				 		name = name.replace(">", "");
				 		//----------------CLASS--------------
				 		wClass = temp[2].replace("\"", "");
				 		wClass = wClass.substring(wClass.indexOf("-") + 1, wClass.length);
				 		wClass = wClass.replace("-"," ");
				 		var request;
				 		if (merge == 1){
				 			if (locale == "EU")
				 				request = "https://eu.api.battle.net/wow/character/" + realm + "/" + name + "?fields=items&locale=en_GB&apikey=" + battleNetApiKey;
				 			else if (locale == "US")
				 				request = "https://us.api.battle.net/wow/character/" + realm + "/" + name + "?fields=items&locale=en_US&apikey=" + battleNetApiKey;
				 		}
				 		getItemLevel(locale, realm, name, addAltx);
				 	} 	
				}
			}
			else if (lines[i].indexOf("guilds") != -1 ){ //guilds
				k++;
				var d = new Date();
				var n = d.getTime();
				var guildGrab = lines[i].substring(lines[i].lastIndexOf("guilds")+7, lines[i].lastIndexOf('" '));
				guildGrab = guildGrab.split("/");
				var dateLeave = formatDate(lines[i+3]);
				if (isNaN(dateLeave)){
					dateLeave = n
					}
				
				var tempGrab = guildGrab[2].split("%20");
				var tempSize = tempGrab.length;
				var gName = ""

				if (tempSize > 1){
					
					for (g = 0; g < tempSize-1; g++){
							gName = gName + tempGrab[g] + "%20";
					}

					gName = gName + tempGrab[tempSize-1];
				}
				else
					gName = guildGrab[2]

				guild = {
					guildLocale : guildGrab[0].toLowerCase(), // KR RU locales
					guildRealm : guildGrab[1].toLowerCase(),
					guildName : gName,
					dateJoin : formatDate(lines[i+2]),
				    dateLeave : dateLeave
				}

				if (k != 1) //missread on first catch
					playerGuilds.push(guild); 
				//Apr 29, 2016
				// guildLeft = lines [i+3].substring(lines[i+3].lastIndexOf('s"')+3, lines[i+3].lastIndexOf('</'))

			}
			else{}//cnd
		}
	   },
	  error: function (){ // Reset on fail
	  	clicked = false;
	  	$("#divid1").html(divClone); 
	  	alert("Invalid Character");
	  }
	});

	if (locale == "EU")
		request = "https://eu.api.battle.net/wow/character/" + realm + "/" + charName + "?fields=achievements&locale=en_GB&apikey=" + battleNetApiKey;
	else if (locale == "US")
		request = "https://us.api.battle.net/wow/character/" + realm + "/" + charName + "?fields=achievements&locale=en_US&apikey=" + battleNetApiKey;

	// ---------------------------------------------------------------------First Kil Block ----------------------------------------------------

	// ---------------------------------------------------------------------First Kil Block ----------------------------------------------------

	// ---------------------------------------------------------------------First Kil Block ----------------------------------------------------

	// ---------------------------------------------------------------------First Kil Block ----------------------------------------------------

	// ---------------------------------------------------------------------First Kil Block ----------------------------------------------------

	$.ajax({
		async: true,
		type: 'GET',
		url: request,
		success: function(data) { //dont send the data 6 times !! fix me
			var gText = "   Nighthold Nightmare Mythic world rank ";
			guildRank(data, "guldan", guldanPersonal, guldanGuild, gText)
			gText = "Trial of Valor Mythic world rank "
			guildRank(data, "helya", helyaPersonal, helyaGuild, gText)
			gText = "   Emerald Nightmare Mythic world rank ";
			guildRank(data, "xavius", xaviusPersonal, xaviusGuild, gText)
			gText = "   Hellfire Citadel Mythic world rank ";
			guildRank(data, "archimonde", archimondePersonal, archimondeGuild, gText)
			gText = "   Blackrock Foundry Mythic world rank ";
			guildRank(data, "blackhand", blackhandPersonal, blackhandGuild, gText)
			gText = "   Highmaul Mythic world rank ";
			guildRank(data, "imperator", imperatorPersonal, imperatorGuild, gText)
		}

	});

	var base = "https://wowtrack.org/characters/"; //WowTrack character url body

	img.onclick = function() {
		var image = (buildTrackUrl(locale, realm, charName));
		window.open(image);

	};
	img.setAttribute('target', '_blank');
	var response = "?response=signature&fields=progression,averageItemLevel,mythicDungeonLevel";
	var realmNonSpace = realm.replace(" ", "%20");
	img.src = base + locale + "/" + realmNonSpace + "/" + charName + response;

	img.href = "https://wowtrack.org/characters/" + locale + "/" + realmNonSpace + "/" + charName;
	
	img.alt = "Invalid Character";
	var div = document.createElement("div");
	div.appendChild(img);

	document.getElementById("characterPane").innerHTML="";
	document.getElementById("characterPane").appendChild(div);

	var artifactJSON = "https://raider.io/api/v1/characters/profile?region=" + locale + "&realm=" + realm + "&name=" + charName + "&fields=gear"; // <3

	$.ajax({
		async: true,
		type: 'GET',
		url: artifactJSON,
		success: function(data) {
			var art = document.getElementById("artifact");
			var artifactTraits = data.gear.artifact_traits;
			var artifactText = "Currently " + artifactTraits + " artifact points are allocated.";
			document.getElementById("artifact").innerHTML = "";
			art.innerHTML = art.innerHTML + "\n" + artifactText;
		}
	});

	var wlogsBody = "https://www.warcraftlogs.com/character/" + locale + "/" + realm.replace(/\s+/g, '-') + "/" + charName 
	document.getElementById("wlogs").href = wlogsBody;

	var wowProgressText = "https://www.wowprogress.com/character/" + locale + "/" + realm.replace(/\s+/g, '-') + "/" + charName;

	var armoryText = buildArmoryLink(locale, realm, charName); 
	
	document.getElementById("blizz").href = armoryText;
	document.getElementById("progress").href = wowProgressText;
	var blizzString = document.getElementById("blizz").children[0].text;
	JFCustomWidget.subscribe("submit", function(){
		
		document.body.style.backgroundColor = "black";
		var blizzString = document.getElementById("blizz").outerHTML;		
		var pane = document.getElementById("characterPane").outerHTML
		var progressString = document.getElementById("progress").outerHTML;
		var wlogsString = document.getElementById("wlogs").outerHTML;
		var killsString = document.getElementById("kills").outerHTML;
			
		var result = {}
		result.valid = false;
		 
		if(clicked) /// this?  charName != "" && realm != "" && 
			result.valid = true;

		result.value = pane + blizzString + progressString + wlogsString + killsString + altsHtml ;
		result.valid = false;
		JFCustomWidget.sendSubmit(result);

	});
	
}
