// ------------- to do
// index html user input order in locale-realm-charname so user can press use key enter instead button push
// extendability on bosses??
// get rid of globals
// dont send the character achievement request data billion times for every single boss lookup!
// implement kr cn ru ?
// decode/encode guildnames before pushing to lists
// async.await ??
// remove submitHtml-JF submit // structure
// break into smaller modules
// catch server error on 503 Service unavailable
// special character encode route will cause broken charactername
// fix all the patchwerk/bandaid solutions
// --------------issues
// !!alts div didnt reset
// fix Mal'Ganis -- broken links on single quoted realms
// Aggra Portuguese needs further url customization for every different API encoding
// cnazjolnerubKismet cn hyphen realm format? manualed to cnazjol-nerubKismet
// character data is mostly non existant prior to july 2012/2011
// some of the ios devices wont register onClick or onSubmit events
// ------------- First kill rankings algorithm
// Check if the player killed the given world of warcraft boss by blizz achievement api
// If no return else get killtimestamp
// search playerGuilds array and find which guild the player was in when he acquired the kill achievement (compare GuildJoin/Leave with killstamp)
// if the player was in a guild on when he acquired the achievement request that guild's achievement list and get boss kill timestamp
// compare player killstamp with guild's to see if player actually got the achievement within that guild (150k flex approx to 5 mins due to minimal delays on  possible playerstamps)
// get the guilds ranking from the relevant boss.txt
// 10.14.2017 usin async data load then loop through loaded data from now on to do less requests overall
// non-tested
// decoded character name forwarding
route.start(true);

let charName;
let realm;
let locale;
let clicked = false

route(function(locale, realm, character) {
	if (character) document.getElementById('char').value = character
	if (locale) document.getElementById('locale').value = locale
	if (realm) document.getElementById(locale).value = blizzspaceToSpace(realm)
	if (locale && realm && character && !clicked)
		mainPane()
})
	
// [[[[--------------------------------Constants--------------------------------------------------------]]]]
const battleNetApiKey = "b7pycu6727tfgrnzawp6sn5bxeerh92z"; // Battle Net Api Key
const warcraftLogsApiKey = "bff965ef8c377f175a671dacdbdbc822"; // Warcraftlogs Api Key
const proxy = "https://cors-anywhere.herokuapp.com/"; // proxy alternates ??

// [[[[--------------------------------Initialize-------------------------------------------------------]]]]
let divClone; //html reset resetter
let tooltipClone; //wowhead tooltips block resetter
let firstClick = true; // ??
let single = false
//global loads -- global namespace these at some point

let playerGuilds = []; //whole list including every single guild player was in with join and leave timestamps
let guildRequestList = []; //playerguilds branched depending if given boss's stamp fall between that guild's leave and join
let altsArray = [] //alt toons
let fresh = []; //unique guild request data to avoid requesting same calls over and over

let altsHtml
let submitHtml = document.createElement('div')
let callbackCount = 0 //total call back count needed
let callCount = 0 //current call back count
let uniqueRequest; //filters playerGuilds on it's way to array 'fresh'

let stamps; //array including player kill stamps for every boss -1 if havent killed that boss
let tooltip = false;
let lost = false // player has a disbanded guild 
let process = false; // currently fetching data

$(document).ready(function(){
	//Pick the realm list depending on Locale choice
	$('#locale').bind('change', function () {
		var value = $(this).val();
		$('.realm-js').not('#' + value).hide();
		$('#' + value).show()
	}).trigger('change');
});

$(window).on("load", function(){
	divClone = $(".wrapper-js").html();
	if (process)
		loading()
	//Clone to reset page later on
});


