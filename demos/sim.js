var city_width = 30;
var city_height = 30;

var min_neighbours = 3;

var n_iterations = 100000;
var update_duration = 0.01;

var tile_width = 10;
var tile_height = 10;

var sim_running = false;


function create_city() {
    var new_city = [];
    var row_num, col_num;
    console.log([city_width, city_height]);

    var total_cells = city_width * city_height;
    var n_blue = Math.floor(0.45 * total_cells);
    var n_red = Math.floor(0.45 * total_cells);

    for (row_num = 0; row_num < city_height; row_num++) {
        new_city[row_num] = [];
        for (col_num = 0; col_num < city_width; col_num++) {
            new_city[row_num][col_num] = '-';
        }
    }
    init_city(new_city, n_blue, n_red);
    return new_city;
}


function get_random_index(n_choices) {
    var index = Math.floor(Math.random() * n_choices);
    return index;
}

function get_random_coord(height, width) {
    var row, col;
    row = get_random_index(height);
    col = get_random_index(width);
    return [row, col];
}

function find_empty_tile(city) {
    var found = false;
    var coord;
    while (! found) {
        coord = get_random_coord(city_height, city_width);
        if (city[coord[0]][coord[1]] == "-") {
            found = true;
        }
    }
    return coord;
}

function find_occupied_tile(city) {
    var found = false;
    var coord;
    while (! found) {
        coord = get_random_coord(city_height, city_width);
        if (city[coord[0]][coord[1]] != "-") {
            found = true;
        }
    }
    return coord;
}

function init_city(city, n_blue, n_red) {
    var blue_num;
    for (blue_num = 0; blue_num < n_blue; blue_num++) {
        empty_coords = find_empty_tile(city);
        city[empty_coords[0]][empty_coords[1]] = 'b';
    }
    for (red_num = 0; red_num < n_red; red_num++) {
        empty_coords = find_empty_tile(city);
        city[empty_coords[0]][empty_coords[1]] = 'r';
    }
}

function get_neighbours(city, coord) {
    var row = coord[0];
    var col = coord[1];
    var offsets = [
        [-1, -1], [-1, 0], [-1, 1],
        [0, -1], [0, 1],
        [1, -1], [1, 0], [1, 1]
    ];

    var neighbour_contents = [];
    offsets.forEach(function(offset, index) {
        var neighbour_row, neighbour_col;
        neighbour_row = row + offset[0];
        neighbour_col = col + offset[1];

        // Ignore out-of-bounds indices
        if (city[neighbour_row] !== undefined) {
            if (city[neighbour_row][neighbour_col] !== undefined) {
                neighbour_contents.push(city[neighbour_row][neighbour_col]);
            }
        }
    });
    return neighbour_contents;
}


function check_happiness(city, coord) {
    // return true if house has enough similar neighbours to be happy
    var house = city[coord[0]][coord[1]];
    var neighbours = get_neighbours(city, coord);
    var match_count = 0;
    neighbours.forEach(function(neighbour, index) {
        if (neighbour == house) {
            match_count += 1;
        }
    });
    return match_count >= min_neighbours;
}

function do_iteration(city) {
    var random_house_coord = find_occupied_tile(city);
    var is_happy = check_happiness(city, random_house_coord);

    // Animation for happy houses here?
    if (is_happy) {
        return;
    } else {
        var current_row = random_house_coord[0];
        var current_col = random_house_coord[1];
        var current_colour = city[current_row][current_col];
        var new_house = find_empty_tile(city);
        var new_row = new_house[0];
        var new_col = new_house[1];

        city[current_row][current_col] = '-';
        city[new_row][new_col] = current_colour;
    }
}

function create_city_view(city) {
    var view_div = d3.selectAll("#chart_div");
    // Ensure we've cleared any existing view
    view_div.selectAll("*").remove();
    view_div.attr("width", city_width * tile_width)
        .attr("height", city_height * tile_height);

    var svg = view_div
        .append("svg")
        .attr("width", city_width * tile_width)
        .attr("height", city_height * tile_height)
        .attr("id", "chart_svg");

    svg.append("g")
        .attr("id", "main_area")
        .attr("width", tile_width * city_width)
        .attr("height", tile_height * city_height)
        .selectAll("g")
        .data(city)
        .enter()
        .append("g")
        .selectAll("rect")
        .data(function(d, i, j) { return d; })
        .enter()
        .append("rect")
        .attr("x", function(d, i, j) { return i * tile_width; })
        .attr("y", function(d, i, j) { return j * tile_height; })
        .attr("width", tile_width)
        .attr("height", tile_height)
        .style("fill", function(d) {
                var fill_colour;
                if (d == "b") {
                    fill_colour = d3.rgb(99, 99, 255);
                }
                if (d == "r") {
                    fill_colour = d3.rgb(255, 99, 99);
                }
                if (d == "-") {
                    fill_colour = d3.rgb(220, 220, 220);
                }
                return fill_colour;
        });
}

city_array = create_city();
create_city_view(city_array);

var reset_button = d3.select("#reset_button")
    .on("click", function() {
        city_array = create_city();
        create_city_view(city_array);
    });


var row_editor = d3.select("#width_input")
    .on("change", function() {
        sim_running = false;
        city_width = parseInt(document.getElementById("width_input").value, 10);
        city_array = create_city();
        create_city_view(city_array);
    });

var col_editor = d3.select("#height_input")
    .on("change", function() {
        sim_running = false;
        city_height = parseInt(document.getElementById("height_input").value, 10);
        city_array = create_city();
        create_city_view(city_array);
    });

var start_button = d3.select("#start_button")
    .on("click", run_simulation);

function run_simulation() {
    function stop_simulation() {
        start_button.text("Start");
        start_button.on("click", run_simulation);
        sim_running = false;
    }

    console.log("Starting simulation");
    sim_running = true;
    var current_iteration = 0;
    var update_every = 50;
    start_button.text("Stop");
    var sim_timer = d3.timer(function(elapsed) {
        current_iteration += 1;
        if (current_iteration > n_iterations) {
            return true;
        }
        if (! sim_running) {
            return true;
        }
        do_iteration(city_array);
        if ((current_iteration % update_every) === 0) {
            update_city();
        }
    }, update_duration);
    start_button.on("click", stop_simulation);
}


function update_city() {
    var svg = d3.select("#chart_svg");
    svg.select("#main_area")
        .attr("width", tile_width * city_width)
        .attr("height", tile_height * city_height)
        .selectAll("g")
        .data(city_array)
        .selectAll("rect")
        .data(function(d, i, j) { return d; })
        .transition()
            .duration(500)
            .style("fill", function(d) {
                var fill_colour;
                if (d == "b") {
                    fill_colour = d3.rgb(99, 99, 255);
                }
                if (d == "r") {
                    fill_colour = d3.rgb(255, 99, 99);
                }
                if (d == "-") {
                    fill_colour = d3.rgb(220, 220, 220);
                }
                return fill_colour;
            });
}
