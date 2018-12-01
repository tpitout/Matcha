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

    Modal Fix

*/

const express =                 require('express');                     //Include Express           //T
const ejs =                     require('ejs');                         //Include EJS               //T
const bodyParser =              require('body-parser');                 //body-parser               //T
const mysql =                   require('mysql');                       //mySQL                     //T
const bcrypt =                  require('bcrypt');                      //Encryption                //T
const session =                 require('express-session');             //Sessions               //T
const cookie =                  require('cookie-parser');               //Cookie                 //T
const nodemailer =              require('nodemailer');                  //Nodemailer for Email      //T
const crypto =                  require('crypto');                      //Token generator           //M
const swal =                    require('sweetalert');                                              //T

const app = express();                                                                              //T
const urlencodedParser = bodyParser.urlencoded({ extended: false});                                 //T

var red = "❌ \x1b[1m \x1b[31m";                                                                   //T
var green = "✅ \x1b[1m \x1b[32m";                                                                 //T

app.use(express.static(__dirname + '/public'));                                                    //T
app.set('view engine', 'ejs');                                                                     //T

app.use(session({secret:'TREDX'}));

var con = mysql.createConnection({                                                                 //T
    host: "localhost",
    user: "root",
    password: "123"
});

con.connect(function(err) {                                                                        //M
    if (err){
        console.log(err);
    }
    console.log(green+ " CONNECTED TO MySQL \x1b[33m PORT: 3030 \x1b[0m");
    con.query("CREATE DATABASE maindata", function (err, result) {
        if (err){
            console.log(red+err+" \x1b[0m");
            return;
        }
        console.log(green + "DATABASE CREATED : \x1b[33m MAINDATA \x1b[0m");                        //M
        var con = mysql.createConnection({
            host: "localhost",
            user: "root",
            password: "123",
            database: "maindata"
        });

        con.connect(function(err) {                                                                 //M
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

var transporter = nodemailer.createTransport({                                                     //T
    service: 'gmail',
    auth: {
      user: 'official.matcha@gmail.com',
      pass: 'MatchaMatcha'
    },
    tls: {
        rejectUnauthorized: false
    }
});

app.get("/", function(req, res) {                                                                  //T                                 
    res.render("index");
});

app.post("/", urlencodedParser, function(req, res) {                                               //T-M
    var success = "/";               
    console.log(req.body);                              
    if (req.body.uname && req.body.upsw)                                                            //T        
    {
        con.query('SELECT * FROM `maindata`.`userdata` WHERE `username`= ?', [req.body.uname], function(err, result, fields) {      //T
            if (result.length == 1)                                                                 //T
            {
                con.query('SELECT `password` from `maindata`.`userdata` WHERE `username`= ?', [req.body.uname], function(err, result, fields) {
                    if (err) {
                        console.log(red + 'Error while performing Query1.')
                    }
                    else 
                    {
                        console.log(result[0]);
                        if (result)
                        {
                            bcrypt.compare(req.body.upsw, result[0].password, (err, response) => {
                                if (response == true){
                                    console.log(green+" Successfully Logged in! \x1b[0m ");
                                    req.session.uname = req.body.uname;
                                    res.redirect("/main.txt");
                                }
                                else {
                                    console.log(red+"Unuccessfully Logged in! \x1b[0m ");
                                }
                            });
                        }
                    }
                    });
            }
        });   
    }
});

app.get("/register.jpeg", function(req, res) {                                                      //T
    res.render("register");
});

app.post("/register", urlencodedParser, function(req, res) {                                        //T-M
    console.log(req.body);                                                                          //T
    const errors = validateReg(req);                                                                //T
    if (errors.length == 0) {                                                                       //T
        bcrypt.hash(req.body.upsw, 8, (err, hash) => {                                              //M
            if (err){
                return console.log(red + " UNABLE TO HASH \x1b[0m", err);
            }
            token = crypto.randomBytes(16).toString(`hex`);                                         //M
            var mailOptions = {                                                                     //T
                from: 'official.matcha@gmail.com',
                to: req.body.uemail,
                subject: 'WELCOME TO MATCHA ❤️',
                html: '<div style="border: 5px SOLID #FF5864"><h1 style="color:#FF5864;text-align:center;">WELCOME TO MATCHA</h1> <h2 style="font-size:30px;color:#FF5864;text-align:center;">'+req.body.ufname+" "+req.body.ulname+
                "<br><a style='font-size:20px;text-align:center;color:white;text-decoration:none;background-color:#FF5864;padding: 5px 5px;' href='http://localhost:8080/profile_setup.mp3/token="+token+"'>LOGIN</a>"+"</div>"
            };
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
            })                                                                                      //M
        })
    }
    else {
        console.log(errors);
    }
});

app.post("/profile_setup/:token" , urlencodedParser, function(req, res) {                           //M
    console.log(req.body);
    var code = evaluateCode(req.body.gender, req.body.pref);
    var token = req.params.token;
    token = token.slice(6,38);
    con.query('UPDATE `maindata`.`userdata` SET `code` = ?, `bio` = ?, `tags` = ? WHERE `token` = ?', [code, req.body.bio, req.body.tags, token], (err, result, fields) => {
        if (err) {
            console.log(red +'ERROR ON QUERY #5 \x1b[0m', err);
        }
        else {
            console.log(green +'SUCCESFULLY ADDED USER PREFERENCES! \x1b[0m');
            ssn = req.session;
            ssn.token = token;
            console.log(ssn.token);
            con.query('SELECT * FROM `maindata`.`userdata`WHERE `token` = ?', [token], (err, result, fields) => {
                if (result.length == 1)
                {
                    req.session.uname = result[0].username;
                }
                res.redirect("/main.txt");
            });
            
        }
        });
});

app.get("/profile_setup.mp3/:token", function(req, res) {                                           //M
    res.render("profile_setup", {output: req.params.token});
});

app.get("/main.txt", function(req, res) { 
    if (req.session.uname)
    {
        var uname = req.session.uname;
        con.query('SELECT * FROM `maindata`.`userdata`WHERE `username` = ?', [uname], (err, result, fields) => {
            if (result.length == 1)
            {
                var uname = result[0].username;
                var fname = result[0].name;
                var sname = result[0].surname;
                var email = result[0].email;
                var code = result[0].code;
                //F4M3
            }
            res.render("main", {uname, fname, sname, email, code});
        });
    } else {
        res.render("index");
    }                                              //T  
});

app.listen(8080, function() {                                                                       //T                       
    console.log(green + "SERVER LAUNCHED :: \x1b[33m PORT: 8080 \x1b[0m");
});

function validateReg(req) {                                                                         //T
    const errors = [];
    if (req.body.upsw != req.body.upsw2) {
        errors.push("Passwords Do not match!");
    }
    return errors;
};

function evaluateCode(gender, preference) {                                                         //M
    var code;

    if (gender == "male"){
        code = "01";
    }
    else {
        code = "10";
    }
    if (preference == "none"){
        code = code+"00";
    }
    else if (preference == "male"){
        code = code+"01";
    }
    else if (preference == "female"){
        code = code+"10";
    }
    else if (preference == "both"){
        code = code+"11";
    }
    return code;
};