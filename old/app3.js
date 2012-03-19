
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
  app.use(express.session({ secret: 'hierKomtDeSessionSetVariable' }));
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
var sequelize = new Sequelize("yoemie", "yoemie", "3YmVHFTdaMLMtdJN");
var Chat      = sequelize.import(__dirname + '/models/Chat');
var Status    = sequelize.import(__dirname + '/models/Status');
var Profile   = sequelize.import(__dirname + '/models/Profile');


var everyone = nowjs.initialize(app);


var fields = forms.fields,
    validators = forms.validators,
    widgets = forms.widgets;

var reg_form = forms.create({
	//profile_from: fields.string(),
	//profile_to: fields.string(),
    message_input: fields.string({
		label: "",
		required: true,
        widget: widgets.textarea({rows: 6})
    })
});


// Routes
/*
app.get('/',  function(req, res){
  res.render('index', {
        locals: {
            title: 'Filling out the form...',
            form: reg_form.toHTML()
        }
  })
});
*/

app.get('/m/:profile_from/:profile_to',  function(req, res){
	
	var profile_from = req.params.profile_from,
		profile_to 	 = req.params.profile_to;
	
	Profile.getProfile(profile_to, function(nickname, image) {
	
		Status.getClientId(profile_to, function(success, clientId, status){ 
	
			res.render('index', {
				
				locals: {
					image:		image,	
					profile_id: profile_to,
					nickname: 	nickname,
					status: 	status,
					clientId:	clientId,
					form: 		reg_form.toHTML()
				}
		  	})	
		});	
	});	
});



app.post('/', function(req, res) {
    reg_form.handle(req, {
        success: function(form) {
            res.render('index', {
                locals: {
                    title: 'Success!'
                }
            });
        },
        other: function(form) {
            res.render('index', {
                locals: {
                    title: 'Failed!', 
                    form: form.toHTML()
                }
            });
        }
    });
});


nowjs.on("connect", function () { 

 	var clientId = this.user.clientId;
	
	Status.build({ 
			node_id		: clientId,
			profile_id 	: profileId,
			status		: 1
		})
		  .save();
});


nowjs.on("disconnect", function () { 
  	
});


everyone.now.sendMessage = function(profile_from, profile_to, status, client_id, message, addLine) {
	console.log('---------------------------------')
	console.log(this.user.clientId);
	console.log(message);
	console.log(client_id);
	console.log('---------------------------------')
	
	Chat.build({ 
			profile_from: profile_from,
			profile_to 	: profile_to,
			message 	: message,
		})
		.save().success(function(message) {
			addLine(message.message);
	});
	
	if(status) {
		nowjs.getClient(client_id, function () { 
			this.now.addLine(message); 
		});
	}
}



everyone.now.newConversation = function(profile_to, addUser) {
	
	Profile.getProfile(profile_to, function(nickname, image) {
		
		Status.getClientId(profile_to, 	function(clientId, status){ 
		
			addUser(nickname, image, clientId, status);
		});	
	});
}




app.listen(3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);