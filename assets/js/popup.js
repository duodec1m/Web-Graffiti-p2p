var bg = chrome.extension.getBackgroundPage();
if(bg.userEmail != null)
	document.getElementById("email").innerHTML = bg.userEmail;
else
	document.getElementById("email").innerHTML = 'Please sign in';
const sign = document.getElementById("sign");
sign.addEventListener("click", function(){
	bg.sign();
	window.close();
});

let selectedWeight = () => {
    let weight = document.getElementById('weight');
    return weight.value
}

const slider = document.querySelector('#weight');
const weightValue = document.querySelector('#weight-value');
slider.addEventListener("input", function() {
    weightValue.innerHTML = selectedWeight();
	sendMessage({weight: selectedWeight()});
});

const colorPicker = document.getElementById("colorPicker");
colorPicker.addEventListener("input", update);
function update() {
    sendMessage({color:colorPicker.value});
}

const Dslider = document.getElementById('density');
const DweightValue = document.getElementById('density-value');
Dslider.addEventListener("input", function() {
	var density = Dslider.value;
    DweightValue.innerHTML = density*10;
	sendMessage({density: density * 0.1});	
});

var draw = document.getElementById('draw');
draw.addEventListener("click", function() {
	sendMessage({click: true});
	window.close();
});

var submit = document.getElementById('submit');
var title = document.getElementById('postTitle');
var desc = document.getElementById('description');
submit.addEventListener("click", function() {
	if(title.value != "" && desc.value != ""){
		sendMessage({
			submit: true,
			title:title.value,
			desc:desc.value
		});
		document.getElementById('form').reset();
	}
});

chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
  chrome.tabs.sendMessage(tabs[0].id, {varReq: true}, function(response) {
		slider.value = response.weight;
		weightValue.innerHTML = response.weight;
	  
	  	colorPicker.value = response.color;
	  	colorPicker.jscolor.fromString(response.color);
	  
	  	Dslider.value = response.scaler * 10;
	  	DweightValue.innerHTML = response.scaler * 100;
	  
	  	if(response.isDrawing === true)
			draw.innerHTML = 'Stop Drawing';
		else
			draw.innerHTML = 'Start Drawing';
		
		displayPosts(response.posts);
  });
});

var ul = document.getElementById("site-history");
function displayPosts(posts){
	for(const post of posts){
		var li = document.createElement("li");
		var textSection = document.createElement("div");
		textSection.className = 'textSection';
		var voteSection = document.createElement("div");
		voteSection.className = 'voteSection';
		
		var title = document.createElement("span");
		title.innerHTML = post.title;
		title.className = 'title';
		
		var desc = document.createElement("span");
		desc.innerHTML = post.desc;
		desc.className = 'desc';

		var span = document.createElement("span");
		span.innerHTML = post.upV;
		span.className = 'upV';
		
		var upvote = document.createElement("i");
		upvote.className = "fas fa-angle-up";
		upvote.addEventListener("click",function(e) {
			sendMessage({vote:1,timestamp:post.timestamp});
		});
		var downvote = document.createElement("i");
		downvote.className = "fas fa-angle-down";
		downvote.addEventListener("click",function(e) {
			sendMessage({vote:-1,timestamp:post.timestamp});
		});
		
		textSection.appendChild(title);
		textSection.appendChild(desc);
		voteSection.appendChild(upvote);
		voteSection.appendChild(span);
		voteSection.appendChild(downvote);
		
		li.appendChild(textSection);
		li.appendChild(voteSection);
		
		li.addEventListener("click",function(e) {
			sendMessage({displayDrawing:post.drawing});
		});
		
		ul.appendChild(li);
	}
}

function sendMessage(message){
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
		chrome.tabs.sendMessage(tabs[0].id, message);
	});
}