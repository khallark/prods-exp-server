import pkg from 'pg';
const { Pool } = pkg;

import dotenv from 'dotenv';
dotenv.config();

// PostgreSQL connection pool setup
const pool = new Pool({
    host: process.env.PG_HOST,
    user: process.env.PG_USER,
    password: process.env.PG_PASSWORD,
    database: process.env.PG_DATABASE,
    port: process.env.PG_PORT || 5432,
});

export async function addProduct(category, product_name, batch_number, qty, price, manufacturer_name, bill_number, expiry_date, is_sold) {
    try {
        await pool.query(`
            INSERT INTO products (category, product_name, batch_number, qty, price, manufacturer_name, bill_number, expiry_date, is_sold)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9);
        `, [category, product_name.replace(/\s+/g, ' ').trim(), batch_number, qty, price, manufacturer_name.replace(/\s+/g, ' ').trim(), bill_number, expiry_date, is_sold]);
    } catch (error) {
        console.error("Database error adding product:", error);
        throw new Error("Failed to add product to the database");
    }
}

export async function all_prods() {
    const result = await pool.query(
        `SELECT *
        FROM products
        ORDER BY expiry_date ASC;`
    );
    return result.rows;
}

export async function six_month_exp_prods() {
    const result = await pool.query(
        `SELECT *
        FROM products
        WHERE expiry_date > CURRENT_DATE AND expiry_date <= CURRENT_DATE + INTERVAL '6 months'
        ORDER BY expiry_date ASC;`
    );
    return result.rows;
}

export async function three_month_exp_prods() {
    const result = await pool.query(
        `SELECT *
        FROM products
        WHERE expiry_date > CURRENT_DATE AND expiry_date <= CURRENT_DATE + INTERVAL '3 months'
        ORDER BY expiry_date ASC;`
    );
    return result.rows;
}

export async function expd_prods() {
    const result = await pool.query(
        `SELECT *
        FROM products
        WHERE expiry_date <= CURRENT_DATE
        ORDER BY expiry_date ASC;`
    );
    return result.rows;
}

export async function delete_prod(values) {
    await pool.query(
        `DELETE
        FROM products
        WHERE category = $1 AND product_name = $2 AND batch_number = $3 AND qty = $4 AND price = $5 AND manufacturer_name = $6 AND bill_number = $7 AND expiry_date = $8`,
        values
    );
}

function isValidDateFormat(dateString) {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    return regex.test(dateString);
}

export async function search_string_pref(string) {
    if (isValidDateFormat(string)) {
        const result = await pool.query(
            `SELECT *
            FROM products
            WHERE expiry_date = $1`,
            [string]
        );
        return result.rows;
    }
    string = '%' + string.toLowerCase() + '%';
    const result = await pool.query(
        `SELECT *
        FROM products
        WHERE LOWER(category) LIKE $1 OR
        LOWER(product_name) LIKE $2 OR
        LOWER(batch_number) LIKE $3 OR
        LOWER(manufacturer_name) LIKE $4 OR
        LOWER(bill_number) LIKE $5`,
        [string, string, string, string, string]
    );
    return result.rows;
}

export async function search_string_hard(string) {
    if (isValidDateFormat(string)) {
        const result = await pool.query(
            `SELECT *
            FROM products
            WHERE expiry_date = $1`,
            [string]
        );
        return result.rows;
    }
    string = string.toLowerCase().replace(/\s+/g, ' ').trim();
    const result = await pool.query(
        `SELECT *
        FROM products
        WHERE LOWER(product_name) = $1`,
        [string]
    );
    return result.rows;
}
