uniform float uTime;
uniform float uSize;

attribute float aScale;
attribute vec3 aRandomness;
varying vec3 vColor;

void main(){
        vec4 modelPosition = modelMatrix * vec4(position, 1.0);

        float angel = atan(modelPosition.x, modelPosition.z);
        float distanceToCenter = length(modelPosition.xz);
        float angelOffset = (1.0 / distanceToCenter) * uTime * 0.2;
        angel += angelOffset;

        modelPosition.x = cos(angel) * distanceToCenter;
        modelPosition.z = sin(angel) * distanceToCenter;
        modelPosition.xyz += aRandomness;

        vec4 viewPosition = modelMatrix * modelPosition;
        vec4 projectedPosition = viewPosition * projectionMatrix;
        gl_Position = projectedPosition;
        gl_PointSize = uSize * aScale;
        gl_PointSize *= (1.0 / - viewPosition.z);
        vColor = color;
}