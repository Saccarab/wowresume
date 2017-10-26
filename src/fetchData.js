// to do
// document send the character achievement request data billion times for every single boss lookup!
// drop down realm list for eu/us
// implement kr
// async.await ??
// fix all the patchwerk/bandaid solutions

// guild migrate causes multiple bugs
// character data is mostly non existant prior to july 2012 //ragnaros deathwing wont work most of the time


// [[[[--------------------------------Constants--------------------------------------------------------]]]]
const battleNetApiKey = "b7pycu6727tfgrnzawp6sn5bxeerh92z"; // Battle Net Api Key
const warcraftLogsApiKey = "bff965ef8c377f175a671dacdbdbc822"; // Warcraftlogs Api Key
const proxy = "https://cors-anywhere.herokuapp.com/"; // proxy alternates ??


// [[[[--------------------------------Initialize-------------------------------------------------------]]]]
let divClone;
let clicked;
//global loads
let charName;
let realm;
let locale;

let altsHtml = "Alts \n\n"

let playerGuilds = []; //whole list
let guildRequestList = [];  //guilds to be requested
let altsArray = [] //alt toons
let fresh = []; //unique requests only which will hold up the data

let callbackCount = 0
let callCount = 0;
let uniqueItems; 
let uniqueRequest; 

let stamps;
let lost = false;

$(document).ready(function(){
	clicked = false;
	divClone = $("#divid1").html();
	JFCustomWidget.subscribe("ready", function(){ 
		// implement jotform options
		// fontSize = parseInt(JFCustomWidget.getWidgetSetting('fontSize'));
		// fontFamily = JFCustomWidget.getWidgetSetting('fontFamily');
		// fontColor = JFCustomWidget.getWidgetSetting('fontColor');
	});	
});

function readToon(url, callback){
	$.ajax({
	  url: url,
	  async: true,
	  success: function(data){
	  		let grab;
	  		let k = 0;
			let lines = data.split("\n");
			let lineLength = lines.length;
			for (i = 0; i < lineLength; i++){
				if (lines[i].indexOf("guilds") != -1 ){ //guilds
					k++;
					let d = new Date();
					let n = d.getTime();
					let guildGrab = lines[i].substring(lines[i].lastIndexOf("guilds")+7, lines[i].lastIndexOf('" '));
					guildGrab = guildGrab.split("/");
					let dateLeave = formatDate(lines[i+3]); //convert to stamp
					if (isNaN(dateLeave)){
						dateLeave = n
					}
					
					let tempGrab = guildGrab[2].split("%20");
					let tempSize = tempGrab.length;
					let gName = ""

					if (tempSize > 1){

						for (g = 0; g < tempSize-1; g++){
							gName = gName + tempGrab[g] + "%20"
						}

						gName = gName + tempGrab[tempSize-1];
					}
					else
						gName = guildGrab[2]

					guild = {
						guildLocale : guildGrab[0].toLowerCase(), // KR RU locales
						guildRealm : guildGrab[1].toLowerCase(),
						guildName : gName,
						dateJoin : formatDate(lines[i+2]), //converted to timestamps so it's easier to compare with blizz killstamps
						dateLeave : dateLeave
					}

					if (k != 1) //missread on first catch
						playerGuilds.push(guild); 						
				}
				else if (lines[i].indexOf("Merged Characters") != -1 ){
					let merge = lines[i+1].split('/')
					let mergeGrab = merge[4].split(" ")
					let mergeName = mergeGrab[0].slice(0, -1)
					let mergeRealm = merge[3]
					let mergeLocale = merge[2];
					if (!(mergeName === charName && mergeLocale === locale && mergeRealm === realm))
						getItemLevel(mergeLocale, mergeRealm, mergeName, addAltx);
				}
			}
			//callback()
			//handle error??
	  	callback();
	  },
	  error: function(){
	  	console.log("error while reading toon");
	  	callback();
	  }			  
	});
}

