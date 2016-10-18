var sys = require("sys");
var events = require("events");

var HEART_TIME = 5; //in seconds

var PlayerController = function(socket){

	var timestamp = (new Date().getTime());
	var lastPos = 0.5;
	var name = socket._name;
	var that = this;
	console.log("name of socket: "+name);

	var timeToDeath = HEART_TIME;
	var heartTimer = setInterval(doHeartbeat,HEART_TIME * 1000/2);
	var disconnectTimer = setInterval(function(){
		timeToDeath--;
		if(timeToDeath == 0){
			clearTimeout(heartTimer);
			clearTimeout(disconnectTimer);
			console.log("Device miss heartbeat.. disconnect.");
			socket.disconnect();
		}
	},1000);


	socket.on("message",processMessage);

	this.startStream = function(){
		socket.emit("start");
	}


	this.stopStream = function(){
		socket.emit("stop");
		//socket.removeListener("message",onMove);
	}

	this.getLastPacket = function(){
		return lastPos;
	}

	this.getName = function(){
		if(!name)
			name = this.getIp()+":"+this.getPort()+":"+timestamp;
		return name;
	};

	this.getIp = function(){
		return socket.handshake.address.address;
	};

	this.getPort = function(){
		return socket.handshake.address.port;
	};

	function processMessage(data){
		if(data.indexOf("heartbeat") != -1){	
			timeToDeath = HEART_TIME;
			//clearTimeout(disconnectTimer);
		}
		// else if(data.indexOf("name:") != -1 && name == ""){
		// 	name = data.substring(5);
		// }
		else
			onMove(data);
	}

	function onMove(data){
		data = (data*0.8)+100;
		lastPos = parseFloat("0."+data);
	}

	function doHeartbeat(){
		socket.emit("heartbeat");

		// disconnectTimer = setTimeout(function(){
		// 	clearTimeout(heartTimer);
		// 	console.log("miss heartbeat.. should stop!");
		// 	socket.disconnect();	
		// },HEART_TIME);
	}
};

sys.inherits(PlayerController, events.EventEmitter);
module.exports = PlayerController;