const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const { createRemoteJWKSet, jwtVerify } = require("jose-cjs");

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

const JWKS = createRemoteJWKSet(new URL(`${process.env.CLIENT_URL}/api/auth/jwks`));

const verifyToken = async (req, res, next) => {
    const authHeader = req?.headers?.authorization;
    if (!authHeader) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    const token = authHeader.split(" ")[1];
    if (!token) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    try {
        const { payload } = await jwtVerify(token, JWKS);
        req.user = payload;
        next();
    } catch (error) {
        return res.status(403).json({ message: error.message });
    }
};

async function run() {
    try {

        const db = client.db("pethome");

        const petCollection = db.collection("pets");
        const adoptionRequestsCollection = db.collection("adoptionRequests");

        // =====================
        // PET ROUTES
        // =====================

        app.post("/pets", verifyToken, async (req, res) => {
            const pet = req.body;
            const result = await petCollection.insertOne(pet);
            res.send(result);
        });

        app.get("/pets", async (req, res) => {
            const search = req.query.search;
            const species = req.query.species;

            const query = {};

            if (search) {
                query.petName = {
                    $regex: search,
                    $options: "i",
                };
            }

            if (species) {
                query.species = {
                    $in: [species],
                };
            }

            const pets = await petCollection.find(query).toArray();

            res.send(pets);
        });

        app.get("/pets/:id", verifyToken, async (req, res) => {
            const id = req.params.id;

            const pet = await petCollection.findOne({
                _id: new ObjectId(id),
            });

            res.json(pet);
        });

        app.patch("/pets/:id", verifyToken, async (req, res) => {
            const id = req.params.id;

            const updatedData = req.body;

            const result = await petCollection.updateOne(
                { _id: new ObjectId(id) },
                {
                    $set: updatedData,
                }
            );

            res.json(result);
        });

        app.delete("/pets/:id", verifyToken, async (req, res) => {
            const id = req.params.id;

            const result = await petCollection.deleteOne({
                _id: new ObjectId(id),
            });

            res.json(result);
        });

        // =====================
        // Adoption Request
        // =====================

        app.post("/adoption-requests", verifyToken, async (req, res) => {
            const request = req.body;
            const result = await adoptionRequestsCollection.insertOne(request);
            res.send(result);
        });

        app.get("/adoption-requests", verifyToken, async (req, res) => {
            const email = req.query.email;

            const result = await adoptionRequestsCollection
                .find({ userEmail: email })
                .toArray();

            res.send(result);
        });

        app.get("/my-listings/:email", verifyToken, async (req, res) => {
            const email = req.params.email;

            const result = await petCollection.find({ ownerEmail: email }).toArray();

            res.send(result);
        });

        app.delete("/adoption-requests/:id", verifyToken, async (req, res) => {
            const id = req.params.id;

            const result = await adoptionRequestsCollection.deleteOne({
                _id: new ObjectId(id),
            });

            res.send(result);
        });

        app.get("/my-requests", verifyToken, async (req, res) => {
            const email = req.query.email;

            const result = await adoptionRequestsCollection
                .find({ userEmail: email })
                .toArray();

            res.send(result);
        });

        app.get("/owner-requests", verifyToken, async (req, res) => {
            const email = req.query.email;

            const result = await adoptionRequestsCollection
                .find({ ownerEmail: email })
                .toArray();

            res.send(result);
        });

        app.patch("/adoption-requests/:id/status", verifyToken, async (req, res) => {
            const { id } = req.params;
            const { status, petId } = req.body;

            const result = await adoptionRequestsCollection.updateOne(
                { _id: new ObjectId(id) },
                {
                    $set: { status },
                }
            );

            if (status === "Approved") {
                await petCollection.updateOne(
                    { _id: new ObjectId(petId) },
                    {
                        $set: {
                            adopted: true,
                        },
                    }
                );
            }

            res.send(result);
        });


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
