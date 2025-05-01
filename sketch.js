// Camera and interaction
let cameraDistance = 800
let cameraAngleX = -30
let cameraAngleY = 0
let autoRotate = false
let isDragging = false
let lastMouseX = 0
let lastMouseY = 0
let canvas

// General parameters
let petalVertices = []
let thetaDelta = 27 / 6
let rowDelta = 1 / 30
let customColor = {h: 340, s: 100, b: 70}
let leafPositions = []
let leafAngles = []
let leafDirections = []
let leafRotations = []

// Flower configuration parameters
const flowerConfig = {
  openingAngle: 2,
  verticalDensity: 8,
  petalAlignment: 3.6,
  innerCurve: 2,
  outerCurve: 1.3,
  petalSize: 260,
  leafCount: 3,
  leafHeight: 2.0,
  leafWidth: 2.0
}

function setup() {
  canvas = createCanvas(windowWidth, windowHeight, WEBGL)
  canvas.id('canvas')

  colorMode(HSB)
  angleMode(DEGREES)
  noStroke()

  randomSeed(42)

  for (let i = 0; i < 10; i++) {
    leafPositions[i] = i * 2
    leafAngles[i] = i * 36
    leafDirections[i] = i % 2 === 0 ? 1 : -1
    leafRotations[i] = 20 + i * 2
  }

  setupControlPanel()

  canvas.mousePressed(startDrag)
  canvas.mouseReleased(endDrag)
  canvas.mouseMoved(trackMouse)
}

function startDrag() {
  isDragging = true
  lastMouseX = mouseX
  lastMouseY = mouseY
}

function endDrag() {
  isDragging = false
}

function trackMouse() {
  if (isDragging && !autoRotate) {
    let dx = mouseX - lastMouseX
    let dy = mouseY - lastMouseY

    cameraAngleY += dx * 0.5
    cameraAngleX -= dy * 0.5

    cameraAngleX = constrain(cameraAngleX, -90, 90)

    lastMouseX = mouseX
    lastMouseY = mouseY
  }
}

function draw() {
  clear()
  drawBackgroundGradient()

  push()
  rotateX(cameraAngleX)
  rotateY(cameraAngleY)
  if (autoRotate) {
    cameraAngleY = (cameraAngleY + 0.2) % 360
  }

  generatePetalVertices()
  drawFlowerPetals()
  drawStem()
  pop()

  petalVertices = []
}

// Generate vertex generate for petals
function generatePetalVertices() {
  for (let r = 0; r <= 30; r++) {
    petalVertices.push([])
    for (let theta = 0; theta <= 600; theta++) {
      let phi = (180 / flowerConfig.openingAngle) * Math.exp(-theta * thetaDelta / (flowerConfig.verticalDensity * 180))
      let petalCut = 1 - 0.5 * pow((1.25 * pow(1 - ((flowerConfig.petalAlignment * theta * thetaDelta % 360) / 180), 2) - 0.25), 2)
      let hangDown = flowerConfig.innerCurve * pow(r * rowDelta, 2) * pow(flowerConfig.outerCurve * r * rowDelta - 1, 2) * sin(phi)

      let x = flowerConfig.petalSize * petalCut * (r * rowDelta * sin(phi) + hangDown * cos(phi)) * sin(theta * thetaDelta)
      let y = -flowerConfig.petalSize * petalCut * (r * rowDelta * cos(phi) - hangDown * sin(phi))
      let z = flowerConfig.petalSize * petalCut * (r * rowDelta * sin(phi) + hangDown * cos(phi)) * cos(theta * thetaDelta)

      petalVertices[r].push(createVector(x, y, z))
    }
  }
}

