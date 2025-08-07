const { Client } = require("pg");
const { argv } = require("process");
require("dotenv").config({ debug: process.env.DEBUG });

const dbUser = process.env.DB_USER;
const dbPass = process.env.DB_PASSWORD;
const dbHost = process.env.DB_HOST;
const dbPort = process.env.DB_PORT;
const dbName = process.env.DB_NAME;

// to make database url dynamic, I am using process.argv
// the .env configurations for database is a fallback
const connectionString =
	argv[2] || `postgresql://${dbUser}:${dbPass}@${dbHost}:${dbPort}/${dbName}`;

const psqlText = `
	CREATE TABLE IF NOT EXISTS games (
		id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
		title VARCHAR ( 255 ) UNIQUE NOT NULL,
		release_date TIMESTAMPTZ DEFAULT NOW(),
		description TEXT,
		rating DECIMAL(2, 1) CHECK (rating >=0 AND rating <=5),
		price DECIMAL (10, 2),
		created_at TIMESTAMPTZ DEFAULT NOW(),
		updated_at TIMESTAMPTZ DEFAULT NOW(),
		developer_id INTEGER NOT NULL REFERENCES developers (id)
	);

	CREATE TABLE IF NOT EXISTS developers (
		id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
		name VARCHAR ( 255 ) UNIQUE NOT NULL,
		description TEXT NOT NULL,
		followers INTEGER DEFAULT 0 CHECK (followers >= 0),
		founding_date DATE DEFAULT CURRENT_DATE() CHECK (founding_date <= CURRENT_DATE)
	);

	CREATE TABLE IF NOT EXISTS genres (
		id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
		type VARCHAR ( 255 ) NOT NULL UNIQUE
	);
		
	CREATE TABLE IF NOT EXISTS categories (
		id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
		type VARCHAR ( 255 ) NOT NULL UNIQUE
	);

	CREATE TABLE IF NOT EXISTS games_genres (
		game_id INTEGER NOT NULL REFERENCES games (id),
		genres_id INTEGER NOT NULL REFERENCES genres (id),
		PRIMARY KEY (game_id, genres_id)
	);
		
	CREATE TABLE IF NOT EXISTS games_categories (
		game_id INTEGER NOT NULL REFERENCES games (id),
		categories_id INTEGER NOT NULL REFERENCES categories (id),
		PRIMARY KEY (game_id, categories_id)
	);
`;
const params = [];

async function main() {
	console.log("Connecting..");

	const client = new Client({ connectionString });

	try {
		await client.connect();
		await client.query(psqlText, params);
		await client.end();
	} catch (err) {
		console.error("Database error: ", {
			message: err.message,
			code: err.code,
			psqlText: psqlText,
			stack: err.stack,
		});
	}

	console.log("End..");
}

main();
