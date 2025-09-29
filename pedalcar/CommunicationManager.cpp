#include "CommunicationManager.h"

CommunicationManager::CommunicationManager(MotorControl& motorControl, ServoControl& servoControl)
  : motor(motorControl), servo(servoControl), currentMode(DEFAULT_MODE), lastBLETime(0) {}

void CommunicationManager::begin() {
  COMMUNICATION_PORT.begin(9600);
  COMMUNICATION_PORT.setTimeout(10); 
  Serial.setTimeout(10); 
  Serial.println("Communication initialisée sur le " + getSerialPinInfo(COMMUNICATION_PORT) + ".");
  setMode(DEFAULT_MODE);
}

void CommunicationManager::setMode(String newMode) {
  // Vérifier si le mode est valide (BLE ou SERIAL)
  if (newMode == "BLE") {
    currentMode = "BLE";
    Serial.println("Mode : BLE.");
    Serial.println("Instructions pour le mode BLE :");
    Serial.println("- Utilisez votre appareil Bluetooth pour envoyer des commandes.");
    Serial.println("- La vitesse et la direction sont contrôlées par BLE.");
    Serial.println("Pour passer en SERIAL, écrivez dans le terminal.");
  } else if (newMode == "SERIAL") {
    currentMode = "SERIAL";
    Serial.println("Mode : SERIAL.");
    Serial.println("Instructions pour le mode SERIAL :");
    Serial.println("- Utilisez le port série pour envoyer des commandes via votre PC.");
    Serial.println("- La vitesse et la direction sont contrôlées par le moniteur série en écrivant 'SXX' ou 'DXX' ou un mélange des deux.");
    Serial.println("Pour passer en BLE, écrivez 'BLE' dans le terminal.");
  } else {
    Serial.println("Mode non valide. Veuillez entrer 'BLE' ou 'SERIAL'.");
  }
  executeCommand("0");  // Réinitialiser la vitesse à 0 et la direction à 90
  Serial.println("Vitesse et direction réinitialisées à 0 et 0 degrés.");
}


void CommunicationManager::handleCommunication() {
  String commandFromBLE = "";
  String commandFromSerial = "";

  // Lire les commandes série (PC)
  if (Serial.available()) {
    //commandFromSerial = Serial.readStringUntil('\n');
    commandFromSerial = Serial.readString();
    commandFromSerial.trim();
    commandFromSerial.toLowerCase();  // Convertir en minuscules pour être indépendant de la casse

    if (commandFromSerial == "ble") {
      setMode("BLE");
    } else if (commandFromSerial != "ble") {
      if (currentMode == "BLE") {
        setMode("SERIAL");
      }
      Serial.println("Commande reçue via PC : " + commandFromSerial);
      executeCommand(commandFromSerial);
    }
  }

  // Lire les commandes BLE
  if (currentMode == "BLE" && COMMUNICATION_PORT.available()) {
    // commandFromBLE = COMMUNICATION_PORT.readStringUntil('\n');
    commandFromBLE = COMMUNICATION_PORT.readString();
    commandFromBLE.trim();
    commandFromBLE.toLowerCase();  // Convertir en minuscules pour être indépendant de la casse

    if (commandFromBLE.length() > 0) {
      Serial.println("Commande reçue via BLE : " + commandFromBLE);
      executeCommand(commandFromBLE);
      lastBLETime = millis();  // Reset the timer whenever a new BLE command is received
    }
  }

  // Check for BLE timeout (if no command received within BLE_TIMEOUT period)
  if (currentMode == "BLE" && millis() - lastBLETime >= BLE_TIMEOUT) {
    Serial.println("Timeout BLE - Arrêt du véhicule.");
    executeCommand("0");  // Reset motor and servo when BLE times out
    lastBLETime = millis();  // Reset the timer after sending the "0" command
  }
}

void CommunicationManager::executeCommand(const String& command) {

  if (command == "0") {
    int speed = 0;
    int angle = 0;
    motor.setSpeed(speed);
    servo.setAngle(angle);
  }

  // Recherche de la commande de vitesse (Sxx) et de direction (Dxx)
  int speedIndex = command.indexOf('s');
  int angleIndex = command.indexOf('d');

  // Si 'S' est trouvé, extraire la vitesse
  if (speedIndex != -1) {
    int startIndex = speedIndex + 1;
    int endIndex = (angleIndex != -1 && angleIndex > speedIndex) ? angleIndex : command.length();
    String speedValue = command.substring(startIndex, endIndex);
    int speed = MOTOR_DIR * speedValue.toInt();
    motor.setSpeed(speed);
  }

  // Si 'D' est trouvé, extraire l'angle
  if (angleIndex != -1) {
    int startIndex = angleIndex + 1;
    String angleValue = command.substring(startIndex);
    int angle = angleValue.toInt();
    servo.setAngle(angle);
  }
}

String CommunicationManager::getSerialPinInfo(HardwareSerial& serialPort) {
  // Vérifiez quel objet Serial nous utilisons et affichez les informations des pins correspondantes
  String serialInfo = "";
  if (&serialPort == &Serial) {
    serialInfo = "Serial (TX0 = Pin 1, RX0 = Pin 0)";
  } else if (&serialPort == &Serial1) {
    serialInfo = "Serial1 (TX1 = Pin 18, RX1 = Pin 19)";
  } else if (&serialPort == &Serial2) {
    serialInfo = "Serial2 (TX2 = Pin 16, RX2 = Pin 17)";
  } else if (&serialPort == &Serial3) {
    serialInfo = "Serial3 (TX3 = Pin 14, RX3 = Pin 15)";
  } else {
    serialInfo = "Port Série Inconnu.";
  }
  return serialInfo;
}
