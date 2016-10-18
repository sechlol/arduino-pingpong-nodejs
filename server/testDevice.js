var io = require('socket.io').listen(3000,{log:false});

io.sockets.on('connection', function (socket) {
  console.log("Connected");
  socket.on("message",function(data){
  	data.replace(/(\r\n|\n|\r)/gm,"");

  	console.log("Arduino: "+data);
  	var mex = "Echo '"+data+"'";
  	socket.emit(mex);
  	console.log("Server: "+mex)
  });
});

io.sockets.on("disconnect",function(){
	console.log("DISCONNECTED");
})