#include "DisplayManager.h"

#ifdef LOG_INFO
void DisplayManager::printMotorInfo(int speed, bool direction) {
  if (direction) {
    Serial.println("Vitesse : " + String(speed) + " vers l'AVANT.");
  } else {
    Serial.println("Vitesse : " + String(speed) + " vers l'ARRIERE.");
  }
}
void DisplayManager::printServoInfo(int angleDemande, int angleServo) {
  Serial.println("Angle demandé : " + String(angleDemande) + " degrés. Ce qui correspond à un angle servo de : " + String(angleDemande) + " degrés.");
}
void DisplayManager::printDirectionInfo(bool direction) {
  if (direction) {
    Serial.println("Le moteur va vers l'AVANT.");
  } else {
    Serial.println("Le moteur va vers l'ARRIERE.");
  }
}

#elif defined(LOG_VERBOSE)
void DisplayManager::printMotorInfo(int speed, bool direction) {
  if (direction) {
    Serial.println("Vitesse : " + String(speed) + " vers l'AVANT.");
  } else {
    Serial.println("Vitesse : " + String(speed) + " vers l'ARRIERE.");
  }
}
void DisplayManager::printServoInfo(int angleDemande, int angleServo) {
  Serial.println("Angle demandé : " + String(angleDemande) + " degrés. Ce qui correspond à un angle servo de : " + String(angleServo) + " degrés.");
}
void DisplayManager::printDirectionInfo(bool direction) {
  if (direction) {
    Serial.println("Le moteur va vers l'AVANT.");
  } else {
    Serial.println("Le moteur va vers l'ARRIERE.");
  }
}
#else
void DisplayManager::printMotorInfo(int speed, bool direction){};
void DisplayManager::printServoInfo(int angle){};
void DisplayManager::printDirectionInfo(bool direction) {};
#endif
