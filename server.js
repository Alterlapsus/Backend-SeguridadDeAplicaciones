const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const xss = require("xss-clean");
const hpp = require("hpp");

const app = express();

// ========== CONFIGURACIÓN DE SEGURIDAD ==========

// 1. Helmet - Headers de seguridad (HSTS, CSP, etc.)
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    }
  },
  hsts: {
    maxAge: 31536000, // 1 año
    includeSubDomains: true,
    preload: true
  }
}));

// 2. CORS
var corsOptions = {
  origin: [
    "https://alterlapsus.github.io",
    "http://localhost:8081"
  ],
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// 3. Rate Limiting - Prevenir ataques de fuerza bruta
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // límite de 100 peticiones por IP
  message: "Demasiadas peticiones desde esta IP, intenta de nuevo más tarde."
});
app.use("/api/", limiter);

// Rate limiting más estricto para login
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // solo 5 intentos de login
  message: "Demasiados intentos de login, intenta de nuevo en 15 minutos."
});

// 4. Protección contra XSS
app.use(xss());

// 5. Protección contra HTTP Parameter Pollution
app.use(hpp());

// Parse requests
app.use(express.json({ limit: '10kb' })); // Limitar tamaño de payload
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// ========== DATABASE ==========
const db = require("./app/models");
const Role = db.role;
const User = db.user;

// Sync database (cambiar a false en producción)
db.sequelize.sync({ force: true }).then(() => {
  console.log("Drop and Resync Database with { force: true }");
  initial();
});

// ========== ROUTES ==========
app.get("/", (req, res) => {
  res.json({ message: "Welcome to bezkoder application." });
});

require("./app/routes/auth.routes")(app, loginLimiter);
require("./app/routes/user.routes")(app);

// ========== ERROR HANDLING ==========
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: "Algo salió mal en el servidor",
    error: process.env.NODE_ENV === 'production' ? {} : err.message 
  });
});

// ========== START SERVER ==========
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});

// ========== INITIAL DATA ==========
function initial() {
  Role.bulkCreate([
    { id: 1, name: "USER" },
    { id: 2, name: "MODERATOR" },
    { id: 3, name: "ADMIN" }
  ]).then(() => {
    console.log("Roles inserted.");

    const passwordHash = bcrypt.hashSync("123456", 8);

    User.bulkCreate([
      { username: "user", email: "user@mail.com", password: passwordHash },
      { username: "mod", email: "mod@mail.com", password: passwordHash },
      { username: "admin", email: "admin@mail.com", password: passwordHash }
    ]).then(users => {
      console.log("Users inserted.");

      users[0].setRoles([1]);
      users[1].setRoles([2]);
      users[2].setRoles([3]);

      console.log("Roles assigned to users.");
    });
  });
}

