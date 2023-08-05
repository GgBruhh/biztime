const express = require("express");
const ExpressError = require("../expressError")
const router = express.Router();
const db = require('../db');


router.get('/', async(req, res, next) =>{
    try{
        const results = await db.query(`SELECT id, comp_code FROM invoices`);
        return res.json({'invoices': results.rows});
    }
    catch(e){
        next(e);
    }
})


router.get('/:id', async(req, res, next) =>{
    try{
        const { id } = req.params;
        const results = await db.query(`SELECT * from invoices AS i FULL JOIN companies AS c on 
                                        (i.comp_code = c.code) WHERE id = $1 RETURNING *`, [id]);
        const data = result.rows[0];
        const invoice = {
            id: data.id,
            company: {
                code: data.comp_code,
                name: data.name,
                description: data.description,
                },
                amt: data.amt,
                paid: data.paid,
                add_date: data.add_date,
                paid_date: data.paid_date,
            };
            return res.json({'invoice': invoice});
    }
    catch(e){
        next(e)
    }
})

router.post("/", async function (req, res, next) {
    try {
      let {comp_code, amt} = req.body;
  
      const result = await db.query(
            `INSERT INTO invoices (comp_code, amt) 
             VALUES ($1, $2) 
             RETURNING id, comp_code, amt, paid, add_date, paid_date`,
          [comp_code, amt]);
  
      return res.json({"invoice": result.rows[0]});
    }
  
    catch (err) {
      return next(err);
    }
  });
  
  router.put("/:id", async (req, res, next) => {
    try{
      let {amt, paid} = req.body;
      let id = req.params.id;
      let paidDate = null;
  
      const result = await db.query(
        `UPDATE invoices
         SET amt=$1, paid=$2, paid_date=$3
         WHERE id=$4
         RETURNING id, comp_code, amt, paid, add_date, paid_date`,
      [amt, paid, paidDate, id]);
      }
      catch(e){
        next(e)
      }
    })

    router.delete("/:id", async function (req, res, next) {
        try {
          let id = req.params.id;
      
          const result = await db.query(`DELETE FROM invoices WHERE id = $1 RETURNING id`, [id]);
          return res.json({"status": "deleted"});
        }
        catch (err) {
          return next(err);
        }
      });