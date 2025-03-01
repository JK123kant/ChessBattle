
const socket=io();
const chess=new Chess();

const boardElement=document.querySelector(".chessboard");

let dragpiece=null;
let sourceSquare=null;
let playerRole=null;

const renderBoard=()=>{
    const board=chess.board();
    boardElement.innerHTML="";
    board.forEach((row,rowindex)=>{
        row.forEach((square,squareindex)=>{
           const squareElement= document.createElement("div");
            squareElement.classList.add("square",(rowindex+squareindex)%2===0?"ight": "dark");

            squareElement.dataset.row=rowindex;
            squareElement.dataset.col=squareindex;

            if(square){
                const pieceElement=document.createElement("div");
                pieceElement.classList.add("piece",square.color==="W"?"white":"dark");
                pieceElement.innerText=getPieceUnicode(square);
                pieceElement.draggable= playerRole===square.color;

                pieceElement.addEventListener("dragstart",(e)=>{
                    if(pieceElement.draggable){
                        dragpiece=pieceElement;
                        sourceSquare={row:rowindex,col:squareindex};
                        e.dataTransfer.setData("text/plain","");
                    }
                });

                pieceElement.addEventListener("dragend",(e)=>{
                    dragpiece=null;
                    sourceSquare=null;
                });
                squareElement.appendChild(pieceElement);
            }

            squareElement.addEventListener("dragover",function(e){
                e.preventDefault();
            });

            squareElement.addEventListener("drop",function(e){
                e.preventDefault();
                if(dragpiece){
                    const targetsource={
                        row:parseInt(squareElement.dataset.row),
                        col:parseInt(squareElement.dataset.col)
                    };

                    handleMove(sourceSquare,targetsource);
                }
            });
            boardElement.appendChild(squareElement);
        });

        
         });

         if(playerRole==="B"){
            boardElement.classList.add("flipped");
         }else{
            boardElement.classList.remove("flipped");
         }
         
};

const handleMove=(source,target)=>{
    const move={
        from: `${String.fromCharCode(97+source.col)}${8-source.row}`,
        to:`${String.fromCharCode(97+target.col)}${8-target.row}` ,
        promotion:'q',
    };
    socket.emit("move",move);
};

const getPieceUnicode=(piece)=>{
const unicodePices={
    p: "♟",  // Black Pawn  
    r: "♜",  // Black Rook  
    n: "♞",  // Black Knight  
    b: "♝",  // Black Bishop  
    q: "♛",  // Black Queen  
    k: "♚",  // Black King  
    P: "♙",  // White Pawn  
    R: "♖",  // White Rook  
    N: "♘",  // White Knight  
    B: "♗",  // White Bishop  
    Q: "♕",  // White Queen  
    K: "♔"   // White King 
};

return unicodePices[piece.type] || "";

};

socket.on("playerRole",function(role){
    playerRole=role;
    renderBoard();
});

socket.on("DekhoBass",function(){
    playerRole=null;
    renderBoard();
});
socket.on("boardState",function(fen){
    chess.load(fen);
    renderBoard();
});

socket.on("boardState",function(move){
    chess.move(move);
    renderBoard();
})

renderBoard();
