const express = require('express');
const bodyParser = require('body-parser');
const port = 3000;
const app = express();
const CryptoJS = require('crypto-js');
const plikdata = require('c:/users/Alicja/Desktop/apka_w_express/data');

app.use(bodyParser.urlencoded({ extended: false }));

app.use(bodyParser.json());

//const querystring = require("querystring");
//const { Curl } = require("node-libcurl");
//const terminate = curlTest.close.bind(curlTest);

app.get('/', function (req, res) {
	res.send('Welcome to our schedule website');
});

app.get('/users', function (req, res) {
	//res.send(`wszystko ${JSON.stringify(data.users)}`)
	res.send(`Lista Uzytkownikow: ${JSON.stringify(plikdata.users)}`);
});

app.get('/schedules', function (req, res) {
	res.send(`Schedules: ${JSON.stringify(plikdata.schedules)}`);
});

//app.get('/', function(req, res) {
//res.send({"status": "ok", "method": "GET"})
//})

app.get('/users/:id', function (req, res) {
	let userdata = JSON.stringify(plikdata.users[req.params['id']]);
	if (userdata == undefined) {
		res.sendStatus(404);
		return false;
	}
	res.send(`id: ${req.params['id']}
    Uzytkownik: ${userdata}`);
});

app.get('/schedules/:id', function (req, res) {
	let scheduledata = JSON.stringify(plikdata.schedules[req.params['id']]);
	if (scheduledata == undefined) {
		res.sendStatus(404);
		return false;
	}
	res.send(`id: ${req.params['id']}
    Terminy: ${scheduledata}`);
});

app.post('/users/:firstname/:lastname/:email/:password', function (req, res) {
	let first = req.params['firstname'];
	let last = req.params['lastname'];
	let mail = req.params['email'];
	let pass = req.params['password'];
	if (first == '' || last == '' || mail == '' || pass == '') {
		res.sendStatus(404);
		return false;
	}

	let user_emails = plikdata.users.filter(function (e) {
		return e.email == mail;
	});
	if (user_emails.length > 0) {
		res.sendStatus(404);
		return false;
	} else {
		plikdata.users.push({
			firstname: first,
			lastname: last,
			email: mail,
			password: CryptoJS.SHA256(pass).toString(),
		});
		res.send(`User ${first} ${last} has been added`);
	}
});

app.post('/schedules/:user_id/:day/:start_at/:end_at', function (req, res) {
	let userid = req.params['user_id'];
	if (plikdata.users[userid] == undefined) {
		res.sendStatus(404);
		return false;
	}

	let day = req.params['day'];
	if (isNaN(day)) {
		res.sendStatus(404);
		return false;
	}
	if (day < 1 || day > 31) {
		res.sendStatus(404);
		return false;
	}

	function twelveto24(hourin) {
		let hourout = 0;
		if (hourin.includes('AM')) {
			hourout = parseInt(hourin.replace('AM', ''), 10);
		} else if (hourin.includes('PM')) {
			hourout = 12 + parseInt(hourin.replace('PM', ''), 10);
		} else {
			res.sendStatus(404);
			return false;
		}
		return hourout;
	}

	let start_at = req.params['start_at'];
	let start_value = twelveto24(start_at);

	let end_at = req.params['end_at'];
	let end_value = twelveto24(end_at);

	if (start_value >= end_value) {
		res.sendStatus(404);
		return false;
	}

	let user_schedules = plikdata.schedules.filter(function (e) {
		return e.user_id == userid;
	});

	for (let i = 0; i < user_schedules.length; i++) {
		if (day == user_schedules[i].day) {
			let scheduled_start = twelveto24(user_schedules[i].start_at);
			let scheduled_end = twelveto24(user_schedules[i].end_at);
			if (start_value >= scheduled_end || scheduled_start >= end_value) {
			} //jest ok
			else {
				res.sendStatus(404);
				return false;
			}
		}
	}

	plikdata.schedules.push({
		user_id: parseInt(req.params['user_id'], 10),
		day: parseInt(req.params['day'], 10),
		start_at: req.params['start_at'],
		end_at: req.params['end_at'],
	});
	res.send('Dodano termin do uzytkownika');
});

app.listen(port, () => {
	console.log(`Server running at http://localhost:${port}`);
});
