var map, info, bounds;
var markers = [];
var fq;

var LocationModel = function() {
	this.currentLocation = null;
	this.locations = ko.observableArray( [
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
}

var MarkerModel = {
	markers: [],
	init: function() {
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
				self.show(this);
			});
			bounds.extend(locations[i].location);
		}
		map.fitBounds(bounds);
	},
	show: function(marker) {
		if(info.marker != marker) {
			info.marker = marker;
			this.getFousquareInfo(marker.getPosition());
			info.setContent(marker.getTitle() + ' - ' + fq);
			info.open(map, marker);
			info.addListener('closeclick', function() {
				info.marker = null;
			})
		}
	},
	getFousquareInfo: function(position) {
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
			if (name == 'undefined') {
				fq = 'No popular location found';
			} else {
				fq = 'Popular Location: ' +  name;
			}
		}).fail(function(data) {
			console.log(data)          
		});
	} 
}

var LocationController = {
	init: function() {
		ko.applyBindings(new LocationModel());
		this.initMap();
		MarkerModel.init();
		LocationView.search();
		LocationView.show();
	},
	initMap: function() {
		map = new google.maps.Map(document.getElementById('map'), {
			center: {lat: 6.524379, lng: 3.379206},
			zoom: 13
		});
		info = new  google.maps.InfoWindow();
		bounds = new google.maps.LatLngBounds();
	}
}

var LocationView = {
	search: function () {
        var input, filter, li, a, i;
        $('#search').on('keyup', function() {
            filter = $(this).val().toLowerCase();
            items = $('.nav-item');
            markers = MarkerModel.markers;
            for (i = 0; i < items.length; i++) {
                a = items[i].childNodes[1];
                str = a.innerHTML.toString().toLowerCase();
                if (str.indexOf(filter) > -1) {
                    items[i].style.display = "";
                    markers[i].setMap(map);
                } else {
                    items[i].style.display = "none";
                    markers[i].setMap(null);
                }
            }
        });

    }, 
    show: function() {
    	$('.nav-link').on('click', function() {
    		markers = MarkerModel.markers;
            for (i = 0; i < markers.length; i++) {
                if (markers[i].getTitle() == $(this).data('name')) {
                    markers[i].setMap(map);
                    markers[i].setAnimation(google.maps.Animation.BOUNCE);
                    MarkerModel.show(markers[i]);
                    map.setCenter(markers[i].getPosition());
                    bounds.extend(markers[i].getPosition());
                }
            }
    	});
    }
}

LocationController.init();

