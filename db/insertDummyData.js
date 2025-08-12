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

// Dummy data
const developers = [
	{
		name: "Nintendo",
		description:
			"Japanese multinational video game company known for iconic franchises like Mario, Zelda, and Pokémon.",
		followers: 15000000,
		founding_date: "1889-09-23",
	},
	{
		name: "Valve Corporation",
		description:
			"American video game developer and digital distribution company, creators of Steam platform and Half-Life series.",
		followers: 8500000,
		founding_date: "1996-08-24",
	},
	{
		name: "CD Projekt RED",
		description:
			"Polish video game developer known for The Witcher series and Cyberpunk 2077.",
		followers: 3200000,
		founding_date: "2002-01-01",
	},
	{
		name: "Rockstar Games",
		description:
			"American video game publisher known for Grand Theft Auto and Red Dead Redemption series.",
		followers: 12000000,
		founding_date: "1998-12-01",
	},
	{
		name: "FromSoftware",
		description:
			"Japanese video game development company known for challenging action RPGs like Dark Souls and Elden Ring.",
		followers: 2800000,
		founding_date: "1986-11-01",
	},
];

const games = [
	{
		title: "The Legend of Zelda: Breath of the Wild",
		description:
			"An open-world action-adventure game that revolutionized the Zelda formula with complete freedom of exploration.",
		rating: 4.9,
		price: 59.99,
		developer_name: "Nintendo",
	},
	{
		title: "Half-Life 2",
		description:
			"A groundbreaking first-person shooter that set new standards for physics-based gameplay and storytelling.",
		rating: 4.8,
		price: 9.99,
		developer_name: "Valve Corporation",
	},
	{
		title: "The Witcher 3: Wild Hunt",
		description:
			"An epic open-world RPG following Geralt of Rivia on his quest to find his adopted daughter.",
		rating: 4.7,
		price: 39.99,
		developer_name: "CD Projekt RED",
	},
	{
		title: "Grand Theft Auto V",
		description:
			"An open-world crime action-adventure game set in the fictional city of Los Santos.",
		rating: 4.5,
		price: 29.99,
		developer_name: "Rockstar Games",
	},
	{
		title: "Elden Ring",
		description:
			"A fantasy action RPG developed in collaboration with George R.R. Martin, featuring an open world.",
		rating: 4.6,
		price: 59.99,
		developer_name: "FromSoftware",
	},
	{
		title: "Portal 2",
		description:
			"A puzzle-platform game featuring innovative portal mechanics and cooperative gameplay.",
		rating: 4.9,
		price: 19.99,
		developer_name: "Valve Corporation",
	},
	{
		title: "Super Mario Odyssey",
		description:
			"A 3D platform game featuring Mario's cap-throwing abilities across various kingdoms.",
		rating: 4.8,
		price: 49.99,
		developer_name: "Nintendo",
	},
	{
		title: "Cyberpunk 2077",
		description:
			"A futuristic open-world RPG set in Night City with cybernetic enhancements and multiple storylines.",
		rating: 3.8,
		price: 29.99,
		developer_name: "CD Projekt RED",
	},
];

const genres = [
	"Action",
	"Adventure",
	"RPG",
	"Shooter",
	"Platform",
	"Puzzle",
	"Open World",
	"Simulation",
	"Strategy",
	"Racing",
	"Fighting",
	"Horror",
];

const platforms = [
	"PC",
	"PlayStation 5",
	"PlayStation 4",
	"Xbox Series X/S",
	"Xbox One",
	"Nintendo Switch",
	"iOS",
	"Android",
	"Steam Deck",
	"VR",
];

// Game-Genre mappings
const gameGenres = {
	"The Legend of Zelda: Breath of the Wild": [
		"Action",
		"Adventure",
		"Open World",
	],
	"Half-Life 2": ["Action", "Shooter", "Adventure"],
	"The Witcher 3: Wild Hunt": ["RPG", "Action", "Open World"],
	"Grand Theft Auto V": ["Action", "Adventure", "Open World"],
	"Elden Ring": ["RPG", "Action", "Adventure"],
	"Portal 2": ["Puzzle", "Adventure", "Platform"],
	"Super Mario Odyssey": ["Platform", "Adventure", "Action"],
	"Cyberpunk 2077": ["RPG", "Action", "Open World"],
};

// Game-Platform mappings
const gamesPlatforms = {
	"The Legend of Zelda: Breath of the Wild": ["Nintendo Switch"],
	"Half-Life 2": ["PC", "PlayStation 4", "Xbox One"],
	"The Witcher 3: Wild Hunt": [
		"PC",
		"PlayStation 5",
		"PlayStation 4",
		"Xbox Series X/S",
		"Xbox One",
		"Nintendo Switch",
	],
	"Grand Theft Auto V": [
		"PC",
		"PlayStation 5",
		"PlayStation 4",
		"Xbox Series X/S",
		"Xbox One",
	],
	"Elden Ring": [
		"PC",
		"PlayStation 5",
		"PlayStation 4",
		"Xbox Series X/S",
		"Xbox One",
	],
	"Portal 2": ["PC", "PlayStation 4", "Xbox One", "Steam Deck"],
	"Super Mario Odyssey": ["Nintendo Switch"],
	"Cyberpunk 2077": [
		"PC",
		"PlayStation 5",
		"PlayStation 4",
		"Xbox Series X/S",
		"Xbox One",
	],
};

