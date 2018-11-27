/*  SETUP
    npm install                     --save
    npm install ejs                 --save
    npm install express             --save
    npm install body-parser         --save
    npm install bcrypt              --save
    npm install express-session     --save
    npm install mongodb@2.2.5       --save
    npm install cookie-parser       --save
    npm install mysql               --save
    npm install nodemailer          --save

    Run XAMPP or MAMP APACHE/MySQL
*/
/* ToDO
    Password Encrypt
    .pdf
    .exe
    .gif
    .zip
    .c
    .com
    .ru
*/

const express =                 require('express');                     //Include Express
const ejs =                     require('ejs');                         //Include EJS
const bodyParser =              require('body-parser');                 //body-parser
const mysql =                   require('mysql');                       //mySQL
const bcrypt =                  require('bcrypt');                      //Encryption
const session =                 require('express-session');             //Sessions
const cookie =                  require('cookie-parser');               //Cookie
const sql =                     require('mysql');                       //Database
const nodemailer =              require('nodemailer');                  //Nodemailer for Email
const crypto =                  require('crypto');                      //Token generator

const app = express();

//==================================================================    //DATABASE    ++++++++++++++++++++++++++++++

var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "123"
});

con.connect(function(err) {
    if (err){
        console.log(err);
    }
    console.log("Connected!");
    con.query("CREATE DATABASE maindata", function (err, result) {
        if (err){
            return;
        }
        console.log("Database created");
        var con = mysql.createConnection({
            host: "localhost",
            user: "root",
            password: "123",
            database: "maindata"
        });

        con.connect(function(err) {
            if (err){
                return;
            }
            console.log("Connected!");
            var sql = "CREATE TABLE userdata (`id` INT AUTO_INCREMENT PRIMARY KEY, `username` VARCHAR(255), `name` VARCHAR(255), `surname` VARCHAR(255), `email` VARCHAR(255), `password` VARCHAR(255), `token` VARCHAR(255), `verified` TINYINT(1) DEFAULT '0')";
            con.query(sql, function (err, result) {
                if (err){
                    console.log(err);
                }
                console.log("Table created");
            });
        });
    });
});

//==================================================================    //DATABASE    ++++++++++++++++++++++++++++++

/*                      EMAIL                                           */
var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'official.matcha@gmail.com',
      pass: 'MatchaMatcha'
    }
  });

/*  ------------------------------------------------------------------- */

var urlencodedParser = bodyParser.urlencoded({ extended: false});       //Body-Parser

app.use(express.static(__dirname + '/public'));                         //Add Public Folder (CSS)
app.set('view engine', 'ejs');                                          //Set View Engine to EJS

app.get("/", function(req, res) {                                       //Get Root
    res.render("index");
});

app.post("/", urlencodedParser, function(req, res) {                   //GET POST REQUEST
    console.log(req.body);
    con.query('SELECT `password` from `maindata`.`userdata` WHERE `username`= ?', [req.body.uname], function(err, result, fields) {
    if (err) {
        console.log('Error while performing Query1.')
    }
    else {
        bcrypt.compare(req.body.upsw, result[0].password, (err, res) => {
            if (res == true){
                console.log('Successfully Logged in!');
            }
            else {
                console.log('Unuccessfully Logged in');
            }
        });
    }
    });
});

/////////////////////////////////////////////////////////////////////////////////////  REGISTER

app.get("/register.jpeg", function(req, res) {
    res.render("register");
});

app.post("/register", urlencodedParser, function(req, res) {
    console.log(req.body);
    const errors = validateReg(req);
    if (errors.length == 0) {
        bcrypt.hash(req.body.upsw, 8, (err, hash) => {
            if (err){
                return console.log('Unable to hash', err);
            }
            token = crypto.randomBytes(16).toString(`hex`);
            con.query('INSERT INTO `maindata`.`userdata` (`name`, `surname`, `email`, `username`, `password`, `token`) VALUES (?,?,?,?,?,?)', [req.body.ufname, req.body.ulname, req.body.uemail, req.body.uname, hash, token], function(err, result, fields){
            if (err) {
                console.log('Error while performing Query2.')
            }
            else {
                console.log('Successfully Added User!');
            }
            });
            var mailOptions = {
                from: 'official.matcha@gmail.com',
                to: req.body.uemail,
                subject: 'Sending Email using Node.js',
                html: '<div style="border: 5px SOLID #FF5864"><h1 style="color:#FF5864;text-align:center;">WELCOME TO MATCHA</h1> <h2 style="color:#FF5864;text-align:center;">'+req.body.ufname+" "+req.body.ulname+"</div>"
              };
            transporter.sendMail(mailOptions, function(error, info){
            if (error) {
                console.log(error);
            } else {
                console.log('✅ \x1b[1m \x1b[32m EMAIL SENT: \x1b[0m' + info.response);
            }
            });
        })
    } else {
        console.log(errors);
    }
});

app.post("/profile_setup", urlencodedParser, function(req, res) {
    console.log(req.body);
});

function validateReg(req) {
    const errors = [];

    if (req.body.upsw != req.body.upsw2) {
        errors.push("Passwords Do not match!");
    }
    return errors;
};

app.get("/profile_setup.mp3", function(req, res) {
    res.render("profile_setup");
});

app.get("/main.txt", function(req, res) {
    res.render("main");
});

app.listen(8080, function() {                                           //Shh and listen!
    console.log("✅ \x1b[1m \x1b[32m SERVER LAUNCHED :: \x1b[33m PORT: 8080 \x1b[0m");
});

/*//Matcha matching
u1 = parseInt("0101", 2);
u2 = parseInt("1001", 2);

// u1Pref = u1 & 3
// u1Gend = u1 >> 2;

// u2Pref = u2 & 3;
// u2Gend = u2 >> 2;

// preMatch1 = u1Gend & u2Pref;
// finMatch1 = prefMatch1 >> 1 | prefMatch1 & 1;

// preMatch2 = u2Gend & u1Pref;
// finMatch2 = preMatch2 >> 1 | preMatch2 & 1;

// result = finMatch1 & finMatch2;

console.log(((((u1 >> 2) & (u2 & 3)) >> 1) | (((u1 >> 2) & (u2 & 3)) & 1)) & ((((u2 >> 2) & (u1 & 3)) >> 1) | (((u2 >> 2) & (u1 & 3)) & 1)));*/
