const board = document.getElementById("board")
const turnText = document.getElementById("turn")

let currentTurn = "white"
let draggedPiece = null

const initialBoard = [

["♜","♞","♝","♛","♚","♝","♞","♜"],
["♟","♟","♟","♟","♟","♟","♟","♟"],
["","","","","","","",""],
["","","","","","","",""],
["","","","","","","",""],
["","","","","","","",""],
["♙","♙","♙","♙","♙","♙","♙","♙"],
["♖","♘","♗","♕","♔","♗","♘","♖"]

]

function createBoard(){

for(let row=0;row<8;row++){

for(let col=0;col<8;col++){

const square=document.createElement("div")

square.classList.add("square")

if((row+col)%2===0){
square.classList.add("white")
}else{
square.classList.add("black")
}

square.dataset.row=row
square.dataset.col=col

square.addEventListener("dragover",allowDrop)
square.addEventListener("drop",dropPiece)

const pieceSymbol = initialBoard[row][col]

if(pieceSymbol !== ""){

const piece=document.createElement("div")

piece.textContent=pieceSymbol

piece.classList.add("piece")

piece.draggable=true

if(pieceSymbol === pieceSymbol.toUpperCase()){
piece.dataset.color="white"
}else{
piece.dataset.color="black"
}

piece.addEventListener("dragstart",dragStart)

square.appendChild(piece)

}

board.appendChild(square)

}

}

}

function dragStart(){

draggedPiece=this

}

function allowDrop(e){

e.preventDefault()

}

function dropPiece(){

if(!draggedPiece) return

const pieceColor = draggedPiece.dataset.color

if(pieceColor !== currentTurn) return

const existingPiece = this.querySelector(".piece")

if(existingPiece){

if(existingPiece.dataset.color === pieceColor){

return

}

existingPiece.remove()

}

this.appendChild(draggedPiece)

switchTurn()

}

function switchTurn(){

currentTurn = currentTurn === "white" ? "black" : "white"

turnText.textContent = "Turn: " + currentTurn.charAt(0).toUpperCase()+currentTurn.slice(1)

}

createBoard()