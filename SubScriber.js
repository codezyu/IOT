/**
 * 说明：MQTT 方式对接数据
 * 备注：MQTT是一个轻量级协议，使用MQTT协议的中心是broker（服务器/代理），客户端通过订阅消息和
 *      发布消息进行数据交互。使用MQTT方式的步骤如下：
 *          1.直接连接MQTT服务器（本示例使用的是ActiveMQ消息中间件）
 *          2.引用第三方库 Stomp，详见 https://github.com/stomp-js/stompjs
 *          3.数据对接
 * 功能：通过MQTT方式读取数据并将数据挂接到物体（car01）身上，当温度>30℃时，car01变红
 * 难度：★★☆☆☆
 */

 var app; // App对象
 var car; // 挂载数据的叉车
 
 // 引入样式文件
 THING.Utils.dynamicLoad([
	 'https://www.thingjs.com/static/lib/stomp.min.js',
	 '/guide/examples/css/measure/panel.css',
     'https://www.thingjs.com/static/lib/mqtt.js'
 ], function () {
 
	// 加载场景代码 
	app = new THING.App({
		url: 'https://www.thingjs.com/static/models/factory',  // 场景地址
		background: '#000000',
		env: 'Seaside',
	});

	app.on('load', function () {
		car = app.query('car01')[0];
		// 物体身上创建monitorData对象 用于存储动态监控数据
		car.monitorData = {
			'温度': '',
            '湿度': '',
            '加速度': '',
            '光强':'',
		};
		var mqclass = new MQConnection(); // 创建mq服务类
		new THING.widget.Button('开启读取', function () {
			mqclass.initConnection();

			// 摄像机飞行到某位置
			app.camera.flyTo({
				'position': [50.00333914719489, 21.747771367094018, 35.16550370725474],
				'target': [12.071590067214768, 1.9553381388502726, -5.857819062456373],
				'time': 1000,
				'complete': function () {
				}
			});
		});
		// new THING.widget.Button('关闭读取', function () {
		// 	mqclass.disconnection();

		// 	// 摄像机飞行到某位置
		// 	app.camera.flyTo({
		// 		'position': [36.013, 42.67799999999998, 61.72399999999999],
		// 		'target': [1.646, 7.891, 4.445],
		// 		'time': 1000,
		// 		'complete': function () {
		// 		}
		// 	});
		// });

		createHtml();
	})
})

/**
 * 连接MQ服务
 * 说明：
 *     1.测试使用的MQTT服务器为 ActiveMQ（版本为5.16.2）。
 *     2.设备端每隔4秒会向服务器 /topic/monitor/temperature/one 主题发送一条温度数据。
 *     3.客户端订阅了 /topic/monitor/temperature/one 主题。
 *     4.可以通过其他MQTT客户端向服务器 /topic/monitor/temperature/one 主题发送消息，
 *       验证MQTT服务
 */
class MQConnection {
	/**
	 * 构造器
	 */
	constructor() {
		this.init();
	}
	/**
	 * 初始化
	 */
	init() {
		// 数据推送的url，可修改为自己的服务地址
		this.socketUrl = 'wss://broker-cn.emqx.io:8084/mqtt';
		// 连接
		this.stompClient = null;
		// this.initConnection();
        this._client=null;
	}
	/**
	 * 初始化连接
	 */
	initConnection() {
          const options = {
                clean: true,
                connectTimeout: 4000,
                clientId: 'emqx_client_h5'+Math.random(),
                username: "admin",
                password: 'public',
            };
		var _this = this;
		// if (_this.stompClient != null) return;
		// _this.stompClient = Stomp.client(_this.socketUrl);
		// var success = function () {
		// 	_this.successCallback();
		// }
		// var error = function (error) {
		// 	_this.errorCallback(error);
		// }
		// _this.stompClient.connect(options, success, error);
		// _this.stompClient.debug = null; // 如果需要Stomp日志打印，注释此行代码
        var client = mqtt.connect("wss://www.3dmmd.cn:8086",options);
        const topic1="/topic/monitor/acceleration/one";
        const topic2="/topic/monitor/temperature/one";
        const topic3="/topic/monitor/humity/one";
        const topic4='/topic/monitor/intensity/one';
        client.on("error",(error) =>{
                console.log("重复id连接!...."+error);
            });
        client.on("connect",function (connack) {
              client.subscribe(topic1,{qos:0});
              client.subscribe(topic2,{qos:0});
              client.subscribe(topic3,{qos:0});
              client.subscribe(topic4,{qos:0});
        });
        client.on('message', (topic, payload) => {
            console.log('Received Message:', topic, payload.toString())
            if(topic==topic2)
            {
                updateState("monitorData/温度",payload.toString());
            }
            else if(topic==topic1)
            {
                updateState("monitorData/加速度",payload.toString());
            }
             else if(topic==topic3)
            {
                updateState("monitorData/湿度",payload.toString());
            }
            else if(topic==topic4)
            {
                updateState("monitorData/光强",payload.toString());
            }
        });
    }
	/**
	 * 连接成功后的回调，订阅主题
	 */
	// successCallback(data) {
	// 	var _this = this;
    //     let humi=0;
	// 	console.log('连接成功，订阅话题！');
    //     _this.stompClient.subscribe('/topic/monitor/accleration/one',function (message) {
	// 		if (message.body) {
    //             let test=message.body;
    //             console.log('ok'+test);
	// 		} else {
	// 		}
	// 	});
	// 	_this.stompClient.subscribe('/topic/monitor/temperature/one', function (message) {
	// 		if (message.body) {
	// 			let data = message.body;
    //             updateState(data,humi);
	// 			console.log('接收温度数据:' + data);
	// 		} else {
	// 			console.log('无数据推送！');
	// 		}
	// 	});

    
	// }
	/**
	 * 关闭连接
	 */
	disconnection() {
		console.log('连接已关闭！');
	}
	/**
	 * 连接失败后的回调
	 */
	// errorCallback(error) {
	// 	console.log('连接失败！');
	// 	console.log(error);
	// }
}

