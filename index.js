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

      

        app.listen(3000, () => {
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
  };

//user realted api's

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

app.post('/register', async (req, res) => {
    try {
        await authorizationFunction.register(req,res,db)
    } catch (error) {
        console.error('Registration failed:', error.message);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/userProfile/:id', verifyToken,async (req,res)=>{
    try{
        await authorizationFunction.specificUser(req,res,db)
    }
    catch(e){
        console.log("Error occured",e)
        res.status(400).send('Client Error')
    }
})


//recipe related api's

app.post('/newRecipe',verifyToken,async (req,res)=>{
    try{
        await RecipeInstance.addRecipe(req,res,db2)
    }
    catch(e){
        console.log("Failed to add new Recipe",e)
    }
})

app.get('/recipe/:id',async(req,res)=>{
    try{
        await RecipeInstance.getRecipe(req,res,db2)
       
    }
    catch(e){
        console.log("Failed to get the Recipe with the given id",e)
    }
})


app.put('/recipeUpdate/:id',async(req,res)=>{
    try{
        await RecipeInstance.updateRecipe(req,res,db2)
    }
    catch(e){
        console.log("Failed to update",e)
    }

})


app.delete('/recipeDelete/:id',async(req,res)=>{
    try{
        await RecipeInstance.DeleteRecipe(req,res,db2)

    }
    catch(e){
        console.log("Failed to delte record")
    }
})


