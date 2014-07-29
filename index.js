var request = require('request');
var colors = require('colors');
var SunCalc = require('suncalc');

var weatherurl = "https://api.forecast.io/forecast/e675cc1df01046eac11598fdbeab7d18/39.944285,-74.072914";
request(weatherurl, function(error, response, body){
	if (error){
		console.log(error);
	}
	console.log(JSON.parse(body));
});


var noaa = "http://tidesandcurrents.noaa.gov/api/datagetter?range=24&station=8531680&product=predictions&units=english&time_zone=gmt&application=ports_screen&format=json&datum=mllw&time_zone=lst_ldt";
request(noaa, function(error, response, body){
	if (error) {
		console.log(error);
	}
	console.log(JSON.parse(body));
});

console.log("sunrise:", SunCalc.getTimes(Date.now(), "39.944285","-74.072914").sunrise.toString().red);
console.log("sunset: ", SunCalc.getTimes(Date.now(), "39.944285","-74.072914").sunset.toString().red);