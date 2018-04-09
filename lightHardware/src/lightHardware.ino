
// If you are using the external antenna, uncomment:
// STARTUP(WiFi.selectAntenna(ANT_AUTO));

// Hardware pins:
// TODO: Setup Hardware PINS
const int rPin = ;
const int gPin = ;
const int bPin = ;
const int buttonPin = ;


// Fade related values
long startFade = 0;
double totalTime = 5000.0;
// Lamp fade state variables
int _startR, _startG, _startB;
int _endR, _endG, _endB;


const String topic = "cse222Lights/thisLamp/color";

// Lamp state variables (the "target" color)
int currentR=255, currentG=255, currentB=255;
boolean power = true;

Timer rgbFadeUpdateTimer(1000,updateRGB);
Timer rgbFadeTimer(5000,fadeEnd, true);

// Button state variables
boolean buttonPressed = false;
long pressStart = 0;




void rgbWrite(int pin, int value) {
  analogWrite(pin,(255-value));
}

// Periodic update of state to approach new color
void updateRGB() {
  long now = millis();
  double fraction = min( (now-startFade)/totalTime, 1.0);
  currentR = (int)(_startR + (_endR-_startR)*fraction);
  currentG = (int)(_startG + (_endG-_startG)*fraction);
  currentB = (int)(_startB + (_endB-_startB)*fraction);
  displayCurrentColor();
}

// Fade complete
void fadeEnd() {
  rgbFadeUpdateTimer.stop();
  currentR = _endR;
  currentG = _endG;
  currentB = _endB;
  displayCurrentColor();
}

 void rgbFade(int startR, int startG, int startB, int endR, int endG, int endB) {
  startFade = millis();
  _startR = startR;
  _startG = startG;
  _startB = startB;

  _endR = endR;
  _endG = endG;
  _endB = endB;
  rgbFadeUpdateTimer.start();
  rgbFadeTimer.start();
 }



void displayCurrentColor() {
  if(power) {
    rgbWrite(rPin, currentR);
    rgbWrite(gPin, currentG);
    rgbWrite(bPin, currentB);
  } else {
    rgbWrite(rPin, 0);
    rgbWrite(gPin, 0);
    rgbWrite(bPin, 0);
  }

  publishState("");
}

// Publish the lights current state
int publishState(String arg) {
  /*
  String data = String("{ \"powered\": ") + (power?"true, ":"false, ")
                        + "\"r\":"+currentR + ", \"g\":"+currentG + ", \"b\":" + currentB + "}";
*/
  // Goal: Publish a valid JSON string containing the state of the light:
  //   Ex:   "{"powered":true, "r":255, "g":255, "b":255}"
  //   Note that each property has double quotes!
  String data = "{";
  if(power) {
    data += "\"powered\":true";
  } else {
    data += "\"powered\":false";
  }
  data += ", ";
  data += "\"r\":";
  data += currentR;
  data += ", ";
  data += "\"g\":";
  data += currentG;
  data += ", ";
  data += "\"b\":";
  data += currentB;
  data += "}";

  Serial.println("Publishing:");
  Serial.println(data);

  Particle.publish(topic, data, 60, PRIVATE);
  return 0;
}

// Studio function:  Set the lamp to on/off based on string
int setLampPower(String value) {
  if(value=="true")  {
    power = true;
  } else if(value=="false") {
    power = false;
    // Stop any fading / timers
    rgbFadeUpdateTimer.stop();
    rgbFadeTimer.stop();
  }
  displayCurrentColor();
  return power;
}


int setCurrentColor(String value) {
   // Convert input to string
   int r = value.toInt();
   int afterFirstComma = value.indexOf(',')+1;
   int afterSecondComma = value.indexOf(',', afterFirstComma)+1;
   int g = value.substring(afterFirstComma).toInt();
   int b = value.substring(afterSecondComma).toInt();

   /*
   // Testing conversion
   Serial.println(value);
   Serial.print(r);
   Serial.print(", ");
   Serial.print(g);
   Serial.print(", ");
   Serial.println(b);
   */

   if(power) {
     rgbFadeUpdateTimer.stop();
     rgbFadeTimer.stop();
     rgbFade(currentR, currentG, currentB, r,g,b);
   } else {
     currentR = r;
     currentG = g;
     currentB = b;
   }
   displayCurrentColor();
   return 0;
}

void setup() {
  Serial.begin(9600);
  pinMode(rPin, OUTPUT);
  pinMode(gPin, OUTPUT);
  pinMode(bPin, OUTPUT);

  pinMode(buttonPin, INPUT_PULLUP);

  displayCurrentColor();

  Particle.function("setCurrColor", setCurrentColor);
  Particle.function("setLampPower", setLampPower);
  Particle.function("publishState", publishState);
  Particle.variable("power", power);
}

void loop() {
  // Check for a valid button press
  long now = millis();
  if(!buttonPressed && (digitalRead(buttonPin) == LOW) && (now-pressStart > 50)) {
      // Toggle the lamp value
      if(power) {
        setLampPower("false");
      } else {
        setLampPower("true");
      }
      buttonPressed = true;
      pressStart = now;
  } else if( (digitalRead(buttonPin) == HIGH) && (now-pressStart > 100) ) {
    // Note that button is released
    buttonPressed = false;
  }
}
