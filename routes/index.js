var express = require('express');
var router = express.Router();
const multer = require('multer')
const {getYear, getCountry, saveData, downloadFileA, downloadFileB, downloadFileC, downloadFileD} = require('../models/model')

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
      cb(null, 'upload')
  },
  filename: (req, file, cb) => {
      cb(null, 'file-' + Date.now() + '.' +
      file.originalname.split('.')[file.originalname.split('.').length-1])}
})
const upload = multer({ storage: storage })

//get all data
router.get('/', function(req, res, next) {
  const year = req.query.year
  console.log(year)
  getYear().then(years => {
    getCountry().then(countries => {
      res.render('index', {years: years, countries: countries, year : year}  );
    })
  })
});

//Step2
router.get('/upload' , (req, res) => {
  res.render('upload')
})

router.post('/upload', upload.single('fileCSV') , async(req, res) => {

  let filename = req.file.filename

  const result = await saveData(filename)
  
  res.render('upload', { message : 'Upload suscessfully'});
})

//step4
router.get('/download' , (req, res) => {
  res.render('download')
})

//4.a
router.get('/downloadFileA', async(req, res)=> {
  const file = await downloadFileA();
  res.download("./download/a/" + file);
})

//4.b
router.get('/downloadFileB', async(req, res)=> {
  const file = await downloadFileB();
  res.download("./download/b/" + file);
})

//4.c
router.get('/downloadFileC', async(req, res)=> {
  let country = req.query.country
  const file = await downloadFileC(country);
  res.download("./download/c/" + file);
})

//4.d
router.get('/downloadFileD', async(req, res)=> {
  let year = req.query.year
  let color = req.query.color
  const file = await downloadFileD(year, color);
  res.download("./download/d/" + file);
})




module.exports = router;
