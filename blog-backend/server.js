const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();

// Middlewares
app.use(cors());  // Engedélyezzük a CORS-t minden kéréshez
app.use(express.json());  // JSON típusú adatok fogadása

// Kapcsolódás MongoDB-hez
mongoose.connect('mongodb://localhost:27017/blog', { 
    useNewUrlParser: true, 
    useUnifiedTopology: true 
})
.then(() => console.log("MongoDB kapcsolat sikeres"))
.catch(err => console.log("Hiba a MongoDB kapcsolódásakor: ", err));

// Bejegyzés modell
const postSchema = new mongoose.Schema({
    title: String,
    summary: String,
    content: String
});

const Post = mongoose.model('Post', postSchema);

// API végpontok

// Bejegyzések lekérése (GET)
app.get('/api/posts', async (req, res) => {
    try {
        const posts = await Post.find();  // Lekérjük az összes bejegyzést
        res.json(posts);  // Visszaküldjük a bejegyzéseket JSON formátumban
    } catch (err) {
        console.error("Hiba történt a bejegyzések lekérésekor:", err);
        res.status(500).send("Hiba történt a bejegyzések lekérésekor");
    }
});

// Egy adott bejegyzés lekérése az ID alapján (GET)
app.get('/api/posts/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const post = await Post.findById(id);
        if (post) {
            res.json(post);
        } else {
            res.status(404).send("A bejegyzés nem található.");
        }
    } catch (err) {
        console.error("Hiba történt a bejegyzés lekérésekor:", err);
        res.status(500).send("Hiba történt a bejegyzés lekérésekor.");
    }
});

// Új bejegyzés hozzáadása (POST)
app.post('/api/posts', async (req, res) => {
    const { title, summary, content } = req.body;  // Az új bejegyzés adatai

    const newPost = new Post({ title, summary, content });

    try {
        await newPost.save();  // Mentés a MongoDB adatbázisba
        res.status(201).send("Bejegyzés sikeresen hozzáadva");
    } catch (err) {
        console.error("Hiba történt a bejegyzés hozzáadásakor:", err);
        res.status(400).send("Hiba történt a bejegyzés hozzáadásakor");
    }
});

// Bejegyzés frissítése (PUT)
app.put('/api/posts/:id', async (req, res) => {
    const { id } = req.params;
    const { title, summary, content } = req.body;

    try {
        const updatedPost = await Post.findByIdAndUpdate(
            id,
            { title, summary, content },
            { new: true }  // A módosított bejegyzést adja vissza
        );
        res.json(updatedPost);  // Visszaadjuk a frissített bejegyzést
    } catch (err) {
        console.error("Hiba történt a bejegyzés frissítésekor:", err);
        res.status(500).send("Hiba történt a bejegyzés frissítésekor");
    }
});

// Bejegyzés törlése (DELETE)
app.delete('/api/posts/:id', async (req, res) => {
    const { id } = req.params;

    try {
        await Post.findByIdAndDelete(id);  // A bejegyzés törlése az adatbázisból
        res.status(200).send("Bejegyzés sikeresen törölve");
    } catch (err) {
        console.error("Hiba történt a bejegyzés törlésekor:", err);
        res.status(500).send("Hiba történt a bejegyzés törlésekor");
    }
});

// Szerver indítása
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Szerver fut a ${PORT} porton`);
});
