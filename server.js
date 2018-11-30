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
    npm install sweetalert          --save

    Run XAMPP or MAMP APACHE/MySQL

    Modal Errorirect
*/

const express =                 require('express');                     //Include Express
const ejs =                     require('ejs');                         //Include EJS
 const bodyParser =              require('body-parser');                 //body-parser
const mysql =                   require('mysql');                       //mySQL
const bcrypt =                  require('bcrypt');                      //Encryption
// const session =                 require('express-session');             //Sessions
// const cookie =                  require('cookie-parser');               //Cookie
const nodemailer =              require('nodemailer');                  //Nodemailer for Email
const crypto =                  require('crypto');                      //Token generator
const swal =                    require('sweetalert');

const app = express();
const urlencodedParser = bodyParser.urlencoded({ extended: false});

var red = "❌ \x1b[1m \x1b[31m";
var green = "✅ \x1b[1m \x1b[32m";

app.use(express.static(__dirname + '/public'));                        
app.set('view engine', 'ejs');   

var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "123"
});

con.connect(function(err) {
    if (err){
        console.log(err);
    }
    console.log(green+ " CONNECTED TO MySQL \x1b[33m PORT: 3030 \x1b[0m");
    con.query("CREATE DATABASE maindata", function (err, result) {
        if (err){
            console.log(red+err+" \x1b[0m");
            return;
        }
        console.log(green + "DATABASE CREATED : \x1b[33m MAINDATA \x1b[0m");
        var con = mysql.createConnection({
            host: "localhost",
            user: "root",
            password: "123",
            database: "maindata"
        });

        con.connect(function(err) {
            if (err){
                console.log(red+ " DATABASE ALREADY EXIST'S \x1b[0m");
                return;
            }
            console.log(green +" CONNECTED TO MySQL \x1b[33m PORT: 3030 \x1b[0m");
            var sql = "CREATE TABLE userdata (`id` INT AUTO_INCREMENT PRIMARY KEY, `username` VARCHAR(255), `name` VARCHAR(255), `surname` VARCHAR(255), `email` VARCHAR(255), `password` VARCHAR(255), `code` VARCHAR(4), `token` VARCHAR(255), `verified` TINYINT(1) DEFAULT '0', `reports` INT(5), `bio` TEXT, `tags` TEXT)";
            con.query(sql, function (err, result) {
                if (err){
                    console.log(err);
                }
                console.log(green +"TABLE CREATED  :   \x1b[33m USERDATA \x1b[0m");
            });
        });
    });
});

var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'official.matcha@gmail.com',
      pass: 'MatchaMatcha'
    }
});

app.get("/", function(req, res) {                                     
    res.render("index");
});

app.post("/", urlencodedParser, function(req, res) {   
    var success = "/";               
    console.log(req.body);
    con.query('SELECT `password` from `maindata`.`userdata` WHERE `username`= ?', [req.body.uname], function(err, result, fields) {
    if (err) {
        console.log(red + 'Error while performing Query1.')
    }
    else {
        bcrypt.compare(req.body.upsw, result[0].password, (err, response) => {
            if (response == true){
                console.log(green+" Successfully Logged in! \x1b[0m ");
                res.redirect("/main.txt");
            }
            else {
                console.log(red+"Unuccessfully Logged in! \x1b[0m ");
            }
        });
    }
    });
});

app.get("/register.jpeg", function(req, res) {
    res.render("register");
});

app.post("/register", urlencodedParser, function(req, res) {
    console.log(req.body);
    const errors = validateReg(req);
    if (errors.length == 0) {
        bcrypt.hash(req.body.upsw, 8, (err, hash) => {
            if (err){
                return console.log(red + " UNABLE TO HASH \x1b[0m", err);
            }
            token = crypto.randomBytes(16).toString(`hex`);
            con.query('SELECT * FROM `maindata`.`userdata` WHERE `username` = ?', [req.body.uname], (err, results, fields) => {
                if (err) {
                    console.log(red + 'ERROR ON QUERY #2 \x1b[0m');
                }
                if (results.length == 0){
                    console.log(req.body.email);
                    con.query('SELECT * FROM `maindata`.`userdata` WHERE `email` = ?', [req.body.uemail], (err, results, fields) => {
                        if (err) {
                            console.log(red + 'ERROR ON QUERY #3 \x1b[0m');
                        }
                        if (results.length == 0){
                            con.query('INSERT INTO `maindata`.`userdata` (`name`, `surname`, `email`, `username`, `password`, `token`) VALUES (?,?,?,?,?,?)', [req.body.ufname, req.body.ulname, req.body.uemail, req.body.uname, hash, token], function(err, result, fields){
                                if (err) {
                                    console.log(red + 'ERROR ON QUERY #4 \x1b[0m');
                                }
                                else {
                                    console.log(green + ' SUCCESFULLY ADDED NEW USER! \x1b[0m');
                                    transporter.sendMail(mailOptions, function(error, info){
                                        if (error) {
                                            console.log(error);
                                        } else {
                                            console.log(green + ' EMAIL SENT: \x1b[0m' + info.response);
                                        }
                                    });
                                }
                            });
                        }
                        else {
                            console.log(red + 'EMAIL EXISTS IN DATABASE \x1b[0m');
                        }
                    })
                }
                else {
                    console.log(red + 'USERNAME EXISTS IN DATABASE \x1b[0m');
                }
            })
        })
    } else {
        console.log(errors);
    }
});

app.post("/profile_setup", urlencodedParser, function(req, res) {
    console.log(req.body);
    if (req.body)
    {
        //SQL INSERT
    }
});

app.get("/profile_setup.mp3", function(req, res) {
    res.render("profile_setup");
});

app.get("/main.txt", function(req, res) {
    res.render("main");
});

app.listen(8080, function() {                                         
    console.log(green + "SERVER LAUNCHED :: \x1b[33m PORT: 8080 \x1b[0m");
});

function validateReg(req) {
    const errors = [];
    if (req.body.upsw != req.body.upsw2) {
        errors.push("Passwords Do not match!");
    }
    return errors;
};
