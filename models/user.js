//models here
var bcrypt = require('bcrypt');
var _ = require('underscore');
var cryptojs = require('crypto-js');
var jwt = require('jsonwebtoken');

module.exports = function(sequelize, Datatypes) {
	var user = sequelize.define('user', {
		email: {
			type: Datatypes.STRING,
			allowNull: false,
			unique: true,
			validate: {
				isEmail: true
			}
		},
		salt: {
			type: Datatypes.STRING
		},
		password_hash: {
			type: Datatypes.STRING
		},
		password: {
			type: Datatypes.VIRTUAL,
			allowNull: false,
			validate: {
				len: [7, 100]
			},
			set: function(value) {
				var salt = bcrypt.genSaltSync(10); 
				var hashedPassword = bcrypt.hashSync(value, salt);

				this.setDataValue('password', value);
				this.setDataValue('salt', salt);
				this.setDataValue('password_hash', hashedPassword);
			}

		}
	}, {
		hooks: {
			beforeValidate: function(user, options) {
				if (typeof user.email === 'string') {
					user.email = user.email.toLowerCase();
				}

			}
		},
		classMethods: {
			authenticate: function(body) {
				return new Promise(function(resolve, reject) {
					if (typeof body.email === 'string' && typeof body.password === 'string') {
						//console.log(body.email);
						user.findOne({
								where: {
									'email': body.email
								}
							}).then(function(user) {
								console.log(user);
								if (!user || !bcrypt.compareSync(body.password, user.get('password_hash')))
									return reject();
								//else
								//res.send(user.toPublicJSON());
								resolve(user);

							}, function(e) {
								reject();
							})
							//res.json(body);
					} else
						return reject();
				});
			},
			findByToken: function(token){
				return new Promise(function(resolve, reject)
				{
					try
					{
						console.log('token :'+token);
						var decodedJWT  = jwt.verify(token,'asdfg123');
						var bytes = cryptojs.AES.decrypt(decodedJWT.token,'qwer123$');
						var tokenData = JSON.parse(bytes.toString(cryptojs.enc.Utf8));
						//console.log(id);
						user.findById(tokenData.id).then(function(user){
							if(user)
							resolve(user);
						else
							reject();

						},function(e)
						{
							reject();
						});
					}
					catch(e)
					{
						console.log(e);
						reject();
					}
				});
			}
		},
		instanceMethods: {
			toPublicJSON: function() {
				var json = this.toJSON();
				return _.pick(json, 'id', 'email', 'createdAt', 'updatedAt');
			},
			generateToken : function(type) {
				if(!_.isString(type))
				{
					return undefined;
				}
				try
				{
					var stringData = JSON.stringify({id :this.get('id'), type :type});
					var encryptedData = cryptojs.AES.encrypt(stringData, 'qwer123$').toString();
					var token = jwt.sign({
						token : encryptedData
					},'asdfg123');
					return token;
				}
				catch(e)
				{
					console.log(e);
					return undefined;
				}
			}
		}


	});
	return user;
};