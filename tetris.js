class Tetris{
    constructor(SourceX, SourceY, template){
        this.SourceX = SourceX;
        this.SourceY = SourceY;
        this.template = template;
        this.x = CountX/2 - 1
        this.y = 0
    }
    getPredictPosition(){
        let predictPosition = this.getTruncedPosition();
        while(predictPosition.y < CountY){
            for(let i = 0;i<this.template.length; i++){
                for(let j = 0;j<this.template.length; j++){
                    if(this.template[i][j]==0)continue;
                    let realX = i + predictPosition.x;
                    let realY = j + predictPosition.y;
                    if(realY + 1 >= CountY) {
                        return predictPosition
                    }
                    if(GameMap[realY + 1][realX].SourceX != -1){
                        return predictPosition
                    }
                }
            }
            predictPosition.y++
        }
    }
    getTruncedPosition(){
        return{x:Math.trunc(this.x), y:Math.trunc(this.y)}
    }
    
    checkBottom(){
        for(let i = 0;i<this.template.length; i++){
            for(let j = 0;j<this.template.length; j++){
                if(this.template[i][j]==0)continue;
                let realX = i + this.getTruncedPosition().x;
                let realY = j + this.getTruncedPosition().y;

                if(realY + 1 >= CountY) {
                    playAudio("hit.wav")
                    return false
                }
                if(GameMap[realY + 1][realX].SourceX != -1){
                    playAudio("hit.wav")
                    return false
                }
            }
        }
        return true
    }
    checkRight(){
        for(let i = 0;i<this.template.length; i++){
            for(let j = 0;j<this.template.length; j++){
                if(this.template[i][j]==0)continue;
                let realX = i + this.getTruncedPosition().x;
                let realY = j + this.getTruncedPosition().y;
                if(realX + 1 >= CountX) return false
                if(GameMap[realY][realX+1].SourceX != -1){
                    return false
                }
            }
        }
        return true
    }
    checkLeft(){
        for(let i = 0;i<this.template.length; i++){
            for(let j = 0;j<this.template.length; j++){
                if(this.template[i][j]==0)continue;
                let realX = i + this.getTruncedPosition().x;
                let realY = j + this.getTruncedPosition().y;
                if(realX - 1 < 0) return false
                
                if(GameMap[realY][realX-1].SourceX != -1){
                    return false
                }
            }
        }
        return true
    }
    moveBottom(){
        if(this.checkBottom()){
            this.y++
        }
    }
    moveRight(){
        if(this.checkRight()){
            isMoving = true
            this.x++
        }
    }
    moveLeft(){
        if(this.checkLeft()){
            isMoving = true
            this.x--
        }
    }
    checkCollsion(template){
        let tempx = this.x;
        let tempy = this.y;
        let check = 0;
        let OK = true;
        while(check < (template.length * template.length)){
            OK = true;
            for(let i = 0; i < template.length; i++){
                for(let j = 0; j < template.length; j++){
                    if(template[i][j]==0)continue;
                    let realX = i + tempx;
                    let realY = j + tempy;
                    if(realX < 0){
                        tempx++
                        OK = false
                        break
                    }
                    else if(realX >= CountX){
                        tempx--
                        OK = false
                        break
                    }
                    else{
                        if(realY >= CountY){
                            tempy--
                            OK = false
                            break
                        }
                        if(GameMap[realY][realX].SourceX != -1){
                            if(i>=template.length/2) tempx--
                            else tempx++
                            if(j>=template.length/2) tempy--
                            else tempy++
                            OK = false
                            break
                        }
                        
                    } 
                }
            }
            if(OK) break
            check++;
        }
        console.log(OK);
        if(OK){
            this.x = tempx
            this.y = tempy
        }
        return !OK;
    }
    changeRotation(Direction){
        let NextTemplate = []
        for(let i=0; i < this.template.length;i++)
            NextTemplate[i] = this.template[i].slice();
        let n = this.template.length;
        for(let layer = 0; layer< n/2; layer++){
            let first = layer;
            let last = n - 1 - first;
            for(let i = first; i < last; i++){
                let offset = i - first;
                let topTemp = NextTemplate[first][i]
                if(Direction){
                    NextTemplate[first][i] = NextTemplate[last - offset][first]  //左到上
                    NextTemplate[last - offset][first] = NextTemplate[last][last-offset]  //下到左
                    NextTemplate[last][last-offset] = NextTemplate[i][last]             //右到下
                    NextTemplate[i][last] = topTemp              //上到右
                }
                else{
                    NextTemplate[first][i] = NextTemplate[i][last]                        //右到上
                    NextTemplate[i][last] = NextTemplate[last][last-offset]               //下到右
                    NextTemplate[last][last-offset] = NextTemplate[last - offset][first]  //左到下
                    NextTemplate[last - offset][first] = topTemp              //上到左
                } 
            }
        }
        if(!this.checkCollsion(NextTemplate)){
            this.template = NextTemplate
        }
    }
}

