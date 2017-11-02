$(document).ready( function(){
    var config = {
    apiKey: "AIzaSyDYUmxcgXcMpWsHt_GGtQSsw2nukEurl_c",
    authDomain: "latchkeyper.firebaseapp.com",
    databaseURL: "https://latchkeyper.firebaseio.com",
    projectId: "latchkeyper",
    storageBucket: "latchkeyper.appspot.com",
    messagingSenderId: "1055724083998"
    };
    firebase.initializeApp(config);

    //jQuery grab elements by ID
    	const btnSignOut = $("#btnSignOut");
    	const submitChild = $("#submitChild");
    	const addChore = $("#addTask");
    	const dbRefRoot = firebase.database().ref();

      //Function create user
      const createUser = function (userID, userName, email){
        console.log(userID, userName, email);
        dbRefRoot.child(userID).set({"parent":{"name": userName, "email": email}});
        //dbRefRoot.child(userID).update({"children": null});
        //dbRefRoot.child(userID).update({"messages": null});
      }

      //onAuthStateChanged listens for state to change to either logged in or logged out
      firebase.auth().onAuthStateChanged( function(currentUser){
        //If user is successfully logged in, currentUser is true, otherwise is null
        if(currentUser){
        	//Changes welcome text if user has displayName defined
        	if(currentUser.displayName){
      			$('#welcome').text("Welcome, " + currentUser.displayName);
      		}
      		else{
      			$('#welcome').text("Welcome!");
      		}
      		//Sets uid to variable
        	activeUser = currentUser.uid;
        	//Sets logout button to visible
        	btnSignOut.css("visibility", "visible"); 
        	//Takes snapshot of dbRoot
        	dbRefRoot.once('value', function(snapshot) {
            	//If root has a node with the current user's ID, confirms existance in DB
            	if (snapshot.hasChild(currentUser.uid)) { 
           			console.log("User exists in DB");
            	}
            	//If not, runs createUser which adds their user data to the database
            	else {
              		console.log("This user does not exist in the DB yet")
              		createUser(currentUser.uid, currentUser.displayName, currentUser.email);
            		}
          	});
          	//Database references
    		var dbRefUser = dbRefRoot.child(activeUser);
    		var dbRefKids = dbRefUser.child("children");
    		var dbRefChores = dbRefUser.child("chores");

    		//Updates listOfKids when child added (or on load)
    		dbRefKids.on('child_added', function(snapshot){
				var newKid = $('<li></li>'); //Creates new list item
				newKid.text(snapshot.key); //Updates text of kid
				newKid.addClass("kids");
				newKid.attr("id", snapshot.key); //Sets id equal to key name of key:value pair
				$("#listOfKids").append(newKid);
			});

			//Updates listOfChores when chore added (or on load)
    		dbRefChores.on('child_added', function(snapshot){
				var newChore = $('<li></li>'); //Creates new list item
				console.log(snapshot);
				newChore.text(snapshot.key); //Updates text of kid
				newChore.addClass("chores");
				newChore.attr("id", snapshot.key); //Sets id equal to key name of key:value pair
				$("#listOfChores").append(newChore);
			});

        }
        else {
          console.log("Not logged in"); //Use to confirm logout in development
          btnSignOut.css("visibility", "hidden"); //Hides logout button when not logged in
        }
      });

      var activeUser;
    	
      //onClick event for Logout button
      btnSignOut.on("click", function(){
        firebase.auth().signOut();
      });

      //onClick of submitChild
      submitChild.on("click", function(){
      	var kidname = $("#childName").val();
      	var dbRefUser = dbRefRoot.child(activeUser);
      		if(dbRefUser.child("children")){
      			dbRefUser.child("children").update({[kidname]:{"points": 0}});
      		}
      		else {
      			dbRefUser.update({"children":{[kidname]:{"points": 0}}});
      		}
      });

      //onClick of addChore
      addChore.on("click", function(){
      	var choreName = $("#new-task").val();
      	var prioPoints = $("#priority").val();
      	var diffPoints = $("#difficulty").val();
      	var totPoints = prioPoints + diffPoints;
      	var dbRefUser = dbRefRoot.child(activeUser);
      		if(dbRefUser.child("chores")){
      			dbRefUser.child("chores").update({[choreName]:{"done": false, "Diff": [diffPoints], "Prio": [prioPoints], "Total": [totPoints]}})
      		}
      		else {
      			dbRefUser.update({"chores":{[choreName]:{"done": false, "Diff": [diffPoints], "Prio": [prioPoints], "Total": [totPoints]}}})
      		}
      });

      //onClick of addMessage
      $("#message-child-button").click(messageChild);
      function messageChild () {
        var msg = prompt("Enter your message:");
        var dbRefUser = dbRefRoot.child(activeUser);
            if(dbRefUser.child("messages")){
              dbRefUser.child("mesages").push(msg);
            }
            else {
              dbRefUser.push({"messages":msg});
            }
        $("#messages").append("<div>" + msg + "<span id='delete'>X</span></div>");
      };

});//End of document.ready