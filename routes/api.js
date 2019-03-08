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

var getStockData = function(stock, collection, req, res) {
  return new Promise(function(resolve, reject) {
    var isLiked = req.query.like === 'true';
    var ip = (req.get('x-forwarded-for') || '').split(',')[0] ||
      req.connection.remoteAddress || req.socket.remoteAddress ||
      req.connection.socket.remoteAddress;
    axios.get('https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=' + stock + '&apikey=' + process.env.ALPHPA_VANTAGE_KEY)
      .catch(function(err) {
         reject(err);
      })
      .then(function(response) {
        if (Object.keys(response.data['Global Quote'] || {}).length === 0) {
          return reject('Stock ' + stock + ' not found');
        }

        var price = parseFloat(response.data['Global Quote']['05. price']).toFixed(2);
        collection.findOne({ stock: stock }, {
          projection: {
            likes: 1,
          },
        })
          .catch(function(err) {
            if (err) {
              reject(err);
            }
          })
          .then(function(doc) {
            if (doc === null) {
              collection.insertOne({
                stock: stock,
                likes: isLiked ? 1 : 0,
                ips: [ip],
              })
                .catch(function(err) {
                  if (err) {
                    reject(err);
                  }
                })
                .then(function(doc) {
                  resolve({
                    stock: stock,
                    price: price,
                    likes: isLiked ? 1 : 0,
                  });
                });
            } else {
              if (isLiked) {
                collection.findOneAndUpdate({
                  stock: stock,
                  ips: {
                    $ne: ip,
                  },
                }, {
                  $inc: {
                    likes: 1,
                  },
                  $push: {
                    ips: ip,
                  },
                }, {
                  projection: {
                    likes: 1,
                  },
                  returnOriginal: false,
                })
                  .catch(function(err) {
                    if (err) {
                      reject(err);
                    }
                  })
                  .then(function(result) {
                    resolve({
                      stock: stock,
                      price: price,
                      likes: result.value ? result.value.likes : doc.likes,
                    });
                  });
              } else {
                resolve({
                  stock: stock,
                  price: price,
                  likes: doc.likes,
                });
              }
            }
          });
      });
    });
};

module.exports = function (app) {
  MongoClient.connect(CONNECTION_STRING, { useNewUrlParser: true }, function(err, client) {
    if (err) {
      console.log(err);
    }

    var db = client.db(process.env.DATABASE);
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
          getStockData(stock, collection, req, res).then(function(data) {
            res.json({stockData: data});
          })
          .catch(function(err) {
            console.log(err);
          });
        } else if (Array.isArray(req.query.stock)) {
          var stock1 = req.query.stock[0].toUpperCase();
          var stock2 = req.query.stock[1].toUpperCase();
          getStockData(stock1, collection, req, res).then(function(data1) {
            getStockData(stock2, collection, req, res).then(function(data2) {  
              var combinedData = {
                stockData: [{
                  stock: data1.stock,
                  price: data1.price,
                  rel_likes: data1.likes - data2.likes,
                }, {
                  stock: data2.stock,
                  price: data2.price,
                  rel_likes: data2.likes - data1.likes,
                }]
              };

              res.json(combinedData);
            })
            .catch(function(err) {
              console.log(err);
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

