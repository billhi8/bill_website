// index.js
var express = require('express');
var loki = require('lokijs');
var bodyParser = require('body-parser');

var db = new loki('mydb.json', {
    autosave: true,
    autosaveInterval: 1000
});
var notes;
var users;
db.loadDatabase({}, function (err) {
    notes = db.getCollection('notes');
    users = db.getCollection('users');
    //console.log(users.data);
});

var app = express();

// 加入靜態檔案資料夾路徑
app.use(express.static(__dirname + '/www'));

// 加入BodyParser來解析POST的內容,app.post才能用
app.use(bodyParser.urlencoded({
    extended: false
}));


app.set('views', __dirname + '/views');
// 設定使用的引擎為ejs
app.set('view engine', 'ejs');

app.get('/home', function (req, res) {
    //console.log(req.query.name);
    res.render('home', {
        title: "前端程式設計基礎 282期",
        notes: notes.find({})
    });
    res.end();
});

app.get('/', function (req, res) {
    res.redirect('/home');
});

var userAccount;
//此處app.get和app.post是分別處理
////登入
app.get('/login', function (req, res) {
    res.render('login', {
        message: "請輸入帳號密碼"
    });
    res.end();
});
//submit按呼叫app.post
app.post('/login', function (req, res) {
    res.render('login', {
        message: "登入失敗，請重新輸入帳號密碼"
    });
    res.end();
});


////註冊
app.get('/signup', function (req, res) {
    res.render('signup', {
        message: ""
    });
    res.end();
});
app.post('/signup', function (req, res) {
    //console.log(req.body.name);
    //console.log(req.body.password);

    var message;
    if (req.body.name.length === 0 ) {
        message="尚未輸入帳號，請重新輸入";
    } else {
        //查詢帳號是否存在
        var user = users.find({
            name:req.body.name
        });  
        if (user.length > 0) {
            message="此帳號已存在，請重新註冊";
        } else {
            users.insert({
                name:req.body.name,
                password:req.body.password
            });
            message="註冊成功";
        }
    }
    res.render('signup',{
        message:message
    });
    //console.log(users.find({name:req.body.name}));
    //console.log(users.data);
    res.end();
});

////筆記
app.get('/notes', function (req, res) {
    res.render('notes', {
        notes: notes.data
    });
    res.end();
});
app.post('/notes', function (req, res) {
    notes.insert({
        color: req.body.note_color,
        text: req.body.note_text
    });
    //console.log(notes.data)
    res.render('notes', {
        notes: notes.data
    });
    res.end();
});

////猜數字-人
var Pnum;
var AnswerResult = [];
app.get('/guessnumber', function (req, res) {
    Pnum = 0;
    AnswerResult[0] = parseInt(Math.random()*10); 
    for (var num = 1; num < 4 ; num++) {
        var temp = parseInt(Math.random()*10);
            for (var n = 0; n < num ; n++) {                
                if (AnswerResult[n] == temp) {
                     n = num;
                     num = num - 1;                     
                } else {
                    AnswerResult[num] = temp; 
                }
            }
    }
    //console.log(AnswerResult);
    res.render('guessnumber', {
        message: ""
    });
});
app.post('/guessnumber', function (req, res) {
    var Anum = 0;
    var Bnum = 0;
    var Status = 0;
    var message = "";  
    //console.log(req.body); 
    if (req.body.inputnum.length === 0) {
        message="你尚未輸入，請輸入，方可玩遊戲";
    } else if (req.body.inputnum.length != 4) {
        message="此為四位數的猜數字，請重新輸入";
    } else {
        Pnum += 1;
        for (var num = 0; num<req.body.inputnum.length ; num++) {
            for (var ans = 0; ans<AnswerResult.length ; ans++) {
                if (num != ans && req.body.inputnum[num] === req.body.inputnum[ans]) {
                    Err = -1;
                    break;
                }
                if (req.body.inputnum[num] == AnswerResult[ans]){
                    if (num == ans) {
                        Anum += 1;
                    } else {
                        Bnum += 1;
                    }
                }
            }
        }
        //console.log( Anum + "A" + Bnum +"B" );
        if (Status == -1) {
            message = "猜的數字，不得有重複，請重新輸入";
        } else if (Anum === 0 && Bnum === 0) {
            message = "猜的數字，全部沒有猜到，請繼續" + "，目前猜了：" +Pnum +" 次";;
        } else if (Anum != 4) {
            message = "猜的數字：[" +req.body.inputnum + "]     " + Anum + "A" + Bnum +"B" + "，目前猜了：" +Pnum +" 次";
        } else{
            message = "恭喜答對了，答案為：" +req.body.inputnum + "，總共猜了：" +Pnum +" 次";
        } 
    } 
    res.render('guessnumber',{
        message:message
    });
    res.end();
});
////猜數字-答案
app.get('/answer', function (req, res) {
    res.render('answer', {
        message: AnswerResult
    });
});
////猜數字-電腦
app.get('/computerguess', function (req, res) {
    Pnum = 0;
    res.render('computerguess', {
        message: ""
    });
});
app.post('/computerguess', function (req, res) {
    var Status = 0;
    //console.log(req.body); 
    if (req.body.inputnum.length === 0) {
        message="你尚未輸入，請輸入，電腦方可猜";
    } else if (req.body.inputnum.length != 4) {
        message="此為四位數的猜數字，請重新輸入";
    } else {
        Pnum = 0;
        while (Status === 0) {
            Pnum += 1;
            //取得電腦的數字
            AnswerResult[0] = parseInt(Math.random()*10); 
            for (var num = 1; num < 4 ; num++) {
                var temp = parseInt(Math.random()*10);
                    for (var n = 0; n < num ; n++) {                
                        if (AnswerResult[n] == temp) {
                            n = num;
                            num = num - 1;                     
                        } else {
                            AnswerResult[num] = temp; 
                        }
                    }
            }
            //解析是否和答案一致
            Status = -1;
            for (var numA = 0; numA<req.body.inputnum.length ; numA++) {
                if (req.body.inputnum[numA] != AnswerResult[numA]){
                    Status = 0;
                }
            }
        }
        //console.log( "電腦猜了：" + Pnum + "次" );
        message = "電腦猜了：" + Pnum + "次";
    } 
    res.render('computerguess',{
        message:message
    });
    res.end();
});
////關於我
app.get('/about', function (req, res) {
    res.render('about', {
        message: ""
    });
});

app.listen(1234);