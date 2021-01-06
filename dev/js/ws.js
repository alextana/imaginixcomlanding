var WS = function(address, interval /* send interval in ms */, ping){

	if (!interval) interval = 100; // sends every 100 ms
	if (!ping) ping = { 
		interval: 30, // ping every 30 seconds
		limit: 600, // disconnect after 5 minutes of inactivity
	}
	
	var self = this;
	var socket = null;	
	var err = function(msg){ self.emit('error', msg); }
	
	//
	self.connect = function(done){
			
		// connect
		if (socket) throw "A connection has already been assigned. Disconnect before attempting to reconnect.";					
		socket = new WebSocket(address);
		if (done) self.onConnect = done;
		
		socket.onerror = function(event) { err(event); };
		
		socket.onopen = function(event) { 
			pulse.start();
			self.emit('connect', event);
		};

		socket.onclose = function(event) {			
			socket = null;
			packetIndex = 0;
			outQueue = [];
			callbacks = {};
			pulse.stop();
			pulse.reset();
			self.emit('disconnect', event);
		};

		socket.onmessage = function(event) {
			if(!event.data) return err("Empty packet");
			var response = {}; try { response = JSON.parse(event.data); } catch(ex){ return err("Invalid packet"); }	
			$.each(response, function(k, v){
				if (v.i) { // callback					
					var cb = callbacks[v.i];
					if (cb) { 
						cb(v.err, v.r); 
						delete callbacks[v.i];
					} else {
						self.emit("receive", v);
					}
				} else {
					self.emit("receive", v);
				}
			});
		};
		
	}
	
	self.disconnect = function(){	
		if (!socket) throw "A connection has not been assigned. Connect before attempting to disconnect.";
		switch(socket.readyState){
			case 0: // connecting
			case 1: // open
				socket.close();
				break;
			case 2: // closing
			case 3: // closed
				throw "The connection has already been closed. Wait for socket clean up.";			
		}
	}
	
	var outQueue = [];
	var callbacks = {};
	var packetIndex = 0;
	
	self.flush = function() { pulse.tick(); }
	self.send = function(cmd, args, done){ 
		if (!socket) self.connect();
		var msg = { c:cmd, a:args };
		if (done) {
			msg.i = ++packetIndex
			callbacks[msg.i] = done;
		}
		outQueue.push(msg);
	}
	
	var _flush = function(){
		if (!outQueue || outQueue.length == 0) return false; // nothing to send
		if (!socket) return self.connect(_flush); // call _flush after connecting
		switch(socket.readyState){
			case 0: return err("Waiting for connection");
			case 1: break; // ok
			case 2: return err("Connection closing");
			case 3: return err("Connection closed");
			default: return err("Invalid connection");
		}
		// send
		var cmd = JSON.stringify(outQueue);
		outQueue = [];
		socket.send(cmd);
		return true;
	}
	
	var pulse = new Timer(interval);
	pulse.tickInterval = ping.interval * 1000 / interval; // number of ticks each ping	
	pulse.pingLimit = ping.limit / ping.interval; // number of pings to dc
	pulse.ping = function() { pulse.pingCount++; socket.send(""); }
	pulse.reset = function() { pulse.pingCount=0; pulse.tickCount=0; pulse.last = $u.now(); }
	pulse.reset();
	
	pulse.on('tick', function(){
		if (_flush()) return pulse.reset(); // if messages were sent, reset the timer
		if (++pulse.tickCount >= pulse.tickInterval){
			if (++pulse.pingCount >= pulse.pingLimit) self.disconnect(); // dc
			else socket.send(""); // send ping
			pulse.tickCount = 0;
		}
	});
	
	
}

$u.inheritEvents(WS);

