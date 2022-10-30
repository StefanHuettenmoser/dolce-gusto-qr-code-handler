const q = require("./db.js");

module.exports = {
	get: async () => {
		const rows = await q("SELECT * FROM code WHERE entered=0");
		return rows;
	},
	post: async (code) => {
		const res = await q("INSERT INTO code (code) VALUES (?)", code);
		return res;
	},
	isValid: (code) => {
		return Boolean(code.match(/^[a-z0-9]{12}$/i)?.[0]);
	},
	setError: (code) => {
		return q(`UPDATE code SET error = 1 WHERE code=?; `, [code]);
	},
	setEntered: (code) => {
		return q(`UPDATE code SET entered = 1 WHERE code=?; `, [code]);
	},
};
