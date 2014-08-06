var fs = require('fs');
var request = require('request');
var colors = require('colors');
var parseString = require('xml2js').parseString;
var moment = require('moment');
var async = require('async');
var express = require('express');
var config = require('./config');
var CronJob = require('cron').CronJob;


var today = {};
today.date = moment();
today.events = [];

var tomorrow = {};
tomorrow.date = moment().add(1, 'day');
tomorrow.events = [];

var tides = [];
var weather;

function setWeather(callback) {

  request(config.weatherUrl, function (error, response) {
    if (error) {
      console.log(error);
      return;
    }
    if (response) {
      console.log('weather data set'.blue);
      weather = JSON.parse(response.body);
      if(typeof(callback) == "function"){
        callback(null, 'weather data finished');
      }
    }
  });
}

function setTides(callback) {
  fs.readFile(__dirname + '/tides/tides2014.xml', function (err, data) {
    if (err) {
      console.log(err);
    }
    parseString(data, function (err, result) {
      if (err) {
        throw err;
      }
      var tideXML = result.datainfo.data[0].item;
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
      callback(null, 'tide data finished');
    });
  });
}

function setDay(day) {
  var daysAway = day.date.dayOfYear() - moment().dayOfYear();
  // console.log(daysAway + ' days away');
  day.weather = weather.daily.data[daysAway];
  day.events.push({
    time: moment.unix(weather.daily.data[daysAway].sunriseTime),
    event: 'sunrise'
  });
  day.events.push({
    time: moment.unix(weather.daily.data[daysAway].sunsetTime),
    event: 'sunset'
  });
  for (i = 0; i < tides.length; i++) {
    if (tides[i].time.format('YYYY DDDD') === day.date.format('YYYY DDDD')) {
      day.events.push(tides[i]);
    }
  }
  day.events.sort(function(a, b){
    a = a.time.unix();
    b = b.time.unix();
    return a<b ? -1 : a>b ? 1: 0;
  });
  // console.log(day);
}

function update(){
  console.log('updating...'.green);
  today.date = moment();
  today.events = [];
  tomorrow.date = moment().add(1, 'day');
  tomorrow.events = [];
  setDay(today);
  setDay(tomorrow);
  console.log("updated".green);
}

var tidesToday;
var tidesTomorrow;
var i;

async.parallel([
  function (callback) {
    setTides(callback);
  },
  function (callback) {
    setWeather(callback);
  }
], function (err, results) {
  if (err) {
    console.log(err);
  }
  //only the relevant parts of the tide data file XML
  console.log('tide data set'.green);
  console.log((tides.length + ' tide events').green);
  update();
  var job = new CronJob('30 * 0 * * *', function(){update();}, null, true);

});

var app = express();
app.set('view engine', 'jade');
app.set('view options', { pretty: true });
console.log('app running on port 3000!');
app.use(express.static(__dirname + '/public'));

app.get('/tomorrow', function (req, res) {
  console.log('page load:\t/tomorrow'.yellow);
  res.render('index', {weather: tomorrow.weather, events: tomorrow.events, today: false, now: moment().unix()});
});

app.use(function (req, res) {
  var now = moment();
  for (i = 0; i<today.events.length; i++){
    var hoursDiff = today.events[i].time.diff(now, 'hours');
    if (hoursDiff > 1) {
      today.events[i].until = 'in ' + hoursDiff + ' hours';
    } else if (hoursDiff === 1){
            today.events[i].until = 'in 1 hour';
    } else if (hoursDiff === 0) {
      if(today.events[i].time.diff(now, 'minutes') > 1){
        today.events[i].until = 'in ' + today.events[i].time.diff(now, 'minutes') + ' minutes';
      } else if(today.events[i].time.diff(now, 'minutes') === 1){
        today.events[i].until = 'in 1 minute';
      }
    }
  }
  console.log('page load:\t/'.yellow);
  res.render('index', {weather: today.weather, currentWeather: weather.currently, events: today.events, today: true, now: moment().unix()});
});

app.listen(3000);

setInterval(function(){
  console.log("setting weather".blue);
  setWeather();
}, 100000);