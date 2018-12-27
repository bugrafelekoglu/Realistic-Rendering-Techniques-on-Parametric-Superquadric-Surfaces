/*************************************
 *   Computer Graphics - Homework 3   *
 *   Superquadratics                  *
 *                                    *
 *   Buğra Felekoğlu                  *
 *   21301200                         *
 *************************************/

 // Constant values of object modes
const ELLIPSOID = 0; 
const HYPERBOLOID = 1;

// Constant values of shader modes
const WIREFRAME = 0;
const PHONG = 1;
const GOURAUD = 2;

// WebGL
var gl;
var program;
var canvas;

// Global Matrices
var modelViewMatrix;
var modelViewMatrixLoc;
var projectionMatrix;
var projectionMatrixLoc;
var indexBuffer;

// Global variables
var objectMode = ELLIPSOID;
var shaderMode = WIREFRAME;
var isCameraMoving = false;

// Camera variables
var fov = 15;
var eyeX = 0;
var eyeY = 5;
var eyeZ = -10;

// Shader arrays for Ellipsoid
var verticesE = [];
var indicesE = [];
var normalsE = [];
var loopSizeE = 0;

// Shader arrays for Hyperboloid
var verticesH = [];
var indicesH = [];
var normalsH = [];
var loopSizeH = 0;

// Radiuses of objects
var a1 = 0.5;
var a2 = 0.5;
var a3 = 0.5;

// Exponentials
var e1 = 3.0;
var e2 = 3.0;

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

  generateEllipsoid();
  generateHyperboloid();
  camera();
  radios();
  sliders();
  render();
};

/***************************************************
  Render Function
****************************************************/
function render() {
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  projectionMatrix = perspective(fov, 1, 0.02, 100);
  modelViewMatrix = lookAt(vec3(eyeX, eyeY, eyeZ), vec3(0, 0, 0), vec3(0, 1, 0));

  gl.uniformMatrix4fv(gl.getUniformLocation(program, "modelViewMatrix"), false, flatten(modelViewMatrix));
  gl.uniformMatrix4fv(gl.getUniformLocation(program, "projectionMatrix"), false, flatten(projectionMatrix));
  
  modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix");
  projectionMatrixLoc = gl.getUniformLocation(program, "projectionMatrix");
  
  drawObject();

  requestAnimFrame(render);
}

function generateEllipsoid() {
  generateEllipsoidVertices();
  generateEllipsoidNormals();
  generateEllipsoidIndices();
}

function generateHyperboloid() {
  generateHyperboloidVertices();
  generateHyperboloidNormals();
  generateHyperboloidIndices();
}

function drawObject() {
  if(objectMode === ELLIPSOID) {
    processBuffers(vec4(0.0, 0.0, 0.0, 1.0), verticesE, normalsE, indicesE);

    if(shaderMode === WIREFRAME) {
      gl.drawElements(gl.LINE_STRIP, indicesE.length, gl.UNSIGNED_SHORT, indexBuffer);  
    }
    else if(shaderMode === PHONG) {
      gl.drawElements(gl.TRIANGLE_STRIP, indicesE.length, gl.UNSIGNED_SHORT, indexBuffer);  
    }
    else {
      gl.drawElements(gl.TRIANGLE_STRIP, indicesE.length, gl.UNSIGNED_SHORT, indexBuffer);  
    }
  }
  else {
    processBuffers(vec4(0.0, 0.0, 0.0, 1.0), verticesH, normalsH, indicesH);

    if(shaderMode === WIREFRAME) {
      gl.drawElements(gl.LINE_STRIP, indicesH.length, gl.UNSIGNED_SHORT, indexBuffer);  
    }
    else if(shaderMode === PHONG) {
      gl.drawElements(gl.TRIANGLE_STRIP, indicesH.length, gl.UNSIGNED_SHORT, indexBuffer);  
    }
    else {
      gl.drawElements(gl.TRIANGLE_STRIP, indicesH.length, gl.UNSIGNED_SHORT, indexBuffer);  
    }
  }
}

