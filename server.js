const express = require('express')
const app = express()
const MongoClient = require('mongodb').MongoClient
const PORT = 2121
require('dotenv').config()


//Database
let db,
    dbConnectionStr = process.env.DB_STRING,
    dbName = 'todo'


MongoClient.connect(dbConnectionStr, { useUnifiedTopology: true })
    .then(client => {
        console.log(`Connected to ${dbName} Database`)
        db = client.db(dbName)
    })


//Server
app.set('view engine','ejs')
app.use(express.static('public'))
app.use(express.urlencoded({ extendend: true}))
app.use(express.json())


app.get('/',async (request, response)=>{
    const todoItems = await db.collection('todolist').find().toArray()
    const itemsLeft = await db.collection('todolist').countDocuments({completed: false})
    response.render('index.ejs', {items: todoItems, left: itemsLeft})
    // db.collection('todolist').find().toArray()
    // .then(data => {
    //     response.render('index.ejs', { items: data})
    // })
    // .catch(error => console.error(error))
})

app.post('/addItem', (request, response) => {
    db.collection('todolist').insertOne({thing: request.body.itemName, completed: false})
    .then(result => {
        console.log('Item Added')
        response.redirect('/')
    })
    .catch(error => console.error(error))
})

app.put('/markComplete', (request, response) =>{
    db.collection('todolist').updateOne({thing: request.body.itemNameS},{
        $set: {
            completed : true
        }
    },{
        sort: {_id: -1},
        upsert: false
    })
    .then(result =>{
        console.log('Marked Complete');
        response.json('Mark Complete')
    })
    .catch(error => console.error(error))
    
})

app.put('/markUnComplete', (request, response) =>{
    db.collection('todolist').updateOne({thing: request.body.itemNameS},{
        $set: {
            completed : false
        }
    },{
        sort: {_id: -1},
        upsert: false
    })
    .then(result =>{
        console.log('Marked Complete');
        response.json('Mark Complete')
    })
    .catch(error => console.error(error))
    
})

app.delete('/deleteItem', (request, response) =>{
    db.collection('todolist').deleteOne({thing: request.body.itemNameS})
    .then(result =>{
        console.log('Item deleted');
        response.json('Item Deleted')
    })
    .catch(error => console.error(error))
})

//PORT listening
app.listen(process.env.PORT || PORT, ()=>{
    console.log(`Server running on port ${PORT}`);
})