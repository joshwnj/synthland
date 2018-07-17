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
  dryLevel: .2,
  wetLevel: .8,
  level: .5,
  impulse: reverbImpulse,
  bypass: 0
});

const delay = new tuna.PingPongDelay({
  wetLevel: .7,
  feedback: .5,
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
  attack: 1.0,
  release: 1.0
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

const muteCheckbox = document.querySelector('.mute input[type=checkbox]')
const muteText = document.querySelector('.mute .text')
muteCheckbox.addEventListener('change', updateMute)

window.document.addEventListener(
  'keydown',
  onKeyDown,
  false
)

function onKeyDown (event) {
  switch (event.key) {
  case ' ':
  case 'm':
    muteCheckbox.checked = !muteCheckbox.checked
    updateMute()
    break
  }
}

function updateMute () {
  const isMuted = muteCheckbox.checked

  muteText.innerHTML = isMuted ? 'unmute' : 'mute'
  setParams(master, {
    gain: isMuted ? 0 : 1
  })
}

// ----

let lastTime
let detuneSource1 = ac.createConstantSource()
detuneSource1.start()

setInterval(() => {
  if (ac.currentTime < lastTime) { return }

  const fn = defs[2]
  const props = {
    time: ac.currentTime,
    duration: rand.inRange(10, 20),
    detune: rand.from([ 0, 1200, 2400 ])
  }

  play(fn, props, detuneSource1)
  play(fn, {
    time: ac.currentTime + 3,
    duration: rand.inRange(10, 20),
    detune: rand.from([ 700, 1200 + 700 ])
  }, detuneSource1)

  lastTime = props.time + props.duration
}, 1000)


let lastTime2
let detuneSource2 = ac.createConstantSource()
detuneSource2.start()

setInterval(() => {
  if (ac.currentTime < lastTime2) { return }

  const key = rand.inRange(0, 1)
  const fn = defs[key]
  const props = {
    time: ac.currentTime,
    duration: rand.inRange(10, 20),
    detune: rand.from([ 0, 1200 ])
  }

  const dest = rand.from([ cabinet, chorus, phaser ])
  play(fn, props, detuneSource2, dest)
  play(fn, {
    ...props,
    detune: props.detune + 1
  }, detuneSource2, dest)
  
  lastTime2 = props.time + props.duration
}, 500)

let lastTime3
let detuneSource3 = ac.createConstantSource()
detuneSource3.start()

setInterval(() => {
  if (ac.currentTime < lastTime) { return }

  const fn = defs[3]
  const props = {
    time: ac.currentTime,
    duration: rand.inRange(10, 20),
    detune: rand.from([ 0, 1200 ])
  }

  play(fn, props, detuneSource1)
  play(fn, {
    time: ac.currentTime + 3,
    duration: rand.inRange(10, 20),
    detune: rand.from([ 700, 1200 + 700 ])
  }, detuneSource3)

  lastTime = props.time + props.duration
}, 1000)

// ----

const notes = window.notes = {}
let noteSeq = 0

function play (fn, props, detuneSource, dest) {
  const note = connectAll(
    fn(props, detuneSource),
    dest || rand.from([ cabinet, chorus, phaser ])
  )

  const {
    duration,
    time
  } = props

  note.start(time)
  note.stop(time + duration)

  const id = ++noteSeq
  notes[id] = note
  setTimeout(() => {
    delete notes[id]
  }, duration * 1000)
}

setInterval(() => {
  const amount = rand.from([0, -200])
  const duration = 10
  detuneSource1.offset.linearRampToValueAtTime(amount, ac.currentTime + duration)
}, 39000)

setInterval(() => {
  const amount = rand.from([0, -200])
  const duration = 10
  detuneSource2.offset.linearRampToValueAtTime(amount, ac.currentTime + duration)
}, 53000)

setInterval(() => {
  const amount = rand.from([0, -200])
  const duration = 10
  detuneSource3.offset.linearRampToValueAtTime(amount, ac.currentTime + duration)
}, 51000)
