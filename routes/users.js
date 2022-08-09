var express = require('express');
var router = express.Router();

var {EcommDB} = require('../mongo.js')
/* GET all users in db. */
router.get('/', async function(req, res, next) {
  try {
    const collection = await EcommDB().collection("users")
    const users = await collection.find({}).toArray()
    res.json(users)
  } catch (error) {
    res.json({message:String(error)})
  }
});

module.exports = router;
