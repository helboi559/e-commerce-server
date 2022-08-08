var express = require('express');
var router = express.Router();
const { uuid } = require('uuidv4');
var {blogsDB} = require('../mongo.js')

//PRODUCT SAMPLE
// {
  // "id": 1,
  // "title": "Fjallraven - Foldsack No. 1 Backpack, Fits 15 Laptops",
  // "price": 109.95,
  // "description": "Your perfect pack for everyday use and walks in the forest. Stash your laptop (up to 15 inches) in the padded sleeve, your everyday",
  // "category": "men's clothing",
  // "image": "https://fakestoreapi.com/img/81fPKd-2AYL._AC_SL1500_.jpg",
  // "rating": {
    // "rate": 3.9,
    // "count": 120
      // }
// }
// /* GET all products in db. */
// router.get('/', async function(req, res, next) {
//   try {
//     const collection = await blogsDB().collection("products")
//     const products = await collection.find({}).toArray()
//     res.json(products)
//   } catch (error) {
//     res.json({message:String(error)})
//   }
// });

/* GET single product in db. */
router.get('/:productId', async function(req, res, next) {
  try {
    const productId = Number(req.params.productId)
    const collection = await blogsDB().collection("products")
    const singleProduct = await collection.findOne({id:productId})
    res.json({message:singleProduct, success:true})
  } catch (error) {
    res.json({message:String(error),success:false})
  }
});

/* GET all-products in db. w/filter sort etc */
router.get('/', async function(req, res, next) {
  try {
    let limit = Number(req.query.limit)
    let skip = Number(req.query.limit) * (Number(req.query.page) - 1)
    let sortOrder = req.query.sortOrder
    if(sortOrder === "asc") {
      sortOrder = 1
    } else if (sortOrder === 'desc') {
      sortOrder = -1
    }
    let sortField = req.query.sortField
    let sortObj = {}
    //if both exist
    if(sortField && sortOrder) {
      sortObj = {[sortField]:sortOrder}
    }
    let filterField = req.query.filterField
    let filterValue = req.query.filterValue

    let filterObj = {}
    if (filterField && filterValue) {
      filterObj = {[filterField]:filterValue}
    }
    let collection = await blogsDB().collection('products')
    let newData = await collection
      .find(filterObj)
      .sort(sortObj)
      .skip(skip)
      .limit(limit)
      .toArray();
    // console.log(newData)
    res.json({message:newData,success:true})
  } catch (error) {
    res.json({message:String(error),success:false})
  }
});

// ADD{POST} Product to List  ***(ADMIN)***
router.post('/create-product', async (req,res) => {
  try {
    const title = req.body.title
    const price = Number(req.body.price)
    const description = req.body.description
    const image = req.body.image
    const category = req.body.category
    //create id 
    const collection = await blogsDB().collection("products")
    
    const dbArr = await collection.find({}).toArray()
    // console.log(id)
    const data = {
      id:uuid(),
      title,
      price,
      description,
      image,
      category
    }
    
  const addProduct = await collection.insertOne(data)
    res.json({message:"success"})
    
  } catch (error) {
    res.json({message:String(error)})
  }
})

// // DELETE{} Product from server ***(ADMIN)***
// router.post('/delete-product', async (req,res) => {
//   try {
//     const title = req.body.title
//     const price = Number(req.body.price)
//     const description = req.body.description
//     const image = req.body.image
//     const category = req.body.category
//     const data = {
//       title,
//       price,
//       description,
//       image,
//       category
//     }
//     const collection = await blogsDB().collection("products")
//     const addProduct = await collection.insertOne(data)
    
    
//   } catch (error) {
    
//   }
// })

module.exports = router;