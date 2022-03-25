const loadText = document.getElementsByTagName("title")[0];
let load = 0;
let status=0;
let id1;
let id2;
let id3;
const URL = "http://localhost:9999";
const Path = "/data";
$(function () {
    //测试代码
    $.ajax({
        type: "GET",
        url: URL,
        dataType: "text",
        crossDomain: true,
        success: function (data) {
            id1 = setInterval(blurring, 10);
            // id2= setInterval(SetMeteorology,1000);
            id3=setInterval(GetMeteorology,60000);
        },
        error: function (data) {
            alert("加载失败,请检查服务器" + URL);
        }
    });
    var myDate = new Date();
    GetMeteorology(myDate.toLocaleDateString(),myDate.toLocaleDateString());
})
function getRandom(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
function SetMeteorology() {
    let nowURL = URL + Path;
    var maxdaterandom = new Date().getTime();
    // 由于当前环境为北京GMT+8时区，所以与GMT有8个小时的差值
    var mindaterandom = new Date(1970, 0, 1, 8).getTime();
    var randomdate = getRandom(mindaterandom, maxdaterandom);
    var datestr = moment(randomdate).format("YYYY/MM/DD");
    alert(datestr)
    let data = {
        "temperature": Math.random() * 50 + -10,
        "humidity": Math.random(),
        "windSpeed": Math.random() * 100,
        "rainFall": Math.random() * 500,
        "altitude": Math.random() * 5000,
        "position": {
            "longitude": Math.random() * 360-180,
            "latitude": Math.random() * 50+40,
        },
        "date": datestr,
        "name": "meteorology"
    }
    console.log(JSON.stringify(data))
    $.ajax({
        type: "post",
        contentType: "application/json;charset=UTF-8",
        url: nowURL,
        dataType: "json",
        data: JSON.stringify(data),
        crossDomain: true,
        success: function (data) {
            alert(data)
        },
        error: function (data, status) {
            alert(status + "/传感器警告:上传数据失败,请检查服务器" + nowURL);
        }
    });
}

function GetMeteorology(begin, end) {
    let nowURL = URL + Path;
    $.ajax({
        type: "GET",
        url: nowURL,
        dataType: "text",
        data: {
            "name": "meteorology",
        },
        crossDomain: true,
        success: function (data) {
            welcome();
            let newdata=JSON.parse(data);
            let size=0;
            let arrNew = [];
            //服务器位置厦门
            const server=[118.11022,24.490474];
            let point=[];
            point.push(server);
            newdata.forEach(item => {
                arrNew.push({'coords':[[item["position"]["longitude"],item["position"]["latitude"]],server]})
                point.push([item["position"]["longitude"],item["position"]["latitude"]]);
                size++;
            })
            console.log(point)
           show(size);
           showData(newdata);
           showPosition(arrNew,point);
        },
        error: function (data) {
            alert("读取数据失败,请检查服务器" + nowURL);
        }
    });
}
function show(size){
    var myChart = echarts.init(document.getElementById('main'));
    option = {
        tooltip: {
            formatter: '{a} <br/>{b} : {c}%'
        },
        series: [
            {
                name: '天气传感数据',
                type: 'gauge',
                progress: {
                    show: true
                },
                detail: {
                    valueAnimation: true,
                    formatter: '{value}'
                },
                data: [
                    {
                        value: size,
                        name: '数据总条数'
                    }
                ]
            }
        ]
    };
    myChart.setOption(option);
}
function welcome(){
    var chartDom = document.getElementById('welcome');
    var myChart = echarts.init(chartDom);
    var option = {
        graphic: {
            elements: [
                {
                    type: 'text',
                    left: 'center',
                    top: 'center',
                    style: {
                        text: 'ZY BOARD',
                        fontSize: 80,
                        fontWeight: 'bold',
                        lineDash: [0, 200],
                        lineDashOffset: 0,
                        fill: 'transparent',
                        stroke: '#000',
                        lineWidth: 1
                    },
                    keyframeAnimation: {
                        duration: 3000,
                        loop: true,
                        keyframes: [
                            {
                                percent: 0.7,
                                style: {
                                    fill: 'transparent',
                                    lineDashOffset: 200,
                                    lineDash: [200, 0]
                                }
                            },
                            {
                                // Stop for a while.
                                percent: 0.8,
                                style: {
                                    fill: 'transparent'
                                }
                            },
                            {
                                percent: 1,
                                style: {
                                    fill: 'black'
                                }
                            }
                        ]
                    }
                }
            ]
        }
    };
    myChart.setOption(option);
}
function showPosition(data,point)
{
    var mapChart = echarts.init(document.getElementById("position"));
    mapChart.setOption({
        geo3D: {
            map: 'world',
            shading: 'realistic',
            silent: true,
            environment: '#333',
            realisticMaterial: {
                roughness: 0.8,
                metalness: 0
            },
            postEffect: {
                enable: true
            },
            groundPlane: {
                show: false
            },
            light: {
                main: {
                    intensity: 1,
                    alpha: 30
                },
                ambient: {
                    intensity: 0
                }
            },
            viewControl: {
                distance: 70,
                alpha: 89,
                panMouseButton: 'left',
                rotateMouseButton: 'right'
            },
            itemStyle: {
                color: '#000'
            },
            regionHeight: 0.5
        },
        series: [
            {
                type: 'lines3D',
                coordinateSystem: 'geo3D',
                effect: {
                    show: true,
                    trailWidth: 1,
                    trailOpacity: 0.5,
                    trailLength: 0.2,
                    constantSpeed: 10
                },
                blendMode: 'lighter',
                lineStyle: {
                    width: 0.2,
                    opacity: 0.05
                },
                data: data,
            },
            {
                type: 'scatter3D',
                coordinateSystem: 'geo3D',
                blendMode: 'lighter',
                symbolSize: 4,
                itemStyle: {
                    color: '#A0EEE1',
                    opacity: 0.7
                },
                data: point,
            },
        ],
    });

}
function showData(data){
    let x=[];
    let temp=[];
    let ws=[];
    let rf=[];
    let hm=[];
    data.forEach(item=>{
        x.push(item["date"]);
        temp.push((item["temperature"]+10)/50);
        ws.push((item["windSpeed"])/100);
        rf.push(item["rainFall"]/500);
        hm.push(item["humidity"]);
    });
    var chartDom = document.getElementById('data');
    var myChart = echarts.init(chartDom);
    var option;
    option = {
        color: ['#80FFA5', '#00DDFF', '#37A2FF', '#FF0087', '#FFBF00'],
        title: {
            text: '数据变化图'
        },
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'cross',
                label: {
                    backgroundColor: '#6a7985'
                }
            }
        },
        legend: {
            data: ['温度', '湿度', '风速', '降雨']
        },
        toolbox: {
            feature: {
                saveAsImage: {}
            }
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
        },
        xAxis: [
            {
                type: 'category',
                boundaryGap: false,
                data: x,
            }
        ],
        yAxis: [
            {
                type: 'value'
            }
        ],
        series: [
            {
                name: '温度',
                type: 'line',
                stack: 'Total',
                smooth: true,
                lineStyle: {
                    width: 0
                },
                showSymbol: false,
                areaStyle: {
                    opacity: 0.8,
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        {
                            offset: 0,
                            color: 'rgb(128, 255, 165)'
                        },
                        {
                            offset: 1,
                            color: 'rgb(1, 191, 236)'
                        }
                    ])
                },
                emphasis: {
                    focus: 'series'
                },
                data: temp,
            },
            {
                name: '湿度',
                type: 'line',
                stack: 'Total',
                smooth: true,
                lineStyle: {
                    width: 0
                },
                showSymbol: false,
                areaStyle: {
                    opacity: 0.8,
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        {
                            offset: 0,
                            color: 'rgb(0, 221, 255)'
                        },
                        {
                            offset: 1,
                            color: 'rgb(77, 119, 255)'
                        }
                    ])
                },
                emphasis: {
                    focus: 'series'
                },
                data: hm,
            },
            {
                name: '风速',
                type: 'line',
                stack: 'Total',
                smooth: true,
                lineStyle: {
                    width: 0
                },
                showSymbol: false,
                areaStyle: {
                    opacity: 0.8,
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        {
                            offset: 0,
                            color: 'rgb(55, 162, 255)'
                        },
                        {
                            offset: 1,
                            color: 'rgb(116, 21, 219)'
                        }
                    ])
                },
                emphasis: {
                    focus: 'series'
                },
                data: ws,
            },
            {
                name: '降雨',
                type: 'line',
                stack: 'Total',
                smooth: true,
                lineStyle: {
                    width: 0
                },
                showSymbol: false,
                areaStyle: {
                    opacity: 0.8,
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        {
                            offset: 0,
                            color: 'rgb(255, 0, 135)'
                        },
                        {
                            offset: 1,
                            color: 'rgb(135, 0, 157)'
                        }
                    ])
                },
                emphasis: {
                    focus: 'series'
                },
                data: rf,
            },
        ]
    };
    myChart.setOption(option);

}
function blurring() {
    load++
    if (load > 99) {
        clearInterval(id1);
        loadText.innerText = `早上好`
    }
    loadText.innerText = `加载中,请稍后:${load}%`
    loadText.style.opacity = scale(load, 0, 100, 1, 0)
}

const scale = (num, in_min, in_max, out_min, out_max) => {
    return ((num - in_min) * (out_max - out_min)) / (in_max - in_min) + out_min
}
