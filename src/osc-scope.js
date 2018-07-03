// source: https://webaudiotech.com/sites/limiter_comparison/oscilloscope.js

const MINVAL = 1234;	// height/2 == zero.	MINVAL is the "minimum detected signal" level.

function findFirstPositiveZeroCrossing(buf, buflen, height) {
	var i = 0;
	var last_zero = -1;
	var t;

	// advance until we're zero or negative
	while (i<buflen && (buf[i] > height/2 ) )
		i++;

	if (i>=buflen)
		return 0;

	// advance until we're above MINVAL, keeping track of last zero.
	while (i<buflen && ((t=buf[i]) < MINVAL )) {
		if (t >= height/2) {
			if (last_zero == -1)
				last_zero = i;
		} else
			last_zero = -1;
		i++;
	}

	// we may have jumped over MINVAL in one sample.
	if (last_zero == -1)
		last_zero = i;

	if (i==buflen)	// We didn't find any positive zero crossings
		return 0;

	// The first sample might be a zero.	If so, return it.
	if (last_zero == 0)
		return 0;

	return last_zero;
}

function createNode (ac) {
  const node = ac.createAnalyser()
  node.fftSize = 1024
  return node
}

function createRenderFunc (node, canvas) {
  const data = new Uint8Array(canvas.width)
  const context = canvas.getContext('2d')

  return function () {
    const { width, height } = canvas

	  node.getByteTimeDomainData(data);

    context.fillStyle = 'hsl(250, 20%, 20%)'
    context.fillRect(0, 0, width, height)


    // draw the oscilloscope path
    context.lineWidth = 1
    context.strokeStyle = 'white'
    context.beginPath()
    const c = width / (node.fftSize/2)

    var zeroCross = findFirstPositiveZeroCrossing(data, width, height);
	  if (zeroCross==0) zeroCross=1;
    
	  for (var i=zeroCross, j=0; j<(width-zeroCross); i++, j++) {
		  context.lineTo(j,height-( c *data[i]));
    }

	  context.stroke();
  }
}

function renderLoop (node, canvas) {
  let animFrameId
  
  const renderFunc = createRenderFunc(node, canvas)
  
  function loop () {
    renderFunc()    
    animFrameId = requestAnimationFrame(loop)
  }
  
  loop()
}

module.exports = {
  createNode,
  createRenderFunc,
  renderLoop
}
