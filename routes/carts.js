var express = require('express');
const { uuid } = require('uuidv4');
var router = express.Router();

var {EcommDB} = require('../mongo.js')
/* GET all carts in db. */
router.get('/', async function(req, res, next) {
  try {
    const collection = await EcommDB().collection("carts")
    const carts = await collection.find({}).toArray()
    res.json(carts)
  } catch (error) {
    res.json({message:String(error)})
  }
});

// ADD{POST} Cart to List  
router.post('/create-cart', async (req,res) => {
  try {
    const items = req.body.products
    // console.log("items",items)
    const today =new Date()
    const collection = await EcommDB().collection("carts")
    
    const data = {
      id:uuid(),
      date:today.toISOString(),
      products:items
    }
    // console.log('data',data)
  const addProduct = await collection.insertOne(data)
    res.json({message:"success"})
    
  } catch (error) {
    res.json({message:String(error)})
  }
})

module.exports = router;