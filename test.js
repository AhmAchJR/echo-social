// const sql = require("mssql");

import sql  from "mssql";

const sqlConfig = {
    user: "ahmjr",
    password: "123456",
    // database: "ITI",
    server: "DESKTOP-4K1DVMR",
    timeout: 30000,
    port: 1433,
    options: {
      encrypt: false, // Disable encryption
      trustServerCertificate: true // Bypass certificate validation
    }
};

(async () => {
    try {

    const connec = await sql.connect(sqlConfig);
    console.log(connec);
    
    console.log('Connected to SQL Server.');    
    
    const name = 'mo';

    const createdb = await sql.query`CREATE DATABASE [consle-med-db];`
    console.log(createdb)

    const insertrow = await sql.query`insert into testtt (name) values (${name});`
    console.log(insertrow.rowsAffected)
    
    console.log(insertrow)
    // console.dir(result);
    // console.log(result);
    } catch (err) {
    console.error(err);
    } finally {
    // Close the connection
    await sql.close();
    }
})();



// Complete the SQL statement to create the table
    // const createTableQuery = `
    //     CREATE TABLE testtt (
    //     id INT PRIMARY KEY IDENTITY,
    //     name NVARCHAR(50) NOT NULL
    //     )`;

    
    // const result = await sql.query(`
    //     CREATE TABLE testtt (
    //     id INT PRIMARY KEY IDENTITY,
    //     name NVARCHAR(50) NOT NULL
    //     )`);