import './main.css'

import reverbImpulse from './impulses/Basement.m4a'
import guitarImpulse from './impulses/impulse_guitar.wav'
import defs from './defs'

const {
  connectAll,
  createNodes,
  setParams,
  paramTimeline,
  num,
  rand
} = require('wakit')

const Tuna = require('tunajs')

if (!window.ac) { window.ac = new AudioContext() }
const { ac } = window

const tuna = new Tuna(ac)
const master = setParams(ac.createGain(), {
  gain: 1.0
})

const convolver = new tuna.Convolver({
  highCut: 22050,
  lowCut: 20,
  dryLevel: .3,
  wetLevel: .7,
  level: 1.0,
  impulse: reverbImpulse,
  bypass: 0
});

const delay = new tuna.PingPongDelay({
  wetLevel: .5,
  feedback: .3,
  delayTimeLeft: 150,
  delayTimeRight: 200
})

const cabinet = new tuna.Cabinet({
  impulsePath: guitarImpulse,
  makeupGain: 10
})

const overdrive = new tuna.Overdrive({
  outputGain: .5,
  drive: .3,
  curveAmount: .7,
  algorithmIndex: 0
})

const chorus = new tuna.Chorus({
  rate: 5.5,
  feedback: 0.8,
  delay: 0.045,
  bypass: 0
})

const phaser = new tuna.Phaser({
  rate: 3.2,
  depth: 0.3,
  feedback: 0.4,
  stereoPhase: 30,
  baseModulationFrequency: 700,
  bypass: 0
})

const compressor = setParams(ac.createDynamicsCompressor(), {
  threshold: 0,
  knee: 0,
  reduction: 20.0,
  ratio: 10,
  attack: 3.0001,
  release: 1.050
})

connectAll(
  phaser,
  master
)

connectAll(
  cabinet,
  overdrive,
  master
)

connectAll(
  chorus,
  master
)

connectAll(
  master,
  convolver,
  delay,
  compressor,
  ac.destination
)

// ----

const scope = require('./osc-scope')
const scopeNode = scope.createNode(ac)
const scopeCanvas = document.querySelector('.scope')

scope.renderLoop(scopeNode, scopeCanvas)

master.connect(scopeNode)

// ----

let lastTime
setInterval(() => {
  if (ac.currentTime < lastTime) { return }

  const fn = defs[2]
  const props = {
    time: ac.currentTime,
    duration: rand.inRange(10, 20),
    detune: rand.from([ 0, 1200, 2400 ])
  }

  play(fn, props)
  play(fn, {
    time: ac.currentTime + 3,
    duration: rand.inRange(10, 20),
    detune: rand.from([ -1201, 1, 1201, 2400 + 700 ])
  })

  lastTime = props.time + props.duration
}, 1000)


let lastTime2
setInterval(() => {
  if (ac.currentTime < lastTime2) { return }

  const key = rand.inRange(0, 1)
  const fn = defs[key]
  const props = {
    time: ac.currentTime,
    duration: rand.inRange(10, 20),
    detune: rand.from([ -1200, 0, 1200 ])
  } 

  const dest = rand.from([ cabinet, chorus, phaser ])
  play(fn, props, dest)
  play(fn, {
    ...props,
    detune: props.detune + 1
  }, dest)
  
  lastTime2 = props.time + props.duration
}, 500)

// ----

function play (fn, props, dest) {
  const note = connectAll(
    fn(props),
    dest || rand.from([ cabinet, chorus, phaser ])
  )

  const {
    duration,
    time
  } = props

  note.start(time)
  note.stop(time + duration)
}