// Draw the flower petals
function drawFlowerPetals() {
  for (let r = 0; r < petalVertices.length - 1; r++) {
    for (let theta = 0; theta < petalVertices[r].length - 1; theta++) {
      switch (colorModeSelector.value()) {
        case 'rainbow':
          fill((theta * thetaDelta) % 360, 100, 70 + r * rowDelta * 30)
          break
        case 'funky':
          fill((theta * thetaDelta + r * 30) % 360, 100, 70 + r * rowDelta * 30)
          break
        case 'custom':
          if (customColor.b === 0) {
            fill(0, 0, r * rowDelta * 15)
          } else {
            let finalBrightness = customColor.b * 0.5 + (r * rowDelta * 50)
            fill(customColor.h, customColor.s, constrain(finalBrightness, 0, 100))
          }
          break
        default:
          fill((theta * thetaDelta) % 360, 100, 70 + r * rowDelta * 30)
      }

      beginShape()
      vertex(petalVertices[r][theta].x, petalVertices[r][theta].y, petalVertices[r][theta].z)
      vertex(petalVertices[r+1][theta].x, petalVertices[r+1][theta].y, petalVertices[r+1][theta].z)
      vertex(petalVertices[r+1][theta+1].x, petalVertices[r+1][theta+1].y, petalVertices[r+1][theta+1].z)
      vertex(petalVertices[r][theta+1].x, petalVertices[r][theta+1].y, petalVertices[r][theta+1].z)
      endShape(CLOSE)
    }
  }
}

// Draw stem and leaves
function drawStem() {
  push()
  fill(120, 250, 60)

  const segments = 10
  const segmentHeight = 45
  let leavesPlaced = new Set()

  for (let i = 0; i < segments; i++) {
    push()
    let x = sin(i * (20 / segments)) * 15
    let z = cos(i * (15 / segments)) * 10

    translate(x, i * segmentHeight, z)

    fill(120, 250,  map(i, 0, segments, 40, 50))
    cylinder(map(i, 0, segments, 6, 18), segmentHeight)

    for (let j = 0; j < flowerConfig.leafCount; j++) {
      if (leafPositions[j] === i) {
        drawLeaf(segmentHeight, j)
        leavesPlaced.add(j)
      }
    }
    pop()
  }

  for (let j = 0; j < flowerConfig.leafCount; j++) {
    if (!leavesPlaced.has(j)) {
      let segmentIdx = 5 + j % 3

      push()
      let x = sin(segmentIdx * (20 / segments)) * 15
      let z = cos(segmentIdx * (15 / segments)) * 10

      translate(x, segmentIdx * segmentHeight, z)
      drawLeaf(segmentHeight, j)
      pop()
    }
  }
  pop()
}

// Draw leaf
function drawLeaf(height, index) {
  push()
  let angle = leafAngles[index]
  let direction = leafDirections[index]
  let rotation = leafRotations[index]

  rotateY(angle)
  rotateZ(rotation * direction)

  let length = height * 1.7 * flowerConfig.leafHeight
  let width = height * 0.6 * flowerConfig.leafWidth

  beginShape(TRIANGLE_STRIP)
  for (let i = 0; i <= 10; i++) {
    let t = i / 10
    let tipCurve = t > 0.7 ? map(t, 0.7, 1, 0, length * 0.2) : 0

    let x = direction * length * t
    let y = -tipCurve
    let z = width * sin(t * 180)

		fill(120, map(t, 0, 1, 200, 240), map(t, 0, 1, 50, 30))
    vertex(x, y, z)

    fill(120, map(t, 0, 1, 200, 240), map(t, 0, 1, 50, 30) - 5)
    vertex(x, y + 1, -z)
  }
  endShape(CLOSE)
  pop()
}

// Draw the gradient background
function drawBackgroundGradient() {
  push()
  resetMatrix()
  translate(0, 0, -1000)

  beginShape()
  fill(200, 70, 60)
  vertex(-width * 1.2, -height * 1.2)
  vertex(width * 1.2, -height * 1.2)
  fill(240, 40, 20)
  vertex(width * 1.2, height * 1.2)
  vertex(-width * 1.2, height * 1.2)
  endShape(CLOSE)

  pop()
}