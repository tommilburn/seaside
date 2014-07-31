var fs = require('fs');
var request = require('request');
var colors = require('colors');
var SunCalc = require('suncalc');
var parseString = require('xml2js').parseString;
var moment = require('moment');
var async = require('async');
var express = require('express');
// var config = require('./config');

var today = moment().format('YYYYMMDD');
var tomorrow = moment().add(1, 'day').format('YYYYMMDD');

console.log("starting...".green);
console.log("today:", today, "tomorrow", tomorrow);

var tides;
var weather;
var sunrise = SunCalc.getTimes(Date.now(), "39.944285", "-74.072914").sunrise;
var sunset  = SunCalc.getTimes(Date.now(), "39.944285", "-74.072914").sunset;


function getWeather(callback) {
  var weatherUrl = "https://api.forecast.io/forecast/e675cc1df01046eac11598fdbeab7d18/39.944285,-74.072914";

  return request(weatherUrl, function (error, response) {
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

function startServer(){

}
async.parallel([
  function (callback) {
    getTides(callback);
  },
  function (callback) {
    getWeather(callback);
  }
], function (err, results) {
  tides = results[0];
  weather = results[1];
  console.log("tides:", tides);
  console.log("weather:", weather);
  startServer();
});

// setTimeout(function () {console.log("data:", tides); }, 2000);

