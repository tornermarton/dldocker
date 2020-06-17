/**
 * MIDDLEWARE
 * Using the template engine render the values into the template
 */

module.exports = function (objectRepository, mainView) {

    return function (req, res, next) {
        //The res.tpl can be dressed up here
        res.tpl.title = 'DL-DOCKER | Dashboard';
        res.tpl.mainView = mainView;

        res.render("main", res.tpl);
    };

};
