const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

const USERS_FILE = path.join(__dirname, 'users.json');

function readUsers() {
  try {
    const data = fs.readFileSync(USERS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    return [];
  }
}

function writeUsers(users) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

app.post('/login', async (req, res) => {
  const { name, email, password } = req.body;
  console.log('Tentative de connexion :', name, email);
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Nom, email et mot de passe requis' });
  }
  const cleanEmail = email.trim().toLowerCase();
  const cleanName = name.trim();
  let users = readUsers();
  let user = users.find(u => u.email.trim().toLowerCase() === cleanEmail);

  if (!user) {
    const hash = await bcrypt.hash(password, 10);
    user = { name: cleanName, email: cleanEmail, password: hash };
    users.push(user);
    writeUsers(users);
    console.log('Nouvel utilisateur inscrit :', user);
    return res.json({ success: true, user: { name: user.name, email: user.email } });
  } else {
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: 'Mot de passe incorrect' });
    }
    console.log('Utilisateur existant connecté :', user);
    return res.json({ success: true, user: { name: user.name, email: user.email } });
  }
});

app.get('/', (req, res) => {
  res.send('Serveur Node.js pour RéZa fonctionne !');
});

app.listen(PORT, () => {
  console.log(`Serveur Node.js lancé sur http://localhost:${PORT}`);
});
