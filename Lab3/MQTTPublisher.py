# -*- coding: utf-8 -*-
import paho.mqtt.client as mqtt
MQTTHOST = "119.3.155.148"
MQTTPORT = 1883
mqttClient = mqtt.Client()
# 连接MQTT服务器
def on_mqtt_connect():
    mqttClient.connect(MQTTHOST, MQTTPORT, 60)
    mqttClient.loop_start()
# publish 消息
def on_publish(topic, payload, qos):
    mqttClient.publish(topic, payload, qos)
def main():
    on_mqtt_connect()
    i=0
    while i<1000:
        on_publish("MQTT", str(i), 0)
        i+=1
if __name__ == '__main__':
    main()

