var HumanPlayer = function(playerController){

	var controller = playerController;
	var position = 0.5;
	var y = 0.5;
	
	this.startCapture = function(){
//		controller.on("move",onMove);
		controller.startStream();
	}

	this.stopCapture = function(){
//		controller.removeListener("move",onMove);
		controller.stopStream();
	}

	this.getSpeed = function() {
		// return speed;
		return 0;
	}
	
	this.getY = function(){
		return y;
	};

	this.setStartState = function(){
		y = 0.5;
	};

	this.update = function(){
		y = controller.getLastPacket();
	}

	this.getName = function(){
		return controller.getName();
	}

	function onMove(pos){
		position = pos;
	}

};

module.exports = HumanPlayer;