import { Env, Osc, Filter } from './audio-components'

const {
  connectAll,
  createNodes,
  setParams,
  paramTimeline,
  num,
  rand
} = require('wakit')

const noteToFreq = (note) => 440 * Math.pow(2, (note - 69) / 12)
const freqToNote = require('frequency-to-midi-note-number')

if (!window.ac) { window.ac = new AudioContext() }
const { ac } = window

const oscTypes = [
  'sine',
  'triangle',
  'sawtooth'
]

const defs = []

defs[0] = ({ detune, time, duration }, detuneSource) => {
  const frequency = 110
  const freqFactor = .5
  const gainFactor = .25
  const gainK = -2.0

  const note = new Filter({
    type: 'lowpass',
    frequency: [
      20000,
      new Env({
        attack: duration * .5
      })
    ],
    gain: 1,
    Q: 1
  }, [
    new Osc({
      type: rand.from(oscTypes),

      detune: [
        new Env({
          attack: duration * .5,
          from: detune,
          to: detune - 10
        }),
        detuneSource
      ],

      gain: new Env({
        attack: duration * .9,
        release: duration * .5,
        to: 0.3
      }),

      frequency: [
        frequency,

        new Osc({
          type: rand.from(oscTypes),
          frequency: frequency * freqFactor,
          detune: [
            new Env({
              attack: duration * .5,
              from: detune,
              to: detune - 10
            }),
            detuneSource
          ],
          
          gain: [
            (frequency * gainFactor) * Math.pow(2, (freqToNote(frequency) - 60) / 12 * gainK),
            new Env({
              attack: duration * .5,
              release: duration * 2
            }),
            new Osc({
              frequency: [
                5,
                new Env({
                  attack: duration * .5,
                })
              ],
              gain: [
                100,
                new Env({
                  attack: 3.0,
                })
              ]
            })
          ]
        })
      ]
    })
  ])

  return note
}

defs[1] = ({ detune, time, duration }, detuneSource) => {
  const frequency = 110
  const freqFactor = 3
  const gainFactor = 3
  const gainK = -2.0

  const note = new Filter({
    type: 'highpass',
    frequency: new Env({
      attack: duration * .5,
      from: 10000,
      to: 0
    }),
    Q: 1
  }, [
    new Osc({
      type: rand.from(oscTypes),

      gain: new Env({
        attack: duration * .9,
        release: duration * .5,
        to: 0.1
      }),

      detune: detuneSource,

      frequency: [
        frequency,

        new Osc({
          type: rand.from(oscTypes),

          frequency: frequency * freqFactor,

          detune: detuneSource,
          
          gain: [
            (frequency * gainFactor) * Math.pow(2, (freqToNote(frequency) - 60) / 12 * gainK),
            new Env({
              attack: duration * .5,
              release: duration * 2
            }),
            new Osc({
              frequency: [
                5,
                new Env({
                  attack: duration * .5,
                })
              ],
              gain: [
                100,
                new Env({
                  attack: 3.0,
                })
              ]
            })
          ]
        })
      ]
    })
  ])

  return note
}

defs[2] = ({ detune, time, duration }, detuneSource) => {
  const frequency = rand.from([ 110, 220 ])
  const freqFactor = rand.from([ .25, .5, 1, 2, 4 ])
  const gainFactor = rand.floatInRange(.25, 2)
  const gainK = rand.floatInRange(-2, 2)

  const note = new Filter({
    type: rand.from(['notch', 'lowpass']),
    frequency: new Env({
      attack: duration,
      from: 20000,
      to: 0
    }),
    gain: 50,
    Q: 1
  }, [
    new Osc({
      type: rand.from(oscTypes),

      detune: [
        detune,
        detuneSource
      ],

      gain: new Env({
        attack: duration * .9,
        release: duration * .5,
        to: 0.1
      }),

      frequency: [
        frequency,

        new Osc({
          type: rand.from(oscTypes),
          frequency: frequency * freqFactor,
          detune: [
            detune,
            detuneSource
          ],

          gain: [
            (frequency * gainFactor) * Math.pow(2, (freqToNote(frequency) - 60) / 12 * gainK),
            new Env({
              attack: duration * .5,
              release: duration * 2
            }),
            new Osc({
              frequency: [
                rand.floatInRange(1, 5),
                new Env({
                  attack: duration * .5,
                })
              ],
              gain: [
                rand.inRange(1, 100),
                new Env({
                  attack: duration * .3,
                })
              ]
            })
          ]
        })
      ]
    })
  ])

  return note
}

export default defs
