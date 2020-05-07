var gold, gold_buffer;
var gems, gems_buffer;

function startup()
{
	gold = 0;
	gems = 0;
	gold_buffer = 0;
	gems_buffer = 0;

	setInterval(update_stats, 25);
}

function update_stats()
{
	var transfer = Math.ceil(gold_buffer / 10);
	gold += transfer;
	gold_buffer -= transfer;

	transfer = Math.ceil(gems_buffer / 10);
	gems += transfer;
	gems_buffer -= transfer;

	document.getElementById("gold-label").innerHTML = gold;
	document.getElementById("gems-label").innerHTML = gems;
}

function get()
{
	if (Math.random() < .1) {
		gems_buffer += 1;
	} else {
		gold_buffer += 10;
	}
}

