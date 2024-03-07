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
    await db.run(query, [newUser.username, newUser.password, newUser.image,newUser.email]);
        console.log('last Id',this)
        res.status(201).send("Registration Successful");
    }
    else{
        
         res.status(409).send('User already exists');
    }
}

async specificUser(req,res,db){
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




}


module.exports = User;