function mainPane(){
	if (process){
		console.log('no spamerino plx');
		return;
	}

// [[[[--------------------------------Reset--Variables------------------------------------------]]]]
	openers()

// // [[[[--------------------------------Html-Grab-----------------------------------------------]]]]
	charName = fixName(document.getElementById('char').value.decodeURI();
	locale = document.getElementById('locale').value;
	realm = document.getElementById(locale).value.trim();
	route([locale, spaceToBlizzspace(realm), charName].join('/'));
	let url = proxy + buildTrackUrl(locale, realm.replace("-", "%20"), charName);
	// realm = removeParanthesis(realm) //thank aggra (portuguese)  =)

	// ?? unsure why implemented this probably due to late rendering on wowhead tooltips
	//    or main div disappearin
	if (!firstClick){ 
		//wowhead tooltips are built into html by default because they just dont make calls after initial render for some reason
		//so just keep them in a hidden block within index.html and clone for later use
		$("#tooltip_block").html(tooltipClone);
		$(".wrapper-js").html(divClone);
		loading()
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
		let merge = 0; // dont really use this anymore but could be needed when figuring out how to exclude merged character url request on alt character guild pushes
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
	  	$("#wrapper-js").html(divClone); 
	  	process = false;
	  	notLoading()
	  	document.getElementById("invalid").removeAttribute("hidden")
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

	let wlogsBody = buildWlogsLink(locale, realm, charName)
	let wowProgressText = buildProgressLink(locale, realm, charName)
	let armoryText = buildArmoryLink(locale, realm, charName);

	document.getElementById("wlogs").href = wlogsBody;
	document.getElementById("blizz").href = armoryText;
	document.getElementById("progress").href = wowProgressText;
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
		},
		error: function(){ 
			// toon request fail
			console.log("Toon Request fail for " + request)
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
	text.innerHTML = " " + obj.characterilvl + " item level                               	"; //ilvl api

	link.setAttribute('target', '_blank');
	link.href = buildArmoryLink(locale, realm, name);
	link.innerHTML = name
	link.style.color = getClassColor(obj.characterClass);
	div.appendChild(link);
	div.appendChild(text);
	altsHtml = altsHtml + div.outerHTML + "\n";
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
					if (!(mergeName === charName && mergeLocale === locale && mergeRealm === blizzspaceToSpace(realm)))
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

			//most pointless modularity attempt ever
			guildRank(data, "ragnaros", ragnarosPersonal)
			guildRank(data, "deathwing", deathwingPersonal)
			guildRank(data, "emperor", emperorPersonal)
			guildRank(data, "shekzeer", shekzeerPersonal)
			guildRank(data, "shaoffear", shaoffearPersonal)
			guildRank(data, "raden", radenPersonal)
			guildRank(data, "garrosh", garroshPersonal)
			guildRank(data, "kiljaeden", kiljaedenPersonal)
			guildRank(data, "guldan", guldanPersonal)
			guildRank(data, "helya", helyaPersonal)
			guildRank(data, "xavius", xaviusPersonal)
			guildRank(data, "archimonde", archimondePersonal)
			guildRank(data, "blackhand", blackhandPersonal)
			guildRank(data, "imperator", imperatorPersonal)

			guildRequestList.sort(function(a, b){ //sort guildRequestList date join to prevent old guild collision
				return b.dateJoin - a.dateJoin
			});

			confirmMigrate()

			if (guildRequestList.length !== 0)
				fill();
			else{
				notLoading()
				process = false; //end process
			}

		},
		error: function(){
			clicked = false;	  		
		  	process = false;
		  	notLoading()
		  	document.getElementById("invalid").removeAttribute("hidden")
		}
	});
}

