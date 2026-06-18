const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

app.use(cors());
app.use(express.json());

const client = new MongoClient(process.env.MONGODB_URI, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    },
});

async function run() {
    try {
        await client.connect();

        const db = client.db("pethome");

        const petCollection = db.collection("pets");
        const adoptionRequestsCollection = db.collection("adoptionRequests");
        const usersCollection = db.collection("users");


        // =====================
        // PET ROUTES
        // =====================

        app.post("/pets", async (req, res) => {
            const pet = req.body;
            const result = await petCollection.insertOne(pet);
            res.send(result);
        });

        app.get("/pets", async (req, res) => {
            const result = await petCollection.find().toArray();
            res.send(result);
        });

        app.get("/pets/:id", async (req, res) => {
            const id = req.params.id;

            const result = await petCollection.findOne({
                _id: new ObjectId(id),
            });

            res.send(result);
        });

        // =====================
        // Adoption Request
        // =====================

        app.post("/adoption-requests", async (req, res) => {
            const request = {
                ...req.body,
                requestedDate: new Date()
            };

            const result = await adoptionRequestsCollection.insertOne(request);
            res.send(result);
        });


        app.get("/adoption-requests", async (req, res) => {
            const result = await adoptionRequestsCollection.find().toArray();
            res.send(result);
        });

        app.get("/adoption-requests/:email", async (req, res) => {
            const email = req.params.email;

            const result = await adoptionRequestsCollection
                .find({ userEmail: email })
                .toArray();

            res.send(result);
        });

        app.delete("/adoption-requests/:id", async (req, res) => {

            const id = req.params.id;

            const result = await adoptionRequestsCollection.deleteOne({
                _id: new ObjectId(id),
            });

            res.send(result);

        });






        await client.db("admin").command({ ping: 1 });
        console.log("MongoDB Connected 🚀");

    } catch (error) {
        console.log("DB Error:", error);
    }
}

run();


app.get("/", (req, res) => {
    res.send("Pet Home Server Running");
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});