async function insertDummyData() {
	console.log("Connecting database...");

	const client = new Client({ connectionString });

	try {
		await client.connect();
		console.log("Connected database...");

		// clear existing data
		await client.query("DELETE FROM games_platforms");
		await client.query("DELETE FROM games_genres");
		await client.query("DELETE FROM games");
		await client.query("DELETE FROM genres");
		await client.query("DELETE FROM platforms");
		await client.query("DELETE FROM developers");

		// restart sequence tables
		await client.query("ALTER SEQUENCE games_id_seq RESTART WITH 1");
		await client.query("ALTER SEQUENCE developers_id_seq RESTART WITH 1");
		await client.query("ALTER SEQUENCE genres_id_seq RESTART WITH 1");
		await client.query("ALTER SEQUENCE platforms_id_seq RESTART WITH 1");

		// insert developers
		for (const dev of developers) {
			const developersText = `INSERT INTO developers (name, description, followers, founding_date) VALUES ($1, $2, $3, $4)`;

			const developersParams = [
				dev.name,
				dev.description,
				dev.followers,
				dev.founding_date,
			];
			await client.query(developersText, developersParams);
		}

		// insert games
		for (const game of games) {
			const result = await client.query(
				"SELECT id FROM developers WHERE name=$1",
				[game.developer_name],
			);

			const developerId = result.rows[0].id;
			const gamesText = `INSERT INTO games (title, description, rating, price, developer_id) VALUES ($1, $2, $3, $4, $5)`;
			const gamesParams = [
				game.title,
				game.description,
				game.rating,
				game.price,
				developerId,
			];

			await client.query(gamesText, gamesParams);
		}

		// insert genres
		for (const genre of genres) {
			await client.query("INSERT INTO genres (type) VALUES ($1)", [
				genre,
			]);
		}

		// insert platforms
		for (const platform of platforms) {
			await client.query("INSERT INTO platforms (type) VALUES ($1)", [
				platform,
			]);
		}

		// insert gameGenres
		for (const [game, genres] of Object.entries(gameGenres)) {
			const result = await client.query(
				"SELECT id FROM games WHERE title=$1",
				[game],
			);

			const gameId = result.rows[0].id;

			for (const genre of genres) {
				const result = await client.query(
					"SELECT id FROM genres WHERE type=$1",
					[genre],
				);

				const genreId = result.rows[0].id;

				await client.query(
					"INSERT INTO games_genres (game_id, genres_id) VALUES ($1, $2)",
					[gameId, genreId],
				);
			}
		}

		// insert gamesPlatforms
		for (const [game, platforms] of Object.entries(gamesPlatforms)) {
			const result = await client.query(
				"SELECT id FROM games WHERE title=$1",
				[game],
			);

			const gameId = result.rows[0].id;

			for (const platform of platforms) {
				const result = await client.query(
					"SELECT id FROM platforms WHERE type=$1",
					[platform],
				);

				const platformId = result.rows[0].id;

				await client.query(
					"INSERT INTO games_platforms (game_id, platforms_id) VALUES ($1, $2)",
					[gameId, platformId],
				);
			}
		}
	} catch (err) {
		console.error("Database error: ", {
			message: err.message,
			code: err.code,
			stack: err.stack,
		});
		throw err;
	} finally {
		client.end();
		console.log("End");
	}
}

// async function testing() {
// 	const client = new Client({ connectionString });
// 	await client.connect();
// 	const result = await client.query("SELECT id FROM genres WHERE type=$1", [
// 		"classic",
// 	]);
// 	await client.end();
// 	console.log(result.rows[0].id);
// }

insertDummyData();
// async function insertDummyData() {
// 	console.log("Connecting to database...");

// 	const client = new Client({ connectionString });

// 	try {
// 		await client.connect();
// 		console.log("Connected successfully!");

// 		// Clear existing data (in reverse order due to foreign key constraints)
// 		console.log("Clearing existing data...");
// 		await client.query("DELETE FROM games_platforms");
// 		await client.query("DELETE FROM games_genres");
// 		await client.query("DELETE FROM games");
// 		await client.query("DELETE FROM platforms");
// 		await client.query("DELETE FROM genres");
// 		await client.query("DELETE FROM developers");

