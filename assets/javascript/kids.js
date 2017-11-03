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
    	const rmvChores = $(".rmvChore");


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


			//Updates listOfChores when chore added (or on load)
    		dbRefChores.on('child_added', function(snapshot){
				var newChore = $('<div></div>'); //Creates new div
				newChore.html("<p class='chores'>"+snapshot.key+"</p><button class='rmvChore' id='"+snapshot.key+"'>Remove chore</button>"); //Updates text of kid
				newChore.addClass("chores");
				newChore.attr("id", snapshot.key); //Sets id equal to key name of key:value pair
				$("#listOfChores").append(newChore);
			});

			//Updates listOfChores on chore removal
			dbRefChores.on('child_removed', function(snapshot){
				const choreRemove = $("#"+shapshot.key);
				choreRemove.remove();
			});

        }
        else {
          console.log("Not logged in"); //Use to confirm logout in development
          btnSignOut.css("visibility", "hidden"); //Hides logout button when not logged in
        }
        //on click of the Check In button
        //this writes to the jumbotron on this page, but will need to write to the parents page eventually
        $("#check-in-button").click(checkIn);
        function checkIn () {
          var checkingIn = new Date();
          var kidname = firebase.database().ref().child.val;
          console.log(kidname);
          var dbRefKids = dbRefUser.child("children");
            if(dbRefKids.child(kidname)){
              dbRefKids.child(kidname).update({[kidname]:{"checkIn": checkingIn}});
            }
            else {
              dbRefKids.update({kidname:{[kidname]:{"checkIn": checkingIn}}});
            }
          // $("#messages").append("<div> Your child checked in at home at:  " + checkingIn + "<span id='delete'>X</span></div>");
        };

        // $("#request-reward-button").click(requestReward);
        //
        // function requestReward () {
        //   var rewardRequest = prompt("Request a reward: ");
        //   var requester = dbRefKids.child
        //   var kidname = $("#childName").val();
        //   var dbRefKids = dbRefRoot.child(activeUser);
        //     if(dbRefKids.child("children")){
        //       dbRefKids.child("children").update({[kidname]:{"reward": rewardRequest}});
        //     }
        //     else {
        //       dbRefKids.update({"children":{[kidname]:{"reward": rewardRequest}}});
        //     }
        // };






      });






        // //this writes to the jumbotron on this page, but will need to write to the parents page eventually
        // function messageParents () {
        //   var msg = prompt("Enter your message:");
        //   $("#messages").append("<div>" + msg + "<span id='delete'>X</span></div>");
        // }

      var activeUser;

      //onClick event for Logout button
      btnSignOut.on("click", function(){
        firebase.auth().signOut();
      });


      //onClick of addChore
      addChore.on("click", function(){
      	var choreName = $("#new-task").val();
      	var prioPoints = parseInt($("#priority").val());
      	var diffPoints = parseInt($("#difficulty").val());
      	var totPoints = prioPoints + diffPoints;
      	var dbRefUser = dbRefRoot.child(activeUser);
      		if(dbRefUser.child("chores")){
      			dbRefUser.child("chores").update({[choreName]:{"done": false, "Diff": diffPoints, "Prio": prioPoints, "Total": totPoints}})
      		}
      		else {
      			dbRefUser.update({"chores":{[choreName]:{"done": false, "Diff": diffPoints, "Prio": prioPoints, "Total": totPoints}}})
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

      //onClick of removeChore
      $("#listOfChores").on("click", "button", function(){
      	console.log("I removed " +this.id);
      });

});//End of document.ready
