const bcrypt = require('bcrypt')
const jwtToken = require('jsonwebtoken')
const Cookies = require("js-cookie")

class User {

    

    async authorization(req, res, db) {
        try {
            const { username, password } = req.body;
            console.log('Request body:', req.body);
    
            const isExist = `SELECT * FROM user WHERE username='${username}'`;
            const result = await db.get(isExist);
            console.log('Result from database:', result);
    
            if (result !== undefined) {
                const  hashedPassword  = result.password;
    
                if (password && hashedPassword) {
                    console.log('Attempting password comparison...');
                    const isPasswordMatched = await bcrypt.compare(password, hashedPassword);
                    console.log('Is password matched:', isPasswordMatched);
    
                    if (isPasswordMatched) {
                        const { id } = result;
                        const payLoad = {
                            id,
                            username
                        };
    
                        const token = jwtToken.sign(payLoad, '123');
                        
                        
                        return res.status(200).send({ "jwtToken": token });
                    } else {
                        console.log('Password did not match.');
                        return res.status(401).send('Invalid Password');
                    }
                } else {
                    console.log('Password or hashedPassword is missing.');
                    
                    return res.status(400).send('Invalid request');
                }
            } else {
                console.log('User not found.');
                return res.status(404).send('User not found');
            }
        } catch (e) {
            console.error('Error during authentication:', e);
            return res.status(500).send('Internal Server Error');
        }
    }
    
    

async register(req,res,db){

try{

    const { username, password ,email} = req.body;
    console.log("request boyd",req.body)
        const hashedPassword = await bcrypt.hash(password, 10);
    const isExist = `select * from user where username='${username}'`;
    const result = await db.get(isExist)
console.log('result from register',result)
    if (result === undefined){

        const newUser = {
            
            username,
            password: hashedPassword,
            image: 'https://source.unsplash.com/user/c_v_r/1900x800',
            email: email
        };

        const query = `INSERT INTO user( username, password, image,email) VALUES ( ?, ?,?, ?)`;
    const insertResult = await db.run(query, [newUser.username, newUser.password, newUser.image,newUser.email]);
        console.log('last Id',insertResult)
        const {lastID} = insertResult
        res.status(201).send(`Registration Successful ,id=${lastID}`);
    }
    else{
        
         res.status(409).send('User already exists');
    }
}
catch(e){
    console.log("Error occured in register method")
}
}

async profileManagement(req,res,db){
    try{
    const {id} = req.params
    const query = `select * from user where id=${id}`
    const user = await db.get(query)
    if (user !== undefined){
        res.send(user)
    }
    else{
        res.send("User not found . Try Again")
    }
}
    catch(e){
        console.log("Error occured in user class Profile management")
    }
}

async updateProfile(req,res,db){
    try{
    const {id} = req.params
    const query=`select * from user where id=${id}`;

    const result = await db.get(query)
    if (result !== undefined){
    const {username,password,email,image} = req.body
    const updateQuery = `update user set username='${username}', password='${password}', email='${email}' , image='${image}' `
    await db.run(updateQuery)
    res.send("User profile updated Successfully")
    }
    else{
        res.send("User with given Id is not found to update profile")
    }
}
catch(e){
    console.log("Error occured in updating user profile")
    console.log(e)
}
}

async UserDelete(req,res,db){
    try{
    const {id}=req.params
    const query=`delete from user where id=${id}`
    const dleteRest = await db.run(query)
    console.log('delete result',dleteRest)
    const {changes} = dleteRest
    console.log('changes',changes)
    if (changes === 1){
        res.send("User Deleted Successfully")
    }
    else{
        res.send("User not found to delete")
    }

}
catch(e){
    console.log("Error occured in deleting user")
}
}



}


module.exports = User;
