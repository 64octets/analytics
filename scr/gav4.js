
google.load('visualization', '1.0', {'packages':['corechart','table']});
/**====================	
	NAMESPACE VARIABLES	
		====================**/	
/*	var accountTable;
	var accountData;
	var accountID;
	var pagePathsEncoded;
	var ppArray = new Array();
*/	
	// Config Data 
	var config = {
		"clientId": '490432827276.apps.googleusercontent.com',
		"scopes": 'https://www.googleapis.com/auth/analytics.readonly',
		"accessToken": '',
		"tableId": 'ga:7079672'
	};
	
	// Analytics Feed Query with default values
	var dataFeedQuery = {
		"startDate": "2009-04-01",
		"endDate": "2009-04-05",
		"dimensions": "ga:pagePath",
		"metrics": "ga:pageviews,ga:uniquePageviews,ga:avgTimeOnPage,ga:bounces,ga:visitBounceRate",
		"sort": "-ga:pageviews",
		"maxResults": "10"	
	};
	
	// Most Viewed Report Query
	var mostViewedQuery = {
		"dimensions": "ga:pagePath",
		"metrics": "ga:pageviews,ga:uniquePageviews,ga:avgTimeOnPage,ga:bounces,ga:visitBounceRate",
		"sort": "-ga:pageviews"	
	};
	
	// Traffic Source Query
	var trafficSourceQuery = {
		"dimensions": "ga:source",
		"metrics": "ga:visitors,ga:percentNewVisits,ga:avgTimeOnSite,ga:bounces,ga:visitBounceRate",
		"sort": "-ga:visitors"	
	};
	
	// Organic Search Terms
	var searchTermQuery = {
		"dimensions": "ga:keyword",
		"metrics": "ga:visitors,ga:percentNewVisits,ga:avgTimeOnSite,ga:bounces,ga:visitBounceRate",
		"sort": "-ga:visitors"	
	};
	


/**====================	
	OAUTH 2.0 AUTHENTICATION
		====================*/	

    // On callback from client.js execute  
	function handleClientLoad() {
		window.setTimeout(checkAuth,1);
	}
	
	// Check if logged into Google
	function checkAuth() {
		gapi.auth.authorize({client_id: config.clientId, scope: config.scopes, immediate: true}, handleAuthResult);
	}


	function handleAuthResult(authResult) {
		var authorizeButton = document.getElementById('authButton');
		if (authResult) {
			authorizeButton.innerHTML = 'Logout';
			$('#authButton').attr("href", "https://www.google.com/accounts/Logout");
			var retObj = gapi.auth.getToken();
			config.accessToken = retObj.access_token;
			console.log(config);			
			getDataFeed(dataFeedQuery);
		} else {
			authorizeButton.innerHTML = 'Login'
			authorizeButton.onclick = handleAuthClick;
		}
	}

	function handleAuthClick(event) {
		gapi.auth.authorize({client_id: config.clientId, scope: config.scopes, immediate: false}, handleAuthResult);
		return false;
	}

	
/**=========== 
	UI INTERACTIONS 
	=================*/
	$(document).ready(function(){
		
		// Get link clicked in left nav
		$('#nav > ul > li').click(function() {
			// slice "nav-" off id
			var currentReport = $(this).attr('id').slice(4);
			// Send ID to selectReport
			selectReport(currentReport);		
		});
		
		// Form Submission Event
		$('#submit-form').click(function() {
			console.log('success');
			var fromDate = $('#from-date').val();
			var toDate = $('#to-date').val();
			var numberResults = $('#number-results').val();
			console.log(toDate);
			console.log(fromDate);
			console.log(numberResults);
		}); 
		
		// Method Selection Event
		$('#controls > ul > li > a').click(function() {
			var currentMethod = $(this).attr('id');
			if(currentMethod === "table-button") {console.log(currentMethod);}
			if(currentMethod === "pie-button") {console.log(currentMethod);}
			if(currentMethod === "line-graph-button") {console.log(currentMethod);}	
		});
		
		// Turn Loading State on
		function loadingStateOn() {
			$('#faux-wrap').animate({opacity: '0.3'},{duration: 500});
			$('#loading-state').fadeIn(300);
		}
		
		// Turn loading state off
		function loadingStateOff() {
			$('#loading-state').fadeOut(300);
			$('#faux-wrap').animate({opacity: '1'},{duration: 500});
		}
		
		// Add Data Picker
		$(function() {
			$( "#from-date, #to-date" ).datepicker({dateFormat: 'yy-mm-dd' });
		});		

		// Set Namespace accountID variable
		$('#confirm-acc-id').click(function() {
			accountID = $('#tableId').val();
		});
			
	});	
	
	
