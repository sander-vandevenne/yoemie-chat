module.exports = function(sequelize, DataTypes) {
	
var status = sequelize.define('Status', {
	node_id		: DataTypes.STRING,
	profile_id 	: DataTypes.STRING,
	status    	: DataTypes.INTEGER,
},
{
	underscore     : true,
	timestamps     : false,
	freezeTableName: true,
	classMethods: {
		
		getClientId: function(profile_id, callback) {
			
			this.find({ where: { profile_id: profile_id, status: 1  }, order: 'datetime DESC', limit: 1 }).on('success', function(profile) {
				if(profile!== null) {
			 		callback(true, profile['node_id'], profile['status']);
				}else{
					callback(false, false, 0);
				}
	 		})
		}
   	}
});

return status;
}