const sourceSquareSize = 24;
const BlockSize = 40;
const KeySetButtons =document.getElementsByName("SetKey")
const ScoreText = document.getElementById("Score")
const DifficultyText = document.getElementById("Difficulty")
const VolumeText= document.getElementById("Volume")
const StoreCanvas = document.getElementById("StoreCanvas")
const MainCanvas = document.getElementById("MainCanvas")
const NextCanvas = document.getElementById("NextCanvas")
const GameOverView = document.getElementById("GameOver")
const ResetButton = document.getElementById("Reset")
const source = document.getElementById("source")
const playImg = document.getElementById("play")
const gameoverImg = document.getElementById("gameover")
const StoreContext = StoreCanvas.getContext('2d');
const MainContext = MainCanvas.getContext('2d');
const NextContext = NextCanvas.getContext('2d');
const CountX = MainCanvas.width / BlockSize;
const CountY = MainCanvas.height / BlockSize;
const FPS = 24;
let GameThread;
let Speed = 3;
let GameMap;
let IsGameStart = false;
let IsGameOver = false;
let storeShape = null;
let ChangeLock = false;
let currentShape;
let nextShape;
let FirstPatten = [];
let ShapeCount = 0;
let Score = 0
let AudioVolume = 5
let Keys = {
    方塊逆轉: {Key:"Z",Value: 90},
    方塊順轉: {Key:"X",Value: 88},
    儲存方塊: {Key:"C",Value: 67},
  };
let IsSettingKey = -1
for (let i = 0; i<KeySetButtons.length;i++) {
    KeySetButtons[i].addEventListener('click', ()=>{
        if(!IsGameStart){
            // console.log( i+":"+ KeySetButtons[i].id);
            if(IsSettingKey==-1){
                if(KeySetButtons[i].value!=="..."){
                    KeySetButtons[i].value = "..."
                    IsSettingKey = i
                }
            }
            else{
                if(i!=IsSettingKey)
                    alert("請先完成" + KeySetButtons[IsSettingKey].id + "的設置")
                else{
                    console.log("Finish" + Keys[KeySetButtons[i].id].Key + ":" + Keys[KeySetButtons[i].id].Value);
                    KeySetButtons[i].style.background  = "#f0f0f0"
                    KeySetButtons[i].value = Keys[KeySetButtons[i].id].Key
                    IsSettingKey = -1
                }
            }
        }
        else IsSettingKey = -1;
    });
}
let SetBGM = (AudioFile)=>{
    const audio = new Audio(AudioFile);
    audio.volume = AudioVolume/100
    audio.loop = true;
    return audio;
}
let BGM = SetBGM("BGM.mp3");

let playAudio = (AudioFile)=>{
    const audio = new Audio(AudioFile);
    audio.volume = AudioVolume/100
    audio.play();
}
let ResetBGMVolume = ()=>{
    if(BGM!==null){
        BGM.volume = AudioVolume / 100
        console.log(BGM.volume);
    }   
}
let gameLoop = ()=>{
    Reset();
    GameThread = setInterval(update, 1000/Speed);
    setInterval(draw, 1000/FPS);
}
let isMoving = false
let MovingCount = 0
const MovingCountLimit = 2
let update = ()=>{
    if(IsGameStart){
        if(IsGameOver)return
        if(currentShape.checkBottom())
            currentShape.y++
        else {
            if(!isMoving) CheckCompleteRows()
            else {
                if(++MovingCount>=MovingCountLimit) {
                    CheckCompleteRows()
                    MovingCount = 0
                }
            }
            isMoving = false
        }
    }
}
let draw = ()=>{
    StoreContext.clearRect(0,0,StoreCanvas.width, StoreCanvas.height)
    MainContext.clearRect(0,0,MainCanvas.width, MainCanvas.height)
    NextContext.clearRect(0,0,NextCanvas.width, NextCanvas.height)
    ScoreText.innerHTML = "目前得分：" + Score
    DifficultyText.innerHTML = "目前難度：" + Speed
    VolumeText.innerHTML = "目前音量：" + AudioVolume
    drawBackground()
    drawSquares()
    if(IsGameStart){
        drawPredictShape()
        drawCurrentShape()
        drawNextShape()
        if(storeShape!==null) drawStoreShape()
        if(IsGameOver) drawGameOver()
    }
    else{
        drawPlay()
    }
    
}

