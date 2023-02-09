const express =  require('express');
const mysql = require ('mysql');
const bodyParser = require('body-parser');

const app = express();

  

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing 


// Connect to the database
const connection = mysql.createConnection({
    host: 'host',
    user: 'user',
    password: 'pass',
    database: 'database'
  });
  //connection.connect();

  app.post('/api/generate-sequence', (req, res) => {
    const prefix = req.body.prefix;


    try {
  
    connection.query('SELECT ref FROM GENERATE_REF ORDER BY ref DESC LIMIT 1', (err, results) => {
      if (err) {
        return res.status(500).send({ error: 'Error retrieving the latest sequence value' });
      }
  
      let latestValue = results[0].ref;
  
      const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      const alphabetIndex = letters.indexOf(latestValue[4]);
      const numberPart = parseInt(latestValue.slice(5), 10);
  
      if (numberPart === 999) {
        if (alphabetIndex === 25) {
          return res.status(400).send({ error: 'Maximum limit reached' });
        }
  
        latestValue = prefix + letters[alphabetIndex + 1] + '001';
      } else {
        latestValue = prefix + latestValue[4] + ('000' + (numberPart + 1)).slice(-3);
      }
  
      connection.query('INSERT INTO GENERATE_REF (ref, dateCreated) VALUES (?, NOW())', [latestValue], (err) => {
        if (err) {
          return res.status(500).send({ error: 'Error updating the latest sequence value' });
        }
  
        res.send({ code:200, reference: latestValue });
      });
    });
        } catch (err) { 
            return res.status(500).send(err);
             
        }    

  });
  
  app.listen(3000, () => {
    console.log('API listening on port 3000');
  });