/***************************************************
  Ellipsoid Vertex Generator
****************************************************/
function generateEllipsoidVertices() {
  verticesE = [];

  loopSizeE = 0;
  for(var u = -1.0; u < 1.0; u += 0.01) {
    for(var v = -1.0; v < 1.0; v += 0.01) {
      var x = a1 * Math.pow(Math.cos(u * (Math.PI/2)), e1) * Math.pow(Math.cos(v * Math.PI), e2);
      var y = a2 * Math.pow(Math.cos(u * (Math.PI/2)), e1) * Math.pow(Math.sin(v * Math.PI), e2);
      var z = a3 * Math.pow(Math.sin(u * (Math.PI/2)), e1);

      verticesE.push(vec4(x, y, z, 1));
    }
    loopSizeE++;
  }
}

/***************************************************
  Ellipsoid Normal Generator
****************************************************/
function generateEllipsoidNormals() {
  normalsE = [];

  for(var u = -1.0; u < 1.0; u += 0.01) {
    for(var v = -1.0; v < 1.0; v += 0.01) {
      var x = 1 / (a1 * Math.pow(Math.cos(u * (Math.PI/2)), 2-e1) * Math.pow(Math.cos(v * Math.PI), 2-e2));
      var y = 1 / (a2 * Math.pow(Math.cos(u * (Math.PI/2)), 2-e1) * Math.pow(Math.sin(v * Math.PI), 2-e2));
      var z = 1 / (a3 * Math.pow(Math.sin(u * (Math.PI/2)), 2-e1));

      normalsE.push(vec4(x, y, z, 0));
    }
  }
}

/***************************************************
  Ellipsoid Index Generator
****************************************************/
function generateEllipsoidIndices() {
  indicesE = [];

  for(var i = 0; i < loopSizeE-1; i++) {
    for(var j = 0; j < loopSizeE; j++) {
        indicesE.push(i * loopSizeE + j);
        indicesE.push((i+1) * loopSizeE + j);
    }
  }
}

/***************************************************
  Hyperboloid Vertex Generator
****************************************************/
function generateHyperboloidVertices() {
  verticesH = [];

  loopSizeH = 0;
  for(var u = -1.0; u < 1.0; u += 0.01) {
    for(var v = -1.0; v < 1.0; v += 0.01) {
      var x = a1 * Math.pow(1/Math.cos(u * (Math.PI)), e1) * Math.pow(Math.cos(v * Math.PI), e2);
      var y = a2 * Math.pow(1/Math.cos(u * (Math.PI)), e1) * Math.pow(Math.sin(v * Math.PI), e2);
      var z = a3 * Math.pow(Math.tan(u * (Math.PI)), e1);

      verticesH.push(vec4(x, y, z, 1));
    }
    loopSizeH++;
  }
}

/***************************************************
  Hyperboloid Normal Generator
****************************************************/
function generateHyperboloidNormals() {
  normalsH = [];

  for(var u = -1.0; u < 1.0; u += 0.01) {
    for(var v = -1.0; v < 1.0; v += 0.01) {
      var x = (1 / a1) * Math.pow(1/Math.cos(u * (Math.PI)), 2-e1) * Math.pow(Math.cos(v * Math.PI), 2-e2);
      var y = (1 / a2) * Math.pow(1/Math.cos(u * (Math.PI)), 2-e1) * Math.pow(Math.sin(v * Math.PI), 2-e2);
      var z = (1 / a3) * Math.pow(Math.tan(u * (Math.PI)), 2-e1);

      normalsH.push(vec4(x, y, z, 0));
    }
  }
}

/***************************************************
  Hyperboloid Index Generator
****************************************************/
function generateHyperboloidIndices() {
  indicesH = [];

  for(var i = 0; i < loopSizeH-1; i++) {
    for(var j = 0; j < loopSizeH; j++) {
        indicesH.push(i * loopSizeH + j);
        indicesH.push((i+1) * loopSizeH + j);
    }
  }
}

var theta = 0;
var phi = 0;
var prevX;
var prevY;
var prevTheta = 0;
var prevPhi = 0;

