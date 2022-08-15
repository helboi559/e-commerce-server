var express = require('express');
const { uuid } = require('uuidv4');
var router = express.Router();
var bcrypt = require('bcryptjs')
var dotenv = require('dotenv')
var jwt = require('jsonwebtoken')
dotenv.config()
var {EcommDB} = require('../mongo.js')

// {
// 	"_id" : ObjectId("62e9526471853329313422c0"),
// 	"address" : {
// 		"geolocation" : {
// 			"lat" : "40.3467",
// 			"long" : "-30.1310"
// 		},
// 		"city" : "Cullman",
// 		"street" : "Frances Ct",
// 		"number" : 86,
// 		"zipcode" : "29567-1452"
// 	},
// 	"id" : 3,
// 	"email" : "kevin@gmail.com",
// 	"username" : "kevinryan",
// 	"password" : "kev02937@",
// 	"name" : {
// 		"firstname" : "kevin",
// 		"lastname" : "ryan"
// 	},
// 	"phone" : "1-567-094-1345",
// 	"__v" : 0
// }

/* GET user details **ADMIN**/
router.get('/user-list', async function(req, res, next) {
  try {
    // console.log("token",req.headers)
     const jwtSecretKey = process.env.JWT_SECRET_KEY;
    //  const token = req.headers.authorization.slice(7)
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
       const collection = await EcommDB().collection("users")
       const userList = await collection.find({}).toArray()
       return res.json({message:userList,success:true})
    }

  } catch (error) {
    // console.log(error)
    res.json({message:String(error),success:false})
  }
});

/* GET user details **ADMIN**/
router.delete('/user-list/delete-user', async function(req, res, next) {
  try {
    // console.log("token",req.headers)
     const jwtSecretKey = process.env.JWT_SECRET_KEY;
    //  const token = req.headers.authorization.slice(7)
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
        const collection = await EcommDB().collection("users")

        const id = req.body.id
        console.log(id)
        const deleteOne = await collection.deleteOne({id})
        return res.json({
          success: true,
          isAdmin: true,
        });
    }

  } catch (error) {
    // console.log(error)
    res.json({message:String(error),success:false})
  }
});

/* GET user info only by logged in-user */
router.get('/user/my-profile', async function(req, res, next) {
  try {
    // console.log("token",req.headers)
     const jwtSecretKey = process.env.JWT_SECRET_KEY;
    //  const token = req.headers.authorization.slice(7)
    const token = req.headers.token;
    // console.log("token",token)
    const verified = jwt.verify(token, jwtSecretKey);
    // // console.log("verified",verified)
    const collection = await EcommDB().collection("users")
    const id = verified.data.id
    // console.log("userId",userId)
    if (!verified) {
        return res.json({ success: false, isAdmin: false });
    }
    
    
    const userInfo = await collection.findOne({id})
    
    // console.log("userInfo",userInfo)
    res.json({message:userInfo,success:true})

  } catch (error) {
    // console.log(error)
    res.json({message:String(error),success:false})
  }
});

// PUT Edit user info based on logged in user

router.put('/user/my-profile/edit-user', async function(req, res, next) {
  try {
    // console.log("token",req.headers)
     const jwtSecretKey = process.env.JWT_SECRET_KEY;
    //  const token = req.headers.authorization.slice(7)
    const token = req.headers.token;
    // console.log("token",token)
    const verified = jwt.verify(token, jwtSecretKey);
    // // console.log("verified",verified)
    
    if (!verified) {
        return res.json({ success: false, isAdmin: false });
    }
    const collection = await EcommDB().collection('users')
    const id = verified.data.id
    

    const {email,phone} = req.body
      const updateProduct ={}
      email && (updateProduct.email = email)
      phone && (updateProduct.phone = phone)
    
    let password = req.body.password
    console.log(password)
    if(password) {
      const saltRounds = 5
      const salt = await bcrypt.genSalt(saltRounds)
      const hash = await bcrypt.hash(password,salt)
      // console.log("userId",userId)
      password && (updateProduct.password=hash)
      
    } else {
      password && (updateProduct.password=hash)
    }
    console.log("user put",updateProduct)

    await collection.updateOne({id},{$set:updateProduct})
      return res.json({
          success: true,
          isAdmin: true,
        });
    
  } catch (error) {
    console.log(error)
    res.json({message:String(error),success:false})
  }
});


module.exports = router;
