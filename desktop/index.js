//***************************************************************************************
// HOUSE PLOT MAKE / DISPLAY FUNCTIONS **************************************************
// **************************************************************************************

// makeHousePlotDefault()
// @does: creates a default plot object 
// @ret:  a plot object of form plot.title, plot.avail, plot.x, plot.y, plot.data 
var makeHousePlotDefault = function() {
  return { 
    "title" : document.getElementById('housePlotTitle') ? document.getElementById('housePlotTitle').value : "house_plot",
    "avail" : Number(document.getElementById('makeHousePlotCount')),
    "x" : Number(document.getElementById("width").value), 
    "y" : Number(document.getElementById("height").value), 
    "data" : null
  };
};

// resetCount()
// @does: resets Total Seat Count Variable
var resetCount = function() {
  var count = document.getElementById('makeHousePlotCount');
    if (count) {
      count.innerHTML = Number(document.getElementById("width").value)*Number(document.getElementById("height").value);
    }
};

// TODO: (10) If time permits, add flow option
// makeHousePlot(displayID)
// @takes:
// || displayID => id of container that will be used for making the house plot
// @does: creates a modular sized house plot with the ability to save, and displays in all mode
var makeHousePlot = function(displayID) {
  var container = document.getElementById(displayID);
  var innards = '<div id="makeHouseController">';
  innards += 'Columns:<input type="number" name="width" id="width" onchange="displayHousePlot(\'housePlot\', makeHousePlotDefault(), \'all\'); resetCount();" value="10" min="1" required>';
  innards += 'Rows:<input type="number" name="height" id="height" onchange="displayHousePlot(\'housePlot\', makeHousePlotDefault(), \'all\'); resetCount();" value="5" min="1" required>';
  innards += 'Filename:<input type="text" id="housePlotTitle">'
  innards += '<button id="savePlot" type="button" onclick="saveHousePlot(\'housePlotTableBody\')">Save</button>'; //initiate save dialogue
  innards += '<span>Total: <span id="makeHousePlotCount">50</span></span>';
  innards += '</div>';
  innards += '<div id="housePlot"></div>';
  previous_src = container.innerHTML;
  container.innerHTML = innards;
  displayHousePlot("housePlot", makeHousePlotDefault(), "all");
  drawNavMenu(displayID);
};

// TODO: (5) Add docs for inc state, et al
// TODO: (4) Add support for other inc state modes
var incrementState = function(me, isClick, mode){
  if (mouseDown || isClick) {
    var i = Number(me.getAttribute("data-state"));
    me.setAttribute("data-state", (i+1)%2);
    var count = document.getElementById('makeHousePlotCount');
    if (count) {
      count.innerHTML = Number(count.innerHTML) + i - ((i+1)%2);
    }
  }
};

// saveHousePlot(displayID)
// @takes:
// || displayID => id of container that will be used for making the house plot
// @does: stores house plot in displayID to localstorage/a file named housePlotTitle.value
var saveHousePlot = function(displayID) {
  var container = document.getElementById(displayID);
  var tbody = container.children;
  var plot = makeHousePlotDefault();
  plot.data = [];
  for (var i = 1; i < tbody.length; ++i) {
    var innerChild = tbody[i].children;
    var row = [];
    for (var j = 1; j < innerChild.length; ++j) {
     row.push(innerChild[j].getAttribute('data-state'));
    }
    plot.data.push(row);
  }
  plot.avail = Number(document.getElementById('makeHousePlotCount'));
  var filename = document.getElementById('housePlotTitle').value;
  if (!filename || filename == '') filename = 'housePlot'; //in case it doesn't exist, don't want to go making assumptions
  if (fs) {
    fs.writeFile('./plots/' + filename + '.json', JSON.stringify(plot), {'flag':'w+'});
  }
  var tcktr = JSON.parse(localStorage.tcktr);
  tcktr.plots.push(plot);
  localStorage.tcktr = JSON.stringify(tcktr);
  console.log(plot.data);
}

