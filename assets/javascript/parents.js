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

      //Function create user
      const createUser = function (userID, userName, email){
        dbRefRoot.child(userID).set({"parent":{"name": userName, "email": email}});
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
           		// 	console.log("User exists in DB");
              }
            	//If not, runs createUser which adds their user data to the database
            	else {
              		createUser(currentUser.uid, currentUser.displayName, currentUser.email);
            		}
          	});

          	//Database references
    		var dbRefUser = dbRefRoot.child(activeUser);
    		var dbRefKids = dbRefUser.child("children");
    		var dbRefChores = dbRefUser.child("chores");
        var dbRefMessages = dbRefUser.child("messages");


    		//Updates listOfKids when child added (or on load)
    		dbRefKids.on('child_added', function(snapshot){
        var newKid = $('<div></div>'); //Creates new div
				newKid.addClass("kids");
				newKid.html("<p class='kids'>"+snapshot.key+"</p><button class='msgKid btn btn-light btn-sm' id='"+snapshot.key+"'>Message "+snapshot.key+"</button><button class='rmvKid btn btn-light btn-sm' id='"+snapshot.key+"'>Remove "+snapshot.key+"</button>");
				newKid.attr("id", snapshot.key); //Sets id equal to key name of key:value pair
				$("#listOfKids").append(newKid);
			});

        //Updates message center with messages from kids pulled from database
        dbRefMessages.on('child_added', function (snapshot){
          var message = snapshot.val();
          var msgFromKid = $('<div></div>');
            msgFromKid.addClass("message");
            msgFromKid.html("<p class='message'>" + message + "</p><button class='button btn-light btn-sm' id='"+message+"'>Remove</button>");
            msgFromKid.attr("id", snapshot.key);
            $("#messages").append(msgFromKid);
          });

          //Removes message from kids from db on click
          $("#messages").on("click", "button", function(){
            console.log(this.id);
            var dbRefUser = dbRefRoot.child(activeUser);
            var dbRefMessage = dbRefUser.child('messages');
            console.log(dbRefMessage.key);
            var dbRefMsgToDelete = dbRefMessage.child('message');
            console.log(dbRefMessage.child);
            dbRefMessage.child('message').remove();
          });

      //enables on click listen for dynamically created buttons
      //sends message to whichever kid's button the parent clicks on
      $('#children').on('click', ".msgKid", function() {
        var dm = prompt("Enter your message:");
        dbRefKids.child(this.id).update({"messages":dm});
      });

      //Creates buttons for each requested reward from db
        dbRefKids.on('child_added', function(snapshot){
          if (snapshot.val().reward) {
            var requester = snapshot.key;
            var rewardRequest = $('<div></div>'); //Creates new div
            var request = snapshot.val().reward;
            rewardRequest.addClass("rewardButtonClass");
            // rewardRequest.html('<button type="button" class="btn btn-primary" id="'+snapshot.key+'">Respond to a Request</button>');
            rewardRequest.attr("id",snapshot.key);
            $("#reward-requests").append('<button type="button" class="btn btn-primary" id="'+snapshot.key+'">'+ requester +"<p> requests: </p>" +request+'</button>');
          };
      });

      //Removes request from db on click
      $("#reward-requests").on("click", "button", function(){
        var dbRefUser = dbRefRoot.child(activeUser);
      	var dbRefKids = dbRefUser.child("children");
        console.log(this.id);
        var kid = this.id;
        var dbRefRewards = dbRefKids.child(kid);
        dbRefRewards.child("reward").remove();
      });

			//Updates listOfChores when chore added (or on load)
    		dbRefChores.on('child_added', function(snapshot){
    			if(snapshot.val().done){}
    			else{
				var newChore = $('<div></div>'); //Creates new div
				var points = snapshot.val().Total;
        var kid = snapshot.val().For;
				newChore.html("<p class='chores'>"+snapshot.key+"</p><p>Worth: "+points+" points</p><p>For: "+kid+"</p><button class='rmvChore btn btn-light btn-sm' id='"+snapshot.key+"'>Remove chore</button>"); //Updates text of kid
				newChore.addClass("chores");
				newChore.attr("id", snapshot.key); //Sets id equal to key name of key:value pair
				$("#listOfChores").append(newChore);
				}
			});

			//Updates listOfChores on chore removal
			dbRefChores.on('child_removed', function(snapshot){
				const choreRemove = $("#"+snapshot.key);
				choreRemove.remove();
			});

			//Generate dropdown list of children
      var name;
			var list = $("#forWhom");
			dbRefKids.once("value", function(snapshot){
				snapshot.forEach(function(child){
					name = child.key;
					$('<option />', {value: name, text: name}).appendTo(list);
				});
			});

			//Updates complete with completed chores for today
      var theDate = new Date();
      var today = (theDate.getMonth()+1) + "-" +theDate.getDate();
      var dbRefHisto = dbRefUser.child("history");
      var dbRefToday = dbRefHisto.child(today);
      var kid;
      var points;
			dbRefToday.on('child_added', function(snapshot){
          points = parseInt(Object.values(snapshot.val()));
          kid = Object.keys(snapshot.val()).toString();
					var newChore = $('<div></div>'); //Creates new div
					newChore.html("<p class='chores'>"+snapshot.key+"</p><p>Worth: "+points+" points</p><p>For: "+kid+"</p>"); //Updates text of kid
					newChore.addClass("done");
				$("#complete").append(newChore);
			});


        }
        else {
          // console.log("Not logged in"); //Use to confirm logout in development
          btnSignOut.css("visibility", "hidden"); //Hides logout button when not logged in
        }


        //Display kids' points for parents
        var pointDisplay = $("#point-display");


        //Generate Point Management for parents
        var pointManagement = $("#point-management");
        var kid;
        var pointsDiv;
        var dispPoints;
        var dbRefUser = dbRefRoot.child(activeUser);
        var dbRefKids = dbRefUser.child("children");
        dbRefKids.once("value", function(snapshot){
          snapshot.forEach( function(divsnap) {
            dispPoints = divsnap.val().points;
            kid = divsnap.key;
            // console.log(kid);
            pointsDiv = $("<div></div>");
            pointsDiv.text ( kid + ' has earned ' + dispPoints + ' points');
            pointsDiv.attr("id", "div"+kid);
            pointsDiv.appendTo(pointDisplay);
          });
        });

        //Generate button and dropdown list of children for point redemption
      var redeemList = $("#redeem-points-list");
      // var pointRedeem = $("#redeem-points");
      var redeemDiv = $("<div></div>");
      var ptsBtn = $("#redeem-points-button");
      dbRefUser.once("child_added", function(snapshot) {
        snapshot.forEach(function(rewardsnap) {
          var requester = rewardsnap.key;
          $('<option />', {
            value: requester,
            text: requester
          }).appendTo(redeemList);
          redeemDiv.appendTo(redeemList);
        });
      });
        //Parent can manage kids' points here
       $("#redeem-points").click(redeemPoints);
       function redeemPoints() {
         var kid = $("#redeem-points-list").val();
        //  console.log(kid);
         var pointsToRedeem = 0;
         pointsToRedeem = prompt("How many of " + kid + "'s points would you like to redeem?");
        var dbRefUser = dbRefRoot.child(activeUser);
        var dbRefKids = dbRefUser.child("children");
        var dbRefPoints = dbRefKids.child('points');
        // console.log(dbRefPoints);
        dbRefKids.once("value", function(snapshot) {
          console.log(snapshot.val().points);
            // var pointsAvailable = dbRefPoints.child('kid');
            // //  console.log(pointsAvailable);
            //  var totalPoints = dbRefKids.child('kid');
            // //  console.log(totalPoints);
            //  var whosePoints = dbRefUser.child(this.id);
            //  console.log(whosePoints);



              // $("#combat-updates").text(yourCharacter["name"] + " attacked " + defender ["name"] + " for " + currentAP + " points.");
        			// yourCharacter["HP"] -= defender["CAP"];
        			// $(".yourPlayerHP").text("HP: " + yourCharacter["HP"]);
        			// defender["HP"] -= currentAP;
        			// $(".yourDefenderHP").text("HP: " + defender["HP"]);
        			// currentAP += yourCharacter["AP"];


        });




       };





      });  // END OF onAuthStateChanged listens for state to change to either logged in or logged out