/**======================
	Select Report and Submit Query
		=============================**/
 /* Select report depending on nav id, merge report query with main
 *  query method and submit to getDataFeed
 */	
	function selectReport(currentReport) {
		
		if(currentReport === "most-viewed") {
			$.extend(dataFeedQuery, mostViewedQuery);
			getDataFeed(dataFeedQuery);				
		}
		else if(currentReport === "traffic-sources") {
			$.extend(dataFeedQuery, trafficSourceQuery);
			getDataFeed(dataFeedQuery);
		}
		else if(currentReport === "search-terms") {
			$.extend(dataFeedQuery, searchTermQuery);
			getDataFeed(dataFeedQuery);
		}
		else if(currentReport === "internal-search") {
			//$.extend(dataFeedQuery, trafficSourceQuery);
			//console.log(dataFeedQuery);
		}
		else if(currentReport === "conversions") {
			//$.extend(dataFeedQuery, trafficSourceQuery);
			//console.log(dataFeedQuery);			
		}
		else if(currentReport === "dashboard") {
			//$.extend(dataFeedQuery, trafficSourceQuery);
			//console.log(dataFeedQuery);			
		}
		else if(currentReport === "exit-pages") {
			//$.extend(dataFeedQuery, trafficSourceQuery);
			//console.log(dataFeedQuery);
		} else {
		alert('error - report not found');
		}
	}
	
/**==================
	MAIN METHOD - Export API REPORT
		==========================*/	
	
	
	// Load the API and make an API call.  Display the results on the screen.
	function getDataFeed(data) {	  
		var restRequest = gapi.client.request({
			'path': '/analytics/v3/data/ga',
			'params': {
			'access_token': config.accessToken,
			'ids': config.tableId,
			'start-date': dataFeedQuery.startDate,
			'end-date' : dataFeedQuery.endDate,
			'metrics': dataFeedQuery.metrics,
			'dimensions': dataFeedQuery.dimensions,
			'sort': dataFeedQuery.sort,
			'max-results': dataFeedQuery.maxResults 	
			}
		});
		restRequest.execute(function(response) {
			//console.log(response); 
			handleDataFeed(response); 
		});
	}	  
	  
/**==================
	MAIN METHOD - Handle Data Feed
		==========================*/	

	function handleDataFeed(response) {
		// Setup Data Feed Table
		var dataFeedTable = new google.visualization.DataTable();
		
		//Print Table Headers
		var columnTypeArray = [];
		var columnCount = response.columnHeaders.length; 
		var columnTypeTime = [];
		var columnTypePercent = new Array();
		for (var i = 0; i < columnCount; i++){
			var tmpColumn = response.columnHeaders[i].name;
			var tmpType = response.columnHeaders[i].dataType;
			dataFeedTable.addColumn(columnType(tmpType, i), columnName(tmpColumn));
			columnTypeArray[i] = tmpType;
		}
		
		// Function to return column title
		function columnName(tmpColumn) {
			var tmpColumn = tmpColumn.slice(3);
			// Preceed Uppercase (or sets of) with commas then remove any
			var Delimted = tmpColumn.replace(/([A-Z]+)/g, ",$1").replace(/^,/, "");
			// Split the string on commas and return the array
			Delimted = Delimted.split(",");
			return Delimted.join(" ");    
		}

		// Function to return column type

		function columnType(tmpType, columnId) {
		//var columnTypeTime = [];
		//var columnTypePercent = new Array();
			if (tmpType === "STRING"){
				tmpType = "string";
			}
			else if (tmpType === "INTEGER"){
				tmpType = "number";
				//console.log(tmpType);
			} 
			else if (tmpType === "TIME"){
				if (typeof columnTypeTime === 'undefined'){
					//console.log(columnTypePercent);
					columnTypeTime[0] = columnId;
				} else {
					//console.log(columnTypePercent);
					columnTypeTime.push(columnId);
				}
				//xxcolumnTypeTime.push(columnId);
				tmpType = "string";
				//console.log(tmpType);
			} 
			else if (tmpType === "PERCENT"){
				if (typeof columnTypePercent === 'undefined'){
					//console.log(columnTypePercent);
					columnTypePercent[0] = columnId;
				} else {
					//console.log(columnTypePercent);
					columnTypePercent.push(columnId);
				}
				tmpType = "number";
				//console.log(tmpType);
			} else {
				alert('data type not recognised' + tmpType);
			}
			console.log(columnTypeTime);
			return(tmpType);
			
		}

/*		function decimalTime(decimal) {
			minutes = Math.floor(decimal / 60);
			minutes = minutes.toString();
			minutes = '0' + minutes;
			minutes = minutes.slice(-2);
				console.log(minutes);	
			seconds = Math.round(decimal % 60);
			seconds = seconds.toString();
			seconds = '0' + seconds;
			seconds = seconds.slice(-2);
				console.log(seconds);	
			tmpTime = ['00', minutes, seconds];
			time = tmpTime.join(':');
			return (time);		
		}
		
*/
	function decimalTime(secs)
	{
	    var hours = Math.floor(secs / (60 * 60));
	   
	    var divisor_for_minutes = secs % (60 * 60);
	    var minutes = Math.floor(divisor_for_minutes / 60);
	 
	    var divisor_for_seconds = divisor_for_minutes % 60;
	    var seconds = Math.ceil(divisor_for_seconds);
	   
		var obj = [hours, minutes, seconds]
		console.log(obj);
		//var time = obj.join(":");
		for (var i = 0; i < obj.length; i++){
			if (obj[i] = 0 ) {
				obj[i] = "0" + toString(obj[i]);
			} else {
				obj[i] = obj[i];
			}
		}
		obj = obj.join(":");
		console.log(obj);
		return (obj);
	   
	}
		
		// Add row data
		var rowCount = response.rows.length;
		for(var i = 0; i < rowCount; i++ ) {
			var	row = response.rows[i];

			
			for(var ii = 0; ii < row.length; ii++) {
			var timeType = columnTypeTime;
			console.log(timeType);
				if (isNaN(row[ii])) {
					row[ii] = row[ii];
				}
				else if (ii == timeType) {
					console.log("r");
					row[ii] = decimalTime(row[ii]);
				} else {
					row[ii] = parseFloat(row[ii]);	
				}
			}
			
			console.log(row);
			dataFeedTable.addRows([row]);
		}		
		console.log(columnTypeTime);
		console.log(columnTypePercent);
		createTable(dataFeedTable, columnTypeTime, columnTypePercent);
		 
	}	
	
	// Create visualisation table	
	function createTable(data, columnTypeTime, columnTypePercent)	 {
		//console.log('createTable');
		$('.visualisation-output').hide();
		$('#table_div').fadeIn(300);
		var table = new google.visualization.Table(document.getElementById('table_div'));
			
		if (columnTypePercent.length > 0) {	
			var formatter = new google.visualization.NumberFormat(
			{fractionDigits: 2, suffix: "%"});
			formatter.format(data, 5); // Apply formatter to fifth column
		}
/*		if (columnTypeTime.length > 0) {
			var formatterDecimal = new google.visualization.NumberFormat(
			{fractionDigits: 2});
			formatterDecimal.format(data, columnTypeTime[0]);
		}*/
		
		//var title = "/";
		//$('.google-visualization-table-td:contains(' + title +')').css('width', '180px'); 

	
		$('#controls').find('a').removeClass();
		$('#table-button').addClass('table-button-active');
		table.draw(data, {showRowNumber: true, width: 575, height: 460, sort: 'disable'}); //Output Table
	}	
		
		
		
