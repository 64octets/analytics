//add a comment to this 
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
		"title": "Most Viewed",
		"startDate": "2009-04-01",
		"endDate": "2009-04-05",
		"dimensions": "ga:pagePath",
		"metrics": "ga:pageviews,ga:uniquePageviews,ga:avgTimeOnPage,ga:bounces,ga:visitBounceRate",
		"sort": "-ga:pageviews",
		"maxResults": "10",
		"startIndex": "1",
		"filter": "ga:pagePath!=0101010101"		 	
	};
	
	// Most Viewed Report Query
	var mostViewedQuery = {
		"title": "Most Viewed",
		"dimensions": "ga:pagePath",
		"metrics": "ga:pageviews,ga:uniquePageviews,ga:avgTimeOnPage,ga:bounces,ga:visitBounceRate",
		"sort": "-ga:pageviews",
		"startIndex": "1",
		"filter": "ga:pagePath!=0101010101" 	
	};
	
	// Traffic Source Query
	var trafficSourceQuery = {
		"title": "Traffic Sources",
		"dimensions": "ga:source",
		"metrics": "ga:visitors,ga:percentNewVisits,ga:avgTimeOnSite,ga:bounces,ga:visitBounceRate",
		"sort": "-ga:visitors",
		"startIndex": "1",
		"filter": "ga:source!=0101010101"	
	};
	
	// Organic Search Terms
	var searchTermQuery = {
		"title": "Search Terms",
		"dimensions": "ga:keyword",
		"metrics": "ga:visitors,ga:percentNewVisits,ga:avgTimeOnSite,ga:bounces,ga:visitBounceRate",
		"sort": "-ga:visitors",
		"startIndex": "1",
		"filter": "ga:keyword!=0101010101"	
	};
	
	var sparkLineQuery = {
		"title": "Spark Line Visualisation",
		"startDate": "2011-11-01",
		"endDate": "2011-12-05",
		"dimensions": "ga:week",
		"metrics": "ga:visitors,ga:pageviewsPerVisit,ga:avgTimeOnSite,ga:visitBounceRate,ga:percentNewVisits",
		"startIndex": "1"
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
			//console.log(config);			
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
			$('#nav > ul > li').removeClass();
			$(this).addClass('active-report');
			var currentReport = $(this).attr('id').slice(4);
			// Send ID to selectReport
			selectReport(currentReport);		
		});
		
		// Method Selection Event
		$('#controls > ul > li > a').click(function() {
			var currentMethod = $(this).attr('id');
			if(currentMethod === "table-button") {console.log(currentMethod);}
			if(currentMethod === "pie-button") {console.log(currentMethod);}
			if(currentMethod === "line-graph-button") {console.log(currentMethod);}	
		});
		
	
		// Add Data Picker
		$(function() {
			$( "#from-date, #to-date" ).datepicker({dateFormat: 'yy-mm-dd' });
		});		

		// Set Namespace accountID variable
		$('#confirm-acc-id').click(function() {
			accountID = $('#tableId').val();
		});
		
