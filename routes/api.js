/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

require('dotenv').config();
var expect = require('chai').expect;
var MongoClient = require('mongodb');
var axios = require('axios');

const CONNECTION_STRING = process.env.DB; //MongoClient.connect(CONNECTION_STRING, function(err, db) {});

module.exports = function (app) {

  app.route('/api/stock-prices')
    .get(function (req, res){
       var stock = (req.query.stock || '').toUpperCase();
       axios.get('https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=' + stock + '&apikey=' + process.env.ALPHPA_VANTAGE_KEY)
         .then(function(response) {
           //return res.json(response.data);
           res.json({
             stockData: {
               stock: stock,
               price: response.data['Global Quote']['05. price'],
             }
           });
         });
    });    
};
