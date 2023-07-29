const { Sequelize, QueryTypes } = require('sequelize');
const sqlite3 = require('sqlite3').verbose();
const path = "./database/inpc.db";

const sequelize = new Sequelize(`sqlite:${path}`)
try {
    sequelize.authenticate();
    console.log('Connection successfully')
} catch (error) {
    console.error("Unable to connect")
}

const consulta = async (par1, par2) => {
    let respuesta;
    await sequelize.query(`SELECT * FROM indices WHERE month = ${par1} AND year = ${par2}`, { type: QueryTypes.SELECT })
        .then(res => { respuesta = res })
        .catch(err => console.log(err))
  
    return respuesta[0].indice
}



module.exports={consulta}
//CREATE A TABLE
/*
const tableCreate = "CREATE TABLE IF NOT EXISTS indices(id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, year INTEGER NOT NULL, month INTEGER NOT NULL, indice REAL NOT NULL)";
db.run(tableCreate,err=>{
    if(err){
        return console.log(err.message)
    }
    else{
        console.log("Table created")
    }
    
})
*/



function getData(par1, par2) {

    const dbName = "./database/inpc.db";
    const db = new sqlite3.Database(dbName, err => {
        if (err) {
            return console.log(err.message);
        }
        else {
            console.log("Conexion exitosa con la base de datos")
        }
    })
    let indice=0
    let select = `SELECT * FROM indices WHERE month = ${par1} AND year = ${par2}`
    db.get(select, [], (err, row) => {

        if (err) {
            return console.log(err.message)
        }
        console.log(row)
        console.log(typeof row)
        return indice = 1
        
    })
    console.log(indice);
}

//QUERY RECORDS IN indices
const showInpc = async (month, year) => {

    let inpc = await getData(month, year)
    console.log("Aqui: " + inpc)
    return inpc
}


module.exports = { showInpc, getData, consulta };


