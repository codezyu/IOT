import PySimpleGUI as sg
from threading import Lock, Thread
import threading
import time
import paho.mqtt.client as mqtt
import random
from queue import Queue
import datetime
import socket
from pyecharts import options as opts
from pyecharts.charts import Grid, Liquid
from pyecharts.commons.utils import JsCode
from pyecharts.globals import CurrentConfig, ThemeType
def generate_random_str(randomlength=16):
    random_str = ''
    base_str = 'ABCDEFGHIGKLMNOPQRSTUVWXYZabcdefghigklmnopqrstuvwxyz0123456789'
    length = len(base_str) - 1
    for i in range(randomlength):
        random_str += base_str[random.randint(0, length)]
    return random_str
class MQTTPublisher():
    MQTTHOST = "119.3.155.148"
    MQTTPORT = 1883
    mqttClient = mqtt.Client()
    count=0
    def run(self):
        global window
        MQTTPublisher.on_mqtt_connect(self)
        i = 0
        while i < 1000:
            MQTTPublisher.on_publish("MQTT", generate_random_str(1400), 0)
            i += 1
            window['progressbar'].UpdateBar(i)
    def on_mqtt_connect(self):
        MQTTPublisher.mqttClient.connect(MQTTPublisher.MQTTHOST,MQTTPublisher.MQTTPORT, 60)
        MQTTPublisher.mqttClient.loop_start()
    def on_publish(topic, payload, qos):
        MQTTPublisher.mqttClient.publish(topic, payload, qos)
class MQTTSubscriber(threading.Thread):
    MQTTHOST = "119.3.155.148"
    MQTTPORT = 1883
    mqttClient = mqtt.Client()
    def run(self):
        global count
        MQTTSubscriber.on_mqtt_connect(self)
        while True:
            MQTTSubscriber.on_subscribe(self)
    def on_mqtt_connect(self):
        MQTTSubscriber.mqttClient.connect(MQTTSubscriber.MQTTHOST,MQTTSubscriber.MQTTPORT, 60)
        MQTTSubscriber.mqttClient.loop_start()
    def on_subscribe(self):
        MQTTSubscriber.mqttClient.subscribe("MQTT", 1)
        MQTTSubscriber.mqttClient.on_message = MQTTSubscriber.on_message_come  # 消息到来处理函数
    def on_message_come(lient, userdata, msg):
        global count,q2
        q2.get()
        count+=1
        q2.put(count)
class UDPClient():
    def run(self):
        global udpcount,window
        client_socket = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        client_socket.setblocking(False)
        server_address = ("119.3.155.148", 18888)  # 接收方 服务器的ip地址和端口号
        maxcount = 0
        msg = 'begin'
        client_socket.sendto(msg.encode('utf-8'), server_address)
        for i in range(0,10000):
            try:
                data, address = client_socket.recvfrom(4096)
                q1.get()
                print(data)
                udpcount += 1
                q1.put(udpcount)
                window['progressbar'].UpdateBar(udpcount)
            except BlockingIOError as err:
                pass
        for i in range(1, 10):
            client_socket.sendto('clear'.encode('utf-8'), server_address)
        window['progressbar'].UpdateBar(1000)
        q1.put(udpcount)
        client_socket.close()
if __name__=='__main__':
    sg.theme('BlueMono')
    layout = [[sg.Text("丢包率和吞吐量对比")],
              [sg.Text("",key='tips')],
            [sg.ProgressBar(1000, orientation='h', size=(20, 20), key='progressbar')],
            [sg.Button("开始测试", button_color=('black', 'orange'))],
            ]
    window = sg.Window("MQTTvsUDP", layout)
    while True:
        event, values = window.read()
        if event == sg.WIN_CLOSED:
            break
        if event=='开始测试':
            q2=Queue()
            q1=Queue()
            window['tips'].update('MQTT开始接收')
            count=0
            thread2=MQTTSubscriber()
            thread1 = MQTTPublisher()
            thread2.start()
            thread1.run()
            window['开始测试'].update(disabled=True)
            window['tips'].update('MQTT测试成功')
            udpcount=0
            print(q2.get())
            thread3= UDPClient()
            window['tips'].update('UDP开始测试')
            thread3.run()
            print(q2.get())
            print(q1.get())
            lq_1 = (
                Liquid()
                    .add(
                    series_name='UDP',  # 系列名称，用于 tooltip 的显示，legend 的图例筛选。
                    data=[udpcount/1000.0],  # 系列数据，格式为 [value1, value2, ....]
                    center=['60%', '50%'],
                    # 水球外形，有' circle', 'rect', 'roundRect', 'triangle', 'diamond', 'pin', 'arrow' 可选。
                    # 默认 'circle'   也可以为自定义的 SVG 路径
                    shape='circle',
                    color=['yellow'],  # 波浪颜色   Optional[Sequence[str]] = None,
                    is_animation=True,  # 是否显示波浪动画
                    is_outline_show=False,  # 是否显示边框
                )
                    .set_global_opts(title_opts=opts.TitleOpts(title='接收的数据包'))
            )

            lq_2 = (
                Liquid()
                    .add(
                    series_name='MQTT',
                    data=[count/1000.0],
                    center=['25%', '50%'],
                    label_opts=opts.LabelOpts(
                        font_size=50,
                        formatter=JsCode(
                            """function (param) {
                                    return (Math.floor(param.value * 10000) / 100) + '%';
                                }"""
                        ),
                        position='inside'
                    )

                )
            )

            grid = Grid(init_opts=opts.InitOpts(theme=ThemeType.DARK)).add(lq_1, grid_opts=opts.GridOpts()).add(lq_2,
                                                                                                                grid_opts=opts.GridOpts())
            grid.render("result.html")
            print('MQTT:' + str(1400 *count / 1000) + 'KB')
            print('UDP:' + str(1400 * udpcount / 1000) + 'KB')
    window.close()