#ifdef GL_ES
precision highp float;
#endif

uniform vec2 resolution;
uniform float ratio;
uniform float time;
uniform float mix_ratio;
uniform vec2 mouse;
uniform sampler2D turq;
uniform sampler2D holes;


float random(vec2 st){
	return fract(sin(dot(st.xy, vec2(12.9898, 78.233)))*46606.0);

}
// speech difficulty
float noise (vec2 st){
	vec2 i = floor(st);
	vec2 f = fract(st);

    //Four corners in 2d of a tile 
    float a  = random(i);
    float b = random(i+vec2(1.0,0.0));
    float c = random(i+vec2(0.0,1.0));
    float d = random(i+vec2(1.0,1.0));

    vec2 u = f*f*(3.0-2.0*f);

    return mix(a,b,u.x) + (c - a)* u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}
#define OCTAVES 6
//https://thebookofshaders.com/13/
float fbm(vec2 st){
    //Initial Values
	float value = 0.0;
    float amplitude = .5;
    float frequency = 0.;

    // Loop of octaves
    for (int i = 0; i < OCTAVES; i++) {
        value += amplitude * noise(st)*1.25;
        st *= 4.;
        amplitude *= .25;
    }
    return value;
}
// float val_map(float val, float start_one, float start_two, float stop_one, float stop_two){
//     float mapped;
//     mapped = start_two + (stop_two- start_two) * ((val - start_one) / (stop_one - start_one));
//     return (mapped)
// }
float val_map(float argval,float start_one, float start_two, float stop_one, float stop_two){
    return start_two + (stop_two- start_two) * ((argval - start_one) / (stop_one - start_one));
}

float pattern(vec2 st){
    //Originally from
    //https://www.iquilezles.org/www/articles/warp/warp.htm
	vec2 q = vec2( fbm(st+ vec2(12.0*(cos(time*0.001),-mouse.y*0.0000003))),
				   fbm(st + vec2(.2,.3)) - (mouse.x*0.000001));

	vec2 r = vec2( fbm( st + q + vec2(23.1,12.01) + time*0.0009 ),
                   fbm( st + 4.0*q + vec2(12.1,124.1)  - time*0.0009));
	return fbm(st + 2.1*r);
}


void main() {
	vec2 st =  gl_FragCoord.xy / resolution.xy;
    vec3 color = vec3(0.0);
    float zoom = 0.06 /ratio;
    float scroll = 0.08 /ratio;
    color += pattern(st*zoom+scroll*vec2(sin(time*0.01)-resolution.x/2.0+mouse.x*0.00003,cos(time*0.014)-resolution.y/2.0+mouse.y*0.00002));
    vec4 on = vec4(0.0);
 
    vec3 col = mix(texture2D (holes, color.st).xyz,texture2D (turq, color.st).xyz, mix_ratio);
    col = mix( col, vec3(0.4,0.3,0.3), 0.2 + 0.5*on.y*on.y);
    col = mix( col, vec3(0.0,0.2,0.4), 0.5*smoothstep(1.2,1.3,abs(on.z)+abs(on.w)) );
    col = clamp( col*color*2.0, 0.0, 1.0 );
    col = mix( col, vec3(0.9,0.9,0.9), dot(on.zw,on.zw) );
    
    gl_FragColor = vec4(col,1.0);
}


