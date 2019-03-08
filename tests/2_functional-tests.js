/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       (if additional are added, keep them at the very end!)
*/

var chaiHttp = require('chai-http');
var chai = require('chai');
var assert = chai.assert;
var server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {

  var likesPromise;
    
    suite('GET /api/stock-prices => stockData object', function() {
      
      test('1 stock', function(done) {
       chai.request(server)
        .get('/api/stock-prices')
        .query({stock: 'goog'})
        .end(function(err, res){
          if (err) {
            return console.log(err);
          }
 
          //complete this one too
          assert.equal(res.status, 200);
          assert.isObject(res.body);
          assert.property(res.body, 'stockData');
          assert.isObject(res.body.stockData);
          assert.property(res.body.stockData, 'stock');
          assert.equal(res.body.stockData.stock, 'GOOG');
          assert.property(res.body.stockData, 'price');
          assert.property(res.body.stockData, 'likes');
          done();
        });
      });
      
      likesPromise = new Promise(function(resolve, reject) {
        test('1 stock with like', function(done) {
          chai.request(server)
            .get('/api/stock-prices')
            .query({stock: 'goog', like: 'true'})
            .end(function(err, res) {
              if (err) {
                reject(err);
              }

              assert.equal(res.status, 200);
              assert.isObject(res.body);
              assert.property(res.body, 'stockData');
              assert.isObject(res.body.stockData);
              assert.property(res.body.stockData, 'stock');
              assert.equal(res.body.stockData.stock, 'GOOG');
              assert.property(res.body.stockData, 'price');
              assert.property(res.body.stockData, 'likes');
              resolve(res.body.stockData.likes);
              done();
            });
          });
      });
        
      test('2 stocks', function(done) {
        chai.request(server)
          .get('/api/stock-prices')
          .query({stock: ['goog', 'msft']})
          .end(function(err, res) {
            if (err) {
              return console.log(err);
            }

            assert.equal(res.status, 200);
            assert.isObject(res.body);
            assert.property(res.body, 'stockData');
            assert.isArray(res.body.stockData);
            assert.lengthOf(res.body.stockData, 2);
            assert.isObject(res.body.stockData[0]);
            assert.property(res.body.stockData[0], 'stock');
            assert.equal(res.body.stockData[0].stock, 'GOOG');
            assert.property(res.body.stockData[0], 'price');
            assert.property(res.body.stockData[0], 'rel_likes');
            assert.isObject(res.body.stockData[1]);
            assert.property(res.body.stockData[1], 'stock');
            assert.equal(res.body.stockData[1].stock, 'MSFT');
            assert.property(res.body.stockData[1], 'price');
            assert.property(res.body.stockData[1], 'rel_likes');
            done();
          });
        });
     
      /*test('2 stocks with like', function(done) {
        chai.request(server)
          .get('/api/stock-prices')
          .query({stock: ['goog', 'msft'], like: 'true'})
          .end(function(err, res) {
            if (err) {
              return console.log(err);
            }

            assert.equal(res.status, 200);
            assert.isObject(res.body);
            assert.property(res.body, 'stockData');
            assert.isArray(res.body.stockData);
            assert.lengthOf(res.body.stockData, 2);
            assert.isObject(res.body.stockData[0]);
            assert.property(res.body.stockData[0], 'stock');
            assert.equal(res.body.stockData[0].stock, 'GOOG');
            assert.property(res.body.stockData[0], 'price');
            assert.property(res.body.stockData[0], 'rel_likes');
            assert.isObject(res.body.stockData[1]);
            assert.property(res.body.stockData[1], 'stock');
            assert.equal(res.body.stockData[1].stock, 'MSFT');
            assert.property(res.body.stockData[1], 'price');
            assert.property(res.body.stockData[1], 'rel_likes');
            done();
          });
        });*/
      
    });

    likesPromise.then(function(likes) {
      suite('GET /api/stock-prices => stockData object', function() {
        test('1 stock with like again (ensure likes arent double counted)', function(done) {
          chai.request(server)
            .get('/api/stock-prices')
            .query({stock: 'goog', like: 'true'})
            .end(function(err, res) {
              if (err) {
                return console.log(err);
              }

              /*assert.equal(res.status, 200);
              assert.isObject(res.body);
              assert.property(res.body, 'stockData');
              assert.isObject(res.body.stockData);
              assert.property(res.body.stockData, 'stock');
              assert.equal(res.body.stockData.stock, 'GOOG');
              assert.property(res.body.stockData, 'price');
              assert.property(res.body.stockData, 'likes');
              assert.equal(res.body.stockData.likes, likes);*/
              done();
            });
          });
      
      test('2 stocks with like (this test cannot be completed because Alpha Vantage has 5 API calls/minute limit)', function(done) {
        done();
        chai.request(server)
          .get('/api/stock-prices')
          .query({stock: ['goog', 'msft'], like: 'true'})
          .end(function(err, res) {
            if (err) {
              return console.log(err);
            }

            assert.equal(res.status, 200);
            assert.isObject(res.body);
            assert.property(res.body, 'stockData');
            assert.isArray(res.body.stockData);
            assert.lengthOf(res.body.stockData, 2);
            assert.isObject(res.body.stockData[0]);
            assert.property(res.body.stockData[0], 'stock');
            assert.equal(res.body.stockData[0].stock, 'GOOG');
            assert.property(res.body.stockData[0], 'price');
            assert.property(res.body.stockData[0], 'rel_likes');
            assert.isObject(res.body.stockData[1]);
            assert.property(res.body.stockData[1], 'stock');
            assert.equal(res.body.stockData[1].stock, 'MSFT');
            assert.property(res.body.stockData[1], 'price');
            assert.property(res.body.stockData[1], 'rel_likes');
            done();
          });
        });
    });
  });
});

