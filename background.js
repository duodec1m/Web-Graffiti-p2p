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

var dbRef = firebase.database();

var userEmail = null;
firebase.auth().onAuthStateChanged(function(user) {
	if (user) {
		userEmail = user.email;
	}else {
		userEmail = null;
	}
});
function sign(){
	if(firebase.auth().currentUser == null){
		var provider = new firebase.auth.GoogleAuthProvider();
		firebase.auth().signInWithPopup(provider);
	}else{
		firebase.auth().signOut();
	}
}

chrome.runtime.onMessage.addListener(Message);

function Message(req, sender, res) {
	var child = dbRef.ref(req.child);
	switch(req.type) {
		case 'post':
			var date = Date.now();
			child.child(date).set({
				uid:firebase.auth().currentUser.uid,
				upvotes:0,
				title:req.title,
				desc:req.desc
			});
			var drawing = child.child(date+'/drawing');
			req.L.forEach(element => drawing.push(element));
			break;
		case 'vote':
			child.child('upvotes').transaction(function(currentRank) {
				return currentRank + req.vote;
			});
			break;
	} 
}