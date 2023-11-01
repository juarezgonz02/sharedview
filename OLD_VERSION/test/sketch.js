let width, height, audioCtx, source,amplitude;
const myMediaElement = document.getElementById("audio");
const myMediaElement2 = document.getElementById("audio2");
function setup(){
  audioCtx = getAudioContext()
 
  audioCtx.resume();
  source = audioCtx.createMediaElementSource(myMediaElement);
  source.connect(p5.soundOut)

  createCanvas(200, 200);
  
  width = 200;
  height = 200;
  amplitude = new p5.Amplitude();
  myMediaElement.addEventListener("canplaythrough",()=>{
    audioCtx.resume();
  })
}
function draw(){
  console.log(audioCtx.state);
  background("black");
  fill("white");

  let level = amplitude.getLevel();
  let size = map(level,0, 1, 0, 400);
  ellipse(width/2, height/2, size, size)
}




/*const s = (p)=>{
  p.setup = function(){
      p.createCanvas(200, 200);
      p.audioCtx = p.getAudioContext();
      p.source = p.audioCtx.createMediaElementSource(myMediaElement2);
      p.source.connect(p5.soundOut);

      p.width = 400;
      p.height = 400;
      p.amplitude = new p5.Amplitude();
      console.log("---------------")
      //console.log(amplitude)
        myMediaElement2.addEventListener("canplaythrough",()=>{
          audioCtx.resume();
      })
    }
    
    p.draw=function(){


      p.background("white");
      p.fill("black");

      p.level = p.amplitude.getLevel();
      p.size = p.map(p.level,0, 1, 0, 400);
      p.ellipse(p.width/2, p.height/2, p.size, p.size)
    }
}
//new p5(s, document.getElementById("3"));*/
