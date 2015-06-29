L.mapbox.accessToken = 'pk.eyJ1IjoiZ3NjcGxhbm5pbmciLCJhIjoiRVZMNXpsQSJ9.5OxUlJTCDplPkdkKNlB91A'

var limitSouthWest=L.latLng(38.181445, -84.599018),
	limitNorthEast=L.latLng(38.241871, -84.533272),
	limitBounds=L.latLngBounds(limitSouthWest, limitNorthEast);

var courseSouthWest = L.latLng(38.199311, -84.559075),
	courseNorthEast = L.latLng(38.209681, -84.550513),
	courseBounds = L.latLngBounds(courseSouthWest, courseNorthEast);

var map = L.mapbox.map('map', null, {
	maxZoom: 20,
	minZoom: 14,
	maxBounds: limitBounds
});

map.fitBounds(courseBounds);

// Allow users to see their location
var lc = L.control.locate({
    position: 'topleft',
    drawCircle: true,
    follow: true,
    setView: true,
    keepCurrentZoomLevel: false,
    stopFollowingOnDrag: false,
    remainActive: false, // if true locate control remains active on click even if the user's location is in view.
    markerClass: L.circleMarker, // L.circleMarker or L.marker
    icon: 'fa fa-map-marker',  // class for icon, fa-location-arrow or fa-map-marker
    iconLoading: 'fa fa-spinner fa-spin',  // class for loading icon
    circlePadding: [0, 0], // padding around accuracy circle, value is passed to setBounds
    metric: false,  // use metric or imperial units
    onLocationError: function(err) {alert(err.message)},  // define an error callback function
    onLocationOutsideMapBounds:  function(context) { // called when outside map boundaries
            alert(context.options.strings.outsideMapBoundsMsg);
    },
    showPopup: true, // display a popup when the user click on the inner marker
    strings: {
        title: "Show me where I am",  // title of the locate control
        metersUnit: "meters", // string for metric units
        feetUnit: "feet", // string for imperial units
        popup: "You are within {distance} {unit} from this point",  // text to appear if user clicks on circle
        outsideMapBoundsMsg: "You seem located outside the boundaries of the map" // default message for onLocationOutsideMapBounds
    },
    locateOptions: {
    	maxZoom: 16
    }  // define location options e.g enableHighAccuracy: true or maxZoom: 10
}).addTo(map);

map.on('startfollowing', function() {
    map.on('dragstart', lc._stopFollowing, lc);
}).on('stopfollowing', function() {
    map.off('dragstart', lc._stopFollowing, lc);
});

//basemaps!

var streets = L.tileLayer('http://{s}.{base}.maps.cit.api.here.com/maptile/2.1/maptile/{mapID}/normal.day/{z}/{x}/{y}/256/png8?app_id={app_id}&app_code={app_code}', {
	attribution: 'Map &copy; 1987-2014 <a href="http://developer.here.com">HERE</a>',
	subdomains: '1234',
	mapID: 'newest',
	app_id: 'KyV8pDypNozhxHmc7pB1',
	app_code: '6BKq0rJQx1nDAixDbD3OxQ',
	base: 'base',
	maxZoom: 20
});

var satellite = L.tileLayer('http://{s}.{base}.maps.cit.api.here.com/maptile/2.1/maptile/{mapID}/hybrid.day/{z}/{x}/{y}/256/png8?app_id={app_id}&app_code={app_code}', {
	attribution: 'Map &copy; 1987-2014 <a href="http://developer.here.com">HERE</a>',
	subdomains: '1234',
	mapID: 'newest',
	app_id: 'KyV8pDypNozhxHmc7pB1',
	app_code: '6BKq0rJQx1nDAixDbD3OxQ',
	base: 'aerial',
	maxZoom: 20
});

var baseLayers = {
	Streets: streets,
	Satellite: satellite
};

baseLayers.Streets.addTo(map);

$("#streets").click(function() {
	map.addLayer(streets)
	map.removeLayer(satellite)
	if ($("#satellite").hasClass("active")) {
		$("#satellite").removeClass("active");
		$("#streets").addClass("active");
	}
});

$("#satellite").click(function() {
	map.addLayer(satellite)
	map.removeLayer(streets)
	if ($("#streets").hasClass("active")) {
		$("#streets").removeClass("active");
		$("#satellite").addClass("active");
	}
});


// Course

courseStyle = {
	"color": "#F39C6B",
	"weight": 6,
	"opacity": 0.85
}

var promise = $.getJSON('./data/CARTO_finley5k_course_ln.geojson');
promise.then(function(data) {
	var course = L.geoJson(data, {
		style: courseStyle,
		onEachFeature: function (feature, layer) {
			layer.setText('\u279c          ', {
				offset: 4.5,
				repeat: true,
				attributes: {
					fill: "#404b4c",
					"font-size": "13"
				}
			});
		}
	}).addTo(map);
});


