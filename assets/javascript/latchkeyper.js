var days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
var chores = ["Laundry", "Dishes", "Mow Lawn", "Rake Leaves", "Walk Dog", "Clean Room", "Pick up dog poop", "Vacuum", "Sweep Floor", "Clean Bathroom"];
var schoolwork = [];
var miscellaneous = ["Practice Instrument", "Write to Grandparents", "Floss"];



function assignTask () {
}

function mangagePoints () {
}

function respondToRequest () {
}

function checkIn () {
}

function taskLisk () {
}

function requestReward () {
}

function checkPoints () {
}


$(document).ready(function() {

$("button").click(message);
$(document).on("click", "#message-parents-button", message);
message ();
});
function message () {
  var msg = $("#new-msg").val();
  $("#messages").append("<div>" + msg + "<span id='delete'>X</span></div>");
  $("#new-msg").val("");

}


$("button").click(addTask);
$(document).on("click", "#delete", removeTask);

$("input").keypress(function(event) {
  //13 is the ascii code for the enter key
  if (event.which === 13) {
    addTask();
  }
});
// Function to add a task.
function addTask() {
  var task = $("#new-task").val();
  $("#tasks").append("<div>" + task + "<span id='delete'>X</span></div>");
  $("#new-task").val("");
}
// Function to remove a task.
function removeTask() {
  // Grab the closest div to the element that was clicked and remove it.
  // (In this case, the closest element is the one that's encapsulating it.)
  $(this).closest("div").remove();
}

});
