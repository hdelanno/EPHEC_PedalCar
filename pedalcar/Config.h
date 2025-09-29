#ifndef CONFIG_H
#define CONFIG_H

// === Configuration des Pins ===

// Pin de contrôle du moteur (digital et analogique)
#define MOTOR_DIGITAL_DIR_PIN  49        // Pin numérique pour contrôler le sens du moteur
#define MOTOR_ANALOG_VITESSE_PIN  DAC1        // Pin Analogique pour ajuster la vitesse du moteur

// Pin pour le servo moteur
#define SERVO_PWM_PIN  9           // Pin PWM du servo moteur



// === Configuration des ports série ===

// Choix du port série à utiliser pour la communication
// Ici, vous pouvez choisir entre Serial1, Serial2, etc.
#define COMMUNICATION_PORT Serial1  // Choisissez entre Serial, Serial1, Serial2, etc. Le Serial Monitor vous donnera les pins correspondantes lors de la première connexion.



// === Niveau de Logs ===

// Décommentez la ligne correspondante pour activer le niveau de log désiré

#define LOG_INFO          // Logs d'information
// #define LOG_VERBOSE       // Logs détaillés (tous les changements)



// === Configuration de la communication ===

// Choisissez le mode de communication par défaut (SERIAL ou BLE)
#define DEFAULT_MODE "BLE"   // Modes possibles : "SERIAL", "BLE". Valeur recommandée : "BLE"



// === Configuration du type de Servo-moteur ===

// Choisissez l'angle maximal de votre servo, sachant que nous voulons toujours rester entre 0 et 180 degrés réels, alors que la bibliothèque Servo pense que 180 = angle max
#define SERVO_MAX_ANGLE 180   // Dépend du modèle de servo. Typiquement : 180, 270
#define SERVO_ROUE_ROTATION_MAX 50 // Jusqu'où on laisse tourner les roues (Asymétrique). Valeur recommandée : 50



// === Configuration du Moteur ===

// Choisissez le nombre de vitesse : soit toutes (FULL) soit 4 vitesses (QUATRE_VITESSES). Commentez et décommentez ce qui vous intéresse
// #define QUATRE_VITESSES // = On a 4 vitesses (1 = vitesse min, 2 = 33% vitesse max, 3 = 66% vitesse max et 4 = vitesse max) ; FULL = on peut rentrer un pourcentage de la vitesse max (de 0 à 100)
#define FULL // = On a 5 vitesses (1, 2, 3, 4 et 5) ; FULL = on peut rentrer un pourcentage de la vitesse max (de 0 à 100)

// Choisissez la vitesse maximale du moteur (on commence à bouger à 36% et le maximum est à 100%)
#define MOTOR_MAX_SPEED 100 // 43   // On commence à bouger à 36% et le maximum est à 100%. La valeur recommandée est 40

#define MOTOR_DIR -1 // Correction pour la direction dans lequel est monté le moteur

#endif