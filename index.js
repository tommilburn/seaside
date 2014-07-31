var fs = require('fs');
var request = require('request');
var colors = require('colors');
var SunCalc = require('suncalc');
var parseString = require('xml2js').parseString;
var moment = require('moment');
var async = require('async');
var express = require('express');
var config = require('./config');

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
  for (var x in tideXML){



    var tideEvent = {};
    var date = tideXML[x].date.toString();

    if(!tides[date]){
      tides[date] = [];
    }
    tideEvent.time = tideXML[x].time.toString();
    tideEvent.highlow = tideXML[x].highlow.toString();
    tides[date].push(tideEvent);
  }
  // console.log(tides);
  console.log("today: \n", tides[moment().format('YYYY/MM/DD')]);
  console.log("tomorrow: \n", tides[moment().add(1, 'day').format('YYYY/MM/DD')]);

  weather = results[1];
  // console.log("tides:", tides);
  // console.log("weather:", weather);
});



var app = express();

app.get('/', function (req, res) {
  res.send(tides.datainfo.data[0].item);
});
app.listen(3000);

