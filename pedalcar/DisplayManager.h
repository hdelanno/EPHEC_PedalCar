#ifndef DISPLAYMANAGER_H
#define DISPLAYMANAGER_H

#include <Arduino.h>
#include "Config.h"

class DisplayManager {
public:
  static void printMotorInfo(int speed, bool direction);
  static void printDirectionInfo(bool direction);
  static void printServoInfo(int angleDemande, int angleServo);

};

#endif
