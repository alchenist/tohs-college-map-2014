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
    attribution: 'Imagery &copy; <a href="http://www.mapbox.com">Mapbox</a> | Corrections, comments, or questions? Contact us at <a href="mailto:thelancer.tohs@gmail.com">thelancer.tohs@gmail.com</a>' 
}).addTo(map);

queue()
    .defer(d3.csv, "data/data6.csv")
    .await(ready);
    
function ready(error, data) {
    var colleges = {};
    var rmlt = 2;
    var zoomStates = {
        start: map.getZoom(),
        end: map.getZoom()
    }
    
    // helper functions and stuff
    function r(d) {
        return Math.sqrt(d.students.length) * 4;
    };
    
    function latLngToPoint(latlng) {
        return map.project(latlng)._subtract(map.getPixelOrigin());
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
        
    function updateList(array) {
        var dests = d3.select("#students .list").selectAll("li")
            .data(array);
        
        // enter selection
        dests.enter().append("li");
        
        // enter and update
        // create header. then clear list 
        dests.attr("class", "dest").html(function(d) { 
            var output = "<div class='header'>" + d.name + "</div>\n<table>";
            d.students.forEach(function(e) { 
                output = output + "<tr><td>" + e['Full Name'] + "</td>" + "<td style='width:40%'>" + e['Notes'] + "</td>" + "</tr>\n";
            });
            output = output + "</table>"
            return output;
        });
        
        dests.on("click", function(d) { 
                map.setView([d.lat, d.lng], 8, {pan : {animate: true, duration: 0.5}, zoom: {animate: true}});
            });
        
        dests.exit().remove();
        
        var nameArray = array.map(function(el) { return el.name });
        
        d3.selectAll(".college")
            .attr("class", function(e) { 
                return (nameArray.indexOf(e.name) >= 0) ? "college selected" : "college";
            });
    };
    
    function filterCArray(str) {
        var temp = [];
        if (str == "") {
            return carray;
        };
        carray.forEach(function(el) {
            if (el.name.toUpperCase().indexOf(str.toUpperCase()) >= 0) {
                temp.push(el);
            } else {
                var temp2 = []  
                el.students.forEach(function (s) { 
                    if (s['Full Name'].toUpperCase().indexOf(str.toUpperCase()) >= 0) {
                        temp2.push(s)
                    }
                });
                if (temp2.length > 0) {
                    var el2 = jQuery.extend(true, {}, el);
                    el2.students = temp2;
                    temp.push(el2);
                };
            } 
        });
        return temp;
    };
    
    d3.select("#students .search").on("keyup", function() { 
        updateList(filterCArray(this.value));        
    });
    
    // view
    svg.append("g")
        .attr("class", "colleges")
      .selectAll(".college")
        .data(carray)
      .enter().append("g")
        .attr("class", "college")
        .on("mouseover", function(d) {
            d3.select(this).select("circle")
                .transition().duration(400).ease("bounce")
                .attr("r", function(d) { return r(d) * rmlt });
            
            updateList([d]);
        })
        .on("mouseout", function(d) {
            d3.select(this).select("circle")
                .transition().duration(400).ease("bounce")
                .attr("r", r);
            updateList(filterCArray(document.getElementsByClassName("search")[0].value));
        })
        .on("click", function(d) { 
            map.setView([d.lat, d.lng], 8, {pan : {animate: true, duration: 0.5}, zoom: {animate: true}});
            document.getElementsByClassName("search")[0].value = d.name;
        });

    
    svg.selectAll(".college").append("circle")
        .attr("cx", function(d) { var loc =  d['lat'] == "" ? null :  latLngToPoint(new L.LatLng(d['lat'], d['lng'])); return loc == null ? -50000: loc.x })
        .attr("cy", function(d) { var loc =  d['lat'] == "" ? null :  latLngToPoint(new L.LatLng(d['lat'], d['lng'])); return loc == null ? -50000 : loc.y })
        .attr("r", r);
        
    function update() {
        zoomStates.end = map.getZoom();
    
        svg.selectAll(".college").select("circle")
            .attr("cx", function(d) { var loc =  d['lat'] == "" ? null :  latLngToPoint(new L.LatLng(d['lat'], d['lng'])); return loc == null ? -50000 : loc.x })
            .attr("cy", function(d) { var loc =  d['lat'] == "" ? null :  latLngToPoint(new L.LatLng(d['lat'], d['lng'])); return loc == null ? -50000 : loc.y })
            .attr("r", function(d) { return r(d) * Math.pow(2, zoomStates.end - zoomStates.start) })
          .transition().duration(250)
            .attr("r", r);
            
        zoomStates.start = map.getZoom();
    };
    
    map.on("viewreset", update);
    updateList(carray);
}