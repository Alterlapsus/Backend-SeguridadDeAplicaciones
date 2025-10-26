const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");

const app = express();

var corsOptions = {
  origin: [
    "https://alterlapsus.github.io",
    "http://localhost:8081"  // para desarrollo local
  ],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// parse requests of content-type - application/json
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// database
const db = require("./app/models");
const Role = db.role;
const User = db.user;

// 🔥 Usa force: true la primera vez para recrear las tablas e insertar datos base
db.sequelize.sync({ force: true }).then(() => {
  console.log("Drop and Resync Database with { force: true }");
  initial();
});

// simple route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to bezkoder application." });
});

// routes
require("./app/routes/auth.routes")(app);
require("./app/routes/user.routes")(app);

// set port, listen for requests
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});

// 🌱 Inserta datos iniciales
function initial() {
  Role.bulkCreate([
    { id: 1, name: "USER" },
    { id: 2, name: "MODERATOR" },
    { id: 3, name: "ADMIN" }
  ]).then(() => {
    console.log("Roles inserted.");

    const passwordHash = bcrypt.hashSync("123456", 8);

    // Crear usuarios base
    User.bulkCreate([
      { username: "user", email: "user@mail.com", password: passwordHash },
      { username: "mod", email: "mod@mail.com", password: passwordHash },
      { username: "admin", email: "admin@mail.com", password: passwordHash }
    ]).then(users => {
      console.log("Users inserted.");

      // Asignar roles a cada usuario
      users[0].setRoles([1]); // USER
      users[1].setRoles([2]); // MODERATOR
      users[2].setRoles([3]); // ADMIN

      console.log("Roles assigned to users.");
    });
  });
}
