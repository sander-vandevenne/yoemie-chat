module.exports = function(sequelize, DataTypes) {
	
var profile = sequelize.define('Profile', {
	profile_id 	: DataTypes.STRING,
	nickname 	: DataTypes.STRING,
	image 		: DataTypes.STRING,
},
{
	underscore     : true,
	timestamps     : false,
	freezeTableName: true,
	classMethods: {
		
		getProfile: function(profile_id, callback) {
			
			this.find({ where: { profile_id: profile_id }, limit: 1 }).on('success', function(profile) {
			 	callback(profile['nickname'], profile['image'], profile['gender']);
	 		})
		}
   	}
});

return profile;
}