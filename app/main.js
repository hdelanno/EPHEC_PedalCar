//------------------------------------------------------------
// Accelerometers to control the Servo Motor (needs to be finalized)
//------------------------------------------------------------

var mandir = document.getElementById("mandir");
var titre = document.getElementById("title");
var operatingSystem = "";

// Store function references for later removal
const startJoystickHandler = (e) => startJoystick(e);
const moveJoystickHandler = (e) => moveJoystick(e);
const stopJoystickHandler = () => stopJoystick();

const startJoystickHandlerTouch = (e) => startJoystick(e.touches[0]);
const moveJoystickHandlerTouch = (e) => moveJoystick(e.touches[0]);
const stopJoystickHandlerTouch = () => stopJoystick();

if (typeof DeviceMotionEvent.requestPermission === "function") {
  // iOS 13+
  titre.innerHTML = "EPHEC HuGau Mobile (iOS : use Bluefy)";
  operatingSystem = "iOS";
} else if (window.DeviceMotionEvent != undefined) {
  // Android
  titre.innerHTML = "EPHEC HuGau Mobile (Android : use Google Chrome)";
  operatingSystem = "Android";
} else {
  // Non supported devices
  titre.innerHTML = "EPHEC HuGau Mobile (Device/browser not supported)";
  operatingSystem = "other";
}

// Ajouter un écouteur d'événement pour le switch mandir
mandir.addEventListener("change", function () {
  getAccel();
  toggleJoystickAndSlider();
});

function toggleJoystickAndSlider() {
  if (!mandir.checked) {
    // Lorsque le switch est désactivé, on cache le joystick et on affiche le slider
    clickArea.innerHTML = `  
      <input type="range" min="-100" max="100" value="0" id="slider" style="width: 100%; height: 100%;" />
    `;
    joystickContainer.style.display = "none"; // Cache le joystick
    
        // Get the slider element
    const slider = document.getElementById('slider');
    
    // Add an event listener to the slider to update the speed value
    slider.addEventListener('input', function() {
      speed = -1*parseInt(slider.value);  // Update the speed variable with the slider's value
      speedDisplay.innerHTML = `Vitesse: ${speed}`;
    });

    // Add event listeners for mouseup and touchend to reset the slider when released
    slider.addEventListener('mouseup', resetSlider);
    slider.addEventListener('touchend', resetSlider);
    
        // Add event listeners to handle touch interaction (for mobile) on the slider
    slider.addEventListener('touchstart', handleTouchStart);
    slider.addEventListener('touchmove', handleTouchMove);

    // Désactiver les événements de mouvement du joystick
    clickArea.removeEventListener("mousedown", startJoystickHandler);
    clickArea.removeEventListener("touchstart", startJoystickHandlerTouch);
    document.body.removeEventListener("mousemove", moveJoystickHandler);
    document.body.removeEventListener("touchmove", moveJoystickHandlerTouch);
    document.body.removeEventListener("mouseup", stopJoystickHandler);
    document.body.removeEventListener("touchend", stopJoystickHandlerTouch);
  } else {
    // Lorsque le switch est désactivé, on cache le slider et on affiche le joystick
    clickArea.innerHTML = ""; // Vide la zone de clic pour enlever le slider
    joystickContainer.style.display = "none"; // Affiche le joystick

    // Réactiver les événements de mouvement du joystick
    clickArea.addEventListener("mousedown", startJoystickHandler);
    clickArea.addEventListener("touchstart", startJoystickHandlerTouch);
    document.body.addEventListener("mousemove", moveJoystickHandler);
    document.body.addEventListener("touchmove", moveJoystickHandlerTouch);
    document.body.addEventListener("mouseup", stopJoystickHandler);
    document.body.addEventListener("touchend", stopJoystickHandlerTouch);
  }
}

// Handle touch start on the slider (mobile)
function handleTouchStart(e) {
  const slider = document.getElementById('slider');
  // Calculate the new value based on the touch position
  const touch = e.touches[0];
  updateSliderValue(touch.clientX);
}