let drawRect = (context,x,y,width,height,color) => {
    context.fillStyle = color;
    context.fillRect(x,y,width,height)
}
let drawBackground = ()=>{
    // Draw Store Canvas
    drawRect(StoreContext,0,0,StoreCanvas.width,StoreCanvas.height,"#888888")
    for(let j = 0; j <StoreCanvas.height/BlockSize ; j++){
        for(let i = 1; i < StoreCanvas.width/BlockSize; i++){
            drawRect(StoreContext,BlockSize * i, BlockSize * j, 2,BlockSize,"#000000")
        }
        drawRect(StoreContext,0, BlockSize * j, StoreCanvas.width, 2, "#000000")
    }
    // Draw Main Canvas
    drawRect(MainContext,0,0,MainCanvas.width,MainCanvas.height,"#888888")
    for(let j = 0; j < CountY; j++){
        for(let i = 1; i < CountX; i++){
            drawRect(MainContext,BlockSize * i, BlockSize * j, 2,BlockSize,"#000000")
        }
        drawRect(MainContext,0, BlockSize * j, MainCanvas.width, 2, "#000000")
    }
    // Draw Next Canvas
    drawRect(NextContext,0,0,NextCanvas.width,NextCanvas.height,"#888888")
    for(let j = 0; j <NextCanvas.height/BlockSize ; j++){
        for(let i = 1; i < NextCanvas.width/BlockSize; i++){
            drawRect(NextContext,BlockSize * i, BlockSize * j, 2,BlockSize,"#000000")
        }
        drawRect(NextContext,0, BlockSize * j, NextCanvas.width, 2, "#000000")
    }
}
let drawSquares = () =>{
    for(let i = 0;i<GameMap.length; i++){
        let row = GameMap[i];
        for(let j = 0;j<row.length; j++){
            if(row[j].SourceX ==-1) continue
            MainContext.drawImage(
                source,
                GameMap[i][j].SourceX,
                GameMap[i][j].SourceY,
                sourceSquareSize,
                sourceSquareSize,
                j * BlockSize,
                i * BlockSize,
                BlockSize,
                BlockSize
            )
        }
    }
}

let drawCurrentShape = () => {
    for(let i = 0; i < currentShape.template.length;i++){
        for(let j = 0; j < currentShape.template.length;j++){
            if(currentShape.template[i][j]==0)continue;
            MainContext.drawImage(
                source,
                currentShape.SourceX,
                currentShape.SourceY,
                sourceSquareSize,
                sourceSquareSize,
                Math.trunc(currentShape.x) * BlockSize + BlockSize * i,
                Math.trunc(currentShape.y) * BlockSize + BlockSize * j,
                BlockSize,
                BlockSize
            )
                
        }
    }
}
let drawStoreShape = () => {
    for(let i = 0; i < storeShape.template.length;i++){
        for(let j = 0; j < storeShape.template.length;j++){
            if(storeShape.template[i][j]==0)continue;
            StoreContext.drawImage(
                source,
                storeShape.SourceX,
                storeShape.SourceY,
                sourceSquareSize,
                sourceSquareSize,
                BlockSize * i,
                BlockSize * j + BlockSize,
                BlockSize,
                BlockSize
            )
                
        }
    }
}
let drawPredictShape = () => {
    for(let i = 0; i < currentShape.template.length;i++){
        for(let j = 0; j < currentShape.template.length;j++){
            if(currentShape.template[i][j]==0)continue;
            MainContext.drawImage(
                source,
                0,
                sourceSquareSize*7,
                sourceSquareSize,
                sourceSquareSize,
                currentShape.getPredictPosition().x * BlockSize + BlockSize * i,
                currentShape.getPredictPosition().y * BlockSize + BlockSize * j,
                BlockSize,
                BlockSize
            )
                
        }
    }
}
let drawNextShape = () => {
    for(let i = 0; i < nextShape.template.length;i++){
        for(let j = 0; j < nextShape.template.length;j++){
            if(nextShape.template[i][j]==0)continue;
            NextContext.drawImage(
                source,
                nextShape.SourceX,
                nextShape.SourceY,
                sourceSquareSize,
                sourceSquareSize,
                BlockSize * i,
                BlockSize * j + BlockSize,
                BlockSize,
                BlockSize
            )
        }
    }
}
let getRandomShape = () => {
    let rand = Math.floor(Math.random() * 7);
    if(ShapeCount < 7){
        rand = FirstPatten[ShapeCount]
    }
    let templates = [
        [
            [1,1,0],
            [0,1,0],
            [0,1,0]
        ],
        
        [
            [0,1,0,0],
            [0,1,0,0],
            [0,1,0,0],
            [0,1,0,0]
        ],
        [
            [0,1,0],
            [0,1,0],
            [1,1,0]
        ],
        [
            [0,0,0],
            [0,1,1],
            [1,1,0]
        ],
        [
            [1,1],
            [1,1]
        ],
        [
            [0,0,0],
            [1,1,0],
            [0,1,1]
        ],
        [
            [0,0,0],
            [1,1,1],
            [0,1,0]
        ]
    ]
    ShapeCount++
    return new Tetris(0, sourceSquareSize * rand, templates[rand]);
}

