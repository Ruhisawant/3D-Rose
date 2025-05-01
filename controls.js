// UI controls
let controls = {}
let isControlPanelVisible = true
let colorModeSelector, colorPicker

// Store preset configurations
const flowerPresets = {
  rose: {
    openingAngle: 2, 
    verticalDensity: 8, 
    petalAlignment: 3.6, 
    innerCurve: 2, 
    outerCurve: 1.3,
    petalSize: 260,
    colorMode: 'custom',
    customColor: {h: 340, s: 100, b: 70},
    leafCount: 3,
    leafHeight: 1.0,
    leafWidth: 1.0
  },
  tulip: {
    openingAngle: 9, 
    verticalDensity: 13.5, 
    petalAlignment: 4.6, 
    innerCurve: 5.5, 
    outerCurve: 0.7,
    petalSize: 300,
    colorMode: 'custom',
    customColor: {h: 282, s: 85, b: 96},
    leafCount: 2,
    leafHeight: 1.2,
    leafWidth: 0.8
  },
  carnation: {
    openingAngle: 1.5, 
    verticalDensity: 12, 
    petalAlignment: 4.5, 
    innerCurve: 0, 
    outerCurve: 1.1,
    petalSize: 240,
    colorMode: 'custom',
    customColor: {h: 51, s: 85, b: 91},
    leafCount: 4,
    leafHeight: 0.8,
    leafWidth: 1.3
  }
}

function setupControlPanel() {
  let controlPanel = createDiv()
  controlPanel.id('controlPanel')
  controlPanel.position(20, 20)
  controlPanel.class('control-panel')
  
  let panelHeader = createDiv('Flower Controls')
  panelHeader.class('panel-header')
  panelHeader.parent(controlPanel)
  
  let toggleBtn = createButton('Hide')
  toggleBtn.class('toggle-btn')
  toggleBtn.parent(panelHeader)
  toggleBtn.mousePressed(() => {
    let panel = select('#controlsContent')
    isControlPanelVisible = !isControlPanelVisible
    panel.style('display', isControlPanelVisible ? 'block' : 'none')
    toggleBtn.html(isControlPanelVisible ? 'Hide' : 'Show')
  })
  
  // Container for actual controls
  let controlsContent = createDiv()
  controlsContent.id('controlsContent')
  controlsContent.class('controls-content')
  controlsContent.parent(controlPanel)
  
  // Flower shape controls
  let shapeSection = createDiv()
  shapeSection.class('control-section')
  shapeSection.parent(controlsContent)
  createDiv('Flower Shape').class('section-title').parent(shapeSection)
  
  createSliderControl(shapeSection, 'openingAngle', 'Flower Opening', 1, 10, flowerConfig.openingAngle, 0.1, val => flowerConfig.openingAngle = val)
  createSliderControl(shapeSection, 'verticalDensity', 'Vertical Density', 1, 20, flowerConfig.verticalDensity, 0.1, val => flowerConfig.verticalDensity = val)
  createSliderControl(shapeSection, 'petalAlignment', 'Petal Alignment', 0, 6, flowerConfig.petalAlignment, 0.05, val => flowerConfig.petalAlignment = val)
  createSliderControl(shapeSection, 'innerCurve', 'Inner Curve', -6, 6, flowerConfig.innerCurve, 0.1, val => flowerConfig.innerCurve = val)
  createSliderControl(shapeSection, 'outerCurve', 'Outer Curve', 0.5, 1.5, flowerConfig.outerCurve, 0.1, val => flowerConfig.outerCurve = val)
  createSliderControl(shapeSection, 'petalSize', 'Petal Size', 150, 400, flowerConfig.petalSize, 10, val => flowerConfig.petalSize = val)
  
  // Leaf controls
  let leafSection = createDiv()
  leafSection.class('control-section')
  leafSection.parent(controlsContent)
  createDiv('Leaf Properties').class('section-title').parent(leafSection)
  
  createSliderControl(leafSection, 'leafCount', 'Leaf Count', 0, 5, flowerConfig.leafCount, 1, val => flowerConfig.leafCount = parseInt(val))
  createSliderControl(leafSection, 'leafHeight', 'Leaf Height', 0.5, 4.0, flowerConfig.leafHeight, 0.1, val => flowerConfig.leafHeight = val)
  createSliderControl(leafSection, 'leafWidth', 'Leaf Width', 0.5, 4.0, flowerConfig.leafWidth, 0.1, val => flowerConfig.leafWidth = val)
  
  // Color controls
  let colorSection = createDiv()
  colorSection.class('control-section')
  colorSection.parent(controlsContent)
  createDiv('Color Options').class('section-title').parent(colorSection)
  
  // Create color mode radio buttons
  let radioContainer = createDiv()
  radioContainer.class('radio-container')
  radioContainer.parent(colorSection)
  
  colorModeSelector = createRadio()
  colorModeSelector.parent(radioContainer)
  colorModeSelector.class('radio-group')
  colorModeSelector.option('rainbow', 'Rainbow')
  colorModeSelector.option('funky', 'Funky')
  colorModeSelector.option('custom', 'Custom Color')
  colorModeSelector.selected('custom')
  
  // Make the radio labels clickable
  let radioItems = selectAll('input[type="radio"]', radioContainer.elt)
  let radioLabels = selectAll('label', radioContainer.elt)
  
  for (let i = 0; i < radioLabels.length; i++) {
    radioLabels[i].mousePressed(function() {
      radioItems[i].checked = true;
      colorModeSelector.value(radioItems[i].value)
    })
  }
  
  // Color picker
  let colorPickerContainer = createDiv()
  colorPickerContainer.class('color-picker-container')
  colorPickerContainer.parent(colorSection)

  let colorPickerLabel = createDiv('Custom Color:')
  colorPickerLabel.class('slider-label')
  colorPickerLabel.parent(colorPickerContainer)
  colorPickerLabel.mousePressed(() => {
    colorModeSelector.selected('custom')
  })

  colorPicker = createColorPicker(color(340, 100, 70, 1))
  colorPicker.parent(colorPickerContainer)
  colorPicker.class('color-picker')
  colorPicker.input(() => {
    let c = colorPicker.color()
    customColor.h = hue(c)
    customColor.s = saturation(c)
    customColor.b = brightness(c)
    
    if (customColor.b < 5) {
      customColor.b = brightness(c);
    }

    colorModeSelector.selected('custom')
  })

  colorPickerContainer.mousePressed(() => {
    colorModeSelector.selected('custom')
  })
  
  // Preset buttons
  let presetSection = createDiv()
  presetSection.class('control-section')
  presetSection.parent(controlsContent)
  createDiv('Presets').class('section-title').parent(presetSection)
  
  let presetButtonContainer = createDiv()
  presetButtonContainer.class('button-container')
  presetButtonContainer.parent(presetSection)
  
  createPresetButton(presetButtonContainer, 'Rose', flowerPresets.rose)
  createPresetButton(presetButtonContainer, 'Tulip', flowerPresets.tulip)
  createPresetButton(presetButtonContainer, 'Carnation', flowerPresets.carnation)
}

