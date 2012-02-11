// https://www.google.com/accounts/Logout

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

function makeRequest(accessToken) {
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
$(document).ready(function(){
	$('#authButton').click(function() {
		auth(); 
	});
});