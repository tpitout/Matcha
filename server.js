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
    -    npm install pg-promise          --save                              //Database ++                       https://www.enterprisedb.com/thank-you-downloading-postgresql?anid=1256151
    -    cd ~mongo/bin && ./mongod       --dbpath ~mongo-database            //start the database
*/

const express =                 require('express');                     //Include Express
const ejs =                     require('ejs');                         //Include EJS
const bodyParser =              require('body-parser');                 //body-parser
const mysql =                   require('mysql');                       //mySQL
const bcrypt =                  require('bcrypt');
const session =                 require('express-session');
const cookie =                  require('cookie-parser');
const sql =                     require('mysql');                       //Database ++
    const pgp =                     require('pg-promise');                  //Database ++
    const {MongoClient, ObjectID} = require('mongodb');                     //MongoDB (deconstructed)

const app = express();

var con = sql.createConnection({
  host: "localhost",
  user: "root",
  password: "123",
  database: "mainData"
});

con.connect(function(err){
  if(err){
    console.log('Error connecting to Db');
    return;
  }
  console.log('Connection established');
});

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
//         db.collection('Users').insertOne({                          //Insert user into database
//              username: req.body.uname,
//              password: req.body.upsw                                 //Must figure out how to add HASHED password
//         }, (err, result) => {
//             if (err){
//                  return console.log('Unable to insert', err);
//             }
//               console.log(JSON.stringify(result.ops, undefined, 2));  //Inserted documents
//         });
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
