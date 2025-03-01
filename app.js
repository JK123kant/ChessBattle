const express=require('express');
const socket=require('socket.io');
const http=require('http');
const {Chess}=require('chess.js');
const path=require('path');
require('dotenv').config();
const PORT = process.env.PORT || 3000;
const app=express();

const Server=http.createServer(app);
const io=socket(Server);

const chess=new Chess();
let players={};
let currentPlayer="w";

app.set('view engine','ejs');
app.use(express.static(path.join(__dirname,'public')));

app.get('/',(req,res)=>{
    res.render('index',{title:"Chess Game"});
});

io.on("connection",function(uniquesocket)
{
    console.log("Connected");

    if(!players.white){
        players.white=uniquesocket.id;
        uniquesocket.emit("playerRole","w");
    }else if(!players.black){
    
        players.black=uniquesocket.id;
        uniquesocket.emit("playerRole","b");
    }else{
        uniquesocket.emit("DekhoBass");
    }
    uniquesocket.on("disconnect",function(){
            if(players.white==uniquesocket.id){
               delete players.white;
            }else if(players.black==uniquesocket.id){
                delete players.black;
            }
    });

    uniquesocket.on("move",(move)=>{
        try{
            if(chess.turn()==="w" && uniquesocket.id!==players.white)
                return;
            if(chess.turn()==="b" && uniquesocket.id!==players.black)
                return;

           const result= chess.move(move);
           if(result){
               currentPlayer=chess.turn();
               io.emit("move",move);
               io.emit("boardState",chess.fen());
           }else{
            console.log("Invalid Move: ",move);
            uniquesocket.emit("invalid move: ",move);
            
        }
    }catch(e){
        console.log(e);
        uniquesocket.emit("invalid move: ",move);

        }
    });
    
});

Server.listen(PORT,()=>{
    console.log(`Server is running on ${PORT}`);
});