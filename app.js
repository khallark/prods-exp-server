import express from 'express'
import dotenv from "dotenv"
import cors from 'cors'
dotenv.config()
import { addProduct, all_prods, six_month_exp_prods, three_month_exp_prods, expd_prods, delete_prod, search_string_pref, search_string_hard } from "./databases.js"

const app = express()
app.use(cors());
app.use(express.json())
const PORT = process.env.PORT || 5432

app.get("/", async (req, res) => {
    res.send("Hello world!")
})

const header = ["category", "product_name", "batch_number", "qty", "price", "manufacturer_name", "bill_number", "expiry_date", "is_sold"];
function map(product) {return product.map(product => header.map(key => product[key]));}

app.get("/allProds", async (req, res) => {res.send(map(await all_prods()));})
app.get("/expiring", async (req, res) => {res.send(map(await six_month_exp_prods()));})
app.get("/expiring3", async (req, res) => {res.send(map(await three_month_exp_prods()));})
app.get("/expired", async (req, res) => {res.send(map(await expd_prods()));})

app.get("/searchStringPref/:str", async (req, res) => {
    const { str } = req.params;
    const products = await search_string_pref(str);
    res.send(products);
})

app.get("/searchStringHard/:str", async (req, res) => {
    const { str } = req.params;
    const products = await search_string_hard(str);
    res.send(products);
})

app.delete('/delete', async (req, res) => {
    // Destructure parameters from the query string
    const { category, product_name, batch_number, qty, price, manufacturer_name, bill_number, expiry_date } = req.query;
    const values = [category, product_name, batch_number, qty, price, manufacturer_name, bill_number, expiry_date];
    console.log(`Deleting product: ${category}, ${product_name}, ${batch_number}, ${qty}, ${price}, ${manufacturer_name}, ${bill_number}, ${expiry_date}`);
    await delete_prod(values);
    res.send("Row deleted successfully");
});

app.post("/addproduct", async (req, res) => {
    try {
        const { category, product_name, batch_number, qty, price, manufacturer_name, bill_number, expiry_date, is_sold } = req.body;
        await addProduct(category, product_name, batch_number, qty, price, manufacturer_name, bill_number, expiry_date, is_sold);
        res.status(201).send("Row added successfully");
    } catch (error) {
        console.error("Error adding product:", error);
        res.status(500).json({ message: "Error adding product to the database." });
    }
})



app.use((err, req, res, next) => {
    console.error(err.stack)
    res.status(500).send('Something broke!')
})



app.listen(PORT, () => {
    console.log(`Server is running on post ${PORT}`)
})