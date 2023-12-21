const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Server is Running");
});

const uri = `mongodb+srv://${process.env.DB_User}:${process.env.DB_Pass}@cluster0.sw3jgjt.mongodb.net/?retryWrites=true&w=majority`;
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    },
});

async function run() {
    try {
        // await client.connect();
        const phonesCollection = client.db("mobileShopDb").collection("phones");

        //All phones api including filtering functionality
        app.get("/phones", async (req, res) => {
            const queryObj = {};

            const minPrice = parseFloat(req.query.minPrice);
            const maxPrice = parseFloat(req.query.maxPrice);
            const OS = req.query.OS;
            const type = req.query.type;
            const memory = req.query.memory;
            const processor = req.query.processor;
            const name = req.query.name;
            const sortOrder = req.query.sortOrder;
            const sortObj = {};

            if (OS) {
                queryObj.OS = OS;
            }
            if (type) {
                queryObj.type = type;
            }
            if (memory) {
                queryObj.memory = memory;
            }
            if (processor) {
                queryObj.processor = processor;
            }
            if (name) {
                queryObj.name = { $regex: name, $options: "i" };
            }
            if (!isNaN(minPrice)) {
                queryObj.price = { $gte: minPrice };
            }

            if (!isNaN(maxPrice)) {
                if (queryObj.price) {
                    queryObj.price.$lte = maxPrice;
                } else {
                    queryObj.price = { $lte: maxPrice };
                }
            }

            if (sortOrder) {
                sortObj.price = sortOrder;
            }
            const cursor = phonesCollection.find(queryObj).sort(sortObj);
            const result = await cursor.toArray();
            res.send(result);
        });

        // Single phone api
        app.get("/phones/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await phonesCollection.findOne(query);
            res.send(result);
        });

        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
