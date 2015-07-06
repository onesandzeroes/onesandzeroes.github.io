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

  var n_intervals = 50;
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
  console.log(log_probs)

  var x_scale = d3.scale.linear()
      .domain([0, 1])
      .range([0, full_width]);
  var y_scale = d3.scale.linear()
      .domain([0, d3.max(log_probs)])
      .range([0, full_height]);

  for (index = 0; index < n_intervals; index++) {
      var point = Physics.body('point', {
          x: x_scale(thetas[index]),
          y: y_scale(log_probs[index])
      });
      world.add(point);
  }

var square = Physics.body('rectangle', {
    x: 250,
    y: 250,
    width: 50,
    height: 50
});
world.add( square );
world.render();

// subscribe to ticker to advance the simulation
Physics.util.ticker.on(function( time, dt ){
    world.step( time );
});

// start the ticker
Physics.util.ticker.start();

world.on('step', function(){
    world.render();
});

var square = Physics.body('rectangle', {
    x: 250,
    y: 250,
    vx: 0.01,
    width: 50,
    height: 50
});

world.add( Physics.behavior('constant-acceleration') );

var bounds = Physics.aabb(0, 0, 500, 500);

world.add( Physics.behavior('edge-collision-detection', {
    aabb: bounds
}) );
// ensure objects bounce when edge collision is detected
world.add( Physics.behavior('body-impulse-response') );

world.add( Physics.behavior('edge-collision-detection', {
    aabb: bounds,
    restitution: 0.3
}) );

world.add( Physics.body('convex-polygon', {
    x: 250,
    y: 50,
    vx: 0.05,
    vertices: [
        {x: 0, y: 80},
        {x: 60, y: 40},
        {x: 60, y: -40},
        {x: 0, y: -80}
    ]
}) );

world.add( Physics.body('convex-polygon', {
    x: 400,
    y: 200,
    vx: -0.02,
    vertices: [
        {x: 0, y: 80},
        {x: 80, y: 0},
        {x: 0, y: -80},
        {x: -30, y: -30},
        {x: -30, y: 30}
    ]
}) );

});
