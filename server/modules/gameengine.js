var events = require("events");
var HumanPlayer = require("./humanplayer");
var AIPlayer = require("./aiplayer");
var Ball = require("./ball")

//constants
var FRAME_RATE 		= (1/30) * 1000;
var SCORE_MARGIN 	= 1/20;
var BAR_LENGTH 		= 1/5;
var BALL_RADIUS 	= 1/50;
var POINT_TO_WIN	= 5;

var PREPARE_TIMEOUT = 300;
var SCORE_TIMEOUT = 400;


var GameEngine = function(player1,player2,number){

	var p1 = player1;
	var p2 = player2;
	var p1Score = 0;
	var p2Score = 0;

	var ball = new Ball(SCORE_MARGIN,BALL_RADIUS,BAR_LENGTH,FRAME_RATE);
	var spectators = {};
	var frameTimer = null;
	var that = this;

	this.addSpectator = function(spectator){

		spectator.init({
			"p1Name":p1.getName(),
			"p2Name":p2.getName(),
			"margin":SCORE_MARGIN,
			"barLength":BAR_LENGTH,
			"ballRadius":BALL_RADIUS,
			"frameRate":FRAME_RATE,
		});

		var name = spectator.getName();
		spectators[name] = spectator;
	};

	this.removeSpectator = function(name){
		if(spectators[name])
			delete spectators[name];
		return Object.keys(spectators).length;
	};

	this.start = function(){
		if(p1 instanceof HumanPlayer)
			prepareHumanPlayer(p1);
		else
			prepareAiPlayer(p1);

		if(p2 instanceof HumanPlayer)
			prepareHumanPlayer(p2);
		else
			prepareAiPlayer(p2);

		broadcast("init",{
			"p1Name":p1.getName(),
			"p2Name":p2.getName(),
			"margin":SCORE_MARGIN,
			"barLength":BAR_LENGTH,
			"ballRadius":BALL_RADIUS,
			"frameRate":FRAME_RATE,
		});

		playMatch();

		/* when a player make a point stop the running match, update the score and begin another match */
		this.on("score",function(playerNumber){
			
			var winnerName, winnerScore;
			if(playerNumber == 1){
				winnerScore = ++p1Score;
				winnerName = p1.getName();
			}
			else{
				winnerScore = ++p2Score;
				winnerName = p2.getName();	
			}

			/* if there's a winner, don't start another match. Else start a new one after 4 seconds */
			if(winnerScore == POINT_TO_WIN){
				broadcast("winner",{"name":winnerName,"score":winnerScore})
				setTimeout(function(){that.emit("end")},3000);
			}
			else{
				broadcast("score",{"name":winnerName,"score":winnerScore,"timeout":SCORE_TIMEOUT});
				setTimeout(playMatch,SCORE_TIMEOUT);
			}
		});
	};

	this.stop = function(){
		if(frameTimer)
			clearInterval(frameTimer);
		
		if(p1 instanceof HumanPlayer) p1.stopCapture();
		if(p2 instanceof HumanPlayer) p2.stopCapture();

		broadcast("disband");
		console.log("GameEngine "+number+"stopped");
	};

	this.getNumber = function(){
		return number;
	}

	function playMatch(){
		p1.setStartState();
		p2.setStartState();
		ball.setStartState();

		var status = formatGameStatus();
		status.timeout = PREPARE_TIMEOUT;
		broadcast("prepare",status);

		/* start the match after 3 seconds */
		setTimeout(function(){

			/* update the frame every FRAME_RATE milliseconds */
			frameTimer = setInterval(function(){

				/* move the ball */
				ball.moveBall(p1.getY(),p2.getY(),p1.getSpeed(),p2.getSpeed());

				/* checks if the ball is over the player line*/
				var outBound = ball.isOutOfBounds();

				/* one player made a score. Stop the match and alert the GameEngine */
				if(outBound != 0){
					clearInterval(frameTimer);
					var matchWinnerNumber = outBound == 1 ? 1 : 2;
					that.emit("score",matchWinnerNumber);
				}

				/* updates the position of the players and sends the state to the clients connected */
				else{
					p1.update();
					p2.update();
					var state = formatGameStatus();
					broadcast("update",state);
				}
			},FRAME_RATE);	

		},PREPARE_TIMEOUT);
	};


	/**** Utility and getter functions ****/

	function formatGameStatus(){
		var state = {
			"y1":p1.getY(),
			"y2":p2.getY(),
			"bx":ball.getX(),
			"by":ball.getY(),
		};
		return state;
	}

	function broadcast(functionName,message){
		for(var i in spectators)
			spectators[i][functionName](message);
	}

	this.getBallPosition=function(){
		return {"x":ball.getX(),"y":ball.getY()};
	};

	this.getBarLength = function(){
		return BAR_LENGTH;
	};

	this.getMargin = function(){
		return SCORE_MARGIN;
	};
	this.getFrameRate = function(){
		return FRAME_RATE;
	};
	this.getPlayers = function(){
		var arr = [];
		if(p1 instanceof HumanPlayer)
			arr.push(p1);
		if(p2 instanceof HumanPlayer)
			arr.push(p2);

		return arr;
	};

	this.getSpectators = function(){
		return spectators;
	};

	function prepareHumanPlayer(player){
		player.startCapture();
	}
	function prepareAiPlayer(player){
		player.lookAt(that);
	}

};

//inherit from EventEmitter to trigger custom events
GameEngine.prototype.__proto__ = events.EventEmitter.prototype;
module.exports = GameEngine;
