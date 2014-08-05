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
tomorrow.date = moment().add(1, 'day');
tomorrow.events = [];
var tides = [];
var currentWeather;
var weather;

function setCurrently() {
  console.log("setCurrently running");
  getWeather(function(a, weather) {
    console.log(weather.currently);
  })
}

function getWeather(callback) {

  return request(config.weatherUrl, function (error, response) {
    if (error) {
      console.log(error);
      return;
    }
    if (response) {
      console.log("weather data set".blue);
      callback(null, JSON.parse(response.body));
    }
  });
}

function getTides(callback) {
  return fs.readFile(__dirname + '/tides/tides2014.xml', function (err, data) {
    if (err) {
      console.log(err);
    }
    parseString(data, function (err, result) {
      if (err) {
        throw err;
      }
      callback(null, result);
    });
  });
}

function setDay(day, tides, weather) {
  var daysAway = day.date.dayOfYear() - moment().dayOfYear();
  day.weather = weather.daily.data[daysAway];
  day.events.push({
    time: moment.unix(weather.daily.data[daysAway].sunriseTime),
    event: "sunrise"
  });
  day.events.push({
    time: moment.unix(weather.daily.data[daysAway].sunsetTime),
    event: "sunset"
  });
  for (i = 0; i < tides.length; i++) {
    if (tides[i].time.format("YYYY DDDD") === day.date.format("YYYY DDDD")) {
      day.events.push(tides[i]);
    }
  }
  day.events.sort(function(a, b){
    a = a.time.unix();
    b = b.time.unix();
    return a<b ? -1 : a>b ? 1: 0;
  });
  console.log(day);
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
    if(tideXML[i].highlow.toString().valueOf() === 'H'){
      tideXML[i].highlow = 'high tide';
    } else {
      tideXML[i].highlow = 'low tide'
    }
    tides.push({
      time: tideEvent,
      event: tideXML[i].highlow.toString()
    });
  }
  console.log("tide data set".green);
  console.log((tides.length + " tide events").green);
  weather = results[1];
  currentWeather = weather.currently;
  setDay(today, tides, weather);
  setDay(tomorrow, tides, weather);
});

var app = express();
app.set('view engine', 'jade');
console.log("app running on port 3000!");
app.use(express.static(__dirname + '/public'));

app.get('/tomorrow', function (req, res) {
  console.log("page load:\t/tomorrow".yellow);
  res.render('index', {weather: tomorrow.weather, events: tomorrow.events, today: false, now: moment().unix()});
});

app.use(function (req, res) {
  var now = moment();
  for (i = 0; i<today.events.length; i++){
    var hoursDiff = today.events[i].time.diff(now, 'hours');
    if (hoursDiff > 0) {
      today.events[i].until = "in " + hoursDiff + " hours";
    } else if (hoursDiff === 0) {
      if(today.events[i].time.diff(now, 'minutes') > 0){
        today.events[i].until = "in " + today.events[i].time.diff(now, 'minutes') + " minutes";
      }
    }
  }
  console.log("page load:\t/".yellow);
  res.render('index', {weather: today.weather, currentWeather: currentWeather, events: today.events, today: true, now: moment().unix()});
});

app.listen(3000);

setInterval(function(){ return setCurrently();}, 100000);