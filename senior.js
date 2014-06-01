var margin = {
    top: 0,
    bottom: 0,
    left: 0,
    right: 0
};
var width = parseInt(d3.select("#vis").style("width")) - margin.left - margin.right;
var height = parseInt(d3.select("#vis").style("height")) - margin.bottom - margin.top;
var map = L.map('vis', {minZoom: 3}).setView([39.828, -98.58], 4);
map.setMaxBounds([[-85.0, -180.0], [85.0, 180.0]]);
map._initPathRoot();
var canvas = d3.select("#vis").select("svg");
var svg = canvas.append("g")
    .attr({
        transform: "translate(" + margin.left + "," + margin.top + ")"
    });
L.tileLayer('http://{s}.tiles.mapbox.com/v3/alchenist.icdhlj9g/{z}/{x}/{y}.png', {
    attribution: 'Imagery &copy; <a href="http://www.mapbox.com">Mapbox</a>' 
}).addTo(map);

queue()
    .defer(d3.csv, "data/data5.csv")
    .await(ready);
    
function ready(error, data) {
    var colleges = {};
    var rmlt = 2;
    
    // helper functions and stuff
    function r(d) {
        return Math.sqrt(d.students.length) * 4;
    };
    
    function latLngToPoint(latlng) {
        return map.project(latlng)._subtract(map.getPixelOrigin());
    };
    
    function ls(d) {
        var e = d;
        e['type'] = "LineString";
        e['coordinates'] = [[-118.8750, 34.1894], [d['lng'], d['lat']]];
        return e;
    };
    
    // geo stuff
    var t = d3.geo.transform({
        point: function(x, y) {
            var point = latLngToPoint(new L.LatLng(y, x));
            return this.stream.point(point.x, point.y);
        }
    });
    
    var path = d3.geo.path()
        .projection(t);
        
    // cluster data
    data.forEach(function (d) {
        if (d['Destination'] in colleges) {
            colleges[d['Destination']]['students'].push(d)
        } else {
            colleges[d['Destination']] = {
                students: [d],
                lat: d['lat'],
                lng: d['lng'],
                name: d['Destination']
            }
        }
    })
    
    var carray = $.map(colleges, function(value, index) { return [value]; });
    carray.forEach(function (d) {
        d = ls(d);
    });
    
    // view
    svg.append("g")
        .attr("class", "colleges")
      .selectAll(".college")
        .data(carray)
      .enter().append("g")
        .attr("class", "college")
        .on("mouseover", function(d) { console.log(d.name); 
            d3.select(this).select("circle")
                .transition().duration(400).ease("bounce")
                .attr("r", function(d) { return r(d) * rmlt });
            d3.select("#overview").text(d.name + " " + d.students.length);
            var studentlist = d3.select("#students ul").selectAll("li").data(d.students)
                .text(function(e) { return e['Full Name'] });
                
            studentlist.enter().append("li")
                .text(function(e) { return e['First Name'] + " " + e['Last Name'] });
            studentlist.exit().remove();
              
        })
        .on("mouseout", function(d) { 
            d3.select(this).select("circle")
                .transition().duration(400).ease("bounce")
                .attr("r", r);
        })

    
    svg.selectAll(".college").append("circle")
        .attr("cx", function(d) { var loc =  d['lat'] == "" ? null :  latLngToPoint(new L.LatLng(d['lat'], d['lng'])); return loc == null ? -50000: loc.x })
        .attr("cy", function(d) { var loc =  d['lat'] == "" ? null :  latLngToPoint(new L.LatLng(d['lat'], d['lng'])); return loc == null ? -50000 : loc.y })
        .attr("r", r);
        
    var zoomStates = {
        start: map.getZoom(),
        end: map.getZoom()
    }
        
    function update() {
        zoomStates.end = map.getZoom();
        console.log(zoomStates);
        console.log(map.getBounds());
    
        svg.selectAll(".college").select("circle")
            .attr("cx", function(d) { var loc =  d['lat'] == "" ? null :  latLngToPoint(new L.LatLng(d['lat'], d['lng'])); return loc == null ? -50000 : loc.x })
            .attr("cy", function(d) { var loc =  d['lat'] == "" ? null :  latLngToPoint(new L.LatLng(d['lat'], d['lng'])); return loc == null ? -50000 : loc.y })
            .attr("r", function(d) { return r(d) * Math.pow(2, zoomStates.end - zoomStates.start) })
          .transition().duration(250)
            .attr("r", r);
            
        zoomStates.start = map.getZoom();
    };
    
    map.on("viewreset", update);
}