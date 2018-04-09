
/*
  An object representing a remote, Wi-Fi controle IoT light.
  Features include:
     Ability to control RGB color.
     Ability to control Power
*/

// TODO: Add the access token and device ID
var myParticleAccessToken = ""
var myDeviceId =            ""
var topic =                 "cse222Lights/thisLamp/color"

// NOTE: This callback is NOT in the light object to avoid mishandeling of "this"
// Consequently it explicitly changes properties of the global "light" object
// (This approach does not work well when there are multiple objects being interacted with)
function newLightEvent(objectContainingData) {
      var state = JSON.parse(objectContainingData.data)
      // Update the properties of the `light` object and update any listeners
      light.r = state.r
      light.g = state.g
      light.b = state.b
      light.powered = state.powered
      // DONE: Publish the state to any listeners
      light.stateChange()
    }


// Declare the light object
var light = {
    // state variables for the remote light
    r: 0,
    g: 100,
    b: 0,

    powered: false,

    // Variable used to track listener function
    stateChangeListener: null,

    // NOTE: A new object to access particle JavaScript functions
    particle: null,

    // ****** Simple setter functions *******
    setColor: function(color) {
        // Create an object with all the details of the function call
        var functionData = {
             deviceId:myDeviceId,
             name: "setCurrColor",
             argument: color.r+","+color.g+","+color.b,
             auth: myParticleAccessToken
        }

        // Success/failure functions to assist debugging
        function onSuccess(e) { console.log("setCurrColor call success") }
        function onFailure(e) { console.log("setCurrColor call failed")
                                 console.dir(e)  }
        particle.callFunction(functionData).then(onSuccess,onFailure)
    },

    setPowered: function(power) {
      // DONE: This is an example of calling a function
      this.powered = power
      var functionData = {
           deviceId:myDeviceId,
           name: "setLampPower",
           argument: ""+this.powered,
           auth: myParticleAccessToken
      }
      function onSuccess(e) { console.log("setPower call success") }
      function onFailure(e) { console.log("setPowercall failed")
                             console.dir(e) }
      particle.callFunction(functionData).then(onSuccess,onFailure)
    },

    setStateChangeListener: function(aListener) {
      // DONE
      this.stateChangeListener = aListener;
    },

    stateChange: function() {
      // DONE
      // If there's a listener, call it with the data
      if(this.stateChangeListener) {
        var state = { r:this.r,
                      g:this.g,
                      b:this.b,
                      powered:this.powered};
          this.stateChangeListener(state);
      }
    },

    // NOTE: New setup function to do initial setup
    setup: function() {
      // Create a particle object
      particle = new Particle();

      // Get ready to subscribe to the event stream
      function onSuccess(stream) {
        // DONE:  This will "subscribe' to the stream and get the state"
        console.log("getEventStream success")
        stream.on('event', newLightEvent)

        var functionData = {
             deviceId:myDeviceId,
             name: "publishState",
             argument: " ",
             auth: myParticleAccessToken
        }
        function onSuccess(e) { console.log("publishState call success") }
        function onFailure(e) { console.log("publishState call failed")
                                 console.dir(e) }
        particle.callFunction(functionData).then(onSuccess,onFailure)
      }
      function onFailure(e) { console.log("getEventStream call failed")
                              console.dir(e) }
      particle.getEventStream( { name: topic, auth: myParticleAccessToken, deviceId: 'mine' }).then(onSuccess, onFailure)
    }
}
