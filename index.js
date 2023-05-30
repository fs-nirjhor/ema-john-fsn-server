const express = require("express");
const app = express();
const port = 4000;

const cors = require("cors");
const bodyParser = require("body-parser");

require("dotenv").config();

const { MongoClient, ServerApiVersion } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@ema-john-fsn.vtgpom3.mongodb.net/emaJohnData?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.send("Ema-John-FSN Server");
});

async function run() {
  try {
    client.connect();
    const productsCollection = client.db("emaJohnData").collection("products");
    const ordersCollection = client.db("emaJohnData").collection("orders");
    // add all products
    app.post("/addProduct", async (req, res) => {
      const newProduct = req.body;
      const result = await productsCollection.insertMany(newProduct);
      console.log(result);
      res.send(result);
    });
    // get limited products
    app.get("/products", async (req, res) => {
      const search = req.query.search;
      const result = await productsCollection.find({name: {$regex: search} }).limit(20).toArray();
      res.send(result);
    });
    // get single product
    app.get("/products/:key", async (req, res) => {
      const product = { key: req.params.key };
      const result = await productsCollection.find(product).toArray();
      console.log(result);
      res.send(result[0]);
    });
    // get some products
    app.post("/reviewProducts", async (req, res) => {
      const productKeys = req.body;
      result = await productsCollection
        .find({ key: { $in: productKeys } })
        .toArray();
      console.log(result);
      res.send(result);
    });
    // place order
    app.post("/addOrder", async (req, res) => {
      const newOrder = req.body;
      const result = await ordersCollection.insertOne(newOrder);
      console.log(result);
      res.send(result);
    });
    
  } finally {
    await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () => console.log("Server started on http://localhost:4000"));
