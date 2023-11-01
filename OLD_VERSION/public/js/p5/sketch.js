let width, height, audioCtx, source,amplitude;
const myMediaElement = document.getElementById("remoteAudio");
let fontRegular;

function preload(){
  //fontRegular = loadFont('./OpenSans.ttf')
}

function setup(){
  createCanvas(110, 110);
  audioCtx = getAudioContext()
  width = 110;
  height = 110;
  amplitude = new p5.Amplitude();
  //textFont(fontRegular);
  frameRate(60)
  myMediaElement.addEventListener("canplaythrough",()=>{
    
    source = audioCtx.createMediaStreamSource(remoteStream);
    audioCtx.resume();
    source.connect(p5.soundOut)
    
  })
}

function draw(){
  background("#121212");
  
  fill(50);
  stroke(50);
  //console.log(audioCtx.state)
  let level = amplitude.getLevel();
  let size = map(level,0, 1, 75, 130);
  ellipse(width/2, height/2, size, size)

  strokeWeight(1)
  stroke(255);
  fill("#121212")
  ellipse(width/2, height/2, 75, 75)

  textSize(48);
  if(typeof(users_list)!="undefined"&&typeof(users_list[1])!="undefined"){
    strokeWeight(0.01)
    let iLetter = users_list[1][0]
    fill(255, 255, 255);
    text(iLetter, width/2-textWidth(iLetter)/2, height/2+16);
  }
}

new p5(null,document.getElementById("remoteAudio-container"));