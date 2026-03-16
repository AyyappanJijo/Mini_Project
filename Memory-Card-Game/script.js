const board=document.getElementById("board")
const movesDisplay=document.getElementById("moves")
const timerDisplay=document.getElementById("timer")
const difficultySelect=document.getElementById("difficulty")
const leaderboard=document.getElementById("leaderboard")

let emojis=["🍎","🍌","🍇","🍉","🍓","🍍","🥝","🍒","🍑","🥥"]

let cards=[]
let firstCard=null
let secondCard=null
let lock=false

let moves=0
let matches=0
let timer=0
let interval

let multiplayer=false
let playerTurn=1
let player1Score=0
let player2Score=0

function startGame(){

clearInterval(interval)

moves=0
matches=0
timer=0

movesDisplay.textContent=0
timerDisplay.textContent=0

let pairCount=4

if(difficultySelect.value==="medium") pairCount=6
if(difficultySelect.value==="hard") pairCount=8

let selected=emojis.slice(0,pairCount)

cards=[...selected,...selected]

cards.sort(()=>0.5-Math.random())

createBoard()

startTimer()

}

function createBoard(){

board.innerHTML=""

cards.forEach(emoji=>{

const card=document.createElement("div")

card.className="card"

card.innerHTML=`
<div class="card-inner">
<div class="front">${emoji}</div>
<div class="back">?</div>
</div>
`

card.dataset.emoji=emoji

card.addEventListener("click",flipCard)

board.appendChild(card)

})

}

function flipCard(){

if(lock) return
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

if(multiplayer){

if(playerTurn===1){
player1Score++
document.getElementById("p1").textContent=player1Score
}else{
player2Score++
document.getElementById("p2").textContent=player2Score
}

}

resetTurn()

if(matches===cards.length/2){
winGame()
}

}else{

lock=true

setTimeout(()=>{

firstCard.classList.remove("flip")
secondCard.classList.remove("flip")

resetTurn()

if(multiplayer){

playerTurn = playerTurn===1 ? 2 : 1
document.getElementById("turn").textContent="Player "+playerTurn

}

},800)

}

}

function resetTurn(){

[firstCard,secondCard,lock]=[null,null,false]

}

function startTimer(){

interval=setInterval(()=>{

timer++
timerDisplay.textContent=timer

},1000)

}

function winGame(){

clearInterval(interval)

if(multiplayer){

if(player1Score>player2Score) alert("🏆 Player 1 Wins!")
else if(player2Score>player1Score) alert("🏆 Player 2 Wins!")
else alert("Draw!")

}else{

saveScore()

}

confettiEffect()

}

function saveScore(){

let scores=JSON.parse(localStorage.getItem("scores"))||[]

scores.push(timer)

scores.sort((a,b)=>a-b)

scores=scores.slice(0,5)

localStorage.setItem("scores",JSON.stringify(scores))

renderLeaderboard()

}

function renderLeaderboard(){

let scores=JSON.parse(localStorage.getItem("scores"))||[]

leaderboard.innerHTML=""

scores.forEach(score=>{

let li=document.createElement("li")

li.textContent=score+" seconds"

leaderboard.appendChild(li)

})

}

document.getElementById("start").addEventListener("click",startGame)

document.getElementById("multiplayer").addEventListener("click",()=>{

multiplayer=true

player1Score=0
player2Score=0
playerTurn=1

document.getElementById("p1").textContent=0
document.getElementById("p2").textContent=0
document.getElementById("turn").textContent="Player 1"

alert("Multiplayer Mode Activated")

})

document.getElementById("themeToggle").addEventListener("click",()=>{

document.body.classList.toggle("light")

})

renderLeaderboard()

function confettiEffect(){

const canvas=document.getElementById("confetti")

const ctx=canvas.getContext("2d")

canvas.width=window.innerWidth
canvas.height=window.innerHeight

for(let i=0;i<150;i++){

ctx.fillStyle=`hsl(${Math.random()*360},100%,50%)`

ctx.fillRect(Math.random()*canvas.width,Math.random()*canvas.height,5,5)

}

}
