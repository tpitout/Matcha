/*  
    npm install                     --save
    npm install ejs                 --save
    npm install express             --save
    npm install body-parser         --save
    npm install mysql               --save
    npm install express-validator   --save
    npm install bcrypt              --save

    ./mongod --dbpath ~/mongo-data
*/

const express =     require('express');                             //Include Express
const ejs =         require('ejs');                                 //Include EJS
const bodyParser =  require('body-parser');                         //body-parser
const mysql =       require('mysql');                               //mySQL
const bcrypt =      require('bcrypt');

const app = express();

var urlencodedParser = bodyParser.urlencoded({ extended: false});   //Body-Parser

app.use(express.static(__dirname + '/public'));                     //Add Public Folder (CSS)
app.set('view engine', 'ejs');                                      //Set View Engine to EJS

//================================================================  DATABASE

//================================================================  DATABASE
                                                                 
var form = "";                                                      //Declare some Variables
const saltRounds = 1;

app.get("/", function(req, res) {                                   //Get Root
    const name = "TREDX";
    form = "1";
    res.render("index", {name, form});
})

app.post("/1", urlencodedParser, function(req, res) {               //GET POST REQUEST
    form = "1";
    console.log(req.body);

    const errors = validate(req);

    if (errors.length == 0) {

        bcrypt.hash(req.body.upsw, saltRounds, function(err, hash){ //Encrypt The Password with bcrypt
            req.body.upsw = hash;
            res.render("index-logged", {data: req.body});
          });
        
    } else {
        console.log(errors);
    }
})

function validate(req) {                                            //Validate Email And Password - Only checking if entered
    const errors = [];

    if (!req.body.uname) {                                          //uname
        errors.push("Email Has Not Been Entered!");
    }
    if (!req.body.upsw) {                                           //upsw
        errors.push("Password Has Not Been Entered!");
    }
    return errors;
}

app.listen(8080, function() {                                       //Shh and listen!
    console.log("Listen on 8080");
})