const mysql = require('mysql')

var con = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'dynamically_database'
})

// var base_url = 'http://localhost:8000/'

con.connect((err) => {
    if (err) {
        console.error('Mysql Error !')
    } else {
        console.log('Mysql Running !')
    }
})
module.exports = con