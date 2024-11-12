import mysql from "mysql2"
import dotenv from "dotenv"
dotenv.config()

const pool = mysql.createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE
}).promise()



export async function addProduct(category, product_name, batch_number, qty, price, manufacturer_name, bill_number, expiry_date) {
    try {
        await pool.query(`
            INSERT INTO products (category, product_name, batch_number, qty, price, manufacturer_name, bill_number, expiry_date)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?);
        `, [category, product_name.replace(/\s+/g, ' ').trim(), batch_number, qty === null ? 0 : qty, price === null ? 0 : price, manufacturer_name === null ? 'NULL' : manufacturer_name.replace(/\s+/g, ' ').trim(), bill_number, expiry_date]);
    } catch (error) {
        console.error("Database error adding product:", error);
        throw new Error("Failed to add product to the database");
    }
}

export async function all_prods() {
    const [result] = await pool.query(
        `SELECT *
        FROM products
        ORDER BY expiry_date ASC;`
    )
    return result;
}

export async function six_month_exp_prods() {
    const [result] = await pool.query(
        `SELECT *
        FROM products
        WHERE expiry_date > CURDATE() AND expiry_date <= DATE_ADD(CURDATE(), INTERVAL 6 MONTH)
        ORDER BY expiry_date ASC;`
    )
    return result;
}

export async function expd_prods() {
    const [result] = await pool.query(
        `SELECT *
        FROM products
        WHERE expiry_date <= CURDATE()
        ORDER BY expiry_date ASC;`
    )
    return result;
}

export async function delete_prod(values) {
    await pool.query(
        `DELETE
        FROM products
        WHERE category = ? AND product_name = ? AND batch_number = ? AND qty = ? AND price = ? AND manufacturer_name = ? AND bill_number = ? AND expiry_date = ?`,
        values
    )
}


function isValidDateFormat(dateString) {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    return regex.test(dateString);
}
export async function search_string_pref(string) {
    if(isValidDateFormat(string)) {
        const [result] = await pool.query(
            `SELECT *
            FROM products
            WHERE expiry_date = ?`,
            [string]
        )
        console.log(result)
        return result;
    }
    string = string.toLowerCase() + '%';
    const [result] = await pool.query(
        `SELECT *
        FROM products
        WHERE LOWER(product_name) LIKE ? OR
        LOWER(batch_number) LIKE ? OR
        LOWER(manufacturer_name) LIKE ? OR
        LOWER(bill_number) LIKE ?`,
        [string, string, string, string]
    )
    // console.log(result)
    return result;
}
export async function search_string_hard(string) {
    if(isValidDateFormat(string)) {
        const [result] = await pool.query(
            `SELECT *
            FROM products
            WHERE expiry_date = ?`,
            [string]
        )
        return result;
    }
    string = string.toLowerCase().replace(/\s+/g, ' ').trim();
    const [result] = await pool.query(
        `SELECT *
        FROM products
        WHERE LOWER(product_name) = ?`,
        [string]
    )
    return result;
}