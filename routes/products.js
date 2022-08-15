var express = require('express');
var router = express.Router();
const { uuid } = require('uuidv4');
var {EcommDB} = require('../mongo.js')
var dotenv = require('dotenv')
var jwt = require('jsonwebtoken')
dotenv.config()
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
//     const collection = await EcommDB().collection("products")
//     const products = await collection.find({}).toArray()
//     res.json(products)
//   } catch (error) {
//     res.json({message:String(error)})
//   }
// });

/* GET single product in db. */
router.get('/:productId', async function(req, res, next) {
  try {
    const productId = req.params.productId
    
    // console.log("type",typeof productId)
    const collection = await EcommDB().collection("products")
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
    let collection = await EcommDB().collection('products')
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
    const collection = await EcommDB().collection("products")
    
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

// //PUT{}EDIT product DATA **ADMIN ONLY
// {
//     "title": "test product",
//     "price": 13.5,
//     "description": "lorem ipsum set",
//     "id": "86a08836-bc49-4b85-9bd7-6779af416c59",
//     "category": "electronic",
//     "image":"test1"
//    }
router.put('/edit-product', async (req,res) => {
  try {
    // console.log(req.headers)
    // testing for postman
    // const token = req.headers.authorization.slice(7)
    const token = req.headers.token
    console.log(token)
    const jwtSecretKey = process.env.JWT_SECRET_KEY;
    const verified = jwt.verify(token, jwtSecretKey);
    
    if (!verified) {
        return res.json({ success: false, isAdmin: false });
    }
    const userData = verified.data

    if (userData && userData.scope === "admin") {
      const collection = await EcommDB().collection("products")
      const id = req.body.id
      // console.log(req.body)
      const {price,title,category,description,image} = req.body
      const updateProduct ={}
      price && (updateProduct.price = price)
      title && (updateProduct.title = title)
      category && (updateProduct.category = category)
      description && (updateProduct.description = description)
      image && (updateProduct.image = image)
      // console.log(updateProduct)
      // console.log("id",id)
    
      //update product
      await collection.updateOne({id},{$set:updateProduct})
      
      return res.json({
        success: true,
        isAdmin: true,
      });
    }

    if (userData && userData.scope === "user") {
      return res.json({ success: true, isAdmin: false });
    }
    
    // throw Error("Access Denied");
  } catch (error) {
    console.log(error)
    // Access Denied
    return res.status(401).json({ success: false, message: String(error) });
  }
})

// //DELETE{}product DATA **ADMIN ONLY
// {
    
//   "id": "86a08836-bc49-4b85-9bd7-6779af416c59",
    
//   }
router.delete('/delete-product', async (req,res) => {
  try {
    // console.log(req.headers)
    // const token = req.headers.authorization.slice(7)
    const token = req.headers.token
    // console.log(token)
    const jwtSecretKey = process.env.JWT_SECRET_KEY;
    const verified = jwt.verify(token, jwtSecretKey);
    
    if (!verified) {
        return res.json({ success: false, isAdmin: false });
    }
    const userData = verified.data

    if (userData && userData.scope === "admin") {
      const collection = await EcommDB().collection("products")
      const id = req.body.id
      console.log(id)
      const deleteOne = await collection.deleteOne({id})
      return res.json({
        success: true,
        isAdmin: true,
      });
    }

    if (userData && userData.scope === "user") {
      return res.json({ success: true, isAdmin: false });
    }
    
    throw Error("Access Denied");
  } catch (error) {
    console.log(error)
    // Access Denied
    return res.status(401).json({ success: false, message: String(error) });
  }
})

module.exports = router;