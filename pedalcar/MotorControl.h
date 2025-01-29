#ifndef MOTORCONTROL_H
#define MOTORCONTROL_H

#include <Arduino.h>
#include "DisplayManager.h"

class MotorControl {
private:
  int pinDigitaleDirection;                        // Broche pour la direction
  int pinAnalogVitesse;                            // Broche pour le signal PWM
  int currentSpeed;                                // Vitesse actuelle
  int targetSpeed;                                 // Vitesse cible
  bool currentDirection;                           // Sens actuel : true = avant, false = arrière
  bool targetDirection;                            // Sens cible
  bool isChangingDirection;                        // Indique si on est en train de changer de sens
  unsigned long lastDirectionChangeTime;           // Temps de la dernière transition
  const unsigned long directionChangeDelay = 1300;  // Délai (en ms) avant de changer de sens
  int motor_max_speed;                        // Vitesse maximale du moteur
  const int true_min_motor_speed = 36;              // La plus petite tension en pourcentage à laquelle le moteur se met à tourner
  const int true_max_motor_speed = 100;             // La plus haute tension en pourcentage à laquelle le moteur se met à tourner

  void setDirection(bool forward);

public:
  MotorControl(int pinDigitaleDirection, int pinAnalogVitesse);
  void begin();
  void setSpeed(int speed);  // Vitesse signée (positive ou négative)
  void update();
};

#endif
