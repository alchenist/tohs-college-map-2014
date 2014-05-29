var margin = {
    top: 50,
    bottom: 50,
    left: 50,
    right: 50
}

var width = parseInt(d3.select("#vis").style("width")) - margin.left - margin.right;
var height = parseInt(d3.select("#vis").style("height")) - margin.bottom - margin.top;

var canvas = d3.select("div#vis").append("svg")
    .attr("id", "canvas");
    
var svg = canvas.append("g")
    .attr({
        transform: "translate(" + margin.left + "," + margin.top + ")"
    });

queue()
    .defer(d3.csv, "data/data2.csv")
    .defer(d3.json, "data/states.json")
    .await(ready);
    
function ready(error, data, states) {
    var colleges = {};
    
    var projection = d3.geo.albers()
        .scale(1200)
        .translate([width/2, height/2]);
    
    var path = d3.geo.path()
        .projection(projection);
        
    function ls(d) {
        var e = d;
        e['type'] = "LineString";
        e['coordinates'] = [[-118.8750, 34.1894], [d['lng'], d['lat']]];
        return e;
    };
    
    svg.selectAll(".state")
        .data(states.features)
      .enter().append("path")
        .attr("class", "state")
        .attr("d", path);
        
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
    
    svg.append("g")
        .attr("class", "colleges")
      .selectAll(".college")
        .data(test)
      .enter().append("g")
        .attr("class", "college")
        .on("mouseover", function(d) { console.log(d.name); 
            d3.select(this).select("circle")
                .transition().duration(400).ease("bounce")
                .attr("r", function(d) { return 5*Math.sqrt(d.students.length) });
            d3.select(this).select("path")
                .transition().duration(100)
                .style("stroke", "springgreen")
                .style("opacity", .5);
        })
        .on("mouseout", function(d) { 
            d3.select(this).select("circle")
                .transition().duration(400).ease("bounce")
                .attr("r", function(d) { return Math.sqrt(d.students.length) });
            d3.select(this).select("path")
                .transition().duration(100)
                .style("stroke", null)
                .style("opacity", null);
        })
        
    svg.selectAll(".college").append("path")
        .attr("class", "arc")
        .datum(function(d) { return ls(d) })
        .attr("d", path)
        .style("stroke-width", function (d) { return Math.sqrt(d.students.length) * 2 });
        
    svg.selectAll(".college").append("circle")
        .attr("cx", function(d) { var loc = projection([d['lng'], d['lat']]); return loc == null ? null : loc[0] })
        .attr("cy", function(d) { var loc = projection([d['lng'], d['lat']]); return loc == null ? null : loc[1] })
        .attr("r", function(d) { return Math.sqrt(d.students.length) });
    
    console.log(colleges);
    console.log(test);
}