
/**
 * Module dependencies.
 */

var forms = require('forms')
  ,	express = require('express')
  , routes = require('./routes')
  , nowjs = require('now')


var app = module.exports = express.createServer();

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser());
  app.use(express.session({ secret: 'jqlksfhmqsdqsiylqgslqsjqsdfqdslfh' }));
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});



var Sequelize = require('sequelize');
var sequelize = new Sequelize("yoemie_db", "yoemie_account", "1MJo2mtk", {
  																	host: "159.253.0.5",
																  	port: 3306
																});
var Chat      = sequelize.import(__dirname + '/models/Chat');
var ChatConnections = sequelize.import(__dirname + '/models/ChatConnections');
var Status    = sequelize.import(__dirname + '/models/Status');
var Profile   = sequelize.import(__dirname + '/models/Profile');


var everyone = nowjs.initialize(app);

var users = new Object();
var alerts = new Object();


var fields = forms.fields,
    validators = forms.validators,
    widgets = forms.widgets;

var reg_form = forms.create({
	
    message_input: fields.string({
		label: false,
		required: true,
        widget: widgets.textarea({rows: 6})
    })
});


app.get('/m/:profile_from/:profile_to',  function(req, res){
	
	console.log("chat open"); 	
	console.log(req.session.session_id); 	
	
	// the get data
	var profile_from = req.params.profile_from,
		profile_to 	 = req.params.profile_to;
		
	// check if user exists
	if(typeof users[profile_from] === "undefined") {
		
		// create an object with the date: key is profile_id and values are name, image, client_id and connections:array()
		users[profile_from] = new user();
		
		Profile.getProfile(profile_from, function(name, image) {
			
			users[profile_from].name = name;
			users[profile_from].image = image;
		});	
	}
	
	
	// check if user exists, get data from users object else get data from db
	if(typeof users[profile_to] === "undefined") {
		
		Profile.getProfile(profile_to, function(name, image, gender) {
			
			users[profile_from].addConnection(profile_to, name, image, gender);
			
			res.render('index', {
		
				locals: {
					profile_from: 	profile_from,
					profile_id: 	profile_to,
					name: 			"test",
					connections: 	users[profile_from].connections,
					clientId:		"hkhkjkjhk",
					form: 			reg_form.toHTML()
				}
			})
		});
		
		ChatConnections.build({ 
			profile_from: profile_from,
			profile_to 	: profile_to,
		})
		.save().success(function() {
			console.log("ok, in database");
	});
		
	}else{
		users[profile_from].addConnection(profile_to, users[profile_to].name, users[profile_to].image, users[profile_to].gender);	
		
		res.render('index', {
		
			locals: {
				profile_from: 	profile_from,
				profile_id: 	profile_to,
				name: 			"test",
				connections: 	users[profile_from].connections,
				clientId:		"hkhkjkjhk",
				form: 			reg_form.toHTML()
			}
		});
	}	
});


app.get('', function(req, res){
	
	console.log("start pagina");
	
	res.render('start');
});




app.get('/user/:profile_id/:jsonp', function(req, res){
	
	var profile_id = req.params.profile_id;
	
	console.log("users wants data: "+profile_id);
	
	setTimeout(function() { 
		
		if(typeof alerts !== "undefined") {
			
			if(typeof alerts[profile_id] !== "undefined") {
				
				console.log("user exists");
				
				if(alerts[profile_id].hasAlerts) {
					
					res.contentType('application/json');	
					
					var sendAlerts = JSON.stringify(alerts[profile_id].alerts);
					console.log("sends data to "+profile_id+": "+sendAlerts);
					res.send(req.params.jsonp+"("+sendAlerts+")");
					
					alerts[profile_id].clearAlerts();
				}
			}else{
				console.log("user alerts doesn't exists");	
			}
		}else{
			console.log("alerts doesn't exists");	
		}
	
	}, 3 * 1000);
});




everyone.now.setUser = function(profile_id) {
	
    users[profile_id].clientId = this.user.clientId;
	this.now.profile_id = profile_id;
}


everyone.now.closeChat = function(profile_to, closeChat) {
	
	var profile_from = this.now.profile_id;
	
	ChatConnections.closeConnection(profile_from, profile_to, function(result) {
		
		console.log(result);
		
		delete users[profile_from].connections[profile_to];
	
		closeChat();
	})
}


everyone.now.sendMessage = function(profile_to, message, addLine) {
	
	profile_from = this.now.profile_id;
	
	Chat.build({ 
			profile_from: profile_from,
			profile_to 	: profile_to,
			message 	: message,
		})
		.save().success(function(message) {
			addLine(message.profile_to, message.message);
	});
	
	if(typeof users[profile_to] !== "undefined") {
		
		nowjs.getClient(users[profile_to].clientId, function () { 
		
			if(typeof users[profile_to].connections[profile_from] === "undefined") {
				
				this.now.addChat(profile_from, users[profile_from].name);
				
				users[profile_to].addConnection(profile_from, users[profile_from].name, users[profile_from].image);	
				
				// voeg message toe: nieuwe chat, zowel bij to als from
				userAlert(profile_to, "new-chat", { "name": users[profile_from].name, "image": users[profile_from].image });
				userAlert(profile_from, "new-chat", { "name": users[profile_to].name, "image": users[profile_to].image })
				
			}
			this.now.addLine(profile_from, message, "you"); 
		});
	}else{
		userAlert(profile_to, "new-chat", { "name": users[profile_from].name, "image": users[profile_from].image });	
	}
}


function debug(profile_id, action) {

	console.log(profile_id+": "+action);
}

function userAlert(profile_id, type, params) {

	if(typeof alerts[profile_id] === "undefined") {
		console.log("alerts "+profile_id +" aangemaakt")
		alerts[profile_id] = new createUserAlerts();		
	}
	
	alerts[profile_id].addAlert(type, params);
}


function user() {
	
	this.name = "";
	this.image = "";
	this.gender = "";
	this.clientId = "";
	this.status = "online";
	this.connections = new Object();	
	
	this.addConnection = function(profile_id, name, image, gender) {
		
		this.connections[profile_id] = new Object();
		this.connections[profile_id].name = name;
		this.connections[profile_id].image = image;
		this.connections[profile_id].gender = gender;
	}
}


function createUserAlerts() {

	this.hasAlerts = false;
	
	this.alerts = new Object();
	
	this.addAlert = function(type, params) {
		
		if(typeof this.alerts[type] === "undefined") {
			
			this.alerts[type] = new Array(params);
		}else{
			this.alerts[type].push(params);
		}	
		
		this.hasAlerts = true;
	}	
	
	this.clearAlerts = function() {
		this.hasAlerts = false;
		this.alerts = new Object();	
	}
}



nowjs.on("disconnect", function () { 
	/*
 	var profile_from = this.now.profile_id;

	ChatConnections.closeAll(profile_from, function(result) {
		
		console.log(result);
		
		//delete users[profile_from];
	})	
	*/
});


app.listen(15924);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);