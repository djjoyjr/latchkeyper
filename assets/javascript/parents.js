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
    	const addChild = $("#addChild");
    	const togChild = $(".togChild");
    	const submitChild = $("#submitChild");
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

    		//Updates listOfKids when child added (or on load)
    		dbRefKids.on('child_added', function(snapshot){
				var newKid = $('<li></li>'); //Creates new list item
				newKid.text(snapshot.key); //Updates text of kid
				newKid.addClass("kids");
				newKid.attr("id", snapshot.key); //Sets id equal to key name of key:value pair
				$("#listOfKids").append(newKid);
			});



			//Updates list of chores

        }
        else {
          console.log("Not logged in"); //Use to confirm logout in development
          btnSignOut.css("visibility", "hidden"); //Hides logout button when not logged in
        }
      });

      var activeUser;
      //Change welcome message to user display name if present
      firebase.auth().onAuthStateChanged( function(currentUser){

      	
      });
    	


      //onClick event for Logout button
      btnSignOut.on("click", function(){
        firebase.auth().signOut();
      });

      //onClick toggle to show/hide child addition form
      addChild.on("click", function(){
      	if(togChild.css("visibility") === "hidden"){
      		togChild.css("visibility","visible");
      	}
      	else{
      		togChild.css("visibility","hidden");
      	}
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
});//End of document.ready