/*		//footer 
		$('#foot-hover li').hover(
			function(){
				var footerUl = $(this).index();
				//var footerli = index(footerUl);
				console.log(footerUl);
				$('#foot-pop-li > li > span').eq(footerUl).stop().show(700);			
			},
			function(){
				var footerUl = $(this).index();
				//var footerli = index(footerUl);
				console.log(footerUl);
				$('#foot-pop-li > li > span').eq(footerUl).stop().hide(900);
			}	
		);
*/		
		//Table paging
		$('#tab-prev').attr("disabled", true);
			
		$('#tab-prev').click (function() {
			var current = new Number(dataFeedQuery.startIndex);
			var pageSize = new Number(dataFeedQuery.maxResults);
			dataFeedQuery.startIndex = current - pageSize;
			$('#table-page-count').html(dataFeedQuery.startIndex + " - " + (dataFeedQuery.startIndex + 9 ) + " results");
			getDataFeed(dataFeedQuery);
			if (dataFeedQuery.startIndex < 10) {
				$('#tab-prev').attr("disabled", true);
			} 						
		});
		
		$('#tab-next').click (function() {
			$('#tab-prev').attr("disabled", false);
			var current = new Number(dataFeedQuery.startIndex);
			var pageSize = new Number(dataFeedQuery.maxResults);
			dataFeedQuery.startIndex = current + pageSize;
			$('#table-page-count').html(dataFeedQuery.startIndex + " - " + (dataFeedQuery.startIndex + 9 ) + " results");
			getDataFeed(dataFeedQuery);
		});
		
		//Dismiss Alert bar
		$('.alert-close').click (function() {
			$('#alert-bar').slideUp(600);	
		});	

	});
					
	// Form Submission Event
	function formSubmitted() {
		dataFeedQuery.startDate = $('#from-date').val();
		dataFeedQuery.endDate = $('#to-date').val();
		var filterValue = $('#frm-filter').val();
		var filterOperator = $('.operator:checked').val();
		var filterSpecific = $('.specific:checked').val();
		//console.log(filterOperator);
		//console.log(filterSpecific);
		dataFeedQuery.filter = dataFeedQuery.dimensions + filterOperator + filterSpecific + filterValue;
		//console.log(dataFeedQuery.filter);
		getDataFeed(dataFeedQuery);
	} 	
	
	// Turn Loading State on
	function loadingStateOn() {
		$('#loading-state-block').fadeIn(300);
	}
	
	// Turn loading state off
	function loadingStateOff() {
		$('#loading-state-block').fadeOut(300);
	}
	
	//Update Title with report and date
	function titleUpdate() {
		var start = new Date(dataFeedQuery.startDate);
		var end = new Date(dataFeedQuery.endDate);
		start = $.datepicker.formatDate('dd-mm-y', start);
		end = $.datepicker.formatDate('dd-mm-y', end);
		$('#inner-content > h3').html(dataFeedQuery.title + ": " + start + " to " + end);
	}
	
