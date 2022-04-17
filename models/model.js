const sql = require('mssql/msnodesqlv8')
const sqlConfig = require('../dbconfig')
const fs = require("fs");
const csv = require('csv-parser');
const uuid = require("uuid").v4;
const fastcsv = require('fast-csv')

async function getYear() {
    await sql.connect(sqlConfig);
    const result = await sql.query("select DISTINCT Year from AirPollutionPM25 Order By Year ");
    return result.recordset
}

async function getCountry() {
    await sql.connect(sqlConfig);
    const result = await sql.query("select DISTINCT country from AirPollutionPM25 Order By country ");
    return result.recordset
}


async function getDataAll() {
    await sql.connect(sqlConfig);
    const result = await sql.query("select * from AirPollutionPM25 ");
    return result.recordset
}

async function findByYear(year){
    await sql.connect(sqlConfig);
    const result = await sql.query(`select * from AirPollutionPM25 Where Year = '${year}' `);
    return result.recordset
}

async function findByNearBangkok(){
    await sql.connect(sqlConfig);
    const result = await sql.query(
        `DECLARE @BKK geometry
        SELECT @BKK=geom
        FROM AirPollutionPM25
        WHERE City='Bangkok'   
        SELECT TOP(50) * FROM AirPollutionPM25 WHERE City != 'Bangkok'
        ORDER BY geom.STDistance(@BKK); `
    );
    return result.recordset
}

async function findByNearboringThaiAndYear2018(){
    await sql.connect(sqlConfig);
    const result = await sql.query(
        `SELECT * 
        FROM AirPollutionPM25
        WHERE country IN ('Indonesia' , 'Malaysia', 'Myanmar', 'Philippines', 'Singapore') AND Year = '2018' `
    );
    return result.recordset
}

async function findEachCountryAndYear2011(){
    await sql.connect(sqlConfig);
    const result = await sql.query(
        `SELECT *
        FROM AirPollutionPM25
        WHERE country = (
        SELECT Top 1 country
        FROM AirPollutionPM25
        GROUP BY country
        ORDER BY COUNT(city) DESC
        ) AND Year = '2011' `
    );
    return result.recordset
}


async function findByLowIncome(year){
    await sql.connect(sqlConfig);
    const result = await sql.query(
        `SELECT *
        FROM AirPollutionPM25
        WHERE wbinc16_text LIKE '%Low income%' AND year = ${year}  `
    );

    return result.recordset
}

async function findByMBR(){
    await sql.connect(sqlConfig);
    const result = await sql.query(
        `DECLARE @TH geometry
        SELECT @TH=geometry::EnvelopeAggregate(geom)
        FROM AirPollutionPM25
        WHERE Country ='Thailand'
        SELECT @TH.STEnvelope() AS Polygon`
    );
    return result.recordset
}

//Save file csv
async function saveData(filename){
    try {
        await sql.connect(sqlConfig);
        let results = []

        fs.createReadStream('./upload/'+filename)
        .pipe(csv({
            headers: false
        }))
        .on('data', (data) => results.push(data))
        .on('end', async function ()  {
            console.log(results);
            sql.connect(sqlConfig).then(async (pool) => {
            for (let i = 1; i < results.length; i++){
                await pool.request().input('city', sql.VARCHAR, results[i][1])
                    .query(
                    `INSERT INTO AirPollutionPM25 (country,city,Year,pm25,latitude,longitude,population,wbinc16_text,Region,conc_pm25,color_pm25) 
                    VALUES('${results[i][0]}',@city,'${results[i][2]}',${results[i][3]},${results[i][4]},${results[i][5]},${results[i][6]},'${results[i][7]}','${results[i][8]}','${results[i][9]}','${results[i][10]}');

                    UPDATE AirPollutionPM25
                    SET  geom = geometry::STGeomFromText( 'POINT(' + CAST([Longitude] AS VARCHAR(20)) + ' ' + CAST([Latitude] AS VARCHAR(20)) + ')',4326);`
                )
                 console.log(i)
            }})
        });
        return {
            message: "Get Data Complete",
            error: false,
        };
    } catch (error) {
        return {
            message: "Error to get Data",
            error: true,
        };
    }
}

async function downloadFileA(){
    await sql.connect(sqlConfig);
    const query = await sql.query(
        `select Country,City from AirPollutionPM25 where Year = 2015 and Pm25 > 50 `
    );

    const file = await writeCSV('a', query)
    
    return file
}

async function downloadFileB(){
    await sql.connect(sqlConfig);
    const query = await sql.query(
        `SELECT country , AVG(pm25) as average
        FROM AirPollutionPM25
        GROUP BY country
        ORDER BY average DESC`
    );

    const file = await writeCSV('b', query)
    
    return file
}

async function downloadFileC(country){
    await sql.connect(sqlConfig);
    const query = await sql.query(
        ` select city,year, pm25 
        from AirPollutionPM25 
        where country = '${country}'`
    );

    const file = await writeCSV('c', query)
    
    return file
}


async function downloadFileD(year, color){
    await sql.connect(sqlConfig);
    const query = await sql.query(
        `select SUM(population) as Affected_Population 
        from AirPollutionPM25 
        where year = '${year}' and color_pm25 = '${color}'`
    );

    const file = await writeCSV('d', query)
    
    return file
}

async function writeCSV(select, result) {
    const filename = uuid();
    console.log(filename)
    const ws = fs.createWriteStream(
        `./download/${select}/${filename}.csv`
    );

    fastcsv.write(result.recordset, { headers: true }).pipe(ws);

    const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    await delay(1000);

    return filename + ".csv"
}
            





module.exports = {
    getDataAll, 
    findByYear, 
    getYear, 
    getCountry, 
    saveData, 
    findByNearBangkok, 
    findByNearboringThaiAndYear2018,
    findEachCountryAndYear2011,
    findByLowIncome,
    findByMBR,
    downloadFileA,
    downloadFileB,
    downloadFileC,
    downloadFileD
}