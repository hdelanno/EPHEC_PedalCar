//------------------------------------------------------------
// Accelerometers to control the Servo Motor (needs to be finalized)
//------------------------------------------------------------

var incoming = document.getElementById("incoming");
var outcoming = document.getElementById("outcoming");
var mandir = document.getElementById("mandir");
var accelButton = document.getElementById('accelPermsButton');
var operatingSystem = ""

if (typeof DeviceMotionEvent.requestPermission === 'function') {
  // iOS 13+
  accelButton.disabled = false
  accelButton.innerHTML = "Get Accelerometer Permissions (iOS : use Bluefy)"
  operatingSystem = "iOS"
}
else if (window.DeviceMotionEvent != undefined) {
  // Android
  accelButton.disabled = false
  accelButton.innerHTML = "Start Accelerometer (Android : use Google Chrome)"
  operatingSystem = "Android"
}
else {
  // Non supported devices
  accelButton.disabled = true
  accelButton.innerHTML = "Start Accelerometer (Not supported on your device)"
  operatingSystem = "other"

}

var rotation_degrees = 0;
var frontToBack_degrees = 0;
var leftToRight_degrees = 0;

function getAccel() {
  if (operatingSystem == "iOS") {
    DeviceMotionEvent.requestPermission().then(response => {
      if (response == 'granted') {
        getServoAngle();
      }
    });
  }
  else if (operatingSystem == "Android") {
    getServoAngle();

  }
}

function getServoAngle() {
  // Add a listener to get smartphone orientation
  // in the alpha-beta-gamma axes (units in degrees)
  window.addEventListener('deviceorientation', (event) => {
    // Expose each orientation angle in a more readable way
    let alpha = parseInt(event.beta);

    let needle = document.getElementsByClassName("needle")[0]
    needle.setAttribute('style', "background: #4CAF50");
    //You will need to adapt the angle for your needle to match what you have on your screen !

    alpha = -1 * alpha;
    
    if(alpha > 90)
    {
      alpha = 90 - (alpha - 90)
    }
    else if(alpha < -90)
    {
      alpha = -90 + (-90 - alpha);
    }
    
    
    needle.style.transform = "rotate(" + alpha + "deg)";

    if(!mandir.checked)
    {
      angle = alpha;
    }


    //log(alpha) //will be sent to BLE every Xms if there is a BLE connection
    //the parseInt HAS to be there, otherwise the conversion is hasardeous on the arduino side
  });

}

//------------------------------------------------------------
// Once your done with the Servo Motor, time to go for the Motor !
// Don't forget to change the HTML accordingly.
//------------------------------------------------------------


//------------------------------------------------------------
// BLE communication handling
//------------------------------------------------------------

// Get references to UI elements
let connectButton = document.getElementById('connect');
let disconnectButton = document.getElementById('disconnect');
let terminalContainer = document.getElementById('terminal');
let sendForm = document.getElementById('send-form');
let inputField = document.getElementById('input');

var myInterval;

// Connect to the device on Connect button click
connectButton.addEventListener('click', function () {
  connect();
});

// Disconnect from the device on Disconnect button click
disconnectButton.addEventListener('click', function () {
  disconnect();
});