/*		
		
		var columnHeaders = response.foo.concat(response.bar)
		
		// Fetch Metric Columns
		var metricColumn = columnHeaders(dataFeedQuery.metrics);
		console.log(metricColumn);
		// Fetch Dimension Columns	
		var dimensionColumn = columnHeaders(dataFeedQuery.dimensions);
		console.log(dimensionColumn);
			// Concatentate Column Headers Together
		var	columnHeadersJoin = dimensionColumn.concat(metricColumn);		
		
		function columnHeaders(columns) {
			var columns = columns.slice(3);
			columns = columns.split(',ga:');
			return(columns);
		}
		
		
		var columnHeadersArray = columnHeadersJoin;
		//console.log(columnHeadersArray);	
		var columnHeadersLength = columnHeadersArray.length;
		
		
		// Get First Row of Results
		var testEntries = entries[0];
		var columnTypes = [];
		
		// Test Each Cell in First Row for Data type 
		for(i = 0; i < columnHeadersLength; i++) {
			var testData = testEntries.getValueOf('ga:' + columnHeadersArray[i]);
			if (columnHeadersArray[i] === "avgTimeOnSite" || columnHeadersArray[i] === "avgTimeOnPage") {
				columnTypes[i] = 'string';	
			}	
			else if (isNaN(testData)) {
				columnTypes[i] = 'string';
			} else {
				columnTypes[i] = 'number';	
			}
			
		}
		

		//Print Table Headers
		for (var i = 0; i < columnHeadersLength; i++){
			var tmpColumn = columnHeadersArray[i];
			var tmpType = columnTypes[i];
			dataFeedTable.addColumn(tmpType, tmpColumn); 
		}
		
		
		// Convert Decimal to hh:mm:ss

		
		

		
		// Iterate through the feed entries and add the data as table rows.
		var rowArray  = new Array(); 
		for (var i = 0, entry; entry = entries[i]; ++i) {
		
			for (var ii = 0; ii < columnHeadersLength; ii++){
				var tmpMetric = columnHeadersArray[ii];
				tmpData = entry.getValueOf('ga:' + tmpMetric);
					if(tmpMetric === "avgTimeOnSite" || tmpMetric === "avgTimeOnPage"){
						tmpData = decimalTime(tmpData);
					}
					if (tmpMetric === "visitBounceRate" || tmpMetric === "percentNewVisits"){
						tmpData = Math.round(tmpData);
					}
				rowArray[ii] = tmpData;					
			}

			dataFeedTable.addRows([rowArray]);
			
		}
		
		createTable(dataFeedTable);
	}
		
	function createTable(dataFeedTable)	 {
		$('.visualisation-output').hide();
		$('#table_div').fadeIn(300);
		var table = new google.visualization.Table(document.getElementById('table_div'));

		table.draw(dataFeedTable, {showRowNumber: true, width: 575, height: 460, sort: 'disable'}); //Output Table
		var title = "/";
		$('.google-visualization-table-td:contains(' + title +')').css('width', '180px'); 
		$('#controls').find('a').removeClass();
		$('#table-button').addClass('table-button-active');
	}	

*/


