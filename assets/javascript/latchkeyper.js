  // Initialize Firebase
  var config = {
    apiKey: "AIzaSyDYUmxcgXcMpWsHt_GGtQSsw2nukEurl_c",
    authDomain: "latchkeyper.firebaseapp.com",
    databaseURL: "https://latchkeyper.firebaseio.com",
    projectId: "latchkeyper",
    storageBucket: "latchkeyper.appspot.com",
    messagingSenderId: "1055724083998"
  };

  firebase.initializeApp(config);


  //End required firebase code

$(document).ready(function() {

$("button").click(message);
$(document).on("click", "#message-parents-button", message);
message ();
//});  commented out to wrap the rest of the functions

function message () {
  var msg = $("#new-msg").val();
  $("#messages").append("<div>" + msg + "<span id='delete'>X</span></div>");
  $("#new-msg").val("");
}

  $("button").click(addTask);
  $(document).on("click", "#delete", removeTask);


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

  // START OF D3- currently only linked to parents.html
  var margin = {top: 40, right: 20, bottom: 30, left: 40},
      width = 960 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom;

  var formatPercent = d3.format("0");

  var x = d3.scale.ordinal()
      .rangeRoundBands([0, width], .1);

  var y = d3.scale.linear()
      .range([height, 0]);

  var xAxis = d3.svg.axis()
      .scale(x)
      .orient("bottom");

  var yAxis = d3.svg.axis()
      .scale(y)
      .orient("left")
      .tickFormat(formatPercent);

  var tip = d3.tip()
    .attr('class', 'd3-tip')
    .offset([-10, 0])
    .html(function(d) {
      return "<strong>Completed:</strong> <span style='color:red'>" + d.completed + "</span>";
    })

  var svg = d3.select("body").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  svg.call(tip);

  // The new data variable.
  var data = [
    {chore: "A", completed: .08167},
    {chore: "B", completed: .01492},
    {chore: "C", completed: .02780},
    {chore: "D", completed: .04253},
    {chore: "E", completed: .12702},
    {chore: "F", completed: .02288},
    {chore: "G", completed: .02022},
    {chore: "H", completed: .06094},
    {chore: "I", completed: .06973},
    {chore: "J", completed: .00153},
    {chore: "K", completed: .00747},
    {chore: "L", completed: .04025},
    {chore: "M", completed: .02517},
    {chore: "N", completed: .06749},
    {chore: "O", completed: .07507},
    {chore: "P", completed: .01929},
    {chore: "Q", completed: .00098},
    {chore: "R", completed: .05987},
    {chore: "S", completed: .06333},
    {chore: "T", completed: .09056},
    {chore: "U", completed: .02758},
    {chore: "V", completed: .01037},
    {chore: "W", completed: .02465},
    {chore: "X", completed: .00150},
    {chore: "Y", completed: .01971},
    {chore: "Z", completed: .00074}
  ];

  // The following code was contained in the callback function.
  x.domain(data.map(function(d) { return d.chore; }));
  y.domain([0, d3.max(data, function(d) { return d.completed; })]);

  svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

  svg.append("g")
      .attr("class", "y axis")
      .call(yAxis)
    .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("Completed");

  svg.selectAll(".bar")
      .data(data)
    .enter().append("rect")
      .attr("class", "bar")
      .attr("x", function(d) { return x(d.chore); })
      .attr("width", x.rangeBand())
      .attr("y", function(d) { return y(d.completed); })
      .attr("height", function(d) { return height - y(d.completed); })
      .on('mouseover', tip.show)
      .on('mouseout', tip.hide)

  function type(d) {
    d.completed = +d.completed;
    return d;
  }
  // END OF D3- currently only linlked to parents.html


});//End of document.ready
