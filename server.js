/*  
    npm install                     --save
    npm install ejs                 --save
    npm install express             --save
    npm install body-parser         --save
    npm install mysql               --save
    npm install express-validator   --save
    npm install bcrypt              --save
    npm install mongodb@2.2.5          --save
*/

const express =     require('express');                                 //Include Express
const ejs =         require('ejs');                                     //Include EJS
const bodyParser =  require('body-parser');                             //body-parser
const mysql =       require('mysql');                                   //mySQL
const bcrypt =      require('bcrypt');
const {MongoClient, ObjectID} = require('mongodb');                     //MongoDB (deconstructed)

const app = express();

MongoClient.connect('mongodb://localhost:27017', (err, db) => {         //Connect to database
    if(err){
        return console.log('Unable to connect beacuse: '+err);          //Connection error
    }
    console.log('Connected');

    var urlencodedParser = bodyParser.urlencoded({ extended: false});   //Body-Parser

    app.use(express.static(__dirname + '/public'));                     //Add Public Folder (CSS)
    app.set('view engine', 'ejs');                                      //Set View Engine to EJS

    var access = "";                                                    //Declare some Variables
    const saltRounds = 1;

    app.get("/", function(req, res) {                                   //Get Root
        const name = "TREDX";
        access = "1";
        res.render("index", {name, access});
    })

    app.post("/1", urlencodedParser, function(req, res) {               //GET POST REQUEST
        access = "1";
        console.log(req.body);

        const errors = validate(req);

        if (errors.length == 0) {
            bcrypt.hash(req.body.upsw, saltRounds, function(err, hash){ //Encrypt The Password with bcrypt
                if (err){
                    return console.log('Unable to hash', err);
                }
                req.body.upsw = hash;
                res.render("index-logged", {data: req.body});
            });
            db.collection('Users').insertOne({                          //Insert user into database
                username: req.body.uname,
                password: req.body.upsw                                 //Must figure out how to add HASHED password
            }, (err, result) => {
                if (err){
                    return console.log('Unable to insert', err);
                }
                console.log(JSON.stringify(result.ops, undefined, 2));  //Inserted documents
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
});