// 		// Reset sequences
// 		await client.query("ALTER SEQUENCE developers_id_seq RESTART WITH 1");
// 		await client.query("ALTER SEQUENCE games_id_seq RESTART WITH 1");
// 		await client.query("ALTER SEQUENCE genres_id_seq RESTART WITH 1");
// 		await client.query("ALTER SEQUENCE platforms_id_seq RESTART WITH 1");

// 		// Insert developers
// 		console.log("Inserting developers...");
// 		for (const dev of developers) {
// 			await client.query(
// 				`INSERT INTO developers (name, description, followers, founding_date)
// 				 VALUES ($1, $2, $3, $4)`,
// 				[dev.name, dev.description, dev.followers, dev.founding_date],
// 			);
// 		}
// 		console.log(`Inserted ${developers.length} developers`);

// 		// Insert genres
// 		console.log("Inserting genres...");
// 		for (const genre of genres) {
// 			await client.query(`INSERT INTO genres (type) VALUES ($1)`, [
// 				genre,
// 			]);
// 		}
// 		console.log(`Inserted ${genres.length} genres`);

// 		// Insert platforms
// 		console.log("Inserting platforms...");
// 		for (const platform of platforms) {
// 			await client.query(`INSERT INTO platforms (type) VALUES ($1)`, [
// 				platform,
// 			]);
// 		}
// 		console.log(`Inserted ${platforms.length} platforms`);

// 		// Insert games
// 		console.log("Inserting games...");
// 		for (const game of games) {
// 			// Get developer ID
// 			const devResult = await client.query(
// 				`SELECT id FROM developers WHERE name = $1`,
// 				[game.developer_name],
// 			);
// 			const developerId = devResult.rows[0].id;

// 			await client.query(
// 				`INSERT INTO games (title, description, rating, price, developer_id)
// 				 VALUES ($1, $2, $3, $4, $5)`,
// 				[
// 					game.title,
// 					game.description,
// 					game.rating,
// 					game.price,
// 					developerId,
// 				],
// 			);
// 		}
// 		console.log(`Inserted ${games.length} games`);

// 		// Insert game-genre relationships
// 		console.log("Inserting game-genre relationships...");
// 		let genreRelationships = 0;
// 		for (const [gameTitle, gameGenresList] of Object.entries(gameGenres)) {
// 			// Get game ID
// 			const gameResult = await client.query(
// 				`SELECT id FROM games WHERE title = $1`,
// 				[gameTitle],
// 			);
// 			const gameId = gameResult.rows[0].id;

// 			// Insert relationships for each genre
// 			for (const genreType of gameGenresList) {
// 				const genreResult = await client.query(
// 					`SELECT id FROM genres WHERE type = $1`,
// 					[genreType],
// 				);
// 				const genreId = genreResult.rows[0].id;

// 				await client.query(
// 					`INSERT INTO games_genres (game_id, genres_id) VALUES ($1, $2)`,
// 					[gameId, genreId],
// 				);
// 				genreRelationships++;
// 			}
// 		}
// 		console.log(`Inserted ${genreRelationships} game-genre relationships`);

// 		// Insert game-platform relationships
// 		console.log("Inserting game-platform relationships...");
// 		let platformRelationships = 0;
// 		for (const [gameTitle, gamePlatformsList] of Object.entries(
// 			gamesPlatforms,
// 		)) {
// 			// Get game ID
// 			const gameResult = await client.query(
// 				`SELECT id FROM games WHERE title = $1`,
// 				[gameTitle],
// 			);
// 			const gameId = gameResult.rows[0].id;

// 			// Insert relationships for each platform
// 			for (const platformType of gamePlatformsList) {
// 				const platformResult = await client.query(
// 					`SELECT id FROM platforms WHERE type = $1`,
// 					[platformType],
// 				);
// 				const platformId = platformResult.rows[0].id;

// 				await client.query(
// 					`INSERT INTO games_platforms (game_id, platforms_id) VALUES ($1, $2)`,
// 					[gameId, platformId],
// 				);
// 				platformRelationships++;
// 			}
// 		}
// 		console.log(
// 			`Inserted ${platformRelationships} game-platform relationships`,
// 		);

// 		console.log("\n=== Summary ===");
// 		console.log(`✅ ${developers.length} developers inserted`);
// 		console.log(`✅ ${genres.length} genres inserted`);
// 		console.log(`✅ ${platforms.length} platforms inserted`);
// 		console.log(`✅ ${games.length} games inserted`);
// 		console.log(
// 			`✅ ${genreRelationships} game-genre relationships inserted`,
// 		);
// 		console.log(
// 			`✅ ${platformRelationships} game-platform relationships inserted`,
// 		);
// 		console.log("🎉 Dummy data insertion completed successfully!");
// 	} catch (err) {
// 		console.error("❌ Database error: ", {
// 			message: err.message,
// 			code: err.code,
// 			stack: err.stack,
// 		});
// 	} finally {
// 		await client.end();
// 		console.log("Database connection closed.");
// 	}
// }

// Run the script
// insertDummyData();
