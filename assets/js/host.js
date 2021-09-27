const peer = new Peer();
var clients = [];

peer.on('open', function(id) {
	console.log('My peer ID is: ' + id);
});
peer.on('connection', function(dataConnection) { 
	establishP2P(dataConnection);
});

function establishP2P(dataConnection) {
	console.log('establishing p2p connection');
	clients.push(dataConnection);
	let myp5 = new p5(peerCanvas);
	peerIndex++;
	(function updateClient(){
		dataConnection.send({
			type: 'map',
			data: Object.fromEntries(localLines)
		});
		setTimeout(updateClient, 100);
	})();
	
	dataConnection.on('data', function(data){
		dataReceived(data, myp5);
	});
};

function dataReceived(data, myp5){
	switch(data.type){
		case 'map':
			myp5.updateLines(objectToMap(data.data));
			break;
		case 'msg':
			var li = document.createElement("li");
			li.appendChild(document.createTextNode(new Date().toLocaleString() + ' ' + data.data));
			chatWindow.appendChild(li);
			break;
	}
}


function inputID(id){
	const outgoingPeer = new Peer();
	setTimeout(() => { // creating a new peer takes time so wait 4 seconds before attempting to establish a new connection
		var outgoingConnection = outgoingPeer.connect(id);
		outgoingConnection.on('open', function() {
			console.log('outgoing p2p connection successful');
			establishP2P(outgoingConnection);
		}); 
	}, 4000);
	
}

//Object to Map converter
const objectToMap = obj => {
	const keys = Object.keys(obj);
	const map = new Map();
	for(let i = 0; i < keys.length; i++){
		//inserting new key value pair inside map
		map.set(keys[i], obj[keys[i]]);
		};
	return map;
};
