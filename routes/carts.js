var express = require('express');
const { uuid } = require('uuidv4');
var router = express.Router();
var dotenv = require('dotenv')
var jwt = require('jsonwebtoken')
dotenv.config()
var {EcommDB, mongoConnect} = require('../mongo.js')

// [
//     {
//         id:1,
//         userId:1,
//         date:2020-10-10,
//         products:[{productId:2,quantity:4},{productId:1,quantity:10},{productId:5,quantity:2}]
//     },
//     /*...*/
//     {
//         id:20,
//         userId:10,
//         date:2019-10-10,
//         products:[{productId:1,quantity:5},{productId:5,quantity:1}]
//     }
// ]
/* GET all purhcases in db. **ADMIN** */
router.get('/', async function(req, res, next) {
  try {
    // console.log("token",req.headers)
     const jwtSecretKey = process.env.JWT_SECRET_KEY;
    //  const token = req.headers.authorization.slice(7) //POSTMAN TEST
    const token = req.headers.token;
    // console.log("token",token)
    const verified = jwt.verify(token, jwtSecretKey);
    // // console.log("verified",verified)
   
    // const id = verified.data.id
    // console.log("userId",userId)
    if (!verified) {
        return res.json({ success: false, isAdmin: false });
    }

    const userData = verified.data

    if (userData && userData.scope === "user") {
      return res.json({ success: true, isAdmin: false });
    }

    if(userData && userData.scope === "admin") {
       const collection = await EcommDB().collection("carts")
       const userList = await collection.find({}).toArray()
       return res.json({message:userList,success:true})
    }

  } catch (error) {
    // console.log(error)
    res.json({message:String(error),success:false})
  }
});


// ADD{POST} Cart to List  
router.post('/create-cart', async (req,res) => {
  try {
    // console.log("header",req.headers)
    // console.log("userid",verified.data.id)
    const jwtSecretKey = process.env.JWT_SECRET_KEY;
    const token = req.headers.token;
    const verified = jwt.verify(token, jwtSecretKey);
    const userId = verified.data.id
    // console.log(token)
    if(!verified) {
      return res.json({ success: false, isAdmin: false });
    }
    // console.log("scope",verified.scope)
    
    
    const items = req.body.products
    // console.log("items",items)
    const today =new Date()
    const collection = await EcommDB().collection("carts")
    
    const data = {
      id:uuid(),
      date:today.toISOString(),
      userId,
      products:items
    }
    // console.log('data',data)
  const addProduct = await collection.insertOne(data)
    res.json({message:"success"})
    
  } catch (error) {
    console.log(error)
    res.json({message:String(error)})
    
  }
})

//display carts by user
router.get("/user/order-history", async (req, res) => {
  try {
    
    const jwtSecretKey = process.env.JWT_SECRET_KEY;
    const token = req.headers.token;
    // console.log("token",token)
    const verified = jwt.verify(token, jwtSecretKey);
    // console.log("verified",verified)
    const userId = verified.data.id
    // console.log("userId",userId)
    if (!verified) {
        return res.json({ success: false, isAdmin: false });
    }
    const collection = await EcommDB().collection("carts")
    const userCarts = await collection.find({userId}).toArray()
    //  console.log(userCarts)  
    
    res.json({message:userCarts,success:true})
  } catch (error) {
    // Access Denied
    console.log(error)
    
    res.json({ success: false, message: String(error) });
  }
});

module.exports = router;