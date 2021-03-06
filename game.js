var rock_impact;

var particles = [];

var grid;

var p_count = 0;

var rock_health = 3;

var mine_multiplier = 1;
var upgrade_bell;

var money;
var money_buffer;
var money_bell;

function Cell()
{
	if (Math.random() < 0.01) {
		this.res = "ruby";
		this.qty = 1;
	} else if (Math.random() < .05) {
		this.res = "gems";
		this.qty = 1;
	} else if (Math.random() < .1) {
		this.res = "gold";
		this.qty = 2 + Math.ceil(Math.random() * 4);
	} else {
		this.res = "silver";
		this.qty = 5 + Math.ceil(Math.random() * 8);
	}
	this.max_health = Math.ceil(Math.random() * 5);
	this.health = this.max_health;
}

/* closure stuff */
function makeOnClick(i, j)
{
	return function() {
		mine(i, j);
	}
}

function makeSell(res, val)
{
	return function() {
		sell(res, val);
	}
}

function makeSellAll(res)
{
	return function() {
		sell(res, resources[res].qty);
	}
}

function createGrid()
{
	
	grid = Array.from(Array(3), () => new Array(3));
	var grid_elm = document.getElementById("grid");
	for (var i = 0; i < 3; ++i) {
		for (var j = 0; j < 3; ++j) {
			grid[i][j] = new Cell();

			var cell_div = document.createElement("div");
			var cell_img = document.createElement("img");
			var cell_bar = document.createElement("progress");

			cell_div.classList.add("mine-cell");

			cell_img.src = resources[grid[i][j].res].ore;
			cell_img.id = "cellimg-"+i+"-"+j;
			cell_img.classList.add("contained-icon");

			cell_bar.max = grid[i][j].max_health;
			cell_bar.id = "progress-"+i+"-"+j;
			cell_bar.classList.add("cell-progress");

			cell_div.onclick = makeOnClick(i, j);
			cell_div.ontouchstart = makeOnClick(i, j);

			cell_div.appendChild(cell_img);
			cell_div.appendChild(document.createElement("br"));
			cell_div.appendChild(cell_bar);
			grid_elm.appendChild(cell_div);
		}
		grid_elm.appendChild(document.createElement("br"));
	}
}

function updateGrid()
{
	for (var i = 0; i < 3; ++i) {
		for (var j = 0; j < 3; ++j) {
			var cell = grid[i][j];
			var bar = document.getElementById("progress-"+i+"-"+j);
			bar.value = cell.health;
		}
	}
}

function Resource(name, value)
{
	this.qty = 0;
	this.buffer = 0;
	this.name = name;
	this.mine_particle = "res/" + this.name + "_particle.png";
	this.bell = new Audio("res/" + this.name + "_bell.ogg");
	this.ore = "res/"+this.name+"_ore.png";
	this.value = value;
	
	var elm = document.createElement("div");
	elm.classList.add("resource-container");
	var img = document.createElement("img");
	img.src = "res/"+name+".png";
	img.classList.add("contained-icon");

	var div = document.createElement("div");
	div.id = name+"-label";
	div.classList.add("resource");

	var p_area = document.createElement("div");
	p_area.id = name+"-label-particles";
	elm.appendChild(p_area);

	var sell_button = document.createElement("button");
	sell_button.onclick = makeSell(this.name, 1);
	sell_button.ontouchstart = makeSell(this.name, 1);
	sell_button.classList.add("sell-button");
	sell_button.innerHTML = "sell";

	var sellall_button = document.createElement("button");
	sellall_button.onclick = makeSellAll(this.name);
	sellall_button.ontouchstart = makeSellAll(this.name);
	sellall_button.classList.add("sell-button");
	sellall_button.innerHTML = "sell all";

	elm.classList.add("resource-label");
	
	elm.appendChild(img);
	elm.appendChild(div);
	elm.appendChild(sell_button);
	elm.appendChild(document.createElement("br"));
	elm.appendChild(sellall_button);
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
		this.velocity = {x : 0, y : 5};
	} else if (physics_type == "falling") {
		var angle = Math.random() * Math.PI - (Math.PI / 2);
		this.velocity = {
			x : Math.sin(angle) * 10,
			y : Math.cos(angle) * 4
		}
	}

	if (display_type == "image") {
		this.dom_elm = document.createElement("img");
		this.dom_elm.classList.add("upscaled");
		this.dom_elm.src = v;
	} else if (display_type == "text") {
		this.dom_elm = document.createElement("div");
		this.dom_elm.classList.add("resource");
		this.dom_elm.innerHTML = v;
	}
	this.dom_elm.id = this.name;
	this.dom_elm.classList.add("particle");


}

