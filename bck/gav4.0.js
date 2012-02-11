
	var clientId = '490432827276.apps.googleusercontent.com';
	var scopes = 'https://www.googleapis.com/auth/analytics.readonly';
	var dataFeedQuery = 0;

	function handleClientLoad() {
	console.log('huu');
		gapi.auth.init(checkAuth);
	}
	
/*	
	function auth() {
    var config = {
        'client_id': '490432827276.apps.googleusercontent.com',
        'scope': 'https://www.googleapis.com/auth/analytics.readonly'
    };
    gapi.auth.authorize(config, function() {
        var retObj = gapi.auth.getToken();
        makeRequest(retObj.access_token);
    });
}
*/	
	

	function checkAuth() {
		gapi.auth.authorize({client_id: clientId, scope: scopes, immediate: true}, handleAuthResult);
	}

	function handleAuthResult(authResult) {
		var authorizeButton = document.getElementById('authButton');
		if (authResult) {
			authorizeButton.style.visibility = 'hidden';
			var accessToken = gapi.auth.getToken();
			getDataFeed(accessToken.access_token);
		} else {
			authorizeButton.style.visibility = '';
			authorizeButton.onclick = handleAuthClick;
		}
	}

	function handleAuthClick(event) {
	  gapi.auth.authorize({client_id: clientId, scope: scopes, immediate: false}, handleAuthResult);
	  return false;
	}


/**==================
	MAIN METHOD - Export API REPORT           dataFeedQuery, dataFeedQuery, 
		==========================*/
	function getDataFeed(accessToken) {
		var restRequest = gapi.client.request({
			'path': '/analytics/v3/data/ga',
			'params': {
				'access_token': accessToken,
				'ids': 'ga:7079672',
				'metrics': 'ga:pageviews,ga:uniquePageviews',
				'start-date': '2011-11-01',
				'end-date' : '2011-12-01',
					
			}
		});
		restRequest.execute(function(resp) { console.log(resp); });
	}

	
	function handleDataFeed(resp) {
		console.log(resp);
	}
	
	
	
	
	
	
	
	
/*==================
	MAIN METHOD - Export API REPORT
		==========================/
	function getDataFeed(dataFeedQuery) {
		var myFeedUri = 'https://www.google.com/analytics/feeds/data' +
			'?start-date=' + dataFeedQuery.startDate +
			'&end-date=' + dataFeedQuery.endDate +
			'&dimensions=' + dataFeedQuery.dimensions +
			'&metrics=' + dataFeedQuery.metrics  +
			'&sort=' + dataFeedQuery.sort +
			'&max-results=' + dataFeedQuery.maxResults +
			'&ids=' + accountID;
	  
		console.log(myFeedUri);
		myService.getDataFeed(myFeedUri, handleDataFeed, handleError);
	}*/