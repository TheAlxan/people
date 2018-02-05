var mysql = require('mysql');

function Connect(sql,cb){
    var con = mysql.createConnection({
        hostname:"localhost",
        user:'root',
        password:'123456',
        database:'people'
    });
    
    con.connect(function(err){
        if(err) throw err;
        con.query(sql,function(err,results){
            if(err) throw err;
            con.end();
            return cb(results);
        });
    });
}

module.exports = Connect;