const express = require("express")
const fs = require("fs")
const session = require('express-session')

const app = express();


app.use( express.static("public"));
app.use(express.json());
app.use( express.urlencoded({ extended: true }) )

app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
	
}))

app.get("/", Home);

app.get("/username",function(req,res)
{  
	
   res.send(req.session.username);
});

app.route("/todo").get(GetTodo).post(PostTodo);

app.route("/logout").post(function (req, res)
{
	req.session.destroy();
	res.end();
});

app.listen(3000, function()
{
	console.log("server is live")
})

app.route("/login").get(function (req, res) {
	res.sendFile(__dirname + "/public/html/login.html");
})
.post(function (req, res) {
	getUser(function (users) {
	
			const user = users.filter(function (user) {
				if (user.username === req.body.username && user.password === req.body.password) {
					return true
				}
			
			})

			if (user.length) {
				req.session.isLoggedIn = true;
				req.session.username = user[0].username;
				res.redirect("/")
			}
			else {
				res.end("login failed");

			}
		});
});

app.route("/signup").get(function (req, res)
{
	res.sendFile(__dirname+"/public/html/signup.html");
})
.post(function (req, res)
{
	saveUser(req.body, function (err)
	{
		if (err)
		{
			res.end("Username already exists");
		}
		else
		{
			res.redirect("/login");	
		}
	})
})


function Home(req, res)
{   
	if (req.session.isLoggedIn)
	{   
	res.sendFile(__dirname + "/public/html/index.html");
	}
	else
	{
	res.redirect("/login");
	}
	
}

function GetTodo(req, res)
{   
	
	getTodos(function(err, todos)
	{
		if (err)
		{
			res.send("error in reading data from file");
			res.end();
		}

        res.json(todos);
	})
}

function PostTodo(req, res)
{
	saveTodo(req.body, function()
	{
		res.end();
	})

}

function getTodos(callback)
{
	fs.readFile("./todo.txt","utf-8", function(err, data)
	{
		if(err)
		{  
			callback(err, null)
			return
		}
		
		callback(null, JSON.parse(data))
	})
}


function saveTodo(todo, callback)
{
	getTodos(function(err, todos)
	{
		todos.push(todo);

		fs.writeFile("./todo.txt",JSON.stringify(todos), function(err)
		{

			if(err)
			{
				callback(err, null)
				return
			}

			callback(null);
		})

	})
}

function saveUser(user, callback)
{
	getUser(function (users)
	{   
        const val = users.filter(function (task) {
			if (user.username === task.username) {
				return true;
			}
		
		})
		
		if (val.length)
		{
			callback(val);
			return;
		}


		users.push(user);
		fs.writeFile("./users.txt", JSON.stringify(users), function () {
			callback();
		});
	})
}

function getUser(callback)
{
	fs.readFile("./users.txt", "utf-8", function (err, data)
	{
		if (data)
		{
			callback(JSON.parse(data));
		}
	})
}