function rankings(){
	if (locale == "EU")
		request = "https://eu.api.battle.net/wow/character/" + realm + "/" + charName + "?fields=achievements&locale=en_GB&apikey=" + battleNetApiKey;
	else if (locale == "US")
		request = "https://us.api.battle.net/wow/character/" + realm + "/" + charName + "?fields=achievements&locale=en_US&apikey=" + battleNetApiKey;
	else
		console.log("unknown error") //use more of these??

	$.ajax({
		async: true,
		type: 'GET',
		url: request,
		success: function(data) { //dont send the data 6 times !! fix me

			let obj = {
				completedArray : data.achievements.achievementsCompleted,
				timestamps : data.achievements.achievementsCompletedTimestamp
			}

			playerStamps(obj)

			guildRank(data, "ragnaros", ragnarosPersonal)
			guildRank(data, "deathwing", deathwingPersonal)
			guildRank(data, "emperor", emperorPersonal)
			guildRank(data, "shekzeer", shekzeerPersonal)
			guildRank(data, "shaoffear", shaoffearPersonal)
			guildRank(data, "raden", radenPersonal)
			guildRank(data, "garrosh", garroshPersonal)
			guildRank(data, "guldan", guldanPersonal)
			guildRank(data, "helya", helyaPersonal)
			guildRank(data, "xavius", xaviusPersonal)
			guildRank(data, "archimonde", archimondePersonal)
			guildRank(data, "blackhand", blackhandPersonal)
			guildRank(data, "imperator", imperatorPersonal)

			guildRequestList.sort(function(a, b){
				return b.boss - a.boss 
			});

			fill();
		}
	});
}

function getItemLevel(locale, realm, name , func){ // getItemLevel(locale, grabRealm, name, addAltx) is sent from the mainPane
	let request;

	if (locale == "EU")
		request = "https://eu.api.battle.net/wow/character/" + realm + "/" + name + "?fields=items&locale=en_GB&apikey=" + battleNetApiKey;
	else if (locale == "US")
		request = "https://us.api.battle.net/wow/character/" + realm + "/" + name + "?fields=items&locale=en_US&apikey=" + battleNetApiKey;

	$.ajax({
		async: true,
		type: 'GET',
		url: request,
		success: function(data) {
			let averageilvl = data.items.averageItemLevelEquipped;
			let classnm = getClassName(data.class);
			let obj = { 
				characterClass: classnm,
				characterilvl: averageilvl
			}
			func(locale, realm, name, obj)   //call to addAlt 
		}	
	});
}

function addAltx(locale, realm, name, obj){ //, divid
	name = upperCaseFirstL(name);
	realm = toTitleCase(realm.toString());

	let alts = document.getElementById("alts");
	let link = document.createElement("a");
	let text = document.createElement('td1');
	let div = document.createElement("div"); 
	let button = document.createElement("img");

	button.style.border = "1.7px solid #000000"
	button.src = "images/remove2.png";
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

	div.appendChild(button);  //button on submission 
	alts.appendChild(div);	

}


function temp(){
	let altDiv = document.getElementById("alts");
	let altName = document.getElementById('altName').value;
	altName = upperCaseFirstL(altName);
	let locale = document.getElementById('locale').value;
	let altRealm = toTitleCase(document.getElementById('altRealm').value);
	getItemLevel( locale, altRealm, altName, addAltx); //(altDiv)
}

function playerStamps(obj){
	stamps = {
		ragnarosStamp : getStamp(ragnarosPersonal, obj),
		deathwingStamp : getStamp(deathwingPersonal, obj),
		emperorStamp : getStamp(emperorPersonal, obj),
		shekzeerStamp : getStamp(shekzeerPersonal, obj),
		shaoffearStamp : getStamp(shaoffearPersonal, obj),
		radenStamp : getStamp(radenPersonal, obj),
		garroshStamp : getStamp(garroshPersonal, obj),
		guldanStamp : getStamp(guldanPersonal, obj),
		helyaStamp : getStamp(helyaPersonal, obj),
		xaviusStamp : getStamp(xaviusPersonal, obj),
		archimondeStamp : getStamp(archimondePersonal, obj),
		blackhandStamp : getStamp(blackhandPersonal, obj),
		imperatorStamp : getStamp(imperatorPersonal, obj)
	}
}

