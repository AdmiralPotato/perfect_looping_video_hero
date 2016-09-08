var PerfectLoopingVideoHero = function(args){
	var _this = this;

	if(!args){throw new Error('missing arguments object');}
	if(!args.path){throw new Error('missing path argument');}
	if(!args.frames){throw new Error('missing frames argument');}
	if(!args.fps){throw new Error('missing fps argument');}
	if(!args.resolution){throw new Error('missing resolution argument');}
	if(!args.target){throw new Error('missing target argument');}

	this.path = args.path;
	this.frames = args.frames;
	this.fps = args.fps;
	this.resolution = args.resolution;
	this.target = args.target;
	this.startFrame = args.startFrame !== undefined ? args.startFrame : 1;
	this.autoplay = args.autoplay !== undefined ? args.autoplay : true;

	this.__outputDiv = document.createElement('div');
	this.__outputDiv.style.backgroundColor = '#000';
	this.target.appendChild(this.__outputDiv);
	this.__canvas = document.createElement('canvas');
	this.__canvasContext = this.__canvas.getContext('2d');
	_this.__outputDiv.appendChild(this.__canvas);


	this.__aspect = this.resolution[1] / this.resolution[0];
	this.__targetWidth = 0;
	this.__targetHeight = 0;
	this.__setTargetResolution();

	this.__go = false;
	this.__loadedCount = 0;
	this.__sourceImageList = [];
	this.__scaledCanvasList = [];
	this.__prevFrame = 0;

	this.__animate = function(time){
		_this.__frame(time);
	};

	this.__preload();

};


PerfectLoopingVideoHero.prototype = {
	start: function(){
		this.__go = true;
		requestAnimationFrame(this.__animate);
	},
	stop: function(){
		this.__go = false;
	},
	__setTargetResolution: function(){
		this.__targetWidth = this.target.clientWidth;
		this.__targetHeight = this.__targetWidth * this.__aspect;
		this.__canvas.width = this.__targetWidth;
		this.__canvas.height = this.__targetHeight;
		this.__outputDiv.style.height = Math.floor(this.__targetHeight) + 'px';
	},
	__preload: function(){
		var frameIndex;
		var image;
		for(frameIndex = 0; frameIndex < this.frames; frameIndex++){
			image = new Image();
			image.onload = this.__makeLoadCallback(frameIndex);
			image.src = this.__getImagePath(frameIndex);
			this.__sourceImageList.push(image);
		}
	},
	__makeLoadCallback: function(frameIndex){
		var _this = this;
		return function(){
			var canvas = _this.__scaledCanvasList[frameIndex] = document.createElement('canvas');
			_this.__scale(frameIndex);

			_this.__loadedCount++;
			var loaded = _this.__checkLoaded();
			if(loaded){
				_this.start();
			}
		};
	},
	__getImagePath: function(frameIndex){
		var str = (frameIndex + 1).toString();
		return this.path + '/' + ('0000'+str).substring(str.length) + '.jpg';
	},
	__scale: function(frameIndex){
		var imageSource = this.__sourceImageList[frameIndex];
		var canvas = this.__scaledCanvasList[frameIndex];
		var canvasContext = canvas.getContext('2d');

		canvas.width = this.__targetWidth;
		canvas.height = this.__targetHeight;
		canvasContext.drawImage(imageSource, 0, 0, this.__targetWidth, this.__targetHeight);
		canvasContext.font = "16px monospace";
		canvasContext.fillText(frameIndex, 24, 24);
	},
	__checkLoaded: function(){
		return this.__loadedCount === this.frames;
	},
	__frame: render = function(time){
		if(this.__targetWidth !== this.target.clientWidth){
			stop();
			this.__recache();
		}
		if(this.__go){
			requestAnimationFrame(this.__animate);
			var currentFrame = Math.floor(time / 1000 / (this.frames / this.fps) * this.frames) % this.frames;
			if(currentFrame !== this.__prevFrame){
				this.__canvasContext.drawImage(this.__scaledCanvasList[currentFrame], 0, 0);
				this.__prevFrame = currentFrame;
			}
		}
	},
	__recache: function(){
		var _this = this;
		this.__setTargetResolution();
		this.__sourceImageList.forEach(function(image, frameIndex){
			_this.__scale(frameIndex);
		});
	}
};
