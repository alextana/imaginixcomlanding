var $u = {};

$u.random = function(min, max){
	return Math.floor((Math.random() * max) + min);
}

$u.qs = function(name){	
	name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
	var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
		results = regex.exec(location.search);
	return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

$u.round = function(val, decimals){
	if (!decimals) return Math.round(val);
	var x = Math.pow(10, decimals);
	return Math.round(val * x) / x;	
}

$u.iterateParent = function(currentElement, fn){
	var el = currentElement;
	while(el.parentNode)
		if (fn(el = el.parentNode)) return;	
}

$u.now = function() { 
	return (new Date()).getTime(); 
}


// **************************************************
//  check
// **************************************************

$u.isString = function(o){ return typeof (o) == "string"; }
$u.isNumeric = function(o){ return (typeof o == "number" && !isNaN(o)); }
$u.isArray = function(o){ return !$u.isString(o) && Array.isArray(o); }
$u.isDate = function(o){ return (o instanceof Date); }
//$u.isError = function(o){ return util.isError(o); }
$u.isObject = function(o){ return (typeof(o) === "object") && (o != null) && !$u.isArray(o) && !$u.isDate(o); }
$u.isFunction = function(o) { return (typeof(o) == 'function'); }

$u.isEmpty = function(o) {
	if (!o) return true;
	if ($u.isObject(o))
		if (Object.keys(o).length == 0) 
			return true;
	if ($u.isArray(o))
		if (o.length == 0) 
			return true;
	return false;
}

// error
$u.fail = function(msg, src){

	if ($u.isFunction(src))
		throw "!done: code update required."

	var desc = "$.fail";
	if (src) desc += " [" + src + "]";
	desc += ": " + msg;
	
	console.log(desc);
	
}

$u.done = function(done, err, reply){	
	if (err) {
		if (done) return done(err);
		$u.fail(err);
	} else {
		if (done) return done(null, reply);
	}	
}

// **************************************************
//  event handler
// **************************************************
var EventHandler = function(){
	var triggers = {};
	this.on = function(event, callback){
		if (!triggers[event]) triggers[event] = [];
			triggers[event].push(callback);
		}			
	this.emit = function(event, args){
		var callbacks = triggers[event];
		if (callbacks) for(var i in callbacks) setTimeout(function(){callbacks[i](args)}, 1);
	}
	this.getEvent = function (eventName) {
	    return triggers[eventName];
	}
}

$u.inheritEvents = function(cls){
	cls.prototype = new EventHandler();
}



// **************************************************
//  extend
// **************************************************

// adds the properties of the value to the target
//  - targetPath: adds the value on to the target's targetPath (i.e. target.targetPath = value)
$u.extend = function(target, value, targetPath, tagetPathSplit) {  

	if ($u.isString(targetPath))
		return $u.extend(target, $u.blank(targetPath, value, tagetPathSplit));		
		
	// copies the "value" into "target"			
	if (typeof target != typeof value)
		return value;
	
	if (!target)
		return value;
					
	if($u.isArray(target)){ // array
		var deleteList = [];
		$.each(value, function(k, v){
			if (v != null) // leave alone if null
			if (!(target[k] = $u.extend(target[k], v))) 
				deleteList.push(k);
		});
		if (deleteList) 
			$.each(deleteList, function(k, v){ 
				target.splice(v, 1); 
			});
		return target;
	} 
			
	if ($u.isObject(target)){ // object
		$.each(value, function(k, v){
			if (v != null) // leave alone if null
			if (!(target[k] = $u.extend(target[k], v))) 
				delete target[k];
		});
		return target;
	} 
			
	return value;
	
} 

// creates a blank object base on the path
//  - value: sets the value of the path 
$u.blank = function(path, value, split) {  
	var base = o = {};
	var parts = path.split(split || '.');
	$.each(parts, function(k, v){ o = o[v] = (parts.length == k+1) ? value : { }; });	
	return base;
} 







// **************************************************
//  array util
// **************************************************
$u.first = function (obj) {
	if ($u.isArray(obj)) return obj[0];	
	if ($u.isString(obj)) return obj.charAt(0);		
	if ($u.isObject(obj)) return obj[$u.first[Object.keys(obj)]];
	throw "Utility.first: invalid parameter [" + obj + "]";	
}

$u.last = function (obj) {
	if ($u.isArray(obj)) return obj[obj.length - 1];	
	if ($u.isString(obj)) return obj.charAt(obj.length-1);		
	if ($u.isObject(obj)) return obj[$u.last[Object.keys(obj)]];
	throw "Utility.last: invalid parameter [" + obj + "]";	
}

$u.remove = function(obj, key){		
	if ($u.isArray(obj)) {		
		if ($u.isNumeric(key))
			return key > -1 ? obj.splice(key, 1) : obj;		
		while(true) {
			var i = obj.indexOf(key);
			if (i < 0) break;
			obj.splice(i, 1);			
		}		
		return obj;
	}	
	if ($u.isObject(obj)) {
		delete obj[key];
		return obj;
	}	
	throw "Utility.remove: invalid parameter [" + obj + "]";	
}

$u.replace = function(obj, replaceWhat, replaceWith){
	
	//if (replaceWith.charAt[0] == "\\") 
	//	replaceWith = replaceWith.substr(1);
	
	if ($u.isString(obj)) 
		return obj.replace(new RegExp(replaceWhat, 'g'), replaceWith);
	
	if ($u.isArray(obj) || $u.isObject(obj)) {
		$.each(obj, function(k, v){ 
			if (v == replaceWhat) obj[k] = replaceWith;
		});
		return obj;	
	}
	
	throw "Utility.replace: invalid parameter [" + obj + "]";	
	
}

// **************************************************
//  ui util
// **************************************************
$u.scrollTo = function(scrollContainerId, targetObjectId, duration, offset) {
	$(scrollContainerId).animate(
		{ scrollTop: $(targetObjectId).offset().top + (offset||-10) },
		duration||500
	); 
}


