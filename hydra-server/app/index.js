const PatchBay = require('./src/pb-live.js')
const HydraSynth = require('hydra-synth')
const Editor = require('./src/editor.js')
const loop = require('raf-loop')
const P5  = require('./src/p5-wrapper.js')
const Gallery  = require('./src/gallery.js')
const Menu = require('./src/menu.js')

function init () {
  window.pb = pb
  window.P5 = P5

  var canvas = document.getElementById('hydra-canvas')
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
  canvas.style.width = '100%'
  canvas.style.height = '100%'

  var pb = new PatchBay()
  var hydra = new HydraSynth({ pb: pb, canvas: canvas, autoLoop: false })
  var editor = new Editor()
  var menu = new Menu()
  menu.on('share-sketches',()=>{
    console.log(Math.random())
    editor.evalAll((code, error) => {
      console.log('evaluated', code, error)
      if(!error){
        menu.showConfirmation( (name) => {
          menu.sketches.shareSketch(code, hydra, name)
        }, () => menu.hideConfirmation() )
      }
    })
  })
  menu.on('shuffle-sketches',()=>{
    clearAll()
    sketches.setRandomSketch()
    editor.cm.setValue(sketches.code)
    editor.evalAll()
  })
  menu.on('clear-all',clearAll)
  function clearAll() {
    hush()
    sketches.clear()
    editor.clear()
    //@todo: add clear/reset function to hydra
  }

  // get initial code to fill gallery
  var sketches = new Gallery(function(code, sketchFromURL) {
    editor.cm.setValue(code)
    editor.evalAll()
    editor.saveSketch = (code) => {
      sketches.saveSketch(code)
    }
    editor.shareSketch = menu.shareSketch.bind(menu)
    // if a sketch was found based on the URL parameters, dont show intro window
    if(sketchFromURL) {
      menu.closeModal()
    } else {
      menu.openModal()
    }
  })
  menu.sketches = sketches

  // define extra functions (eventually should be added to hydra-synth?)

  // hush clears what you see on the screen
  window.hush = () => {
    solid().out()
    solid().out(o1)
    solid().out(o2)
    solid().out(o3)
    render(o0)
  }


  pb.init(hydra.captureStream, {
    server: window.location.origin,
    room: 'iclc'
  })

  var engine = loop(function(dt) {
    hydra.tick(dt)
  }).start()

}

window.onload = init
