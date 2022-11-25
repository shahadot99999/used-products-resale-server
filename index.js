const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
 require('dotenv').config();
const port = process.env.PORT || 5000;

const app = express();

//middleware

app.use(cors());
app.use(express.json());


 const uri= `mongodb://${process.env.DB_USER}:${process.env.DB_PASSWORD}@ac-cisbqkw-shard-00-00.65jgjko.mongodb.net:27017,ac-cisbqkw-shard-00-01.65jgjko.mongodb.net:27017,ac-cisbqkw-shard-00-02.65jgjko.mongodb.net:27017/?ssl=true&replicaSet=atlas-13nlcj-shard-0&authSource=admin&retryWrites=true&w=majority`



//var  uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@mangoodbfirstproject.65jgjko.mongodb.net/test`;
console.log(uri);


const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
// MongoClient.connect(uri, function (err, client) {
//     const collection = client.db("test").collection("devices");
//     client.close();

async function run(){
    try{
        const appointmentOptionCollection = client.db('resaleproduct').collection('appleservices');

        app.get('/appleservices', async(req, res)=>{
           // console.log(appleservices);
            const query={};
            const optiions= await appointmentOptionCollection.find(query).toArray();
            res.send(optiions)
        })
    }
    finally{

    }
}
run().catch(console.log)


app.get('/', async (req, res) => {
    res.send('Used Products Resale server is running');
})

app.listen(port, () => console.log(`Used Products Resale running on ${port}`))

