var map;

var latSchool;
var lngSchool;

var latParent;
var lngParent;

var markers = [];
var infoWindow;

var schools = [];
function prepareSchools()
{
    var schoolBR = new Object();
    schoolBR.id = 1;
    schoolBR.name = "Eleva";
    schoolBR.latlng = new google.maps.LatLng(-22.92152979652248, -43.235042095184326, 14);

    schools.push(schoolBR);

    var schoolPL = new Object();
    schoolPL.id = 2;
    schoolPL.name = "Adam Mickiewicz High School"
    schoolPL.latlng = new google.maps.LatLng(52.40251378780547, 16.939249634742737, 14);

    schools.push(schoolPL);
}

$(document).ready(function () {
    prepareSchools();
    //initialize();
    setSchools();
    //setInterval(function () { getActualPosition(); }, 5000);
})

function initialize() {
    var options = {
        zoom: 14,
        center: schools[0].latlng,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    map = new google.maps.Map(document.getElementById("mapa"), options);

    //Click and set options.
    //google.maps.event.addListener(map, 'click', function (event) {
    //    setText(event.latLng);
    //});
}

function setSchools() {
    $(schools).each(function (idx, item) {
        var option = $('<option />');
        option.attr('value', item.id).text(item.name);

        $('#schools').append(option);
    });
}
//function setText(latLng)
//{
//    $('#lat').val(latLng.lat());
//    $('#lon').val(latLng.lng());
//}

//function setSchool() {
//    latSchool = $('#lat').val();
//    lngSchool = $('#lon').val();

//    setMarker(latSchool, lngSchool, "School");
//}

//function setParent() {
//    latParent = $('#lat').val();
//    lngParent = $('#lon').val();

//    setMarker(latParent, lngParent, "Parent");
//}

function setMarker(latlng, text) {
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

function removeInfoWindowFromMap() {
    if (infoWindow != null) {
        infoWindow.setMap(null);
    }
}

function checkApproximation() {
    if (markers.length > 0 && infoWindow != null) {
        var distance = google.maps.geometry.spherical.computeDistanceBetween(markers[0].getPosition(), infoWindow.getPosition());
        if (distance > 2000) {
            $('#infoAboutDistance').text('The parent is ' + parseInt(distance) + ' meters of distance from the school');
        }
        else {
            $('#infoAboutDistance').text('ALERT! The parent is ' + parseInt(distance) + ' meters of distance from the school! Prepare the child.');
        }
    }
}

function getActualPosition()
{
    removeInfoWindowFromMap();

    infoWindow = new google.maps.InfoWindow({ map: map });

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {
            var pos = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };

            infoWindow.setPosition(pos);
            infoWindow.setContent('[Parent] You are here!');
            map.setCenter(pos);

            checkApproximation();
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

function chooseSchool() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {
            var pos = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
            checkApproximationSchool(pos);
        }, function () {
            handleError(true);
        });
    } else {
        // Browser doesn't support Geolocation
        handleError(false);
    }
}

function handleError(browserHasGeolocation) {
    alert(browserHasGeolocation ?
                          'Error: The Geolocation service failed.' :
                          'Error: Your browser doesn\'t support geolocation.');
}

function checkApproximationSchool(positionParent)
{
    var schoolId = $('#schools').find(":selected").val();
    var school = jQuery.grep(schools, function (item) {
        return (item.id == schoolId);
    });

    //var distance = google.maps.geometry.spherical.computeDistanceBetween(school[0].getPosition(), positionParent.getPosition());
    //$('#infoAboutDistance').text('Você está a ' + parseInt(distance) + ' metros de distancia da escola.');

    var service = new google.maps.DistanceMatrixService();
    service.getDistanceMatrix(
      {
          origins: [positionParent],
          destinations: [school[0].latlng],
          travelMode: 'DRIVING'
      }, callback);
}

function callback(response, status) {
    if (status == 'OK') {
        var origins = response.originAddresses;
        var destinations = response.destinationAddresses;

        for (var i = 0; i < origins.length; i++) {
            var results = response.rows[i].elements;
            for (var j = 0; j < results.length; j++) {
                var element = results[j];
                if (element.status == 'OK') {
                    var distance = element.distance.text;
                    var duration = element.duration.text;
                    $('#infoAboutDistance').text('Você está a ' + distance + ' de distancia da escola.');
                    $('#infoAboutTime').text('Você levará ' + duration + ' até chegar lá.');
                    $('#externalMap').attr('href', 'http://maps.google.com/maps?saddr=' + origins[0] + '&daddr= ' + destinations[0]);
                }
                else
                {
                    $('#infoAboutDistance').text('Não foi possivel encontrar rotas para esse endereço.');
                    $('#infoAboutTime').text('');
                    $('#externalMap').attr('href', '#');
                }
            }
        }
    }
}