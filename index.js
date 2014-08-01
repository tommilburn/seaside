var fs = require('fs');
var request = require('request');
var colors = require('colors');
var parseString = require('xml2js').parseString;
var moment = require('moment');
var async = require('async');
var express = require('express');
var config = require('./config');


var today = {};
today.date = moment();
today.events = [];
var tomorrow = {};
today.date = moment().add('day', 1);
var tides = [];

var weather;

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

function setToday(weather){
  today.weather = weather.daily.data[0];
  tomorrow.weather = weather.daily.data[1];
  today.weather.time = moment.unix(today.weather.time);
  today.sunrise = moment.unix(today.weather.sunriseTime);
  today.sunset = moment.unix(today.weather.sunsetTime);
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
  //only the relevant parts of the tide data file XML
  var tideXML = results[0].datainfo.data[0].item;
  var tideEvent, tideEventTime;
  for (i = 0; i < tideXML.length; i++) {
    tideEvent = moment(tideXML[i].date.toString(), 'YYYY/MM/DD');
    tideEventTime = moment(tideXML[i].time.toString(), 'hh:mm A');
    tideEvent.hours(tideEventTime.hours());
    tideEvent.minutes(tideEventTime.minutes());
    tides.push({
      time: tideEvent,
      highlow: tideXML[i].highlow.toString()
    });
  }
  console.log("tides".green, tides.length);
  today.tides = tides[moment().format('YYYY/MM/DD')];
  tomorrow.tides = tides[moment().add(1, 'day').format('YYYY/MM/DD')];
  weather = results[1];
  // console.log("tides:", tides);
  setToday(tides, weather);
  // console.log(today);

});

var app = express();
console.log("app running on port 3000!");

app.get('/', function (req, res) {
  res.send(today);
});
app.listen(3000);

