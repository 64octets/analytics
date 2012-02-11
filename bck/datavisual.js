// Load the Google data JavaScript client library.
google.load('gdata', '2.x', {packages: ['analytics']});

 // Load the Visualization API and the piechart package.
      google.load('visualization', '1.0', {'packages':['corechart','table']});

// Set the callback function when the library is ready.
google.setOnLoadCallback(init);

// Set a callback to run when the Google Visualization API is loaded.
var accountTable;
var accountData;
var pagePathsEncoded;
var ppArray = new Array(); 

/**
 * This is called once the Google Data JavaScript library has been loaded.
 * It creates a new AnalyticsService object, adds a click handler to the
 * authentication button and updates the button text depending on the status.
 */
function init() {
  myService = new google.gdata.analytics.AnalyticsService('gaExportAPI_acctSample_v2.0');
  scope = 'https://www.google.com/analytics/feeds';
  var button = document.getElementById('authButton');

  // Add a click handler to the Authentication button.
  button.onclick = function() {
    // Test if the user is not authenticated.
    if (!google.accounts.user.checkLogin(scope)) {
      // Authenticate the user.
      google.accounts.user.login(scope); 
    } else {
      // Log the user out.
      google.accounts.user.logout();
      getStatus();
    }
  }
  getStatus();
}

/**
 * Utility method to display the user controls if the user is 
 * logged in. If user is logged in, get Account data and
 * get Report Data buttons are displayed.
 */
function getStatus() {
  var getDataButton = document.getElementById('getData');
  getDataButton.onclick = getDataFeed;

  var dataControls = document.getElementById('dataControls');
  var loginButton = document.getElementById('authButton');
  if (!google.accounts.user.checkLogin(scope)) {
    dataControls.style.display = 'none';   // hide control div
    loginButton.innerHTML = 'Access Google Analytics';
  } else {
    dataControls.style.display = 'block';  // show control div
    loginButton.innerHTML = 'Logout';
	getAccountFeed();
  }
}

 
/**
 * Main method to get account data from the API.
 */
function getAccountFeed() {
  var myFeedUri =
      'https://www.google.com/analytics/feeds/accounts/default?max-results=50';
  myService.getAccountFeed(myFeedUri, handleAccountFeed, handleError);
}

/**
 * Handle the account data returned by the Export API by constructing the inner parts
 * of an HTML table and inserting into the HTML file.
 * @param {object} result Parameter passed back from the feed handler.
 */
function handleAccountFeed(result) {
  // An array of analytics feed entries.
  var entries = result.feed.getEntries();

  // Create an DATA Table using an array of elements.	
	accountData = new google.visualization.DataTable();
		accountData.addColumn('string', 'Account Name');
		accountData.addColumn('string', 'Profile Name');
		accountData.addColumn('string', 'Profile ID');
		accountData.addColumn('string', 'Table Id');

  // Iterate through the feed entries and add the data as table rows.
	for (var i = 0, entry; entry = entries[i]; ++i) {

	//Build Data for Row 
	   tmpAccountName = entry.getPropertyValue('ga:AccountName');
	   tmpProfileName = entry.getTitle().getText();
	   tmpProfileId = entry.getPropertyValue('ga:ProfileId');
	   tmpTableId = entry.getTableId().getValue();

	// Add a row in the Visualisation Table
	accountData.addRows([
	   [tmpAccountName, tmpProfileName, tmpProfileId, tmpTableId]
	 ]);
	}
	
	createAccountTable(accountData);
}

// Output Account Table
function createAccountTable(accountData)	 {

  accountTable = new google.visualization.Table(document.getElementById('output_div'));
  accountTable.draw(accountData, { width: 575}); //Output Table
  
  google.visualization.events.addListener(accountTable, 'select', selectAccount);
}


function selectAccount(){
	  var selection = accountTable.getSelection();
	  var item = selection;
      for (var i = 0; i < selection.length; i++) {
        var item = selection[i];
          var str = accountData.getFormattedValue(item.row, 3);
        }

		$('#tableId').val(str);

}
 



/**
 * Main method to get report data from the Export API.
 */
