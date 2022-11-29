const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');
 require('dotenv').config();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

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

function verifyJWt(req, res, next){
    console.log('token inside verifyJWt', req.headers.authorization);
    const authHeader = req.headers.authorization;
    if(!authHeader){
        return res.status(401).send('unauthorized access');
    }
    const token = authHeader.split(' ')[1];

    jwt.verify(token, process.env.ACCESS_TOKEN, function(err, decoded){
        if(err){
            return res.status(403).send({message: 'forbidden access'})
        }
        req.decoded = decoded;
        next();
    })
}

async function run(){
    try{
        
        const appointmentOptionCollection = client.db('resaleproduct').collection('appleservices');
        const bookingCollection = client.db('resaleproduct').collection('bookings');
        const usersCollection = client.db('resaleproduct').collection('users');
        const productsCollection = client.db('resaleproduct').collection('products');

        const appointmentOptionCollection1 = client.db('resaleproduct').collection('xiaomiservices');
        const appointmentOptionCollection2 = client.db('resaleproduct').collection('oneplusservice');


         app.get('/bookings', verifyJWt, async(req, res)=>{
            const email = req.query.email;
            //console.log(req.headers.authorization);

            const decodedEmail = req.decoded.email;
            if(email !== decodedEmail){
                return res.status(403).send({message: 'forbidden access'})
            }

            const query = {email: email};
            const bookings = await bookingCollection.find(query).toArray();
            res.send(bookings);
         })

         app.get('/bookings/:id', async(req, res)=>{
            const id = req.params.id;
            const query = {_id: ObjectId(id)};
            //console.log('hello',id);
            const booking = await bookingCollection.findOne(query);
            res.send(booking);
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
             const optiions= await appointmentOptionCollection2.find(query).toArray();
             res.send(optiions)
         });


        //  app.post('/create-payment-intent', async (req, res) => {
        //     const booking = req.body;
         
        //     const price = booking.price;
        //     const amount = price * 100;
          

        //     const paymentIntent = await stripe.paymentIntents.create({
        //         currency: 'usd',
        //         amount: amount,
        //         "payment_method_types": [
        //             "card"
        //         ]
        //     });     
        //     res.send({
        //         clientSecret: paymentIntent.client_secret,
        //     });
         
        // });

         app.get('/jwt', async (req, res) => {
            const email = req.query.email;
           // console.log(email);
            const query = { email: email };
           // console.log('find',query)
            const user = await usersCollection.findOne(query);
            //console.log(user)
             //res.send({accessToken : 'token'})
            if (user) {
                const token = jwt.sign({ email }, process.env.ACCESS_TOKEN, { expiresIn: '1d' })
                return res.send({ accessToken: token });
            }
            res.status(403).send({ accessToken: '' })
        });


        app.get('/users', async(req, res)=>{
            const query={};
            const users = await usersCollection.find(query).toArray();
            res.send(users);
        })

        app.get('/users/admin/:email', async (req, res)=>{
            const email = req.params.email;
            const query = {email}
            const user = await usersCollection.findOne(query);
            res.send({isAdmin: user?.role === 'admin'})
        })
     
         app.post('/users', async(req, res)=>{
            const user = req.body;
            console.log(user);
            const result = await usersCollection.insertOne(user);
            res.send(result);
        })

        app.put ('/users/admin/:id',verifyJWt, async(req, res)=>{
         
            //jwt token 
            const decodedEmail = req.decoded.email;
            const query = {email: decodedEmail};
            const user = await usersCollection.findOne(query);

            if(user?.role !=='admin'){
                return res.status(403).send({message: 'forbidden access'})
            }
 

            const id = req.params.id;
            const filter = {_id: ObjectId(id)}
            const optiions = {upsert : true};
            const updateDoc = {
                $set: {
                    role: 'admin'
                }
            }
            const result = await usersCollection.updateOne(filter, updateDoc, optiions);
            res.send(result);
        })

    

        app.get('/products', async(req, res)=>{
            const query = {};
            const products = await productsCollection.find(query).toArray();
            res.send(products);
        })

        app.post('/products', async(req, res)=>{
            const product = req.body;
            const result = await productsCollection.insertOne(product);
            res.send(result);
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

