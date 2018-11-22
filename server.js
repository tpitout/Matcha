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

    Run XAMPP or MAMP APACHE/MySQL
*/

const express =                 require('express');                     //Include Express
const ejs =                     require('ejs');                         //Include EJS
const bodyParser =              require('body-parser');                 //body-parser
const mysql =                   require('mysql');                       //mySQL
const bcrypt =                  require('bcrypt');                      //Encryption
const session =                 require('express-session');             //Sessions
const cookie =                  require('cookie-parser');               //Cookie
const sql =                     require('mysql');                       //Database 

const app = express();

//==================================================================    //DATABASE    ++++++++++++++++++++++++++++++

var con = sql.createConnection({                                        //Create Connection
  host: "localhost",
  user: "root",
  password: "",
  database: "maindata"
});

con.connect(function(err){                                             //Connect
  if(err){
    console.log('Error connecting to Db');
    return;
  }
  console.log('Connection established');
}); 

//==================================================================    //DATABASE    ++++++++++++++++++++++++++++++

var urlencodedParser = bodyParser.urlencoded({ extended: false});       //Body-Parser

app.use(express.static(__dirname + '/public'));                         //Add Public Folder (CSS)
app.set('view engine', 'ejs');                                          //Set View Engine to EJS

var access = "";                                                        //Declare some Variables
var username ="";
var password ="";
const saltRounds = 1;

app.get("/", function(req, res) {                                       //Get Root
    const name = "TREDX";
    access = "1";
    res.render("index", {name, access});
})

app.post("/1", urlencodedParser, function(req, res) {                   //GET POST REQUEST
    access = "1";
    console.log(req.body);
    const errors = validate(req);
    if (errors.length == 0) {
        bcrypt.hash(req.body.upsw, saltRounds, function(err, hash){    //Encrypt The Password with bcrypt
            if (err){
                return console.log('Unable to hash', err);
            }
            req.body.upsw = hash;
            username = req.body.uname;
            password = req.body.upsw;

            con.query('SELECT * from userdata WHERE name=' + '"' + username + '"', function(err, rows, fields) {      
                if (!err) {
                  console.log('The solution is: ', rows);
                } else {
                  console.log('Error while performing Query.');
                }
              });
            res.render("main", {data: req.body});
        });
        } else {
            console.log(errors);
     }
 })

/////////////////////////////////////////////////////////////////////////////////////  REGISTER

 app.get("/register.jpeg", function(req, res) {                                       //Get Root
    res.render("register");
})

app.post("/register", urlencodedParser, function(req, res) {                                       //Get Root
    console.log(req.body);
    const errors = validateReg(req);
    if (errors.length == 0) {
        bcrypt.hash(req.body.upsw, saltRounds, function(err, hash){    //Encrypt The Password with bcrypt
            if (err){
                return console.log('Unable to hash', err);
            }
            req.body.upsw = hash;
            username = req.body.uname;
            firstname= req.body.ufname;
            lastname = req.body.ulname;
            password = req.body.upsw;
            email    = req.body.uemail;
            con.query('INSERT INTO userdata (name, surname, email, username, password) VALUES ("'+firstname+'", "'+lastname+'", "'+email+'", "'+username+'", "'+password+'")');
        });
    } else {
        console.log(errors);
    }
});

//////////////////////////////////////////////////////////////////////////////////////////////

function validateReg(req) {                                                //Validate Email And Password - Only checking if entered
    const errors = [];

    if (req.body.upsw != req.body.upsw2) {
        errors.push("Passwords Do not match!");
    }
    return errors;
}

app.listen(8080, function() {                                           //Shh and listen!
    console.log("Listen on 8080");
})
