#include "MotorControl.h"

MotorControl::MotorControl(int pinDigitaleDirection, int pinAnalogVitesse)
  : pinDigitaleDirection(pinDigitaleDirection), pinAnalogVitesse(pinAnalogVitesse), currentSpeed(0), targetSpeed(0),
    currentDirection(true), targetDirection(true), isChangingDirection(false),
    lastDirectionChangeTime(0) {}

void MotorControl::begin() {
  pinMode(pinDigitaleDirection, OUTPUT);
  pinMode(pinAnalogVitesse, OUTPUT);
  setSpeed(0);
  setDirection(true);
}

void MotorControl::setSpeed(int speed) {
  speed = constrain(speed, -100, 100);  // Limiter la vitesse entre -100 et 100 (en pourcentage de la vitesse max)
  speed = map(speed, -100, 100, -255, 255); // et on map sur la résolution
  targetSpeed = abs(speed);        // Prendre la valeur absolue de la vitesse cible
  targetDirection = (speed >= 0);  // Déterminer le sens cible
  DisplayManager::printMotorInfo(targetSpeed, targetDirection);
}

void MotorControl::setDirection(bool forward) {
  digitalWrite(pinDigitaleDirection, forward ? HIGH : LOW);
  currentDirection = forward;  // Mettre à jour le sens actuel
  DisplayManager::printDirectionInfo(currentDirection);
}

void MotorControl::update() {
  if (isChangingDirection) {
    // Vérifier si le délai pour changer de direction est écoulé
    if (millis() - lastDirectionChangeTime >= directionChangeDelay) {
      setDirection(targetDirection);  // Changer de direction
      isChangingDirection = false;    // Fin du processus de changement de sens
    } else {
      // Pendant la transition, on maintient la vitesse à 0
      analogWrite(pinAnalogVitesse, 0);
      return;
    }
  }

  // Vérifier si un changement de sens est nécessaire
  if (currentDirection != targetDirection) {
    if (currentSpeed > 0) {
      // Décélérer à 0 avant de changer de sens
      currentSpeed = 0;
      analogWrite(pinAnalogVitesse, currentSpeed);
      return;
    } else {
      // Si la vitesse est déjà 0, commencer le changement de sens
      isChangingDirection = true;
      lastDirectionChangeTime = millis();
      return;
    }
  }

  // Mettre à jour la vitesse progressivement
  if (!isChangingDirection) {
    if (currentSpeed < targetSpeed) {
      currentSpeed++;
    } else if (currentSpeed > targetSpeed) {
      currentSpeed = targetSpeed;  // Décélération immédiate
    }
    analogWrite(pinAnalogVitesse, currentSpeed);
  }
}
