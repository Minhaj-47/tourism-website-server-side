const express = require("express");
const cors = require("cors");
const { MongoClient } = require("mongodb");
const ObjectId = require("mongodb").ObjectId;
const app = express();
require("dotenv").config();
const port = process.env.PORT || 4000;
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_Pass}@cluster0.id9nc.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run() {
  try {
    await client.connect();
    const database = client.db("TourismData");
    const services = database.collection("Services");
    const addedServiceCollection = database.collection("selectedService");

    // get api
    app.get("/services", async (req, res) => {
      const cursor = services.find({});
      const result = await cursor.toArray();
      res.json(result);
    });
    // add service
    app.post("/addService", async (req, res) => {
      const result = await services.insertOne(req.body);
      console.log(result);
    });
    // find choosed service for specific user
    app.get("/service/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await services.findOne(query);
      res.json(result);
    });
    //get all services of current user
    app.get("/userservices/:email", async (req, res) => {
      console.log(req.params.email);
      const result = await addedServiceCollection
        .find({
          email: req.params.email,
        })
        .toArray();
      res.json(result);
    });
    //get all services of all user
    app.get("/userservices/", async (req, res) => {
      const result = await addedServiceCollection.find({}).toArray();
      res.json(result);
    });

    // delete event

    app.delete("/deleteService/:id", async (req, res) => {
      console.log(req.params.id);
      const result = await addedServiceCollection.deleteOne({
        _id: ObjectId(req.params.id),
      });
      res.send(result);
    });
    // post a selected service to database
    app.post("/selectedService", async (req, res) => {
      const result = await addedServiceCollection.insertOne(req.body);
      res.send(result);
    });

    //UPDATE status
    app.put("/selectedService/:id", async (req, res) => {
      const id = req.params.id;
      const updatedService = req.body;
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          status: updatedService.status,
        },
      };
      const result = await addedServiceCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      console.log("updating", id);
      res.json(result);
    });
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("This is node server");
});

app.listen(port, () => {
  console.log("server is running at port", port);
});
