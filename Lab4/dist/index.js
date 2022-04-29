MQTTnum=0
UDPnum=0
MQTTTemperature=[]
UDPTemperature=[]
UDPSpeed=[]
MQTTSpeed=[]
maxlength=7
page=0
option=[]
MTemp=[]
UTemp=[]
MSpeed=[]
USpeed=[]
function init(){
    option[1]={
        angleAxis: {
            type: 'category',
            data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
        },
        radiusAxis: {},
        polar: {},
        series: [
            {
                type: 'bar',
                data: UDPSpeed,
                coordinateSystem: 'polar',
                name: 'UDPSpeed',
                stack: 'a',
                emphasis: {
                    focus: 'series'
                }
            },
            {
                type: 'bar',
                data: MQTTSpeed,
                coordinateSystem: 'polar',
                name: 'MQTTSpeed',
                stack: 'a',
                emphasis: {
                    focus: 'series'
                }
            },
        ],
        legend: {
            show: true,
            data: ['MQTTSpeed', 'UDPSpeed']
        }
    };
    option[0]= {
        title: {
            text: 'MQTT&UDP Temperature '
        },
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                animation: false
            }
        },
        toolbox: {
            show: true,
            feature: {
                dataZoom: {
                    yAxisIndex: 'none'
                },
                dataView: { readOnly: false },
                magicType: { type: ['line', 'bar'] },
                restore: {},
                saveAsImage: {}
            }
        },
        xAxis: [{
            type: 'category',
            splitLine: {
                show: false
            },
            data:['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        },
            {
                type: 'category',
                splitLine: {
                    show: false
                },
                data:['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            }
        ],
        yAxis: {
            type: 'value',
            scale: true,
            splitLine: {
                show: false
            }
        },
        series: [
            {
                name: 'UDP Temperature',
                type: 'line',
                smooth: true,
                xAxisIndex: 1,
                markPoint: {
                    data: [
                        { type: 'max', name: 'Max' },
                        { type: 'min', name: 'Min' }
                    ]
                },
                markLine: {
                    data: [{ type: 'average', name: 'Avg' }]
                },
                showSymbol: false,
                data: UDPTemperature
            },
            {
                name: 'MQTT Temperature',
                type: 'line',
                smooth: true,
                markPoint: {
                    data: [
                        { type: 'max', name: 'Max' },
                        { type: 'min', name: 'Min' }
                    ]
                },
                markLine: {
                    data: [{ type: 'average', name: 'Avg' }]
                },
                showSymbol: false,
                data: MQTTTemperature
            }
        ]
    };
    option[2]= {
        title: {
            text: 'Normalised Data'
        },
        legend: {
            data: ['MQTTSpeed', 'UDPSpeed','MQTTTemperature','UDPTemperature'],
            bottom: 0
        },
        toolbox: {
            // y: 'bottom',
            feature: {
                magicType: {
                    type: ['stack']
                },
                dataView: {},
                saveAsImage: {
                    pixelRatio: 2
                }
            }
        },

        tooltip: {},
        xAxis: {
            data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            splitLine: {
                show: false
            }
        },
        yAxis: {},
        series: [
            {
                name: 'MQTTSpeed',
                type: 'bar',
                data: MSpeed,
                emphasis: {
                    focus: 'series'
                },
                animationDelay: function (idx) {
                    return idx * 10;
                }
            },
            {
                name: 'UDPSpeed',
                type: 'bar',
                data: USpeed,
                emphasis: {
                    focus: 'series'
                },
                animationDelay: function (idx) {
                    return idx * 10 + 100;
                }
            },
            {
                name: 'MQTTTemperature',
                type: 'bar',
                data: MTemp,
                emphasis: {
                    focus: 'series'
                },
                animationDelay: function (idx) {
                    return idx * 10 + 50;
                }
            },
            {
                name: 'UDPTemperature',
                type: 'bar',
                data: UTemp,
                emphasis: {
                    focus: 'series'
                },
                animationDelay: function (idx) {
                    return idx * 10 + 150;
                }
            },
        ],
        animationEasing: 'elasticOut',
        animationDelayUpdate: function (idx) {
            return idx * 5;
        }
    };
}
function close(){
    var chartDom = document.getElementById('Show');
    var myChart = echarts.init(chartDom);
    for(let i=0;i<option.length;i++)
        myChart.setOption(option[i],false);
}
$(function () {
    init()
    var int=setInterval(clear,1000);
    var showH=document.querySelector('.showhumidity');
    let showO=document.querySelector('.overall')
    let showT=document.querySelector('.active')
    showT.addEventListener('click',function (){
        page=0;
        show()
    })
    showH.addEventListener('click',function (){
        page=1;
        show()
    })
    showO.addEventListener('click',function (){
        page=2;
        show()
    })
    let socket = new WebSocket("ws://127.0.0.1:19999/");
    socket.onerror = function(error) {
        alert('连接失败，请检查你的网络连接'+`[error] ${error.message}`);
    };
    socket.onmessage=MessageArrive
})
function MessageArrive(e){
    data=JSON.parse(e.data)
    type=data['alert']
    // if (type=='1')
    //     alert('Danger!   '+data['name']+'\'s value '+data['value']+'    is overlimit' )
    // MessageQueue.enqueue
    let now = new Date();
    let datestr=[now.getMinutes(),now.getSeconds()].join(':')
    if (data['type']=='MQTT'){
        MQTTnum++;
        if(data['name']=='temperature')
            {
                if(MQTTTemperature.length>maxlength)
                    MQTTTemperature.shift()
                MQTTTemperature.push(+data['value']);
                MTemp=datac(MQTTTemperature)
            }
        else if(data['name']=='speed'){
            if(MQTTSpeed.length>maxlength)
                MQTTSpeed.shift()
            MQTTSpeed.push(+data['value'])
            MSpeed=datac(MQTTSpeed)
        }

    }
    else {
        UDPnum++;
        if(data['name']=='temperature'){
            if(UDPTemperature.length>maxlength)
                UDPTemperature.shift()
            UDPTemperature.push(+data['value'])
            UTemp=datac(UDPTemperature)
        }
        else if(data['name']=='speed'){
            if(UDPSpeed.length>maxlength)
                UDPSpeed.shift()
            UDPSpeed.push(+data['value'])
            USpeed=datac(UDPSpeed)
        }
    }
    if(page==2)
        init()
    update(data)
}
async function show(){
    var chartDom = document.getElementById('Show');
    var myChart = echarts.init(chartDom);
    myChart.setOption(option[page],true);
}
function datac(ar){
    array=[]
    a=[1,2,3]
    min=Math.min(...ar)
    max=Math.max(...ar)
    if(length==1)
        array.push(1)
    else
    for(let i=0;i<ar.length;i++)
    {
        array.push(+(ar[i]-min)/(max-min))
    }
    return array
}

function update(data){
    updateNum()
    showMessage(data)
    switch (page) {
        case 0:
            show()
            break;
        case 1:
            show()
            break;
        case 2:
            show()
    }
}
async function updateNum(){
    var root = document.getElementById("MQTTnum");
    root.innerHTML=MQTTnum
    root = document.getElementById("UDPNum");
    root.innerHTML=UDPnum
}
function clear(){
    let time=document.getElementById("time")
    var now = new Date();
    var year = now.getFullYear(); //得到年份
    var month = now.getMonth()+1;//得到月份
    var date = now.getDate();//得到日期
    var hour= now.getHours();//得到小时数
    var minute= now.getMinutes();//得到分钟数
    var second= now.getSeconds();//得到秒数
    time.innerHTML=hour+":"+minute+":"+second
    var root = document.getElementById("newMessage");
    var child=document.getElementById('1')
    if(child!=null)
        root.removeChild(child)
}
function Adddiv(root,type,classname){
    var div = document.createElement(type);
    var divattr = document.createAttribute("class");
    divattr.value = classname;
    div.setAttributeNode(divattr);
    root.appendChild(div)
    return div
}
async function showMessage(data){
    var root = document.getElementById("newMessage");
    child=Adddiv(root,"div","message-box")
    child.id='1'
    child1=Adddiv(child,"div","message-content")
    child2=Adddiv(child1,"div","message-header")
    child3=Adddiv(child2,"div","name")
    child3.innerHTML=data['type']
    child4=Adddiv(child1,"p","message-line")
    child4.innerHTML=data['name']+':'+data['value']
}

