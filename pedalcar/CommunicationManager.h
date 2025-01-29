#ifndef COMMUNICATIONMANAGER_H
#define COMMUNICATIONMANAGER_H

#include <Arduino.h>
#include "MotorControl.h"
#include "ServoControl.h"
#include "Config.h"
#include "DisplayManager.h"

class CommunicationManager {
private:
  MotorControl& motor;
  ServoControl& servo;
  String currentMode;

  void executeCommand(const String& command);
  String getSerialPinInfo(HardwareSerial& serialPort);

public:
  CommunicationManager(MotorControl& motorControl, ServoControl& servoControl);
  void begin();
  void setMode(String newMode);
  void handleCommunication();
};

#endif