function getDataFeed() {
var myFeedUri = 'https://www.google.com/analytics/feeds/data' +
    '?start-date=2009-04-01' +
    '&end-date=2009-04-05' +
    '&dimensions=ga:pagePath' +
    '&metrics=ga:pageviews,ga:uniquePageviews,ga:avgTimeOnPage,ga:bounces,ga:visitBounceRate' +
    '&sort=-ga:pageviews' +
    '&max-results=10' +
    '&ids=' + document.getElementById('tableId').value;
  
  myService.getDataFeed(myFeedUri, handleDataFeed, handleError);



}
function getLineDataFeed(pagePathEncoded) {
  var myFeedUril = 'https://www.google.com/analytics/feeds/data' +
	
	'?ids=ga%3A7079672' +
	'&dimensions=ga%3Adate%2Cga%3ApagePath' +
	'&metrics=ga%3AuniquePageviews' +
	'&filters=ga%3ApagePath%3D%3D' + pagePathEncoded +
	'&start-date=2009-04-01' +
	'&end-date=2011-04-05' +
	'&max-results=50'
		
	myService.getDataFeed(myFeedUril, handleLineFeed, handleError);
}

/**
 * Handle the data returned by the Export API by constructing the 
 * inner parts of an HTML table and inserting into the HTML File.
 * @param {object} result Parameter passed back from the feed handler.
 */
function handleDataFeed(result) {
 
 // An array of Analytics feed entries
 var entries = result.feed.getEntries();
 
 //Print Table Headers
 var data = new google.visualization.DataTable();
  data.addColumn('string', 'Page Path');
  data.addColumn('number', 'Page Views');
  data.addColumn('number', 'Unique Page Views');
  data.addColumn('number', 'Avg Time on Page');
  data.addColumn('number', 'Bounces');
  data.addColumn('number', 'Bounce Rate');
  
  var pagePaths = "";
  

  // Iterate through the feed entries and add the data as table rows.
	for (var i = 0, entry; entry = entries[i]; ++i) {

	//Build Data for Row 
	   tmppagepath = entry.getValueOf('ga:pagePath');
	   tmppageviews = entry.getValueOf('ga:pageviews');
	   tmpuniqueviews = entry.getValueOf('ga:uniquePageviews');
	   tmpavgtime = entry.getValueOf('ga:avgTimeOnPage');
	   tmpbounces = entry.getValueOf('ga:bounces');
	   tmpbouncerate = entry.getValueOf('ga:visitBounceRate');

	// Add a row in the Visualisation Table
	data.addRows([
	   [tmppagepath, tmppageviews, tmpuniqueviews, tmpavgtime, tmpbounces, tmpbouncerate]
	 ]);
	
	//build page path query string
	ppArray[i] = tmppagepath;
	 
	}
	
	pagePaths = ppArray.join(',ga:pagePath==');
		pagePathsEncoded = encodeURIComponent(pagePaths);
			getLineDataFeed(pagePathsEncoded);
			
			
	
//Push Data to Visualisations

 $(document).ready( function() {   
	$("#pie-button").click(function(){
		createPieChart(data);

	});
	$("#table-button").click(function(){
		createTable(data);
		
	});

});	
  
  
 }

 
 
 
 /**
 * Handle the data returned by the Export API by constructing the 
 * inner parts of an HTML table and inserting into the HTML File.
 * @param {object} result Parameter passed back from the feed handler.
 */
function handleLineFeed(result) {
 
 // An array of Analytics feed entries
 var entries = result.feed.getEntries();
 
 //Print Table Headers
 var lineData = new google.visualization.DataTable();
  lineData.addColumn('date', 'Date');
  lineData.addColumn('string', 'Page Path');
  lineData.addColumn('number', 'Unique Page Views');

  // Iterate through the feed entries and add the data as table rows.
	for (var i = 0, entry; entry = entries[i]; ++i) {

	//Build Data for Row 
	   tmpdate = entry.getValueOf('ga:date');
	   tmppagepath = entry.getValueOf('ga:pagePath');
	   tmpuniqueviews = entry.getValueOf('ga:uniquePageviews');
	   tmpdate = this.getDateObj(tmpdate);
	// Add a row in the Visualisation Table
	lineData.addRows([
	   [tmpdate, tmppagepath, tmpuniqueviews]
	 ]);
	}

//Push Data to Visualisations
$(document).ready( function() { 
	$("#line-graph-button").click(function(){
		createLineTable(lineData);
		drawVisualization(lineData);
	});
});	
 
}

function getDateObj(tmpdate) {
  var date = new Date();
  var year = parseInt(tmpdate.substring(0, 4), 10);
  var month = parseInt(tmpdate.substring(4, 6), 10) - 1;
  var day = parseInt(tmpdate.substring(6, 8), 10);
  date.setFullYear(year);
  date.setMonth(month, day);
  return date;
}
 

/**
 * Alert any errors that come from the API request.
 * @param {object} e The error object returned by the Analytics API.
 */
