const path = require('path');
const express = require('express');
const multer = require('multer');
const bodyParser = require('body-parser');
const db = require('./db');
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


app.get('/', function (req, res) {
  res.send('Главная страница');
})


app.get('/login', function (req, res) {
  res.send('Авторизация');
})

app.get('/films', function (req, res) {
  res.send(db);
})

app.get('/films/:filmName', function (req, res) {
  let hp = JSON.stringify(db);
  hp = JSON.parse(hp);
  try {
    for (let i = 0; i < hp["movies"].length; i++) {
      if (hp["movies"][i].title == req.params.filmName.replace(/_/g, ' ')) {
        res.send(hp["movies"][i]);
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

app.listen(8080, () => console.log('listening at 8080...'));

