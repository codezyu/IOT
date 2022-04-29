import requests
import json
import threading
import paho.mqtt.client as mqtt
import socket
import websockets
import asyncio
from queue import Queue
import json
import yaml
import os
import sys
#MQTT subscriber
def MQTTSubscribe(HOST,PORT,TOPIC,QOS=0):
    def MessageCome(lient, userdata, msg):
        global MSQueue
        message=json.loads(str(msg.payload, encoding = "utf-8"))
        message['type']='MQTT'
        msg=json.dumps(message)
        MSQueue.put(msg)
    client=mqtt.Client()
    client.connect(HOST,PORT,60)
    client.loop_start()
    client.on_message=MessageCome
    while True:
        client.subscribe(TOPIC, QOS)
#UDP
def UDPClient(HOST,PORT,WPORT):
    global MSQueue
    client_socket = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    client_socket.setblocking(False)
    client_socket.bind(('localhost',WPORT))
    server_address=(HOST,PORT)
    client_socket.connect(server_address)
    while True:
        try:
            data,address=client_socket.recvfrom(4096)
            msg=data.decode()
            message = json.loads(msg)
            message['type'] = 'UDP'
            msg = json.dumps(message)
            MSQueue.put(msg)
        except BlockingIOError as err:
            pass
    client_socket.close()
def TempLimit(value):
    return 35 < value < 0
def SpeedLimit(value):
    return value>5
def HumidityLimit(value):
    return value>0.75
def Judge(data):
    msg = json.loads(data)
    value=msg['value']
    if msg['name']=='temperature':
        return TempLimit(value)
    if msg['name']=='speed':
        return SpeedLimit(value)
    if msg['name']=='humidity':
        return HumidityLimit(value)
#subscribe
def StartServer(HOST,PORT):
    async def register(websocket):
        global USERS
        print("login")
        USERS.add(websocket)
    async def unregister(websocket):
        global USERS
        USERS.remove(websocket)
    async def PublishMessage():
        global MSQueue,USERS
        if MSQueue and USERS:
            message = MSQueue.get()
            await alert(message)
            if(Judge(message)):
                msg=json.loads(message)
                msg['alert']='1'
                message=json.dumps(msg)
            await asyncio.wait([user.send(message) for user in USERS ])
    async def alert(content):
        global URL
        print(type(content))
        header = {
            "Content-Type": "application/json",
            "Charset": "UTF-8"}
        message = {
            "msgtype": "text",
            "text": {
                "content": "zyu请注意异常数据:"+content
            },
            "at": {
                "isAtAll": True
            }
        }
        message_json = json.dumps(message)
        print(message_json)
        requests.post(url=URL, data=message_json, headers=header)
    async def start(websocket):
        await register(websocket)
        try:
            while True:
                await PublishMessage()
        finally:
            await unregister(websocket)
    loop=asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    loop.run_until_complete(websockets.serve(start,HOST,PORT))
    loop.run_forever()
if __name__=="__main__":
    curPath = os.path.dirname(os.path.realpath(__file__))
    yamlPath = os.path.join(curPath, "config.yaml")
    with open(yamlPath, 'r', encoding='utf-8') as f:
        config = f.read()
    d = yaml.load(config, Loader=yaml.FullLoader)
    URL=d.get('URL')
    print(URL)
    USERS=set()
    MSQueue=Queue()
    Server=threading.Thread(target=StartServer,args=[d.get('WORKINGHOST'),d.get('WORKINGPORT')])
    Server.start()
    MQTTSubscriber=threading.Thread(target=MQTTSubscribe,args=[d.get('MQTTHOST'),d.get('MQTTPORT'),d.get('TOPIC')])
    MQTTSubscriber.start()
    UDPclient=threading.Thread(target=UDPClient,args=[d.get('UDPHOST'),d.get('UDPPORT'),d.get('UDPWORKINGPORT')])
    UDPclient.start()




