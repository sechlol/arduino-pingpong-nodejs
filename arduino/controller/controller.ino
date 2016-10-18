#include <TinkerKit.h>

TKAccelerometer accelerometer(I4, I5);  

int SMOOTH_CONSTANT = 20;
int TRANSMIT_RATE = 15;
unsigned long lastTime;
int cnt,sum;
int data[32],head,tail;
String tmpStr;


void setup() {
  
  // initialize serial communications at 9600 bps
  Serial.begin(9600);

  lastTime = millis();
  cnt = 0;
  sum = 0;
  head = 0;
  tail = 0;
}

void loop(){

  unsigned now = millis();
  int y = accelerometer.inclination();
  
  if (y > 140) y = 140;
  if (y < -140) y  = -140;
  if (y == 0) return ; 
  cnt = cnt + 1;
  
  sum += y;
  data[tail] = y;
  tail = (tail + 1) % 32;
  if (cnt > SMOOTH_CONSTANT){
    sum -= data[head];
    head = (head + 1) % 32;
  }
  
  if (now - lastTime>= TRANSMIT_RATE){
    
    int output=0;
    if (cnt >= SMOOTH_CONSTANT){
      output = sum / SMOOTH_CONSTANT ;
      /*
      Serial.print(sum);
      Serial.print("/");
      Serial.print(SMOOTH_CONSTANT);
      Serial.print( " = ");
      Serial.println(output);*/
      cnt = SMOOTH_CONSTANT;
    } 
    else{
      output = sum / cnt;  
    }
    
    // print the results to the serial monitor:
    lastTime = now;
    if (output > 80) output = 80;
    if (output < -80) output  = -80;
    output = ((output+80.0)/160.0) * 1000 ;
    tmpStr = String(output);
   
    //Serial.println(cnt);
    //Serial.print(y);
    //Serial.println(sum);
    //Serial.println(output);
    Serial.println("$"+tmpStr+"#");
  }    
}
