var SocketMan = function(){
	
	var address = location.origin.replace(/^http/, 'ws');
	var socket = io.connect(address);
	socket.on("handshake-start",function(){
		socket.emit("client-handshake-stop");
	});
	var events = {};

	this.createGame = function(deviceName,beforeStart,afterStart){
		if(beforeStart)
			beforeStart();
		socket.emit("newGame",deviceName);
		if(afterStart)
			afterStart();
	};
	this.watchGame = function(gameNumber,beforeStart,afterStart){
		if(beforeStart)
			beforeStart();
		socket.emit("spectateGame",gameNumber);
		if(afterStart)
			afterStart();
	};
	this.close = function(){
		socket.emit("leave");
		this.removeListeners();
	};

	this.on = function(event,callback){
		if(!socket){
			console.error("Error to set event "+event+". Not connected.");
			return;
		}
		socket.on(event,callback);
	};

	this.onGame = function(event,callback){
		events[event] = callback;
		this.on(event,callback);
	}

	this.removeListeners = function(){
		for(var e in events)
			this.off(e,events[e]);
	}

	this.off = function(event,callback){
		if(!socket){
			console.error("Error to unset event "+event+". Not connected.");
			return;
		}
		socket.removeListener(event,callback);
	};
}
