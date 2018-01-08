"use strict";
// Config
const port = process.env.LISTEN_ENV || 8080;
const TIME_PER_REQUEST = process.env.TIME_PER_REQUEST || 50;

// Modules & static conf
const express = require('express');
const app = express();
const hostname = require('os').hostname();
const MongoClient = require('mongodb').MongoClient;
const dbUrl = 'mongodb://mongo:27017';
const dbName = 'slowwhoami';

let dbClient;

// Stats variables
let currentTimeRequest = 0;
let currentNbRequest = 0;
let totalNbRequest = 0;

app.get('/ping', function(req, res) {
	currentTimeRequest += TIME_PER_REQUEST;
	currentNbRequest++;
	totalNbRequest++;

	setTimeout(function() {
		res.write(`Hostname: ${hostname}\n`);
		res.write(`${req.method} ${req.originalUrl}\n`);
		for (let k in req.headers) {
			res.write(`${k}: ${req.headers[k]}\n`);
		}
		res.end();
		currentNbRequest--;
		currentTimeRequest -= TIME_PER_REQUEST;
	}, currentTimeRequest);

});

// local process stats
app.get('/localstats', function(req, res) {
	res.json({
		hostname: hostname,
		currentTimeRequest: currentTimeRequest,
		currentNbRequest: currentNbRequest,
		totalNbRequest: totalNbRequest
	});
});

// global stats from all process
app.get('/stats', function(req, res) {
	dbClient.collection(dbName).aggregate(
		[
			//Get only last 10s
			{
				$match: {
					timestamp: {
        				$gt: new Date(new Date() - 1000 * 10)
        			}
				}
    		},
    		{
				$sort: { timestamp: 1, hostname: 1 }
			},
			{ $group: {
				_id: "$hostname",
				timestamp: {$last: "$timestamp"},
				currentTimeRequest: {$last: "$currentTimeRequest"},
				currentNbRequest: {$last: "$currentNbRequest"},
				totalNbRequest: {$last: "$totalNbRequest"}
				}
			}
		]
	).toArray(
		function(err,data){
			if (err){
				console.log(err);
				res.status(500).end();
				return;
			}
			let resp={global:{currentTimeRequest:0, currentNbRequest:0, totalNbRequest:0}, all: data}
			for (let i in data){
				resp.global.currentNbRequest+=data[i].currentNbRequest;
				resp.global.totalNbRequest+=data[i].totalNbRequest;
				resp.global.currentTimeRequest+=data[i].currentTimeRequest;
			}
			resp.global.currentTimeRequest/=data.length;
			res.json(resp);
		}
	);
});
app.use(express.static(__dirname+"/static"));


function updateStats() {
	dbClient.collection(dbName).insertOne(
		{hostname: hostname, timestamp: new Date(), currentNbRequest: currentNbRequest, currentTimeRequest:currentTimeRequest, totalNbRequest: totalNbRequest}
	);
}
MongoClient.connect(dbUrl, function(err, client) {
	if (err) {
		console.log(err);
		process.exit(1);
	}
	dbClient = client.db(dbName);

	setInterval(updateStats, 500);

	app.listen(port);
	console.log(`Listen on ${port}`)

});

