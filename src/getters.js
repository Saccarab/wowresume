

// [[[[--------------------------------Switch-Case-Getters--------------------------]]]]

function getClassColor(spec){
	switch(spec){
		case "priest":
			return "#D3D3D3";
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

function getBossName(boss){
	let bossName;

	switch(boss){
		case 14:
			bossName = "kiljaeden"
			break
		case 13:
			bossName = "ragnaros"
			break;
		case 12:
			bossName = "deathwing"
			break;
		case 11:
			bossName = "emperor"
			break;
		case 10:
			bossName = "shekzeer"
			break;
		case 9:
			bossName = "shaoffear"
			break;
		case 8:
			bossName = "raden"
			break;
		case 7:
			bossName = "garrosh"
			break;
		case 6:
			bossName = "guldan"
			break;
		case 5:
			bossName = "helya"
			break;
		case 4:
			bossName = "xavius"
			break;
		case 3:
			bossName = "archimonde"
			break;	
		case 2:
			bossName = "blackhand"
			break;
		case 1:
			bossName = "imperator"
			break;
		default :
			console.log("unknown boss name?");
	}
	return bossName;
}

function getBossOrder(boss){
	let bossNo;

	switch(boss){
		case "kiljaeden":
			bossNo = 14
			break;
		case "ragnaros":
			bossNo = 13
			break;
		case "deathwing":
			bossNo = 12
			break;
		case "emperor":
			bossNo = 11
			break;
		case "shekzeer":
			bossNo = 10
			break;
		case "shaoffear":
			bossNo = 9
			break;
		case "raden":
			bossNo = 8
			break;
		case "garrosh":
			bossNo = 7
			break;
		case "guldan":
			bossNo = 6
			break;
		case "helya":
			bossNo = 5
			break;
		case "xavius":
			bossNo = 4
			break;
		case "archimonde":
			bossNo = 3
			break;	
		case "blackhand":
			bossNo = 2
			break;
		case "imperator":
			bossNo = 1
			break;
		default :
			console.log("unknown boss stamp?");
	}
	return bossNo;
}

function guildCode(boss){
	let code;

	switch(boss){
		case 14:
			code = kiljaedenGuild
			break;
		case 13:
			code = ragnarosGuild
			break;
		case 12:
			code = deathwingGuild
			break;
		case 11:
			code = emperorGuild
			break;
		case 10:
			code = shekzeerGuild
			break;
		case 9:
			code = shaoffearGuild
			break;	
		case 8:
			code = radenGuild
			break;
		case 7:
			code = garroshGuild;
			break;
		case 6:
			code = guldanGuild
			break;
		case 5:
			code = helyaGuild
			break;
		case 4:
			code = xaviusGuild
			break;
		case 3:
			code = archimondeGuild
			break;	
		case 2:
			code = blackhandGuild
			break;
		case 1:
			code = imperatorGuild;
			break;
		default :
			console.log("unknown boss stamp?");
	}
	return code;
}

function getBossText(boss) {
	let bossText;
	//scrapped out
	switch(boss){
		case "kiljaeden":
			bossText = " Rank "
			break;
		case "ragnaros":
			bossText = " Rank "
			break;
		case "deathwing":
			bossText = " Rank "
			break;
		case "emperor":
			bossText = " Rank "
			break;
		case "shekzeer":
			bossText = " Rank "
			break;
		case "shaoffear":
			bossText = " Rank "
			break;
		case "raden":
			bossText = " Rank "
			break;
		case "garrosh":
			bossText = " Rank "
			break;
		case "guldan": 
			bossText =  " Rank "
			break;
		case "helya":
			bossText = " Rank "
			break;
		case "xavius":
			bossText =  " Rank ";
			break;
		case "archimonde":
			bossText = " Rank ";
			break;	
		case "blackhand":
			bossText = " Rank ";
			break;
		case "imperator":
			bossText = " Rank ";
			break;
		default :
			console.log("unknown boss text?");
	}

	return bossText;
}
function getStamp(achievCode, obj){
	let stamp = -1
	let index;

	if (obj !== undefined){
		index = obj.completedArray.indexOf(achievCode);

		if (index !== -1)
			stamp = obj.timestamps[index];
	}
	else
		lost = true

	return stamp // -1 if not found??
}	