//Dependencies
const Joi = require('joi');
const express = require('express')
const path = require('path')
const bodyParser= require('body-parser')
const PORT = process.env.PORT || 8080

var urlencodedParser= bodyParser.urlencoded({extended: false});

const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: true
});

var app = express();

app
  .use(express.static(path.join(__dirname, 'public')))
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
  
  
  
  
  //**********************************/
app.get('/api/items', async (req, res) => {
  try {
    const client = await pool.connect()
    var result = await client.query('SELECT * FROM todo_table');   
   
    if (!result) {
      return res.send('No data found');
      }else{
      result.rows.forEach(row=>{
      console.log(row);
      }); 
      }

  res.send(result.rows);
  client.release();

  } catch (err) {
    console.error(err);
    res.send("Error " + err);
  }
});





//***********POST Request*************//
app.post('/api/items',urlencodedParser, async (req,res)=>{
 try {
   const client = await pool.connect();

   var result = await client.query("insert into todo_table values('"+req.body.user_name+"','"+req.body.task+"', "+req.body.complete+");");   
   if (!result) {
        return res.send("POST Failure");
      } else {
        console.log("successful");
      }
      res.send(result.rows);
      client.release();
    } catch (err) {
      console.error(err);
      res.send("Error " + err);
 }
});



//***********PUT Request*****to edit**********
app.put('/api/items',urlencodedParser, async (req,res)=>{
 try {
   const client = await pool.connect();
   var result = await client.query("UPDATE todo_table SET user_name='"+req.body.user_name+"', task='"+req.body.task+"',complete='"+req.body.complete+"' WHERE task='"+req.body.prev_t+"';");
     
   if (!result) {
        return res.send("PUT Failure");
      } else {
        console.log("successful");
      }
      res.send(result.rows);
      client.release();
    } catch (err) {
      console.error(err);
      res.send("Error " + err); 
 }
});



app.delete('/api/items',urlencodedParser, async (req,res)=>{
 try {
   const client = await pool.connect();
   var result = await client.query("DELETE FROM todo_table WHERE user_name='"+req.body.user_name+"' AND task='"+req.body.task+"'");
   
     
   if (!result) {
        return res.send("DELETION Failure");
      } else {
        console.log("successful");
      }
      res.send(result.rows);
      client.release();
    } catch (err) {
      console.error(err);
      res.send("Error " + err); 
 }
});




app.reset('/api/items',urlencodedParser, async (req,res)=>{
  try {
    const client = await pool.connect();
    var result = await client.query("DELETE FROM todo_table;");
    
      
    if (!result) {
         return res.send("RESET Failure");
       } else {
         console.log("successful");
       }
       res.send(result.rows);
       client.release();
     } catch (err) {
       console.error(err);
       res.send("Error " + err); 
  }
 });





app.get('/', (req, res) => res.render('pages/index'))
  .listen(PORT, () => console.log(`Listening on ${ PORT }`))
  




