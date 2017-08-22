var map;

var latSchool;
var lngSchool;

var latParent;
var lngParent;

var markers = [];

$(document).ready(function () {
    initialize(-22.9103552, -43.7285337);
})

function initialize(lat, lon) {
    var latlng = new google.maps.LatLng(lat, lon, 14);
    var options = {
        zoom: 9,
        center: latlng,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    map = new google.maps.Map(document.getElementById("mapa"), options);

    google.maps.event.addListener(map, 'click', function (event) {
        setText(event.latLng);
    });
}

function setText(latLng)
{
    $('#lat').val(latLng.lat());
    $('#lon').val(latLng.lng());
}

function setSchool() {
    latSchool = $('#lat').val();
    lngSchool = $('#lon').val();

    setMarker(latSchool, lngSchool, "School");
}

function setParent() {
    latParent = $('#lat').val();
    lngParent = $('#lon').val();

    setMarker(latParent, lngParent, "Parent");
}

function setMarker(lat, lng, text) {
    var latParsed = parseFloat(lat);
    var lngParsed = parseFloat(lng);

    var latlng = new google.maps.LatLng(latParsed, lngParsed);

    var marker = new google.maps.Marker({
        position: latlng,
        title: text
    });

    removeMarker(text);
    marker.setMap(map);
    markers.push(marker);
}

function removeMarker(comparer)
{
    markers = jQuery.grep(markers, function (marker) {
        if (marker.title == comparer)
        {
            removeMarkerFromMap(marker);
        }

        return marker.title != comparer;
    });
}

function removeMarkerFromMap(marker)
{
    marker.setMap(null);
}

function checkApproximation()
{
    var distance = google.maps.geometry.spherical.computeDistanceBetween(markers[0].getPosition(), markers[1].getPosition());
    if (distance > 2000) {
        alert('The parent is not close to the school. When he reaches less than 2km it will be considered "near"');
    }
    else
    {
        alert('THE PARENT IS FUCKIN NEAR! PREPARE HIS FUCKIN CHILD!!');
    }

    $('#distance').val(distance);
}

function getActualPosition()
{
    var infoWindow = new google.maps.InfoWindow({ map: map });

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {
            var pos = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };

            infoWindow.setPosition(pos);
            infoWindow.setContent('Location found.');
            map.setCenter(pos);
        }, function () {
            handleLocationError(true, infoWindow, map.getCenter());
        });
    } else {
        // Browser doesn't support Geolocation
        handleLocationError(false, infoWindow, map.getCenter());
    }
}

function handleLocationError(browserHasGeolocation, infoWindow, pos) {
    infoWindow.setPosition(pos);
    infoWindow.setContent(browserHasGeolocation ?
                          'Error: The Geolocation service failed.' :
                          'Error: Your browser doesn\'t support geolocation.');
}