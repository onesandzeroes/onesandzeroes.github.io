function beta_density(y, alpha, beta) {
    var numerator = Math.pow(y, (alpha - 1)) * Math.pow((1 - y), (beta - 1));
    var denominator = (gamma(alpha) * gamma(beta)) / gamma(alpha + beta);
    return numerator / denominator;
}

function zip(arrays) {
    return arrays[0].map(function(_,i){
        return arrays.map(function(array) {
            return array[i];
        });
    });
}

function create_graph() {
    var alpha = parseFloat(document.getElementById("alpha-value").innerHTML);
    var beta = parseFloat(document.getElementById("beta-value").innerHTML);

    var densities = [];
    for (var i = 0; i < y_vals.length; i++) {
      var new_d = beta_density(y_vals[i], alpha, beta);
      densities.push(new_d);
    }
    var dataset = zip([y_vals, densities]);

    var x_scale = d3.scale.linear()
        .domain([0, 1])
        .range([2 * padding, width - (1 *padding)]);
    var x_axis = d3.svg.axis()
        .scale(x_scale)
        .ticks(10);
    var y_scale = d3.scale.linear()
        .domain([0, d3.max(dataset, function(d) {return d[1];})])
        .range([height - (2 * padding), 1 * padding]);
    var y_axis = d3.svg.axis()
        .ticks(10)
        .orient("left")
        .scale(y_scale);

    var line_creator = d3.svg.line()
        .x(function(d) { return x_scale(d[0]); })
        .y(function(d) { return y_scale(d[1]); });

    svg.select("path")
        .attr("class", "data-line")
        .attr("stroke", "red")
        .attr("fill", "white")
        .transition()
        .duration(800)
        .ease("bounce   ")
        .attr("d", line_creator(dataset));

    svg.select("#x-axis").remove();

    svg.select("#y-axis").remove();

    svg.append("g")
        .attr("class", "axis")
        .attr("id", "x-axis")
        .attr("transform", "translate(0, " + (height - 2 * padding) + ")")
        .call(x_axis);
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height - padding + 10)
        .style("text-anchor", "middle")
        .text("y");
    svg.append("g")
        .attr("class", "axis")
        .attr("id", "y-axis")
        .attr("transform", "translate(" + (2 * padding) + ", 0)")
        .call(y_axis);
    svg.append("text")
        .attr("x", padding - 20)
        .attr("y", height / 2)
        .style("text-anchor", "middle")
        .text("f(y)");
}

function update_graph() {
    var alpha = parseFloat(document.getElementById("alpha-value").innerHTML);
    var beta = parseFloat(document.getElementById("beta-value").innerHTML);

    var densities = [];
    for (var i = 0; i < y_vals.length; i++) {
      var new_d = beta_density(y_vals[i], alpha, beta);
      densities.push(new_d);
    }
    var dataset = zip([y_vals, densities]);

    var x_scale = d3.scale.linear()
        .domain([0, 1])
        .range([2 * padding, width - (2 *padding)]);
    var y_scale = d3.scale.linear()
        .domain([0, d3.max(dataset, function(d) {return d[1];})])
        .range([height - (2 * padding), 2 * padding]);
    var y_axis = d3.svg.axis()
        .ticks(10)
        .orient("left")
        .scale(y_scale);

    var line_creator = d3.svg.line()
        .x(function(d) { return x_scale(d[0]); })
        .y(function(d) { return y_scale(d[1]); });

    svg.select("path")
        .attr("class", "data-line")
        .attr("stroke", "red")
        .attr("fill", "white")
        .transition()
        .duration(800)
        .ease("bounce   ")
        .attr("d", line_creator(dataset));

    svg.select("#y-axis")
        .transition()
        .duration(800)
        .call(y_axis);
}

$(function() {
    $( "#alpha-slider" ).slider({
        value: 0.5,
        min: 0.1,
        max: 10.0,
        step: 0.1,
        change: function(event, ui) {
            var alpha_val = document.getElementById("alpha-value");
            alpha_val.innerHTML = ui.value;
            update_graph();
        }
    });
});
$(function() {
    $( "#beta-slider" ).slider({
        value: 0.5,
        min: 0.1,
        max: 10.0,
        step: 0.1,
        change: function(event, ui) {
            var beta_val = document.getElementById("beta-value");
            beta_val.innerHTML = ui.value;
            update_graph();
        }
    });
});

var width = 500;
var height = 500;
var padding = 40;
var y_vals = numeric.linspace(0.01, 0.99, 100);

var svg = d3.select("#plot_area")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

svg.append("rect")
    .attr("width", width)
    .attr("height", height)
    .attr("fill", "white")
    .attr("stroke", "black")
    .attr("stroke-width", "1px");
svg.append("path");
svg.append("g").attr("class", "x-axis");
svg.append("g").attr("class", "y-axis");

create_graph();

eq_div = document.getElementById("beta-equation");
katex.render("f(y) = \\left[ \\frac{\\Gamma(\\alpha + \\beta)}{\\Gamma(\\alpha) \\Gamma(\\beta)} \\right] y^{\\alpha - 1} (1 - y)^{\\beta - 1}", eq_div);