/**
 * 接收推送数据后更新状态
 */
function updateState(name,data)
{
    car.setAttribute(name, data);
	let dateString=nowDatetime();
	if (($('.empty').length)) {
		$('.empty').remove();
	}
	if (!($('.tj-group').length)) {
		let tbody = `<tbody class="tj-group" id="tb-line"></tbody>`;
		$('.tj-table').prepend(tbody);
	}
	let tr =
		`<tr class="tj-group-content">
					<td class="tj-key">` + dateString + `</td>
					<td class="tj-value">` +name+': '+data +`</td>
				</tr>`;
	$('.tj-group').prepend(tr);
    changeColor(car);
}
// function updateState(data,humi) {
// 	car.setAttribute("monitorData/温度", data);
//     car.setAttribute("monitorData/湿度", humi);
// 	nowDatetime();
// 	if (($('.empty').length)) {
// 		$('.empty').remove();
// 	}
// 	if (!($('.tj-group').length)) {
// 		let tbody = `<tbody class="tj-group" id="tb-line"></tbody>`;
// 		$('.tj-table').prepend(tbody);
// 	}
// 	let tr =
// 		`<tr class="tj-group-content">
// 					<td class="tj-key">` + dateString + `</td>
// 					<td class="tj-value">` + '温度：'+data + `℃</td>
// 				</tr>`;
//                 let tr1 =
// 		`<tr class="tj-group-content">
// 					<td class="tj-key">` + dateString + `</td>
// 					<td class="tj-value">` +'湿度：'+ humi + `%rh</td>
// 				</tr>`;
// 	$('.tj-group').prepend(tr);
//     $('.tj-group').prepend(tr1);
// 	changeColor(car);
// }

/**
 * 获取系统日期
 */
function nowDatetime() {
	var date = new Date();
	var hours = (date.getHours()) > 9 ? (date.getHours()) : "0" + (date.getHours());
	var minutes = (date.getMinutes()) > 9 ? (date.getMinutes()) : "0" + (date.getMinutes());
	var seconds = (date.getSeconds()) > 9 ? (date.getSeconds()) : "0" + (date.getSeconds());
	dateString =
		hours + ":" +
		minutes + ":" +
		seconds;
	return dateString;
}

/**
 * 当车辆的温度值超过20时，更改小车颜色
 */
function changeColor(obj) {
	var temper = obj.getAttribute("monitorData/温度");
	var value = temper;
	if (value > 30) {
		obj.style.color = 'rgb(255,0,0)';
        return;
	} else {
        obj.style.color=null;
	}
    var tensity=obj.getAttribute("monitorData/光强");
    value = tensity;
	if (value > 50) {
		obj.style.color = 'rgb(255,255,0)';
        return;
	} else {
         obj.style.color=null;
	}
    var acc=obj.getAttribute("monitorData/加速度");
    value = acc;
	if (value > 30) {
		obj.style.color = 'rgb(0,0,255)';
        return;
	} else {
         obj.style.color=null;
	}
     var hu=obj.getAttribute("monitorData/湿度");
    value = hu;
	if (value > 0.7) {
		obj.style.color = 'rgb(0,255,0)';
        return;
	} else {
         obj.style.color=null;
	}
}

// 创建html界面
function createHtml() {
	// 数据详情界面
	let dataDetails =
		`<div id="dataDetails" class="tj-panel property-panel tj-has-title tj-sizable tj-property-panel tj-pinned" style="position: absolute; right: 10px; top: 220px; width: 315px; height: 416px; transform: none;">
				<div class="tj-close"></div>
				<div class="tj-title" style="cursor: move; user-select: none;">数据详情</div>
				<div class="tj-panel-body" style="padding-top: 0px;">
					<div class="tj-panel-container tj-scroll-bar">
						<table class="tj-table">
							<div class="empty">暂无数据</div>
						</table>
					</div>
				</div>
			</div>`;
	$('#div2d').append(dataDetails);
	// 点击按钮关闭面板
	$('#dataDetails .tj-close').on('click', function () {
		$('#dataDetails').css('display', 'none');
	});
}