var express = require('express');
var router = express.Router();

var {blogsDB} = require('../mongo.js')
/* GET all carts in db. */
router.get('/', async function(req, res, next) {
  try {
    const collection = await blogsDB().collection("carts")
    const carts = await collection.find({}).toArray()
    res.json(carts)
  } catch (error) {
    res.json({message:String(error)})
  }
});

module.exports = router;