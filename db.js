sql.connect(sqlConfig, (err)=> {
    if(err){
        console.log(err)
    }

    var request = new sql.Request();

    request.query('SELECT * FROM AirPollutionPM25', (err, recordSet)=> {
        if(err){
            console.log(err)
        }else{
            console.log(recordSet)
        }

    })
})

