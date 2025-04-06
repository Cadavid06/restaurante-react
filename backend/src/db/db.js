import mysql from 'mysql2';

const pool = mysql.createPool({
host: process.env.MYSQLHOST || 'bsnyuud2rfuv84uwirvt-mysql.services.clever-cloud.com',
user: process.env.MYSQLUSER || 'uslnto3osq3bw7kv',
password: process.env.MYSQLPASSWORD || 'tVm9YWljLunFiFivrH2E',
database: process.env.MYSQLDATABASE || 'bsnyuud2rfuv84uwirvt',
port: process.env.MYSQLPORT || 3306,
connectionLimit: 10
});

const promisePool = pool.promise();

export default promisePool;
