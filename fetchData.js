// getFirstKill dates
// get all alt guilds in an array till sept20
// compare firstKill timestamps with guildFK's
// if smaller than 5 minutes 
// get that guild's world rank on that boss




//to do

//selloutxd has theh elya achiev but not the xavius one :S
//same shit
//
//garroshMythic 8482 25/10 man above this
var garroshPersonal = 8679 //8680 // Alliance and horde dif achievs
var garroshGuild = 8511

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


function localeTransform(locale){
	if (locale == "EU")
		return localeCode = "gb/";
	else
		return localeCode = "us/"; // handle kr??
}

function getClassColor(spec){
	switch(spec) {
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
	if (index != -1)
	var stamp = data.achievements.achievementsCompletedTimestamp[index];

	for (p = 0; p < playerGuilds.length ; p++){ 
		if (stamp < playerGuilds[p].dateLeave && stamp > playerGuilds[p].dateJoin){ //matching guild
			if ( playerGuilds[p].guildLocale == "EU")
				request = "https://eu.api.battle.net/wow/guild/" +  playerGuilds[p].guildRealm + "/" +  playerGuilds[p].guildName + "?fields=achievements&locale=en_GB&apikey=" + battleNetApiKey;
			else if ( playerGuilds[p].guildLocale == "US")
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
					if (index != -1)
					var guildStamp = aData.achievements.achievementsCompletedTimestamp[index];
/*
	https://www.wowprogress.com/guild/eu/tarren-mill/Method/rating.tier18
	https://www.wowprogress.com/guild/locale small/realm with score/guildname/rating.tier18 Archimonde
	https://www.wowprogress.com/guild/eu/tarren-mill/Method/rating.tier17 Blackhand

/*/
					var rank;	
	
					if (Math.abs(stamp - guildStamp) <= 150000){ //xav  swap this with wowprog
						console.log(playerGuilds[p])
						// $.getJSON("rankings/imperator.json", function(data) {
						// 	aSize = data.length;
						//     for (i=0 ; i < aSize ; i++){
						// 		if (data[i].guildName == playerGuilds[p].guildName && playerGuilds[p].guildLocale == data[i].locale && data[i].guildRealm == playerGuilds[p].guildRealm){
						// 			rank = i
						// 			console.log(data[i].guildName , playerGuilds[p].guildName , playerGuilds[p].guildLocale , data[i].locale , data[i].guildRealm , playerGuilds[p].guildRealm)
						// 			img.src = "images/" + boss + ".jpg";
						// 			img.alt = boss+"_achiev";
						// 			div.appendChild(img) //   
						// 			text.innerHTML = rankText + rank + " in guild " + blizzspaceToSpace(playerGuilds[p].guildName) + "-" + blizzspaceToSpace(playerGuilds[p].guildRealm);
						// 			div.appendChild(text)
						// 			var kills = document.getElementById("kills");	
						// 			kills.appendChild(div)
						// 			}
						// 	}
						// });
								
								
								
								
								// if (boss == "xavius")
								// 	rank = data.raid_rankings["the-emerald-nightmare"].mythic.world;
								// else if (boss == "helya")
								// 	rank = data.raid_rankings["trial-of-valor"].mythic.world;
								// else if (boss == "guldan")
								// 	rank = data.raid_rankings["the-nighthold"].mythic.world;

								

							

						
					} // here
				}
			});

		}
	}
}
			
									//https://raider.io/api/v1/guilds/profile?region=EU&realm=twisting%20nether&name=CATASTROPHE&fields=raid_rankings
							
