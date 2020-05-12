
var express = require('express');
var path = require('path');
var fs=require('fs');
var app = express();
var session = require("express-session");
var cookieParser = require("cookie-parser");
var morgan = require("morgan");

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(morgan('dev'));
app.use(cookieParser());
var counter=0;
app.use(
  // Creates a session middleware with given options.
  session({

    name: counter++,
    event: false,
    secret: 'KoftaBelTe7ena',
    saveUninitialized: false,
    resave: false,
    cookie: {
      maxAge:60*60*24*7*1000,
      sameSite: true,
    }

  })
)
//<functions>
let logUser = function(username,password){
  //load usernames array
  let users=loadUsers()
 var i;
  for (i = 0; i < users.length; i++) {
      if (users[i].user == username) {
          break;
      }
  }
  if (i<users.length){
    if (users[i].pass==password){
      return 'home';
    }
    else{
      return 'Password is wrong';
    }
  }
  else{
    return 'Username does not exist please register';

  }

}

let loadUsers = function(){
  try {
    let bufferedData = fs.readFileSync('users.json')
    let dataString = bufferedData.toString()
    let usersArray = JSON.parse(dataString)
    return usersArray
} catch (error) {
    return []
}
}
let loadWatchlists = function(){
  try {
    let bufferedData = fs.readFileSync('watchlist.json')
    let dataString = bufferedData.toString()
    let watchlistArray = JSON.parse(dataString)
    return watchlistArray
} catch (error) {
    return []
}
}

let addUser=function(username,password){
  var x = logUser(username,password);
  if (x==='home' || x==='Password is wrong'){
    return 'registration';
  }
  else{
    var myObj={user:username,pass:password}
    addUsers(myObj);
    return 'home';
  }
}
let addUsers=function (data){
  let users = loadUsers()
  users.push(data)
  fs.writeFileSync('users.json', JSON.stringify(users))
}

let computeWatchlist=function(currentUser){
  let watchlist = loadWatchlists();
  var filteredWatchlist=[];
  var i;
  for (i=0;i<watchlist.length;i++){
    if (containsObject(currentUser,watchlist[i].users)){
       if (i==0){
         filteredWatchlist.push("The Godfather (1972)");
       }
       else if (i==1){
        filteredWatchlist.push("The Godfather: Part II (1974)");
      }
      else if (i==2){
        filteredWatchlist.push("Scream (1996)");
      }
      else if (i==3){
        filteredWatchlist.push("The Conjuring (2013)");
      }
      else if (i==4){
        filteredWatchlist.push("Fight Club (1999)");
      }
      else if (i==5){
        filteredWatchlist.push("The Dark Knight (2008)");
      }
    }
  }  
  return filteredWatchlist;
}

let computeLinks=function(currentUser){
  let watchlist = loadWatchlists();
  var filteredLinks=[];
  var i;
  for (i=0;i<watchlist.length;i++){
    if (containsObject(currentUser,watchlist[i].users)){
       if (i==0){
        filteredLinks.push("godfather");
       }
       else if (i==1){
        filteredLinks.push("godfather2");
      }
      else if (i==2){
        filteredLinks.push("scream");
      }
      else if (i==3){
        filteredLinks.push("conjuring");
      }
      else if (i==4){
        filteredLinks.push("fightclub");
      }
      else if (i==5){
        filteredLinks.push("darkknight");
      }
    }
  }
  return filteredLinks;
}

let searchResults = function(searchString){
  let result = [];
  searchString = searchString.toLowerCase();
  if (searchString.length > 0 & searchString !=" "){
  if ('the godfather'.includes(searchString)){
     result.push("The Godfather (1972)");
  }
  if ('the godfather: part ii'.includes(searchString)){
    result.push("The Godfather: Part II (1974)");
  }
  if ('scream'.includes(searchString)){
    result.push("Scream (1996)");
  }
  if ('the conjuring'.includes(searchString)){
    result.push("The Conjuring (2013)");
  }
  if ('fight club'.includes(searchString)){
    result.push("Fight Club (1999)");
  }
  if ('the dark knight'.includes(searchString)){
    result.push("The Dark Knight (2008)");
  }
}
  return result;
}

let searchLinks = function(searchString){
  let result = [];
  searchString = searchString.toLowerCase();
  if (searchString.length>0 & searchString !=" "){
  if ('the godfather'.includes(searchString)){
     result.push("godfather");
  }
  if ('the godfather: part ii'.includes(searchString)){
    result.push("godfather2");
  }
  if ('scream'.includes(searchString)){
    result.push("scream");
  }
  if ('the conjuring'.includes(searchString)){
    result.push("conjuring");
  }
  if ('fight club'.includes(searchString)){
    result.push("fightclub");
  }
  if ('the dark knight'.includes(searchString)){
    result.push("darkknight");
  }
}
  return result;
}


//</functions>




/////////////////////////////////////////
app.get('/', function(req, res) {
  res.render('login');
});
app.get('/register',function(req,res){
  res.render('register');
})
app.get('/registration', function(req,res){
  res.render('registration');
});
app.get('/home', function(req,res){
  res.render('home');
});
app.get('/searchresults', function(req,res){
  res.render('searchresults',{
    results:[],links:[]
  });
});
app.get('/watchlist', function(req,res){
  let w = computeWatchlist(req.session.user);
  let l = computeLinks(req.session.user);
  res.render('watchlist',{
    watchlist:w, links:l
  });
});

