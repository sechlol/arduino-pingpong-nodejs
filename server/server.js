var express = require("express");
var http = require('http');

var port = process.env.PORT || 3000;
var clientApp = express();
clientApp.use(express.static(__dirname + '/views'));
var clientSocket = require('socket.io').listen(clientApp.listen(port),{log:false});

var GameServer = require("./modules/gameserver");
var gameServer = new GameServer();

clientApp.get("/",function(req,res){
  res.sendfile("./views/index.html");
});

clientApp.get("/devices",function(req,res){
  //sends the list of available devices
  var devices = gameServer.getPlayerList();
//  res.header("Access-Control-Allow-Origin", "*");
  res.send(devices);
});

clientApp.get("/games",function(req,res){
  //sends the list of available devices
  var devices = gameServer.getGameList();
//  res.header("Access-Control-Allow-Origin", "*");
  res.send(devices);
});

/* Handle socket connections */
clientSocket.sockets.on("connection",function(socket){

    socket.on("message",function(mex){
      console.log("message: "+mex);
      if(typeof mex != "string")
        return;
      var type = mex.split(":")[0];
      console.log("type: "+JSON.stringify(mex.split(":")));
      switch(type){
        case "setName":
          console.log("set the name! "+mex.split(":")[1])
          socket._name = mex.split(":")[1]
          break;
        case "arduino-handshake-stop":
          console.log("Connected device. IP: " + socket.handshake.address.address);
          socket.removeAllListeners("message");
          gameServer.playerConnected(socket);
          break;
      }
    });

    socket.once("client-handshake-stop",function(){
      console.log("Connected client. IP: " + socket.handshake.address.address);
      gameServer.on("playerListUpdate",function(list){
        socket.emit("playerListUpdate",list);
      });

      gameServer.on("gameListUpdate",function(list){
        socket.emit("gameListUpdate",list);
      });
      gameServer.spectatorConnected(socket);
    })

    socket.emit("handshake-start");
});

/*deviceSocket.sockets.on("connection",function(socket){
  console.log("Connected device. IP: " + socket.handshake.address.address);
    gameServer.playerConnected(socket);
});
*/


console.log("Server running on port "+port);