function handleError(e) {
  var error = 'There was an error!\n';
  if (e.cause) {
    error += e.cause.status;
  } else {
    error.message;
  }
  alert(error);
}


	//Pie Chart TIME!!!!!!!!!!!!!
function createPieChart(data)	 {
		$('.visualisation-output').hide();
		$('#pie_div').fadeIn(300);
		
		var pieDataView = new google.visualization.DataView(data);
		pieDataView.setColumns([0, 2]);
		
		var pieOptions = {
		  width: 575,
		  height: 460,
		  colors: ['#e0440e'],
		  //fontName: 'sans-serif',
		  chartArea: {left:110,top:20,width:"100%",height:"85%"},
		  legend: {position: 'none'},
		  fontSize: 11,
		  backgroundColor: '#eee',
		  vAxis: {title: "Pages", textStyle: {color:'#888888'}}, 
		 
          hAxis: {title: "Unique Views"}
		};
		
		 new google.visualization.BarChart(document.getElementById('pie_div')).
		draw(pieDataView, pieOptions);
		$('#controls').find('a').removeClass();
		$('#pie-button').addClass('pie-button-active');

}



function createTable(data)	 {
	$('.visualisation-output').hide();
	$('#table_div').fadeIn(300);
  var table = new google.visualization.Table(document.getElementById('table_div'));
  
  var formatter = new google.visualization.NumberFormat(
      {fractionDigits: 2, suffix: "%"});
  formatter.format(data, 5); // Apply formatter to fifth column
  
   var formatterDecimal = new google.visualization.NumberFormat(
      {fractionDigits: 2});
  formatterDecimal.format(data, 3);
  
  table.draw(data, {showRowNumber: true, width: 575, height: 460, sort: 'disable'}); //Output Table
    var title = "/";
	$('.google-visualization-table-td:contains(' + title +')').css('width', '180px'); 
	$('#controls').find('a').removeClass();
	$('#table-button').addClass('table-button-active');

	
}



function createLineTable(lineData)	 {
	$('.visualisation-output').hide();
	$('#table_div').fadeIn(300);
	  var table = new google.visualization.Table(document.getElementById('table_div'));
	  
	  var formatter_short = new google.visualization.DateFormat({formatType: 'short'});
	  formatter_short.format(lineData, 0); 
	  
	  table.draw(lineData, {showRowNumber: true, width: 575, page: 'enable', pageSize: 10}); //Output Table
		$('#controls').find('a').removeClass();
		$('#line-graph-button').addClass('line-graph-button-active');
	
	
}

	
function drawVisualization(lineData) {
  // To see the data that this visualization uses, browse to
  // http://spreadsheets.google.com/ccc?key=pCQbetd-CptGXxxQIG7VFIQ  
 
  $('#line_div').fadeIn(300);
  
		
		ppArrayEntries = ppArray.length;
		ppArraySorted = ppArray.sort();
		
		var lineDataView = new google.visualization.DataTable(lineData);
		lineDataView.addColumn('date', 'Date');
		lineDataView.addRows(5);
		
		for (var i = 0; i < ppArrayEntries; i++) {
			singlePage = ppArraySorted[i];
				lineDataView.addColumn('number', singlePage);
		
		}
		
		days = 5;
		results = 10;
		for (var i = 0; i < days; i++) {
			date = lineData.getValue(i * results, 0);		
			console.log(date);
			console.log(date + "&" + i);
			lineDataView.setCell(i, 0, date);
			offset = i * results;
			
			for (var id = 0; id < results; id++) {
				views = lineData.getValue(offset + id, 2);
				console.log(views + " & " + id);
				lineDataView.setCell(i, id + 1, views);
			
			}

		}

		var options = {
			width: 575,
			height: 460,
			backgroundColor: '#EEE',
			chartArea: {left:20,top:20,width:"95%",height:"85%"},	
			fontSize: 11,
			legend: {position: 'bottom', textStyle: {color:'#888888'}},
			vAxis: {title: "Views", textStyle: {color:'#888888'}, titleTextStyle: {color: 'black'}}, 	
			hAxis: {title: "Date", textStyle: {color:'#888888'}, titleTextStyle: {color: 'black'}}			
		};
		
		var lineDataViewAreaChart = new google.visualization.LineChart(document.getElementById('line_div'));
        lineDataViewAreaChart.draw(lineDataView, options);
		
}











 function controlSubmit() {
	console.log('success');
	var fromDate = $('#from-date').val();
	var toDate = $('#to-date').val();
	var numberResults = $('#number-results').val();
	console.log(toDate);
	console.log(fromDate);
	console.log(numberResults);
} 
 
 