// Handle form submit event
sendForm.addEventListener('submit', function (event) {
  event.preventDefault(); // Prevent form sending
  send(inputField.value); // Send text field contents
  inputField.value = ''; // Zero text field
  inputField.focus(); // Focus on text field
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
  return (deviceCache ? Promise.resolve(deviceCache) :
      requestBluetoothDevice()).
  then(device => connectDeviceAndCacheCharacteristic(device)).
  then(characteristic => startNotifications(characteristic)).
  then(myInterval = setInterval(sendingBLEinfo, 100)).
  catch(error => log(error));
}

function requestBluetoothDevice() {
  log('Requesting bluetooth device...');

  return navigator.bluetooth.requestDevice({
    filters: [{
      services: [0xFFE0]
    }],
  }).
  then(device => {
    log('"' + device.name + '" bluetooth device selected');
    deviceCache = device;

    // Added line
    deviceCache.addEventListener('gattserverdisconnected',
        handleDisconnection);

    return deviceCache;
  });
}

function handleDisconnection(event) {
  let device = event.target;

  log('"' + device.name +
      '" bluetooth device disconnected, trying to reconnect...');

  connectDeviceAndCacheCharacteristic(device).
  then(characteristic => startNotifications(characteristic)).
  catch(error => log(error));
}


// Characteristic object cache
let characteristicCache = null;

// Connect to the device specified, get service and characteristic
function connectDeviceAndCacheCharacteristic(device) {
  if (device.gatt.connected && characteristicCache) {
    return Promise.resolve(characteristicCache);
  }

  log('Connecting to GATT server...');

  return device.gatt.connect().
  then(server => {
    log('GATT server connected, getting service...');

    return server.getPrimaryService(0xFFE0);
  }).
  then(service => {
    log('Service found, getting characteristic...');

    return service.getCharacteristic(0xFFE1);
  }).
  then(characteristic => {
    log('Characteristic found');
    characteristicCache = characteristic;

    return characteristicCache;
  });
}

// Enable the characteristic changes notification
function startNotifications(characteristic) {
  log('Starting notifications...');

  return characteristic.startNotifications().
  then(() => {
    log('Notifications started');
    // Added line
    characteristic.addEventListener('characteristicvaluechanged',
        handleCharacteristicValueChanged);
  });
}

function disconnect() {
  clearInterval(myInterval); //stop sending data every time
  if (deviceCache) {
    log('Disconnecting from "' + deviceCache.name + '" bluetooth device...');
    deviceCache.removeEventListener('gattserverdisconnected',
        handleDisconnection);

    if (deviceCache.gatt.connected) {
      deviceCache.gatt.disconnect();
      log('"' + deviceCache.name + '" bluetooth device disconnected');
    }
    else {
      log('"' + deviceCache.name +
          '" bluetooth device is already disconnected');
    }
  }

  // Added condition
  if (characteristicCache) {
    characteristicCache.removeEventListener('characteristicvaluechanged',
        handleCharacteristicValueChanged);
    characteristicCache = null;
  }

  deviceCache = null;
}

// Intermediate buffer for incoming data
let readBuffer = '';

// Data receiving
function handleCharacteristicValueChanged(event) {
  let value = new TextDecoder().decode(event.target.value); //We want to decode byte to text

  for (let c of value) { //we receve 20 bytes per 20 bytes, let's make one string until we reach \n
    if (c === '\n') { //Be careful, now we need to add a line break when we use the serial monitor
      let data = readBuffer.trim();
      readBuffer = '';

      if (data) {
        receive(data);
      }
    }
    else {
      readBuffer += c;
    }
  }
}

// Received data handling
function receive(data) {
  if(incoming.checked) {
    log(data, 'in');
  }
}


function writeToCharacteristic(characteristic, data) {
  characteristic.writeValue(new TextEncoder().encode(data));
}


// Output to terminal
function log(data, type = '') {
  let newLine = document.createElement("p")
  if(type)
  {
    newLine.classList.add(type);
  }
  newLine.innerText = data;
  terminalContainer.appendChild(newLine);
  terminalContainer.scrollTop = terminalContainer.scrollHeight;
}

function send(data, logging = true) {
  data = String(data);

  if (!data || !characteristicCache) {
    return;
  }

  data += '\n';

  if (data.length > 20) {
    let chunks = data.match(/(.|[\r\n]){1,20}/g);

    writeToCharacteristic(characteristicCache, chunks[0]);

    for (let i = 1; i < chunks.length; i++) {
      setTimeout(() => {
        writeToCharacteristic(characteristicCache, chunks[i]);
      }, i * 100);
    }
  }
  else {
    writeToCharacteristic(characteristicCache, data);
  }
  if(outcoming.checked)
  {
    log(data, 'out');
  }
}

function sendingBLEinfo() {
  //R = rotation (info on servo motor) ; M = Move (info on motor speed) ; < and > are start and end of packet
  send("S" + speed + "D" + angle);
}

let speedValue = document.getElementById("speed");
let speedslider = document.getElementById("speedslider");
let speed = 0;
let angleValue = document.getElementById("angle");
let angleslider = document.getElementById("angleSlider");
let angle = 0;
function speedUpdate()
{
  if(speed !== parseInt(speedslider.value))
  {
    speedValue.innerText = speedslider.value;
    speed = parseInt(speedslider.value);
  }
  else if(!clickSpeed && speed !== 0)
  {
    if(speed >= 1)
    {
      speed -= 1;
    }
    else if(speed <= -1)
    {
      speed += 1;
    }
    else
    {
      speed = 0;
    }
    speedslider.value = speed;
    speedValue.innerText = speed;
  }

  if(mandir.checked)
  {
    if(angle !== parseInt(angleslider.value))
    {
      angleValue.innerText = angleslider.value;
      angle = parseInt(angleslider.value);
    }
    else if(!click && angle !== 0)
    {
      if(angle >= 10)
      {
        angle -= 10;
      }
      else if(angle <= -10)
      {
        angle += 10;
      }
      else
      {
        angle = 0;
      }
    }
  }
  angleslider.value = angle;
  angleValue.innerText = angle;
}

setInterval(speedUpdate, 100);

let clickSpeed = false;

function startClickSpeed()
{
  clickSpeed = true;
}

function endClickSpeed()
{
  clickSpeed = false;
}

let click = false;

function startClick()
{
  click = true;
}

function endClick()
{
  click = false;
}