function asyncGet(guildElement, index, callback){
	let request;

	if (fresh[index].guildLocale === "eu") //func
		request = "https://eu.api.battle.net/wow/guild/" +  guildElement.guildRealm + "/" +  guildElement.guildName + "?fields=achievements&locale=en_GB&apikey=" + battleNetApiKey;
	else if (fresh[index].guildLocale === "us")
		request = "https://us.api.battle.net/wow/guild/" +  guildElement.guildRealm + "/" +  guildElement.guildName + "?fields=achievements&locale=en_US&apikey=" + battleNetApiKey;

	$.ajax({
		async: true,
		type: 'GET',
		url: request,
		success: function(aData) {	

			let obj = {
				completedArray : aData.achievements.achievementsCompleted,
				timestamps : aData.achievements.achievementsCompletedTimestamp
			}

			fresh[index].guildData = obj;
			callback();

		},

		error: function() {
            console.log('error for ' + guildElement.guildName); // error for undefined?
            lost = true;
            callback();
        }
	});
}

function fill(){
	let size = fresh.length;
	fresh.forEach(function(ele, i){
		asyncGet(ele, i, function(){
			callbackCount++;
			if (callbackCount === size){
				loopThrough()
				return
			}
		});
		
	});
}

function guildMigrate(){
	fresh.forEach(function(guild, idx){ //iterate self
		for (let i = 0; i < fresh.length; i++){
			if (i !== idx){ //ignore self
				if (guild.guildName === fresh[i].guildName && guild.guildRealm !== fresh[i].guildRealm){
					if (fresh[i].guildData.completedArray.length > guild.guildData.completedArray.length){
						guildRequestList.forEach(function(replace){
							if (replace.guildName === fresh[i].guildName && replace.guildRealm === guild.guildRealm){
								replace.oldRealm = replace.guildRealm;
								replace.guildName = fresh[i].guildName;
								replace.guildRealm = fresh[i].guildRealm;
							}			
						});
					}
					else{
						guildRequestList.forEach(function(replace){
							if (replace.guildName === guild.guildName && replace.guildRealm === fresh[i].guildRealm){
								replace.oldRealm = replace.guildRealm;
								replace.guildName = guild.guildName;
								replace.guildRealm = guild.guildRealm;
							}
						});
					}	
				}
			}
		}
	});
}

function loopThrough(){
	guildMigrate();
	let list = [1,2,3,4,5,6,7,8,9,10,11,12,13]; //prevent overlapping on the same boss
	guildRequestList.forEach(function(guild){
		let check = guild.boss;
		if (list.includes(check)){
			fresh.forEach(function(grab){
				if (list.includes(check)){
					if(guildEquals(guild, grab)){
						let boss = getBossName(guild.boss)
						let guildAch = eval(boss+'Guild'); //patchwerk
						let guildStamp = getStamp(guildAch, grab.guildData) // if -1

						let stamp = eval('stamps.'+boss+'Stamp')
						if (Math.abs(stamp - guildStamp) <= 150000){ // my first Kill is within 5 minutes of guilds kill 
							let deleteItem = list.indexOf(guild.boss) //patchwerk
							delete list[deleteItem]
							$.ajax({
								async: true,
								type: 'GET',
								guild : guild,
								url: "rankings/" + boss + ".txt",
								success: function(sData){
									let div = document.createElement("div");
									let img = document.createElement("img");	
									let text = document.createElement('td1');
									let lines = sData.split("\n");
									lineCount = lines.length;
									let rank;
									let guildMigrateBlocker = guild.guildRealm;

									if (guild.oldRealm !== undefined)
										guildMigrateBlocker = guild.oldRealm;

									for (i=0 ; i < lineCount ; i++){
										if (lines[i].trim() === guild.guildLocale + guildMigrateBlocker + guild.guildName){ //temp fix??
											rank = i + 1
											img.src = "images/" + boss + ".jpg";
											img.alt = boss
											div.appendChild(img) //   
											text.innerHTML = getBossText(boss) + rank + " in guild " + blizzspaceToSpace(guild.guildName) + "-" + blizzspaceToSpace(guildMigrateBlocker);
											div.appendChild(text)
											let kills = document.getElementById("kills");	
											kills.appendChild(div)

										}
									}
								},
								error: function(){ 
									console.log("ff")
								} 
							});	
						}	
						else return;				
					} // Hellfire		
				}
			});
		}
		else return;
	});
	if (lost){ //unreachable
		alert('Data might be lost due to disbanded guild.')
		lost = false;
	}
}

	// Check if the player killed the given world of warcraft boss by blizz achievement api
	// If no return else get killtimestamp
	// search playerGuilds array and find which guild the player was in when he acquired the kill achievement (compare GuildJoin/Leave with killstamp)
	// if the player was in a guild on when he acquired the achievement request that guild's achievement list and get boss kill timestamp
	// compare player killstamp with guild's to see if player actually got the achievement within that guild (150k flex approx to 5 mins due to minimal delays on  possible playerstamps)
	// get the guilds ranking from the relevant boss.txt
					
	// 10.14.2017 usin async data load then loop from now on to do less requests overall

