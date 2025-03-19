const express = require('express');
const cors = require('cors');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;

//MIDDLEWARE
app.use(cors());
app.use(express.json());




const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.dwgzdef.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
console.log(uri);

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
    const reviewsCollection = client.db('reviewsBD').collection('reviews');

    app.get('/reviews', async (req, res) => {
        const cursor = reviewsCollection.find();
        const result = await cursor.toArray();
        console.log("Fetched Reviews:", result);
        res.send(result);
      })




    app.get("/myReviews", async (req, res) => {
    const email = req.query.email;
    const reviews = await reviewsCollection.find({ userEmail: email }).toArray();
    res.send(reviews);
});

app.get('/reviews/:id', async (req, res) => {
  const id = req.params.id;
  const query = { _id: new ObjectId(id) }
  const result = await reviewsCollection.findOne(query);
  res.send(result);
})


app.put("/reviews/:id", async (req, res) => {
    const id = req.params.id;
    const filter = {_id:new ObjectId(id)}
    const options = {upsert:true};
    const updatedReview = req.body;
    const review = {
        $set:{
            gameCoverImage:updatedReview.gameCoverImage,
            gameTitle:updatedReview.gameTitle,
            reviewDescription:updatedReview.reviewDescription,
            rating:updatedReview.rating, 
            publishingYear:updatedReview.publishingYear, 
            genres:updatedReview.genres
        }
    }
    const result = await reviewsCollection.updateOne(filter,review,options);
    res.send(result);
});

app.delete("/reviews/:id", async (req, res) => {
    const id = req.params.id;
    const result = await reviewsCollection.deleteOne({ _id: new ObjectId(id) });
    res.send(result);
});







    app.post('/reviews', async (req, res) => {
        const newreviews = req.body;
        console.log(newreviews);
        const result = await reviewsCollection.insertOne(newreviews);
        res.send(result)
      })


    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    //await client.close();
  }
}
run().catch(console.dir);


app.get('/',(req,res)=>{
    res.send('server is running')
})

app.listen(port,()=>{
    console.log(`server is runnig on port:${port}`);
})
