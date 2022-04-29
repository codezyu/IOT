# -*- coding: utf-8 -*-
import paho.mqtt.client as mqtt
import time
import socket
import asyncio
import random
import json
MQTTHOST = "119.3.155.148"
MQTTPORT = 1883
mqttClient = mqtt.Client()
server_socket = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
server_address = ("localhost", 18888)
client_address = ('localhost',18889)
server_socket.bind(server_address)
# 连接MQTT服务器
def GetRandomName():
    name=['speed','temperature']
    return random.choice(name)
def GetRandomValue(name):
    if name=='temperature':
        return round(random.random()*80-40,1)
    if name=='speed':
        return round(random.random()*10,1)
    if name=='humidity':
        return round(random.random(),1)
def GetString():
    name=GetRandomName()
    return json.dumps({'name': name,'value': GetRandomValue(name)})
def on_mqtt_connect():
    mqttClient.connect(MQTTHOST, MQTTPORT, 60)
    mqttClient.loop_start()
async def udp_send():
    server_socket.sendto(GetString().encode('utf-8'), client_address)
    time.sleep(2)
# publish 消息
async def MQTTpublish():
    for i in range(0,4):
        on_publish("MQTT", GetString(), 0)
        time.sleep(0.5)
def on_publish(topic, payload, qos):
    mqttClient.publish(topic, payload, qos)
def main():
    on_mqtt_connect()
    while True:
        list=[MQTTpublish(),udp_send()]
        loops = asyncio.get_event_loop()
        loops.run_until_complete(asyncio.wait(list))
if __name__ == '__main__':
    main()

