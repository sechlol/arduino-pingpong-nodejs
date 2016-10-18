#include <SocketIOClient.h>
#include "Ethernet.h"
#include "SPI.h"
#include <TinkerKit.h>

#define TRANSMIT_RATE 20UL
#define LED_DELAY_ACTIVE 200UL
#define LED_DELAY_IDLE 1000UL

unsigned long ledDelay = LED_DELAY_IDLE;
unsigned long lastTransmit;
unsigned long lastBlink;
boolean transmit = false;
boolean debug = false;

TKLed led(O2);
SocketIOClient client;

byte mac[] = {0x90, 0xA2, 0xDA, 0x0D, 0x39, 0xB0};

//name of the server here
char hostname[] = "arduinopong2.herokuapp.com";

//port of the server
int port = 80;

String data="",temp="";

void onHeartbeat(){
  client.send("heartbeat");
}

void onStart(){
  transmit = true;
  ledDelay = LED_DELAY_ACTIVE;
}

void onStop(){
  transmit = false;
  ledDelay = LED_DELAY_IDLE;
}

void onHandshake(){
  client.send("setName:SechDuino");
  client.send("arduino-handshake-stop");
}

// websocket message handler: do something with command from server
void ondata(SocketIOClient client, char *data) {

  if(strcmp(data,"heartbeat") == 0)
    onHeartbeat();
  else if(strcmp(data,"handshake-start") == 0)
    onHandshake();
  else if(strcmp(data,"start") == 0)
    onStart();
  else if(strcmp(data,"stop") == 0)
    onStop();
}

void setup() {
  Serial.begin(9600);
  led.brightness(1000);
  led.on();

  Ethernet.begin(mac);
  client.setDataArrivedDelegate(ondata);

  if (!client.connect(hostname))
    led.off();
}


void sendPosition(){
  if(transmit == true && data != ""){
    char buf[5];
    data.toCharArray(buf,5);
    client.send(buf);
  //  Serial.print(buf);
  //  Serial.println(" - "+data);
  }
}

int updatePosition(){
  
  if(Serial.available()){
    char c;
    
    while(Serial.available() > 0){
      c = Serial.read();
      if(c == '$'){
        temp = "";
      }
      else if(c >= '0' && c <= '9')
        temp += c;
      else if(c == '#'){
          data = temp;
      }
    }
  }
}

void loop() {
  if(!client.connected())
    return;
  
  client.monitor();
  unsigned long now = millis();
   
  /* send position update to server*/
  if ((now - lastTransmit) >= TRANSMIT_RATE) {
    lastTransmit = now;
    updatePosition();
    sendPosition();
  }

  /* make the led blinking according to the state */
  if ((now - lastBlink) >= ledDelay) {
    lastBlink = now;
    if(led.state() == false)
      led.on();
    else
      led.off();
  }
  
}