function guildRank(fdata, boss, personalAchiev){
	//builds guildRequestList using playerGuilds and join&leave stamps within those guilds
	//compare stamps with player kill stamp push to playerGuilds with bossCode if is in range
	let index = fdata.achievements.achievementsCompleted.indexOf(personalAchiev);
	if (index != -1){  // make this a function to avoid bracket hell or use if == -1 return else do ur stuff (which could look way more elegant)
		let stamp = fdata.achievements.achievementsCompletedTimestamp[index]; //hoist the colors
		//order descending by dateJoin
		playerGuilds.sort(function(a, b){ //?? migrate helper??
			return a.dateJoin - b.dateJoin
		});

		playerGuilds.forEach(function (guildIter, i){
			if (stamp < guildIter.dateLeave && stamp > guildIter.dateJoin){
				guildIter.boss = getBossOrder(boss);
				guildRequestList.push(JSON.parse(JSON.stringify(guildIter)))
				copyObject(guildIter, uniqueRequest)
			}
			//if same guild is in 

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
		kiljaedenStamp : getStamp(kiljaedenPersonal, obj),
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
				
//Loop over the guildrequestList 

function loopThrough(){
	let first = true
	tooltipClone = $("#tooltip_block").html(); //wowhead tooltips clone
	guildMigrate();
	let list = [1,2,3,4,5,6,7,8,9,10,11,12,13,14]; //prevent overlapping on the same boss
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
							if (first){
								first = false
								notLoading()
							}
							$.ajax({
								async: true,
								type: 'GET',
								guild : guild,
								url: "rankings/" + boss + ".txt",
								success: function(sData){

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
									let remQuotes = guild.guildRealm.replace('%27','%20') 
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
											//build images for submission but use tooltips on actual page
											img.src = "https://raw.githubusercontent.com/Saccarab/WoW-Resume/master/images/" + boss + ".jpg";
											img.alt = boss
											bufferDiv.appendChild(img)
											rank = i + 1
											let tooltip = eval('tooltip_' + boss)
											div.appendChild(tooltip)
											tooltip.removeAttribute('hidden')

											let txt = " " + upperCaseFirstL(boss) + getBossText(boss) + rank + " in " + decodeURI(guild.guildName) + " - " + decodeURI(guildMigrateBlocker);
											let txt2 = getBossText(boss) + rank + " in " + decodeURI(guild.guildName) + " - " + decodeURI(guildMigrateBlocker);
											let text =  document.createTextNode(txt)
											let text2 = document.createTextNode(txt2)

											bufferDiv.appendChild(text)
											submitHtml.appendChild(bufferDiv) //div that is gonna be submitted (that has no zamimg wowhead tooltips!)
											div.appendChild(text2) //actual page with zamimg tooltips		
											break;
										}
										if (lines[i].trim() === guild.guildLocale + remQuotes + guild.guildName){ 
										//temp fix?? doublecheck with both gnames wof owprogress realms change for no reason
										//sloppy but w/e
											img.src = "https://raw.githubusercontent.com/Saccarab/WoW-Resume/master/images/" + boss + ".jpg";
											img.alt = boss
											bufferDiv.appendChild(img)
											rank = i + 1
											let tooltip = eval('tooltip_' + boss)
											div.appendChild(tooltip)
											tooltip.removeAttribute('hidden')

											let txt = " " + upperCaseFirstL(boss) + getBossText(boss) + rank + " in " + decodeURI(guild.guildName) + " - " + decodeURI(guild.guildRealm);
											let txt2 = getBossText(boss) + rank + " in " + decodeURI(guild.guildName) + " - " + decodeURI(guild.guildRealm);
											let text =  document.createTextNode(txt)
											let text2 = document.createTextNode(txt2)

											bufferDiv.appendChild(text)
											submitHtml.appendChild(bufferDiv) //div that is gonna be submitted (that has no zamimg wowhead tooltips!)
											div.appendChild(text2) //actual page with zamimg tooltips		
											break;
										}
									}
									if (i == lineCount){
										let tooltipText = boss + " kill exists within guild " + guild.guildName + " - " + guildMigrateBlocker + " first kill wasnt listed in the rankings.txt, you can report it to be added"
										console.log(tooltipText)
										let tooltip = document.getElementById('button_1')
										let prev = document.getElementById('button_1').getAttribute('data-content')
										let insert = prev + "- " + tooltipText + '<br>'
										tooltip.setAttribute('data-content', insert)
									}
								},
								error: function(){ 
									console.log("Guild Request fail for " + guild.guildName + " - " + guild.guildRealm)
									//look for oldrealm
								}
							})
						}	
					} // Hellfire
				}
			});
		}
	});
	if (lost){ //unreachable
		console.log('Data might be lost due to disbanded guild.')
		triggerTooltip("Data might be lost due to disbanded guild")
		tooltip = true
		lost = false
	}
	notLoading()
	process = false; //end process
	clicked = false
	if (tooltip){
		document.getElementById('button_1').style.display = "inline-block";
		$('[data-toggle="popover"]').popover();
	}

}

function confirmMigrate(){
	//guilds with same names but different realms a.k.a. migrate candidates??
	playerGuilds.forEach(function(guild, idx){ //iterate all guilds seek for a guild migrate
		for (let i = 0; i < fresh.length; i++){
			let found = fresh.some(function(elem){
				return elem.guildName === guild.guildName && elem.guildRealm === guild.guildRealm
			});
			if (!found && guild.guildName === fresh[i].guildName && guild.guildRealm !== fresh[i].guildRealm){
				copyObject(guild, fresh)
			}
		}
	});
}

//blizz achievements arent kept on previous realm when a guild migrates to a new realm
//if there are identical local&name guilds within the array fresh
//merge them and add a new property named oldRealm to the new array
//fixed triple merge aswell for guilds that migrated more than once e.g.(method-xavius,twnether,tarrenmill)
function guildMigrate(){
	fresh.forEach(function(guild, idx){ 	//iterate self
		for (let i = 0; i < fresh.length; i++){
			if (i !== idx){ //ignore self
				if (guild.guildName === fresh[i].guildName && guild.guildRealm !== fresh[i].guildRealm){
					if (fresh[i].guildData.completedArray.length > guild.guildData.completedArray.length){
						triggerTooltip(`${guild.guildName} - ${blizzspaceToSpace(guild.guildRealm)} migrated to ${fresh[i].guildName} - ${blizzspaceToSpace(fresh[i].guildRealm)}`)
						tooltip = true;
						guildRequestList.forEach(function(replace){
							if (replace.guildName === fresh[i].guildName && replace.guildRealm === guild.guildRealm){
								replace.oldRealm = replace.guildRealm;
								replace.guildName = fresh[i].guildName; //useless?
								replace.guildRealm = fresh[i].guildRealm;
							}			
						});
					}
				}
			}
		}
	});
}
