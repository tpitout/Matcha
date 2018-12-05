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
    npm install server-favicon      --save
    npm install favicon             --save

    Run XAMPP or MAMP APACHE/MySQL
*/

const express =                 require('express');                     //Include Express          
const ejs =                     require('ejs');                         //Include EJS               
const bodyParser =              require('body-parser');                 //body-parser               
const mysql =                   require('mysql');                       //mySQL                     
const bcrypt =                  require('bcrypt');                      //Encryption              
const session =                 require('express-session');             //Sessions                 
const cookie =                  require('cookie-parser');               //Cookie                   
const nodemailer =              require('nodemailer');                  //Nodemailer for Email     
const crypto =                  require('crypto');                      //Token generator          
const swal =                    require('sweetalert');                                          
const multer =                  require("multer");
const fs =                      require("fs");
const favicon =                 require('serve-favicon');
const jquery =                  require('jquery');
const dateTime =                require('node-datetime');

const app = express();                                                                          
const urlencodedParser = bodyParser.urlencoded({ extended: false});                                 

var red = "❌ \x1b[1m \x1b[31m";                                                             
var green = "✅ \x1b[1m \x1b[32m";                                                          

app.use(express.static(__dirname + '/public'));                                                 
app.set('view engine', 'ejs');                                                                   

app.use(session({secret:'TREDX'}));

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
            var sql = "CREATE TABLE userdata (`id` INT AUTO_INCREMENT PRIMARY KEY, `username` VARCHAR(255), `name` VARCHAR(255), `surname` VARCHAR(255), `email` VARCHAR(255), `password` VARCHAR(255), `code` VARCHAR(4), `token` VARCHAR(255), `verified` TINYINT(1) DEFAULT '0', `fame` INT(5) DEFAULT '0', `gender` VARCHAR(10), `pref` VARCHAR(10), `online` VARCHAR(100), `reports` INT(5) DEFAULT '0', `bio` TEXT, `tags` TEXT, `pp` LONGTEXT, `lonline` DATETIME)";
            con.query(sql, function (err, result) {
                if (err){
                    console.log(err);
                }
                console.log(green +"TABLE CREATED  :   \x1b[33m USERDATA \x1b[0m");
            });
            var sql = "CREATE TABLE chat (`id` INT AUTO_INCREMENT PRIMARY KEY, `username` VARCHAR(255), `viewer` VARCHAR(255), `message` VARCHAR(255))";
            con.query(sql, function (err, result) {
                if (err){
                    console.log(err);
                }
                console.log(green +"TABLE CREATED  :   \x1b[33m CHAT \x1b[0m");
            });
            var sql = "CREATE TABLE visitors (`id` INT AUTO_INCREMENT PRIMARY KEY, `username` VARCHAR(255), `viewer` VARCHAR(255))";
            con.query(sql, function (err, result) {
                if (err){
                    console.log(err);
                }
                console.log(green +"TABLE CREATED  :   \x1b[33m visitors \x1b[0m");
            });
            var sql = "CREATE TABLE likes (`id` INT AUTO_INCREMENT PRIMARY KEY, `username` VARCHAR(255), `liked` VARCHAR(255))";
            con.query(sql, function (err, result) {
                if (err){
                    console.log(err);
                }
                console.log(green +"TABLE CREATED  :   \x1b[33m visitors \x1b[0m");
            });
            
        });
    });
});

var transporter = nodemailer.createTransport({                                                    
    service: 'gmail',
    auth: {
      user: 'official.matcha@gmail.com',
      pass: 'MatchaMatcha'
    },
    tls: {
        rejectUnauthorized: false
    }
});

app.get("/", function(req, res) {                                                                                                  
    res.render("index");
});