// displayHousePlot(displayID)
// @takes:
// || displayID => id of container that will be used for making the house plot
// || plot      => object with .x, .y, .data objects inside
// || mode      => string mode of function (all, sold, unsold, reserved)
// @does: builds plot with mode in displayID
var displayHousePlot = function(displayID, plot, mode) {
  //TODO: (6) Write algo for infinite lettering (A->Z, AA->AZ->ZZ, AAA->AAZ->AZZ->ZZZ, etc)
  var alpha = " ABCDEFGHIJKLMNOPQRSTUVWXYZ"
  var container = document.getElementById(displayID);
  var innards = '<table id="housePlotTable">';
  innards += '<tbody id="housePlotTableBody">'; // all tables must have a tbody!
  if (mode == 'all') {
    for (var i = 0; i <= plot.y; ++i) {
      innards += '<tr>';
      for (var j = 0; j <= plot.x; ++j) { // display proper seat identification if not the 0th element
        innards += "<td id = '" + (i ? alpha[(plot.y-i+1)%26] : "")  + (j ? j : "") + "'"
        if (i != 0 && j != 0) {
          innards += " onclick='incrementState(this, true, \"all\");'";
          innards += " onmouseover='incrementState(this, false, \"all\");' data-state='0'";
        }
        innards += ">" + (i ? alpha[(plot.y-i+1)%26] : "")  + (j ? j : "") + "</td>";
      }
      innards += '</tr>';
    }
    innards += '</tbody></table>';
    container.innerHTML = innards;
  }
  // TODO: (4) Add other display modes for sales.
};

//***************************************************************************************
// SHOW OBJECT CREATION / CONFIG ********************************************************
// **************************************************************************************

var autocomplete;
function initialize() {
  // Create the autocomplete object, restricting the search
  // to geographical location types.
  autocomplete = new google.maps.places.Autocomplete(
      /** @type {HTMLInputElement} */(document.getElementById('autocomplete')),
      { types: ['geocode'] });
  // When the user selects an address from the dropdown,
  // populate the address fields in the form.
  google.maps.event.addListener(autocomplete, 'place_changed', function() {
    fillInAddress();
  });
}

function fillInAddress() {
  // Get the place details from the autocomplete object.
  var place = autocomplete.getPlace();

  for (var component in componentForm) {
    document.getElementById(component).value = '';
    document.getElementById(component).disabled = false;
  }

  // Get each component of the address from the place details
  // and fill the corresponding field on the form.
  for (var i = 0; i < place.address_components.length; i++) {
    var addressType = place.address_components[i].types[0];
    if (componentForm[addressType]) {
      var val = place.address_components[i][componentForm[addressType]];
      document.getElementById(addressType).value = val;
    }
  }
};

// TODO: (5) Docs for togglePlots
var togglePlots = function() {
  var checkbox = document.getElementById("makeShowFormAssigned");
  var plots = document.getElementById("plotsBox");
  if(checkbox.checked) {
    plots.style.display = 'inline';
  }else {
    plots.style.display = 'none';
  }
};

// TODO: (5) Docs for addTicket()
var addTicket = function() {
  var loc = document.getElementById('makeShowFormTicketList');
  var id = loc.children.length;
  var growth = "<div class='ticketType' id='ticketType" + id + "'>";
  growth += "<label for='ticketText'><span>Ticket Name:</span>";
  growth += "<input type='text' id='ticketText'></label>";
  growth += "<label for='ticketPrice'><span>Ticket Price:</span>";
  growth += "<input type='text' id='ticketPrice'></label>";
  growth += "<label for='ticketAttributes'><span>Ticket Attributes:</span>";
  growth += "<input type='text' id='ticketAttributes'></label>";
  growth += "<button class='remove' type='button' onclick='removeNode(\"ticketType" + id + "\");'>Remove</button>";  
  growth += "</div>";
  loc.innerHTML += growth;
};

// TODO: (5) Docs for addPerformance()
var addPerformance = function() {
  var loc = document.getElementById('makeShowFormPerformanceList');
  var id = loc.children.length;
  var growth = "<div class='performanceType' id='performance" + id + "'>";
  growth += "<label for='datepicker'><span>Performance Date / Time:</span>";
  growth += "<input type='text' id='datepicker'></label>";
  growth += "<label for='performanceAttributes'><span>Performance Attributes:</span>";
  growth += "<input type='text' id='performanceAttributes'></label>";
  growth += "<button class='remove' type='button' onclick='removeNode(\"performance" + id + "\");'>Remove</button>";  
  growth += "</div>";
  loc.innerHTML += growth;
  $('#datepicker').datetimepicker({});
};

// TODO: (5) docs for remove
var removeNode = function(id) {
  document.getElementById(id).style.display = 'none';
};

