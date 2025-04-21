import FormData from "form-data"; // form-data v4.0.1
import Mailgun from "mailgun.js"; // mailgun.js v11.1.0
import express from 'express';
import cors from 'cors';
import { MongoClient, ServerApiVersion } from 'mongodb';
import dotenv from 'dotenv';
import { ObjectId } from 'mongodb';
dotenv.config(); // Cargar variables de entorno desde el archivo .env
const uri = process.env.MONGO_URI; // URI de conexión a MongoDB Atlas
const db = process.env.DATABASE_NAME;
const col = process.env.COLLECTION_NAME;

const app = express();
app.use(express.json()); // Middleware para parsear el cuerpo de las solicitudes JSON

const port = process.env.PORT || 3000;

const allowedOrigins = [ // Lista de orígenes permitidos
  'http://localhost:4200',
  'https://fabianmaes.github.io',
  'https://fabianmaes.github.io/cihuatl-michin'
]; 


app.use(cors({
  origin: function (origin, callback) {
    // Permitir solicitudes sin origen (como las de herramientas de desarrollo)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  }
}));

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

// Definir la base de datos y la colección

let blogsCollection = client.db(db).collection(col)

let projection_preview = { title: 1, author: 1, tags: 1, views: 1, likes: 1, summary: 1, updatedAt: 1, createdAt: 1 };

// Conectar al servidor de la base de datos
const connectToDatabase = async () => {   
  try { // Conectar al servidor de la base de datos
    await client.connect();
    console.log("Connected to the database");
  } catch (error) {
    console.error("Error connecting to the database: ", error);
  }
};

app.get('/blogs_preview', async (req, res) => {

    try { // Obtener todos los blogs
    let response = await blogsCollection.find({}, { projection: projection_preview }).toArray();
    res.send(response);

  } catch (error) {
    console.error("Error fetching blogs: ", error);
    res.status(500).send("Error fetching blogs");
  }
});


app.get('/blog/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const objectId = new ObjectId(id);

    // Incrementa el contador y devuelve el documento actualizado
    const response = await blogsCollection.findOneAndUpdate(
      { _id: objectId },
      { $inc: { views: 1 } },
      { returnDocument: 'after' } // Devuelve el documento ya actualizado
    );

    if (!response) {
      return res.status(404).send("Blog no encontrado");
    }

    res.send(response);
  } catch (error) {
    console.error("Error fetching blog:", error);
    res.status(500).send("Error fetching blog");
  }
});



app.get("/tags", async (req, res) => {
  try {
    // Obtener todos los tags
    let response = await blogsCollection
      .aggregate([
        { $unwind: "$tags" },
        { $group: { _id: "$tags", total: { $count: {} } } },
        { $sort: { total: -1 } },
      ])
      .toArray();
    res.send(response);
  } catch (error) {
    console.error("Error fetching tags: ", error);
    res.status(500).send("Error fetching tags");
  }
});

app.get("/authors", async (req, res) => {
  try {
    // Obtener todos los autores
    let response = await blogsCollection
      .aggregate([
        {
          $group: {
            _id: "$author.name",
            total: { $count: {} },
          },
        },
        { $sort: { total: -1 } },
      ])
      .toArray();

    res.send(response);
  } catch (error) {
    console.error("Error fetching authors: ", error);
    res.status(500).send("Error fetching authors");
  }
});


// Like can be true or false
app.post("/like/:id/:like", async (req, res) => {
  try {
    const id = req.params.id;
    const like = req.params.like
    const objectId = new ObjectId(id);

    // Incrementa el contador y devuelve el documento actualizado
    const response = await blogsCollection.findOneAndUpdate(
      { _id: objectId },
      { $inc: { likes: like == "true" ? 1 : -1 } },
      { returnDocument: 'after' } // Devuelve el documento ya actualizado
    );

    if (!response) {
      return res.status(404).send("Blog no encontrado");
    }

    res.send(response);
  } catch (error) {
    console.error("Error liking blog:", error);
    res.status(500).send("Error liking blog");
  }
});

app.post("/send-email", async (req, res) => {
  const message = req.body.message;
  const subject = req.body.subject;
  const email = req.body.email;
  const name = req.body.name;

  const mailgun = new Mailgun(FormData);
  const mg = mailgun.client({
    username: "api",
    key: process.env.API_KEY || "API_KEY",
  });
  try {
    const data = await mg.messages.create("sandbox9168942ef827478d8b03c72d80eab3b3.mailgun.org", {
      from: "Mailgun Sandbox <postmaster@sandbox9168942ef827478d8b03c72d80eab3b3.mailgun.org>",
      to: [process.env.EMAIL_TO],
      subject: subject,
      html: `
  <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: auto;">
    <h2 style="color: #1D6D79;">📩 Nuevo mensaje del formulario de contacto</h2>
    <p><strong>👤 Nombre:</strong> ${name}</p>
    <p><strong>📧 Correo:</strong> <a href="mailto:${email}">${email}</a></p>
    <hr style="border: none; border-top: 1px solid #ccc; margin: 20px 0;">
    <p><strong>📝 Mensaje:</strong></p>
    <p style="white-space: pre-line;">${message}</p>
  </div>
`
    });
    console.log("Email de " + name + " enviado. Mensaje: ", message); // logs the response from Mailgun
    res.send(data);
  } catch (error) {
    console.log("Error al enviar el correo: ", error); // logs any error
    res.status(500).send("Error al enviar el correo");
  }
});

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, async () => {
  console.log(`Server is running on http://localhost:${port}`);
  await connectToDatabase();
});
