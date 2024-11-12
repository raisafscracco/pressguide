const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const session = require("express-session");
const connection = require("./database/database");

const categoriesController = require("./categories/CategoriesController");
const articlesController = require("./articles/ArticlesController");
const usersController = require("./users/UsersController");

const Category = require("./categories/Category");
const Article = require("./articles/Article");
const User = require("./users/User");


//loading the view engine
app.set('view engine', "ejs");

//sessions config         
app.use(session({
    secret: "anything",
    cookie: {maxAge: 30000000}
}));

//static files
app.use(express.static('public'));

//body-parser
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

//database connection
connection
.authenticate()
.then(() => {
    console.log("Connection made successfully!");
}).catch((error) => {
    console.log(error);
});


app.use("/", categoriesController);
app.use("/", articlesController);
app.use("/", usersController);


//routes
app.get("/", (req, res) => {
    Article.findAll({
        order: [
            ['id', 'DESC']
        ],
        limit: 4
    }).then(articles => {
        Category.findAll().then(categories => {
            res.render("index", {articles: articles, categories: categories});
        });
    });
});

app.get("/:slug", (req, res) => {
    var slug = req.params.slug;
    Article.findOne({
        where: {
            slug: slug
        }
    }).then(article => {
        if(article != undefined) {
            Category.findAll().then(categories => {
                res.render("article", {article: article, categories: categories});
            });
        }else {
            res.redirect("/");
        }
    }).catch(error => {
        res.redirect("/");
    });
});

app.get("/category/:slug",(req, res) => {
    var slug = req.params.slug;
    Category.findOne({
        where: {
           slug: slug 
        },
        include: [{model: Article}]
    }).then (category => {
        if(category != undefined) {

            Category.findAll().then(categories => {
                res.render("index", {articles: category.articles, categories: categories});
            });
            
        }else {
            res.redirect("/");
        }
    }).catch( error => {
        res.redirect("/");
    });
});

//calling the server
app.listen(8080, () =>{
    console.log("The server is working!")
});