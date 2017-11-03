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

    		//Updates listOfKids when child added (or on load)
    		dbRefKids.on('child_added', function(snapshot){
				var newKid = $('<div></div>'); //Creates new div
				newKid.addClass("kids");
				newKid.html("<p class='kids'>"+snapshot.key+"</p><button class='msgKid' id='"+snapshot.key+"'>Message "+snapshot.key+"</button>");
				newKid.attr("id", snapshot.key); //Sets id equal to key name of key:value pair
				$("#listOfKids").append(newKid);
        // console.log();
			});

      //enables on click listen for dynamically created buttons
      $('#children').on('click', "button", function() {
        var dm = prompt("Enter your message:");
        dbRefKids.child(this.id).push(dm);
      });

      //Creates buttons for each requested reward from db
        dbRefKids.on('child_added', function(snapshot){
        var rewardRequest = $('<div></div>'); //Creates new div
        var request = snapshot.val().reward;
        rewardRequest.addClass("rewardButtonClass");
        rewardRequest.html('<button type="button" class="btn btn-primary" id="'+snapshot.key+'">Respond to a Request</button>');
        rewardRequest.attr("id",snapshot.key);
        $("#reward-requests").append('<button type="button" class="btn btn-primary" id="'+snapshot.key+'">'+request+'</button>');
      });

      //Removes request from db on click
      $("#reward-requests").on("click", "button", function(){
        var dbRefUser = dbRefRoot.child(activeUser);
        // console.log(dbRefUser.key)
      	var dbRefKids = dbRefUser.child("children");
        // console.log(dbRefKids.key);
        console.log(this.id);
        var kid = this.id;
        var dbRefRewards = dbRefKids.child(kid);
        dbRefRewards.child("reward").remove();

        //dbRefRewards.child(thing).remove();

      });


			//Updates listOfChores when chore added (or on load)
    		dbRefChores.on('child_added', function(snapshot){
    			if(snapshot.val().done){}
    			else{
				var newChore = $('<div></div>'); //Creates new div
				var points = snapshot.val().Total;
				newChore.html("<p class='chores'>"+snapshot.key+"</p><p>Worth: "+points+" points</p><button class='rmvChore' id='"+snapshot.key+"'>Remove chore</button>"); //Updates text of kid
				newChore.addClass("chores");
				newChore.attr("id", snapshot.key); //Sets id equal to key name of key:value pair
				$("#listOfChores").append(newChore);
				}
			});

			//Updates listOfChores on chore removal
			dbRefChores.on('child_removed', function(snapshot){
				const choreRemove = $("#"+shapshot.key);
				choreRemove.remove();
			});

			//Generate dropdown list of children
			var list = $("#forWhom");
			dbRefKids.once("value", function(snapshot){
				snapshot.forEach(function(child){
					var name = child.key;
					$('<option />', {value: name, text: name}).appendTo(list);
				});
			});
			//Updates complete with completed chores
			dbRefChores.on('child_added', function(snapshot){
				// console.log(snapshot.val().done);
				if(snapshot.val().done){
					var newChore = $('<div></div>'); //Creates new div
					var points = snapshot.val().Total;
					newChore.html("<p class='chores'>"+snapshot.key+"</p><p>Worth: "+points+" points</p><button class='rmvChore' id='"+snapshot.key+"'>Remove chore</button>"); //Updates text of kid
					newChore.addClass("done");
					newChore.attr("id", snapshot.key); //Sets id equal to key name of key:value pair
				$("#complete").append(newChore);
				}
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
          console.log(spawnArray);
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

                             console.log(datetime);
                             dates.push(datetime);

            // console.log(child.val().Total);
            // console.log(child.val().Diff);
            // console.log(child.val().Prio);
            diffArray.push(diff);
            // console.log(diffArray);

            prioArray.push(prio);
            // console.log(prioArray);

            totalArray.push(total);
            console.log(totalArray);

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



            console.log(total);




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
                     backgroundColor: "rgba(55, 160, 225, 0.7)",
                     hoverBackgroundColor: "rgba(55, 160, 225, 0.7)",
                     hoverBorderWidth: 2,
                     hoverBorderColor: 'lightgrey'
                  },
                  {
                      label: 'Priority',
                      data: prioArray,
                     backgroundColor: "rgba(225, 58, 55, 0.7)",
                     hoverBackgroundColor: "rgba(225, 58, 55, 0.7)",
                     hoverBorderWidth: 2,
                     hoverBorderColor: 'lightgrey'
                  },
                  {
                    label: 'Time',
                    data: time,
                    backgroundColor: "rgba(230, 72, 104, 0.7)",
                      hoverBackgroundColor: "rgba(230, 72, 104, 0.7)",
                      hoverBorderWidth: 2,
                      hoverBorderColor: 'lightgrey'

                  },
                  {
                    label: 'Total',
                    data: total,

                    backgroundColor: "rgba(230, 72, 104, 0.7)",
                      hoverBackgroundColor: "rgba(230, 72, 104, 0.7)",
                      hoverBorderWidth: 2,
                      hoverBorderColor: 'lightgrey'
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


            //end chart
          });



       });
     }



  });



//end Ani Learning
});//End of document.ready
