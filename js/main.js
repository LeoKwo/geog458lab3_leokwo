// 1. Create a map object.
var mymap = L.map('map', {
    center: [40.035140, -97.292166],
    zoom: 5,
    maxZoom: 10,
    minZoom: 3,
    detectRetina: true});

// 2. Add a base map.
L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'
}).addTo(mymap);

// 3. Add cell towers GeoJSON Data
// Null variable that will hold cell tower data
var airports = null;

// 4. build up a set of colors from colorbrewer's dark2 category
var colors = chroma.scale('Set3').mode('lch').colors(2);

// 5. dynamically append style classes to this page. This style classes will be used for colorize the markers.
for (i = 0; i < 13; i++) {
    $('head').append($("<style> .marker-color-" + (i + 1).toString() + " { color: " + colors[i] + "; font-size: 10px; text-shadow: 0 0 3px #404040;} </style>"));
}

// Get GeoJSON and put on it on the map when it loads
airports = L.geoJson.ajax("assets/airports.geojson",{
    // assign a function to the onEachFeature parameter of the cellTowers object.
    // Then each (point) feature will bind a popup window.
    // The content of the popup window is the value of `feature.properties.company`
    onEachFeature: function (feature, layer) {
        // layer.bindPopup(feature.properties.AIRPT_NAME);
        layer.bindPopup(popupPhrase(feature));
        return feature.properties.STATE;
    },
    pointToLayer: function (feature, latlng) {
        var id = 0;
        if (feature.properties.CNTL_TWR == "Y") {
            return L.marker(latlng, {icon: L.divIcon({className: 'fas fa-plane marker-color-1'})});
        } else { // "N"
            return L.marker(latlng, {icon: L.divIcon({className: 'fas fa-paper-plane marker-color-2'})});
        }
    },
    attribution: 'Airports Data &copy; Data.gov | US States &copy; Mike Bostock | Base Map &copy; Stadia | Made By Leo Kwo'
}).addTo(mymap);

function popupPhrase(feature) {
    var phrase1 = ' is';
    var phrase2 = 'an airport with Control Tower.';
    if (feature.properties.CNTL_TWR == "Y") {
        return feature.properties.AIRPT_NAME + phrase1 + ' ' + phrase2;
    } else {
        return feature.properties.AIRPT_NAME + phrase1 + ' NOT ' + phrase2;
    }
}

// 6. Set function for color ramp
colors = chroma.scale(['00ffff', '0093ee', '001492']).colors(5);

function setColor(count) {
    var id = 0;
    if (count >= 19) {
        id = 4;
    } else if (count >= 13) {
        id = 3;
    } else if (count >= 11) {
        id = 2;
    } else if (count >= 7) {
        id = 1;
    } else { // >= 0
        id = 0;
    }

    return colors[id];
}

// 7. Set style function that sets fill color.md property equal to cell tower density
function style(feature) {
    return {
        fillColor: setColor(feature.properties.count),
        fillOpacity: 0.5,
        weight: 0.5,
        opacity: 1,
        color: '#e9e9e9',
        dashArray: '3'
    };
}

// 8. Add county polygons
// create counties variable, and assign null to it.
var states = null;
states = L.geoJson.ajax("assets/us-states.geojson", {
    style: style
}).addTo(mymap);

// 9. Create Leaflet Control Object for Legend
var legend = L.control({position: 'topright'});

// 10. Function that runs when legend is added to map
legend.onAdd = function () {
    // Create Div Element and Populate it with HTML
    var div = L.DomUtil.create('div', 'legend');
    div.innerHTML += '<b>Count of Airports within a State</b><br />';
    div.innerHTML += '<i style="background: ' + colors[4] + '; opacity: 0.5"></i><p> 19+ </p>';
    div.innerHTML += '<i style="background: ' + colors[3] + '; opacity: 0.5"></i><p> 13-18 </p>';
    div.innerHTML += '<i style="background: ' + colors[2] + '; opacity: 0.5"></i><p> 11-12 </p>';
    div.innerHTML += '<i style="background: ' + colors[1] + '; opacity: 0.5"></i><p> 7-10 </p>';
    div.innerHTML += '<i style="background: ' + colors[0] + '; opacity: 0.5"></i><p> 1-6 </p>';
    div.innerHTML += '<hr><b>Airport Type<b><br />';
    div.innerHTML += '<i class="fas fa-plane marker-color-1"></i><p> Airport with Control Tower </p>';
    div.innerHTML += '<i class="fas fa-paper-plane marker-color-2"></i><p> Airport without Control Tower </p>';
    // Return the Legend div containing the HTML content
    return div;
};

// 11. Add a legend to map
legend.addTo(mymap);

// 12. Add a scale bar to map
L.control.scale({position: 'bottomleft'}).addTo(mymap);

// 13. Optional: Minimap
function style2(feature) {
    return {
        fillColor: setColor(feature.properties.count),
        fillOpacity: 0.5,
        weight: 0
    };
}
var basemap = 'https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png';
var minimapOverlay = new L.TileLayer(basemap, {minZoom: 0, maxZoom: 13});
var states2 = L.geoJson.ajax("assets/us-states.geojson", {
    style: style2
})
var layers = new L.LayerGroup([minimapOverlay, states2]);
var miniMap = new L.Control.MiniMap(layers, {
    toggleDisplay: true,
    minimized: false,
    position: 'topleft',
    aimingRectOptions: {
        Color: '#001492',
        fillColor: '#ffffff',
        fillOpacity: '0.4',
        weight: '1.5',
        lineCap: 'round'}
    }).addTo(mymap);
