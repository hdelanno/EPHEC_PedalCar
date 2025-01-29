#include "ServoControl.h"

ServoControl::ServoControl(int servoPin)
  : pinServo(servoPin), currentAngle(0) {}

void ServoControl::begin() {
  servo.attach(pinServo);
  setAngle(currentAngle);
}

void ServoControl::setAngle(int angleDemande) {
  angleDemande = constrain(angleDemande, -1*SERVO_ROUE_ROTATION_MAX, SERVO_ROUE_ROTATION_MAX);  // Limiter l'angle entre (e.g.) -45° et 45°, sachant que 0° est tout droit
  int angleReel = SERVO_MAX_ANGLE / 2 + angleDemande;
  int currentAngle = angleReel * 180 / SERVO_MAX_ANGLE; // Angle réel du servo
  servo.write(currentAngle);
  DisplayManager::printServoInfo(angleDemande, currentAngle);
}
