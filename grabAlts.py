def grab():
	from lxml import html
	import requests
	page = requests.get("https://wowtrack.org/characters/EU/Twisting%20Nether/Inrainbows")
	tree = html.fromstring(page.content)
	char = tree.xpath('//a[contains(@class, "class")]/@href')
	return char