app.post("/", urlencodedParser, function(req, res) {                                              
    var success = "/";               
    console.log(req.body);                              
    if (req.body.uname && req.body.upsw)                                                                 
    {
        con.query('SELECT * FROM `maindata`.`userdata` WHERE `username`= ?', [req.body.uname], function(err, result, fields) {   
            if (result.length == 1)                                                               
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
                                    con.query("UPDATE `maindata`.`userdata` SET `online` = ? WHERE `username` = ?", ["online", req.body.uname], function(err, result, fields) {
                                    });
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
            var mailOptions = {                                                                  
                from: 'official.matcha@gmail.com',
                to: req.body.uemail,
                subject: 'WELCOME TO MATCHA ❤️',
                html: '<div style="border: 5px SOLID #FF5864"><h1 style="color:#FF5864;text-align:center;">WELCOME TO MATCHA</h1> <h2 style="font-size:30px;color:#FF5864;text-align:center;">'+req.body.ufname+" "+req.body.ulname+
                "<br><a style='font-size:20px;text-align:center;color:white;text-decoration:none;background-color:#FF5864;padding: 5px 5px;' href='http://localhost:8888/profile_setup.mp3/token="+token+"'>LOGIN</a>"+"</div>"
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
                            console.log("++++++++++++++++++++++++++++++++++++++   " + req.body.myFile);
                            con.query('INSERT INTO `maindata`.`userdata` (`name`, `surname`, `email`, `username`, `password`, `token`, `pp`) VALUES (?,?,?,?,?,?,?)', [req.body.ufname, req.body.ulname, req.body.uemail, req.body.uname, hash, token, req.body.myFile], function(err, result, fields){
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
    }
    else {
        console.log(errors);
    }
});

app.post("/profile_setup/:token" , urlencodedParser, function(req, res) {                         
    console.log(req.body);
    var code = evaluateCode(req.body.gender, req.body.pref);
    var token = req.params.token;
    token = token.slice(6,38);
    con.query('UPDATE `maindata`.`userdata` SET `code` = ?, `bio` = ?, `tags` = ?, `gender` = ?, `pref` = ? WHERE `token` = ?', [code, req.body.bio, req.body.tags, req.body.gender, req.body.pref, token], (err, result, fields) => {
        if (err) {
            console.log(red +'ERROR ON QUERY #5 \x1b[0m', err);
        }
        else {
            console.log(green +'SUCCESFULLY ADDED USER PREFERENCES! \x1b[0m');
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

app.get("/profile_setup.mp3/:token", function(req, res) {                                           
    res.render("profile_setup", {output: req.params.token});
});

app.get("/user/:username", function(req, res) {
    console.log("\x1b[1m \x1b[46m /USER/ \x1b[0m"); 
    var name = req.params.username;
    name = name.slice(4);
    con.query('SELECT * FROM `maindata`.`userdata` WHERE `username` = ?', [name], (err, result, fields) => {
        if (result.length == 1)
        {
            var uname = result[0].username;
            var email = result[0].email;
            var bio   = result[0].bio;
            var fame  = result[0].fame;
            var online  = result[0].online;
            var lonline = result[0].lonline;
            fame = fame + 1;
            
            con.query('INSERT INTO `maindata`.`visitors` (`username`, `viewer`) VALUES (?,?)', [uname, req.session.uname], function(err, result, fields){
                console.log("======================= |       " + req.session.viewer);
                console.log("======================= |       " + req.session.uname);
            });
            con.query('UPDATE `maindata`.`userdata` SET `fame` = ? WHERE `email` = ?', [fame, email], (err, result, fields) => {
                console.log("👀   Fame Updated \x1b[1m +10 \x1b[0m");
            });
            req.session.viewer = uname;
            var names =[req.session.uname, req.session.viewer];
            names.sort();

            con.query('SELECT * FROM `maindata`.`chat` WHERE `username` = ? ', [names[0]+names[1]], (err, re, fields) => {
                var chatlog = [];
                if (re)
                {
                    for (i = 0; i < re.length; i++)
                    {
                        chatlog.push(re[i].message);
                        console.log(re.length);
                    }
                } else {
                    console.log("XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX");
                    
                }
                console.log(green+ lonline);
                var f1 = "";
                var f2 = "";
                var chat = 0;
                con.query('SELECT * FROM `maindata`.`likes` WHERE `username` = ?', [req.session.uname], (err, reslt, fields) => {
                    console.log("................. " +reslt.length);
                    if (reslt)
                    {
                        for (i = 0; i < reslt.length; i++)
                        {
                            if (reslt[i].liked = req.session.viewer);
                            {
                                f1 = "yes";
                                console.log("===========  : " + f1);
                            }
                        }
                        console.log("xxxxxxxxxxxxxxxx=> "+f1);
                    }
                    con.query('SELECT * FROM `maindata`.`likes` WHERE `username` = ?', [req.session.viewer], (err, reslt2, fields) => {
                        console.log("................  " +reslt2.length);
                        if (reslt2)
                        {
                            for (i = 0; i < reslt2.length; i++)
                            {
                                if (reslt[i].liked = req.session.uname);
                                {
                                    f2 = "yes";
                                    console.log("===========  : " + f2);
                                }
                            }
                        }
                        console.log("__________________ => "+f1+"  "+f2);
                        if ((f1 == "yes") && (f2 == "yes"))
                        {
                            chat = 1;
                        } else {
                            chat = 0;
                        }
                        console.log("----------------   =   " +chat);
                        res.render("user", {name, uname, bio, fame, chatlog, online, lonline, chat});
                    });
                });         
            });
        }       
    });                                                                               
});

app.post("/chat", urlencodedParser, function(req, res) {
    var chat = req.body.chat_1;
    chat = req.session.uname + ": " + req.body.chat_1;
    var names =[req.session.uname, req.session.viewer];
    names.sort();
    con.query('INSERT INTO `maindata`.`chat` (`username`, `message`) VALUES (?,?)', [names[0]+names[1], chat], function(err, result, fields){
    });
    res.redirect("/user/usr="+req.session.viewer);
});

app.post("/like", urlencodedParser, function(req, res) {
    console.log(red+"+++++++++++++++++++++++++");
    con.query('SELECT * FROM `maindata`.`likes` where `username` = ? AND `liked` = ?', [req.session.uname, req.session.viewer], function(err, res, fields){
        console.log(res.length);
        if (res == 0)
        {
            con.query('INSERT INTO `maindata`.`likes` (`username`, `liked`) VALUES (?,?)', [req.session.uname, req.session.viewer], function(err, result, fields){
            });
        } else
        {
            con.query('DELETE FROM `maindata`.`likes` WHERE `username` = ? AND `liked` = ?', [req.session.uname, req.session.viewer], function(err, result, fields){
            });
        }
    });
    
    res.redirect("/user/usr="+req.session.viewer);
});

app.post("/report", urlencodedParser, function(req, res) {
    console.log("XXXXXX    reported ;");
    var report = 1;
    con.query('SELECT * FROM `maindata`.`userdata` where `username` = ? ', [req.session.viewer], function(err, res, fields){
        report = report + (res[0].reports);
        con.query('UPDATE `maindata`.`userdata` SET `reports` = ? WHERE `username` = ?', [report, req.session.viewer], function(err, result, fields){
        });
    });
    
    res.redirect("/user/usr="+req.session.viewer);
});

app.get("/main.txt", function(req, res) { 
    if (req.session.uname)
    {
        var uname = req.session.uname;
        con.query('SELECT * FROM `maindata`.`userdata` WHERE `username` = ?', [uname], (err, result, fields) => {
            if (result.length == 1)
            {
                var uname = result[0].username;
                var fname = result[0].name;
                var sname = result[0].surname;
                var email = result[0].email;
                var pref  = result[0].pref;
                con.query('SELECT * FROM `maindata`.`userdata` WHERE `gender` = ?', [pref], (err, resl, fields) => {
                    var ppl = [];
                    if (resl)
                    {
                        for (i = 0; i < resl.length; i++)
                        {
                            ppl.push(resl[i].username);
                        }
                    }
                con.query('SELECT * FROM `maindata`.`chat`', (err, respo, fields) => {
                    var log = [];
                    if (respo.length > 0) 
                    {
                        for (i = 0; i < respo.length; i++)
                        {
                            if (respo[i].username.includes(uname))
                            {
                                if (!(respo[i].message.includes(uname)))
                                {
                                    log.push(respo[i].message);
                                }
                            }
                        }
                    }
                    log.reverse();
                    con.query('SELECT * FROM `maindata`.`visitors` WHERE `username` = ?', [uname], (err, respon, fields) => {
                        var visits = [];
                        
                        if (respon)
                        {
                            for (i = 0; i < respon.length; i++)
                            {
                                visits.push(respon[i].viewer);

                            }
                        }
                        var u1 = [];
                        var u2 = [];      
                        var uliked = [];     
                                        
                        con.query('SELECT * FROM `maindata`.`likes` WHERE `username` = ?', [req.session.uname], (err, resul, fields) => {
                                                                                                
                            for (i = 0; i < resul.length; i++)
                            {
                                u1.push(resul[i].liked);                              
                            }
                            con.query('SELECT * FROM `maindata`.`likes` WHERE `liked` = ?', [req.session.uname], (err, reslt, fields) => {
                            for (i = 0; i < reslt.length; i++)
                            {
                                u2.push(reslt[i].username);                               
                            }   
                            for (i = 0; i < u1.length; i++)
                            {
                               if (u2.includes(u1[i]))
                               {
                                   uliked.push(u1[i]);                                   
                               }
                            }     
                            var visithis = [];  
                            console.log("------------------------------------  " + req.session.uname);
                            con.query('SELECT * FROM `maindata`.`visitors` WHERE `viewer` = ?', [req.session.uname], (err, j, fields) => {
                                console.log(j);
                                for (i = 0; i < j.length; i++)
                                {
                                    visithis.push(j[i].username);
                                    console.log(visithis[i]);
                                }
                                visithis.reverse();
                                res.render("main", {uname, fname, sname, email, pref, ppl, log, visits, uliked, visithis});
                            });
                                                                        
                            });
                            
                        });
                        
                    });
                });
                });
            }
        });
    } else {
        res.render("index");
    }                                              
});

app.get("/logout", function(req, res) {      
    con.query("UPDATE `maindata`.`userdata` SET `online` = ? WHERE `username` = ?", ["offline", req.session.uname], function(err, result, fields) {
    });  
    var dt = dateTime.create();
    var formatted = dt.format('Y-m-d H:M:S');
    con.query("UPDATE `maindata`.`userdata` SET `lonline` = ? WHERE `username` = ?", [formatted, req.session.uname], function(err, result, fields) {
    });
    console.log("LOGOUT");
    res.redirect("/");                             
});

app.listen(8888, function() {                                                                                          
    console.log(green + "SERVER LAUNCHED :: \x1b[33m PORT: 8888 \x1b[0m");
});

function validateReg(req) {                                                                         
    const errors = [];
    if (req.body.upsw != req.body.upsw2) {
        errors.push("Passwords Do not match!");
    }
    return errors;
};

function evaluateCode(gender, preference) {                                                        
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