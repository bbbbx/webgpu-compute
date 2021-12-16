const canvas = document.getElementById('canvas') as HTMLCanvasElement;
const dpr = 1;
canvas.width = window.innerWidth * dpr;
canvas.height = window.innerHeight * dpr;
const ctx = canvas.getContext('2d');

const width = canvas.width;
const height = canvas.height;

async function main() {
  const adapter = await navigator.gpu.requestAdapter();
  const device = await adapter.requestDevice();
  const queue = device.queue;

  const code = await fetch("comp.wgsl").then(res => res.text());

  const computeShaderModule = device.createShaderModule({
    code: code,
  });

  const pixelsBufferSize = Float32Array.BYTES_PER_ELEMENT * 4 * width * height;
  const pixelsBuffer = device.createBuffer({
    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC,
    size: pixelsBufferSize
  });

  const resolutionBuffer = device.createBuffer({
    usage: GPUBufferUsage.UNIFORM,
    size: Uint32Array.BYTES_PER_ELEMENT * 2,
    mappedAtCreation: true
  });
  new Uint32Array(resolutionBuffer.getMappedRange()).set([width, height]);
  resolutionBuffer.unmap();

  const computePipeline = device.createComputePipeline({
    compute: {
      module: computeShaderModule,
      entryPoint: 'main'
    },
  });

  const bindGroupLayout = computePipeline.getBindGroupLayout(0);

  const bindGroup = device.createBindGroup({
    layout: bindGroupLayout,
    entries: [
      {
        binding: 0,
        resource: {
          buffer: pixelsBuffer
        }
      },
      {
        binding: 1,
        resource: {
          buffer: resolutionBuffer
        }
      }
    ]
  });

  const commandEncoder = device.createCommandEncoder();
  {
    const computePassEncoder = commandEncoder.beginComputePass();

    computePassEncoder.setPipeline(computePipeline);
    computePassEncoder.setBindGroup(0, bindGroup);

    const x = Math.ceil(width / 8);
    const y = Math.ceil(height / 8);
    computePassEncoder.dispatch(x, y);

    computePassEncoder.endPass();
  }

  const readBuffer = device.createBuffer({
    usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ,
    size: pixelsBufferSize
  });
  commandEncoder.copyBufferToBuffer(pixelsBuffer, 0, readBuffer, 0, pixelsBufferSize);

  const commandBuffer = commandEncoder.finish();

  queue.submit([ commandBuffer ]);

  await readBuffer.mapAsync(GPUMapMode.READ, 0, pixelsBufferSize);
  const out = new Float32Array(readBuffer.getMappedRange());

  {
    const uint8ClampArray = new Uint8ClampedArray(out.map(v => v * 255));
    const imagedata = new ImageData(uint8ClampArray, width, height);
    ctx.putImageData(imagedata, 0, 0);
  }
}

if (!navigator.gpu) {
  document.body.innerHTML = 'Your browser do not support WebGPU, consider using Chrome Canary and enable the Unsafe WebGPU flag.';
} else {
  main();
}