

module.exports.home= function(req, res){
    return res.render('home', {
        title: "User Auth | Home",
        user: req.user
    });
}

