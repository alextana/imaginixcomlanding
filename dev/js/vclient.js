var vClient = function(addr){
	
	var i = this;
	var ws = null;
	
	var handleReceive = function(msg){
		
		if (msg.err)
			return handleError(msg);
		
		if (!msg.c)
			return handleError({err:"non-command: msg", msg:msg});
		
		switch(msg.c){
			case "=": $u.extend(i.profile, msg.a); i.emit('profile-update', msg.a); break; // sync profile
			case "#": $u.extend(i.instance, msg.a); i.emit('instance-update', msg.a); break; // sync instance
			case "signout": i.reset(); break;
		    default:
		        if (i.getEvent(msg.c))
		            i.emit(msg.c, msg.a);
                else
		            handleError({ err: 'unknown server message', msg: msg });
		        break;
		}		
	}
	
	var handleError = function(args){
		alert("error: " + JSON.stringify(args));
	}
	
	i.init = function(addr){
		if (ws) ws.disconnect();
		i.reset(1);
		ws = new WS(addr);
		ws.on("receive", handleReceive);
		ws.on("disconnect", function(){ i.reset(); });
	}
	
	i.reset = function(doNotEmit){
		this.profile = {};
		this.instance = {};
		this.ui = {};
		if (!doNotEmit) i.emit("reset");
	}
	
	i.x = i.exec = function(command, param, done){ 
		if (!ws) return handleError("not initialized");
		if ($u.isString(done))
			return ws.send(command, param, function(err, reply){ eval(done); });
		else
			return ws.send(command, param, done);
	}

	// shortcuts
	i.id = function() { return i.profile && i.profile.id; }
	
}

$u.inheritEvents(vClient);


