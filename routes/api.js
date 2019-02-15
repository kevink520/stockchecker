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

const CONNECTION_STRING = process.env.DB;

module.exports = function (app) {
  MongoClient.connect(CONNECTION_STRING, function(err, db) {
    var collection = db.collection('stock_likes');
    app.route('/api/stock-prices')
      .get(function (req, res) {
         if (!req.query.stock) {
           return res.status(400)
             .type('text')
               .send('Missing stock in request');
         }

         if (typeof req.query.stock === 'string') {
           var stock = req.query.stock.toUpperCase();
           var isLiked = req.query.like === 'true';
           axios.get('https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=' + stock + '&apikey=' + process.env.ALPHPA_VANTAGE_KEY)
             .then(function(response) {
               if (Object.keys(response.data['Global Quote']).length === 0) {
                 return res.status(404)
                   .type('text')
                     .send('Stock ' + stock + ' not found');
               }

               var price = parseFloat(response.data['Global Quote']['05. price']).toFixed(2);
               collection.findOne({ stock: stock }, function(err, doc) {
                 if (err) {
                   console.log(err);
                 }

                 if (doc === null) {
                   collection.insertOne({
                     stock: stock,
                     likes: isLiked ? 1 : 0,
                   }, function(err, doc) {
                     if (err) {
                       console.log(err);
                     }

                     res.json({
                       stockData: {
                         stock: stock,
                         price: price,
                         likes: isLiked ? 1 : 0,
                       },
                     });
                   });
                 } else {
                   if (isLiked) {
                     collection.findOneAndUpdate({ stock: stock, }, {
                       $inc: {
                         likes: 1,
                       },
                     }, { returnOriginal: false, }, function(err, result) {
                       if (err) {
                         console.log(err);
                       }

                       res.json({
                         stockData: {
                           stock: stock,
                           price: price,
                           likes: result.value.likes,
                         },
                       });
                     });
                   } else {
                     res.json({
                       stockData: {
                         stock: stock,
                         price: price,
                         likes: doc.likes,
                       },
                     });
                   }
                 }
               });
             })
               .catch(function(err) {
                 console.log(err);
               });
          }
        });
    
    //404 Not Found Middleware
    app.use(function(req, res, next) {
      res.status(404)
        .type('text')
        .send('Not Found');
});
  });
};

