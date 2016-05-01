'use strict';

const fs 	= require('fs');
const https = require('https');
const exec 	= require('child_process').exec;

const URL 		= "https://www.reddit.com/r/netsec/new.json";
const DATA_URL 	= __dirname+'/data/data.json';
const INTERVAL 	= 1000 * 60 * 5;

function notify(titles){
	exec(`notify-send -i ${__dirname}/favicon.ico "Temple Notifier" "* ${titles.join('\n* ')}"`, function (error, stdout, stderr){
		if(error){
			console.log(error);
		}
		if(stderr){
			console.log(stderr);
		}
	});
}

function update(){
	var seenIds = [];
	fs.readFile(DATA_URL, 'utf8', function(err, res){
		if(err){
			return console.log(err);
		}
		seenIds = JSON.parse(res);
	});

	var req = https.get(URL, res => {
		var data = '';
		res.on('data', chunk => {
			data += chunk;
		});
		res.on('end', () => {
			var titles = JSON.parse(data).data.children
				.map(el => {
					return {
						id: el.data.id,
						title: el.data.title
					};
				})
				.filter(el => {
					return seenIds.indexOf(el.id) === -1;
				})
				.map(el => {
					seenIds.push(el.id);
					return el.title;
				});

			// console.log(JSON.stringify({
			// 	date: new Date(),
			// 	titles: titles
			// }));

			fs.writeFile(DATA_URL, JSON.stringify(seenIds));
			titles.length && notify(titles)
		});
	});

	req.on('error', err => {
		console.log(err);
	});

	req.end();
}

update();
setInterval(update, INTERVAL);