let CheckCompleteRows = () =>{
    for(let i = 0;i<currentShape.template.length; i++){
        for(let j = 0;j<currentShape.template.length; j++){
            if(currentShape.template[i][j]==0)continue;
            let realY = j + currentShape.getTruncedPosition().y
            let realX = i + currentShape.getTruncedPosition().x
            GameMap[realY][realX] = {SourceX:currentShape.SourceX, SourceY:currentShape.SourceY};
        }
    }
    deleteCompleteRows()
    currentShape = nextShape
    nextShape = getRandomShape()
    ChangeLock = false
    if(!currentShape.checkBottom()){
        IsGameOver = true
        BGM.pause()
    }
}
let deleteCompleteRows = ()=>{
    let CompleteRowsCount = 0;
    for(let i = 0;i<GameMap.length; i++){
        let row = GameMap[i];
        let isComplete = true;
        for(let j = 0;j<row.length; j++){
            if(row[j].SourceX ==-1) {
                isComplete = false
                break
            }
        }
        if(isComplete){
            CompleteRowsCount++
            for(let k = i;k>0; k--){
                GameMap[k] = GameMap[k-1];
            }
            let rebuildRow = []
            for(let j = 0; j < CountX; j++){
                rebuildRow.push({SourceX:-1,SourceY:-1})
            }
            GameMap[0] = rebuildRow;
        }
    }
    switch(CompleteRowsCount) {
        case 1: 
            Score +=100;
            break
        case 2:
            Score +=300;
            break
        case 3:
            Score +=600;
            break
        case 4:
            Score +=1000;
            break
    }
}
let drawGameOver = () => {
    MainContext.drawImage(
        gameoverImg,
        0,
        0,
        gameoverImg.width,
        gameoverImg.height,
        (MainCanvas.width - gameoverImg.width)/2,
        300,
        gameoverImg.width,
        gameoverImg.height
    )
}
let drawPlay = () => {
    MainContext.drawImage(
        playImg,
        0,
        0,
        playImg.width,
        playImg.height,
        (MainCanvas.width - playImg.width)/2,
        300,
        playImg.width,
        playImg.height
    )
}
MainCanvas.addEventListener('click', (e) => {
    let mousePos = getMousePos(MainCanvas, e);
    if(IsGameStart==false){
        let playRect = {
            x:(MainCanvas.width - playImg.width)/2,
            y:300,
            width:playImg.width,
            height: playImg.height
        }
        if(isInside(mousePos,playRect))
            CheckGameStart()
    }
    else{
        let ResetRect = {
            x:(MainCanvas.width - gameoverImg.width)/2,
            y:300,
            width:gameoverImg.width,
            height: gameoverImg.height
        }
        if(IsGameOver)
            if(isInside(mousePos,ResetRect))
                Reset();
    }
}, false);
MainCanvas.addEventListener('mousemove', (e) => {
    let mousePos = getMousePos(MainCanvas, e);
    if(IsGameStart==false){
        let playRect = {
            x:(MainCanvas.width - playImg.width)/2,
            y:300,
            width:playImg.width,
            height: playImg.height
        }
        if(isInside(mousePos,playRect)) MainCanvas.style.cursor = "pointer";
        else  MainCanvas.style.cursor = "auto";
    }
    else{
        let ResetRect = {
            x:(MainCanvas.width - gameoverImg.width)/2,
            y:300,
            width:gameoverImg.width,
            height: gameoverImg.height
        }
        if(IsGameOver)
            if(isInside(mousePos,ResetRect)) MainCanvas.style.cursor = "pointer";
            else MainCanvas.style.cursor = "auto";
    }
}, false);
MainCanvas.addEventListener('click', (e) => {
    let mousePos = getMousePos(MainCanvas, e);
    if(IsGameStart==false){
        let playRect = {
            x:(MainCanvas.width - playImg.width)/2,
            y:300,
            width:playImg.width,
            height: playImg.height
        }
        if(isInside(mousePos,playRect))
            CheckGameStart()
    }
    else{
        let ResetRect = {
            x:(MainCanvas.width - gameoverImg.width)/2,
            y:300,
            width:gameoverImg.width,
            height: gameoverImg.height
        }
        if(IsGameOver)
            if(isInside(mousePos,ResetRect))
                Reset();
    }
    MainCanvas.style.cursor = "auto";
}, false);
//Function to get the mouse position
function getMousePos(canvas, event) {
    let rect = canvas.getBoundingClientRect();
    return {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
    };
}
function isInside(pos, rect){
    return pos.x > rect.x && pos.x < rect.x + rect.width && pos.y < rect.y + rect.height && pos.y > rect.y
}
let CheckGameStart=()=>{
    if(!IsGameStart){
        IsGameStart = true;
        BGM.currentTime = 0;
        BGM.play()
    }
}
let Reset = ()=>{
    Score = 0;
    FirstPatten = []
    let json={};
    while(FirstPatten.length < 7){
        let k=Math.floor(Math.random()*7);
        if(!json[k]){
            json[k]=true;
            FirstPatten.push(k);
        }
    }
    
    ShapeCount = 0;
    let InitMap = []
    for(let i = 0; i < CountY; i++){
        let row = [];
        for(let j = 0; j < CountX; j++){
            row.push({SourceX:-1,SourceY:-1})
        }
        InitMap.push(row);
    }
    GameMap = InitMap;
    storeShape = null;
    currentShape = getRandomShape();
    nextShape = getRandomShape();
    IsGameStart = false;
    IsGameOver = false;
}
window.addEventListener("keydown", (e) =>{
    console.log(e.keyCode);
    if(IsSettingKey!=-1 &&!IsGameStart){
        const usedKeyCodes = [98,50,104,56,100,52,102,54,37,65,38,87,39,68,40,83,32,13]
        if(!usedKeyCodes.includes(e.keyCode)){
            Keys[KeySetButtons[IsSettingKey].id].Key = e.key.toUpperCase()
            Keys[KeySetButtons[IsSettingKey].id].Value = e.keyCode
            KeySetButtons[IsSettingKey].style.background  = "#ffff00"
            KeySetButtons[IsSettingKey].value = e.key.toUpperCase()
        }
        else{
            alert("該按鍵無法設置")
        }
    }
    else{
        switch(e.keyCode){
            case 98:
            case 50:
                AudioVolume =(AudioVolume>0)? AudioVolume - 5 : 0
                ResetBGMVolume();
                break;
            case 104:
            case 56:
                AudioVolume =(AudioVolume<100)? AudioVolume + 5 : 100
                ResetBGMVolume();
                break;
            case 100:
            case 52:
                Speed =(Speed>1)? Speed - 1 : 1
                clearInterval(GameThread);
                GameThread = setInterval(update, 1000/Speed);
                break;
            case 102:
            case 54:
                Speed =(Speed<10)? Speed + 1 : 10
                clearInterval(GameThread);
                GameThread = setInterval(update, 1000/Speed);
                break;
            case 37:
            case 65:
                if(IsGameStart && !IsGameOver) currentShape.moveLeft();
                break;
            case Keys[KeySetButtons[0].id].Value :
                if(IsGameStart && !IsGameOver) currentShape.changeRotation(true);
                break;
            case 38:
            case 87:
            case Keys[KeySetButtons[1].id].Value :
                if(IsGameStart && !IsGameOver) currentShape.changeRotation(false);    
                break;
            case 39:
            case 68:
                if(IsGameStart && !IsGameOver) currentShape.moveRight();
                break;
            case 40:
            case 83:
                if(IsGameStart && !IsGameOver) currentShape.moveBottom();
                break; 
            case Keys[KeySetButtons[2].id].Value :
                if(IsGameStart && !IsGameOver) {
                    if(!ChangeLock){
                        let tempShape = storeShape;
                        storeShape = currentShape
                        if(tempShape!==null) {
                            tempShape.x = currentShape.x
                            tempShape.y = currentShape.y
                            while(tempShape.checkCollsion(tempShape.template))
                                tempShape.y--      
                            currentShape = tempShape
                        }
                        else{
                            currentShape = nextShape
                            nextShape = getRandomShape()
                        }
                        ChangeLock = true
                    }
                }
                break;  
            case 32:
                if(IsGameStart && !IsGameOver) {
                    while(currentShape.checkBottom()) currentShape.moveBottom();
                    CheckCompleteRows()
                }
                break;  
            case 13:
                if(!IsGameStart)
                    CheckGameStart()
                else 
                    if(IsGameOver)
                        Reset()
                break;  
            default: break;
        }
    }
    
})

gameLoop();