function createBubblingParticle(text, elm)
{
	var particle = new Particle(text, "bubbling", "text");
	var areaBox = elm.getBoundingClientRect();
	particle.dom_elm.style.left = areaBox.x + Math.floor(Math.random() * areaBox.width) + "px";
	particle.dom_elm.style.top = areaBox.y - particle.dom_elm.getBoundingClientRect().height;

	elm.appendChild(particle.dom_elm);
	particles.push(particle);
}

function createExplosionParticle(image, elm)
{
	var particle = new Particle(image, "falling", "image");
	var areaBox = elm.getBoundingClientRect();
	particle.dom_elm.style.left = areaBox.x + Math.floor(Math.random() * areaBox.width) + "px";
	particle.dom_elm.style.top = areaBox.y + areaBox.height / 2 + "px";

	elm.appendChild(particle.dom_elm);
	particles.push(particle);
}

function startup()
{
	resources =
	{
		silver : new Resource("silver", 10),
		gold : new Resource("gold", 50),
		gems : new Resource("gems", 200),
		ruby : new Resource("ruby", 500)
	};

	money = 0;
	money_buffer = 0;

	rock_impact = new Audio("res/rock_impact.ogg");
	upgrade_bell = new Audio("res/upgrade_bell.ogg");
	money_bell = new Audio("res/money_bell.ogg");

	createGrid();

	setInterval(update_stats, 25);
}

function update_buffer(res)
{
	var transfer
	transfer =res.buffer < 0 ? Math.floor(res.buffer/10) : Math.ceil(res.buffer / 10);
	if (transfer == 0) {
		document.getElementById(res.name+"-label").classList.remove("resource-highlight");
		document.getElementById(res.name+"-label").classList.remove("resource-highlight-loss");
	}
	res.qty += transfer;
	res.buffer -= transfer;
}

function update_particles()
{
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

}

function update_resources()
{

	for (var res in resources) {
		update_buffer(resources[res]);
	}

	for (var i in resources) {
		var r = resources[i];
		var label = document.getElementById(r.name+"-label");
		label.innerHTML = r.qty;
	}
}

function update_money()
{
	var transfer;
	transfer = Math.ceil(money_buffer / 10);
	if (transfer == 0) {
		document.getElementById("money-label").classList.remove("resource-highlight");
	}
	money += transfer;
	money_buffer -= transfer;

	document.getElementById("money-label").innerHTML = money;

}

function update_stats()
{
	updateGrid();
	update_particles();
	update_resources();
	update_money();
	document.getElementById("multiplier-label").innerHTML = mine_multiplier.toFixed(2);
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

function get_money(val)
{
	money_buffer += val;
	var label = document.getElementById("money-label");
	label.classList.add("resource-highlight");
	createBubblingParticle("+"+val+" coins", document.getElementById("money-label-particles"));
	playRandomPitch(money_bell);
}

function getResource(res, val)
{
	res.buffer += val;
	var label = document.getElementById(res.name+"-label");
	if (val > 0) {
		for (var i = 0; i < Math.max(1, Math.ceil(Math.log(val))); ++i) {
			createExplosionParticle(res.mine_particle, document.getElementById("particles-area"));
		}
		label.classList.add("resource-highlight");
		playRandomPitch(res.bell);
	} else {
		label.classList.add("resource-highlight-loss");
	}
	createBubblingParticle((val < 0 ? "" : "+") +val, document.getElementById(res.name+"-label-particles"));
}

function mine(x, y)
{
	rock_impact.play();
	grid[x][y].health--;
	if (grid[x][y].health <= 0) {
		var cell = grid[x][y];
		getResource(resources[cell.res], Math.floor(cell.qty * mine_multiplier));

		/* Replace with a new cell */
		var progress_elm = document.getElementById("progress-"+x+"-"+y);
		grid[x][y] = new Cell();
		progress_elm.max = grid[x][y].max_health;
		progress_elm.value = grid[x][y].health;

		var img_elm = document.getElementById("cellimg-"+x+"-"+y);
		img_elm.src = resources[grid[x][y].res].ore;
	}
}

function sell(res, val)
{
	if (resources[res].qty + resources[res].buffer > 0) {
		get_money(val * resources[res].value);
		getResource(resources[res], -1*val);
	}
}

function upgrade_multiplier()
{
	mine_multiplier *= 1.1;
	upgrade_bell.play();
}

function switch_tab(tab_name)
{
	var tab_contents = document.getElementsByClassName("tab-content");
	Array.from(tab_contents).forEach( (tab) => {
		if (tab.id == tab_name) {
			tab.classList.add("enabled");
			tab.classList.remove("disabled");
		} else {
			tab.classList.remove("enabled");
			tab.classList.add("disabled");
		}
	});

	var tabs = document.getElementsByClassName("tab");
	Array.from(tabs).forEach( (tab) => {
		if (tab.id == tab_name + "-tab") {
			tab.classList.add("enabled");
			tab.classList.remove("disabled");
		} else {
			tab.classList.remove("enabled");
			tab.classList.add("disabled");
		}
	});
}

