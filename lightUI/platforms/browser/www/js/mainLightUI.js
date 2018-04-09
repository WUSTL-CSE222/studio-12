

// TODO: Nothing!!!! (But read the notes)
// NOTE: This file is complete and doesn't need modification
//       You may want to review is as a reference.
//       Items that have changed since studio 4 (4B) are marked with a "NOTE"

// Variables representing elements on the "Basic" screen
var currentColor
var targetColor
var redSlider
var redLabel
var greenSlider
var greenLabel
var blueSlider
var blueLabel
var onOffSwitch
var onOffSwitchLabel

// Utility Function: Convert an RGB values (integers) to a string for use in HTML/CSS styles.
function rgb(r,g,b) {
  return "rgb(" + r + "," + g + "," + b + ")";
}

// Update the current color to reflect the positions of the sliders
function updateTargetColor() {
  // DONE
  var red = Math.round(redSlider.value*255/100)
  var green = Math.round(greenSlider.value*255/100)
  var blue = Math.round(blueSlider.value*255/100)
  targetColor.style.background = rgb(red, green, blue)
}

function setColorClicked(event) {
  // DONE
  var red = Math.round(redSlider.value*255/100)
  var green = Math.round(greenSlider.value*255/100)
  var blue = Math.round(blueSlider.value*255/100)
  light.setColor({"r":red, "g":green, "b":blue})
}

function redSliderChange(event) {
  // DONE
  redLabel.innerText = redSlider.value
  updateTargetColor()
}

function greenSliderChange(event) {
  // DONE
  greenLabel.innerText = greenSlider.value
  updateTargetColor()
}

function blueSliderChange(event) {
  // DONE
  blueLabel.innerText = blueSlider.value
  updateTargetColor()
}

function onOffUpdate() {
  // DONE
  light.setPowered(onOffSwitch.checked)
}

function stateUpdate(newState) {
  // DONE
  loadingPage(false)  // NOTE: Added last to re-enable controls when state ready

  // Adjust state elements that may be changed on light / come from light
  if(newState.powered) {
    onOffSwitchLabel.MaterialSwitch.on()
  } else {
    onOffSwitchLabel.MaterialSwitch.off()
  }

  // Set color
  currentColor.style.background = rgb(newState.r, newState.g, newState.b)
}

function loadingPage(value) {
  // DONE
  document.getElementById("loading").hidden = !value;
  document.getElementById("allControls").hidden = value;
}


// On startup:  Things to do once the page is fully loaded and the DOM is configured
document.addEventListener('deviceready', function(event) {
  // NOTE: Note change to event (from document.addEventListener("DOMContentLoaded"... to
  //       window.addEventListener("load"...).   This delays all event listeners/etc.
  //       until after the Material Design Lite elements on the page are ready)

  // DONE
  currentColor = document.getElementById("currentColor")
  targetColor = document.getElementById("targetColor")
  redSlider = document.getElementById("redSlider")
  redLabel = document.getElementById("redLabel")
  greenSlider = document.getElementById("greenSlider")
  greenLabel = document.getElementById("greenLabel")
  blueSlider = document.getElementById("blueSlider")
  blueLabel = document.getElementById("blueLabel")
  onOffSwitch = document.getElementById("onOffSwitch")
  onOffSwitchLabel = document.getElementById("onOffSwitchLabel")

  // Event handlers
  document.getElementById("setColorButton").addEventListener("click", setColorClicked)
  document.getElementById("redSlider").addEventListener("change", redSliderChange)
  document.getElementById("greenSlider").addEventListener("change", greenSliderChange)
  document.getElementById("blueSlider").addEventListener("change", blueSliderChange)
  onOffSwitch.addEventListener("click", onOffUpdate)

  loadingPage(true)

  // Setup the light object and configure callbacks from events
  light.setStateChangeListener(stateUpdate)
  // NOTE: Added a call to "light.setup()" to do initial configuration
  // (Subscribe to events first to ensure they aren't missed)
  light.setup()

  // Update the sliders and shown color by manually calling their callbacks
  updateTargetColor()
  redSliderChange()
  blueSliderChange()
  greenSliderChange()
})
