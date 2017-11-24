// ------------- to do
// get rid of globals
// dont send the character achievement request data billion times for every single boss lookup!
// implement kr cn ru ?
// async.await ??
// fix all the patchwerk/bandaid solutions
// --------------issues
// Aggra Portuguese needs further url customization for every different API and request
// cnazjolnerubKismet cn hyphen realm format? manualed to cnazjol-nerubKismet
// guild migrate causes multiple bugs
// character data is mostly non existant prior to july 2012 //ragnaros deathwing wont work most of the time
// 
// ------------- First kill rankings algorithm
// Check if the player killed the given world of warcraft boss by blizz achievement api
// If no return else get killtimestamp
// search playerGuilds array and find which guild the player was in when he acquired the kill achievement (compare GuildJoin/Leave with killstamp)
// if the player was in a guild on when he acquired the achievement request that guild's achievement list and get boss kill timestamp
// compare player killstamp with guild's to see if player actually got the achievement within that guild (150k flex approx to 5 mins due to minimal delays on  possible playerstamps)
// get the guilds ranking from the relevant boss.txt
// 10.14.2017 usin async data load then loop through loaded data from now on to do less requests overall

// [[[[--------------------------------Constants--------------------------------------------------------]]]]
const battleNetApiKey = "b7pycu6727tfgrnzawp6sn5bxeerh92z"; // Battle Net Api Key
const warcraftLogsApiKey = "bff965ef8c377f175a671dacdbdbc822"; // Warcraftlogs Api Key
const proxy = "https://cors-anywhere.herokuapp.com/"; // proxy alternates ??

// [[[[--------------------------------Initialize-------------------------------------------------------]]]]
let divClone; //html reset resetter
let tooltipClone; //wowhead tooltips block resetter
let clicked; // Switch button to see if widget currently is ready to submit data to Jotform
let firstClick = true; // ??

//global loads
let charName;
let realm;
let locale;

let sizeObject = { //Jotform structure to request frame size
	height : 0
}

let playerGuilds = []; //whole list including every single guild player was in with join and leave timestamps
let guildRequestList = []; //playerguilds branched depending if given boss's stamp fall between that guild's leave and join
let altsArray = [] //alt toons
let fresh = []; //unique guild request data to avoid requesting same calls over and over

let submitHtml = document.createElement('div')
let callbackCount = 0 //total call back count needed
let callCount = 0 //current call back count
let uniqueRequest; //filters playerGuilds on it's way to array 'fresh'

let stamps; //array including player kill stamps for every boss -1 if havent killed that boss
let lost = false // player has a disbanded guild 
let process = false; // currently fetching data

$(document).ready(function(){

	//Pick the realm list depending on Locale choice
	$('#locale').bind('change', function () {
        var value = $(this).val();
         $('.realm-js').not('#' + value).hide();
         $('#' + value).show()

    }).trigger('change'); // Setup the initial states

	JFCustomWidget.subscribe("ready", function(){
		// implement jotform options
		// fontSize = parseInt(JFCustomWidget.getWidgetSetting('fontSize'));
		// fontFamily = JFCustomWidget.getWidgetSetting('fontFamily');
		// fontColor = JFCustomWidget.getWidgetSetting('fontColor');
	});	

	clicked = false;
});

$(window).on("load", function(){
	divClone = $(".wrapper-js").html();
	//Clone to reset page later on
});

