const q = require("./db.js");

module.exports = {
	get: async () => {
		const rows = await q("SELECT * FROM dolce_point");
		console.log(rows);
		return rows[0];
	},
	update: (points) => {
		return q(
			`INSERT INTO dolce_point (points, updated) 
			 VALUES (?, NOW())`,
			[points]
		);
	},
};
