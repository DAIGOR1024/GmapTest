let map,
    centerMarker,
    otherMarkers = [];

function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 15
    });

    let infoWindow = new google.maps.InfoWindow({map: map});

    let service = new google.maps.places.PlacesService(map);

    let iconBase = 'https://maps.google.com/mapfiles/kml/paddle/';
    let icons = {
        center: {
            icon: iconBase + 'blu-blank.png'
        }
    };

    let listControlDiv = document.createElement('div');
    let ul = document.createElement('ul');
    ul.style.backgroundColor = '#fff';
    ul.style.border = '2px solid #fff';
    ul.style.borderRadius = '3px';
    ul.style.boxShadow = '0 2px 6px rgba(0,0,0,.3)';
    ul.style.cursor = 'pointer';
    ul.style.marginBottom = '22px';
    ul.style.textAlign = 'center';
    listControlDiv.appendChild(ul);

    listControlDiv.index = 1;
    map.controls[google.maps.ControlPosition.TOP_RIGHT].push(listControlDiv);

    function initCenter() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function (position) {
                let pos = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                map.setCenter(pos);
                centerMarker = new google.maps.Marker({
                    map: map,
                    position: pos,
                    icon: icons.center.icon
                });
                searchNearby(pos) }, handleError);
        } else {
            handleError();
        }
    }

    function handleError(){
        handleLocationError(true, infoWindow, map.getCenter());
    }

    function searchNearby(pos){

        service.nearbySearch({
            location: pos,
            radius: 500,
            type: ['restaurant']
        }, callback);

        function callback(results, status) {

            if (status === google.maps.places.PlacesServiceStatus.OK) {
                for (let i = 0; i < results.length; i++) {
                    createMarker(results[i]);
                    createLis(results[i]);
                }
            }
        }

        function createMarker(place) {
            let marker = new google.maps.Marker({
                map: map,
                position: place.geometry.location
            });

            otherMarkers.push(marker);

            marker.addListener('click', function() {
                infoWindow.setContent(place.name);
                infoWindow.open(map, marker);
            });
        }

        function createLis(place){
            let li = document.createElement('li');
            li.style.color = 'rgb(25,25,25)';
            li.style.fontFamily = 'Roboto,Arial,sans-serif';
            if(place.opening_hours === undefined){
                place.opening_hours = {};
                place.opening_hours.open_now = null;
            }else{
                let text = document.createTextNode(place.name+',opening:'+place.opening_hours.open_now);
                li.appendChild(text);
                ul.appendChild(li);
            }
        }
    }

    function handleLocationError(browserHasGeolocation, infoWindow, pos) {
        infoWindow.setPosition(pos);
        infoWindow.setContent(browserHasGeolocation ?
            'Error: The Geolocation service failed.' :
            'Error: Your browser doesn\'t support geolocation.');
    }

    initCenter();

    map.addListener('center_changed',function(){
        while (ul.firstChild) {
            ul.removeChild(ul.firstChild);
        }
        if (centerMarker !== undefined){
            centerMarker.setMap(null);
            for(let j = 0;j<otherMarkers.length;j++){
                otherMarkers[j].setMap(null);

            }
            otherMarkers=[];
            let p = {
                lat: map.center.lat(),
                lng: map.center.lng()
            };
            centerMarker = new google.maps.Marker({
                map: map,
                position: p,
                icon: icons.center.icon
            });
            searchNearby(p)
        }
    });
}
