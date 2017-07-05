var divClone;
var battleNetApiKey = "b7pycu6727tfgrnzawp6sn5bxeerh92z"; // Battle Net Api Key
var warcraftLogsApiKey = "bff965ef8c377f175a671dacdbdbc822"; // Warcraftlogs Api Key

$(document).ready(function(){

    divClone = $("#divid1").html();

    JFCustomWidget.subscribe("ready", function(){

    fontSize= parseInt(JFCustomWidget.getWidgetSetting('fontSize'));
    fontFamily= JFCustomWidget.getWidgetSetting('fontFamily');
    fontColor= JFCustomWidget.getWidgetSetting('fontColor');

	console.log(value);
});

    JFCustomWidget.subscribe("submit", function(){

		     var result = {}

		     result.valid = true;
		     result.value = '<div><a href="https://www.worldofwarcraft.com" target="_blank" id = "blizz">' +
			 '<img border="0" alt="armory" src="https://s-media-cache-ak0.pinimg.com/236x/18/f2/c2/18f2c237688c6a4395e0f6a702743a7c.jpg></a></div>'; 
		     JFCustomWidget.sendSubmit(result);

});

});

function buildArmoryLink(locale, realm, character){
	locale = localeTransform(locale);
	var armory = "https://worldofwarcraft.com/en-" + locale + "character/" + realm.replace(/\s+/g, '-') + "/" + character;
	return armory;
}

function buildTrackUrl(locale, realm, character){ //<3
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

function getClassColor(className){
	switch(className) {
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

function mainPane(){

	var charName = document.getElementById('char').value;
	charName = upperCaseFirstL(charName);
	var realm = toTitleCase(document.getElementById('realm').value);
	var locale = document.getElementById('locale').value;
	var metric = document.getElementById('metric').value;
	var img = document.createElement("img");
	var proxy = "https://cors-anywhere.herokuapp.com/"; //"http://crossorigin.me/"
	var url = proxy + buildTrackUrl(locale, toTitleCase(realm.replace("-", "%20")), charName);

	$.ajax({
	  url: url,
	  success: function(data){
	  	var loc;
		var name;
		var realm;
		var wClass;
		var grab;
		var ilvl;

		var lines = data.split("\n");

		var lineLength = lines.length;

		document.getElementById("alts").innerHTML = "ALTS"; //Refresh on new submit

		var merge = 0;
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
				 			if (locale == "EU"){
				 				request = "https://eu.api.battle.net/wow/character/" + realm + "/" + name + "?fields=items&locale=en_GB&apikey=" + battleNetApiKey;
				 			}
				 			else if (locale == "US"){
				 				request = "https://us.api.battle.net/wow/character/" + realm + "/" + name + "?fields=items&locale=en_US&apikey=" + battleNetApiKey;
				 			}
				 		}
				 		var alts = document.getElementById("alts");
						var link = document.createElement("a");
						var text = document.createElement('td1');
						var div = document.createElement("div");

						$.ajax({
							async: false,
							type: 'GET',
							url: request,
							success: function(data) {
								var averageilvl = data.items.averageItemLevelEquipped;
								text.innerHTML = "         " + averageilvl + " item level";
							}
						});

						if (merge!=1){
							if (ilvl>800)
								text.innerHTML = "         " + ilvl + " item level";
							else
								text.innerHTML = " Below Legion " + ilvl + " item level";
						}

						link.setAttribute('target', '_blank')
						link.href = buildArmoryLink(loc, realm , name);
						link.innerHTML = upperCaseFirstL(name);
						link.style.color = getClassColor(wClass);
						div.appendChild(link);
						div.appendChild(text);
						alts.appendChild(div);
				 	}
				}
			}
		}
	  },
	  error: function (){ // Reset on fail
	  	$("#divid1").html(divClone);
	  	document.getElementById("alts").innerHTML = "ALTS";
	  	document.getElementById("artifact").innerHTML = "";
	  	alert("Invalid Character");
	  }
	});

	var base = "https://wowtrack.org/characters/"

	img.onclick = function() {
	    window.open(buildTrackUrl(locale, realm, charName));
	};

	img.setAttribute('target', '_blank')
	var response = "?response=signature&fields=progression,averageItemLevel,mythicDungeonLevel"
	img.src = base + locale + "/" + realm + "/" + charName + response;

	img.href = "https://wowtrack.org/characters/" + locale + "/" + realm + "/" + charName;

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

	var wlogsBody = "https://www.warcraftlogs.com:443/v1/parses/character/" + charName + "/" + realm.replace(/\s+/g, '-') + "/" + locale + "?metric=" + metric + "&api_key=" + warcraftLogsApiKey;

	var warcraftLogsText = "https://www.warcraftlogs.com/"; //<3

	$.ajax({
     async: true,
     type: 'GET',
     url: wlogsBody,
     success: function(bdata) {
		wclCharacterId = bdata[0].specs[0].data[0].character_id;
		warcraftLogsText = "https://www.warcraftlogs.com/character/id/" + wclCharacterId;
		document.getElementById("wlogs").href = warcraftLogsText;
		}
	});

	var wowProgressText = "https://www.wowprogress.com/character/" + locale + "/" + realm.replace(/\s+/g, '-') + "/" + charName;

	var armoryText = buildArmoryLink(locale, realm, charName);

	document.getElementById("blizz").href = armoryText;
	document.getElementById("progress").href = wowProgressText;

}
