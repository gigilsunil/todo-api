var cryptojs = require('crypto-js');
module.exports = function(db) {
	return {
		requireAuthentication: function(req, res, next) {
			var token = req.get('Auth') || '';
			//console.log(token);
			db.token.findOne({
				where: {
					hashToken: cryptojs.MD5(token).toString()
				}
			}).then(function(tokenInstance) {

				if (!tokenInstance)
					throw new Error();

				//req.token = tokenInstance;
				req.token = tokenInstance.get('hashToken');
				console.log(tokenInstance.get('hashToken'));
				return db.user.findByToken(token);

			}).then(function(user) {
				req.user = user;
				next();
			}).catch(function() {
				res.status(401).send();
			});
		}
	};
}