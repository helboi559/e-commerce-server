# E-commerce Store

## Overview

The goal of this project is to create an app similar to Amazon. The customer would have the ability to search and select products for purchase and have them delivered home. The "store" owner will have the ability to display what items are for sale and add/remove/edit products details and the buyer would add items to a basket for eventual purchase. Features include adding/deleting/modifying(product quantities) for "cart products". Purchased items will contain  rating/review system for other potential buyers. The admin features include edit/delete/add products on thewebsite. User authentication will be implemented to restrict certain type of info depending on access type/scope.

## Approach - Server 1A
- Install boilerplate (express generator, cors , nodemon , dotenv, mongo) and set routing w/testing.
    ```js
    //cors
    var cors = require('cors')
    app.use(cors())
    app.options("*",cors())

    //dotenv
    require("dotenv").config()

    //add routes to .env file
    MONGO_URI = mongodb+srv://jramirez559:CodeImmersives2022@codeimmersives.woe8edu.mongodb.net/?retryWrites=true&w=majority
    MONGO_DATABASE = Ecomm

    //mongdb 
        //in mongo.js
        const { MongoClient } = require("mongodb");
        require("dotenv").config();

        let db;

        async function mongoConnect() {
            const uri = process.env.MONGO_URI;
            const client = new MongoClient(uri);
            try {
            await client.connect();
            db = await client.db(process.env.MONGO_DATABASE);
            console.log("db connected");
            } catch (error) {
            console.error(error)
            }
        }
        function EcommDB() {
            return db;
        }
        module.exports = {
            mongoConnect,
            EcommDB,
        };
        //in app.js
        const {mongoConnect} = require("./mongo.js")
        mongoConnect()
        //import any route 
        var {EcommDB} = require('../mongo.js')
    ```
- Add DB's collections(Ecomm[users,products,carts])
<!-- - View(GET list for all routes/(USERS,PRODUCTS/CARTS)) -->
### Routing Approach
- Routing will include [PRODUCTS],[USERS] & [CARTS].
  - [PRODUCTS] 
    - *VIEW(GET)*
      - Retrive (1) item by id
      - List items display(sort/asc/page etc.)
      - Rating/Review (purchased items)--------
    - *CREATE(POST)*
      -[Admin] Add new product to website
    - *EDIT(PUT)*
      - [Admin] Modify existing product info
    - *DELETE(DELETE)*
      - [Admin] Delete a whole product
  - [CARTS] -Completed Purchases Only
    - *VIEW(GET)*
      - View Purchase history by logged in user.
    - *CREATE(POST)*
      - Purchase "basket"
  - [USERS] 
    - *VIEW(GET)*
      - View user details by logged in user. 
      - [Admin] View all user details
    - *EDIT(PUT)*
      - Modify user details by logged in user 
    - *DELETE(DELETE)*
      - [Admin] Delete a user 
      - Delete own user -----
  



## Approach - Server 2A - Auth

- Install boilerplate (uuid,bcryptjs,jwt) and set [AUTH] route w/testing.
  - [Auth]
    - Create user function
    - *VIEW(GET)*
      - [Admin] Validate Admin by scope(user/admin)
    - *CREATE(POST)*
      - Register newly created user
      - Login user by username/pw



## User Login and Registration

- [Core] 
  - A user should be able to register with the application.
    - [Stretch] The user's password should be encrypted via salt+hash algorithm.(7/21-Auth)
  - A user should be able to login with the application.
    - [Stretch] A user ID Token should be generated using JsonWebToken. The ID Token should then be persisted on client side with local storage. The client should then check for the existence of the token before prompting the user to authenticate.
    - [Stretch] A user should be able to logout of the application and login with a different account.
### User Shopping 
- [User]
    - Item Search(sort/asc/page etc.)
    - Add item to cart. 
    - Edit item in cart (increase/decrease qty.)
    - Delete item(s) in cart
    - Purchase items in cart
    - Rating/Review (purchased items)
    [Note] A user should be able to *VIEW(GET)* the following fields on a website:
      - title {String}
      - description {String}
      - ID {uuid[]}
      - Rating
      - category {String}
      - Price {Num}
      - Image {String}
    ```js
    //product list example
    {
        "id": 1,
        "title": "Fjallraven - Foldsack No. 1 Backpack, Fits 15 Laptops",
        "price": 109.95,
        "description": "Your perfect pack for everyday use and walks in the forest. Stash your laptop (up to 15 inches) in the padded sleeve, your everyday",
        "category": "men's clothing",
        "image": "https://fakestoreapi.com/img/81fPKd-2AYL._AC_SL1500_.jpg",
        "rating": {
            "rate": 3.9,
            "count": 120
        }
    }
    ```
    [Note] A user should be able to *CREATE-(POST)* the following fields on a website:
      - UserId {uuid}
      - products {productid:2,quantity:1},{productid:6,quantity:3}
      - createdAt {Date}
    
    [Note] A user should be able to *EDIT(PUT)* the following fields on a website:
      - ID {Num}
      - UserId {uuid}
      - products {productId:1,quantity:3}
      - lastModified {Date}
    [Note] A user should be able to *DELETE(DELETE)* the following fields on a website:
      - ID {Num}
      - UserId {uuid}
      - products {productId:1,quantity:3}
      - created at {Date}

### Admin Management
- [Admin]
  - Set items on Main Page
  - Edit/Delete/Add Products to website
  - [Stretch] An admin should be able to *View(GET)* the following fields in the website:
      - title {String}
      - description {String}
      - ID {uuid[]}
      - Rating
      - category {String}
      - Price {Num}
      - Image {String}
    
      - All users
      - 
  - [Stretch] An admin should be able to *CREATE(Post)* the following fields in the website:
      - title {String}
      - description {String}
      - status {String}
      - createdAt {Date}
      - createdById {uuid}
      - lastModified {Date}
      - lastUpdatedById {uuid}
    - [Stretch] An admin should be able to *EDIT(Put)* the following fields in the website:
      - title {String}
      - description {String}
      - status {String}
      - createdAt {Date}
      - createdById {uuid}
      - lastModified {Date}
      - lastUpdatedById {uuid}
    - [Stretch] An admin should be able to *DELETE(DELETE)* the following fields in the website:
      - title {String}
      - description {String}
      - status {String}
      - createdAt {Date}
      - createdById {uuid}
      - lastModified {Date}
      - lastUpdatedById {uuid}

### Super Stretch Goals

- Add support for users to be part of an organization.
- Add support for admin users in an organization to have authorized privileges that basic users do not.
- A user should be able to attach a file to a ticket.
- Add support for users to add comments onto a ticket.
- Add support for users to tag other users in a comment.
- Integrate any third party API

## Tech Stack

- [Required] Node - Runtime
- [Required] React - Client Framework
- [Required] Express - Server Framework
- [Required] MongoDB - Database
- [Required] Git - Code Versioning
- [Required] Github - Code Storage and Collaboration
- [Required] CORS - Express CORS Library
- [Suggested] Heroku - Hosted Deployment
- [Suggested] bcryptJS - User Authentication
- [Suggested] JsonWebToken - User Auth Tokens
- [Suggested] Bootstrap - CSS Framework
- [Suggested] Nodemon - Server Hot Reloading
- [Suggested] React-Router - Client Side Routing
- [Suggested] JSDOC - Code Comment Framework
- [Suggested] uuidv4 - Unique ID Generator
- [Suggested] TinyMCE - Rich Text Editor
