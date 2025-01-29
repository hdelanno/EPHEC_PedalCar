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
  motor_max_speed = min(max(MOTOR_MAX_SPEED, true_min_motor_speed), 100);
}

#ifdef FULL
void MotorControl::setSpeed(int speed) {                                // speed représente la vitesse en pourcentage de la tension
  speed = constrain(speed, -true_max_motor_speed, true_max_motor_speed);                                  // Limiter la vitesse entre -100 et 100 (en pourcentage de la vitesse max)
  speed = constrain(speed, -motor_max_speed, motor_max_speed);  // on bride le moteur à X % de sa vitesse maximale
  speed = map(speed, -true_max_motor_speed, true_max_motor_speed, -255, 255);                             // et on map sur la résolution
  targetSpeed = abs(speed);                                             // Prendre la valeur absolue de la vitesse cible
  targetDirection = (speed >= 0);                                       // Déterminer le sens cible
  DisplayManager::printMotorInfo(targetSpeed, targetDirection);
}
#elif defined(QUATRE_VITESSES)
void MotorControl::setSpeed(int speed) {  // speed représente les la vitesse min, puis 33 et 66 et 100% de la vitesse max par rapport à la vitesse min
  if (speed > 0) {
    speed = true_min_motor_speed + (speed - 1) / 3. * (motor_max_speed - true_min_motor_speed);
  } else if (speed < 0) {
    speed = -true_min_motor_speed + (speed - 1) / 3. * (motor_max_speed - true_min_motor_speed);
  }
  Serial.println(speed);
  speed = constrain(speed, -true_max_motor_speed, true_max_motor_speed);                                  // Limiter la vitesse entre -100 et 100 (en pourcentage de la vitesse max)
  speed = constrain(speed, -motor_max_speed, motor_max_speed);  // on bride le moteur à X % de sa vitesse maximale
  speed = map(speed, -true_max_motor_speed, true_max_motor_speed, -255, 255);                             // et on map sur la résolution
  targetSpeed = abs(speed);                                             // Prendre la valeur absolue de la vitesse cible
  targetDirection = (speed >= 0);                                       // Déterminer le sens cible
  DisplayManager::printMotorInfo(targetSpeed, targetDirection);
}

#endif

void MotorControl::setDirection(bool forward) {
  digitalWrite(pinDigitaleDirection, forward ? HIGH : LOW);
  currentDirection = forward;  // Mettre à jour le sens actuel
  DisplayManager::printDirectionInfo(currentDirection);
  //delay(1300);
}

void MotorControl::update() {
  if (isChangingDirection) {
    // Vérifier si le délai pour changer de direction est écoulé
    if (millis() - lastDirectionChangeTime >= directionChangeDelay) {
      isChangingDirection = false;  // Fin du processus de changement de sens
    } else {
      // Pendant la transition, on maintient la vitesse à 0
      currentSpeed = 0;
      analogWrite(pinAnalogVitesse, 0);
    }
  } else {
    if (currentDirection != targetDirection) {
      currentSpeed = 0;
      analogWrite(pinAnalogVitesse, currentSpeed);
      setDirection(targetDirection);  // Changer de direction
      isChangingDirection = true;
      lastDirectionChangeTime = millis();
    }

    // Mettre à jour la vitesse progressivement
    if (currentSpeed < targetSpeed) {
      currentSpeed = targetSpeed;  // pas de ramping pour le moment
      /*if (currentSpeed < 35) {
        currentSpeed = 35;
      } else {
        currentSpeed++;
      }*/
    } else if (currentSpeed > targetSpeed) {
      currentSpeed = targetSpeed;  // Décélération immédiate
    }
    analogWrite(pinAnalogVitesse, currentSpeed);
  }
}
