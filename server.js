/*********************************************************************************
* WEB422 – Assignment 1
* I declare that this assignment is my own work in accordance with Seneca Academic Policy.
* No part of this assignment has been copied manually or electronically from any other source
* (including web sites) or distributed to other students.
*
* Name: Tim Lin Student ID: 105586192 Date: 2021-09-17
*
* Github Link: https://github.com/Crayon826/422ASS1
*
* Heroku Link: https://web422-test2.herokuapp.com/
*
********************************************************************************/ 

const express = require('express')
var cors = require('cors')
const app = express()
const HTTP_PORT = process.env.PORT || 8080
const RestaurantDB = require('./modules/restaurantDB.js')
const db = new RestaurantDB()
const dotenv = require('dotenv').config()
const { query, validationResult } = require('express-validator')

const MONGO_URL = process.env.MONGODB_CONN_STRING

db.initialize(MONGO_URL)
  .then(() => {
    app.listen(HTTP_PORT, () => {
      console.log(`server listening on: ${HTTP_PORT}`)
    })
  })
  .catch(err => {
    console.log(err)
  })

app.use(express.json())
app.use(cors())
app.get('/', async (req, res) => {
  res.json({ message: 'API Listening' })
})
app.post('/api/restaurants', async (req, res, next) => {
  try {
    const data = req.body
    await db.addNewRestaurant(data)
    res.json({
      message: 'success',
    })
  } catch (error) {
    console.log(error)
    next(error)
  }
})
app.get('/api/restaurants', [query('page'), query('perPage')], async (req, res, next) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }
    let { page, perPage, borough } = req.query
    page = parseInt(page)
    page = parseInt(perPage)
    const allRestaurants = await db.getAllRestaurants(page, perPage, borough)
    console.log(allRestaurants)
    res.json({
      data: allRestaurants,
      message: 'success',
    })
  } catch (error) {
    next(error)
  }
})
app.get('/api/restaurants/:_id', async (req, res, next) => {
  try {
    const { _id } = req.params
    const restaurant = await db.getRestaurantById(_id)
    res.json(restaurant)
  } catch (error) {
    next(error)
  }
})

app.put('/api/restaurants/:id', (req, res) => {
  db.updateRestaurantById(req.body, req.params.id)
    .then(data => {
      res.status(201).json({
        message: 'data is successfully updated',
      })
    })
    .catch(err => {
      res.status(500).json({
        message: 'no restaurant data found with id by' + req.params.id,
      })
    })
})

app.delete('/api/restaurants/:_id', async (req, res, next) => {
  try {
    const { _id } = req.params
    await db.deleteRestaurantById(_id)
    res.json({
      message: 'success',
    })
  } catch (error) {
    next(error)
  }
})

app.use((err, req, res, next) => {
  console.log(err)
  res.json({
    code: 500,
    message: 'Internal server error',
  })
})