// Handle touch move on the slider (mobile)
function handleTouchMove(e) {
  const touch = e.touches[0];
  updateSliderValue(touch.clientX);
  e.preventDefault(); // Prevents scrolling while sliding
}

// Function to update the slider value based on position
function updateSliderValue(clientX) {
  const slider = document.getElementById('slider');
  const sliderRect = slider.getBoundingClientRect();
  const sliderWidth = sliderRect.width;
  
  // Calculate the new value based on the touch position relative to the slider width
  let newValue = ((clientX - sliderRect.left) / sliderWidth) * (slider.max - slider.min) + parseInt(slider.min);
  newValue = Math.min(Math.max(newValue, slider.min), slider.max); // Clamp the value within the slider range
  slider.value = newValue;
  
  // Update the speed variable based on the new slider value
  speed = -1 * parseInt(slider.value);
  speedDisplay.innerHTML = `Vitesse: ${speed}`;
}

// Function to reset the slider value to 0
function resetSlider() {
  const slider = document.getElementById('slider');
  slider.value = 0;  // Reset the slider value
  speed = 0;  // Reset the speed variable
  speedDisplay.innerHTML = `Vitesse: ${speed}`;
}

var rotation_degrees = 0;
var frontToBack_degrees = 0;
var leftToRight_degrees = 0;

function getAccel() {
  if (operatingSystem == "iOS") {
    DeviceMotionEvent.requestPermission().then((response) => {
      if (response == "granted") {
        getServoAngle();
      }
    });
  } else if (operatingSystem == "Android") {
    getServoAngle();
  }
}

function getServoAngle() {
  // Add a listener to get smartphone orientation
  // in the alpha-beta-gamma axes (units in degrees)
  window.addEventListener("deviceorientation", (event) => {
    // Expose each orientation angle in a more readable way
    let beta = parseInt(event.beta);

    //You will need to adapt the angle for your needle to match what you have on your screen !

    beta = -beta;

    if (beta > 90) {
      beta = 90 - (beta - 90);
    } else if (beta < -90) {
      beta = -90 + (-90 - beta);
    }

    if (!mandir.checked) {
      angle = beta;
      angleDisplay.innerHTML = `Angle: ${angle}°`;
    }

    //the parseInt HAS to be there, otherwise the conversion is hasardeous on the arduino side
  });
}

//------------------------------------------------------------
// Once your done with the Servo Motor, time to go for the Motor !
// Don't forget to change the HTML accordingly.
//------------------------------------------------------------

const joystickContainer = document.getElementById("joystick-container");
const joystick = document.getElementById("joystick");
const angleDisplay = document.getElementById("angle"); // Partie de l'angle
const speedDisplay = document.getElementById("speed"); // Partie de la vitesse
const clickArea = document.getElementById("click-area");

let isMoving = false;
let startX, startY;
let moveX = 0, moveY = 0;

// Empêcher l'apparition du joystick en dehors de la zone #click-area
    clickArea.addEventListener("mousedown", startJoystickHandler);
    clickArea.addEventListener("touchstart", startJoystickHandlerTouch);

function startJoystick(e) {
  startX = e.clientX;
  startY = e.clientY;

  joystickContainer.style.left = `${startX}px`;
  joystickContainer.style.top = `${startY}px`;
  joystickContainer.style.display = "flex";

  isMoving = true;
}

// Déplacement du joystick
    document.body.addEventListener("mousemove", moveJoystickHandler);
    document.body.addEventListener("touchmove", moveJoystickHandlerTouch);

