var Ball = function(margin,radius,barlength,framerate){

	var x,y;
	var vx,vy; // the speed in two directions
	var eps = 0.00001;
	this.setStartState =  function()
	{	
		/* set the initial position, the speed and the direction */
		x = 0.5;
		y = 0.5;
		vx = Math.random() * 2.0 / 15.0 + 0.2;
		if (Math.random() > 0.5) vx = -vx;
		vy = Math.random() / 2.0;
		if (Math.random() > 0.5) vy = -vy;
	}

	this.getX = function(){
		return x;
	};

	this.getY = function(){
		return y;
	};

	/* tells if the ball exceeded the point line (-1 --> left side, 1 --> right side) */
	this.isOutOfBounds = function(){
		/* the ball passed the player1 limit (left bound)*/
		if(x-radius <= 0) //if(x-radius <= margin)  
			return -1;

		/* the ball passed the player2 limit (right bound)*/
		if(x+radius >= 1) //if(x+radius >= 1-margin)
			return 1;

		return 0;
	}

	this.moveBall = function(y1,y2,s1,s2){ //position of the bars. We assume x1=margin and x2=1-margin
		if (y+radius >= 1 || y-radius <= 0) vy = -vy;
		if (x - radius - eps <=  margin)		
		{
			if (y <= y1 + barlength/2 && y >= y1 - barlength/2)
				if (vx<0)
				{
					//calculate the new speed of the ball 
					vx = -vx; 
					vx = vx * 1.03;
					vy = vy + s1;
				}
		}
		if (x + radius + eps >= 1-margin)
		{
			if (y <= y2 + barlength/2 && y >= y2 - barlength/2)
				if (vx>0) 
				{
					//calculate the new speed of the ball
					vx = -vx;
					vx = vx * 1.03;
					vy = vy + s2;

				}
		}

		//calculate new postion of the ball
		x = vx * framerate/1000 + x; 
		y = vy * framerate/1000 + y;
		if (x - radius - eps <=  margin)		
		{
			if (y <= y1 + barlength/2 && y >= y1 - barlength/2)
					x = margin + radius;
		}
		if (x + radius + eps >= 1-margin)
		{
			if (y <= y2 + barlength/2 && y >= y2 - barlength/2)		
					x = 1 - margin - radius;
		}

	}

};

module.exports = Ball;