module.exports = function(sequelize, DataTypes) {
	
var chatConnections = sequelize.define('chat_connections', {
	
	id: { 
		type: DataTypes.INTEGER,
		autoIncrement: true,
       	primaryKey: true
	},
	profile_from: DataTypes.STRING,
	profile_to 	: DataTypes.STRING,
	active: {
		type: DataTypes.BOOLEAN,
		defaultValue: 1
	}
},
{
	underscore     : true,
	timestamps     : false,
	freezeTableName: true,
	classMethods: {
		
		closeConnection: function(profile_from, profile_to, callback) {
			
			this.find({ where: { profile_from: profile_from, profile_to: profile_to, active: 1 }, attributes: ['active'] })
				.on('success', function(row) { if (row) { row.updateAttributes({ active: 0 }) } })
				.success(function() { callback(true) })
		},
		
		closeAll: function(profile_from, callback) {
		
			this.find({ where: { profile_from: profile_from } })
				.on('success', function(result) { 
				
					if (result) { 
						
						for(var i=0; i<result.lenght; i++) {
							var row = arr[i];
							row.updateAttributes({ active: 0 }) 
						}
						
					} 
				})
				.success(function() { callback(true) })
		},
	}
});

return chatConnections;
}