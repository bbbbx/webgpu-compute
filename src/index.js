var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var canvas = document.getElementById('canvas');
var dpr = 1;
canvas.width = window.innerWidth * dpr;
canvas.height = window.innerHeight * dpr;
// const ctx = canvas.getContext('2d');
var ctx = canvas.getContext('webgpu');
var width = canvas.width;
var height = canvas.height;
function main() {
    return __awaiter(this, void 0, void 0, function () {
        function compute(time) {
            return __awaiter(this, void 0, void 0, function () {
                var second, commandEncoder, stagingBuffer, computePassEncoder, x, y, readBuffer, src, dst, commandBuffer;
                return __generator(this, function (_a) {
                    second = time / 1000;
                    commandEncoder = device.createCommandEncoder();
                    stagingBuffer = device.createBuffer({
                        usage: GPUBufferUsage.COPY_SRC | GPUBufferUsage.MAP_WRITE,
                        size: Float32Array.BYTES_PER_ELEMENT * 1,
                        mappedAtCreation: true
                    });
                    new Float32Array(stagingBuffer.getMappedRange()).set([second]);
                    commandEncoder.copyBufferToBuffer(stagingBuffer, 0, timeBuffer, 0, Float32Array.BYTES_PER_ELEMENT * 1);
                    stagingBuffer.unmap();
                    {
                        computePassEncoder = commandEncoder.beginComputePass();
                        computePassEncoder.setPipeline(computePipeline);
                        computePassEncoder.setBindGroup(0, bindGroup);
                        x = Math.ceil(width / 8);
                        y = Math.ceil(height / 8);
                        computePassEncoder.dispatch(x, y);
                        computePassEncoder.endPass();
                    }
                    readBuffer = device.createBuffer({
                        usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ,
                        size: pixelsBufferSize
                    });
                    commandEncoder.copyBufferToBuffer(pixelsBuffer, 0, readBuffer, 0, pixelsBufferSize);
                    src = {
                        "buffer": pixelsBuffer,
                        "bytesPerRow": pixelsBufferSize / height
                    };
                    dst = {
                        "texture": ctx.getCurrentTexture()
                    };
                    // commandEncoder.copyBufferToTexture(src, dst, {
                    //   "width": width,
                    //   "height": height,
                    // });
                    // commandEncoder.copyTextureToTexture(src,dst, {
                    //   "width": width,
                    //   "height": height,
                    // })
                    commandEncoder.copyBufferToTexture(src, dst, {
                        "width": width,
                        "height": height
                    });
                    commandBuffer = commandEncoder.finish();
                    queue.submit([commandBuffer]);
                    // await readBuffer.mapAsync(GPUMapMode.READ, 0, pixelsBufferSize);
                    // const out = new Float32Array(readBuffer.getMappedRange());
                    // function draw()
                    // {
                    //   const uint8ClampArray = new Uint8ClampedArray(out.map(v => v * 255));
                    //   const imagedata = new ImageData(uint8ClampArray, width, height);
                    //   // ctx.putImageData(imagedata, 0, 0);
                    // }
                    // draw()
                    stagingBuffer.destroy();
                    readBuffer.destroy();
                    // console.log(second)
                    requestAnimationFrame(compute);
                    return [2 /*return*/];
                });
            });
        }
        var adapter, device, queue, code, computeShaderModule, pixelsBufferSize, pixelsBuffer, resolutionBuffer, timeBuffer, storageTexture, computePipeline, bindGroupLayout, bindGroup;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, navigator.gpu.requestAdapter()];
                case 1:
                    adapter = _a.sent();
                    return [4 /*yield*/, adapter.requestDevice()];
                case 2:
                    device = _a.sent();
                    queue = device.queue;
                    ctx.configure({
                        "device": device,
                        "format": "bgra8unorm",
                        "usage": GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT
                    });
                    return [4 /*yield*/, fetch("comp.wgsl").then(function (res) { return res.text(); })];
                case 3:
                    code = _a.sent();
                    computeShaderModule = device.createShaderModule({
                        code: code
                    });
                    pixelsBufferSize = Float32Array.BYTES_PER_ELEMENT * 4 * width * height;
                    pixelsBuffer = device.createBuffer({
                        usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC,
                        size: pixelsBufferSize
                    });
                    resolutionBuffer = device.createBuffer({
                        usage: GPUBufferUsage.UNIFORM,
                        size: Uint32Array.BYTES_PER_ELEMENT * 2,
                        mappedAtCreation: true
                    });
                    new Uint32Array(resolutionBuffer.getMappedRange()).set([width, height]);
                    resolutionBuffer.unmap();
                    timeBuffer = device.createBuffer({
                        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
                        size: Float32Array.BYTES_PER_ELEMENT * 1
                    });
                    storageTexture = device.createTexture({
                        "dimension": "2d",
                        "format": "rgba8unorm",
                        "mipLevelCount": 1,
                        "sampleCount": 1,
                        "size": {
                            "width": width,
                            "height": height
                        },
                        "usage": GPUTextureUsage.STORAGE_BINDING | GPUTextureUsage.COPY_SRC
                    });
                    computePipeline = device.createComputePipeline({
                        compute: {
                            module: computeShaderModule,
                            entryPoint: 'main'
                        }
                    });
                    bindGroupLayout = computePipeline.getBindGroupLayout(0);
                    bindGroup = device.createBindGroup({
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
                            },
                            {
                                binding: 2,
                                resource: {
                                    buffer: timeBuffer
                                }
                            },
                            {
                                binding: 3,
                                resource: storageTexture.createView()
                            }
                        ]
                    });
                    requestAnimationFrame(compute);
                    return [2 /*return*/];
            }
        });
    });
}
if (!navigator.gpu) {
    document.body.innerHTML = 'Your browser do not support WebGPU, consider using Chrome Canary and enable the Unsafe WebGPU flag.';
}
else {
    main();
}
