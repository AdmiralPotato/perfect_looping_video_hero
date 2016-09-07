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

	this.__aspect = this.resolution[1] / this.resolution[0];
	this.__targetWidth = 0;
	this.__targetHeight = 0;
	this.__setTargetResolution();

	this.__outputDiv = document.createElement('div');
	this.target.appendChild(this.__outputDiv);

	this.__go = false;
	this.__loadedCount = 0;
	this.__scaledCount = 0;
	this.__sourceImageList = [];
	this.__scaledImageList = [];
	this.__canvas = document.createElement('canvas');
	this.__canvasContext = this.__canvas.getContext('2d');
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
			var image = _this.__scaledImageList[frameIndex] = new Image();
			_this.__outputDiv.appendChild(image);
			_this.__loadedCount++;
			image.onload = _this.__scaleCallback();
			_this.__scale(frameIndex);
		};
	},
	__getImagePath: function(frameIndex){
		var str = (frameIndex + 1).toString();
		return this.path + '/' + ('0000'+str).substring(str.length) + '.jpg';
	},
	__scaleCallback: function(){
		var _this = this;
		return function(){
			_this.__scaledCount++;
			var loadedAndScaled = _this.__checkLoadedAndScaled();
			if(loadedAndScaled){
				_this.start();
			}
		};
	},
	__scale: function(frameIndex){
		var imageSource = this.__sourceImageList[frameIndex];
		var imageDestination = this.__scaledImageList[frameIndex];

		this.__canvas.width = this.__targetWidth;
		this.__canvas.height = this.__targetHeight;
		this.__canvasContext.drawImage(imageSource, 0, 0, this.__targetWidth, this.__targetHeight);
		this.__canvasContext.font = "16px monospace";
		this.__canvasContext.fillText(frameIndex, 24, 24);

		imageDestination.src = this.__canvas.toDataURL("image/png");
	},
	__checkLoadedAndScaled: function(){
		return (
			this.__loadedCount === this.frames &&
			this.__scaledCount === this.frames
		);
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
				this.__scaledImageList[this.__prevFrame].style = 'display: none;';
				this.__scaledImageList[currentFrame].style = 'display: block;';
				this.__prevFrame = currentFrame;
			}
			if(time > 30000){
				stop();
			}
		}
	},
	__recache: function(){
		var _this = this;
		this.__scaledCount = 0;
		this.__setTargetResolution();
		this.__sourceImageList.forEach(function(image, frameIndex){
			_this.__scale(frameIndex);
		});
	}
};