/***************************************************
  Camera movement function 
  which decides object rotation
****************************************************/
function cameraMovement(event) {
  var curX = 2*event.clientX/canvas.width-1;
  var curY = 2*(canvas.height-event.clientY)/canvas.height-1;
  theta = prevTheta + (curY-prevY) * Math.PI / 20;
  phi = prevPhi - (curX-prevX) * Math.PI / 20;

  eyeX = eyeX;
  eyeY = eyeY*Math.cos(theta) - eyeZ*Math.sin(theta);
  eyeZ = eyeY*Math.sin(theta) + eyeZ*Math.cos(theta);

  eyeX = eyeX*Math.cos(phi) + eyeZ*Math.sin(phi);
  eyeY = eyeY;
  eyeZ = -eyeX*Math.sin(phi) + eyeZ*Math.cos(phi);

  var normalizedEye = normalize( vec3(eyeX, eyeY, eyeZ));
  eyeX = 11 * normalizedEye[0];
  eyeY = 11 * normalizedEye[1];
  eyeZ = 11 * normalizedEye[2];
}

/***************************************************
  Camera listeners
****************************************************/
function camera() {
  canvas.onmousedown = function(event) {
    prevX = 2*event.clientX/canvas.width-1;
    prevY = 2*(canvas.height-event.clientY)/canvas.height-1;
    isCameraMoving = true;
    canvas.style.cursor = "grabbing";
  }

  canvas.onmouseup = function(event) {
    isCameraMoving = false;
    prevTheta = theta;
    prevPhi = phi;
    canvas.style.cursor = "grab";
  }

  canvas.onmousemove = function(event) {
    if(isCameraMoving) {
      cameraMovement(event);
      canvas.style.cursor = "grabbing";
    }
    else {
      canvas.style.cursor = "grab";
    }
  }

  canvas.onwheel = function(event) {
    wheel = event.wheelDelta / 240;
    fov = fov - wheel;
  }
}

/***************************************************
  Radio Button Listeners
****************************************************/
function radios() {
  document.getElementById("Ellipsoid").onchange = function() {
    objectMode = ELLIPSOID;
  };

  document.getElementById("Hyperboloid").onchange = function() {
    objectMode = HYPERBOLOID;
  };

  document.getElementById("Wireframe").onchange = function() {
    shaderMode = WIREFRAME;
  };

  document.getElementById("Phong").onchange = function() {
    shaderMode = PHONG;
  };

  document.getElementById("Gouraud").onchange = function() {
    shaderMode = GOURAUD;
  };
}

/***************************************************
  Slider Listeners
****************************************************/
function sliders() {
  document.getElementById("e1Slider").oninput = function() {
    var sliderValue = event.srcElement.value; 
    document.getElementById("e1Text").value = sliderValue;
    e1 = sliderValue;
    generateEllipsoid(e1, e2);
    generateHyperboloid(e1, e2);
  };

  document.getElementById("e2Slider").oninput = function() {
    var sliderValue = event.srcElement.value; 
    document.getElementById("e2Text").value = sliderValue;
    e2 = sliderValue;
    generateEllipsoid(e1, e2);
    generateHyperboloid(e1, e2);
  };

  document.getElementById("a1Slider").oninput = function() {
    var sliderValue = event.srcElement.value; 
    document.getElementById("a1Text").value = sliderValue;
    a1 = sliderValue;
    generateEllipsoid(e1, e2);
    generateHyperboloid(e1, e2);
  };

  document.getElementById("a2Slider").oninput = function() {
    var sliderValue = event.srcElement.value; 
    document.getElementById("a2Text").value = sliderValue;
    a2 = sliderValue;
    generateEllipsoid(e1, e2);
    generateHyperboloid(e1, e2);
  };

  document.getElementById("a3Slider").oninput = function() {
    var sliderValue = event.srcElement.value; 
    document.getElementById("a3Text").value = sliderValue;
    a3 = sliderValue;
    generateEllipsoid(e1, e2);
    generateHyperboloid(e1, e2);
  };
}

/***************************************************
  Vertex buffers with colors
****************************************************/
function processBuffers(color, vertices, normals, indices) {
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
  gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vPosition);

  // Load the normal vector data into the GPU
  var nBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, nBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(normals), gl.STATIC_DRAW);
  // Associate out shader variables with our data buffer
  var vNormal = gl.getAttribLocation(program, "vNormal");
  gl.vertexAttribPointer(vNormal, 4, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vNormal);

  indexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
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