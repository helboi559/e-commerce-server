var express = require('express');
const { uuid } = require('uuidv4');
var router = express.Router();
var dotenv = require('dotenv')
var jwt = require('jsonwebtoken')
dotenv.config()
var {EcommDB, mongoConnect} = require('../mongo.js')
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



// const fetchUserInfo = async(userList) => {
//   const collection = await EcommDB().collection("carts")
//     const userCarts = await collection.find({
//         userId: {
//             $in:userList
//         }}).toArray()
//   console.log(userCarts)
//   return userCarts
// }
// const main = async() => {
//   await mongoConnect()
//   const userList = [1,3]
//   const fetch = await fetchUserInfo(userList)
//   // const userPromises = userList.map((userId) => {
//   //   return findUser(userId)
//   // })
//   console.log(fetch)
// }
// fetchUserInfo()

// // ADD{POST} Cart to List  
// router.post('/create-cart', async (req,res) => {
//   try {
//     const items = req.body.products
//     // console.log("items",items)
//     const today =new Date()
//     const collection = await EcommDB().collection("carts")
    
//     const data = {
//       id:uuid(),
//       date:today.toISOString(),
//       products:items
//     }
//     // console.log('data',data)
//   const addProduct = await collection.insertOne(data)
//     res.json({message:"success"})
    
//   } catch (error) {
//     res.json({message:String(error)})
//   }
// })
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
router.get("/user/:userId", async (req, res) => {
  try {
    // const tokenHeaderKey = process.env.TOKEN_HEADER_KEY;
    // console.log(req.headers.authorization)
    const token = req.headers.authorization.slice(7)
    // console.log(newToken)
    const jwtSecretKey = process.env.JWT_SECRET_KEY;
    // const token = req.headers.token;
    
    const verified = jwt.verify(token, jwtSecretKey);
    console.log("verified",verified)
    const userId = verified.data.id
    console.log("userId",userId)
    if (!verified) {
        return res.json({ success: false, isAdmin: false });
    }
    const collection = await EcommDB().collection("carts")
    const userCarts = await collection.findOne({userId})
     console.log(userCarts)  
    // const userData = verified.data

    // if (userData && userData.scope === "admin") {
    //   return res.json({
    //     success: true,
    //     isAdmin: true,
    //   });
    // }

    // if (userData && userData.scope === "user") {
    //   return res.json({ success: true, isAdmin: false });
    // }

    // throw Error("Access Denied");
  } catch (error) {
    // Access Denied
    console.log(error)
    return res.status(401).json({ success: false, message: error });
  }
});

module.exports = router;