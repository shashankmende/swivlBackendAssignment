

class Recipe {

    async addRecipe(req,res,db){
        const {title,description,ingredients,instructions,user_id} = req.body
        const isExist = `select * from recipe where title='${title}'`
        const result = await db.get(isExist)
        console.log("result from add recipe",result)
        if (result === undefined){
        const query = `insert into recipe(title,description,ingredients,instructions,user_id) values('${title}','${description}','${ingredients}','${instructions}',${user_id})`
        await db.run(query)
        res.status(201).send("Recipe added successfully")
    }
    else{
        res.status(400).send("Recipe with the given title already exist")
    }
    }

    async getRecipe(req,res,db){
        
        const {id}=req.params
        const query=`select * from recipe where id=${id}`
        const item=await db.get(query)
        if (item !== undefined){
            res.send(item)
        }
        else{
            res.send(`Recipe with id ${id} is not found, try again`)
        }
        
    }

    async updateRecipe(req,res,db){

        const {id} = req.params
        console.log('id in update',id)
        const {title,description,ingredients,instructions} = req.body
        console.log("body",req.body)
        const query =`update recipe set title='${title}',description='${description}',
         ingredients='${ingredients}', instructions='${instructions}'
         where id=${id}
         `
        await db.run(query)
        res.send("Updated Successfully")

    }

    async DeleteRecipe(req,res,db){
        const {id} = req.params
        const query = `delete from recipe where id=${id}`;
        
        await db.run(query)
        res.send("Record Deleted")
    }

}

module.exports = Recipe