function mainPane(){
	if (process){
		alert('no spamerino plx');
		return;
	}

// [[[[--------------------------------Reset--Variables------------------------------------------]]]]
	process = true; 
	fresh = []
	playerGuilds = [];
	altsArray = [];
	guildRequestList = [];
	uniqueRequest = [];
	stamps = [];
	callCount = 0;
	callbackCount = 0;
	sizeObject.height = 549;
	submitHtml.innerHTML = "\n----------------First Kill Rankings----------------\n"
	altsHtml = "\n----------------Alt Characters----------------\n"
	JFCustomWidget.requestFrameResize(sizeObject);


// // [[[[--------------------------------Html-Grab-----------------------------------------------]]]]
	let load = document.createElement("img");
	load.setAttribute("id", "loading");
	load.src = 'https://github.com/Saccarab/WoW-Resume/blob/master/images/Loading.gif?raw=true'
	load.alt = 'Loading'
	let kills = document.getElementById('kills').appendChild(load)
	charName = fixName(document.getElementById('char').value);
	locale = document.getElementById('locale').value;
	realm = document.getElementById(locale).value.trim();
	let img = document.createElement("img");
	let url = proxy + buildTrackUrl(locale, realm.replace("-", "%20"), charName);
	// realm = removeParanthesis(realm) //thank aggra (portuguese)  =)

	// ?? unsure why implemented this probably due to late rendering on wowhead tooltips
	//    or main div disappearin
	if (!firstClick){ 
		//wowhead tooltips are built into html by default because they just dont make calls after initial render for some reason
		//so just keep them in a hidden block within index.html and clone for later use
		$("#tooltip_block").html(tooltipClone);
		$(".wrapper-js").html(divClone);
	}

	if (firstClick)
		firstClick = false;

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
		
		for (i = 0; i < lineLength; i++){
			if (lines[i].indexOf("<a href=\"/characters") != -1 ) { // ALTS
				merge ++;
				let grab = lines[i].split("/");

				ilvl=lines[i+1].substring(lines[i+1].lastIndexOf("<td>") + 4,lines[i+1].lastIndexOf("</td>"));

				let grabLength = grab.length;

				for (j = 0; j < grabLength; j++){

					if (j == 2) //Grab Locale
				 		loc = grab[j];

				 	else if (j == 3)//Grab Realm

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
		if (altLength === 0)
			rankings()
		else{
			// scrap every single alt and their guilds aswell
			// run rankings() when all alt guilds are loaded & grabbed into the playerguilds array
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
		}
	  },
	  error: function (){ // Reset on fail // Proxy fallback 	
  		clicked = false;
  		sizeObject.height = 549;
		JFCustomWidget.requestFrameResize(sizeObject);
	  	$("#wrapper-js").html(divClone); 
	  	process = false;
	  	alert("Invalid Character");// if (fail == 0){
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
	let wowProgressText = "https://www.wowprogress.com/character/" + locale + "/" + realm.replace(/\s+/g, '-') + "/" + charName;
	let armoryText = buildArmoryLink(locale, realm, charName);

	document.getElementById("wlogs").href = wlogsBody;
	document.getElementById("blizz").href = armoryText;
	document.getElementById("progress").href = wowProgressText;

	let blizzString = document.getElementById("blizz").children[0].text;

	//jotform submit event
	JFCustomWidget.subscribe("submit", function(){
	
		//grab current outerhtml
		let blizzString = document.getElementById("blizz").outerHTML;		
		let progressString = document.getElementById("progress").outerHTML;
		let wlogsString = document.getElementById("wlogs").outerHTML;
		let artifactString = document.getElementById("artifact").outerHTML;
			
		let result = {}
		result.valid = false;
		 
		if(clicked) /// successfull request in order to be valid JF data
			result.valid = true;

		result.value = blizzString + progressString + wlogsString + artifactString + submitHtml.outerHTML + altsHtml ;
		JFCustomWidget.sendSubmit(result);
	});
}

function temp(){ //manual add alt helper
	let altDiv = document.getElementById("alts");
	let altName = document.getElementById('altName').value;
	altName = upperCaseFirstL(altName);
	let locale = document.getElementById('locale').value;
	let altRealm = toTitleCase(document.getElementById('altRealm').value);
	getItemLevel( locale, altRealm, altName, addAltx); //(altDiv)
}

function getItemLevel(locale, realm, name ,func){ // getItemLevel(locale, grabRealm, name, addAltx) is sent from the mainPane
	// grab ilvl&class then pass onto addaltx
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
	sizeObject.height = sizeObject.height + 18.5; //request extra jotform frame size for each alt
	JFCustomWidget.requestFrameResize(sizeObject);
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
	div.appendChild(button);  //no button on submission object
	alts.appendChild(div);
}

function readToon(url, callback){
	//scrap character
	$.ajax({
	  url: url,
	  async: true,
	  success: function(data){
	  		let grab
	  		let k = 0
			let lines = data.split("\n")
			let lineLength = lines.length;
			for (i = 0; i < lineLength; i++){
				if (lines[i].indexOf("guilds") != -1 ){ //guilds
					k++;
					let d = new Date()
					let n = d.getTime()
					let guildGrab = lines[i].substring(lines[i].lastIndexOf("guilds")+7, lines[i].lastIndexOf('" '));
					guildGrab = guildGrab.split("/")
					let dateLeave = formatDate(lines[i+3]); //convert to stamp
					if (isNaN(dateLeave)){
						dateLeave = n
					}
					
					let tempGrab = guildGrab[2].split("%20");
					let tempSize = tempGrab.length
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
					//involve merged characters aw
					let merge = lines[i+1].split('/')
					let mergeGrab = merge[4].split(" ")
					let mergeName = mergeGrab[0].slice(0, -1)
					let mergeRealm = merge[3]
					let mergeLocale = merge[2]
					if (!(mergeName === charName && mergeLocale === locale && mergeRealm === realm))
						getItemLevel(mergeLocale, mergeRealm, mergeName, addAltx)
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
	//call everysingle boss with playestamps
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
		success: function(data) { //dont send the data 13 times !! fix me

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

			guildRequestList.sort(function(a, b){ //sort guildRequestList date join to prevent old guild collision
				return b.dateJoin - a.dateJoin
			});

			fill();
		},
		error: function(){
			clicked = false;	  		
		  	process = false;
		}
	});
}

function guildRank(fdata, boss, personalAchiev){
	//builds guildRequestList using playerGuilds and join&leave stamps within those guilds
	//compare stamps with player kill stamp push to playerGuilds with bossCode if is in range
	let index = fdata.achievements.achievementsCompleted.indexOf(personalAchiev);
	if (index != -1){  // make this a function to avoid bracket hell or use if == -1 return else do ur stuff (which could look way more elegant)
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
		// filter uniqueRequest to a new array called fresh
		// only request the unique guilds inside the array fresh later on
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
	//loops through the array fresh 
	//requests the relevant data
	//and pushes requested stamp arrays to every single guild object one by one
	//callback increments callback count 
	//=> can move onto guildrequestlist iteration when callbackCount == callback
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

// Run loopThrough when all request data is loaded into the unique array "fresh" 

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
				
//Loops over the guildrequestList 

function loopThrough(){

	let first = true
	tooltipClone = $("#tooltip_block").html(); //wowhead tooltips clone
	guildMigrate();
	let list = [1,2,3,4,5,6,7,8,9,10,11,12,13]; //prevent overlapping on the same boss
	// remove recurring boss requests when it is found
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
									if (first){
										first = false
										document.getElementById("loading").parentNode.removeChild("loading");
									}
									let div = document.getElementById(boss);
									let bufferDiv = document.createElement("div")
									let rankings = document.getElementById(boss);
									let img = document.createElement("img");
									let lines = sData.split("\n");
									lineCount = lines.length;
									let rank;
									let guildMigrateBlocker = guild.guildRealm;
									//rankings list has issues on matching guildname/realm if we lose the migrated guild value
									//keep the oldrealm as an attribute so if merging is done between migrated guilds we keep track of the actual guild that kills is taken
									if (guild.oldRealm !== undefined)
										guildMigrateBlocker = guild.oldRealm;
									//%27 quote %20 space
									// lightning-s-blade(lightning%20s%20blade) wprogress realm format 
									// bnet lightning's blade (lightning%20s%27blade) wont match the above one
									// so cover up for that one
									let noQuotes = guildMigrateBlocker.replace('%27','%20') 
									for (i=0 ; i < lineCount ; i++){
										//rank check for migrated guild names as well. 
										//can put this out in a cleaner way sometime
										//Fix text so no need to trim
										if (lines[i].trim() === guild.guildLocale + noQuotes + guild.guildName){ //temp fix??
											// -------------------- TO DO ----------------
											// if even though all conditions met but it wont manage to execute this if
											// either wprogress rankings are missing this guild 
											// or guild has the wrong realmName in rankings.txt due to migrate 
											// ask user to report this guild so rankings.txt can be modified appropriately
											sizeObject.height = sizeObject.height + 44.1 //JF frame size request for a wowhead tooltip
											JFCustomWidget.requestFrameResize(sizeObject);
											//build images for submission but use tooltips on actual page
											img.src = "https://raw.githubusercontent.com/Saccarab/WoW-Resume/master/images/" + boss + ".jpg";
											img.alt = boss
											bufferDiv.appendChild(img)
											rank = i + 1
											let tooltip = eval('tooltip_' + boss)
											div.appendChild(tooltip)
											tooltip.removeAttribute('hidden')

											let txt = " " + upperCaseFirstL(boss) + getBossText(boss) + rank + " in " + blizzspaceToSpace(guild.guildName) + " - " + conv(guildMigrateBlocker);
											let txt2 = getBossText(boss) + rank + " in " + blizzspaceToSpace(guild.guildName) + " - " + conv(guildMigrateBlocker);
											let text =  document.createTextNode(txt)
											let text2 = document.createTextNode(txt2)

											bufferDiv.appendChild(text)
											submitHtml.appendChild(bufferDiv) //div that is gonna be submitted (that has no zamimg wowhead tooltips!)
											div.appendChild(text2) //actual page with zamimg tooltips
											
											break;
										}
									}
									if (i == lineCount)
										console.log(boss + " kill exists within guild " + guild.guildName + " - " + guildMigrateBlocker + " so most likely this first kill wasnt listed in the rankings.txt, you can report it to be added" )
								},
								error: function(){ 
									console.log("Guild Request fail for " + guild.guildName + " " + guild.guildRealm);
								}
							})
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

	process = false; //end process
}

//blizz achievements arent kept on previous realm when a guild migrates to a new realm
//if there are identical local&name guilds within the array fresh
//merge them and add a new property named oldRealm to the new array
//fixed triple merge aswell for guilds that migrated more than once e.g.(method-xavius,twnether,tarrenmill)
function guildMigrate(){
	fresh.forEach(function(guild, idx){ //iterate self
		for (let i = 0; i < fresh.length; i++){
			if (i !== idx){ //ignore self
				if (guild.guildName === fresh[i].guildName && guild.guildRealm !== fresh[i].guildRealm){
					if (fresh[i].guildData.completedArray.length > guild.guildData.completedArray.length){
						guildRequestList.forEach(function(replace){
							if (replace.guildName === fresh[i].guildName && replace.guildRealm === guild.guildRealm){
								replace.oldRealm = replace.guildRealm;
								replace.guildName = fresh[i].guildName; //useless?
								replace.guildRealm = fresh[i].guildRealm;
							}			
						});
					}
					else{
						guildRequestList.forEach(function(replace){
							if (replace.guildName === guild.guildName && replace.guildRealm === fresh[i].guildRealm){
								replace.oldRealm = replace.guildRealm;
								replace.guildName = guild.guildName; //useless?
								replace.guildRealm = guild.guildRealm;
							}
						});
					}	
				}
			}
		}
	});
}
