const express = require('express');
const cors = require('cors');
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 3000;

// middleware
app.use(cors());
app.use(express.json())


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.p6rgmv3.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();
        const toyCarCollection = client.db('ToyCarDB').collection('ShopCategory');
        const AllToyCarCollection = client.db('ToyCarDB').collection('AllToyDB');
        const ReviewCollection = client.db('ToyCarDB').collection('reviews');

        app.get('/ShopCategory/:text', async (req, res) => {
            const text = req.params.text;
            if (text == "Sports Car" || text == "Police Car" || text == "Truck") {
                const result = await toyCarCollection.find({ category: text }).toArray();
                return res.send(result);

            }

            const result = await toyCarCollection.find({}).toArray();
            res.send(result);
        })

        app.get('/singleToy/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await toyCarCollection.findOne(query);
            res.send(result);
        })

        // All toy car Collection



        app.post('/allToy', async (req, res) => {
            const toy = req.body;
            const result = await AllToyCarCollection.insertOne(toy);
            res.send(result);
        })

        // query method
        app.get('/allToy', async (req, res) => {
            let query = {}
            if (req.query?.email) {
                query = { email: req.query.email }
                const result = await AllToyCarCollection.find(query).toArray();
                return res.send(result)

            }
            console.log(req.query)
            const result = await AllToyCarCollection.find().toArray();

            res.send(result);
        })

        app.get('/allToy/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await AllToyCarCollection.findOne(query);
            res.send(result);
        })
        // search api

        app.get('/allToy/:id', async (req, res) => {
            const searchText = req.params.id;
            const result = await AllToyCarCollection.find({
                $or: [
                    { title: { $regex: searchText, $options: "i" } },

                ],
            }).toArray();

            res.send(result);
        })


        // Delete method
        app.delete('/allToy/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await AllToyCarCollection.deleteOne(query);
            res.send(result);
        })

        // update method

        app.put('/allToy/:id', async (req, res) => {
            const id = req.params.id;
            const updateToy = req.body;
            const filter = { _id: new ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    price: updateToy.price,
                    quantity: updateToy.quantity,
                    description: updateToy.description
                },
            };
            const result = await AllToyCarCollection.updateOne(filter, updateDoc, options);
            res.send(result)
        })

        // reviews
        app.get('/reviews', async (req, res) => {
            const result = await ReviewCollection.find().toArray();
            return res.send(result)
        })

        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('TOY CAR SERVER IS RUNNING')
});

app.listen(port, () => {
    console.log(`toy car server is running on port:${port}`)
})