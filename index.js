const express = require("express")
const {open} = require('sqlite')
const sqlite3=require('sqlite3')
const Cookies = require("js-cookie")
const bcrypt = require('bcrypt')

const jwt = require('jsonwebtoken')
const app = express()
const path = require("path")
const dbPath = path.join(__dirname,'user.db')
const dbPath2=path.join(__dirname,'recipe.db')
app.use(express.json())

let db=null;
let db2=null;

const User = require('./user');
const authorizationFunction = new User()

const Recipe = require('./recipe')
const RecipeInstance = new Recipe()


const initializingDbAndServer = async () => {
    try {
        db = await open({
            filename: dbPath,
            driver: sqlite3.Database,
        });

        db2 = await open({
            filename:dbPath2,
            driver:sqlite3.Database
        })

      

        app.listen(process.env.PORT || 3000, () => {
            console.log('Server is started at http://localhost:3000');
        });
    } catch (e) {
        process.exit(1);
        console.log('DB error', e);
    }
};


initializingDbAndServer()



// Middleware for verifying the JWT token
const verifyToken = (req, res, next) => {
    try{
    const token = req.headers['authorization'].split(' ')[1]// Extracting token from Authorization header
    console.log('token',token)
    if (token === undefined) {
      return res.status(401).json({ message: 'Unauthorized - Token not provided' });
    }
  
    jwt.verify(token, '123', (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: 'Unauthorized - Invalid token' });
      }
  
      // Token is valid, decoded contains the user information
      console.log("token is valid and go to next")
      req.user = decoded;
      next();
    });
}
catch(e){
    console.log("Error occured in verifying token, please send jwt token for authentication",e)
}
  };

//user realted api's

// Login
app.post("/auth", async (req, res) => {
    try {
        await authorizationFunction.authorization(req, res,db);

        /*const response = await fetch('https://dummyjson.com/users')
        const data = await response.json()
        const {users} = data
        const splitData = users.slice(0,10)
        const modifiedData = splitData.map(each=>({
            id:each.id,
            username: each.username,
            password:each.password,
            email: each.email,
            image: 'https://fastly.picsum.photos/id/22/4434/3729.jpg?hmac=fjZdkSMZJNFgsoDh8Qo5zdA_nSGUAWvKLyyqmEt2xs0'

        }))

        modifiedData.forEach(async element=>{
            const {id,username,password,email,image} = element
            const hashedPassword = await bcrypt.hash(password,10)
            const query = `
                insert into user(id,username,password,email,image)
                values(?,?,?,?,?)
            `
            await db.run(query,[id,username,hashedPassword,email,image])
            console.log("done!")
        })

        res.send('Data inserted successfully')*/

    } catch (error) {
        console.error("Error in /auth route:", error);
        res.status(500).send("Internal Server Error");
    }
});

//Register

app.post('/register', async (req, res) => {
    try {
        await authorizationFunction.register(req,res,db)
    } catch (error) {
        console.error('Registration failed:', error.message);
        res.status(500).send('Internal Server Error');
    }
});

//specific user
app.get('/userProfile/:id', verifyToken,async (req,res)=>{
    try{
        await authorizationFunction.profileManagement(req,res,db)
    }
    catch(e){
        console.log("Error occured",e)
        res.status(400).send('Client Error')
    }
})

//update user details

app.put('/updateProfile/:id',verifyToken,async (req,res)=>{
    try{
        await authorizationFunction.updateProfile(req,res,db)
    }
    catch(e){
        console.log("Failed to make request on server")
        console.log(e)
    }
})

//Delete user
app.delete('/deleteUser/:id',verifyToken,async(req,res)=>{
    try{
        await authorizationFunction.UserDelete(req,res,db)
    }
    catch(e){
        console.log("Failed to make request to delete user")
        console.log(e)
    }
})



//recipe related api's

//creating Recipe
app.post('/newRecipe',verifyToken,async (req,res)=>{
    try{
        await RecipeInstance.addRecipe(req,res,db2)
    }
    catch(e){
        console.log("Failed to add new Recipe",e)
    }
})

//Retrieving Recipe
app.get('/recipe/:id',verifyToken,async(req,res)=>{
    try{
        await RecipeInstance.getRecipe(req,res,db2)
       
    }
    catch(e){
        console.log("Failed to get the Recipe with the given id",e)
    }
})

//Update Recipe

app.put('/recipeUpdate/:id',verifyToken,async(req,res)=>{
    try{
        await RecipeInstance.updateRecipe(req,res,db2)
    }
    catch(e){
        console.log("Failed to update",e)
    }

})

//Delete Recipe
app.delete('/recipeDelete/:id',verifyToken,async(req,res)=>{
    try{
        await RecipeInstance.DeleteRecipe(req,res,db2)

    }
    catch(e){
        console.log("Failed to delte record")
    }
})