function moveJoystick(e) {
  if (!isMoving) return;

  let sens = 1;

  let dx = e.clientX - startX;
  let dy = e.clientY - startY;
  if (dy > 0) {
    sens = -1;
  }
  let distance = Math.sqrt(dx * dx + dy * dy);
  let maxDistance = 100; // Rayon max du joystick

  // Limiter le joystick à un cercle
  if (distance > maxDistance) {
    let angleCalc = Math.atan2(dy, dx);
    dx = Math.cos(angleCalc) * maxDistance;
    dy = Math.sin(angleCalc) * maxDistance;
    distance = maxDistance;
  }

  joystick.style.transform = `translate(${dx}px, ${dy}px)`;

  // Calcul de l'angle avec 0° vers le haut et valeurs positives/négatives
  let angleRad = Math.atan2(dy, dx); // Inverser dy pour que 0° soit en haut
  let angleDeg = Math.round(angleRad * (180 / Math.PI));

  angleDeg += 90;
  if (angleDeg > 180) {
    angleDeg -= 360;
  }
  
  if (angleDeg > 90) {
    angleDeg = 90 - (angleDeg - 90)
  }
  else if ( angleDeg < -90){
    angleDeg = -90 -90 - angleDeg
  }
  
  if (mandir.checked) {
    angle = angleDeg;
    angleDisplay.innerHTML = `Angle: ${angle}°`;
  }

  speed = sens * Math.round((distance / maxDistance) * 100); // Vitesse en pourcentage

  speedDisplay.innerHTML = `Vitesse: ${speed}`;
}

// Cacher le joystick lorsqu'on relâche
    document.body.addEventListener("mouseup", stopJoystickHandler);
    document.body.addEventListener("touchend", stopJoystickHandlerTouch);

function stopJoystick() {
  isMoving = false;
  joystick.style.transform = "translate(0, 0)";
  joystickContainer.style.display = "none";
  angle = 0;
  speed = 0;
  angleDisplay.innerHTML = `Angle: ${angle}°`;
  speedDisplay.innerHTML = `Vitesse: ${speed}`;
}

//------------------------------------------------------------
// BLE communication handling
//------------------------------------------------------------

// Get references to UI elements
let connectButton = document.getElementById("connect");
let disconnectButton = document.getElementById("disconnect");

var myInterval;

// Connect to the device on Connect button click
connectButton.addEventListener("click", function () {
  connect();
});

// Disconnect from the device on Disconnect button click
disconnectButton.addEventListener("click", function () {
  disconnect();
});

// Selected device object cache
let deviceCache = null;

// Launch Bluetooth device picker and connect to the selected device
//Here I use two things to make it easier to read :
//	1. I use p.then when p is a Promise which force operations to follow a certain order (https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Using_promises) and (https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/then)
//		With the syntax p.then(onFulfilled[, onRejected]);  Here, basically, we want sucesses to continue, otherwise we send an error.
//	2. I use arrow function (https://www.w3schools.com/js/js_arrow_function.asp) where :
//		function (s) { return s.length }
//			simply becomes :
//		s => s.length			(return by default if no {}, just giving parameters (s here) and no name
function connect() {
  return (deviceCache ? Promise.resolve(deviceCache) : requestBluetoothDevice())
    .then((device) => connectDeviceAndCacheCharacteristic(device))
    .then((characteristic) => startNotifications(characteristic))
    .then((myInterval = setInterval(sendingBLEinfo, 100)))
    .then(() => {
      // Disable connect button and Enable Disconnect button after connection is successful
      connectButton.disabled = true;
      disconnectButton.disabled = false;
    })
    .catch((error) => log(error));
}

function requestBluetoothDevice() {
  log("Requesting bluetooth device...");

  return navigator.bluetooth
    .requestDevice({
      filters: [
        {
          services: [0xffe0],
        },
      ],
    })
    .then((device) => {
      log('"' + device.name + '" bluetooth device selected');
      deviceCache = device;

      // Added line
      deviceCache.addEventListener(
        "gattserverdisconnected",
        handleDisconnection
      );

      return deviceCache;
    });
}

