/*********************************************************************************
GeoLocation JavaScript
Copyright 2015, SmartAction
Brian Costello <bc@smartaction.com>
*********************************************************************************/

/*
Query parameters supported:
	id (the callId)
	lon (the longitude)
	lat (the latitude)
	acc (the accuracy in meters)
	c   (the state code)

State codes used:
	-3:  Phone does not support geolocation
	10: The phone received good GeoPosition coordinates.
*/

/*
 * These functions are used to dynamically update the page if it discovers that
 * the webapp returned the wrong HTML.
 *
 */

Element.prototype.remove = function() {
    this.parentElement.removeChild(this);
}
NodeList.prototype.remove = HTMLCollection.prototype.remove = function() {
    for(var i = this.length - 1; i >= 0; i--) {
        if(this[i] && this[i].parentElement) {
            this[i].parentElement.removeChild(this[i]);
        }
    }
}

/*
 * makeURL(): Takes an input array that represents the URL's parameter values in the
 *			  correct order, along with the service name (usually gonna be "StoreLocationData".
  *	Input:
 *		p: An array, containing the individual parameter values in the proper order.
 *		   For example, ['12345', '1.23', '3.45', '60', '10']
 *  Returns:
 *		The URL of the service
 */

function makeURL(p) {
	var baseUrl = '@@tgturl/Location/';
	var u = baseUrl + p.join('/');
	return u;
}
 
/*
 * gpsSuccess(): Called when the GPS co-ordinates were acquired by the browser.
 * Input:
 *		position: The GeoLocation API calls this function with the position object
 *		as the argument, which is how the lat/long/accuracy is determined.
 * Action:
 *		This function generates the URL for the 2nd usuccessful HTTP GET.
 *		Note: It uses c=10, which I use to specify state 10.  This way, you can
 *		differentiate easily between web requests.
 */
 
function gpsSuccess(position) {
	var idstr = window.location.pathname.split('/').pop();
	var crd = position.coords;
    setDivMsg("Successfully received your position - submitting.");
	var qpa = [idstr, crd.latitude, crd.longitude, crd.accuracy, "10"];
	var u = makeURL(qpa);
	window.location.assign(u);
}

/*
 * gpsError() - Called whenver something goes wrong.  (If GeoLocation fails, or the
 * 		page is missing some data or whatever.  I've assigned specific states
 *      to each error (as well as the success).
 * Input:
 *     msg: A message to possibly display to the user, or just log somewhere.  I don't
 * 			think we want to pass it to the webserver - the c parameter should provide
 *          enough information.
 *		c: An integer state code getting passed back to the webserver 
 *         Status code #'s should be documented in the app's confluence page.
 */

function gpsError(msg, c) {
	var idstr = window.location.pathname.split('/').pop();
	var qpa = [idstr, '-99999', '-99999', '-1', c.toString(10)];
	var u = makeURL(qpa);
	setDivMsg(msg);
	window.location.assign(u);
}

/*
 * setDibMsg() - Inserts the input variable msg into the DOM where it will display
 * 					when the phone detects a fatal error that keeps it from being
 *					able to get a response... so it has to make some feedback for
 *					the guy on the phone.
 */


function setDivMsg(msg) {
	document.getElementById('pbbox').innerHTML = "<b>" + msg + "</b>";
}

/*
 * Have the code execute as soon as the DOMContentLoaded event fires - this is
 * immediately after the rest of the document is done loading.  This is important
 * because the GeoLocation API doesn't start until a bit after the page loads.
 *
 * The page also checks to see if the webapp is returning H
 */

document.addEventListener('DOMContentLoaded', function() {
	var pnstr = window.location.pathname;
	var numslashes = pnstr.split('/').length;
	
	if (numslashes > 8) {
		setDivMsg("Sorry, something went wrong, and your GPS co-ordinates were probably not sent.");
		return;
	}
	
	var gpsOptions = {
		enableHighAccuracy: true,
		timeout: 60000,
		maximumAge: 0
	};
	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(gpsSuccess, gpsError);
	} else {
		gpsError('This browser does not support geolocation.', -3);
		return;
	}
});

