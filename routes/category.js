var express = require('express');
var router = express.Router();
var Category = require('../models/category');

//Get list
router.get('/', function(req, res, next){
    Category.find({}, function (err, categories) {
        if (err) {
            res.render('categories/index', { categories : []});
        } else {
            res.render('categories/index', { categories : categories});
        }
    });
});

//Get single
router.get('/:id', function (req, res, next) {
    Category.findOne({
        _id : req.params.id
    }, function (err, category) {
        if (err) {
            res.send(err);
        } else {
            res.send(category)
        }
    });
});

//Edit
router.get('/edit/:id', function (req, res, next) {
    Category.findOne({
        _id : req.params.id
    }, function (err, category) {
        if (err) {
            next(err);
        } else {
            res.render('categories/edit', { category : category });
        }
    });
});

//Save
router.post('/', function (req, res, next) {
    var category = new Category();
    if (req.body.name == '') {
        //name empty error
    }
    category.name = req.body.name;
    category.save(function(err){
        if (err) {
            res.send(err);
        } else {
            res.redirect('/categories');
        }
    });
});

//Update
router.post('/update/:id', function (req, res, next) {
    if (req.params.id == '') {
        //name empty error
    }

    Category.findOne({
        _id : req.params.id
    }, function (err, category) {
        if (err) {
            res.send(err);
        } else {
            category.name = req.body.name;
            category.save(function (err, updated) {
                if (err) {
                    res.send(err);
                } else {
                    res.redirect('/categories');
                }
            });
        }
    });
});

router.get('/delete/:id', function (req, res, next) {
    if (req.params.id == '') {
        //empty id error
    }
    Category.findOne({
        _id : req.params.id
    }, function (err, category) {
        if (err) {
            res.send(err);
        } else {
            category.remove(function (err, deleted) {
                if (err) {
                    res.send(err);
                } else {
                    res.redirect('/categories');
                }
            });
        }
    });
});

module.exports = router;