var city_width = 30;
var city_height = 30;

var min_neighbours = 3;

var n_iterations = 100000;
var update_duration = 0.01;

var tile_width = 10;
var tile_height = 10;

var sim_running = false;

var blue_colour = "#5050ff";
var red_colour = "#ff5050";
var empty_colour = "#cccccc";
var colour_table = {
    "b": blue_colour,
    "r": red_colour,
    "-": empty_colour
};

var CitySim = function(width, height) {
    this.width = width;
    this.height = height;
    this.cells = [];
    this.sim_running = false;
    var row_num, col_num;

    this.total_cells = city_width * city_height;
    this.n_blue = Math.floor(0.45 * this.total_cells);
    this.n_red = Math.floor(0.45 * this.total_cells);

    for (row_num = 0; row_num < height; row_num++) {
        this.cells[row_num] = [];
        for (col_num = 0; col_num < width; col_num++) {
            this.cells[row_num][col_num] = '-';
        }
    }

    this.init_cells();
};

CitySim.prototype.init_cells = function() {
    var blue_num, red_num;
    for (blue_num = 0; blue_num < this.n_blue; blue_num++) {
        empty_coords = this.find_empty_tile();
        this.cells[empty_coords[0]][empty_coords[1]] = 'b';
    }
    for (red_num = 0; red_num < this.n_red; red_num++) {
    empty_coords = this.find_empty_tile();
        this.cells[empty_coords[0]][empty_coords[1]] = 'r';
    }
};

CitySim.prototype.get_random_coord = function() {
    var row, col;
    row = get_random_index(this.height);
    col = get_random_index(this.width);
    return [row, col];
};

CitySim.prototype.find_empty_tile = function () {
    var found = false;
    var coord;
    while (! found) {
        coord = this.get_random_coord();
        if (this.cells[coord[0]][coord[1]] == "-") {
            found = true;
        }
    }
    return coord;
};

CitySim.prototype.find_occupied_tile = function() {
    var found = false;
    var coord;
    while (! found) {
        coord = this.get_random_coord();
        if (this.cells[coord[0]][coord[1]] != "-") {
            found = true;
        }
    }
    return coord;
};

CitySim.prototype.get_neighbours = function(coord) {
    var row = coord[0];
    var col = coord[1];
    var neighbour_contents = [];

    var x_offset, y_offset;
    for (x_offset of [-1, 0, 1]) {
        for (y_offset of [-1, 0, 1]) {
            if ((x_offset === 0) && (y_offset === 0)) {
                continue;
            }

            neighbour_row = row + y_offset;
            neighbour_col = col + x_offset;

            // Ignore out-of-bounds indices
            if (this.cells[neighbour_row] !== undefined) {
                if (this.cells[neighbour_row][neighbour_col] !== undefined) {
                    neighbour_contents.push(this.cells[neighbour_row][neighbour_col]);
                }
            }
        }
    }

    return neighbour_contents;
};


CitySim.prototype.check_happiness = function(coord) {
    // return true if house has enough similar neighbours to be happy
    var house = this.cells[coord[0]][coord[1]];
    var neighbours = this.get_neighbours(coord);
    var match_count = 0;
    neighbours.forEach(function(neighbour, index) {
        if (neighbour == house) {
            match_count += 1;
        }
    });
    return match_count >= min_neighbours;
};

CitySim.prototype.do_sim_step = function() {
    var random_house_coord = this.find_occupied_tile();
    var is_happy = this.check_happiness(random_house_coord);

    // Animation for happy houses here?
    if (is_happy) {
        return;
    } else {
        var current_row = random_house_coord[0];
        var current_col = random_house_coord[1];
        var current_colour = this.cells[current_row][current_col];
        var new_house = this.find_empty_tile();
        var new_row = new_house[0];
        var new_col = new_house[1];

        this.cells[current_row][current_col] = '-';
        this.cells[new_row][new_col] = current_colour;
    }
};

function get_random_index(n_choices) {
    var index = Math.floor(Math.random() * n_choices);
    return index;
}

function create_city_view(city) {
    var view_div = d3.selectAll("#chart_div");
    // Ensure we've cleared any existing view
    view_div.selectAll("*").remove();
    view_div.attr("width", city.width * tile_width)
        .attr("height", city.height * tile_height);

    var svg = view_div
        .append("svg")
        .attr("width", city.width * tile_width)
        .attr("height", city.height * tile_height)
        .attr("id", "chart_svg");

    svg.append("g")
        .attr("id", "main_area")
        .attr("width", tile_width * city.width)
        .attr("height", tile_height * city.height)
        .selectAll("g")
        .data(city.cells)
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
                return colour_table[d];
        });
}

city_obj = new CitySim(city_width, city_height);
create_city_view(city_obj);

var reset_button = d3.select("#reset_button")
    .on("click", function() {
        city_obj = new CitySim(city_width, city_height);
        create_city_view(city_obj);
    });


var row_editor = d3.select("#width_input")
    .on("change", function() {
        sim_running = false;
        city_width = parseInt(document.getElementById("width_input").value, 10);
        city_obj = new CitySim(city_width, city_height);
        create_city_view(city_obj);
    });

var col_editor = d3.select("#height_input")
    .on("change", function() {
        sim_running = false;
        city_height = parseInt(document.getElementById("height_input").value, 10);
        city_obj = new CitySim(city_width, city_height);
        create_city_view(city_obj);
    });

function stop_simulation() {
    start_button.text("Start");
    start_button.on("click", run_simulation);
    city_obj.sim_running = false;
}

var start_button = d3.select("#start_button")
    .on("click", run_simulation);

function run_simulation() {
    console.log("Starting simulation");
    city_obj.sim_running = true;
    var current_iteration = 0;
    var update_every = 50;
    start_button.text("Stop");
    var sim_timer = d3.timer(function(elapsed) {
        current_iteration += 1;
        if (current_iteration > n_iterations) {
            return true;
        }
        if (! city_obj.sim_running) {
            return true;
        }
        city_obj.do_sim_step();
        if ((current_iteration % update_every) === 0) {
            console.log("Updating view");
            update_city();
        }
    }, update_duration);
    start_button.on("click", stop_simulation);
}


function update_city() {
    var svg = d3.select("#chart_svg");
    svg.select("#main_area")
        .attr("width", tile_width * city_obj.width)
        .attr("height", tile_height * city_obj.height)
        .selectAll("g")
        .data(city_obj.cells)
        .selectAll("rect")
        .data(function(d, i, j) { return d; })
        .transition()
            .duration(500)
            .style("fill", function(d) {
                return colour_table[d];
            });
}
