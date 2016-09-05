var dash_button = require('node-dash-button');
var jsonfile = require('jsonfile');
var prompt = require('prompt');
var chips = require('chipsandguac');
const file = 'user_info.json';
var is_fake= true;
if (process.argv.length >= 3 && process.argv[2] == 'real') {
	console.log('real order!');
	is_fake= false;
}


var main_func = function(info) {
	var cag = new chips({
		email: info['email'], 
		password: info['pass'],
		locationId: info['chip_id'],
		phoneNumber: info['pn']
	});
	var dash = dash_button(info['mac'], null, 60000);
	dash.on("detected", function () {
		console.log('button found!');
		console.log('retrieving most recent orderID');
		cag.getOrders().then(function(orders) {
			var most_recent_id = orders[0]["id"];
			
			console.log('ID retrived');
			console.log('Placing order');

			cag.submitPreviousOrderWithId(most_recent_id, is_fake).then(function(orderDetails) {
				console.log('Order placed!');
				console.log(orderDetails);
			}).catch(function(err) {
				console.log('An error occured');
				console.log(err);
			});
		}).catch(function(err) {
			console.log('An error occured');
			console.log(err);
		});

	});
	console.log("Awaiting button press");
	



};
jsonfile.readFile(file, function(err, obj) {
	if (err) {
		console.log('Error finding user info.  Creating new file');
		prompt.start();
		var info = {};
		prompt.get(['email', 'password', 'phone_number', 
			'button_MAC_address', 'chipotle_location_id'], function( err, result ) {
			if (err) {
			        console.log(err);
				return;
			}
			info['email'] = result.email;
			info['pass'] = result.password;
			info['mac'] = result.button_MAC_address;
			info['pn'] = result.phone_number;
			info['chip_id'] = result.chipotle_location_id;
			jsonfile.writeFile(file, info, function (err) {
				if (!err) {
					console.log('User info saved');
					main_func(info);
				}
			});
		});
	} else {
		main_func(obj);	
	} 


});

					



