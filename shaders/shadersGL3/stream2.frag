#pragma include "./header.glslinc"

uniform sampler2D MiscMap;
uniform sampler2D Dist2Map;

uniform float Evapor_b;
uniform vec2 offset;

in VSOUT
{
    vec2 texCoord;
} fsin;

out vec4 fragColor;

void main(void)
{
    float dx = offset.s;
    float dy = offset.t;
    
    vec2 Tex0 = fsin.texCoord;
    
    vec4 TexN_NE = vec4(Tex0.x,      Tex0.y - dy, Tex0.x + dx, Tex0.y - dy);
    vec4 TexE_SE = vec4(Tex0.x + dx, Tex0.y,      Tex0.x + dx, Tex0.y + dy);
    vec4 TexW_NW = vec4(Tex0.x - dx, Tex0.y,      Tex0.x - dx, Tex0.y - dy);
    vec4 TexS_SW = vec4(Tex0.x,      Tex0.y + dy, Tex0.x - dx, Tex0.y + dy);
    
    float b0 = texture(MiscMap, Tex0).x;
    float bNE = texture(MiscMap, TexN_NE.zw).x;
    float bSE = texture(MiscMap, TexE_SE.zw).x;
    float bNW = texture(MiscMap, TexW_NW.zw).x;
    float bSW = texture(MiscMap, TexS_SW.zw).x;
    
    vec4 b = vec4(bSW, bNW, bSE, bNE);
    b = (b + b0) / 2.0;
    
    vec4 pinned = vec4(b.x > 1.0, b.y > 1.0, b.z > 1.0, b.w > 1.0);
    b = min(b, 1.0);
    vec4 f_Out, f_In;
    
    f_Out = texture(Dist2Map, Tex0);
    f_In.x = texture(Dist2Map, TexS_SW.zw).x;
    f_In.y = texture(Dist2Map, TexW_NW.zw).y;
    f_In.z = texture(Dist2Map, TexE_SE.zw).z;
    f_In.w = texture(Dist2Map, TexN_NE.zw).w;
    
    vec4 OUT = mix(f_In, f_Out.wzyx, b);
    
    fragColor = max(OUT - pinned * Evapor_b, 0.0);
}