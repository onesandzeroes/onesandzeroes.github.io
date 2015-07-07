function zip(arrays) {
    return arrays[0].map(function(_,i){
        return arrays.map(function(array){return array[i]})
    });
}

var full_width = 500;
var full_height = 500;

var a_param = 8;
var b_param = 4;

Physics(function( world ){

    var renderer = Physics.renderer('canvas', {
        el: 'viewport', // id of the canvas element
        width: full_width,
        height: full_height
    });
    world.add( renderer );

    var n_intervals = 1000;
    var interval_width = (0.99 - 0.01) / n_intervals;
    var thetas = [];
    var log_probs = [];

    for (index = 0; index < n_intervals; index++) {
        theta = 0.01 + index * interval_width
        thetas.push(theta);
        like = (Math.pow(theta, a_param - 1) * Math.pow((1 - theta), b_param - 1));
        neg_log_like = -1 * Math.log(like);
        log_probs.push(neg_log_like);
    }

    var x_scale = d3.scale.linear()
        .domain([0.01, 0.99])
        .range([0, full_width]);
    var y_scale = d3.scale.linear()
        .domain([0, d3.max(log_probs)])
        .range([full_height, 0]);

    for (index = 0; index < n_intervals; index++) {
        left_x = x_scale(thetas[index]);
        right_x = x_scale(thetas[index + 1]);
        left_y = y_scale(log_probs[index]);
        right_y = y_scale(log_probs[index + 1]);

        var point = Physics.body('point', {
            x: x_scale(thetas[index]),
            y: y_scale(log_probs[index]),
            treatment: 'static'
        });
        world.add(point);
    }

    // subscribe to ticker to advance the simulation
    Physics.util.ticker.on(function( time, dt ){
        world.step( time );
    });

    $('#viewport').on('click', function() {
        var times = [];
        var ball_positions = [];
        var steps = 0;
        var max_steps = Math.floor(Math.random() * (250 - 100) + 100);
        // start the ticker
        Physics.util.ticker.start();

        world.on('step', function(){
            world.render();
            steps = steps + 1;
            times.push(steps);
            ball_positions.push(x_scale.invert(ball.state.pos.x));
            create_graph(times, ball_positions, max_steps);

            if (steps == max_steps) {
                Physics.util.ticker.stop();
            }
        });
    });

    $('#reset-button').on('click', function() {
        world.remove(ball);
        Physics.util.ticker.stop();
        ball = create_ball();
    });

    // ensure objects bounce when edge collision is detected
    world.add( Physics.behavior('constant-acceleration') );
    world.add( Physics.behavior('body-impulse-response') );
    world.add( Physics.behavior('body-collision-detection') );
    world.add( Physics.behavior('sweep-prune') );

    create_ball = function() {
        var circle_radius = 10;
        var max_index = Math.floor(3 / 4 * n_intervals);
        var min_index = Math.floor(1 / 4 * n_intervals);
        var circle_theta_start = Math.floor((Math.random() * max_index + min_index));;
        var circle_x_start = x_scale(thetas[circle_theta_start]);
        var circle_y_start = y_scale(log_probs[circle_theta_start]) - circle_radius;

        var start_speed = Math.random() * (0.6 - 0.3) + 0.3;

        var go_left = Math.random() < 0.5;
        if (go_left) {
           start_speed = start_speed * - 1;
        }

        var ball = Physics.body('circle', {
            x: circle_x_start,
            y: circle_y_start,
            vx: start_speed,
            restitution: 0,
            cof: 0,
            radius: circle_radius
        });
        world.add(ball);
        world.render()

        return ball;
    };
    var ball = create_ball();

});

var padding = 40;

var svg = d3.select("body")
    .append("svg")
    .attr("width", full_width)
    .attr("height", full_height);
svg.append("path");
svg.append("g").attr("class", "x-axis");
svg.append("g").attr("class", "y-axis");

function create_graph(times, positions, max_steps) {
    var x_scale = d3.scale.linear()
        .domain([0.01, 0.99])
        .range([2 * padding, full_width - (2 * padding)]);
    var y_scale = d3.scale.linear()
        .domain([0, max_steps])
        .range([full_height - (2 * padding), 2 * padding]);
    var y_axis = d3.svg.axis()
        .ticks(10)
        .orient("left")
        .scale(y_scale);
    var x_axis = d3.svg.axis()
        .scale(x_scale)
        .ticks(10);

    var line_creator = d3.svg.line()
        .x(function(d) { return x_scale(d[0]); })
        .y(function(d) { return y_scale(d[1]); });

    dataset = zip([positions, times]);

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
        .attr("transform", "translate(0, " + (full_height - 2 * padding) + ")")
        .call(x_axis);
    svg.append("text")
        .attr("x", full_width / 2)
        .attr("y", full_height - padding + 10)
        .style("text-anchor", "middle")
        .text("Value of theta");
    svg.append("g")
        .attr("class", "axis")
        .attr("id", "y-axis")
        .attr("transform", "translate(" + (2 * padding) + ", 0)")
        .call(y_axis);
    svg.append("text")
        .attr("x", padding - 20)
        .attr("y", full_height / 2)
        .attr("transform", "rotate(270 " + (padding - 20) + "," + (full_height / 2) + ")")
        .style("text-anchor", "middle")
        .text("Number of steps");
}
