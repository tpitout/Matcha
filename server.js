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
    console.log("✅ \x1b[1m \x1b[32m CONNECTED TO MySQL \x1b[33m PORT: 3030 \x1b[0m");
    con.query("CREATE DATABASE maindata", function (err, result) {
        if (err){
            console.log("❌ \x1b[1m \x1b[31m "+err+" \x1b[0m");
            return;
        }
        console.log("✅ \x1b[1m \x1b[32m DATABASE CREATED : \x1b[33m MAINDATA \x1b[0m");
        var con = mysql.createConnection({
            host: "localhost",
            user: "root",
            password: "123",
            database: "maindata"
        });

        con.connect(function(err) {
            if (err){
                console.log("❌ \x1b[1m \x1b[31m DATABASE ALREADY EXIST'S \x1b[0m");
                return;
            }
            console.log("✅ \x1b[1m \x1b[32m CONNECTED TO MySQL \x1b[33m PORT: 3030 \x1b[0m");
            var sql = "CREATE TABLE userdata (`id` INT AUTO_INCREMENT PRIMARY KEY, `username` VARCHAR(255), `name` VARCHAR(255), `surname` VARCHAR(255), `email` VARCHAR(255), `password` VARCHAR(255), `token` VARCHAR(255), `verified` TINYINT(1) DEFAULT '0')";
            con.query(sql, function (err, result) {
                if (err){
                    console.log(err);
                }
                console.log("✅ \x1b[1m \x1b[32m TABLE CREATED  :   \x1b[33m USERDATA \x1b[0m");
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
    console.log(req.body);
    con.query('SELECT `password` from `maindata`.`userdata` WHERE `username`= ?', [req.body.uname], function(err, result, fields) {
    if (err) {
        console.log('Error while performing Query1.')
    }
    else {
        bcrypt.compare(req.body.upsw, result[0].password, (err, res) => {
            if (res == true){
                console.log('✅ \x1b[1m \x1b[32m Successfully Logged in! \x1b[0m ');
                window.location.href = 'main';
            }
            else {
                console.log('❌ \x1b[1m \x1b[31m Unuccessfully Logged in! \x1b[0m ');
            }
        });
    }
    });
});

app.get("/register.jpeg", function(req, res) {
    res.render("register");
});

app.post("/register", urlencodedParser, function(req, res) {
    swal("hello");
    console.log(req.body);
    const errors = validateReg(req);
    if (errors.length == 0) {
        bcrypt.hash(req.body.upsw, 8, (err, hash) => {
            if (err){
                return console.log("❌ \x1b[1m \x1b[31m UNABLE TO HASH \x1b[0m", err);
            }
            token = crypto.randomBytes(16).toString(`hex`);
            con.query('INSERT INTO `maindata`.`userdata` (`name`, `surname`, `email`, `username`, `password`, `token`) VALUES (?,?,?,?,?,?)', [req.body.ufname, req.body.ulname, req.body.uemail, req.body.uname, hash, token], function(err, result, fields){
            if (err) {
                console.log('❌ \x1b[1m \x1b[31m ERROR ON QUERY #2 \x1b[0m');
            }
            else {
                console.log('✅ \x1b[1m \x1b[32m SUCCESFULLY ADDED NEW USER! \x1b[0m');
                
            }
            });
            var mailOptions = {
                from: 'official.matcha@gmail.com',
                to: req.body.uemail,
                subject: 'WELCOME TO MATCHA ❤️',
                html: '<div style="border: 5px SOLID #FF5864"><h1 style="color:#FF5864;text-align:center;">WELCOME TO MATCHA</h1> <h2 style="font-size:30px;color:#FF5864;text-align:center;">'+req.body.ufname+" "+req.body.ulname+
                "<br><a style='font-size:20px;text-align:center;color:white;text-decoration:none;background-color:#FF5864;padding: 5px 5px;' href='http://localhost:8080/profile_setup.mp3?token="+token+"'>LOGIN</a>"+"</div>"
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

app.get("/profile_setup.mp3", function(req, res) {
    res.render("profile_setup");
});

app.get("/main.txt", function(req, res) {
    res.render("main");
});

app.listen(8080, function() {                                         
    console.log("✅ \x1b[1m \x1b[32m SERVER LAUNCHED :: \x1b[33m PORT: 8080 \x1b[0m");
});

function validateReg(req) {
    const errors = [];

    if (req.body.upsw != req.body.upsw2) {
        errors.push("Passwords Do not match!");
    }
    return errors;
};

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
