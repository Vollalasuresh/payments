const express=require('express');
const path= require('path');
const mysql=require('mysql');
const bodyparser=require('body-parser');
const dotenv=require('dotenv').config();


const connection= mysql.createConnection({
    host     : 'localhost',
    user     : process.env.U,
    password : process.env.P,  
    database:    'pay',
    dateStrings: 'true'
})
const app= express();
//connecting to database
connection.connect((err)=>
{
    if(err)

    {
            console.log("Error Connecting to db",err);
    }
    else
    {
            console.log("connected to db");
    }
})

app.use(bodyparser.urlencoded({extended:true}));
app.use(express.static(path.join(__dirname+'/public/')));

//creates the databse
app.get('/',(req,res)=>
{

    let sql='CREATE DATABASE pay';
    connection.query(sql,(err,result)=>
    {
        if(err)
        throw err;
        else
        {
            console.log(result);
        }
        
    })
    res.send('DataBase Created')
})
//creates user table
app.get('/user',(req,res)=>
{
    
    sql='CREATE TABLE user (id int AUTO_INCREMENT , name varchar(20),PRIMARY KEY(id))';
            connection.query(sql,(err,result)=>
            {
                if(err)
                throw err
            })
            res.send('user table created')
})
//sends users details to user table
app.post('/user',(req,res)=>
{
    var post={ name:req.body.name}
     var sql= 'INSERT INTO user SET ?'
     connection.query(sql,post,(e,s)=>
     {
         if(e)
         throw e;
         else
         res.send(s)

     })
})
//updates the user details with id
app.put('/users/:id',(req,res)=>
{
    sql=`UPDATE user SET name='${req.body.name}' WHERE id=${req.params.id};`
    connection.query(sql,(e,s)=>
    {
        if (e)
        throw e;
        else
        res.send(s)
    }) 
})
//delete user with specified id
app.delete('/user/:id',(req,res)=>
{
    sql=`DELETE FROM user where id=${req.params.id};`
    connection.query(sql,(e,s)=>
    {
        if(e)
        throw e;
        else
        res.send(s)
    })
})
//retrives user list
app.get('/users',(req,res)=>
{
    sql=`SELECT * FROM user;`;
    connection.query(sql,(e,s)=>
    {
        if(e)
        throw e;
        else
        res.send(s);
    })
})
//creates payments table
app.get('/payment',(req,res)=>
{
    sql= `CREATE TABLE payments(pid int AUTO_INCREMENT, amount int, paidon DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,cid int NOT NULL,PRIMARY KEY(pid))`;
    q= 'ALTER TABLE payments ADD CONSTRAINT FK_cid FOREIGN KEY(cid) REFERENCES user(id)'
    connection.query(sql,(e,s)=>
    {
        if (e)
        throw e;
        else
        {
            connection.query(q,(er,rs)=>
            {
                if(er)
                throw er;   
            })
            res.send(s)
        }  
    })
})
//sends payment details to databse
app.post('/payment',(req,res)=>
{
    data={amount:req.body.amount,cid:req.body.id}
    sql= 'INSERT INTO payments SET ?';
    connection.query(sql,data,(e,s)=>
    {
        if(e) 
        throw e;
        else
        res.send(s);
    })
})
//generates complete reports
app.get('/reports/list',(req,res)=>
{
    q=`SELECT user.name AS name, payments.amount AS amount, payments.paidon AS date FROM user JOIN payments ON user.id=payments.cid`;
    connection.query(q,(e,s)=>
    {
        if(e)
        throw e;
        else
        {
            res.send(s);
        }
    })
})
//generated reports as per userid
app.get('/reports/:user',(req,res)=>
{
    console.log(req.params.user);
    sql=`SELECT u.name,p.count,p.sum
    FROM user u
    INNER JOIN (
    SELECT cid,COUNT(*) AS count,
    SUM(amount) AS sum
    FROM payments 
    WHERE cid=${req.params.user} GROUP BY cid ) p
    ON u.id=p.cid;`;

    connection.query(sql,(e,s)=>
    {
        if(e)
        throw e;
        else
        console.log(s);
        res.send(s);
    })
})

// Generates report by date
app.get('/reports/bydate/:d',(req,res)=>
{
    s=`SELECT DATE(paidon) AS date , SUM(amount)AS amount, COUNT(amount) as count FROM payments WHERE DATE(paidon)='${req.params.d}' GROUP BY date; `;
    connection.query(s,(e,s)=>
    {
        if(e)
        throw e;
        else
        console.log(s);
        res.send(s);
    })
})
app.listen(process.env.PORT,()=>console.log("At 3000"));


