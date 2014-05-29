var margin = {
    top: 50,
    bottom: 50,
    left: 50,
    right: 50
}

var width = parseInt(d3.select("#vis").style("width")) - margin.left - margin.right;
var height = parseInt(d3.select("#vis").style("height")) - margin.bottom - margin.top;