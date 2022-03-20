// For hashing website urls
String.prototype.hashCode = function() {
    var hash = 0;
    if (this.length == 0) {
        return hash;
    }
    for (var i = 0; i < this.length; i++) {
        var char = this.charCodeAt(i);
        hash = ((hash<<5)-hash)+char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return hash;
}
const site = (location.protocol + '//' + location.host + location.pathname).hashCode();

var isDrawing = false;

var uColor = 'rgba(0,0,0,1)';
var weight = 4;

var localLines = new Map();
var lineIndex = BigInt(0);

var density = 100;
var weight = 8;

var isErasing = false;

var peerIndex = 0;

const body = document.body;
const html = document.documentElement;

function setup() {
	document.body.style['userSelect'] = 'none';
	let maxWidth = Math.max(body.scrollWidth, body.offsetWidth, html.clientWidth, html.scrollWidth, html.offsetWidth);
    let maxHeight = Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight);
	let c = createCanvas(maxWidth, maxHeight);
	c.position(0,0);
	
	c.style('pointer-events', 'none');
	c.style('zIndex', '999999999999');
	
	pixelDensity(density/100);
	strokeWeight(weight);
}

function draw() {
	clear();

	textSize(12);
	strokeWeight(.1);
	fill(255, 255, 255, 192);
	rect(8, 8, 200, 60);
	fill(0, 0, 0, 256);
	text("To ensure your experience matches with everyone, please resize your window to 1280x720. It is currently: " + document.documentElement.clientWidth + 'x' + document.documentElement.clientHeight, 10, 10 , 200, 60);

	for(let [key, value] of localLines){
		let L = value;
		stroke(L.C);
  		strokeWeight(L.W);
		line(L.X,L.Y,L.pX,L.pY);
	}
	if(!mouseIsPressed){
		brush = {
		  x:mouseX,
		  y:mouseY
		};		
	}
	if(isErasing){
		ellipse(mouseX,mouseY,50,50);
	}else{
		ellipse(mouseX,mouseY,5,5);
	}

}

var brush = {
	x:0,
	y:0
};
function mouseDragged() {
	if(!isErasing){
		let a = atan2(mouseY - brush.y, mouseX - brush.x);
		if(dist(mouseX,mouseY,brush.x,brush.y)>2){
			var currentX = brush.x;
			var currentY = brush.y;
			brush = {
				x:brush.x + (cos(a) * abs(mouseX-brush.x) * .5),
				y:brush.y + (sin(a) * abs(mouseY-brush.y) * .5)
			}
			let L = {
				C:uColor,
				W:weight,
				X:brush.x,
				Y:brush.y,
				pX:currentX,
				pY:currentY
			}
			localLines.set(lineIndex, L);
			lineIndex++;
		}
	}
	
	else{
		for(let [key, value] of localLines){
			let L = value;
			try{
				var p = {
					x:mouseX,
					y:mouseY
				};
				var start = {
					x:L.X,
					y:L.Y
				};
				var end = {
					x:L.pX,
					y:L.pY
				};
				var distance = distToSegment(p, start, end);
				if(distance < 25){
					localLines.delete(key);
				}
			}catch{
				
			}
		}
	}
}

const peerCanvas = ( sketch ) => { //template for every new user/connection

	var peerLines = new Map();

	const body = document.body;
	const html = document.documentElement;

	sketch.setup = () => {
		document.body.style['userSelect'] = 'none';
		let maxWidth = Math.max(body.scrollWidth, body.offsetWidth, html.clientWidth, html.scrollWidth, html.offsetWidth);
		let maxHeight = Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight);
		let c = sketch.createCanvas(maxWidth, maxHeight);
		c.position(0,0);

		c.style('pointer-events', 'none');
		c.style('zIndex', (999999999999 + peerIndex).toString());
	};

	sketch.draw = () => {
		sketch.clear();

		for(let [key, value] of peerLines){
			let L = value;
			sketch.stroke(L.C);
	  		sketch.strokeWeight(L.W);
			sketch.line(L.X,L.Y,L.pX,L.pY);
		}
	};

	sketch.updateLines = (input) => {
		peerLines = input;
	};

	window.addEventListener('scroll', function(e) {
		let maxWidth = Math.max(body.scrollWidth, body.offsetWidth, html.clientWidth, html.scrollWidth, html.offsetWidth);
		let maxHeight = Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight);
		if(maxWidth > width || maxHeight > height)
			sketch.resizeCanvas(maxWidth, maxHeight);
	}); 
};

window.addEventListener('scroll', function(e) {
	let maxWidth = Math.max(body.scrollWidth, body.offsetWidth, html.clientWidth, html.scrollWidth, html.offsetWidth);
    let maxHeight = Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight);
	if(maxWidth > width || maxHeight > height)
    	resizeCanvas(maxWidth, maxHeight);
}); 

chrome.runtime.onMessage.addListener(Message);
function Message(req, sender, res) {
	if(req.varReq == true){
		res({
			uColor:uColor,
			weight:weight,
			isErasing:isErasing,
			density:density
		});
	}else{
		if(req.uColor != null)
			uColor = req.uColor;
		if(req.weight != null)
			weight = req.weight;
		if(req.isErasing != null)
			isErasing = req.isErasing;
		if(req.density != null){
			density = req.density;
			pixelDensity(density/100);
		}
	}

	//DEBUG
	if(req.peerID != null){
		inputID(req.peerID);
	}
	if(req.getMyID == true){
		res({
			myID:getMyID()
		});
	}
}

// Math related functions
function sqr(x) { return x * x }
function dist2(v, w) { return sqr(v.x - w.x) + sqr(v.y - w.y) }
function distToSegmentSquared(p, v, w) {
  var l2 = dist2(v, w);
  if (l2 == 0) return dist2(p, v);
  var t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
  t = Math.max(0, Math.min(1, t));
  return dist2(p, { x: v.x + t * (w.x - v.x),
                    y: v.y + t * (w.y - v.y) });
}
function distToSegment(p, v, w) { return Math.sqrt(distToSegmentSquared(p, v, w)); }