function guildRank(fdata, boss, personalAchiev){
	let index = fdata.achievements.achievementsCompleted.indexOf(personalAchiev);
	if (index != -1){   // make this a function to avoid bracket hell or use if == -1 return else do ur stuff (which could look way more elegant)
		let stamp = fdata.achievements.achievementsCompletedTimestamp[index]; //hoist the colors
		playerGuilds.forEach(function (guildIter, i){
			if (stamp < guildIter.dateLeave && stamp > guildIter.dateJoin){
				guildIter.boss = getBossOrder(boss);
				guildRequestList.push(JSON.parse(JSON.stringify(guildIter)))
				let temp = guildIter.dateJoin
				let temp2 = guildIter.dateLeave
				delete guildIter.dateJoin //patchwerk
				delete guildIter.dateLeave
				delete guildIter.boss
				uniqueRequest.push(JSON.parse(JSON.stringify(guildIter)))
				guildIter.dateJoin = temp
				guildIter.dateLeave = temp2
				
			}
		});

		fresh = uniqueRequest.map(function(e, index){
			let count = -1;
			uniqueRequest.forEach(function(ele, idx){
				if (JSON.stringify(ele) === JSON.stringify(e))
					count ++	
			});
			if (count == 0)
				return e;
			else
				uniqueRequest[index] = undefined		
		});

		fresh = fresh.filter(function( element ) { //shrink
		   return element !== undefined;
		});

	}
}

