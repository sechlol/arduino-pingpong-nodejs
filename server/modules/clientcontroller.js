var sys = require("sys");
var events = require("events");

var ClientController = function(socket){
	var clientSocket = socket;
	var timestamp = (new Date().getTime());

	this.getName = function(){
		return this.getIp()+":"+this.getPort()+":"+timestamp;
	};

	this.getIp = function(){
		return clientSocket.handshake.address.address;
	};

	this.getPort = function(){
		return clientSocket.handshake.address.port;
	};

	this.init = function(data){
		clientSocket.emit("init",data);
	};

	this.prepare = function(data){
		clientSocket.emit("prepare",data);
	};

	this.update = function(data){
		clientSocket.emit("update",data);	
	};

	this.score = function(data){
		clientSocket.emit("score",data);	
	};

	this.winner = function(data){
		clientSocket.emit("winner",data);	
	};

	this.disband = function(data){
		clientSocket.emit("end",data);	
	};
};

sys.inherits(ClientController, events.EventEmitter);
module.exports = ClientController;