let v = [];
let cols = 600, rows = 30;

let t_D = 180 * 15 / cols;
let r_D = 1 / rows;

// Flower parameters (will be managed by controls.js)
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
let autoRotate = true;
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
  
  // Initialize random seed for consistent leaf positions
  randomSeed(42);
  
  // Pre-generate random positions
  for (let i = 0; i < 10; i++) {
    leafRandomPositions[i] = floor(random(1, 10));
    leafRandomAngles[i] = random(0, 360);
    leafRandomDirections[i] = random() > 0.5 ? 1 : -1;
    leafRandomRotations[i] = random(20, 40);
  }
  
  // Initialize controls from the controls.js file
  setupControls();
}

function draw() {
  clear();
  drawGradientBackground();
  
  push();
  rotateX(cameraRotationX);
  rotateY(cameraRotationY);
  if (autoRotate) {
    cameraRotationY = (cameraRotationY + 0.2) % 360;
  } else {
    orbitControl(4, 4);
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
        case 'custom':
          fill(customColor.h, customColor.s, -20 + r * r_D * 120);
          break;
        case 'pink':
        default:
          fill(340, 100, -20 + r * r_D * 120);
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
  let segmentHeight = 80;
  
  for (let i = 0; i < segments; i++) {
    push();
    let xOffset = sin(i * (30 / segments));
    translate(xOffset, i * segmentHeight);
    
    let stemWidth = map(i, 0, segments, 7, 15);
    cylinder(stemWidth, segmentHeight);
    
    for (let j = 0; j < flowerParams.leafCount; j++) {
      if (leafRandomPositions[j] === i) {
        drawLeaf(segmentHeight, j);
      }
    }
    pop();
  }
  pop();
}

function drawLeaf(segmentHeight, index) {
  push();
  fill(120, 230, 50);
  
  let angle = leafRandomAngles[index];
  let direction = leafRandomDirections[index];
  let rotation = leafRandomRotations[index];
  
  rotateX(0);
  rotateY(angle);
  
  let leafLength = segmentHeight * 1.7 * flowerParams.leafHeight;
  let leafWidth = segmentHeight * 0.6 * flowerParams.leafWidth;  
  
  // Add Z rotation using pre-calculated value
  rotateZ(rotation * direction);
  
  beginShape();
  for (let i = 0; i <= 10; i++) {
    let t = i / 10;
    let leafX = direction * leafLength * t;
    let leafY = -leafLength * 0.2 * sin(t * 90);
    let leafZ = leafWidth * sin(t * 180);
    vertex(leafX, leafY, leafZ);
  }
  for (let i = 10; i >= 0; i--) {
    let t = i / 10;
    let leafX = direction * leafLength * t;
    let leafY = -leafLength * 0.2 * sin(t * 90);
    let leafZ = -leafWidth * sin(t * 180);
    vertex(leafX, leafY, leafZ);
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