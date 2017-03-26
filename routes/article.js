var express = require('express');
var router = express.Router();
var Article = require('../models/article');
var Category = require('../models/category');

Article.createMapping(function (err, result) {
    if (err) {
        console.log(err);
    } else {
        console.log('Article Map created');
    }
});

var stream = Article.synchronize(function(err){
    console.log(err);
})
    , count = 0;
stream.on('data', function (err, doc) {
    count++;
});
stream.on('close', function () {
    console.log('indexed ' + count + ' documents');
});
stream.on('error', function (err) {
    console.log(err);
});

//Search
router.post('/search', function (req, res, next) {
    if (req.body.search_term) {
        Category.findOne({
            name : req.body.search_term
        }, function (err, category) {
            if (!err) {
                if (category) {
                    //Get category id
                    Article.search({
                        query_string : { query : req.body.search_term + ' ' + category._id }
                    }, function (err, results) {
                        if (err) {
                            res.render('error/message', {title : err.name, body : err.message});
                        } else {
                            res.json(results);
                        }
                    });
                } else {
                    //No category found
                    Article.search({
                        query_string : { query : req.body.search_term }
                    }, function (err, results) {
                        if (err) {
                            res.render('error/message', {title : err.name, body : err.message});
                        } else {
                            res.json(results);
                        }
                    });
                }
            } else {
                res.render('error/message', {title : err.name, body : err.message});
            }
        });
    } else {
        Article.search({}, function (err, results) {
            if (err) {
                res.render('error/message', {title : err.name, body : err.message});
            } else {
                res.json(results);
            }
        });
    }
});

//List
router.get('/', function(req, res, next){
    Article.find({}, function (err, articles) {
        if (err) {
            res.render('articles/index', { articles : []});
        } else {
            res.render('articles/index', { articles : articles});
        }
    });
});

//Create
router.get('/create', function (req, res, next) {
    Category.find({}, function (err, categories) {
        if (err) {
            res.render('articles/create', { categories : []});
        } else {
            res.render('articles/create', { categories : categories});
        }
    });
});

//Get single
router.get('/view/:id', function (req, res, next) {
    Article
        .findOne({_id : req.params.id})
        .populate('category')
        .exec(function (err, article) {
            if (err) {
                res.render('error/message', {title : err.name, body : err.message});
            } else {
                res.render('articles/view', {article : article});
            }
        });
});

//Save
router.post('/', function (req, res, next) {
    var article = new Article();
    //check if the fields are empty
    article.title = req.body.title;
    article.description = req.body.description;
    article.date = new Date();
    article.category = req.body.category;
    article.save(function(err){
        if (err) {
            res.render('error/message', {title : err.name, body : err.message});
        } else {
            res.redirect('/articles');
        }
    });
});

//Edit
router.get('/edit/:id', function (req, res, next) {
    Article
        .findOne({_id : req.params.id})
        .populate('category')
        .exec(function (err, article) {
            if (err) {
                res.render('error/message', {title : err.name, body : err.message});
            } else {
                Category.find({}, function (err, categories) {
                    if (err) {
                        res.render('articles/edit', { article : article, categories : []});
                    } else {
                        res.render('articles/edit', { article : article, categories : categories});
                    }
                });
            }
        });
});

//Update
router.post('/update/:id', function (req, res, next) {
    Article.findOne({
        _id : req.params.id
    }, function (err, article) {
        if (err) {
            res.render('error/message', {title : err.name, body : err.message});
        } else {
            article.title = req.body.title;
            article.description = req.body.description;
            article.date = new Date();
            article.category = req.body.category;
            article.save(function (err, updated) {
                if (err) {
                    res.render('error/message', {title : err.name, body : err.message});
                } else {
                    res.redirect('/articles');
                }
            });
        }
    });
});

//Delete
router.get('/delete/:id', function (req, res, next) {
    Article.findOne({
        _id : req.params.id
    }, function (err, article) {
        if (err) {
            res.send(err);
        } else {
            article.remove(function (err, deleted) {
                if (err) {
                    res.render('error/message', {title : err.name, body : err.message});
                } else {
                    res.redirect('/articles');
                }
            });
        }
    });
});

module.exports = router;