var getPlot = function() {
  if (document.getElementById('makeShowFormPlot')) {
    var name = document.getElementById('makeShowFormPlot').value;
    var plots = JSON.parse(localStorage.tcktr).plots;
    for (var i = 0; i < plots.length; ++i) {
      if (name == plots[i].title) {
        return name;
      }
    }
  }
  return null;
}
// TODO: (5) Save Docs
var saveShow = function() {
  var show = {
    "title" : document.getElementById("makeShowFormTitle").value,
    "assigned" : document.getElementById("makeShowFormAssigned").checked,
    "plot" : document.getElementById("makeShowFormAssigned").checked ? getPlot() : null,
    "company" : document.getElementById("makeShowFormCompany").value,
    "venue" : document.getElementById("makeShowFormVenueName").value,
    "venue_loc" : document.getElementById("autocomplete").value,
    "tickets" : [],
    "performances" : []
  };
  var ticketList = document.getElementById('makeShowFormTicketList').children;
  for (var i = 0; i < ticketList.length; ++i) {
    // TODO: (3) don't add empty ticket/prefs
    if (ticketList[i].style.display != 'none') {
      show.tickets.push({
        "title" : ticketList[i].querySelector('#ticketText').value,
        "price" : ticketList[i].querySelector('#ticketPrice').value,
        "attributes" : ticketList[i].querySelector('#ticketAttributes').value
      });
    }
  }
  var performanceList = document.getElementById('makeShowFormPerformanceList').children;
  for (var i = 0; i < performanceList.length; ++i) {
    if (performanceList[i].style.display != 'none') {
      show.performances.push({
        "title" : performanceList[i].querySelector('#datepicker').value,
        "date" : performanceList[i].querySelector('#datepicker').value,
        "attributes" : performanceList[i].querySelector('#performanceAttributes').value,
        "log" : ""
      });
    }
  }
  var tcktr = JSON.parse(localStorage.tcktr);
  tcktr.plots.push(show);
  localStorage.tcktr = JSON.stringify(tcktr);
};

// TODO: (5) Make Show Docs
var makeShow = function(displayID) {
  var container = document.getElementById(displayID);
  var innards = "<div id='makeShowForm'><h1>Add Show<span>Please fill out all of the following form fields.</span></h1>";
  innards += "<label for='makeShowFormTitle'><span>Title:</span>";
  innards += "<input type='text' id='makeShowFormTitle'></label>";

  innards += "<label for='makeShowFormAssigned'><span>Assigned Seating</span><input type='checkbox' id='makeShowFormAssigned' onClick='togglePlots();'></label>"
  innards += "<span id='plotsBox' style='display:none;'><label for='makeShowFormPlot'><span>Plot:</span>";
  innards += "<input type='text' id='makeShowFormPlot' list='plots'>";
  innards += "<datalist id='plots'>";
  var plots = JSON.parse(localStorage.tcktr).plots;
  for (var i = 0; i < plots.length; ++i) {
    innards += "<option value='" + plots[i].title + "'>"
  }
  innards += "</datalist></label></span>"
  // Show Company
  innards += "<label for='makeShowFormCompany'><span>Company:</span>";
  innards += "<input type='text' id='makeShowFormCompany'></label>";
  // Show Venue Name
  innards += "<label for='makeShowFormVenueName'><span>Venue Name:</span>";
  innards += "<input type='text' id='makeShowFormVenueName'></label>";

  // Venue Location with Google Maps AutoComplete
  innards += "<label for='autocomplete'><span>Venue Location:</span>";
  innards += "<input id='autocomplete' placeholder='Enter your address' type='text'></input></label>";

  // Select Ticket Type Menu
  innards += "<div id='makeShowFormTicketBox'>";
  innards += "<div id='makeShowFormTicketList'>";
  innards += "</div>";
  innards += "<button type='button' onclick='addTicket();')>Add Ticket Type</button>"; //initiate save dialogue
  innards += "</div>";

  innards += "<div id='makeShowFormPerformanceBox'>";
  innards += "<div id='makeShowFormPerformanceList'>";
  innards += "</div>";
  innards += "<button type='button' onclick='addPerformance();')>Add Performance Date</button>"; //initiate save dialogue
  innards += "</div>";

  innards += "<button id='save' type='button' onclick='saveShow();')>Save</button>"; //initiate save dialogue
  innards += "</div>";
  drawNavMenu(displayID);
  previous_src = container.innerHTML;
  container.innerHTML = innards;
  initialize(); //init google map lookup
  addTicket();
  addPerformance();
};

