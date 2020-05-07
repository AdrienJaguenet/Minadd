var gold_bell;
var gems_bell;

var particles = [];

var p_count = 0;

function Resource(name)
{
	this.qty = 0;
	this.buffer = 0;
	this.name = name;
	
	var elm = document.createElement("p");
	var img = document.createElement("img");
	img.src = "res/"+name+".png";
	img.classList.add("upscaled");

	var span = document.createElement("span");
	span.id = name+"-label";
	span.classList.add("resource");
	
	
	elm.appendChild(img);
	elm.appendChild(span);
	document.getElementById("resources-area").appendChild(elm);
}

var resources;

function Particle(v, physics_type, display_type)
{
	p_count ++;

	this.max_lifetime = 1;
	this.lifetime = 1;
	this.name = ""+p_count;
	this.physics_type = physics_type;
	if (physics_type == "bubbling") {
		this.velocity = {x : 0, y : 20};
	} else if (physics_type == "falling") {
		var angle = Math.random() * Math.PI - (Math.PI / 2);
		this.velocity = {
			x : Math.sin(angle) * 10,
			y : Math.cos(angle) * 4
		}
	}

	var dom_elm;
	if (display_type == "image") {
		dom_elm = document.createElement("img");
		dom_elm.classList.add("upscaled");
		dom_elm.src = v;
	} else if (display_type == "text") {
		dom_elm = document.createElement("p");
		dom_elm.classList.add("resource");
		dom_elm.innerHTML = v;
	}
	dom_elm.id = this.name;
	dom_elm.classList.add("particle");

	var areaBox = document.getElementById("particles-area").getBoundingClientRect();
	dom_elm.style.left = areaBox.x + Math.floor(Math.random() * areaBox.width) + "px";
	dom_elm.style.top = areaBox.y + areaBox.height / 2 + "px";


	document.getElementById("particles-area").appendChild(dom_elm);


}

function createBubblingParticle(text)
{
	particles.push(new Particle(text, "bubbling", "text"));
}

function createExplosionParticle(image)
{
	particles.push(new Particle(image, "falling", "image"));
}

function startup()
{
	resources =
	{
		gold : new Resource("gold"),
		gems : new Resource("gems")
	};

	gold_bell = new Audio("res/gold_bell.ogg");
	gems_bell = new Audio("res/gems_bell.ogg");

	setInterval(update_stats, 25);
}

function update_buffer(res)
{
	var transfer
	transfer = Math.ceil(res.buffer / 10);
	res.qty += transfer;
	res.buffer -= transfer;
}

function update_stats()
{
	for (var res in resources) {
		update_buffer(resources[res]);
	}

	var to_remove = [];
	/* Particles */
	for (var i in particles) {
		var particle = particles[i];
		var particle_elm = document.getElementById(particle.name);

		var particle_rect = particle_elm.getBoundingClientRect();
		if (particle.physics_type == "falling") {
			particle.velocity.y -= 1;
		}
		particle_elm.style.left = (particle_rect.x - particle.velocity.x) + "px";
		particle_elm.style.top = (particle_rect.y - particle.velocity.y) + "px";

		particle.lifetime -= 0.025;
		if (particle.lifetime < 0) {
			to_remove.push(i);
			particle_elm.parentNode.removeChild(particle_elm);
		}
	}
	for (var i = to_remove.length - 1; i >= 0; --i) {
		particles.splice(to_remove[i], 1);
	}

	for (var i in resources) {
		var r = resources[i];
		document.getElementById(r.name+"-label").innerHTML = r.qty;
	}
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
		resources.gems.buffer += 1;
		createBubblingParticle("+1");
		createExplosionParticle("res/gem_blue.png");
	} else {
		var harvested_gold = 10 + Math.floor(((Math.random() - .5) * 5));
		resources.gold.buffer += harvested_gold;
		playRandomPitch(gold_bell);
		createBubblingParticle("+"+harvested_gold);
		for (var i = 0; i < Math.ceil(Math.log(harvested_gold)); ++i) {
			createExplosionParticle("res/gold_lump_1.png");
		}
	}
}