function mainPane(){


	//  var complete = [4860, 4861, 4913, 4947, 4948, 4989, 4997, 5009, 5010, 5024, 5025, 5027, 5028, 5030, 5035, 5036, 5038, 5039, 5040, 5041, 5042, 5043, 5044, 5046, 5047, 5049, 5069, 5071, 5076, 5078, 5081, 5082, 5096, 5098, 5101, 5103, 5105, 5106, 5113, 5127, 5135, 5136, 5137, 5138, 5140, 5144, 5145, 5160, 5163, 5173, 5174, 5175, 5176, 5177, 5178, 5179, 5184, 5185, 5186, 5187, 5188, 5196, 5201, 5239, 5263, 5273, 5362, 5420, 5421, 5422, 5459, 5460, 5465, 5466, 5467, 5780, 5781, 5782, 5783, 5785, 5840, 5892, 6120, 6121, 6182, 6533, 6625, 6626, 6664, 6666, 6700, 6701, 6702, 6764, 6766, 6767, 6768, 6772, 7434, 7446, 7447, 7843, 7844, 8708, 9369, 9370, 9371, 9372, 9373, 9374, 9375, 9376, 9388, 9416, 9417, 9420, 9421, 9669, 10175, 10856, 10857, 10858, 10859, 10860, 10861, 10862, 10863, 10864, 10865, 10866, 10868, 11225, 11226, 11227, 11228, 11238, 11239, 11403, 11404, 11428, 11782]
 //     var completeStamps =  [1452642837000, 1451457537000, 1492395148000, 1483564906000, 1458184751000, 1454338240000, 1470013094000, 1452052371000, 1485155864000, 1459262849000, 1488015618000, 1474848944000, 1472606166000, 1475757839000, 1464316831000, 1477731945000, 1451460844000, 1452508699000, 1452510539000, 1452509658000, 1452510832000, 1452513203000, 1452512512000, 1452512040000, 1484530900000, 1484529817000, 1476244005000, 1469421080000, 1476416060000, 1469422424000, 1469424402000, 1476417723000, 1452075245000, 1484676258000, 1452070597000, 1452073888000, 1452077114000, 1469597078000, 1452072123000, 1457977643000, 1453891819000, 1454046113000, 1454048528000, 1453890899000, 1453892935000, 1482965759000, 1452704679000, 1496161110000, 1468109343000, 1451602389000, 1452166654000, 1453874217000, 1451601951000, 1452187031000, 1453754747000, 1453874217000, 1470013094000, 1451481366000, 1452052371000, 1452776839000, 1452054050000, 1451461304000, 1454766111000, 1475182937000, 1499296174000, 1482893074000, 1451458947000, 1496893124000, 1472769006000, 1494386457000, 1452352300000, 1471375538000, 1452990070000, 1482185285000, 1469589805000, 1452053009000, 1459229567000, 1469675858000, 1494808581000, 1459830637000, 1452052371000, 1459236246000, 1453889515000, 1491968033000, 1485155864000, 1452629505000, 1497812123000, 1452642837000, 1451481366000, 1497911112000, 1452990070000, 1472057419000, 1464574972000, 1488952247000, 1488953707000, 1497908223000, 1488954179000, 1488953154000, 1452511309000, 1481060067000, 1459234073000, 1451481366000, 1451481366000, 1451457537000, 1464216210000, 1464141014000, 1452349179000, 1464213935000, 1452443977000, 1452078679000, 1452077906000, 1452199588000, 1464216210000, 1472450745000, 1472446885000, 1472450745000, 1472446885000, 1472450745000, 1456195197000, 1473025558000, 1472981779000, 1473032092000, 1472986404000, 1473054557000, 1473050167000, 1472725033000, 1473022784000, 1473649486000, 1473651786000, 1474865599000, 1485143164000, 1474436812000, 1474962709000, 1481929422000, 1484074488000, 1481513895000, 1496639938000, 1478756390000, 1496723295000, 1477471120000, 1498626284000];
	
 //    var index = complete.length;
	// while (index-- && index >= 0){
	// 	if (complete[index] == imperatorGuild)
	// 		break;
	// }
	// if (index != -1)
	// var stamp = completeStamps[index];
	// console.log(stamp)



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
				guild = {
					guildLocale : guildGrab[0],
					guildRealm : guildGrab[1],
					guildName : guildGrab[2],
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
		success: function(data) {
			var gText = "   Nighthold Nightmare Mythic world rank ";
			guildRank(data, "guldan", guldanPersonal, guldanGuild, gText)
			gText = "Trial of Valor Mythic world rank "
			guildRank(data, "helya", helyaPersonal, helyaGuild, gText)
			gText = "   Emerald Nightmare Mythic world rank ";
			guildRank(data, "xavius", xaviusPersonal, xaviusGuild, gText)
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
	//+ "/" +  + "/"  "?metric=" + metric + "&api_key=" + warcraftLogsApiKey;
	document.getElementById("wlogs").href = wlogsBody;

	// var warcraftLogsText = "https://www.warcraftlogs.com/"; 

	// $.ajax({
 //     async: true,
 //     type: 'GET',
 //     url: wlogsBody,
 //     success: function(bdata) {
 //     	if(bdata.hidden){
 //     		alert("Private Logs. Couldnt fetch the wlogs page.");
 //     		document.getElementById("wlogs").href = "https://www.warcraftlogs.com";
 //     	}
 //     	else if (bdata[0] == undefined){
 //     		//wrong realm or character ??
 //     	}

 //     	else{
	// 		wclCharacterId = bdata[0].specs[0].data[0].character_id;
	// 		warcraftLogsText = "https://www.warcraftlogs.com/character/id/" + wclCharacterId;
	// 		document.getElementById("wlogs").href = warcraftLogsText;
	// 	}
	//  },
	//  error: function(){
	//  	alert("Private Logs!");
	//  }
	// });

	var wowProgressText = "https://www.wowprogress.com/character/" + locale + "/" + realm.replace(/\s+/g, '-') + "/" + charName;

	var armoryText = buildArmoryLink(locale, realm, charName); 
	
	document.getElementById("blizz").href = armoryText;
	document.getElementById("progress").href = wowProgressText;
	var blizzString = document.getElementById("blizz").children[0].text;
	JFCustomWidget.subscribe("submit", function(){
 	
		document.body.style.backgroundColor = "black";
		var blizzString = document.getElementById("blizz").outerHTML;
		// blizzString.children.width = "40"; //wont work
		// blizzString.children.height = "40";
		
		var pane = document.getElementById("characterPane").outerHTML

		var progressString = document.getElementById("progress").outerHTML;
		// progressString.children.width = "40";
		// progressString.children.height = "40";

		var wlogsString = document.getElementById("wlogs").outerHTML;
		// progressString.children.width = "40";
		// progressString.children.height = "40";
		
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