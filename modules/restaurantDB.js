const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const restaurantSchema = new Schema({
	address: {
		building: String,
		coord: [Number],
		street: String,
		zipcode: String,
	},
	borough: String,
	cuisine: String,
	grades: [
		{
			date: Date,
			grade: String,
			score: Number,
		},
	],
	name: String,
	restaurant_id: String,
});

module.exports = class RestaurantDB {
	constructor() {
		// We don't have a `Restaurant` object until initialize() is complete
		this.Restaurant = null;
	}

	// Pass the connection string to `initialize()`
	initialize(connectionString) {
		return new Promise((resolve, reject) => {
			const db = mongoose.createConnection(connectionString, {
				useNewUrlParser: true,
				useUnifiedTopology: true,
			});

			db.once('error', err => {
				reject(err);
			});
			db.once('open', () => {
				this.Restaurant = db.model('restaurants', restaurantSchema);
				console.log(this.Restaurant);
				resolve();
			});
		});
	}

	async addNewRestaurant(data) {
		const newRestaurant = new this.Restaurant(data);
		await newRestaurant.save();
		return newRestaurant;
	}

	getAllRestaurants(page, perPage, borough) {
		let findBy = borough ? { borough } : {};
		if (+page && +perPage) {
			return this.Restaurant.find(findBy)
				.sort({ restaurant_id: +1 })
				.skip((page - 1) * +perPage)
				.limit(+perPage)
				.exec();
		}

		return Promise.reject(
			new Error('page and perPage query parameters must be valid numbers')
		);
	}

	getRestaurantById(id) {
		return this.Restaurant.findOne({ _id: id }).exec();
	}

	updateRestaurantById(data, id) {
		return this.Restaurant.updateOne({ _id: id }, { $set: data }).exec();
	}

	deleteRestaurantById(id) {
		return this.Restaurant.deleteOne({ _id: id }).exec();
	}
};
