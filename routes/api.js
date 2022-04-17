var express = require('express');
var router = express.Router();
const {getDataAll, findByNearBangkok, findByNearboringThaiAndYear2018, findByYear, findEachCountryAndYear2011, findByLowIncome, findByMBR, downloadFileA} = require('../models/model')
const { download } = require("express/lib/response");
//Get all data
router.get('/getAll', async function(req, res, next) {
    getDataAll().then(recordset => {
      res.status(200).json({ result: recordset});
    })
});

//4.1


//5.a
router.get('/year:year', async function(req, res, next) {
  findByYear(req.params.year).then(recordset => {
    res.status(200).json({result  : recordset})
  })
});

//5.b
router.get('/option/Bangkok', async function(req, res, next) {
    findByNearBangkok(req.params.option).then(recordset => {
      res.status(200).json({result  : recordset})
    })
});

//5.c
router.get('/option/nearthai', async function(req, res, next) {
    findByNearboringThaiAndYear2018(req.params.option).then(recordset => {
      res.status(200).json({result  : recordset})
    })
});

//5.d
router.get('/option/eachcountry', async function(req, res, next) {
    findEachCountryAndYear2011(req.params.option).then(recordset => {
      res.status(200).json({result  : recordset})
    })
});

//5.e
router.get('/option/lowincome:year', async function(req, res, next) {
    findByLowIncome(req.params.year).then(recordset => {
      res.status(200).json({result  : recordset})
    })
});

//5.f
router.get('/option/mbr', async function(req, res, next) {
  findByMBR(req.params.year).then(recordset => {
    res.status(200).json({result  : recordset})
  })
});


module.exports = router;
  