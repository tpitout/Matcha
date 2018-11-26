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

const app = express();

//==================================================================    //DATABASE    ++++++++++++++++++++++++++++++

var con = sql.createConnection({                                        //Create Connection
  host: "localhost",
  user: "root",
  password: "123",
  database: "maindata"
});

con.connect(function(err){                                             //Connect
  if(err){
    console.log('Error connecting to Db');
    return;
  }
  console.log('✅ \x1b[1m \x1b[32m Connection established \x1b[0m');
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
                                                  
var username ="";                                                       //Declare some Variables
var password ="";
const saltRounds = 1;

app.get("/", function(req, res) {                                       //Get Root
    res.render("index");
});

app.post("/", urlencodedParser, function(req, res) {                   //GET POST REQUEST
    console.log(req.body);
    username = req.body.uname;
    password = req.body.upsw;
    con.query('SELECT * from userdata WHERE username='+'"'+username+'"'+' AND password='+'"'+password+'"', function(err, rows, fields) {      
    if (!err) {
        console.log('DB RETURN: ', rows);
    }
    if (rows.length == 1) {
        res.render("main");
    } else {
        console.log('Error while performing Query.');
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
            username = req.body.uname;
            firstname= req.body.ufname;
            lastname = req.body.ulname;
            password = req.body.upsw;
            email    = req.body.uemail;
            console.log(password);
            con.query('INSERT INTO userdata (name, surname, email, username, password) VALUES ("'+firstname+'","'+lastname+'","'+email+'","'+username+'","'+password+'")');
            var mailOptions = {
                from: 'official.matcha@gmail.com',
                to: email,
                subject: 'Sending Email using Node.js',
                html: '<div style="border: 5px SOLID #FF5864"><h1 style="color:#FF5864;text-align:center;">WELCOME TO MATCHA</h1> <h2 style="color:#FF5864;text-align:center;">'+firstname+" "+lastname +"</div>"
              };
            transporter.sendMail(mailOptions, function(error, info){
            if (error) {
                console.log(error);
            } else {
                console.log('✅ \x1b[1m \x1b[32m EMAIL SENT: \x1b[0m' + info.response);
            }
            });
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
