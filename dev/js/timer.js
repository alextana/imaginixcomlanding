var Timer = function(interval, callback){
	
	var triggers = {};
	this.on = function(event, callback){
		if (!triggers[event]) triggers[event] = [];
		triggers[event].push(callback);
	}
	
	function trigger(event, params){
		var callbacks = triggers[event];
		if (callbacks) for(var i in callbacks) setTimeout(function(){callbacks[i](params)}, 1);
	}
		
	// **********************************************************
	var self = this;
	var timeoutId = null;
	self.isActive = false;	
	
	// load default values
	self.interval = interval || 1000;
	if (callback) self.on('tick', callback);	
	
	self.start = function(){
		trigger('start');
		isActive = true;
		timeoutId = setTimeout(self.tick, self.interval);
	}

	self.stop = function(){
		trigger('stop');
		clearTimeout(timeoutId);
		isActive = false;
	}

	self.tick = function(){
		trigger('tick'); 
		timeoutId = setTimeout(self.tick, self.interval);
	}

}








