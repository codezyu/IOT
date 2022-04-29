import paho.mqtt.client as mqtt
MQTTHOST = "119.3.155.148"
MQTTPORT = 1883
mqttClient = mqtt.Client()
count=0
# 连接MQTT服务器
def on_mqtt_connect():
    mqttClient.connect(MQTTHOST, MQTTPORT, 60)
    mqttClient.loop_start()
# subscribe 消息
def on_subscribe():
    mqttClient.subscribe("hello", 1)
    mqttClient.on_message = on_message_come # 消息到来处理函数
# 消息处理函数
def on_message_come(lient, userdata, msg):
    global count
    print(msg.topic + " " + ":" + str(msg.payload))
    count+=1
    print(count)
if __name__=='__main__':
    on_mqtt_connect()
    while True:
        on_subscribe()