/**======================
	Select Report and Submit Query
		=============================**/
 /* Select report depending on nav id, merge report query with main
 *  query object and submit to getDataFeed
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
		else if(currentReport === "spark-lines") {
			$.extend(dataFeedQuery, sparkLineQuery);
			getDataFeed(dataFeedQuery);
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
		loadingStateOn();	  
		var restRequest = gapi.client.request({
			'path': '/analytics/v3/data/ga',
			'params': {
			'access_token': config.accessToken,
			'ids': config.tableId,
			'start-date': dataFeedQuery.startDate,
			'end-date' : dataFeedQuery.endDate,
			'metrics': dataFeedQuery.metrics,
			'dimensions': dataFeedQuery.dimensions,
			//'sort': dataFeedQuery.sort,
			'max-results': dataFeedQuery.maxResults,
			'start-index': dataFeedQuery.startIndex
			//'filters':  dataFeedQuery.filter 	
			}
		});
		restRequest.execute(function(response) {
			console.log(response);
			$('#alert-bar').slideUp(600);
			handleError(response); 
		});
	}	  
	 
	 
/**==================
	MAIN METHOD - Error Handler
		==========================*/		 
	 
	function handleError (response) {	 
	 		
		if (typeof response.error !="undefined") {
			//console.log(response.error);
			loadingStateOff();
			$('.alert-message').html("Error " + response.error.code + ": " + response.error.message + " no results returned");
			$('#alert-bar').removeClass().addClass("red-alert").slideDown();
			$('#table_div').hide();	
		}		
		else if(response.containsSampledData == true) {
			$('.alert-message').html("This report contains sampled data.");
			$('#alert-bar').removeClass().addClass("yellow-alert").slideDown();
			handleDataFeed(response); 	
		} else {
			handleDataFeed(response);
		}
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
			//dataFeedTable.addColumn('number', '');
			for (var i = 0; i < columnCount; i++){
				var tmpColumn = response.columnHeaders[i].name;
				var tmpType = response.columnHeaders[i].dataType;
				dataFeedTable.addColumn(columnType(tmpType, i, tmpColumn), columnName(tmpColumn));
				columnTypeArray[i] = tmpType;
				console.log(tmpType);
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
			function columnType(tmpType, columnId, tmpColumn) {
			//var columnTypeTime = [];
			//var columnTypePercent = new Array();
				if (tmpType === "INTEGER" || tmpColumn === "ga:week"){
					tmpType = "number";
					//console.log(tmpType);
				} 
				else if (tmpType === "STRING"){
					tmpType = "string";
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
						columnTypePercent.push(columnId);
					} else {
						//console.log(columnTypePercent);
						columnTypePercent.push(columnId);
					}
					tmpType = "number";
					//console.log(tmpType);
				}
				else if (tmpType === "FLOAT"){
					tmpType = "number";
				} else {
					alert('data type not recognised' + tmpType);
				}
				//console.log(columnTypeTime);
				//console.log(columnTypePercent);
				return(tmpType);
				
			}
			
			//Format decimal time (28.0909678) into hh:mm:ss
			function decimalTime(secs)
			{
			    var hours = Math.floor(secs / (60 * 60));
			   
			    var divisor_for_minutes = secs % (60 * 60);
			    var minutes = Math.floor(divisor_for_minutes / 60);
			 
			    var divisor_for_seconds = divisor_for_minutes % 60;
			    var seconds = Math.ceil(divisor_for_seconds);
			   
				var obj = [hours, minutes, seconds]
				//console.log(obj);
				//pad to format of hh:mm:ss
				for (var i = 0; i < obj.length; i++){
					if (obj[i] < 10 ) {
						obj[i] = String("0" + obj[i]);
					} 
				}
				obj = obj.join(":");
				//console.log(obj);
				return (obj);
			   
			}
			
			// Add row data
			var rowCount = response.rows.length;
			for(var i = 0; i < rowCount; i++ ) {
				var	row = response.rows[i];
	
				
				for(var ii = 0; ii < row.length; ii++) {
				var timeType = columnTypeTime;
				//console.log(timeType);
					if (isNaN(row[ii])) {
						row[ii] = row[ii];
					}
					else if (ii == timeType) {
						//console.log("r");
						row[ii] = decimalTime(row[ii]);
					} else {
						row[ii] = parseFloat(row[ii]);	
					}
				}
				
				//console.log(row);
				dataFeedTable.addRows([row]);
			}		
			//console.log(columnTypeTime);
			//console.log(columnTypePercent);
			createTable(dataFeedTable, columnTypeTime, columnTypePercent);
		
	}	
	
	// Create visualisation table	
	function createTable(data, columnTypeTime, columnTypePercent)	 {
		//console.log('createTable');
		$('.visualisation-output').hide();
		$('#table_div').fadeIn(300);
		var table = new google.visualization.Table(document.getElementById('table_div'));
		
		// Format percentage columns	
		if (columnTypePercent.length > 0) {	
			for(var i=0; i < columnTypePercent.length; i++) {
				var formatter = new google.visualization.NumberFormat(
				{fractionDigits: 2, suffix: "%"});
				formatter.format(data, columnTypePercent[i]); // Apply formatter percentage columns
			}
		}
	
		// define css classes for tables
		var tableClassNames = {
			tableCell: 'table-size', 
			oddTableRow: 'odd-table-row', 
			hoverTableRow: 'hover-table-row',
			selectedTableRow: 'selected-table-row',
			headerRow: 'header-table-row'
			};
		
		table.draw(data, {
			showRowNumber: false,
			width: 615, 
			sort: 'disable',
			page: 'disable',
			pageSize: "10",
			cssClassNames: tableClassNames
			}
		); //Output Table
		
	// UI Adjustments	
		//set method button
		$('#controls').find('a').removeClass();
		$('#table-button').addClass('table-button-active');
		//add paging buttons
		$('.table-pager').fadeIn(300);
		firstColumnFix();
		titleUpdate();
		loadingStateOff();
	}	
	
	//Shrink Page path text size
	function firstColumnFix(){
		$('tr > .table-size:nth-child(1)').addClass("width-cell");
	}	
		
