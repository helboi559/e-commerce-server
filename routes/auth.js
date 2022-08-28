var express = require('express');
var router = express.Router();
var bcrypt = require('bcryptjs')
const { uuid } = require('uuidv4');
var {EcommDB} = require('../mongo.js')
var dotenv = require('dotenv')
var jwt = require('jsonwebtoken')
dotenv.config()
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

//global user create
const createUser = async (username,passwordHash,email,phone) => {
    try {
        const user = {
            username:username,
            password:passwordHash,
            id:uuid(),
            email,
            phone
        }
        const collection = await EcommDB().collection('users')
        await collection.insertOne(user)
        return true
    } catch (error) {
        console.log(error)
        return false
    }
}

router.post("/register-user",async (req,res)=> {
    try {
        const username = req.body.username
        const password = req.body.password
        const email = req.body.email
        const phone = req.body.phone
        const saltRounds = 5
        const salt = await bcrypt.genSalt(saltRounds)
        const hash = await bcrypt.hash(password,salt)
        const userSaveSuccess = await createUser(username,hash,email,phone)
        res.json({success:userSaveSuccess})

    } catch (error) {
        console.log(error)
        res.json({success:false})
    }
})

router.post("/login-user",async (req,res)=> {
    try {
        const username = req.body.username
        const password = req.body.password
        
        const collection = await EcommDB().collection('users')
        const user = await collection.findOne({username})
        //if user doesnt exist
        if (!user) {
            res.json({success:false,message:"Could not find user"}).status(204)
            return;
        }
        const match = await bcrypt.compare(password,user.password);
        //if password does not match
        if(!match) {
            res.json({success:false,message:"Password was incorrect!"}).status(204)
            return;
        }
        //add jwt for persistent login
        const jwtSecretKey = process.env.JWT_SECRET_KEY
        //expiration
        const expiration = Math.floor(Date.now() / 1000)  + 60 * 60;
        //asign scope based on emailtype
        const userType= username.includes("codeimmersives.com") ? "admin" : "user"

        const data = {
            time:new Date(),
            id:user.id,
            scope:userType
        }
        const token = jwt.sign({data,exp:expiration},jwtSecretKey)
        console.log('token for user on login',token)
        console.log('data for user on login',data)
        res.json({success:true,token,userType})
        return;
    } catch (error) {
        console.log(error)
        res.json({success:false,message:String(error)})
    }
})

router.get("/validate-admin", (req, res) => {
  try {
    const tokenHeaderKey = process.env.TOKEN_HEADER_KEY;
    const jwtSecretKey = process.env.JWT_SECRET_KEY;
    const token = req.header(tokenHeaderKey);
    const verified = jwt.verify(token, jwtSecretKey);
    
    if (!verified) {
        return res.json({ success: false, isAdmin: false });
    }
    
    const userData = verified.data

    if (userData && userData.scope === "admin") {
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
    // Access Denied
    return res.status(401).json({ success: false, message: error });
  }
});



module.exports = router