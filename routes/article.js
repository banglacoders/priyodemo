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

Category.createMapping(function (err, result) {
    if (err) {
        console.log(err);
    } else {
        console.log('Category Map created');
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

var stream2 = Category.synchronize(function(err){
    console.log(err);
})
    , count2 = 0;
stream2.on('data', function (err, doc) {
    count2++;
});
stream2.on('close', function () {
    console.log('indexed ' + count2 + ' documents');
});
stream2.on('error', function (err) {
    console.log(err);
});

//Search
router.post('/search', function (req, res, next) {
    if (req.body.search_term) {
        Article.search({
            query_string : { query : req.body.search_term }
        }, function (err, results) {
            if (err) return next(err);
            res.json(results);
        });
    } else {
        Article.search({}, function (err, results) {
            if (err) return next(err);
            res.json(results);
        });
    }
});

router.get('/search', function (req, res, next) {
    var datefrom = req.query.datefrom;
    var dateto = req.query.dateto;
    var df = datefrom.split("-");
    var dfobj = new Date(parseInt(df[2]),parseInt(df[1])-1,parseInt(df[0]));
    var dt = dateto.split("-");
    var dtobj = new Date(parseInt(dt[2]),parseInt(dt[1])-1,parseInt(dt[0]));

    var newdatefrom = dfobj.toISOString();
    var newdateto = dtobj.toISOString();

    Article.search({
        query_string : {
            query : {
                range : {
                    date : {
                        gte : newdatefrom,
                        lte : newdateto
                    }
                }
            }
        }
    }, function (err, results) {
        if (err) return next(err);
        var data = results.hits.hits.map(function (hit) {
            return hit;
        });
        res.send(data);
    });
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
                res.send(err);
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
            next(err);
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
                res.send(err);
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
    if (req.params.id == '') {
        //name empty error
    }

    //Check if this name exist with out this id error

    Article.findOne({
        _id : req.params.id
    }, function (err, article) {
        if (err) {
            next(err);
        } else {
            article.title = req.body.title;
            article.description = req.body.description;
            article.date = new Date();
            article.category = req.body.category;
            article.save(function (err, updated) {
                if (err) {
                    res.send(err);
                } else {
                    res.redirect('/articles');
                }
            });
        }
    });
});

//Delete
router.get('/delete/:id', function (req, res, next) {
    if (req.params.id == '') {
        //empty id error
    }
    Article.findOne({
        _id : req.params.id
    }, function (err, article) {
        if (err) {
            res.send(err);
        } else {
            article.remove(function (err, deleted) {
                if (err) {
                    res.send(err);
                } else {
                    res.redirect('/articles');
                }
            });
        }
    });
});

module.exports = router;