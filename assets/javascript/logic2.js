

  // Initialize Firebase
  var config = {
    apiKey: "AIzaSyBNV3_lZl0MM75h-dJIXNvMcC5gSWUKyLQ",
    authDomain: "trainscheduler-5e079.firebaseapp.com",
    databaseURL: "https://trainscheduler-5e079.firebaseio.com",
    projectId: "trainscheduler-5e079",
    storageBucket: "trainscheduler-5e079.appspot.com",
    messagingSenderId: "126720189149"
  };
  firebase.initializeApp(config);

  // Create a variable to reference the database
  var database = firebase.database();

  // Initial Values
  var trainName = "";
  var destination = "";
  var frequencyMnt = "";
  var firstTrainTime ="1:30";
  var trainTime=0;
  var trainSchedule=[];
  var currentTimeMnt=0;
  var nextArrivalMnt=0;
  var nextArrival=0;
  var minutesAway= 0;
  var trainCode="";

// general function to convert hh:mm to minutes 
  function convertTimeToMinutesFn(time) {

    time = moment(time, "hh:mm");
    timeHours = time.hours();
    timeMin = time.minutes();
    // Calculation to add up the minutes.
    return (timeHours*60 + timeMin)
  }

  //Show and update current time. Use setInterval method to update time.
function displayRealTime() {
  setInterval(function(){
      $('#currentTime').html(moment().format('hh:mm A'))
    }, 1000);
  }
  displayRealTime();
  // current time using moment method, converted to minutes
  currentTimeMnt= convertTimeToMinutesFn(moment());
  // console.log(currentTimeMnt);

  // currentTimeMnt = ((moment().hours())*60 + moment().minutes());
  //console.log(currentTimeMnt);

  function minutesLeftFn(firstTrainTime, frequencyMnt,currentTimeMnt) {

    var temp= convertTimeToMinutesFn(firstTrainTime);
  
  var timeDifference=currentTimeMnt - temp;
  alert(timeDifference + " "+temp+ " "+currentTimeMnt);
  // alert(timeDifference);
  var minutesLeft= timeDifference % frequencyMnt;
  return minutesLeft;
  };


// Convert next train to hours and minutes for train schedule display.
function convertnextArrivalMntToHoursMntFn(nextArrivalMnt) {
   nextArrivalHours = Math.floor(nextArrivalMnt / 60); 
  // Also figure out if time is AM or PM.
  if (nextArrivalHours > 12) {
    nextArrivalHours = nextArrivalHours - 12;
    ampm = "PM";
  } else {
    nextArrivalHours = nextArrivalHours;
    ampm = "AM";
  }
   nextArrivalMin = nextArrivalMnt % 60;
  if (nextArrivalHours < 10) {
    nextArrivalHours = "0" + nextArrivalHours;
  }
  if (nextArrivalMin < 10) {
    nextArrivalMin = "0" + nextArrivalMin;
  }
  nextArrival = nextArrivalHours + ":" + nextArrivalMin + " " + ampm;
  return nextArrival;
}



  //Capture Button Click
  $("#submit").on("click", function(event) {

    event.preventDefault();

    

    trainName= $("#trainName").val().trim();
    destination = $("#destination").val().trim();
    firstTrainTime = $("#firstTrainTime").val().trim();
    frequencyMnt= $("#frequency").val().trim();
    currentTimeMnt= convertTimeToMinutesFn(moment());
    minutesAway = (frequencyMnt - (minutesLeftFn(firstTrainTime, frequencyMnt, currentTimeMnt)))
    nextArrivalMnt = currentTimeMnt + minutesAway;
    nextArrival = convertnextArrivalMntToHoursMntFn(nextArrivalMnt);
    firstTrainTime=convertTimeToMinutesFn(firstTrainTime)// no need to display this item
    // trainCode = trainName.substr(0,3);

//Check that all fields are filled out.
if (trainName === "" || destination === "" || firstTrainTime === "" || frequencyMnt === ""){
  $("#notMilitaryTime").empty();
  $("#missingField").html("ALL fields are required to add a train to the schedule.");
  return false;		
}

//Check that all fields are filled out.
else if (trainName === null || destination === null || firstTrainTime === null || frequencyMnt === null){
  $("#notMilitaryTime").empty();
  $("#notNumber").empty();
  $("#missingField").html("ALL fields are required to add a train to the schedule.");
  return false;		
}
	// //Check that the user enters the first train time as military time.
	// else if (firstTrainTime.length !== 5) {
	// 	$("#missingField").empty();
	// 	$("#notNumber").empty();
	// 	$("#notMilitaryTime").html("Time must be in military format: HH:mm , like 2:00 PM");
	// 	return false;
  // }
//   	//Check that the user enters a number for the Frequency value.
// 	else if (isNaN(frequencyMnt)) {
//     $("#missingField").empty();
//     $("#notMilitaryTime").empty();
//     $("#notNumber").html("Not a number. Enter a number (in minutes).");
//     return false;
// }

//If form is valid, perform time calculations and add train to the current schedule.
else {

  $("#notMilitaryTime").empty();
  $("#missingField").empty();
  $("#notNumber").empty();

  if (firstTrainTime > currentTimeMnt){
    //Next train times is same as first train time
    alert("train has not started yet ");
    nextArrivalMnt = firstTrainTime;
    nextArrival = convertnextArrivalMntToHoursMntFn(nextArrivalMnt);
    minutesAway = firstTrainTime - currentTimeMnt;
  }

 
    // object to store user inputs 
    var itemsToPush={
    
    Name:trainName,
    Destination:destination,
    FirstTrainTime:firstTrainTime,// no need to display this item
    Frequency:frequencyMnt,
    NextArrival:nextArrival,
    MinutesAway:minutesAway,
    CurrentTime:moment().format("hh:mm A"),
    DateAdded:firebase.database.ServerValue.TIMESTAMP
  }

// pushe user  input to firebase.
  database.ref().push(itemsToPush);
  

  //clear form text boxes after push
  $("#trainName").val(" ");
  $("#destination").val(" ");
  $("#firstTrainTime").val(" ");
  $("#frequency").val(" ");

  return false;
  
}
  });

