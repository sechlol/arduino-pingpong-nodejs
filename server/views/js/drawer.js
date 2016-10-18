var Drawer = function($el){
	
	var canvas = document.getElementById("field");
	var can = $(canvas);
	var ctx=canvas.getContext("2d");

	var l;
	var margin;
	var length;
	var radius;
	var rate;

	this.init = function(m,l,r,rat){
		margin = m;
		length = l;
		radius = r;
		rate = rat;

		resizeCanvas();
		$(window).resize(resizeCanvas);
	}

	this.prepare = function(y1,y2,bx,by,countdown){
		draw(y1,y2,bx,by);
	}

	this.update = function(y1,y2,bx,by){
		draw(y1,y2,bx,by);
	}

	this.clear = function(){}

	this.print = function(data){
		console.log("PRINT: "+JSON.stringify(data))
		//$("#field").prepend("<span class='log'>"+JSON.stringify(data)+"</span></br>");
	}

	function draw(y1,y2,bx,by){
		
		ctx.beginPath();
		ctx.clearRect(0, 0, l, l); // clear the canvas
		ctx.fillStyle = "black";
		ctx.strokeStyle = "black";

		//first player bar
		drawBar(1,y1);
		drawBar(2,y2);
		drawBall(bx,by);

		ctx.closePath();
	}

	function drawBar(playerNumber,y){
		var w = margin*l/2;
		var h = length*l;
		var x = playerNumber == 1 ? w : l-(margin*l);
		//console.log("x "+x);
		y = (y*l)-(h/2);

		ctx.rect(x,y,w,h);
		ctx.fill();
	};

	function drawBall(x,y){
		var r = radius*l;
		y = y*l;
		x = x*l;
		ctx.arc(x,y,r,0,2*Math.PI);
		ctx.fill();
	};

	function resizeCanvas(){
		l = $(window).height()*0.9;
		can.attr("width",l);
		can.attr("height",l);
	}
}