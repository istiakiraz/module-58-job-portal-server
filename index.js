const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()


const app = express();

const port = process.env.PORT || 3000;

//middleware

app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.un5m5dm.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: false,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();



    //collection
    const jobsCollection = client.db('jobsPortal').collection('jobs');
    const applicationCollection = client.db('jobsPortal').collection('application')



    // jobs api 
    // app.get('/jobs', async(req, res)=>{
    //     const cursor = jobsCollection.find();
    //     const result = await cursor.toArray();

    //     res.send(result)
    // });


    await jobsCollection.createIndex({ title: "text" });

    app.get('/jobs', async (req, res) => {

      const search = req.query.search || '';
      const category = req.query.category || '';

      const email = req.query.email
      
      const query = {};

      if(email){
        query.hr_email = email
      }

      if (search) {
        query.$text = { $search: search };
      }

      if (category) {
        query.category = category;
      }

      



      const result = await jobsCollection.find(query).toArray();
      res.send(result);

    });

    // could be done but should not be done
    // app.get('/jobByEmail', async (req, res) => {
    //   const email = req.query.email;

    //   const query = { hr_email: email }

    //   const result = await jobsCollection.find(query).toArray();
    //   res.send(result)

    // })


    app.get('/jobs/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }

      const result = await jobsCollection.findOne(query);
      res.send(result)

    })

    app.post('/jobs', async (req, res) => {
      const newJob = req.body;
      // console.log(newJob);
      const result = await jobsCollection.insertOne(newJob);
      res.send(result)


    })



    // job application related Api 

    app.get('/applications', async (req, res) => {
      const email = req.query.email;

      const query = {
        applicant: email
      }

      const result = await applicationCollection.find(query).toArray()
      res.send(result)

    })




    app.post('/applications', async (req, res) => {

      const application = req.body;
      // console.log(application);
      const result = await applicationCollection.insertOne(application);

      res.send(result);

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
  res.send('jobs are ready')
})

app.listen(port, () => {
  console.log(`jobs portal sever on port ${port} `);
})