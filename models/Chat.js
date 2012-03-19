module.exports = function(sequelize, DataTypes) {
	
var chat = sequelize.define('Chat', {
	profile_from: DataTypes.STRING,
	profile_to 	: DataTypes.STRING,
	message    	: DataTypes.STRING,
	time		: DataTypes.DATE,
	view 		: { type: DataTypes.INTEGER, defaultValue: 0 },
	site 		: { type: DataTypes.INTEGER, defaultValue: 0 }
},
{
	underscore     : true,
	timestamps     : false,
	freezeTableName: true,
	classMethods: {
		getActualId: function(callback){
			 this.find({where: {view: 1}}).on('success', function(placeTmp){
			 callback(placeTmp['id']);
	 })
   }
}
});

return chat;
}