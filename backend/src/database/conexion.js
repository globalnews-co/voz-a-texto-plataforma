import sql from "mssql";

const dbSettings = {
    user: "sa",
    password: "imcgfzgzdz",
    server: "192.168.1.210",
    database: "AuditoriaRadioTelevision",
    port: 1433,
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000
    },
    options: {
        encrypt: false,
        enableArithAbort: true,
        trustServerCertificate: true,

    }
}


export async function getConnection() {
 try {
    const pool = await sql.connect(dbSettings)
   
    return pool
 } catch (error) {
    console.log(error)
 }
 
   
 
    
}

export { sql };