let v = [];
let cols = 600, rows = 30;

let t_D = 180 * 15 / cols;
let r_D = 1 / rows;

// Flower parameters
let flowerParams = {
  opening: 2,
  vDensity: 8,
  pAlign: 3.6,
  curve1: 2,
  curve2: 1.3,
  stemCurve: 5,
  flowerSize: 260,
  leafCount: 3,
  leafHeight: 1.0,
  leafWidth: 1.0
};

// Camera controls
let cameraDistance = 800;
let cameraRotationX = -30;
let cameraRotationY = 0;
let autoRotate = false;
let isDragging = false;
let lastMouseX = 0;
let lastMouseY = 0;
let canvas;

// Custom color storage
let customColor = {h: 340, s: 100, b: 70};

// Store fixed random positions for leaves
let leafRandomPositions = [];
let leafRandomAngles = [];
let leafRandomDirections = [];
let leafRandomRotations = [];

function setup() {
  canvas = createCanvas(windowWidth, windowHeight, WEBGL);
  canvas.id('canvas');
  
  colorMode(HSB);
  angleMode(DEGREES);
  noStroke();
  
  randomSeed(42);
  
  for (let i = 0; i < 10; i++) {
    leafRandomPositions[i] = i * 2;
    leafRandomAngles[i] = i * 36;
    leafRandomDirections[i] = i % 2 === 0 ? 1 : -1;
    leafRandomRotations[i] = 20 + i * 2;
  }
  
  setupControls();

  canvas.mousePressed(onMousePressed);
  canvas.mouseReleased(onMouseReleased);
  canvas.mouseMoved(onMouseMoved);
}

function onMousePressed() {
  isDragging = true;
  lastMouseX = mouseX;
  lastMouseY = mouseY;
}

function onMouseReleased() {
  isDragging = false;
}

function onMouseMoved() {
  if (isDragging && !autoRotate) {
    let deltaX = mouseX - lastMouseX;
    let deltaY = mouseY - lastMouseY;
    
    cameraRotationY += deltaX * 0.5;
    cameraRotationX -= deltaY * 0.5;
    
    cameraRotationX = constrain(cameraRotationX, -90, 90);
    
    lastMouseX = mouseX;
    lastMouseY = mouseY;
  }
}

function draw() {
  clear();
  drawGradientBackground();
  
  push();
  rotateX(cameraRotationX);
  rotateY(cameraRotationY);
  if (autoRotate) {
    cameraRotationY = (cameraRotationY + 0.2) % 360;
  }
  
  generateFlowerGeometry();
  drawFlowerPetals();
  drawStem();
  pop();
  
  v = [];
}

function generateFlowerGeometry() {  
  for (let r = 0; r <= rows; r++) {
    v.push([]);
    for (let theta = 0; theta <= cols; theta++) {
      let phi = (180 / flowerParams.opening) * Math.exp(-theta * t_D / (flowerParams.vDensity * 180));
      let petalCut = 1 - (1/2) * pow((5/4) * pow(1 - ((flowerParams.pAlign * theta * t_D % 360) / 180), 2) - 1/4, 2);
      let hangDown = flowerParams.curve1 * pow(r * r_D, 2) * pow(flowerParams.curve2 * r * r_D - 1, 2) * sin(phi);

      let pX = flowerParams.flowerSize * petalCut * (r * r_D * sin(phi) + hangDown * cos(phi)) * sin(theta * t_D);
      let pY = -flowerParams.flowerSize * petalCut * (r * r_D * cos(phi) - hangDown * sin(phi));
      let pZ = flowerParams.flowerSize * petalCut * (r * r_D * sin(phi) + hangDown * cos(phi)) * cos(theta * t_D);
      
      let pos = createVector(pX, pY, pZ);
      v[r].push(pos);
    }
  }
}

