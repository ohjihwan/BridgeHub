const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

class User {
    constructor() {
        this.pool = mysql.createPool({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'bridgehub',
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0,
            charset: 'utf8mb4'
        });
    }

    async createUser({ userid, name, password, phone, gender, education, nickname }) {
        try {
            const hashedPassword = await bcrypt.hash(password, 10);
            const [result] = await this.pool.execute(
                'INSERT INTO members (userid, name, password, phone, gender, education, nickname) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [userid, name, hashedPassword, phone, gender, education, nickname]
            );
            return result.insertId;
        } catch (error) {
            throw error;
        }
    }

    async findByUserid(userid) {
        try {
            const [rows] = await this.pool.execute(
                'SELECT * FROM members WHERE userid = ?',
                [userid]
            );
            return rows[0];
        } catch (error) {
            throw error;
        }
    }

    async findById(id) {
        try {
            const [rows] = await this.pool.execute(
                'SELECT * FROM members WHERE id = ?',
                [id]
            );
            return rows[0];
        } catch (error) {
            throw error;
        }
    }

    async verifyPassword(password, hashedPassword) {
        return await bcrypt.compare(password, hashedPassword);
    }
}

module.exports = new User(); 