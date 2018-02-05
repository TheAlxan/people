var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var jsesc = require('jsesc');
var validator = require('validator');
require('promise');
var db = require('./db.js');
var app = express();
app.listen(3001);

app.set('view engine','ejs');
app.set('views','views');

app.use(express.static('./public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({secret:'RezaSlark'}));

function getPosts(){
    return new Promise((res,rej) => {
        db('select * from post order by id Desc',function(results){
            res(results);
        });
    });
}

function getLikes(id){
    return new Promise((res,rej) => {
        db(`select count(*) as lc from likes where post='${id}'`,function(results2){
            res(results2[0].lc);
        });
    });
}

function getComments(id){
    return new Promise((res,rej) => {
        db(`select * from comment where post='${id}' order by id Desc`,function(results2){
            res(results2);
        });
    });
};

function getUsers(){
    return new Promise((res,rej) => {
        db('select * from user',function(results){
            var ress = ["    "];
            var i=1;
            results.forEach(item => {
                ress[i++] = item.name;
            });
            res(ress);
        });
    });
}

app.get('/',function(req,res){
    var name = "";
    if(req.session)
        if(req.session.user)
            name=req.session.user;
    getUsers().then(users => {
    getPosts().then(results => {
        var count = results.length;
        if(count == 0){
            res.render('home',{ 'posts' :[] , 'name':name,'users':users});
        }
        var i=1;
        results.forEach(function(row){
            getLikes(row.id).then(lc => {
                getComments(row.id).then(cms => {
                    row.comments = cms;
                    row.likes = lc;
                    if(i==count){
                        res.render('home',{ 'posts' :results , 'name':name,'users':users});
                    }
                    i++;
                });
            });            
        });
    });});
});

app.post('/name',function(req,res){
    if(!req.body.name || req.body.name.trim() == ""){
        res.writeHead(200,{"Content-Type":"text/plain"});
        res.end("NN");
    }
    else{
        var sn = req.session;
        var name = jsesc(req.body.name);
        db(`select count(*) as nc from user where name='${name}';`,function(results){
            if(results[0].nc==0){
                db(`insert into user(name) values ('${name}');`,function(results){
                    sn.user = name;
                    res.writeHead(200,{"Content-Type":"text/plain"});
                    res.end("Done");
                });
            }
            else {
                sn.user = name;
                res.writeHead(200,{"Content-Type":"text/plain"});
                res.end(sn.user);
            }
        });
    }
});

app.post('/post',function(req,res){
    var sn = req.session;
    if(!sn.user){
        res.writeHead(200,{"Content-Type":"text/plain"});
        res.end("NS");
    }
    else if(!req.body.content || req.body.content.trim() == ""){
        res.writeHead(200,{"Content-Type":"text/plain"});
        res.end("NC");
    }
    else {
        content = jsesc(req.body.content);
        user = jsesc(sn.user);
        db(`insert into post (content,user) values ('${content}','${user}');`,function(results){
            res.writeHead(200,{"Content-Type":"text/plain"});
            res.end(`
            <div class="col col-md-10 col-md-offset-1">    
            <div class="alert alert-info">
                <div class="container">
                    <span class="navbar-right">&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;</span>
                    <button class="btn btn-danger navbar-right" onclick="delete_post(this)">&times;</button>
                    <input type="hidden" name="id" value=${results.insertId}>
                    <h4><b>${user}</b> said:</h4>
                    <p>&emsp;&emsp;${content}</p>
                    <br/>
                    <br/>
                    <span class="like"><b>0 Likes</b>&emsp;</span>
                    <br/>
                    <input type="text" placeholder="Comment..." name="comment-input">
                    <button class="btn btn-info" onclick="submit_comment(this)">Post</button>&nbsp;<button class="btn btn-success" onclick="like_post(this)">Like</button><span class="err danger"></span>
                    <br/><br/>
                </div>
            </div>
            </div>
            `);
        });
    }
});

app.post('/comment',function(req,res){
    var sn = req.session;
    if(!sn.user){
        res.writeHead(200,{"Content-Type":"text/plain"});
        res.end("NN");
    }
    else if(!req.body.content || req.body.content.trim() == ""){
        res.writeHead(200,{"Content-Type":"text/plain"});
        res.end("NC");
    }
    else if(!req.body.post || req.body.post.trim() == ""){
        res.writeHead(200,{"Content-Type":"text/plain"});
        res.end("NP");
    }
    else if(!validator.isInt(jsesc(req.body.post))){
        res.writeHead(200,{"Content-Type":"text/plain"});
        res.end("NP");
    }
    else {
        var content = jsesc(req.body.content);
        var post = jsesc(req.body.post);
        var user = jsesc(sn.user);
        db(`insert into comment(content,user,post) values('${content}','${user}','${post}');`,function(result){
            res.writeHead(200,{"Content-Type":"text/plain"});
            res.end(`
            <div><br/>
            <div class="col col-md-10">
            <div class="alert alert-info">
                <span class="navbar-right">&emsp;</span>
                <button class="btn btn-danger navbar-right" onclick="delete_comment(this)">&times;</button>
                <input type="hidden" name="comment-id" value=${result.insertId}>
                <h4>&emsp;&emsp;<b>${user}</b> commented:</h4>
                <p>&emsp;&emsp;&emsp;&emsp;${content}</p>
            </div>
            </div>
            </div>
            `);
        });
    }
});

app.delete('/comment',function(req,res){
    console.log(req.body.id);
    if(!validator.isInt(jsesc(req.body.id))){
        res.writeHead(200,{"Content-Type":"text/plain"});
        res.end("ERR");
    }
    else {
        var id = jsesc(req.body.id);
        db(`delete from comment where id='${id}';`,function(results){
            res.writeHead(200,{"Content-Type":"text/plain"});
            res.end("Done");
        });
    }
});

app.delete('/post',function(req,res){
    if(!validator.isInt(jsesc(req.body.id))){
        res.writeHead(200,{"Content-Type":"text/plain"});
        res.end("ERR");
    }
    else {
        var id = jsesc(req.body.id);
        db(`delete from comment where post='${id}'`,function(results){
            db(`delete from post where id='${id}';`,function(results){
                res.writeHead(200,{"Content-Type":"text/plain"});
                res.end("Done");
            });
        });
    }
});

function liked(user,post){
    return new Promise((res,rej) => {
        db(`select count(*) as lc from likes where post='${post}' and user='${user}';`,function(results){
            console.log(results[0].lc);
            res(results[0].lc);
        });
    });
}

app.post('/post/like',function(req,res){
    var sn = req.session;
    if(!sn.user){
        res.writeHead(200,{"Content-Type":"text/plain"});
        res.end("ERR");
    }
    else  if(!validator.isInt(jsesc(req.body.id))){
        res.writeHead(200,{"Content-Type":"text/plain"});
        res.end("ERR");
    }
    else {
        var user = jsesc(sn.user);
        var id = jsesc(req.body.id);
        db(`select count(*) as lc from likes where post='${id}' and user='${user}';`,function(results){
            if(results[0].lc==1){
                res.writeHead(200,{"Content-Type":"text/plain"});
                res.end("ERR");
            }
            else {
                db(`insert into likes(post,user) values('${id}','${user}');`,function(results){
                    db(`select count(*) as lc from likes where post='${id}';`,function(results2){
                        res.writeHead(200,{"Content-Type":"text/plain"});
                        res.end("<b>"+results2[0].lc + " Likes</b>&emsp;");
                    });
                });
            }
        });
       
    }
});
