var AIPlayer = function(){

	var y = 0.5;
	var barLength;
	var margin;
	var speed = 0.3;
	var currentGame = null;

	this.lookAt= function(game){//Type of Game = gameengine
		currentGame = game;	
		barLength = game.getBarLength();
		margin = game.getMargin();
	}

	this.getName = function(){
		return "LolBot :D";
	}

	this.setStartState = function(){
		y = 0.5;
	};
	
	this.getY = function(){
		return y;
	};

	this.update = function(){
		y = calculateNewY();
	};
	this.getSpeed = function() {
		return speed;
	}

	/* This function computes a new value for y based on the previous position and the game parameters.
	 * It can access to game parameters through the variable "currentGame".
	 * At thet end it should return the new value.
	 */
	function calculateNewY(){
		//Obsever
		// game.y1 game.y2
		//Make deistion
		//Calculate the new Y
		//return Y
		//currentGame.getBallY();
		var tmp = currentGame.getFrameRate() / 1000;
		var ret = currentGame.getBallPosition();


		if (y>ret["y"])
			if (speed > 0) speed = -speed;
		
		if (y<ret["y"])
			if (speed < 0) speed = -speed;


		 y = y + speed * tmp;

		if (y > 1 - barLength/2) y = 1-barLength/2;
		if (y < barLength/2) y  = barLength/2;
		
		/*if(goUp)
			y += (1/60);
		else
			y -= (1/60);

		if(y <= 0)
			goUp = true;
		else if(y >= 1 )
			goUp = false;
		*/
		return y;
	};



};

module.exports = AIPlayer;
