/*************************************
 *   Computer Graphics - Homework 3   *
 *   Superquadratics                  *
 *                                    *
 *   Buğra Felekoğlu                  *
 *   21301200                         *
 *************************************/

// WebGL
var gl;
var program;
var canvas;

// Global variables
var modelViewMatrix;
var modelViewMatrixLoc;

var fov = 90;
var eyeX = 0;
var eyeY = 5;
var eyeZ = -10;

/***************************************************
  Init function of window
****************************************************/
window.onload = function init() {
  canvas = document.getElementById("gl-canvas");
  gl = WebGLUtils.setupWebGL(canvas);
  if (!gl) alert("WebGL isn't available");

  // Load shaders and initialize attribute buffers
  program = initShaders(gl, "vertex-shader", "fragment-shader");
  gl.useProgram(program);

  // Draggable UI Elements
  dragElement(document.getElementById("UISettings"));
  dragElement(document.getElementById("UICamera"));

  // Configure WebGL
  gl.viewport(0, 0, canvas.width, canvas.width);
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.enable(gl.DEPTH_TEST);

  // Creating projection and mv matrices
  projectionMatrix = perspective(fov, 1, 0.02, 100);
  modelViewMatrix = lookAt(vec3(eyeX, eyeY, eyeZ), vec3(0, 0, 0), vec3(0, 1, 0));

  // Sending matrices to shader
  gl.uniformMatrix4fv(gl.getUniformLocation(program, "modelViewMatrix"), false, flatten(modelViewMatrix));
  gl.uniformMatrix4fv(gl.getUniformLocation(program, "projectionMatrix"), false, flatten(projectionMatrix));
  
  modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix");
  projectionMatrixLoc = gl.getUniformLocation(program, "projectionMatrix");

  camera();

  render();
};

/***************************************************
  Render Function
****************************************************/
function render() {
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  requestAnimFrame(render);

  projectionMatrix = perspective(fov, 1, 0.02, 100);
  modelViewMatrix = lookAt(vec3(eyeX, eyeY, eyeZ), vec3(0, 0, 0), vec3(0, 1, 0));

  gl.uniformMatrix4fv(gl.getUniformLocation(program, "modelViewMatrix"), false, flatten(modelViewMatrix));
  gl.uniformMatrix4fv(gl.getUniformLocation(program, "projectionMatrix"), false, flatten(projectionMatrix));
  
  modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix");
  projectionMatrixLoc = gl.getUniformLocation(program, "projectionMatrix");
}

/***************************************************
  Camera listeners
****************************************************/
function camera() {
  canvas.onmousedown = function(event) {
    var x = 2*event.clientX/canvas.width-1;
    var y = 2*(canvas.height-event.clientY)/canvas.height-1;

  }

  canvas.onmouseup = function(event) {
    var x = 2*event.clientX/canvas.width-1;
    var y = 2*(canvas.height-event.clientY)/canvas.height-1;

  }

  canvas.onmousemove = function(event) {
    var x = 2*event.clientX/canvas.width-1;
    var y = 2*(canvas.height-event.clientY)/canvas.height-1;

  }

  canvas.onwheel = function(event) {
    wheel = event.wheelDelta / 60;
    fov = fov - wheel;
  }
}



/***************************************************
  Vertex buffers with colors
****************************************************/
function processBuffers(color, vertices, vSize) {
  var colors = [];
  
  // Create color array as much as vertices length
  for(var i = 0; i < vertices.length; i++)
    colors.push(color);

  // Load the color data into the GPU
  var cBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);

  // Associate out vertex color variables with our color buffer
  var vColor = gl.getAttribLocation(program, "vColor");
  gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vColor);

  // Load the vertex data into the GPU
  var vBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);

  // Associate out shader variables with our data buffer
  var vPosition = gl.getAttribLocation(program, "vPosition");
  gl.vertexAttribPointer(vPosition, vSize, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vPosition);
}

/*******************************************************************
  Draggable UI Elements (Not modified)

  Taken from https://www.w3schools.com/howto/howto_js_draggable.asp
********************************************************************/
function dragElement(elmnt) {
  var pos1 = 0,
    pos2 = 0,
    pos3 = 0,
    pos4 = 0;
  if (document.getElementById(elmnt.id + "Header")) {
    // if present, the header is where you move the DIV from:
    document.getElementById(elmnt.id + "Header").onmousedown = dragMouseDown;
  } else {
    // otherwise, move the DIV from anywhere inside the DIV:
    elmnt.onmousedown = dragMouseDown;
  }

  function dragMouseDown(e) {
    e = e || window.event;
    e.preventDefault();
    // get the mouse cursor position at startup:
    pos3 = e.clientX;
    pos4 = e.clientY;
    document.onmouseup = closeDragElement;
    // call a function whenever the cursor moves:
    document.onmousemove = elementDrag;
  }

  function elementDrag(e) {
    e = e || window.event;
    e.preventDefault();
    // calculate the new cursor position:
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;
    // set the element's new position:
    elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
    elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
  }

  function closeDragElement() {
    // stop moving when mouse button is released:
    document.onmouseup = null;
    document.onmousemove = null;
  }
}