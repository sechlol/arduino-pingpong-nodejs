var events = require("events");
var sys = require("sys");


var PlayerController = require("./playercontroller");
var ClientController = require("./clientcontroller");
var GameEngine = require("./gameengine");
var HumanPlayer = require("./humanplayer");
var AIPlayer = require("./aiplayer");


var GameServer = function(){
	events.EventEmitter.call(this);

	/* playerName --> HumanPlayer */
	var freePlayers = {};

	/* gameNumber --> GameEngine */
	var runningGames = {};

	/* playerName --> gameNumber */
	var inGamePlayers = {}

	var gameCounter = 1;
	var that = this;



	this.spectatorConnected = function(socket){
		var client = new ClientController(socket);
		var cliName = client.getName();
		var gameNumber = null;

		/* triggers the creation of a new game */
		socket.on("newGame",function(playerName){
			if(!freePlayers[playerName])
				socket.emit("error","Player "+playerName+" not available.");
			else if(gameNumber && runningGames[gameNumber])
				socket.emit("error","You cannot spectate more than one game per time.");
			else
				gameNumber = createGame(playerName,client).getNumber();
		});

		/* the spectator is added to the game spectators list */
		socket.on("spectateGame",function(number){
			var game = runningGames[number];
			if(!game)
				socket.emit("error","The game "+number+" doesn't exist.");
			else if(gameNumber && runningGames[gameNumber])
				socket.emit("error","You cannot spectate more than one game per time.");
			else{
				game.addSpectator(client);
				gameNumber = game.getNumber();
			}
		});

		/* the spectator is removed from the game spectator list 
		 * if there aren't any spectators in the (eventual) running game, stop it*/
		function onSpectatorDisconnect(){
			
			if(gameNumber && runningGames[gameNumber]){
				console.log("Spectator"+cliName+" disconnects from game "+gameNumber);
				var game = runningGames[gameNumber];
				var spectLeft = game.removeSpectator(cliName);
				if(spectLeft == 0)
					disbandGame(gameNumber);
				gameNumber = null;
			}
		}

		socket.on("disconnect",onSpectatorDisconnect);
		socket.on("leave",onSpectatorDisconnect);
	};

	this.playerConnected = function(socket){
		var controller = new PlayerController(socket);
		var player = new HumanPlayer(controller);
		var playerName = player.getName();

		setPlayerAvailable(player);

		/* When a player disconnects, the game is disbanded */
		socket.on("disconnect",function(){
			setPlayerUnavailable(playerName);
		
			var gameNumber = inGamePlayers[playerName];

			if(gameNumber){
				console.log("Player "+playerName+" disconnects from "+gameNumber);
				delete inGamePlayers[playerName];
				disbandGame(gameNumber);
			}
			else
				console.log("Player "+playerName+" disconnects");

		});
	};

	this.getGameList = function(){
		return Object.keys(runningGames);
	};
	this.getPlayerList = function(){
		return Object.keys(freePlayers);
	};

	function setPlayerAvailable(player){
		var name = player.getName();
		freePlayers[name] = player;
		that.emit("playerListUpdate",that.getPlayerList());
	}

	function setPlayerUnavailable(playerName){
		if(!freePlayers[playerName])
			return;
		delete freePlayers[playerName];
		that.emit("playerListUpdate",that.getPlayerList());
	};

	function setGameRunning(game){
		runningGames[game.getNumber()] = game;
		that.emit("gameListUpdate",that.getGameList());
	}

	function setGameEnded(gameNumber){
		var game = runningGames[gameNumber];
		game.removeAllListeners();
		delete runningGames[gameNumber];
		that.emit("gameListUpdate",that.getGameList());
	};

	function createGame(playerName,client){

		var ai = new AIPlayer();
		//var ai2 = new AIPlayer();
		var humanPlayer = freePlayers[playerName];
		var gameNumber = gameCounter++;

		var newGame = new GameEngine(humanPlayer,ai,gameNumber); 
		// var newGame = new GameEngine(humanPlayer,humanPlayer,gameNumber); //test Human
		// var newGame = new GameEngine(ai2,ai,gameNumber); //test AI

		newGame.addSpectator(client);
		setPlayerUnavailable(playerName);

		setGameRunning(newGame);
		inGamePlayers[playerName] = gameNumber;

		newGame.once("end",function(){disbandGame(gameNumber);});
		newGame.start();

		return newGame;

	};

	function disbandGame(gameNumber){
		console.log("Disband game "+gameNumber);
		var game = runningGames[gameNumber];
		if(!game)
			return;

		game.stop();

		/* set the connected players available */
		var players = game.getPlayers();
		for(var i=0;i<players.length;i++){
			var pName = players[i].getName();
			if(inGamePlayers[pName] !== undefined){
				setPlayerAvailable(players[i]);
				delete inGamePlayers[pName];
			}
		}

		/* removes spectators from the list */
		// var gameSpectators = game.getSpectators();		
		// for(var i=0;i<gameSpectators.length;i++)
		// 	delete spectators[gameSpectators[i].getName()];

		setGameEnded(gameNumber);
		delete game;
	};

	function log(message){
		that.emit("log",message);
	}

	
};

//inherit from EventEmitter to trigger custom events
sys.inherits(GameServer, events.EventEmitter);
module.exports = GameServer;
