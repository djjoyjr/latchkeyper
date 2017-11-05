$(document).ready(function() {
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
  firebase.auth().onAuthStateChanged(function(currentUser) {
    //If user is successfully logged in, currentUser is true, otherwise is null
    if (currentUser) {
      //Changes welcome text if user has displayName defined
      if (currentUser.displayName) {
        $('#welcome').text("Welcome, " + currentUser.displayName);
      } else {
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
      var dbRefMessages = dbRefKids.child("messages");

      //Updates listOfChores when chore added (or on load)
      dbRefChores.on('child_added', function(snapshot) {
        var newChore = $('<div></div>'); //Creates new div
        newChore.html("<p class='chores'>" + snapshot.key + "</p><button class='rmvChore' id='" + snapshot.key + "'>Remove chore</button>"); //Updates text of kid
        newChore.addClass("chores");
        newChore.attr("id", snapshot.key); //Sets id equal to key name of key:value pair
        $("#listOfChores").append(newChore);
        // console.log(newChore);
      });

      //Updates listOfChores on chore removal
      dbRefChores.on('child_removed', function(snapshot) {
        const choreRemove = $("#" + shapshot.key);
        choreRemove.remove();
      });

    } else {
      console.log("Not logged in"); //Use to confirm logout in development
      btnSignOut.css("visibility", "hidden"); //Hides logout button when not logged in
    }
    //on click of the Check In button
    $("#check-in-button").click(checkIn);
    function checkIn() {
      var checkingIn = new Date();
      var kidname = $("#whoCheckIn").val();
      if (dbRefKids.child(kidname)) {
        dbRefKids.child(kidname).update({
          "checkIn": checkingIn
        });
      } else {
        dbRefUser.child("children").update({
          kidname: {
            "checkIn": checkingIn
          }
        });
      }
    };

    //Updates message center with direct messages to kids from parents pulled from database
      dbRefKids.once('value', function (snapshot){
        // console.log(snapshot.val());
        snapshot.forEach(function(msgsnap) {
          var recipient = msgsnap.key;
          var dm = msgsnap.val().messages;
          // console.log (dm);
          if (dm){
          var msgFromParent = $('<div></div>');
          msgFromParent.addClass("message");
          msgFromParent.attr("id", dm);
          msgFromParent.html(recipient + ": " + dm + "<button id='" + msgsnap.key + "'>Delete Message</button>");
          $("#message").append(msgFromParent);
          }
        });
      });

      // delete message buttons - supposed to delete messages from the db, but not currently working
      $('#message').on('click', 'button', function() {
        var dbRefUser = dbRefRoot.child(activeUser);
        var dbRefKids = dbRefUser.child("children");
        var dbRefMsgToDelete = dbRefKids.child(this.id);
        console.log(dbRefMsgToDelete.key);
        dbRefMsgToDelete.child('messages').remove();
        });







      //sets values for the selector list identifying who's requesting a reward
     dbRefKids.once("value", function(snapshot) {
       snapshot.forEach(function(rewardsnap) {
         var requester = rewardsnap.key;
         $('<option />', {
           value: requester,
           text: requester
         }).appendTo(requestlist);
       });
     });

     //Child can request a reward from parents
    $("#request-reward-button").click(requestReward);
    function requestReward() {
      var rewardRequest = prompt("Request a reward: ");
      var requester = $("#whoRequest").val();
      if (dbRefUser.child("children").child(requester)) {
        dbRefUser.child("children").child(requester).update({
          "reward": rewardRequest
        });
      } else {
        dbRefUser.child("children").update({
          requester: {
            "reward": rewardRequest
          }
        });
      }
    };

    //Generate dropdown list of children for check in
    var checklist = $("#whoCheckIn");
    dbRefKids.once("value", function(snapshot) {
      snapshot.forEach(function(kidsnap) {
        var name = kidsnap.key;
        $('<option />', {
          value: name,
          text: name
        }).appendTo(checklist);
      });
    });

      //Generate dropdown list of children for request
      var requestlist = $("#whoRequest");
      dbRefKids.once("value", function(snapshot) {
        snapshot.forEach(function(rewardsnap) {
          var requester = rewardsnap.key;
          $('<option />', {
            value: requester,
            text: requester
          }).appendTo(requestlist);
        });
      });

      //Generate task div for each child of "children"
      var kidsTasks = $("#kidTasks");
      var kid;
      var newDiv;
      var newTitle;
      var dispPoints;
      dbRefKids.once("value", function(snapshot){
        snapshot.forEach( function(divsnap) {
          dispPoints = divsnap.val().points;
          kid = divsnap.key;
          newDiv = $("<div></div>");
          newTitle = $("<h2></h2>");
          newSub = $("<h4></h4>");
          newTitle.text(kid + "'s Tasks");
          newSub.text("Point Total: "+dispPoints)
          newDiv.attr("id", "div"+kid);
          newTitle.appendTo(kidsTasks);
          newSub.appendTo(kidsTasks);
          newDiv.appendTo(kidsTasks);
        });
      });

      //Populate each child's section with their tasks
      var taskDiv;
      var points;
      var who;
      dbRefChores.once("value", function(snapshot){
        snapshot.forEach(function(tasksnap){
          if(tasksnap.val().done){}
          else {
          taskDiv = $("<div></div>");
          points = tasksnap.val().Total;
          who = tasksnap.val().For;
          // console.log(who);
          taskDiv.html("<p class='chores'>"+tasksnap.key+"</p><p>Worth: "+points+" points</p><button class='"+who+"' id='"+tasksnap.key+"'>Complete chore</button>"); //Updates text of kid
          taskDiv.addClass("chores");
          taskDiv.attr("id", "chore-div");
          // console.log(taskDiv);
          $(taskDiv).appendTo('#div'+who);
          }
        });
      });

      //onClick of Complete Chore
      $("#kidTasks").on("click", "button", function() {
        var kid = this.className;
        // console.log(kid);
        var chore = this.id;
        var pointsAdd;
        var pointTotal;
        var date = new Date();
        var day = date.getDate();
        var month = date.getMonth()+1;
        var monthDay = month + "-" + day;
        var dbRefHist = dbRefUser.child("history");
        var dbRefDay = dbRefHist.child(monthDay);
        dbRefChores.child(chore).update({"done": true});
        dbRefChores.once("value", function(snapshot){
            pointsAdd = snapshot.child(chore).val().Total;
            // console.log(pointsAdd);
        });
        dbRefKids.once("value",function(snapshot){
          pointTotal =snapshot.child(kid).val().points;
          pointTotal += pointsAdd;
          dbRefKids.child(kid).update({"points": pointTotal});
          if(dbRefDay){
            dbRefDay.update({[chore]:{[kid]:pointsAdd}});
          }
          else {
          dbRefUser.update({"history":{[monthDay]:{[chore]:{[kid]:pointsAdd}}}});
        }
        });
      });
  });


  var activeUser;

  //onClick event for Logout button
  btnSignOut.on("click", function() {
    firebase.auth().signOut();
  });


  //onClick of addChore
  addChore.on("click", function() {
    var choreName = $("#new-task").val();
    var prioPoints = parseInt($("#priority").val());
    var diffPoints = parseInt($("#difficulty").val());
    var totPoints = prioPoints + diffPoints;
    var dbRefUser = dbRefRoot.child(activeUser);
    if (dbRefUser.child("chores")) {
      dbRefUser.child("chores").update({
        [choreName]: {
          "done": false,
          "Diff": diffPoints,
          "Prio": prioPoints,
          "Total": totPoints
        }
      })
    } else {
      dbRefUser.update({
        "chores": {
          [choreName]: {
            "done": false,
            "Diff": diffPoints,
            "Prio": prioPoints,
            "Total": totPoints
          }
        }
      })
    }
  });


  //onClick of Message Parents Button
  $("#message-parents-button").click(messageParents);
  function messageParents () {
    var msg = prompt("Enter your message:");
    var dbRefUser = dbRefRoot.child(activeUser);
    dbRefUser.child("messages").update({"message":msg});
  };


  //onClick of removeChore
  $("#listOfChores").on("click", "button", function() {
    var dbRefUser = dbRefRoot.child(activeUser);
    var dbRefChores = dbRefUser.child("chores");
    dbRefChores.child(this.id).remove();
  });



}); //End of document.ready
