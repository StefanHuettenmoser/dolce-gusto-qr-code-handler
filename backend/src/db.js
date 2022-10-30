const mariadb = require("mariadb");
const pool = mariadb.createPool({
	host: "db",
	user: process.env.MARIADB_USER,
	password: process.env.MARIADB_PASSWORD,
	connectionLimit: 5,
	database: process.env.MARIADB_DATABASE,
});

const q = async (options, values, keepMeta = false) => {
	if (typeof options === "string") {
		options = {
			sql: options,
		};
	}
	return new Promise(async (resolve, reject) => {
		let conn;
		console.info("SQL QUERY:", options.sql || options);
		try {
			conn = await pool.getConnection();
			const res = await conn.query(options, values);
			if (res.meta && !keepMeta) {
				delete res.meta;
			}
			resolve(res);
		} catch (err) {
			reject(err);
		} finally {
			if (conn) return conn.end();
		}
	});
};

module.exports = q;
