var address = location.origin;
var SM = new SocketMan();
var drawer;

$(document).ready(function(){
	drawer  = new Drawer();
	$.get(address+"/devices",{})
	.done(updateDevices)
	.fail(echoError);

	$.get(address+"/games",{})
	.done(updateGames)
	.fail(echoError);

	$("#device-list button").click(connectToDevice);
	$("#game-list button").click(connectToGame);

	SM.on("playerListUpdate",updateDevices);
	SM.on("gameListUpdate",updateGames);

});


function updateDevices(deviceList){
	updateList("device-list",deviceList);
}
function connectToDevice(){
	var dev = $("#device-list select option:selected")
	if(!dev[0]) 
		return;
	dev = dev[0].innerHTML;
	console.log("Connecting to "+dev);
	SM.createGame(dev,bindEvents);
}

function connectToGame(){
	var game = $("#game-list select option:selected")
	if(!game[0]) 
		return;
	game = game[0].innerHTML;
	console.log("Watching to "+game);
	SM.watchGame(game,bindEvents);
}

function bindEvents(){
	
		SM.onGame("init",function(d){
			showGame(d.p1Name,d.p2Name);
			drawer.init(d.margin,d.barLength,d.ballRadius,d.frameRate);
		});
		SM.onGame("prepare",function(d){
			drawer.prepare(d.y1,d.y2,d.bx,d.by)
		});
		SM.onGame("update",function(d){
			drawer.update(d.y1,d.y2,d.bx,d.by);
		});
		SM.onGame("score",function(d){
			if($("#p1 .player-name").html() == d.name)
				$("#p1 .score").html(d.score);
			else
				$("#p2 .score").html(d.score);
		});

		SM.onGame("winner",function(d){
			alert(d.name+" wins!!!");
		});

		SM.onGame("end",function(){
			SM.removeListeners();
			drawer.clear();
			hideGame();	
		});
		SM.onGame("error",drawer.print);
		SM.onGame("log",console.log);
	}


function updateGames(gameList){
	updateList("game-list",gameList);
}

function echoError(error){}

function updateList(listName,list){
	console.log("Update "+listName+": "+JSON.stringify(list));
	var ul = $("#"+listName+" select").empty();
	if(list.length == 0)
		$("#"+listName+" button").attr("disabled", "disabled");

	$.each(list,function(entry,value){
		ul.append("<option value='"+value+"'>"+value+"</option>");
	});
	$("#"+listName+" button").removeAttr("disabled");
}

function showGame(p1,p2){
	
	$("#rooms").hide();
	$("#game").show();
	$("#game button").html("Quit Game").one("click",function(){SM.close();hideGame()});
	$("#p1").html("<span class='player-name'>"+p1+"</span>: <span class='score'>0</span>");
	$("#p2").html("<span class='player-name'>"+p2+"</span>: <span class='score'>0</span>");

}

function hideGame(){
	
	$("#rooms").show();
	$("#game").hide();
}


// var socket = io.connect('http://localhost:8080');
//   socket.on('mex', function (data) {
//     console.log("Message "+data);
//   });
//   socket.on("newArduino",function(data){
//   	console.log("New Arduino! "+data);
//   });
