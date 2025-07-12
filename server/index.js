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
const ROOMS_FILE = path.join(__dirname, 'rooms.json');
const RESERVATIONS_FILE = path.join(__dirname, 'reservations.json');

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

function readRooms() {
  try {
    const data = fs.readFileSync(ROOMS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    return [];
  }
}

function writeRooms(rooms) {
  fs.writeFileSync(ROOMS_FILE, JSON.stringify(rooms, null, 2));
}

function readReservations() {
  try {
    const data = fs.readFileSync(RESERVATIONS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    return [];
  }
}

function writeReservations(reservations) {
  fs.writeFileSync(RESERVATIONS_FILE, JSON.stringify(reservations, null, 2));
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

// Récupérer toutes les salles
app.get('/rooms', (req, res) => {
  try {
    const rooms = readRooms();
    console.log('Récupération des salles :', rooms.length, 'salles trouvées');
    res.json({ success: true, rooms });
  } catch (error) {
    console.error('Erreur lors de la récupération des salles :', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des salles' });
  }
});

// Créer une nouvelle salle
app.post('/rooms', (req, res) => {
  try {
    console.log('Body reçu pour création de salle (DEBUG):', JSON.stringify(req.body));
    const { name, capacity, equipment, customEquipment, description, floor, creatorName, creatorEmail } = req.body;
    
    if (!name || !capacity) {
      return res.status(400).json({ message: 'Nom et capacité requis' });
    }

    const rooms = readRooms();
    const newRoom = {
      id: Date.now().toString(),
      name: name.trim(),
      capacity: capacity.trim(),
      equipment: equipment || [],
      customEquipment: customEquipment || [],
      description: description ? description.trim() : undefined,
      floor: floor || undefined,
      creatorName: creatorName || undefined,
      creatorEmail: creatorEmail || undefined,
      createdAt: new Date().toISOString()
    };

    rooms.push(newRoom);
    writeRooms(rooms);
    
    console.log('Nouvelle salle créée :', newRoom.name);
    res.json({ success: true, room: newRoom });
  } catch (error) {
    console.error('Erreur lors de la création de la salle :', error);
    res.status(500).json({ message: 'Erreur lors de la création de la salle' });
  }
});

// Supprimer une salle
app.delete('/rooms/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { creatorEmail } = req.body;
    const rooms = readRooms();
    const roomIndex = rooms.findIndex(room => room.id === id);
    
    if (roomIndex === -1) {
      return res.status(404).json({ message: 'Salle non trouvée' });
    }

    const room = rooms[roomIndex];
    if (!room.creatorEmail || !creatorEmail || room.creatorEmail !== creatorEmail) {
      return res.status(403).json({ message: 'Suppression non autorisée : seul le créateur peut supprimer cette salle.' });
    }

    const deletedRoom = rooms.splice(roomIndex, 1)[0];
    writeRooms(rooms);
    
    console.log('Salle supprimée :', deletedRoom.name);
    res.json({ success: true, message: 'Salle supprimée avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression de la salle :', error);
    res.status(500).json({ message: 'Erreur lors de la suppression de la salle' });
  }
});

// Récupérer toutes les réservations
app.get('/reservations', (req, res) => {
  try {
    const reservations = readReservations();
    console.log('Récupération des réservations :', reservations.length, 'réservations trouvées');
    res.json({ success: true, reservations });
  } catch (error) {
    console.error('Erreur lors de la récupération des réservations :', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des réservations' });
  }
});

// Créer une nouvelle réservation
app.post('/reservations', (req, res) => {
  try {
    const { roomId, roomName, date, time, userName, userEmail } = req.body;
    
    if (!roomId || !roomName || !date || !time || !userName || !userEmail) {
      return res.status(400).json({ message: 'Tous les champs sont requis' });
    }

    const reservations = readReservations();
    
    // Vérifier si la salle est déjà réservée pour cette date et heure
    const existingReservation = reservations.find(
      reservation => 
        reservation.roomId === roomId && 
        reservation.date === date && 
        reservation.time === time
    );

    if (existingReservation) {
      return res.status(409).json({ message: 'Cette salle est déjà réservée pour cette date et heure' });
    }

    const newReservation = {
      id: Date.now().toString(),
      roomId,
      roomName,
      date,
      time,
      userName,
      userEmail,
      createdAt: new Date().toISOString()
    };

    reservations.push(newReservation);
    writeReservations(reservations);
    
    console.log('Nouvelle réservation créée :', newReservation);
    res.json({ success: true, reservation: newReservation });
  } catch (error) {
    console.error('Erreur lors de la création de la réservation :', error);
    res.status(500).json({ message: 'Erreur lors de la création de la réservation' });
  }
});

// Supprimer une réservation
app.delete('/reservations/:id', (req, res) => {
  try {
    const { id } = req.params;
    const reservations = readReservations();
    const reservationIndex = reservations.findIndex(reservation => reservation.id === id);
    
    if (reservationIndex === -1) {
      return res.status(404).json({ message: 'Réservation non trouvée' });
    }

    const deletedReservation = reservations.splice(reservationIndex, 1)[0];
    writeReservations(reservations);
    
    console.log('Réservation supprimée :', deletedReservation);
    res.json({ success: true, message: 'Réservation supprimée avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression de la réservation :', error);
    res.status(500).json({ message: 'Erreur lors de la suppression de la réservation' });
  }
});

// Récupérer les réservations d'une salle spécifique
app.get('/reservations/room/:roomId', (req, res) => {
  try {
    const { roomId } = req.params;
    const reservations = readReservations();
    const roomReservations = reservations.filter(reservation => reservation.roomId === roomId);
    
    console.log('Réservations pour la salle', roomId, ':', roomReservations.length, 'réservations trouvées');
    res.json({ success: true, reservations: roomReservations });
  } catch (error) {
    console.error('Erreur lors de la récupération des réservations de la salle :', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des réservations de la salle' });
  }
});

app.get('/', (req, res) => {
  res.send('Serveur Node.js pour RéZa fonctionne !');
});

app.listen(PORT, () => {
  console.log(`Serveur Node.js lancé sur http://localhost:${PORT}`);
});
