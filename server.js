require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('./db');
const cors = require('cors');
const app = express();
app.use(express.static('fichiers'));
app.use(bodyParser.json());
app.use(cors());

// Vérifier la connexion PostgreSQL
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Erreur connexion PostgreSQL :', err);
  } else {
    console.log('Connexion PostgreSQL OK, date serveur :', res.rows[0]);
  }
});

// Connexion utilisateur
app.post('/login', async (req, res) => {
  console.log('Requête reçue /login :', req.body);
  const { email, password } = req.body;

  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Utilisateur non trouvé' });
    }

    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.mot_de_passe);
    if (!validPassword) {
      return res.status(401).json({ message: 'Mot de passe incorrect' });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role_id },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({ token, role: user.role_id, nom: user.nom });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

app.post('/register', async (req, res) => {
  console.log('Requête reçue /register :', req.body);
  const { prenom, nom, email, password, role } = req.body;

  try {
    const check = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (check.rows.length > 0) {
      return res.status(400).json({ success: false, message: 'Email déjà utilisé' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const role_id = role === 'Superviseur' ? 2 : 1;

    await pool.query(
      'INSERT INTO users (nom, email, mot_de_passe, role_id) VALUES ($1, $2, $3, $4)',
      [`${prenom} ${nom}`, email, hashedPassword, role_id]
    );

    res.json({ success: true, message: 'Utilisateur créé avec succès' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// Middleware de protection
function checkAdmin(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Token manquant' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 1) {
      return res.status(403).json({ message: 'Accès interdit' });
    }
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token invalide' });
  }
}

// Route protégée
app.get('/users', checkAdmin, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM users');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});