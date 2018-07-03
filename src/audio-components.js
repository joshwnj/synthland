const {
  connectAll,
  createNodes,
  setParams,
  paramTimeline,
  num,
  rand
} = require('wakit')

let seq = 0

export class Filter {
  constructor (props, children) {
    this._id = ++seq
    this.node = ac.createBiquadFilter()

    this.children = children
    this.children.forEach(ch => ch.connect(this.node))

    this.update(props)
  }

  get frequency () {
    return this.node.frequency
  }

  set frequency (value) {
    this.node.frequency.value = value
  }

  get gain () {
    return this.node.gain
  }

  set gain (value) {
    this.node.gain.value = value
  }

  get Q () {
    return this.node.Q
  }

  set Q (value) {
    this.node.Q.value = value
  }

  update (props) {
    const params = [
      'frequency',
      'gain',
      'Q'
    ]

    params.forEach(key => {
      if (props[key] === undefined) { return }

      this.updateParam(key, props[key])
    })

    if (props.type) {
      this.node.type = props.type
    }
  }

  updateParam (key, value) {
    (Array.isArray(value) ? value : [value]).forEach(v => {
      if (typeof v === 'number') {
        this[key] = v
      } else if (v.connect) {
        v.connect(this[key])
        this.children.push(v)
      }
    })
  }

  connect (dest) {
    this.node.connect(dest)
  }

  disconnect () {
    this.node.disconnect()
    delete this.node
  }

  start (time) {
    this.children.forEach(ch => ch.start(time))
  }

  stop (time) {
    this.children.forEach(ch => ch.stop(time))
  }
}

export class Osc {
  constructor (props) {
    this._id = ++seq
    this.nodes = createNodes(ac, {
      osc: {
        type: 'Oscillator'
      },
      amp: {
        type: 'Gain'
      }
    })

    this.children = []
    this.update(props)
  }

  get detune () {
    return this.nodes.osc.detune
  }

  set detune (value) {
    this.nodes.osc.detune.value = value
  }

  get frequency () {
    return this.nodes.osc.frequency
  }

  set frequency (value) {
    this.nodes.osc.frequency.value = value
  }

  get gain () {
    return this.nodes.amp.gain
  }

  set gain (value) {
    this.nodes.amp.gain.value = value
  }

  update (props) {
    const params = [
      'detune',
      'frequency',
      'gain'
    ]

    params.forEach(key => {
      if (props[key] === undefined) { return }

      this.updateParam(key, props[key])
    })

    if (props.type) {
      this.nodes.osc.type = props.type
    }
  }

  updateParam (key, value) {
    (Array.isArray(value) ? value : [value]).forEach(v => {
      if (typeof v === 'number') {
        this[key] = v
      } else if (v.connect) {
        v.connect(this[key])
        this.children.push(v)
      }
    })
  }

  connect (dest) {
    this.nodes.amp.connect(dest)
  }

  disconnect () {
    if (this.disconnected) {
      return
    }

    this.children.forEach((ch, i) => {
      ch.disconnect()
      delete this.children[i]
    })

    this.nodes.amp.disconnect()
    this.nodes.osc.disconnect()

    delete this.nodes.amp
    delete this.nodes.osc

    this.disconnected = true
  }

  start (time) {
    this.children.forEach(ch => ch.start(time))
    this.nodes.osc.start(time)

    return time
  }

  stop (time) {
    this.children.forEach(ch => {
      ch.stop(time)
    })

    const threshold = 0.002
    const id = setInterval(() => {
      if (this.disconnected) {
        clearInterval(id)
        return
      }

      if (this.gain.value < threshold) {
        this.nodes.osc.stop()
        this.disconnect()
        clearInterval(id)
      }
    }, 500)
  }
}

export class Env {
  constructor (props) {
    this._id = ++seq
    this.props = props
    this.param = null
  }

  connect (param) {
    this.param = param
  }

  disconnect () {
    delete this.param
  }

  start (time = ac.currentTime) {
    const { props, param } = this
    if (!param) { return time }

    const { value } = param
    const finalTime = paramTimeline(param, [
      {
        time,
        value: props.from || 0.0001
      },

      {
        linearTo: props.to || value,
        duration: props.attack || 0.1
      }
    ])

    return finalTime
  }
  
  stop (time = ac.currentTime) {
    const { props, param } = this
    if (!param) { return time }

    if (props.release === undefined) { return Infinity }

    const { value } = param

    param.cancelScheduledValues(time)
    const finalTime = paramTimeline(param, [
      {
        time,
        value: props.to || value
      },

      {
        linearTo: props.from || 0.0001,
        duration: props.release || 0.1
      }
    ])

    return finalTime
  }
}