function drawFlowerPetals() {
  let colorSelection = colorMode1.value();
  
  for (let r = 0; r < v.length - 1; r++) {
    for (let theta = 0; theta < v[r].length - 1; theta++) {
      switch (colorSelection) {
        case 'rainbow':
          fill((theta * t_D) % 360, 100, 70 + r * r_D * 30);
          break;
				case 'funky':
          fill((theta * t_D + r * 30) % 360, 100, 70 + r * r_D * 30);
          break;
        case 'custom':
          if (customColor.b === 0) {
            let minimalBrightnessAdjust = r * r_D * 15;
            fill(0, 0, minimalBrightnessAdjust);
          } else {
            let brightnessAdjustment = r * r_D * 50;
            let finalBrightness = customColor.b * 0.5 + brightnessAdjustment;
            finalBrightness = constrain(finalBrightness, 0, 100);
            fill(customColor.h, customColor.s, finalBrightness);
          }
          break;
        default:
          // Fallback to rainbow in case of undefined color mode
          fill((theta * t_D) % 360, 100, 70 + r * r_D * 30);
          break;
      }
      
      beginShape();
      vertex(v[r][theta].x, v[r][theta].y, v[r][theta].z);
      vertex(v[r+1][theta].x, v[r+1][theta].y, v[r+1][theta].z);
      vertex(v[r+1][theta+1].x, v[r+1][theta+1].y, v[r+1][theta+1].z);
      vertex(v[r][theta+1].x, v[r][theta+1].y, v[r][theta+1].z);
      endShape(CLOSE);
    }
  }
}

function drawStem() {
  push();
  fill(120, 250, 60);
  
  let segments = 10;  
  let segmentHeight = 45;
  let placedLeaves = new Set();
  
  // First pass: place leaves at specific positions
  for (let i = 0; i < segments; i++) {
    push();
    let xOffset = sin(i * (20 / segments)) * 15;
    let zOffset = cos(i * (15 / segments)) * 10;
    
    translate(xOffset, i * segmentHeight, zOffset);
    
    let stemBrightness = map(i, 0, segments, 40, 50);
    fill(120, 250, stemBrightness);
    
    let stemWidth = map(i, 0, segments, 6, 18);
    cylinder(stemWidth, segmentHeight);
    
    // Only place leaves at their specific positions in this pass
    for (let j = 0; j < flowerParams.leafCount; j++) {
      if (leafRandomPositions[j] === i) {
        drawLeaf(segmentHeight, j);
        placedLeaves.add(j);
      }
    }
    
    pop();
  }
  
  // Second pass: place remaining leaves
  // We'll only do this for leaves that weren't placed in the first pass
  for (let j = 0; j < flowerParams.leafCount; j++) {
    if (!placedLeaves.has(j)) {
      // Find an appropriate segment for this leaf
      let segmentIdx = 5 + j % 3; // Space them out between segments 5-7
      
      push();
      let xOffset = sin(segmentIdx * (20 / segments)) * 15;
      let zOffset = cos(segmentIdx * (15 / segments)) * 10;
      
      translate(xOffset, segmentIdx * segmentHeight, zOffset);
      drawLeaf(segmentHeight, j);
      pop();
    }
  }
  
  pop();
}

function drawLeaf(segmentHeight, index) {
  push();
  
  let angle = leafRandomAngles[index];
  let direction = leafRandomDirections[index];
  let rotation = leafRandomRotations[index];
  
  rotateX(0);
  rotateY(angle);
  
  let leafLength = segmentHeight * 1.7 * flowerParams.leafHeight;
  let leafWidth = segmentHeight * 0.6 * flowerParams.leafWidth;  
  
  rotateZ(rotation * direction);
  
  beginShape(TRIANGLE_STRIP);
  for (let i = 0; i <= 10; i++) {
    let t = i / 10;
    
    let leafBrightness = map(t, 0, 1, 50, 30);
    let leafSaturation = map(t, 0, 1, 200, 240);
    fill(120, leafSaturation, leafBrightness);
    
    let tipCurve = 0;
    if (t > 0.7) {
      tipCurve = map(t, 0.7, 1, 0, leafLength * 0.2);
    }
    
    let leafX = direction * leafLength * t;
    let leafY = -tipCurve;
    let leafZ = leafWidth * sin(t * 180);

    vertex(leafX, leafY, leafZ);
    
    fill(120, leafSaturation, leafBrightness - 5);
    vertex(leafX, leafY + 1, -leafZ);
  }
  endShape(CLOSE);
  pop();
}

function drawGradientBackground() {
  push();

  resetMatrix();
  translate(0, 0, -1000);
  
  beginShape();
  fill(200, 70, 60);
  vertex(-width*1.2, -height*1.2);
  vertex(width*1.2, -height*1.2);
  fill(240, 40, 20);
  vertex(width*1.2, height*1.2);
  vertex(-width*1.2, height*1.2);
  endShape(CLOSE);
  
  pop();
}