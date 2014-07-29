var request = require('request');
var colors = require('colors');
var SunCalc = require('suncalc');
var parseString = require('xml2js').parseString;
var moment = require('moment');

var today = moment().format('YYYYMMDD');
var tomorrow = moment().add(1, 'day').format('YYYYMMDD');

console.log("starting...".green);
console.log("today:", today, "tomorrow", tomorrow);

var tides;
var weather;
var sunrise = SunCalc.getTimes(Date.now(), "39.944285", "-74.072914").sunrise;
var sunset  = SunCalc.getTimes(Date.now(), "39.944285", "-74.072914").sunset;



function getWeather() {
  var weatherUrl = "https://api.forecast.io/forecast/e675cc1df01046eac11598fdbeab7d18/39.944285,-74.072914";


  request(weatherUrl, function (error, response) {
    if (error) {
      console.log(error);
      return;
    }
    if (response) {
      console.log("weather data set");
      weather = (JSON.parse(response.body));
    }
    // console.log(weatherData.currently);
  });
}

function getTides() {
  var noaaUrl = "http://tidesandcurrents.noaa.gov/noaatidepredictions/NOAATidesFacade.jsp?datatype=XML&Stationid=8533071&text=datafiles%252F8533071%252F29072014%252F624%252F&bdate=" + today + "&timelength=daily&timeZone=2&dataUnits=1&interval=&edate=" + tomorrow + "&StationName=Seaside+Heights%2C+ocean&Stationid_=8533071&state=NJ&primary=Subordinate&datum=MLLW&timeUnits=2&ReferenceStationName=SANDY+HOOK+%28Fort+Hancock%29&ReferenceStation=8531680&HeightOffsetLow=*0.92&HeightOffsetHigh=*+0.92&TimeOffsetLow=-32&TimeOffsetHigh=-30&pageview=dayly&print_download=true&Threshold=&thresholdvalue=";
  console.log(noaaUrl);
  request(noaaUrl, function (error, response) {
    if (error) {
      console.log(error);
    }
    if (response && response.statusCode !== 500 && response.body.indexOf("<?xml version=\"1.0\"") === 0) {
      parseString(response.body, function (err, result) {
        if (!err) {
          console.log("tide data set");
          tides = result.datainfo.data[0].item;
        }
      });
    } else {
      console.log("noaa server error");
      getTides();
    }
  });
}

function main() {
  getWeather();
  getTides();
}
main();

setTimeout(function () {console.log("data:", tides, weather); }, 5000);

