var margin = {
    top: 0,
    bottom: 0,
    left: 0,
    right: 0
}

var width = parseInt(d3.select("#vis").style("width")) - margin.left - margin.right;
var height = parseInt(d3.select("#vis").style("height")) - margin.bottom - margin.top;

var map = L.map('vis').setView([39.828, -98.58], 4);

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
    .defer(d3.csv, "data/data2.csv")
    .await(ready);
    
function ready(error, data) {
    var colleges = {};
    
    function latLngToPoint(latlng) {
        return map.project(latlng)._subtract(map.getPixelOrigin());
    };
    
    var t = d3.geo.transform({
        point: function(x, y) {
            var point = latLngToPoint(new L.LatLng(y, x));
            return this.stream.point(point.x, point.y);
        }
    });
    
    var path = d3.geo.path()
        .projection(t);
        
    function ls(d) {
        var e = d;
        e['type'] = "LineString";
        e['coordinates'] = [[-118.8750, 34.1894], [d['lng'], d['lat']]];
        return e;
    };
        
    data.forEach(function (d) {
        if (d['University'] in colleges) {
            colleges[d['University']]['students'].push(d)
        } else {
            colleges[d['University']] = {
                students: [d],
                lat: d['lat'],
                lng: d['lng'],
                name: d['University']
            }
        }
    })
    
    var test = $.map(colleges, function(value, index) { return [value]; });
    
    test.forEach(function (d) {
        d = ls(d);
    });
    
    svg.append("g")
        .attr("class", "colleges")
      .selectAll(".college")
        .data(test)
      .enter().append("g")
        .attr("class", "college")
        .on("mouseover", function(d) { console.log(d.name); 
            d3.select(this).select("circle")
                .transition().duration(400).ease("bounce")
                .attr("r", function(d) { return (Math.sqrt(d.students.length) * Math.pow(2, map.getZoom() ))/8 });
            d3.select(this).select("path")
                .transition().duration(100)
                .style("stroke", "red")
                .style("opacity", .5);
        })
        .on("mouseout", function(d) { 
            d3.select(this).select("circle")
                .transition().duration(400).ease("bounce")
                .attr("r", function(d) { return (Math.sqrt(d.students.length) * Math.pow(2, map.getZoom() ))/32 });
            d3.select(this).select("path")
                .transition().duration(100)
                .style("stroke", null)
                .style("opacity", null);
        })
        
    svg.selectAll(".college").append("path")
        .attr("class", "arc")
        .attr("d", path)
        .style("stroke-width", function (d) { return (Math.sqrt(d.students.length) * Math.pow(2, map.getZoom() ))/16 });
        
    svg.selectAll(".college").append("circle")
        .attr("cx", function(d) { var loc = latLngToPoint(new L.LatLng(d['lat'], d['lng'])); return loc == null ? null : loc.x })
        .attr("cy", function(d) { var loc = latLngToPoint(new L.LatLng(d['lat'], d['lng'])); return loc == null ? null : loc.y })
        .attr("r", function(d) { return (Math.sqrt(d.students.length) * Math.pow(2, map.getZoom() ))/32 });
        
    var zoomStates = {
        start: map.getZoom(),
        end: map.getZoom()
    }
        
    function update() {
        console.log(map.getZoom());
        svg.selectAll(".college").select("path")
            .attr("d", path)
            .style("stroke-width", function (d) { return (Math.sqrt(d.students.length) * Math.pow(2, map.getZoom() ))/16 });
    
        svg.selectAll(".college").select("circle")
            .attr("cx", function(d) { var loc = latLngToPoint(new L.LatLng(d['lat'], d['lng'])); return loc == null ? null : loc.x })
            .attr("cy", function(d) { var loc = latLngToPoint(new L.LatLng(d['lat'], d['lng'])); return loc == null ? null : loc.y })
            .attr("r", function(d) { return (Math.sqrt(d.students.length) * Math.pow(2, map.getZoom() ))/32  });
    };
    
    map.on("viewreset", update);
    
    console.log(colleges);
    console.log(test);
}