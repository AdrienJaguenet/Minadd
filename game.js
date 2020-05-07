var gold, gold_buffer;
var gems, gems_buffer;

var gold_bell;
var gems_bell;

function startup()
{
	gold = 0;
	gems = 0;
	gold_buffer = 0;
	gems_buffer = 0;

	gold_bell = new Audio("res/gold_bell.ogg");
	gems_bell = new Audio("res/gems_bell.ogg");

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

function playRandomPitch(audio)
{
	audio.pause();
	audio.currentTime = 0;
	audio.mozPreservesPitch = false;
	/* random note */
	var interval_ratio = 1;
	switch(Math.floor(Math.random() * 4)) {
		case 0:
			interval_ratio = 3/2; // perfect fifth
			break;
		case 1:
			interval_ratio = 4/3; // perfect fourth
			break;
		case 2:
			interval_ratio = 2/3;
			break;
		case 3:
			interval_ratio = 3/2;
			break;
	}
	audio.playbackRate = interval_ratio;
	audio.play();
}

function get()
{
	if (Math.random() < .1) {
		gems_buffer += 1;
	} else {
		gold_buffer += 10;
		playRandomPitch(gold_bell);
	}
}

