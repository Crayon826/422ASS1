/*********************************************************************************
* WEB422 – Assignment 1
* I declare that this assignment is my own work in accordance with Seneca Academic Policy.
* No part of this assignment has been copied manually or electronically from any other source
* (including web sites) or distributed to other students.
*
* Name: Tim Lin Student ID: 105586192 Date: 2021-09-17
* Heroku Link: https://web422-tim.herokuapp.com/
*
********************************************************************************/ 

const express = require('express')
const app = express()
require('dotenv').config()
const {query,body,params,validationResult} = require('express-validator')
const RestaurantDB = require('./modules/restaurantDB.js');
const db = new RestaurantDB();

const cors = require('cors')

app.use(express.json())
app.use(cors())
app.get('/', async (req, res) => {
	res.json({ message: 'API Listening' });
});
app.post('/api/restaurants', async (req, res, next) => {
	try {
		const data = req.body;
		await db.addNewRestaurant(data);
		res.json({
			message: 'success',
		});
	} catch (error) {
		console.log(error);
		next(error);
	}
});
app.get(
	'/api/restaurants',
	[query('page'), query('perPage')],
	async (req, res, next) => {
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				return res.status(400).json({ errors: errors.array() });
			} 
			const { page, perPage, borough } = req.query;
			const allRestaurants = await db.getAllRestaurants(page, perPage, borough);
			res.json({
				data: allRestaurants,
				message: 'success',
			});
		} catch (error) {
			next(error);
		}
	}
);
app.get('/api/restaurants/:_id', async (req, res, next) => {
	try {
		const { _id } = req.params;
		const restaurant = await db.getRestaurantById(_id);
		res.json(restaurant);
	} catch (error) {
		next(error);
	}
});
app.put('/api/restaurants/:_id', body('_id'), async (req, res, next) => {
	try {
		const data = req.body;
		const { _id } = req.params;
		await db.updateRestaurantById(data, _id);
		res.json({
			message: 'success',
		});
	} catch (error) {
		next(error);
	}
});
app.delete('/api/restaurants/:_id', async (req, res, next) => {
	try {
		const { _id } = req.params;
		await db.deleteRestaurantById(_id);
		res.json({
			message: 'success',
		});
	} catch (error) {
		next(error);
	}
});

app.use((err, req, res, next) => {
	console.log(err);
	res.json({
		code: 500,
		message:'Internal server error'
	})
})

db.initialize(process.env.MONGODB_CONN_STRING)
	.then(() => {
		app.listen(process.env.HTTP_PORT, () => {
			console.log(`server listening on: ${process.env.HTTP_PORT}`);
		});
	})
	.catch(err => { 
		console.log(err);
	});
