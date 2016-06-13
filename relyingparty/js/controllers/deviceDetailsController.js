'use strict';

rpControllers.controller('DeviceDetailsController', ['$scope', '$window', '$cookies', 'Session', 'DeviceDetails',

	function($scope, $window, $cookies, Session, DeviceDetails) {
		$scope.manageRelyingParty = function() {
			$window.location.href = "#/manageRelyingParty";
		}
		
		var dataOrder = ['createdate','principal_value','action_type','outcome',
		                 'accelerometer','api_level','bluetooth_address','device_id',
		                 'device_make','device_manufacturer','device_model','dns_ip_address',
		                 'router_gps','gyroscope','ip_address','router_ip_address','country_code',
		                 'location','mac_address','router_mac_address','router_manufacturer',
		                 'router_model','more_sensors','network_operator','nfc','os_name','os_type',
		                 'os_version','phone_type','product_name','proxy','serial_number',
		                 'sim_operator','sim_serial_number','subscriber_id','touch_screen',
		                 'user_agent','vendor','wifi_or_lte','wifi_ssid']
		
		$scope.getDeviceDetails = function(dateFields) {
			(new DeviceDetails(null)).get(dateFields,
				function(data) {
					console.log(data);
					var detailTable = document.getElementById('detailsTable');
					
					detailTable.innerHTML = ""; // clear table first
					
					var header = detailTable.createTHead();
					var row = header.insertRow(0);
					for (var i = 0; i < dataOrder.length; i++) {
						var c = row.insertCell(i);
						c.innerHTML = dataOrder[i];
					}
					
					for (var i = 0; i < data.length; i++) {
						var rowData = data[i];
						var row = detailTable.insertRow(-1);
						for (var x = 0; x < dataOrder.length; x++) {
							var c = row.insertCell(x);
							c.innerHTML = rowData[dataOrder[x]];
						}
					}					
					
					detailTable.style.visibility = 'visible';
					
				}, function(error) {
					var detailTable = document.getElementById('detailsTable');
					detailTable.style.visibility = 'hidden';
					alert("unable to get data");
				}
			);
		}
	}
]);