const board = document.getElementById("board")
const movesDisplay = document.getElementById("moves")
const timerDisplay = document.getElementById("timer")
const message = document.getElementById("message")
const restartBtn = document.getElementById("restart")

let emojis = ["🍎","🍌","🍇","🍉","🍓","🍍","🍎","🍌","🍇","🍉","🍓","🍍"]

let firstCard = null
let secondCard = null
let lockBoard = false
let moves = 0
let matches = 0
let timer = 0
let interval

function shuffle(array){
return array.sort(()=>0.5-Math.random())
}

function startTimer(){
interval=setInterval(()=>{
timer++
timerDisplay.textContent=timer
},1000)
}

function createBoard(){

board.innerHTML=""
shuffle(emojis)

emojis.forEach(emoji=>{

const card=document.createElement("div")
card.classList.add("card")

card.innerHTML=`
<div class="card-inner">
<div class="card-front">${emoji}</div>
<div class="card-back">?</div>
</div>
`

card.dataset.emoji=emoji

card.addEventListener("click",flipCard)

board.appendChild(card)

})

}

function flipCard(){

if(lockBoard) return
if(this===firstCard) return

this.classList.add("flip")

if(!firstCard){
firstCard=this
return
}

secondCard=this
moves++
movesDisplay.textContent=moves

checkMatch()

}

function checkMatch(){

if(firstCard.dataset.emoji===secondCard.dataset.emoji){

matches++

resetTurn()

if(matches===6){
clearInterval(interval)
message.textContent="🎉 You Won!"
}

}else{

lockBoard=true

setTimeout(()=>{

firstCard.classList.remove("flip")
secondCard.classList.remove("flip")

resetTurn()

},800)

}

}

function resetTurn(){

[firstCard,secondCard,lockBoard]=[null,null,false]

}

function restartGame(){

moves=0
matches=0
timer=0

movesDisplay.textContent=0
timerDisplay.textContent=0
message.textContent=""

clearInterval(interval)

createBoard()
startTimer()

}

restartBtn.addEventListener("click",restartGame)

createBoard()
startTimer()