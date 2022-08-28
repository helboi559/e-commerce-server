var express = require('express');
const { uuid } = require('uuidv4');
var router = express.Router();
var bcrypt = require('bcryptjs')
var dotenv = require('dotenv')
dotenv.config()
var jwt = require('jsonwebtoken')
const sgMail = require("@sendgrid/mail")
var {EcommDB} = require('../mongo.js')
sgMail.setApiKey(process.env.SENDGRID_API_KEY)


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

/* GET All user details **ADMIN**/
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

/* Delete user details **ADMIN**/
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
    console.log("token",token)
    const verified = jwt.verify(token, jwtSecretKey);
    // // console.log("verified",verified)
    const collection = await EcommDB().collection("users")
    const id = verified.data.id
    // console.log("userId",userId)
    if (!verified) {
        return res.json({ success: false, isAdmin: false });
    }
    //if its scope doesnt matter
    const userInfo = await collection.findOne({id})
    
    // console.log("userInfo",userInfo)
    return res.json({message:userInfo,success:true})

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

//POST FORGOT PASSWORD STEP 1 send email reset link to user if user exists
router.post("/user/forgot-password", async (req,res)=> {
  try {
    const email = req.body.email
    console.log(email)
    const collection = await EcommDB().collection("users")
    const user = await collection.findOne({email})
    if(!user) {
      res.json({success:false,message:"User Not Reqistered"}).status(204)
      return;
    }
    // console.log(user)
    //add jwt 
    const jwtSecretKey = process.env.JWT_SECRET_KEY + user.password
    //expiration
    
    const data = {
      email:user.email,
      id:user.id
    }
    
    const token = jwt.sign({data},jwtSecretKey,{expiresIn:"15m"})
    const link = `http://localhost:3000/users/reset-password/${user.id}/${token}`
    const message = {
      to: `${user.email}`,
      from: 'rami8224.2007@hotmail.com', // Use the email address or domain you verified above
      subject: 'Password Reset',
      text: 'Click on on this link below',
      html: `<h1>${link}</h1>`
    }
    sgMail.send(message)
    console.log("token",token)
    console.log("link",link)
    res.json({success:true,message:"Sent password reset instructions to your registered email address"})
  } catch (error) {
    console.log(error)
    res.json({message:String(error)})
  }
})

//GET RESET PASSWORD STEP 2 open page with url params and imput new password
router.get("/user/reset-password/:id/:token", async (req,res)=> {
  // console.log("get()",req.params)
  try {
    const {id,token} = req.params
    console.log("id-get()",id)
    const collection = await EcommDB().collection("users")
    const user = await collection.findOne({id})
    if (id !== user.id) {
      res.json({success:false,message:"User Not Reqistered"}).status(204)
      return;
    }
    // const token = req.headers.authorization.slice(7)
    // console.log(token)
    const jwtSecretKey = process.env.JWT_SECRET_KEY + user.password
    const verified = jwt.verify(token, jwtSecretKey);
    console.log("verefied",verified)
    res.json({success:true,message:user.email})
    
  } catch (error) {
    console.log(error)
    res.json({success:false,message:String(error)})
  }
})

//POST RESET PASSWORD STEP 3 submit new password info after the link matches verify 
router.post("/user/reset-password/:id/:token", async (req,res)=> {
    
    const {id,token} = req.params
    const {password,password2} = req.body
    console.log("new password",req.body)
    const collection = await EcommDB().collection("users")
    const user = await collection.findOne({id})
    console.log("user",user)
    // console.log("password",password)
    if (id !== user.id) {
      res.json({success:false,message:"User Not Reqistered"}).status(204)
      return;
    }
    try {
      const jwtSecretKey = process.env.JWT_SECRET_KEY + user.password
      const verified = jwt.verify(token, jwtSecretKey);
      console.log("verefied",verified)
      
      if(password !== password2) {
        res.json({success:false,message:"Passwords don't match! Try Again"}).status(204)
        return;
      }
      const saltRounds = 5
      const salt = await bcrypt.genSalt(saltRounds)
      const hash = await bcrypt.hash(password,salt)
      console.log("hash",hash)
      await collection.updateOne({id},{$set:{password:hash}})
      res.json({success:true,message:"Successfully updated password!"})
    } catch (error) {
      res.json({success:false,message:String(error)})
    }
 
})

module.exports = router;
