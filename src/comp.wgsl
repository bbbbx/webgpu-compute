struct Out {
    pixels: array<vec4<f32>>;
};

struct Resolution {
    width: u32;
    height: u32;
};

@group(0) @binding(0) var<storage, write> result: Out;
@group(0) @binding(1) var<uniform> resolution: Resolution;

@stage(compute) @workgroup_size(8, 8)
fn main(@builtin(global_invocation_id) global_id : vec3<u32>) {
    let WIDTH = resolution.width;
    let HEIGHT = resolution.height;

    if (global_id.x >= WIDTH || global_id.y >= HEIGHT) {
        return;
    }

    let x = f32(global_id.x) / f32(WIDTH - 1u);
    let y = f32(global_id.y) / f32(HEIGHT - 1u);

    // What follows is code for rendering the mandelbrot set.
    let uv = vec2<f32>(x,y);
    var n: f32 = 0.0f;
    let c = vec2<f32>(-.445, 0.0) +  (uv - 0.5)*(2.0+ 1.7*0.2  );
    var z: vec2<f32> = vec2<f32>(0.0);
    let M: i32 = 128;
    for (var i: i32 = 0; i < M; i = i + 1)
    {
        z = vec2<f32>(z.x*z.x - z.y*z.y, 2.*z.x*z.y) + c;
        if (dot(z, z) > 2.0) {
            break;
        };
        n = n + 1.0;
    }

    // we use a simple cosine palette to determine color:
    // http://iquilezles.org/www/articles/palettes/palettes.htm
    let t = f32(n) / f32(M);
    let d = vec3<f32>(0.3, 0.3 ,0.5);
    let e = vec3<f32>(-0.2, -0.3 ,-0.5);
    let f = vec3<f32>(2.1, 2.0, 3.0);
    let g = vec3<f32>(0.0, 0.1, 0.0);
    let color = vec4<f32>( d + e*cos( 6.28318*(f*t+g) ) ,1.0);

    let index = global_id.x + WIDTH * global_id.y;
    result.pixels[index] = color;
}