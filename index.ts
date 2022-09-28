import express from "express";
import mongoose, { InferSchemaType, Schema } from "mongoose";
import bodyParser from "body-parser";
import multer from "multer";

const upload = multer();

await mongoose.connect("mongodb://localhost/blogs");

const blogSchema = new Schema({
	timestamp: {
		type: Date,
		required: true,
		default: Date.now,
	},
	title: {
		type: String,
		required: true,
	},
	body: {
		type: String,
		required: true,
	},
});

type IBlog = InferSchemaType<typeof blogSchema>;

let blogs = mongoose.model("Blog", blogSchema);

const API_APP = express();
const API_PORT = process.env.API_PORT || 3000;

const WEB_APP = express();
const WEB_APP_PORT = process.env.WEB_APP_PORT || 8080;

WEB_APP.use(express.static("frontend"));

API_APP.use(bodyParser.json());
API_APP.use(bodyParser.urlencoded({ extended: true }));

API_APP.get("/blogs", (req, res) => {
	blogs.find().then((blogs) => {
		res.status(200).json(blogs);
	});
});

API_APP.get("/blogs/:title", (req, res) => {
	let title = req.params.title;

	if (typeof title !== "string") {
		res.status(400).send("Bad Request");
		return;
	}

	blogs
		.findOne({ title: title })
		.then((blog) => {
			if (!blog) {
				res.status(404).send(
					"Blog with title: " + title + " does not exist"
				);
				return;
			}

			res.status(200).json(blog);
			return;
		})
		.catch((err) => {
			console.log(err);
			res.status(500).send("Internal Server Error");
			return;
		});
});

API_APP.post("/blogs", upload.array("blogPosts"), (req, res) => {
	console.log(req.body);
	let title = req.body.title;
	let body = req.body.body;

	if (!title || !body) {
		res.status(400).send("Bad Request");
		return;
	}

	blogs
		.create({ title: title, body: body })
		.then((blog) => {
			res.status(201).json(blog);
			return;
		})
		.catch((err) => {
			console.log(err);
			res.status(500).send(err);
		});
});

API_APP.delete("/blogs", (req, res) => {
	blogs
		.deleteMany()
		.then((result) => {
			res.status(200).send(
				"OK, Deleted " + result.deletedCount + " items"
			);
		})
		.catch((err) => {
			console.log(err);
			res.status(400).send("Bad Request");
		});
});

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