// Start & Finish markers
var startIcon = L.icon({
	iconUrl: './markers/startFlag.svg',
	iconSize: [33,39],
	iconAnchor: [8,33],
	popupAnchor: [7,-22]
})
var finishIcon = L.icon({
	iconUrl: './markers/cfaFlag.svg',
	iconSize: [33,39],
	iconAnchor: [20,33],
	popupAnchor: [-4,-22]

})

var promise = $.getJSON('./data/CARTO_finley5k_startFinish.geojson');
promise.then(function(data) {
	var startFinish = L.geoJson(data);

	var start = L.geoJson(data, {
		filter: function(feature, layer) {
			return feature.properties.Name == 'START';
		},
		pointToLayer: function(feature, latlng) {
			var startMarker = L.marker(latlng, {
				icon: startIcon
			});
			var name = feature.properties.Name;
			var letterOne = name[0];
			var letterRest = name.substr(1).toLowerCase();
			var popup= function () {
				var name = feature.properties.Name;
				var letterOne = name[0];
				var letterRest = name.substr(1).toLowerCase();
				this.bindPopup('<strong>' + letterOne + letterRest + ' Line</strong>').openPopup()
			}			
			return startMarker
				.on('mouseover', popup)
				.on('mouseout', function() {
				this.closePopup();
			});
		}
	});

	var finish = L.geoJson(data, {
		filter: function (feature, layer) {
			return feature.properties.Name == 'FINISH';
		},
		pointToLayer: function(feature, latlng) {
			var finishMarker =  L.marker(latlng, {
				icon: finishIcon
			});
			var name = feature.properties.Name;
			var letterOne = name[0];
			var letterRest = name.substr(1).toLowerCase();
			var popup= function () {
				var name = feature.properties.Name;
				var letterOne = name[0];
				var letterRest = name.substr(1).toLowerCase();
				this.bindPopup('<strong>' + letterOne + letterRest + ' Line</strong><br><em>Sponsored by Chik-Fil-A</em>').openPopup()
			}			
			return finishMarker
				.on('mouseover', popup)
				.on('mouseout', function() {
				this.closePopup();
			});
		}
	});
	start.addTo(map);
	finish.addTo(map);
});

// Distance markers

var promise = $.getJSON('./data/CARTO_finley5k_distMarkers.geojson');
promise.then(function(data) {
	var distance = L.geoJson(data);
	var miles = L.geoJson(data, {
		filter: function (feature, layer) {
			return feature.properties.unit == 'mi';
		},
		pointToLayer: function(feature, latlng) {
			return L.marker(latlng, {
				icon: L.divIcon({
					className: 'mi-label',
					html: '<strong>' + feature.properties.dist + '</strong>',
					iconSize: [24,24]
				})
			});
		}
	});
	var km = L.geoJson(data, {
		filter: function (feature, layer) {
			return feature.properties.unit == 'km';
		},
		pointToLayer: function(feature, latlng) {
			return L.marker(latlng, {
				icon: L.divIcon({
					className: 'km-label',
					html: '<strong>' + feature.properties.dist + '</strong>',
					iconSize: [24,24]
				})
			});
		}
	});
	// 

	$("#miles").click(function() {
		map.addLayer(miles)
		map.removeLayer(km)
		if ($("#km").hasClass("active")) {
			$("#km").removeClass("active");
			$("#miles").addClass("active");
		} else {
			$("#miles").addClass("active");
		}
	});

	$("#km").click(function() {
		map.addLayer(km)
		map.removeLayer(miles)
		if ($("#miles").hasClass("active")) {
			$("#miles").removeClass("active");
			$("#km").addClass("active");
		} else {
			$("#km").addClass("active");
		}
	});
});

// Parking
var parkingIcon = L.icon({
	iconUrl: './markers/parkingIcon.png',
	iconSize: [12,12]
})

var promise = $.getJSON('./data/finley5k_parking.geojson');
promise.then(function(data) {
	// var startFinish = L.geoJson(data);

	var parking = L.geoJson(data, {
		pointToLayer: function(feature, latlng) {
			var startMarker = L.marker(latlng, {
				icon: parkingIcon
			});
			return startMarker
		}
	});
	parking.addTo(map);

	$("#parking").click(function() {
		// map.addLayer(streets)
		// map.removeLayer(satellite)
		if ($("#parking").hasClass("parking-active")) {
			map.removeLayer(parking);
			$("#parking").removeClass("parking-active");
		} else {
			map.addLayer(parking);
			$("#parking").addClass("parking-active");
		}
	});
});