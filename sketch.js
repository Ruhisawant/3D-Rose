let v = [];
let cols = 600, rows = 30;

let t_D = 180 * 15 / cols;
let r_D = 1 / rows;

// UI controls
let controls = {};
let isControlsVisible = true;
let colorMode1, colorMode2;
let colorPicker;

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
  
  setupControls();
}

function setupControls() {
  // Main container for controls
  let controlPanel = createDiv();
  controlPanel.id('controlPanel');
  controlPanel.position(20, 20);
  controlPanel.class('control-panel');
  
  // Header with title and toggle button
  let header = createDiv('Flower Controls');
  header.class('panel-header');
  header.parent(controlPanel);
  
  let toggleBtn = createButton('Hide');
  toggleBtn.class('toggle-btn');
  toggleBtn.parent(header);
  toggleBtn.mousePressed(() => {
    let panel = select('#controlsContent');
    isControlsVisible = !isControlsVisible;
    panel.style('display', isControlsVisible ? 'block' : 'none');
    toggleBtn.html(isControlsVisible ? 'Hide' : 'Show');
  });
  
  // Container for actual controls
  let controlsContent = createDiv();
  controlsContent.id('controlsContent');
  controlsContent.class('controls-content');
  controlsContent.parent(controlPanel);
  
  // Flower shape controls
  let shapeSection = createDiv();
  shapeSection.class('control-section');
  shapeSection.parent(controlsContent);
  createDiv('Flower Shape').class('section-title').parent(shapeSection);
  
  createSliderControl(shapeSection, 'opening', 'Flower opening', 1, 10, flowerParams.opening, 0.1, val => flowerParams.opening = val);
  createSliderControl(shapeSection, 'vDensity', 'Vertical density', 1, 20, flowerParams.vDensity, 0.1, val => flowerParams.vDensity = val);
  createSliderControl(shapeSection, 'pAlign', 'Petal alignment', 0, 6, flowerParams.pAlign, 0.05, val => flowerParams.pAlign = val);
  createSliderControl(shapeSection, 'curve1', 'Curvature 1', -6, 6, flowerParams.curve1, 0.1, val => flowerParams.curve1 = val);
  createSliderControl(shapeSection, 'curve2', 'Curvature 2', 0.5, 1.5, flowerParams.curve2, 0.1, val => flowerParams.curve2 = val);
  createSliderControl(shapeSection, 'flowerSize', 'Flower size', 150, 400, flowerParams.flowerSize, 10, val => flowerParams.flowerSize = val);
    
  // Leaf controls
  let leafSection = createDiv();
  leafSection.class('control-section');
  leafSection.parent(controlsContent);
  createDiv('Leaf Properties').class('section-title').parent(leafSection);
  
  createSliderControl(leafSection, 'leafCount', 'Leaf count', 0, 7, flowerParams.leafCount, 1, val => flowerParams.leafCount = parseInt(val));
  createSliderControl(leafSection, 'leafHeight', 'Leaf height', 0.5, 4.0, flowerParams.leafHeight, 0.1, val => flowerParams.leafHeight = val);
  createSliderControl(leafSection, 'leafWidth', 'Leaf width', 0.5, 4.0, flowerParams.leafWidth, 0.1, val => flowerParams.leafWidth = val);
  
  // Color controls
  let colorSection = createDiv();
  colorSection.class('control-section');
  colorSection.parent(controlsContent);
  createDiv('Color Options').class('section-title').parent(colorSection);
  
  colorMode1 = createRadio();
  colorMode1.parent(colorSection);
  colorMode1.class('radio-group');
  colorMode1.option('pink', 'Pink');
  colorMode1.option('rainbow', 'Rainbow');
  colorMode1.option('custom', 'Custom Color');
  colorMode1.selected('pink');
  
  // Color picker
  let pickerContainer = createDiv();
  pickerContainer.class('color-picker-container');
  pickerContainer.parent(colorSection);
  createDiv('Custom Color:').class('slider-label').parent(pickerContainer);
  
  colorPicker = createColorPicker(color(340, 100, 70, 1));
  colorPicker.parent(pickerContainer);
  colorPicker.class('color-picker');
  colorPicker.input(() => {
    let c = colorPicker.color();
    customColor.h = hue(c);
    customColor.s = saturation(c);
    customColor.b = brightness(c);
    colorMode1.selected('custom');
  });
    
  // Preset buttons
  let presetSection = createDiv();
  presetSection.class('control-section');
  presetSection.parent(controlsContent);
  createDiv('Presets').class('section-title').parent(presetSection);
  
  let presetButtonContainer = createDiv();
  presetButtonContainer.class('button-container');
  presetButtonContainer.parent(presetSection);
  
  createPresetButton(presetButtonContainer, 'Rose', {
    opening: 2, 
    vDensity: 8, 
    pAlign: 3.6, 
    curve1: 2, 
    curve2: 1.3,
    flowerSize: 260,
    colorMode: 'pink',
    leafCount: 3,
    leafHeight: 1.0,
    leafWidth: 1.0
  });
  
  createPresetButton(presetButtonContainer, 'Tulip', {
    opening: 9, 
    vDensity: 13.5, 
    pAlign: 4.6, 
    curve1: 5.5, 
    curve2: 0.7,
    flowerSize: 300,
    colorMode: 'custom',
    customColor: {h: 60, s: 100, b: 70},
    leafCount: 2,
    leafHeight: 1.2,
    leafWidth: 0.8
  });
  
  createPresetButton(presetButtonContainer, 'Carnation', {
    opening: 1.5, 
    vDensity: 12, 
    pAlign: 4.5, 
    curve1: 0, 
    curve2: 1.1,
    flowerSize: 240,
    colorMode: 'custom',
    customColor: {h: 0, s: 100, b: 70},
    leafCount: 4,
    leafHeight: 0.8,
    leafWidth: 1.3
  });
}

function createSliderControl(parent, id, label, min, max, value, step, callback) {
  let container = createDiv();
  container.class('slider-container');
  container.parent(parent);
  
  let labelDiv = createDiv(label + ': ' + value);
  labelDiv.class('slider-label');
  labelDiv.id(id + 'Label');
  labelDiv.parent(container);
  
  let slider = createSlider(min, max, value, step);
  slider.class('slider');
  slider.parent(container);
  slider.input(() => {
    let val = slider.value();
    select('#' + id + 'Label').html(label + ': ' + val);
    if (callback) callback(val);
  });
  
  controls[id] = {
    slider: slider,
    label: labelDiv
  };
  
  return slider;
}

function createPresetButton(parent, name, params) {
  let btn = createButton(name);
  btn.parent(parent);
  btn.class('preset-button');
  btn.mousePressed(() => {
    // Apply preset parameters
    for (let key in params) {
      if (flowerParams.hasOwnProperty(key) && controls[key]) {
        flowerParams[key] = params[key];
        controls[key].slider.value(params[key]);
        controls[key].label.html(controls[key].label.html().split(':')[0] + ': ' + params[key]);
      }
    }
    
    // Apply color mode if specified
    if (params.colorMode) {
      colorMode1.selected(params.colorMode);
      
      // Apply custom color if specified
      if (params.customColor && params.colorMode === 'custom') {
        customColor = params.customColor;
        colorPicker.color(color(customColor.h, customColor.s, customColor.b));
      }
    }
  });
  
  return btn;
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