import express from "express";

const API_APP = express();
const API_PORT = process.env.API_PORT || 3000;

const WEB_APP = express();
const WEB_APP_PORT = process.env.WEB_APP_PORT || 8080;

WEB_APP.use(express.static("frontend"));

API_APP.get("/calc/:operator/:n1/:n2", (req, res) => {
	let operator: string = req.params.operator;
	let n1 = parseInt(req.params.n1);
	let n2 = parseInt(req.params.n2);

	if (!operator || isNaN(n1) || isNaN(n2)) {
		res.status(400).send("Bad request");
	}

	let calc: number = 0;

	switch (operator) {
		case "ADD":
			calc = n1 + n2;
			break;
		case "SUB":
			calc = n1 - n2;
			break;
		case "MUL":
			calc = n1 * n2;
			break;
		case "DIV":
			calc = n1 / n2;
			break;
		default:
			res.status(400).send("Bad operator");
			break;
	}

	res.status(200).send(calc.toString());
});

API_APP.listen(API_PORT, () => {
	console.log(`API listening on http://localhost:${API_PORT}`);
});

WEB_APP.listen(WEB_APP_PORT, () => {
	console.log(`App listening on http://localhost:${WEB_APP_PORT}`);
});
