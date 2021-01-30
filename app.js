const path = require('path');
const express = require('express');
const multer = require('multer');
const bodyParser = require('body-parser');
var urlencodedParser = bodyParser.urlencoded({ extended: false })

const db = require('./db');
const commentdb = require('./commentdb');
const usersdb = require('./usersdb.js');


const { dir } = require('console');

const app = express();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage });

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, x-auth-token, X-Requested-With, Content-Type, Accept");
  next();
});


app.get('/', function (req, res) {
  res.send(commentdb);
})


app.get('/login', function (req, res) {
  res.send('Авторизация');
})

app.get('/films', function (req, res) {
  res.send(db);
})

app.get('/films/:filmId', function (req, res) {
  let hp = JSON.stringify(db);
  hp = JSON.parse(hp);
  let fi = JSON.stringify(commentdb);
  fi = JSON.parse(fi);
  try {
    for (let i = 0; i < hp["movies"].length; i++) {
      if (hp["movies"][i].id == req.params.filmId) {
        let id = hp["movies"][i].id;
        res.send([hp["movies"][i], fi[id]]);
      }
    }
    throw new Error('Такого фильма нет  ¯\\_(ツ)_/¯');
  } catch (err) {
    res.send(err.message);
  }
})

app.post('/upload', upload.single('image'), function (req, res, next) {
  const { file } = req;
  const image = {
    id: String(Math.random()).slice(2),
    imageUrl: `http://localhost:8080/uploads/${file.filename}`
  }
  try {
    db.get('images')
      .push(image)
      .write();
  } catch (error) {
    throw new Error(error);
  }

  res.json({ status: 'OK', data: image })
});

app.post('/films/:filmId', urlencodedParser, function (req, res) {
  const text = req.body.text;
  const user = req.body.user || "anonim";
  const newComment = {
    "user": `${user}`, "message": `${text}`
  }
  try {
    if (!commentdb.get(`${req.params.filmId}`).value()) {
      commentdb.set(`${req.params.filmId}`, []).write()
    }
    commentdb.get(`${req.params.filmId}`)
      .push(newComment)
      .write();
  } catch (error) {
    throw new Error(error);
  }
  res.send();
})

app.post('/login', urlencodedParser, function (req, res) {
  const login = req.body.login;
  const password = req.body.password;
  try {
    if (!usersdb.get(`${login}`).value()) {
      res.send('Error');
    } else {
      if (usersdb.get(`${login}`).get('password') == password) {
        res.send(usersdb.get(`${login}`));
      } else {
        res.send('Error');
      }
    }
  } catch (error) {
    throw new Error(error);
  }
})

app.post('/auth', urlencodedParser, function (req, res) {
  const login = req.body.login;
  const password = req.body.password;
  const image = req.body.img || "123";
  try {
    if (usersdb.get(`${login}`).value()) {
      res.send('Registered');
    } else {
      usersdb.set(`${login}`, { password: password, image: image }).write();

      res.send("Получилось");
    }
  } catch (error) {
    throw new Error(error);
  }
})

app.listen(8080, () => console.log('listening at 8080...'));

