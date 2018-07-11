


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
  var frequencyMnt = 0;
  var firstTrainTime = 0;
  var trainTime =0;
  var currentTimeMnt = 0;
  var nextArrivalMnt = 0;
  var nextArrival = 0;
  var minutesAway = 0;
  var currentTime = 0;

// general function to convert hh:mm to minutes 
  function convertTimeToMinutesFn(time) {

    time = moment(time, "hh:mm");
    timeHours = time.hours();
    timeMin = time.minutes();
    // Calculation to add up the minutes.
    return (timeHours*60 + timeMin)
  }

  //Show and update current time. Use setInterval method to update time.... but I used analog clock dispaly.
    function displayRealTime() {
    setInterval(function(){
      $('#currentTime').html(moment().format('hh:mm A')+' )')
    }, 1000);
  }
  displayRealTime();
  

  function minutesLeftFn(firstTrainTime, frequencyMnt,currentTimeMnt) {
      var temp= convertTimeToMinutesFn(firstTrainTime);
      var timeDifference=currentTimeMnt - temp;
    // alert(timeDifference + " "+temp+ " "+currentTimeMnt);
      if (timeDifference < 0){
        nextArrival=temp;
        nextArrival= convertnextArrivalMntToHoursMntFn(nextArrival);
        minutesAway = temp - currentTimeMnt;
      }
      else{
       var minutesLeft= timeDifference % frequencyMnt;
      minutesAway = frequencyMnt - minutesLeft;
      nextArrivalMnt = currentTimeMnt + minutesAway
      nextArrival= convertnextArrivalMntToHoursMntFn(nextArrivalMnt);
      
      }
    };

  //incase train starts future time

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


//Check that all fields are filled out.
if (trainName === "" || destination === "" || firstTrainTime === "" || frequencyMnt === ""){
  $("#missingField").html("ALL fields are required to add a train to the schedule.");
  return false;		
}

//If form is valid, perform time calculations and add train to the current schedule.
else {

  $("#missingField").empty();

  currentTime=moment().format("hh:mm A");
  currentTimeMnt= convertTimeToMinutesFn(moment());
  minutesLeftFn(firstTrainTime, frequencyMnt, currentTimeMnt);

    var itemsToPush={
    
    Name:trainName,
    Destination:destination,
    FirstTrainTime:firstTrainTime,// no need to display this item
    Frequency:frequencyMnt,
    NextArrival:nextArrival,
    MinutesAway:minutesAway,
    CurrentTime:currentTime,
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

database.ref().on("child_added", function(childSnapshot) {


var tempname=childSnapshot.val().Name;
var tempdest=childSnapshot.val().Destination;
var tempfreq=childSnapshot.val().Frequency;
var temparrival=childSnapshot.val().NextArrival;
var tempmntaway=childSnapshot.val().MinutesAway;
var firsttraintime=childSnapshot.val().FirstTrainTime;
var currenttime=childSnapshot.val().CurrentTime;
var tempkey=childSnapshot.key;
// getKey.push(tempkey);s
// alert(getKey);

$('#trainSchedule').append("<tr>" +
"<td>" + tempname+ "</td>" +
"<td>" + tempdest+ "</td>" +
"<td>" + tempfreq+ "</td>" +
"<td>" + temparrival + "</td>" +
"<td>" + tempmntaway + "</td>" +
// "<td><button type='button' class='update' data-value='"+tempkey+"'class='btn btn-info'> Update</button></td>"+
"<td><img src='assets/images/if_basket_1814090.png' alt='deleteIcon' class='delete' data-value='"+tempkey+"'style='width:40px;height:40px'></td>"+

//  "<td><button type='button' class='btn btn-danger'>Delete</button></td>"+

"</tr>"
);
},function(errorObject) {
console.log("Errors handled: " + errorObject.code);
});


//Click event for trash can icon/button. When user clicks trash can to remove a train from the schedule...
$('body').on("click", ".delete", function(){
 	// Prevent form from submitting
	event.preventDefault();

	//confirm with the user before he or she decides to actually delete the train data.
	var confirmDelete = confirm("Are you sure you want to delete this train? Deleting a train removes it permanently from the firebase. This option can be disabled in the js to only remove from list and not from FB");
// alert(getKey);
	//If user confirms...s
	if (confirmDelete) {
    //this removes just table from display.
     $(this).closest('tr').remove();
		//this removes train info from db.
		var x = $(this).attr("data-value");
    database.ref().child(x).remove();
	}

	else {
		return false;
	}
});


// $(document).on("click",".update",function() {
//   var temp=$(this).closest('tr')
//   temp.attr("data-state", );
//   alert(z)
//   //  var y= $(this).closest('tr').text();
//   //  alert(y )
//   //  alert(y[0] + " "+y[1])

// //   dataState = $(this).attr("data-state") ;
// //  if (dataState === "true") { 
// //    $(this).attr('class','contenteditable="true"');
// //   //  $(this).attr("data-state", "animate") ;
// //  }

// //  if (dataState === "false") {
// //   $(this).attr('class','contenteditable="false"');
// //   //  $(this).attr('src',$(this).attr('data-still'));
// //   //  $(this).attr("data-state", "still") ;
// //   }

// });


























  
