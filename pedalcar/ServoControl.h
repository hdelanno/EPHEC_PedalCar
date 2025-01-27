#ifndef SERVOCONTROL_H
#define SERVOCONTROL_H

#include <Arduino.h>
#include <Servo.h>
#include "DisplayManager.h"
#include "Config.h"

class ServoControl {
private:
  Servo servo;
  int pinServo;
  int currentAngle;

public:
  ServoControl(int servoPin);
  void begin();
  void setAngle(int angleDemande);
};

#endif
