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
        const bookingCollection = client.db('resaleproduct').collection('bookings');
        const appointmentOptionCollection1 = client.db('resaleproduct').collection('xiaomiservices');
        const appointmentOptionCollection2 = client.db('resaleproduct').collection('oneplusservice');


         app.get('/bookings', async(req, res)=>{
            const email = req.query.email;
            const query = {email: email};
            const bookings = await bookingCollection.find(query).toArray();
            res.send(bookings);
         })

        app.post('/bookings', async(req, res)=>{
            const booking = req.body
            //console.log(booking);
            const result = await bookingCollection.insertOne(booking);
            res.send(result);
        })
        
        app.get('/appleservices', async(req, res)=>{
           // console.log(appleservices);
           const date = req.query.date;
           //console.log(date);
            const query={};
            const optiions= await appointmentOptionCollection.find(query).toArray();
           
            //booking prov
            const bookingQuery = {booking: date}
            const alreadyBooked= await bookingCollection.find(bookingQuery).toArray();
           
            //code carefully
            optiions.forEach(optiion =>{
                const optiionBooked = alreadyBooked.filter(book => book.title=== optiion.title
                    );
                    const bookedSlots = optiionBooked.map(book=>book.slot)
                   const remainingSlots = optiion.slots.filter(slot=> !bookedSlots.includes(slot))
                   optiion.slots= remainingSlots; 
                   console.log(optiion.title, remainingSlots.length)
            })
            res.send(optiions)
        })

        app.get('/xiaomiservices', async(req, res)=>{
            // console.log(appleservices);
             const query={};
             const optiions= await appointmentOptionCollection1.find(query).toArray();
             res.send(optiions)
         })

         app.get('/oneplusservice', async(req, res)=>{
            // console.log(appleservices);
             const query={};
             const optiions= await appointmentOptionCollection1.find(query).toArray();
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