//***************************************************************************************
// BOX OFFICE DISPLAY / PRINT / OPERATION ***********************************************
// **************************************************************************************

// TODO: (3) Open Box Function / sell mode
var openBoxoffice = function(displayID) {
  var container = document.getElementById(displayID);

  // TODO: (1) Transaction complete / log
  // TODO: (1) Seat select, etc
}
// TODO: (4) Add print ticket function
// TODO: (4) Add print receipt function
/*

  <div class="fixed-action-btn" style="bottom: 45px; right: 24px;">
    <a class="btn-floating btn-large black">
      <i class="large mdi-content-undo"></i>
    </a>
    <ul>
      <li><a class="btn-floating red"><i class="large mdi-editor-insert-chart"></i></a></li>
      <li><a class="btn-floating yellow darken-1"><i class="large mdi-editor-format-quote"></i></a></li>
      <li><a class="btn-floating green"><i class="large mdi-editor-publish"></i></a></li>
      <li><a class="btn-floating blue"><i class="large mdi-editor-attach-file"></i></a></li>
    </ul>
  </div>
*/
//***************************************************************************************
// MAIN MENU DISPLAY / CREATION *********************************************************
// **************************************************************************************

var goBackInTime = function(displayID) {
  var current_src = document.getElementById(displayID).innerHTML;
  document.getElementById(displayID).innerHTML = previous_src;
  previous_src = current_src;
}

var drawNavMenu = function(displayID) {
  innards = '';
  if (previous_src) {
    var innards = '<div class="fixed-action-btn" style="bottom: 45px; right: 24px;" id="floatingInSpace">';
    innards += '<a class="btn-floating btn-large black" onclick="' 
    innards += 'goBackInTime(\''+ displayID + '\');">';
    innards += 'Back</a>'
    // TODO: (2) Add navigation bar stuffs :)
    // innards += '<li><a class="btn-floating red"><i class="large mdi-editor-insert-chart"></i></a></li><li><a class="btn-floating yellow darken-1"><i class="large mdi-editor-format-quote"></i></a></li><li><a class="btn-floating green"><i class="large mdi-editor-publish"></i></a></li><li><a class="btn-floating blue"><i class="large mdi-editor-attach-file"></i></a></li>';
    innards += '</div>'
  }
  document.getElementById('nav').innerHTML = innards;
}

var makeMenu = function(displayID) {
  var container = document.getElementById(displayID);
  var innards = "<ul id='mainMenu'><div class='header'><h1>tcktr</h1><p>Behind the Scenes</p></div>";
  var links = [
    { "t" : "Make House Plot", "o" : "makeHousePlot('" + displayID + "');"},
    { "t" : "Make Show", "o" : "makeShow('" + displayID + "');"},
    { "t" : "Manage Plots", "o" : "makeHousePlot('" + displayID + "');"},
    { "t" : "Manage Shows", "o" : "makeHousePlot('" + displayID + "');"},
    { "t" : "Open Boxoffice", "o" : "openBoxoffice('" + displayID + "');"},
    { "t" : "Settings", "o" : "makeHousePlot('" + displayID + "');"}
  ];
  for (var i = 0; i < links.length; ++i) {
    innards += '<li><a href="#" onclick="' + links[i].o + '">' + links[i].t + '</a></li>';
  }
  innards += "</ul>";

  drawNavMenu(displayID);
  previous_src = container.innerHTML;
  container.innerHTML = innards;
}

// TODO: (5) var docs
var previous_src = null;

var mouseDown = 0;
var fs = null;
var nw = true;
// TODO: (5) onload docs
window.onload = function() {
  // track mouse state
  document.body.onmousedown = function() {
    mouseDown = 1;
  }
  document.body.onmouseup = function() {
    mouseDown = 0;
  }
  // determine browser set and set fs
  try {
  // running in node-webkit
    fs = require('fs');
  } catch(e) {
    // running in regular browser
    nw = false;
    console.log('Not in kansas anymore...');
  }
  if (!localStorage.tcktr) {
    localStorage.tcktr = JSON.stringify({
      "plots" : [],
      "shows" : [],
      "tickets" : []
    });
  }
  makeMenu("main"); // build menu :)
};