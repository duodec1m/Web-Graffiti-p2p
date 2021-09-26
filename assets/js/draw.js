var firebaseConfig = {
apiKey: "AIzaSyCmuxjSJz7WEvoobwmyFn-yyR2oKO41RiA",
authDomain: "web-graffiti-4a615.firebaseapp.com",
databaseURL: "https://web-graffiti-4a615.firebaseio.com",
projectId: "web-graffiti-4a615",
storageBucket: "web-graffiti-4a615.appspot.com",
messagingSenderId: "1024786783703",
appId: "1:1024786783703:web:2b8b3ef011e75ab6877f92"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

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
var submissions = firebase.database().ref('sites/'+site+'/posts');

var isDrawing = false;

var uColor = 'rgba(0,0,0,1)';
var weight = 4;

var localLines = new Map();

var posts = [];

var initDensity;
var scaler = 1;

var isErasing = false;

const body = document.body;
const html = document.documentElement;

function setup() {
	document.body.style['userSelect'] = 'none';
  
	let maxWidth= Math.max(body.scrollWidth, body.offsetWidth, html.clientWidth, html.scrollWidth, html.offsetWidth);
	let maxHeight = Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight);
	let c = createCanvas(maxWidth, maxHeight);
	c.position(0,0);
	
	c.style('pointer-events', 'none');
	c.style('zIndex', '999999999999');
	
	initDensity = pixelDensity();
}

function draw() {
	clear();
	if(isDrawing){
		ellipse(mouseX,mouseY,5,5);
	}
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
	if(isErasing && isDrawing){
		ellipse(mouseX,mouseY,50,50);
	}

}

var brush = {
  x:0,
  y:0
};
function mouseDragged() {
	if(isDrawing && !isErasing){
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
		localLines.set(localLines.size, L);
	  }
	}
}

function keyPressed() {
	if (keyCode === SHIFT) {
		isErasing = true;
	}
	return false; // prevent default
}
function keyReleased() {
	if (keyCode === SHIFT) {
		isErasing = false;
	}
	return false; // prevent any default behavior
}

function mouseMoved() {
	if(isErasing && isDrawing){
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

window.addEventListener('scroll', function(e) {
	let maxWidth= Math.max(body.scrollWidth, body.offsetWidth, html.clientWidth, html.scrollWidth, html.offsetWidth);
    let maxHeight = Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight);
	if(maxWidth > width || maxHeight > height)
    	resizeCanvas(maxWidth, maxHeight);
}); 

submissions.on('child_added', function(data){
	let P = {
		timestamp:data.key,
		uid:data.val().uid,
		upV:data.val().upvotes,
		drawing:[],
		title:data.val().title,
		desc:data.val().desc
	}
	data.child('drawing').forEach(element => {
		P.drawing.push(element.val());
	});
	posts.push(P);
});

submissions.on('child_changed', function(data) {
	for(const post of posts){
		if(data.key === post.timestamp){
			post.upV = data.val().upvotes;
			break;
		}
	}
});

chrome.runtime.onMessage.addListener(Message);

function Message(req, sender, res) {
	if(req.weight != null)
   		weight = req.weight;
	if(req.color != null)
		uColor = req.color;
	if(req.varReq == true){
		res({
			color:uColor,
			weight:weight,
			scaler:scaler,
			isDrawing:isDrawing,
			posts:posts
		});
	}
	if(req.density != null){
		scaler = req.density;
		pixelDensity(initDensity * scaler);
	}
	if(req.click != null){
		isDrawing = !isDrawing;
	}
	if(req.submit != null){
		if(localLines.size > 0)
			submit(req.title,req.desc);
	}
	if(req.displayDrawing != null){
		localLines.clear();
		for(var line of req.displayDrawing){
			localLines.set(localLines.size, line);
		}
	}
	if(req.vote != null){
		chrome.runtime.sendMessage({
			type:'vote',
			child:'sites/'+site+'/posts/'+req.timestamp,
			vote:req.vote
		});
	}
}

function submit(title,desc){
	var tempArray = [];
	for(let [key, value] of localLines){
		tempArray.push(value);
	}
	chrome.runtime.sendMessage({
		type:'post',
		child:'sites/'+site+'/posts',
		L:tempArray,
		title:title,
		desc:desc
	});
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