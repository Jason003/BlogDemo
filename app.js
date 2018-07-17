var express = require("express"),
    bodyParser = require("body-parser"),
    mongoose = require("mongoose"),
    app = express(),
    expressSanitizer = require("express-sanitizer"), //为了防止恶意<script>
    methodOverride = require("method-override") //为了update


//APP CONFIG
mongoose.connect("mongodb://localhost/restful_blog_app");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressSanitizer());
app.set("view engine", "ejs");
app.use(methodOverride("_method"));

//MONGOOSE MODEL CONFIG
var blogSchema = mongoose.Schema({
    title: String,
    image: String,
    body: String,
    date: { type: Date, default: Date.now },
});
var Blog = mongoose.model("Blog", blogSchema);

//RESTFUL ROUTES
// Blog.create({
//     title:"Test blog",
//     image:"https://www.photosforclass.com/download/pixabay-336606?webUrl=https%3A%2F%2Fpixabay.com%2Fget%2Fea36b70928f21c22d2524518b7444795ea76e5d004b0144294f1c278a7eab6_960.jpg&user=Free-Photos",
//     body:"This is a test blog",
// })

app.get("/", function(req, res) {
    res.redirect("/blogs")
})
//INDEX ROUTE
app.get("/blogs", function(req, res) {
    Blog.find({}, function(err, blogs) {
        if (err) console.log(err);
        else {
            res.render("index", { blogs: blogs });
        }
    })
})
//NEW ROUTE
app.get("/blogs/new", function(req, res) {
    res.render("new");
})

//CREATE ROUTE
app.post("/blogs", function(req, res) {
    req.body.blog.body = req.sanitize(req.body.blog.body);
    Blog.create(req.body.blog, function(err, newBlog) {
        if (err) res.render("new");
        else {
            res.redirect("/blogs");
        }
    })
})

//SHOW ROUTE
app.get("/blogs/:id", function(req, res) {
    Blog.findById(req.params.id, function(err, foundBlog) {
        if (err) res.redirect("/blogs");
        else {
            res.render("show", { blog: foundBlog });
        }
    });
})

//EDIT ROUTE
app.get("/blogs/:id/edit", function(req, res) {
    Blog.findById(req.params.id, function(err, foundBlog) {
        if (err) res.redirect("/blogs");
        else {
            res.render("edit", { blog: foundBlog });
        }
    });
})

//UPDATE ROUTE
app.put("/blogs/:id", function(req, res) {
    req.body.blog.body = req.sanitize(req.body.blog.body);
    Blog.findByIdAndUpdate(req.params.id, req.body.blog, function(err, updatedBlog) {
        if (err) res.redirect("/blogs");
        else {
            res.redirect("/blogs/" + req.params.id);
        }
    })
});

//DELETE ROUTE
app.delete("/blogs/:id", function(req, res) {
    Blog.findByIdAndRemove(req.params.id, function(err) {
        if (err) res.redirect("/blogs");
        else {
            res.redirect("/blogs");
        }
    })
});

app.listen(process.env.PORT, process.env.IP, function() {
    console.log("Running!");
});
