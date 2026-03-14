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

const flipSound=new Audio("sounds/flip.mp3")
const matchSound=new Audio("sounds/match.mp3")
const winSound=new Audio("sounds/win.mp3")

function startGame(){

clearInterval(interval)

moves=0
timer=0
matches=0

movesDisplay.textContent=0
timerDisplay.textContent=0

let difficulty=difficultySelect.value

let pairCount=4

if(difficulty==="medium") pairCount=6
if(difficulty==="hard") pairCount=8

let selected=emojis.slice(0,pairCount)

cards=[...selected,...selected]

cards.sort(()=>0.5-Math.random())

createBoard(pairCount)

startTimer()

}

function createBoard(pairCount){

board.innerHTML=""

let columns=4
if(pairCount===8) columns=4
if(pairCount===6) columns=4

board.style.gridTemplateColumns=`repeat(${columns},1fr)`

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

flipSound.play()

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

matchSound.play()

matches++

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

winSound.play()

saveScore()

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

renderLeaderboard()

function confettiEffect(){

const canvas=document.getElementById("confetti")

const ctx=canvas.getContext("2d")

canvas.width=window.innerWidth
canvas.height=window.innerHeight

let pieces=[]

for(let i=0;i<150;i++){

pieces.push({

x:Math.random()*canvas.width,

y:Math.random()*canvas.height,

size:Math.random()*6+4,

speed:Math.random()*3+2

})

}

function draw(){

ctx.clearRect(0,0,canvas.width,canvas.height)

pieces.forEach(p=>{

ctx.fillStyle=`hsl(${Math.random()*360},100%,50%)`

ctx.fillRect(p.x,p.y,p.size,p.size)

p.y+=p.speed

if(p.y>canvas.height) p.y=0

})

requestAnimationFrame(draw)

}

draw()

}
