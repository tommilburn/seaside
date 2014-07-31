var fs = require('fs');
var request = require('request');
var colors = require('colors');
var SunCalc = require('suncalc');
var parseString = require('xml2js').parseString;
var moment = require('moment');
var async = require('async');
var express = require('express');
var config = require('./config');
var today = {};
var tomorrow = {};
var tides = [];
var weather;
var sunrise = SunCalc.getTimes(Date.now(), "39.944285", "-74.072914").sunrise;
var sunset  = SunCalc.getTimes(Date.now(), "39.944285", "-74.072914").sunset;


function getWeather(callback) {

  return request(config.weatherUrl, function (error, response) {
    if (error) {
      console.log(error);
      return;
    }
    if (response) {
      console.log("weather data set");
      callback(null, JSON.parse(response.body));
    }
    // console.log(weatherData.currently);
  });
}

function getTides(callback) {
  return fs.readFile('/Users/K8/Sites/seaside/tides/tides2014.xml', function (err, data) {
    if (err) {
      console.log(err);
    }
    parseString(data, function (err, result) {
      if (err) {
        throw err;
      }
      // console.log(result);
      callback(null, result);
    });
  });
}

function daysTides(day) {
  return "test" + day;
}

var tidesToday;
var tidesTomorrow;
var i;

async.parallel([
  function (callback) {
    getTides(callback);
  },
  function (callback) {
    getWeather(callback);
  }
], function (err, results) {
  if (err) {
    console.log(err);
  }
  var tideXML = results[0].datainfo.data[0].item;
  // console.log(tideXML);
  for (var i = 0; i < tideXML.length; i++){
    console.log(i);
  }
  // console.log(tides);
  tidesToday = tides[moment().format('YYYY/MM/DD')];
  tidesTomorrow = tides[moment().add(1, 'day').format('YYYY/MM/DD')];

  weather = results[1];
  // console.log("tides:", tides);
  // console.log("weather:", weather);
});



var app = express();
console.log("app running on port 3000!");

app.get('/', function (req, res) {
  res.send(tidesToday);
});
app.listen(3000);

