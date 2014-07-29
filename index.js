var request = require('request');
var colors = require('colors');
var SunCalc = require('suncalc');
var parseString = require('xml2js').parseString;
var moment = require('moment');

var today = moment().format('YYYYMMDD');
var tomorrow = moment().add(1, 'day').format('YYYYMMDD');

console.log("today:", today, "tomorrow", tomorrow);


var tideData = null;
var weatherData = null;


var weatherUrl = "https://api.forecast.io/forecast/e675cc1df01046eac11598fdbeab7d18/39.944285,-74.072914";
request(weatherUrl, function (error, response, body) {
  if (error) {
    console.log(error);
  }
  weatherData = (JSON.parse(body));
  // console.log(weatherData.currently);
});


var noaaUrl = "http://tidesandcurrents.noaa.gov/noaatidepredictions/NOAATidesFacade.jsp?datatype=XML&Stationid=8533071&text=datafiles%252F8533071%252F29072014%252F624%252F&bdate=" + today + "&timelength=daily&timeZone=2&dataUnits=1&interval=&edate=" + tomorrow + "&StationName=Seaside+Heights%2C+ocean&Stationid_=8533071&state=NJ&primary=Subordinate&datum=MLLW&timeUnits=2&ReferenceStationName=SANDY+HOOK+%28Fort+Hancock%29&ReferenceStation=8531680&HeightOffsetLow=*0.92&HeightOffsetHigh=*+0.92&TimeOffsetLow=-32&TimeOffsetHigh=-30&pageview=dayly";


function getTides(url, callback) {
  request(noaaUrl, function (error, response, body) {
    if (error) {
      console.log(error);
    }
    if (response.statusCode !== 500 && response.body.indexOf("<?xml version=\"1.0\"") === 0) {
      parseString(response.body, function (err, result) {
        tideData = result.datainfo.data[0].item;
      });
      return tideData;
    } else {
      console.log("noaa server error");
      return error;
    }
  });
};
console.log("tides", getTides(noaaUrl));

// console.log("sunrise:", SunCalc.getTimes(Date.now(), "39.944285", "-74.072914").sunrise.toString().red);
// console.log("sunset: ", SunCalc.getTimes(Date.now(), "39.944285", "-74.072914").sunset.toString().red);



