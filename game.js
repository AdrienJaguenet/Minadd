var gold, gold_buffer;
var gems, gems_buffer;

var gold_bell;
var gems_bell;

var particles = [];

function Particle(name, text)
{
	this.max_lifetime = 1;
	this.lifetime = 1;
	this.name = name;
	this.text = text;

	this.dom_elm = document.createElement("div");
	this.dom_elm.classList.add("particle");
	this.dom_elm.innerHTML = text;
	this.dom_elm.id = name;
	document.getElementById("particles-area").appendChild(this.dom_elm);
}

function createFloatingParticle(text)
{
	particles.push(new Particle(""+Math.random(), text));
}

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

	/* Buffers */
	var transfer = Math.ceil(gold_buffer / 10);
	gold += transfer;
	gold_buffer -= transfer;

	transfer = Math.ceil(gems_buffer / 10);
	gems += transfer;
	gems_buffer -= transfer;

	var to_remove = [];
	/* Particles */
	for (var i in particles) {
		var particle_elm = document.getElementById(particles[i].name);
		var particle = particles[i];
		particle.lifetime -= 0.025;

		var particle_rect = particle_elm.getBoundingClientRect();
		particle_elm.style.top = (particle_rect.y - 3) + "px";

		if (particle.lifetime < 0) {
			to_remove.push(i);
			particle_elm.parentNode.removeChild(particle_elm);
		}
	}
	for (var i in to_remove) {
		particles.splice(to_remove[i], 1);
	}

	document.getElementById("gold-label").innerHTML = gold;
	document.getElementById("gems-label").innerHTML = gems;
}

function playRandomPitch(audio)
{
	audio.pause();
	audio.currentTime = 0;
	audio.mozPreservesPitch = false;
	audio.webkitPreservesPitch = false;
	audio.volume = 0.5 + (Math.random() / 8) - 0.125;
	/* random note */
	var interval_ratio = 1;
	switch(Math.floor(Math.random() * 4)) {
		case 0:
			interval_ratio = 9/8;
			break;
		case 1:
			interval_ratio = 3/2;
			break;
		case 2:
			interval_ratio = 4/3;
			break;
		case 3:
			interval_ratio = 16/9;
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
		var harvested_gold = 10 + Math.floor(((Math.random() - .5) * 5));
		gold_buffer += harvested_gold;
		playRandomPitch(gold_bell);
		createFloatingParticle("+"+harvested_gold);
	}
}

