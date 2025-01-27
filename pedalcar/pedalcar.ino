/*
  ****************************************************
  * Arduino Due - Contrôle du moteur et de la direction *
  * via BLE (Bluetooth Low Energy)                   *
  ****************************************************

  Ce programme est conçu pour contrôler la vitesse et la direction d'un moteur
  ainsi que d'un servo via Bluetooth Low Energy (BLE). L'Arduino Due interagit
  avec un module HM-10 BLE pour recevoir des commandes permettant de contrôler 
  la vitesse du moteur (via une broche analogique) et la direction (via une 
  broche numérique et un moteur servo).

  La vitesse est ajustée à l'aide d'une valeur analogique allant de -255 à +255,
  où les valeurs négatives contrôlent le moteur dans un sens et les valeurs positives
  contrôlent le moteur dans l'autre sens. Lorsqu'on change la vitesse d'une valeur positive
  vers une valeur négative (ou inversement), le programme met d'abord la vitesse à 0, attend
  un moment, puis change de sens et augmente progressivement la vitesse.

  La direction est contrôlée via un moteur servo, ajusté en fonction des 
  entrées reçues du module BLE.

  AVIS IMPORTANT :
  Pour télécharger le code sur votre Arduino Due, assurez-vous d'utiliser le **port de programmation**.
  Le **port natif** est réservé à la fonctionnalité périphérique USB et ne doit pas être utilisé 
  pour télécharger le programme. Vous pouvez reconnaître le port de programmation comme étant 
  le port USB le plus proche du connecteur d'alimentation. Utilisez toujours le **port de programmation** 
  pour le téléchargement du code et la communication série.

  Pour la communication BLE, le module HM-10 est utilisé pour recevoir des commandes telles que :
    - "S<valeur>" : définir la vitesse à <valeur> (de -100 à 100 (c'est un pourcentage))
    - "D<valeur>" : définir la direction à <valeur> (de (e.g.) -60 degrés à 60 degrés, 0 degrés étant tout droit)
    - "S<valeur>D<valeur>" : définir à la fois la vitesse et la direction simultanément

  La configuration des différentes broches, angles max, types de servo se fait dans le fichier Config.h.

  Créé par : Hugo Delannoy
  Date : 27/01/2025
  
*/

#include <Arduino.h>
#include "Config.h"
#include "MotorControl.h"
#include "ServoControl.h"
#include "CommunicationManager.h"

// Définir les broches pour le moteur
const int pinDigitaleDirection = MOTOR_DIGITAL_DIR_PIN;  // Broche digitale pour la direction
const int pinAnalogVitesse = MOTOR_ANALOG_VITESSE_PIN;    // Broche analogique pour la vitesse

// Attention, le BLE doit être branché sur un port série hardware (voir Config.h)

// Définir la broche pour le servo
const int pinPWMServo = SERVO_PWM_PIN;  // Broche signal PWM du servo

// Création des objets pour les modules
MotorControl motor(pinDigitaleDirection, pinAnalogVitesse);
ServoControl servo(pinPWMServo);
CommunicationManager communication(motor, servo);

void setup() {
  Serial.begin(9600);     // Initialisation de la communication série avec le PC
  motor.begin();          // Initialisation du moteur
  servo.begin();          // Initialisation du servo
  communication.begin();  // Initialisation des communications BLE et série

  Serial.println("Système prêt !");
}

void loop() {
  // Gérer les communications et exécuter les commandes
  communication.handleCommunication();

  // Mettre à jour les actions du moteur (ramp-up progressif)
  motor.update();

  delay(10);
}