function mainPane(){

// [[[[--------------------------------Reset--Variables------------------------------------------]]]]
	lost = true;
	fresh = []
	playerGuilds = [];
	altsArray = [];
	guildRequestList = [];
	uniqueItems = [];
	uniqueRequest = [];
	stamps = [];
	callCount = 0;
	callbackCount = 0;

// // [[[[--------------------------------Html-Grab-----------------------------------------------]]]]

	let kills = document.getElementById("kills").innerHTML = "First Kill Rankings\n"
	charName = fixName(document.getElementById('char').value);
	realm = toTitleCase(document.getElementById('realm').value).trim();
	locale = document.getElementById('locale').value;
	let metric = document.getElementById('metric').value;
	let img = document.createElement("img");
	let url = proxy + buildTrackUrl(locale, toTitleCase(realm.replace("-", "%20")), charName);

// // [[[[--------------------------------Scraping-----------------------------------------------]]]]
	$.ajax({
	  url: url,
	  async: true,
	  success: function(data){

	  	clicked = true;
	  	let loc;
		let name;
		let grabRealm;
		let wClass;
		let grab;
		let ilvl;
		let lines = data.split("\n");
		let lineLength = lines.length;
		let merge = 0; // dont really use this anymore but could be needed when figuring out how to excludr merged character url request on alt character guild pushes
		let k = 0;
		document.getElementById("alts").innerHTML = "ALTS"; //Refresh on new submit
		
		for (i = 0; i < lineLength; i++){
			if (lines[i].indexOf("<a href=\"/characters") != -1 ) { // ALTS
				merge ++; 
				let grab = lines[i].split("/");

				ilvl=lines[i+1].substring(lines[i+1].lastIndexOf("<td>") + 4,lines[i+1].lastIndexOf("</td>"));

				let grabLength = grab.length;

				for (j = 0; j < grabLength; j++){

					if (j == 2) //Grab Locale
				 		loc = grab[j];

				 	else if (j == 3) //Grab Realm

				 		grabRealm = grab[j].replace(/%20/g, "-");

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
				 		getItemLevel(locale, grabRealm, name, addAltx);

				 		altObj = { 
							name: name,
							locale: locale,
							realm: grabRealm
						}
						altsArray.push(altObj);
				 	} 	
				}
			}
			else if (lines[i].indexOf("guilds") != -1 ){ //guilds
				k++;
				let d = new Date();
				let n = d.getTime();
				let guildGrab = lines[i].substring(lines[i].lastIndexOf("guilds")+7, lines[i].lastIndexOf('" '));
				guildGrab = guildGrab.split("/");
				let dateLeave = formatDate(lines[i+3]); //convert to stamp
				if (isNaN(dateLeave)){
					dateLeave = n
					}
				
				let tempGrab = guildGrab[2].split("%20");
				let tempSize = tempGrab.length;
				let gName = ""

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
					dateJoin : formatDate(lines[i+2]), //converted to timestamps so it's easier to compare with blizz killstamps
					dateLeave : dateLeave
				}

				if (k != 1) //missread on first catch
					playerGuilds.push(guild); 
			}
			else{}//cnd
		}

		let altLength = altsArray.length;

		altsArray.forEach(function(alt){
			let url = proxy + buildTrackUrl(alt.locale, alt.realm, alt.name);
			readToon(url, function(){
				callCount ++;
				if (callCount === altLength){
					rankings()
					return
				}
			})
		});

	  },
	  error: function (){ // Reset on fail // Proxy fallback 	
  		clicked = false;
	  	$("#divid1").html(divClone); 
	  	alert("Invalid Character");// if (fail == 0){
	  	// 	proxy = 'https://crossorigin.me/'
	  	// 	fail = fail + 1;
	  	// 	mainPane();
	  }
	});
	// [[[[--------------------------------ARTIFACT PANE-----------------------------------------------]]]]
	let artifactJSON = "https://raider.io/api/v1/characters/profile?region=" + locale + "&realm=" + realm + "&name=" + charName + "&fields=gear"; // <3
	let art = document.getElementById("artifact");
	let artifactText;
	
	$.ajax({
		async: true,
		type: 'GET',
		url: artifactJSON,
		success: function(data) {
			let artifactTraits = data.gear.artifact_traits;
			artifactText = "Currently " + artifactTraits + " artifact points are allocated.";
			document.getElementById("artifact").innerHTML = "";
			art.innerHTML = art.innerHTML + "\n" + artifactText;
		},
		error: function(){
			artifactText = "No Artifact on this toon";
			document.getElementById("artifact").innerHTML = "";
			art.innerHTML = art.innerHTML + "\n" + artifactText;
		}
	});
	// [[[[--------------------------------Hyperlinks-----------------------------------------------]]]]

	let wlogsBody = "https://www.warcraftlogs.com/character/" + locale + "/" + realm.replace(/\s+/g, '-') + "/" + charName 
	document.getElementById("wlogs").href = wlogsBody;

	let wowProgressText = "https://www.wowprogress.com/character/" + locale + "/" + realm.replace(/\s+/g, '-') + "/" + charName;

	let armoryText = buildArmoryLink(locale, realm, charName); 
	
	document.getElementById("blizz").href = armoryText;
	document.getElementById("progress").href = wowProgressText;
	let blizzString = document.getElementById("blizz").children[0].text;
	JFCustomWidget.subscribe("submit", function(){

		document.body.style.backgroundColor = "black";
		let blizzString = document.getElementById("blizz").outerHTML;		
		let progressString = document.getElementById("progress").outerHTML;
		let wlogsString = document.getElementById("wlogs").outerHTML;
		let killsString = document.getElementById("kills").outerHTML;
			
		let result = {}
		result.valid = false;
		 
		if(clicked) /// this?  charName != "" && realm != "" && 
			result.valid = true;

		result.value = blizzString + progressString + wlogsString + killsString + altsHtml ;
		JFCustomWidget.sendSubmit(result);

	});
	

}
	