function handleDisconnection(event) {
  let device = event.target;

  log(
    '"' +
      device.name +
      '" bluetooth device disconnected, trying to reconnect...'
  );

  connectDeviceAndCacheCharacteristic(device)
    .then((characteristic) => startNotifications(characteristic))
    .catch((error) => log(error));

  // After disconnection, enable Connect button and disable Disconnect button
  connectButton.disabled = false;
  disconnectButton.disabled = true;
}

// Characteristic object cache
let characteristicCache = null;

// Connect to the device specified, get service and characteristic
function connectDeviceAndCacheCharacteristic(device) {
  if (device.gatt.connected && characteristicCache) {
    return Promise.resolve(characteristicCache);
  }

  log("Connecting to GATT server...");

  return device.gatt
    .connect()
    .then((server) => {
      log("GATT server connected, getting service...");

      return server.getPrimaryService(0xffe0);
    })
    .then((service) => {
      log("Service found, getting characteristic...");

      return service.getCharacteristic(0xffe1);
    })
    .then((characteristic) => {
      log("Characteristic found");
      characteristicCache = characteristic;

      return characteristicCache;
    });
}

// Enable the characteristic changes notification
function startNotifications(characteristic) {
  log("Starting notifications...");

  return characteristic.startNotifications().then(() => {
    log("Notifications started");
    // Added line
    characteristic.addEventListener(
      "characteristicvaluechanged",
      handleCharacteristicValueChanged
    );
  });
}

function disconnect() {
  clearInterval(myInterval); //stop sending data every time
  if (deviceCache) {
    log('Disconnecting from "' + deviceCache.name + '" bluetooth device...');
    deviceCache.removeEventListener(
      "gattserverdisconnected",
      handleDisconnection
    );

    if (deviceCache.gatt.connected) {
      deviceCache.gatt.disconnect();
      log('"' + deviceCache.name + '" bluetooth device disconnected');
    } else {
      log(
        '"' + deviceCache.name + '" bluetooth device is already disconnected'
      );
    }
  }

  // Added condition
  if (characteristicCache) {
    characteristicCache.removeEventListener(
      "characteristicvaluechanged",
      handleCharacteristicValueChanged
    );
    characteristicCache = null;
  }

  deviceCache = null;

  // After disconnecting, disable Disconnect button and enable Connect button
  connectButton.disabled = false;
  disconnectButton.disabled = true;
}

// Intermediate buffer for incoming data
let readBuffer = "";

// Data receiving
function handleCharacteristicValueChanged(event) {
  let value = new TextDecoder().decode(event.target.value); //We want to decode byte to text

  for (let c of value) {
    //we receve 20 bytes per 20 bytes, let's make one string until we reach \n
    if (c === "\n") {
      //Be careful, now we need to add a line break when we use the serial monitor
      let data = readBuffer.trim();
      readBuffer = "";

      if (data) {
        receive(data);
      }
    } else {
      readBuffer += c;
    }
  }
}

// Received data handling
function receive(data) {
  log(data, "in");
}

function writeToCharacteristic(characteristic, data) {
  characteristic.writeValue(new TextEncoder().encode(data));
}

// Output to terminal
function log(data, type = "") {
  console.log(type + ":" + data);
}

function send(data, logging = true) {
  data = String(data);

  if (!data || !characteristicCache) {
    return;
  }

  data += "\n";

  if (data.length > 20) {
    let chunks = data.match(/(.|[\r\n]){1,20}/g);

    writeToCharacteristic(characteristicCache, chunks[0]);

    for (let i = 1; i < chunks.length; i++) {
      setTimeout(() => {
        writeToCharacteristic(characteristicCache, chunks[i]);
      }, i * 100);
    }
  } else {
    writeToCharacteristic(characteristicCache, data);
  }
  log(data, "out");
}

function sendingBLEinfo() {
  //R = rotation (info on servo motor) ; M = Move (info on motor speed) ; < and > are start and end of packet
  send("S" + speed + "D" + angle);
}

let speed = 0;
let angle = 0;
