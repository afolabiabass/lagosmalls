var map, info, bounds;
var markers = [];
var fq = 'No popular location found';

var LocationModel = function() {
	this.currentLocation = null;
	this.query = ko.observable('');
	this.locations = ko.observableArray([
		{
			title:'Ikeja City Mall',
			location: {
				lat: 6.6142,
				lng: 3.3583
			}
		},
		{
			title:'Maryland Mall',
			location: {
				lat: 6.5673,
				lng: 3.3673
			}
		},
		{
			title:'Leisure Mall',
			location: {
				lat: 6.4901,
				lng: 3.3573
			}
		},
		{
			title:'Adeniran Ogunsanya Mall',
			location: {
				lat: 6.4901,
				lng: 3.3573
			}
		},
		{
			title:'Palms Shopping Mall',
			location: {
				lat: 6.4358,
				lng: 3.4515
			}
		},
		{
			title:'Circle Mall',
			location: {
				lat: 6.4382,
				lng: 3.5087
			}
		},
		{
			title:'Novare Mall',
			location: {
				lat: 6.4677,
				lng: 3.6390
			}
		}
	]);
	var selfLM = this;
	this.search = ko.computed(function() {
		//Search function for location
	    var q = selfLM.query();
	    return selfLM.locations().filter(function(i) {
	      return i.title.toLowerCase().indexOf(q) >= 0;
	    });
	});

	this.showLocation = function(marker) {
		markers = MarkerModel.markers;
        for (i = 0; i < markers.length; i++) {
            if (markers[i].getTitle() == marker.title && info.marker != markers[i]) {
            	if(MarkerModel.currentMarker) MarkerModel.currentMarker.setAnimation(null);
            	MarkerModel.currentMarker = markers[i];
                markers[i].setMap(map);
                markers[i].setAnimation(google.maps.Animation.BOUNCE);
                MarkerModel.show(markers[i]);
                map.setCenter(markers[i].getPosition());
                bounds.extend(markers[i].getPosition());

                info.marker = markers[i];
				MarkerModel.getFourSquareInfo(markers[i].getPosition());
				info.setContent(markers[i].getTitle() + ' - ' + fq);
				info.open(map, markers[i]);
				info.addListener('closeclick', function() {
					info.marker = null;
				})
            }
        }
	};
}

var MarkerModel = {
	markers: [],
	currentMarker: null,
	init: function() {
		//Load each location data from location model as markers on the map
		locations = new LocationModel().locations();
		length = locations.length;
		var self = this;
		for(i = 0; i < length; i++) {
			marker = new google.maps.Marker({
				position: locations[i].location,
				map: map,
				title: locations[i].title,
				id: i,
				animation: google.maps.Animation.DROP
			});

			this.markers.push(marker);
			marker.addListener('click', function() {
				map.setZoom(15);
				map.setCenter(this.getPosition());
				if(self.currentMarker) self.currentMarker.setAnimation(null);
				self.currentMarker = this;
				this.setAnimation(google.maps.Animation.BOUNCE);
				self.show(this);
			});
			bounds.extend(locations[i].location);
		}
		map.fitBounds(bounds);
	},
	show: function(marker) {
		if(info.marker != marker) {
			info.marker = marker;
			this.getFourSquareInfo(marker.getPosition());
			info.setContent(marker.getTitle() + ' - ' + fq);
			info.open(map, marker);
			info.addListener('closeclick', function() {
				info.marker = null;
			})
		}
	},
	getFourSquareInfo: function(position) {
		//Function to retrieve third-party data on location.
		$.ajax({
		  	url: 'https://api.foursquare.com/v2/venues/explore',
		  	method: 'GET',
		  	data: {
			    client_id: '3AZQNIAP0EKPIPKHB3OI5P4NJFMJTUY2LTSVQJGY0EMJRXT1',
			    client_secret: 'GBP1GRO3QBNFCJMAENW1UOC2XYVRYGTPZ2TYNUD1JGY1ZNCI',
			    ll: position.lat() + ',' + position.lng(),
			    v: '20180323',
			    limit: 1
		  	}
		}).done(function(data) {
			name = data.response.groups[0].items[0].venue.name;
			if (name == 'undefined' || name == null) {
				fq = 'No popular location found';
				toastr.error('Unable to retrieve popular Locations around the mall you searched', 'Error!')  
			} else {
				fq = 'Popular Location: ' +  name;
			}
		}).fail(function(data) {
			toastr.error('Unable to retrieve popular Locations around the mall you searched', 'Error!')         
		});
	}
}

var LocationController = {
	init: function() {
		if(typeof google !== 'object') {
			toastr.error('Sorry the Google Map API is curently not reachable', 'Error!')   
		} else {
			ko.applyBindings(new LocationModel());
			this.initMap();
			MarkerModel.init();
		}
	},
	initMap: function() {
		//Function to initiate map into window.
		map = new google.maps.Map(document.getElementById('map'), {
			center: {lat: 6.524379, lng: 3.379206},
			zoom: 13
		});
		info = new  google.maps.InfoWindow();
		bounds = new google.maps.LatLngBounds();
	}
}

//Initiate Controller
LocationController.init();