// var x = "";

database.ref().on("child_added", function(childSnapshot) {

// x = childSnapshot.key;
//console.log(childSnapshot.val());
$('#trainSchedule').append("<tr>" +
"<td>" + childSnapshot.key + "</td>" +
"<td>" + childSnapshot.val().Name + "</td>" +
"<td>" + childSnapshot.val().Destination + "</td>" +
"<td>" + childSnapshot.val().Frequency + "</td>" +
"<td>" + childSnapshot.val().NextArrival + "</td>" +
"<td>" + childSnapshot.val().MinutesAway + "</td>" +
//  "<td><button type='button' class='btn btn-danger'>Delete</button></td>"+
"</tr>");
},function(errorObject) {
console.log("Errors handled: " + errorObject.code);
});


// $('#trainSchedule').on('click', '.btn-danger', function(childSnapshot){
  
//   //var x=$(this).closest("childSnapshot.key")
//   //alert(x);
//   var keycode=$(this(childSnapshot.key));
//   database.ref().child(x).remove();
//   //  database.ref().remove;
//   //alert("here"+x);

// 	// get the current row
//   var currentRow=$(this).closest("tr"); 
//   currentRow.remove();
//   keycode.remove();


// });









// var childKey=0;
// var row;
// function delete_row() { 
//   alert(childKey)
//   alert("flag")
//   //var key = document.getElementById(row).row.childData;
//   //database.ref(childKey).remove();
//   database.child(childKey).remove();
//   alert("flag1")
//   alert('row was removed');
//   reload_page();
// }

// var tblUsers = document.getElementById("trainSchedule");
// // firebase reference
// var database = firebase.database().ref();
// var rowIndex = 0;

// database.once('value', function(snapshot) {
//   snapshot.forEach(function(childSnapshot) {
//      childKey = childSnapshot.key;
//     //childKey="test";
//       var childData = childSnapshot.val();
//       row = tblUsers.insertRow(rowIndex);
//       var cellId = row.insertCell(0);
//       var cellName = row.insertCell(1);
//       var celldest= row.insertCell(2);
//       var cellfreq= row.insertCell(3);
//       var cellnextarrival= row.insertCell(4);
//       var cellmntaway= row.insertCell(5);
//       var cellButtons = row.insertCell(6).outerHTML=
//       "<tr id='row"+rowIndex+"'><td><input type='button' class='btn btn-danger' value='Delete' class='delete' onclick='delete_row()'></td></tr>";                                   

//       cellId.appendChild(document.createTextNode(childKey));                                
//       cellName.appendChild(document.createTextNode(childData.Name)); 
//       celldest.appendChild(document.createTextNode(childData.Destination));
//       cellfreq.appendChild(document.createTextNode(childData.Frequency));
//       cellnextarrival.appendChild(document.createTextNode(childData.NextArrival)); 
//       cellmntaway.appendChild(document.createTextNode(childData.MinutesAway));

//       rowIndex = rowIndex + 1;                               
//   });
// });











//   // database.ref().on("value", function(snapshot) {

//   //   console.log(snapshot.val());
//   //   console.log(snapshot.val().name);
//   //   console.log(snapshot.val().role);
//   //   console.log(snapshot.val().date);
//   //   console.log(snapshot.val().rate);






  