function createSliderControl(parent, id, label, min, max, value, step, callback) {
  let sliderContainer = createDiv()
  sliderContainer.class('slider-container')
  sliderContainer.parent(parent)
  
  let labelDiv = createDiv(label + ': ' + value)
  labelDiv.class('slider-label')
  labelDiv.id(id + 'Label')
  labelDiv.parent(sliderContainer)
  
  let slider = createSlider(min, max, value, step)
  slider.class('slider')
  slider.parent(sliderContainer)
  slider.input(() => {
    let val = slider.value()
    select('#' + id + 'Label').html(label + ': ' + val)
    if (callback) callback(val)
  })
  
  controls[id] = {
    slider: slider,
    label: labelDiv
  }
  
  return slider
}

function applyPreset(params) {
  for (let key in params) {
    if (flowerConfig.hasOwnProperty(key)) {
      flowerConfig[key] = params[key]
    }
  }
  
  if (params.customColor && params.colorMode === 'custom') {
    customColor = { ...params.customColor }
  }
}

function createPresetButton(parent, name, params) {
  let btn = createButton(name)
  btn.parent(parent)
  btn.class('preset-button')
  btn.mousePressed(() => {
    applyPreset(params)
    
    for (let key in params) {
      if (flowerConfig.hasOwnProperty(key) && controls[key]) {
        controls[key].slider.value(params[key]);
        controls[key].label.html(controls[key].label.html().split(':')[0] + ': ' + params[key])
      }
    }
    
    if (params.colorMode) {
      colorModeSelector.selected(params.colorMode)
      
      if (params.customColor && params.colorMode === 'custom') {
        colorPicker.color(color(customColor.h, customColor.s, customColor.b))
      }
    }
  })
  
  return btn
}