const colorPicker = document.getElementById("colorPicker");
const Dslider = document.getElementById('density');
const Wslider = document.getElementById('weight');
const eraseButton = document.getElementById('eraseButton');
colorPicker.addEventListener("input", function(){sendMessage()});
Dslider.addEventListener("input", function(){sendMessage()});
Wslider.addEventListener("input", function(){sendMessage()});
eraseButton.addEventListener("click", function(){toggleErase()});

var isErasing = false;
function toggleErase() {
    isErasing = !isErasing;
    if(isErasing)
    	eraseButton.innerHTML = 'Draw';
    else
    	eraseButton.innerHTML = 'Erase';
	sendMessage()
}

chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
	chrome.tabs.sendMessage(tabs[0].id, {varReq: true}, function(response) {
		colorPicker.value = response.uColor;
		colorPicker.jscolor.fromString(response.uColor);
		Wslider.value = response.weight;
		Dslider.value = response.density;
		isErasing = response.isErasing;
		if(isErasing)
			eraseButton.innerHTML = 'Draw';
		else
			eraseButton.innerHTML = 'Erase';
		
	});
});

function sendMessage(){
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
		chrome.tabs.sendMessage(tabs[0].id, {
			uColor:colorPicker.value,
			density:Dslider.value,
			weight:Wslider.value,
			isErasing:isErasing
		});
	});
}

//DEBUG
const submitPeerID = document.getElementById("submitPeerID");
submitPeerID.addEventListener("click", function(){
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
		chrome.tabs.sendMessage(tabs[0].id, {
			peerID:document.getElementById("peerID").value
		});
	});
});