//----------------------------------------------------------------------------------------------------

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
      	var prioPoints = parseInt($("#priority").val());
      	var diffPoints = parseInt($("#difficulty").val());
      	var totPoints = prioPoints + diffPoints;
      	var whoDo = $("#forWhom").val();
      	var dbRefUser = dbRefRoot.child(activeUser);
      		if(dbRefUser.child("chores")){
      			dbRefUser.child("chores").update({[choreName]:{"done": false, "Diff": diffPoints, "Prio": prioPoints, "Total": totPoints, "For": whoDo}})
      		}
      		else {
      			dbRefUser.update({"chores":{[choreName]:{"done": false, "Diff": diffPoints, "Prio": prioPoints, "Total": totPoints, "For": whoDo}}})
      		}
      });

      //onClick of removeChore
      $("#listOfChores").on("click", "button", function(){
      	var dbRefUser = dbRefRoot.child(activeUser);
      	var dbRefChores = dbRefUser.child("chores");
      	dbRefChores.child(this.id).remove();
      });

      //onClick of removeChore
      $("#complete").on("click", "button", function(){
        var dbRefUser = dbRefRoot.child(activeUser);
        var dbRefChores = dbRefUser.child("chores");
        dbRefChores.child(this.id).remove();
      });

      firebase.auth().onAuthStateChanged(function(currentUser){

    database = firebase.database();
     if (currentUser) {
      var spawnName;
      var spawnArray = [];

      var dbRefRoot = firebase.database().ref();
      var dbRefUser = dbRefRoot.child(currentUser.uid);
      var dbRefChildren = dbRefUser.child("children");

      dbRefChildren.on('value', function(snapshot) {
        // console.log("snapshot",snapshot)
        snapshot.forEach(function(child) {
          spawnName = child.key;

          spawnArray.push(spawnName);
          // console.log(spawnArray);
        });

        $('#nameOne').html(spawnArray[0]);
        $('#nameTwo').html(spawnArray[1]);
        $('#nameThree').html(spawnArray[2]);
      });

    }
     if(currentUser) {


          var dbRefRoot = firebase.database().ref();
          var dbRefUser = dbRefRoot.child(currentUser.uid);
          var dbRefChores = dbRefUser.child("chores");

          var diff;
          var prio;
          var total;

          var diffArray = [];
          var prioArray = [];
          var totalArray = [];
          var dates = [];


var currentdate;
var datetime;

//end timestamp
//new
dbRefChores.on('child_added', function(snapshot){
  if(snapshot.val().done){

       dbRefChores.on('value', function(snapshot){

          snapshot.forEach(function(child){
             diff = child.val().Diff;
             prio = child.val().Prio;
             total = child.val().Total;


             var currentdate = new Date();
             var datetime =
            currentdate.getDate() + "/"
                             + (currentdate.getMonth()+1)  + "/"
                             + currentdate.getFullYear() + " @ "
                             + currentdate.getHours() + ":"
                             + currentdate.getMinutes() + ":"
                             + currentdate.getSeconds();

                            //  console.log(datetime);
                             dates.push(datetime);

            // console.log(child.val().Total);
            // console.log(child.val().Diff);
            // console.log(child.val().Prio);


            diffArray.push(diff);

            // console.log(diffArray);

            prioArray.push(prio);
            // console.log(prioArray);

            totalArray.push(total);
            // console.log(totalArray);

            //start chart data
            var numberWithCommas = function(x) {
              return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
            };

            // var difficulty = [21000, 22000, 26000, 35000, 55000, 55000, 56000, 59000, 60000, 61000, 60100, 62000];
            // var priority = [1000, 1200, 1300, 1400, 1060, 2030, 2070, 4000, 4100, 4020, 4030, 4050];
            //
            var time= [5, 6, 1, 3, 10, 8, 4, ];

             var total = [];
            for (var i=0; i < time.length; i++){
            total.push(diffArray[i] + prioArray[i] + time[i]);
            }



            // console.log(total);




            // Chart.defaults.global.elements.rectangle.backgroundColor = '#FF0000';

            var bar_ctx = document.getElementById('bar-chart');
            var bar_chart = new Chart(bar_ctx, {
              type: 'bar',
              data: {
                  labels: dates,
                  datasets: [
                  {
                      label: 'Difficulty',
                      data: diffArray,
                     backgroundColor: "rgba(52, 64, 58, 0.7)",
                     hoverBackgroundColor: "rgba(52, 64, 58, 0.7)",
                     hoverBorderWidth: 2,
                     hoverBorderColor: 'lightgrey'
                  },
                  {
                      label: 'Priority',
                      data: prioArray,
                     backgroundColor: "rgba(40, 82, 56, 0.7)",
                     hoverBackgroundColor: "rgba(40, 82, 56, 0.7)",
                     hoverBorderWidth: 2,
                     hoverBorderColor: 'lightgrey'
                  },

                  {
                    label: 'Total',
                    data: total,

                    backgroundColor: "rgba(230, 72, 104, 0)",
                      hoverBackgroundColor: "rgba(230, 72, 104, 0)",

                  },
                  ]
              },
              options: {
                   animation: {
                   duration: 10,
                  },
                  tooltips: {
                   mode: 'label',
                    callbacks: {
                    label: function(tooltipItem, data) {
                     return data.datasets[tooltipItem.datasetIndex].label + ": " + numberWithCommas(tooltipItem.yLabel);

                    }
                    }
                   },
                  scales: {
                    xAxes: [{
                     stacked: true,
                      gridLines: { display: false },
                      }],
                    yAxes: [{
                     stacked: true,
                      ticks: {
                       callback: function(value) { return numberWithCommas(value); },
                       },
                      }],
                  }, // scales
                  legend: {display: true}
              } // options
             });



            //end firstchart
            //start second chart

          var dayz = [];
          var spawnTot = [];
          var scoreTot = [];
          var data = [];

var dbRefHisto = dbRefUser.child("history");

  dbRefHisto.on('child_added', function(childSnapshot){

      histo = childSnapshot.val();
      dateHisto = childSnapshot.key;
      //console.log(dateHisto);
      //console.log(histo);
      data.push(histo);
      //console.log(data);

      dayz.push(dateHisto);
      //console.log(dayz);
    });

    var dbRefHisto = dbRefUser.child("children");

      dbRefHisto.on('child_added', function(childSnapshot){

childSnapshot.forEach(function(child){
  pair = child.val();
//  console.log(pair);

  scoreTot.push(pair);
  console.log(scoreTot);

var kidNameTot = Object.keys(pair).toString();

spawnTot.push(kidNameTot);
//console.log(spawnTot);

// var pointTot = (parseInt(pair[kidNameTot]));
//   //(Object.values(pair)));
//
// scoreTot.push(pointTot);
// //console.log(scoreTot);


// var toLookBetter = {}
// data.forEach(function(task){
//   // console.log(Object.keys(task))
//
//    var task = task[Object.keys(task)]
//    var kid = Object.keys(task)
//    //console.log(kid[0])
//    if( Object.keys(toLookBetter).includes(kid[0])){
//     toLookBetter[kid[0]].push(task[kid])
//    }else{
//     toLookBetter[kid[0]] = []
//     toLookBetter[kid[0]].push(task[kid])
//    }
// })
//console.log(toLookBetter[kid[i]]);
//console.log(task[kid]);

});
//console.log(scoreTot);

  });
//});


            new Chart(document.getElementById("line-chart"), {
  type: 'line',
  data: {
    labels: dayz,
    datasets: [{
        data: spawnArray,
        label: spawnArray[0],
        borderColor: "#3e95cd",
        fill: false
      }, {
        data: scoreTot,
        label: spawnArray[1],
        borderColor: "#8e5ea2",
        fill: false
      }, {
        data: scoreTot,
        label: spawnArray[2],
        borderColor: "#3cba9f",
        fill: false
      }, {
        data: scoreTot,
        label: spawnArray[3],
        borderColor: "#e8c3b9",
        fill: false
      }, {
        data: scoreTot,
        label: spawnArray[4],
        borderColor: "#c45850",
        fill: false
      }
    ]
  },
  options: {
    title: {
      display: true,
      text: 'Points Per Child Per Day'
    }
  }
});//end second chart

          });//end forEach function
}); //just added
}//just added 2

       });
     }
  });
//end Ani Learning
});//End of document.ready