app.post('/Search',function(req,res){
  let searchString =req.body.Search;
  let result = searchResults(searchString);
  let link = searchLinks(searchString);
  res.render('searchresults',{
    results:result, links:link
  });
});

app.post('/', function(req,res){
  let result=logUser(""+req.body.username,""+req.body.password);
  if (result==='home'){
    req.session.user = req.body.username;
    res.redirect("/"+result);
  }
  else{
    res.render('register',{
      message:result
    });
  }
});

app.post('/register',function(req,res){

  //let result=addUser(""+req.body.username,""+req.body.password);
  let result=addUser(""+req.body.username,""+req.body.password);
  if (result==='registration'){
    res.render('register',{
      message:"Username already taken"
    });
  }
  else{
    res.render('register',{
      message:"Registration Successful"
    });
  }
});
///<adding watchlists>
app.post('/addgf1',function(req,res){
  let watchlist=loadWatchlists();
  let currentUser=req.session.user;
  var i;
  for(i=0;i<watchlist.length;i++){
    if (watchlist[i].movie=="godfather1")
       break;
  }
  if (containsObject(currentUser,watchlist[i].users)){
    res.render('error',{
      message:"Movie is already in your watchlist"
    });
  }
  else{
    watchlist[i].users.push(currentUser);
    fs.writeFileSync('watchlist.json', JSON.stringify(watchlist));
  }
});

app.post('/addgf2',function(req,res){
  let watchlist=loadWatchlists();
  let currentUser=req.session.user;
  var i;
  for(i=0;i<watchlist.length;i++){
    if (watchlist[i].movie=="godfather2")
       break;
  }
  if (containsObject(currentUser,watchlist[i].users)){
    res.render('error',{
      message:"Movie is already in your watchlist"
    });
  }
  else{
    watchlist[i].users.push(currentUser);
    fs.writeFileSync('watchlist.json', JSON.stringify(watchlist));
  }
});

app.post('/addscream',function(req,res){
  let watchlist=loadWatchlists();
  let currentUser=req.session.user;
  var i;
  for(i=0;i<watchlist.length;i++){
    if (watchlist[i].movie=="scream")
       break;
  }
  if (containsObject(currentUser,watchlist[i].users)){
    res.render('error',{
      message:"Movie is already in your watchlist"
    });
  }
  else{
    watchlist[i].users.push(currentUser);
    fs.writeFileSync('watchlist.json', JSON.stringify(watchlist));
  }
});

app.post('/addconj',function(req,res){
  let watchlist=loadWatchlists();
  let currentUser=req.session.user;
  var i;
  for(i=0;i<watchlist.length;i++){
    if (watchlist[i].movie=="conjuring")
       break;
  }
  if (containsObject(currentUser,watchlist[i].users)){
    res.render('error',{
      message:"Movie is already in your watchlist"
    });
  }
  else{
    watchlist[i].users.push(currentUser);
    fs.writeFileSync('watchlist.json', JSON.stringify(watchlist));
  }
});

app.post('/addfc',function(req,res){
  let watchlist=loadWatchlists();
  let currentUser=req.session.user;
  var i;
  for(i=0;i<watchlist.length;i++){
    if (watchlist[i].movie=="fightclub")
       break;
  }
  if (containsObject(currentUser,watchlist[i].users)){
    res.render('error',{
      message:"Movie is already in your watchlist"
    });
  }
  else{
    watchlist[i].users.push(currentUser);
    fs.writeFileSync('watchlist.json', JSON.stringify(watchlist));
  }
});

app.post('/adddk',function(req,res){
  let watchlist=loadWatchlists();
  let currentUser=req.session.user;
  var i;
  for(i=0;i<watchlist.length;i++){
    if (watchlist[i].movie=="dk")
       break;
  }
  if (containsObject(currentUser,watchlist[i].users)){
    res.render('error',{
      message:"Movie is already in your watchlist"
    });
  }
  else{
    watchlist[i].users.push(currentUser);
    fs.writeFileSync('watchlist.json', JSON.stringify(watchlist));
  }
});

///</adding watchlists>

//<action movies>
app.get('/action', function(req,res){
  res.render('action');
});
app.get('/fightclub', function(req,res){
  res.render('fightclub');
});
app.get('/darkknight', function(req,res){
  res.render('darkknight');
});
//</action movies>

//<drama movies>
app.get('/drama', function(req,res){
  res.render('drama');
});
app.get('/godfather', function(req,res){
  res.render('godfather');
});
app.get('/godfather2', function(req,res){
  res.render('godfather2');
});
//</drama movies>

// <horror movies>
app.get('/horror', function(req,res){
  res.render('horror');
});
app.get('/scream', function(req,res){
  res.render('scream');
});
app.get('/conjuring', function(req,res){
  res.render('conjuring');
});
// </horror movies>

//<additional functions>
function containsObject(obj, list) {
  var i;
  for (i = 0; i < list.length; i++) {
      if (list[i] === obj) {
          return true;
      }
  }

  return false;
}


//</additional functions>


///////////////////////////////////////
app.listen(process.env.PORT);
//app.listen(3000);
module.exports = app;


/*if (process.env.PORT){
  app.listen(process.env.PORT,function(){console.log('Server started')});
}
else{
  app.listen(3000,function(){console.log('Server started on port 3000')});
}
*/