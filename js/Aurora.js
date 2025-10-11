// Aurora Background - Vanilla JS WebGL Implementation
class Aurora {
	constructor(container, options = {}) {
		this.container = container;
		this.canvas = document.createElement("canvas");
		this.gl = this.canvas.getContext("webgl2", {
			alpha: true,
			premultipliedAlpha: true,
			antialias: true,
		});

		if (!this.gl) {
			console.error("WebGL2 not supported");
			return;
		}

		// Default options
		this.options = {
			colorStops: options.colorStops || ["#5227FF", "#7cff67", "#5227FF"],
			amplitude: options.amplitude ?? 1.0,
			blend: options.blend ?? 0.5,
			speed: options.speed ?? 0.5,
			...options,
		};

		this.time = 0;
		this.animationId = null;

		this.init();
	}

	init() {
		const gl = this.gl;

		// Set canvas style
		this.canvas.style.position = "fixed";
		this.canvas.style.top = "0";
		this.canvas.style.left = "0";
		this.canvas.style.width = "100%";
		this.canvas.style.height = "100%";
		this.canvas.style.pointerEvents = "none";
		this.canvas.style.zIndex = "-1";
		this.canvas.className = "aurora-canvas";

		// Setup WebGL
		gl.clearColor(0, 0, 0, 0);
		gl.enable(gl.BLEND);
		gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

		// Create shaders and program
		this.createProgram();
		this.createGeometry();

		// Append to container
		this.container.appendChild(this.canvas);

		// Handle resize
		this.resize = this.resize.bind(this);
		window.addEventListener("resize", this.resize);
		this.resize();

		// Start animation
		this.animate = this.animate.bind(this);
		this.animate(0);
	}

	createProgram() {
		const gl = this.gl;

		const vertexShaderSource = `#version 300 es
      in vec2 position;
      void main() {
        gl_Position = vec4(position, 0.0, 1.0);
      }
    `;

		const fragmentShaderSource = `#version 300 es
      precision highp float;

      uniform float uTime;
      uniform float uAmplitude;
      uniform vec3 uColorStops[3];
      uniform vec2 uResolution;
      uniform float uBlend;

      out vec4 fragColor;

      vec3 permute(vec3 x) {
        return mod(((x * 34.0) + 1.0) * x, 289.0);
      }

      float snoise(vec2 v){
        const vec4 C = vec4(
            0.211324865405187, 0.366025403784439,
            -0.577350269189626, 0.024390243902439
        );
        vec2 i  = floor(v + dot(v, C.yy));
        vec2 x0 = v - i + dot(i, C.xx);
        vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
        vec4 x12 = x0.xyxy + C.xxzz;
        x12.xy -= i1;
        i = mod(i, 289.0);

        vec3 p = permute(
            permute(i.y + vec3(0.0, i1.y, 1.0))
          + i.x + vec3(0.0, i1.x, 1.0)
        );

        vec3 m = max(
            0.5 - vec3(
                dot(x0, x0),
                dot(x12.xy, x12.xy),
                dot(x12.zw, x12.zw)
            ), 
            0.0
        );
        m = m * m;
        m = m * m;

        vec3 x = 2.0 * fract(p * C.www) - 1.0;
        vec3 h = abs(x) - 0.5;
        vec3 ox = floor(x + 0.5);
        vec3 a0 = x - ox;
        m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);

        vec3 g;
        g.x  = a0.x  * x0.x  + h.x  * x0.y;
        g.yz = a0.yz * x12.xz + h.yz * x12.yw;
        return 130.0 * dot(m, g);
      }

      struct ColorStop {
        vec3 color;
        float position;
      };

      #define COLOR_RAMP(colors, factor, finalColor) {              \\
        int index = 0;                                            \\
        for (int i = 0; i < 2; i++) {                               \\
           ColorStop currentColor = colors[i];                    \\
           bool isInBetween = currentColor.position <= factor;    \\
           index = int(mix(float(index), float(i), float(isInBetween))); \\
        }                                                         \\
        ColorStop currentColor = colors[index];                   \\
        ColorStop nextColor = colors[index + 1];                  \\
        float range = nextColor.position - currentColor.position; \\
        float lerpFactor = (factor - currentColor.position) / range; \\
        finalColor = mix(currentColor.color, nextColor.color, lerpFactor); \\
      }

      void main() {
        vec2 uv = gl_FragCoord.xy / uResolution;
        
        ColorStop colors[3];
        colors[0] = ColorStop(uColorStops[0], 0.0);
        colors[1] = ColorStop(uColorStops[1], 0.5);
        colors[2] = ColorStop(uColorStops[2], 1.0);
        
        vec3 rampColor;
        COLOR_RAMP(colors, uv.x, rampColor);
        
        float height = snoise(vec2(uv.x * 2.0 + uTime * 0.1, uTime * 0.25)) * 0.5 * uAmplitude;
        height = exp(height);
        height = (uv.y * 2.0 - height + 0.2);
        float intensity = 0.6 * height;
        
        float midPoint = 0.20;
        float auroraAlpha = smoothstep(midPoint - uBlend * 0.5, midPoint + uBlend * 0.5, intensity);
        
        vec3 auroraColor = intensity * rampColor;
        
        fragColor = vec4(auroraColor * auroraAlpha, auroraAlpha);
      }
    `;

		// Compile shaders
		const vertexShader = this.compileShader(
			gl.VERTEX_SHADER,
			vertexShaderSource
		);
		const fragmentShader = this.compileShader(
			gl.FRAGMENT_SHADER,
			fragmentShaderSource
		);

		// Create program
		this.program = gl.createProgram();
		gl.attachShader(this.program, vertexShader);
		gl.attachShader(this.program, fragmentShader);
		gl.linkProgram(this.program);

		if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
			console.error("Program link error:", gl.getProgramInfoLog(this.program));
			return;
		}

		gl.useProgram(this.program);

		// Get uniform locations
		this.uniforms = {
			uTime: gl.getUniformLocation(this.program, "uTime"),
			uAmplitude: gl.getUniformLocation(this.program, "uAmplitude"),
			uColorStops: gl.getUniformLocation(this.program, "uColorStops"),
			uResolution: gl.getUniformLocation(this.program, "uResolution"),
			uBlend: gl.getUniformLocation(this.program, "uBlend"),
		};

		// Set initial uniforms
		this.updateUniforms();
	}

	compileShader(type, source) {
		const gl = this.gl;
		const shader = gl.createShader(type);
		gl.shaderSource(shader, source);
		gl.compileShader(shader);

		if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
			console.error("Shader compile error:", gl.getShaderInfoLog(shader));
			gl.deleteShader(shader);
			return null;
		}

		return shader;
	}

	createGeometry() {
		const gl = this.gl;

		// Full-screen triangle
		const vertices = new Float32Array([-1, -1, 3, -1, -1, 3]);

		const buffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
		gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

		const positionLocation = gl.getAttribLocation(this.program, "position");
		gl.enableVertexAttribArray(positionLocation);
		gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
	}

	hexToRgb(hex) {
		const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
		return result
			? [
					parseInt(result[1], 16) / 255,
					parseInt(result[2], 16) / 255,
					parseInt(result[3], 16) / 255,
			  ]
			: [0, 0, 0];
	}

	updateUniforms() {
		const gl = this.gl;
		const colorStopsArray = this.options.colorStops.flatMap((hex) =>
			this.hexToRgb(hex)
		);

		gl.uniform1f(this.uniforms.uAmplitude, this.options.amplitude);
		gl.uniform3fv(this.uniforms.uColorStops, colorStopsArray);
		gl.uniform1f(this.uniforms.uBlend, this.options.blend);
	}

	updateColors(colorStops) {
		this.options.colorStops = colorStops;
		this.updateUniforms();
	}

	resize() {
		// Get actual viewport dimensions
		const width = Math.max(
			window.innerWidth,
			document.documentElement.clientWidth
		);
		const height = Math.max(
			window.innerHeight,
			document.documentElement.clientHeight
		);

		// Set canvas size with device pixel ratio for crisp rendering
		const dpr = Math.min(window.devicePixelRatio || 1, 2); // Cap at 2x for performance
		this.canvas.width = width * dpr;
		this.canvas.height = height * dpr;

		// Set display size
		this.canvas.style.width = width + "px";
		this.canvas.style.height = height + "px";

		// Update WebGL viewport and uniforms
		this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
		this.gl.uniform2f(
			this.uniforms.uResolution,
			this.canvas.width,
			this.canvas.height
		);
	}

	animate(timestamp) {
		this.time = timestamp * 0.001 * this.options.speed;

		const gl = this.gl;
		gl.clear(gl.COLOR_BUFFER_BIT);
		gl.uniform1f(this.uniforms.uTime, this.time);
		gl.drawArrays(gl.TRIANGLES, 0, 3);

		this.animationId = requestAnimationFrame(this.animate);
	}

	destroy() {
		if (this.animationId) {
			cancelAnimationFrame(this.animationId);
		}
		window.removeEventListener("resize", this.resize);
		if (this.canvas.parentNode) {
			this.canvas.parentNode.removeChild(this.canvas);
		}
		if (this.gl) {
			const ext = this.gl.getExtension("WEBGL_lose_context");
			if (ext) ext.loseContext();
		}
	}
}

// Auto-initialize with theme detection
if (typeof window !== "undefined") {
	window.addEventListener("DOMContentLoaded", () => {
		const body = document.body;

		// Detect theme - check both dark-mode class and data-theme attribute
		const isDarkMode = () => {
			return (
				body.classList.contains("dark-mode") ||
				body.classList.contains("dark") ||
				body.getAttribute("data-theme") === "dark" ||
				document.documentElement.classList.contains("dark")
			);
		};

		// Define color schemes - darker purple tones
		const themes = {
			light: {
				colorStops: ["#6B46C1", "#9333EA", "#4C1D95"], // Dark purple gradient
				amplitude: 1.0,
				blend: 0.7,
				speed: 0.4,
			},
			dark: {
				colorStops: ["#4C1D95", "#6B21A8", "#2D1B69"], // Very dark purples
				amplitude: 1.5,
				blend: 0.6,
				speed: 0.5,
			},
		};

		const currentTheme = isDarkMode() ? themes.dark : themes.light;

		// Initialize Aurora
		window.aurora = new Aurora(body, currentTheme);
		console.log(
			"Aurora initialized with theme:",
			isDarkMode() ? "dark" : "light"
		);

		// Listen for theme changes
		const observer = new MutationObserver(() => {
			const newTheme = isDarkMode() ? themes.dark : themes.light;
			window.aurora.updateColors(newTheme.colorStops);
			window.aurora.options.amplitude = newTheme.amplitude;
			window.aurora.options.blend = newTheme.blend;
			window.aurora.options.speed = newTheme.speed;
			window.aurora.updateUniforms();
			console.log("Aurora theme updated:", isDarkMode() ? "dark" : "light");
		});

		observer.observe(body, {
			attributes: true,
			attributeFilter: ["class", "data-theme"],
		});

		// Also observe documentElement for dark class
		observer.observe(document.documentElement, {
			attributes: true,
			attributeFilter: ["class"],
		});

		console.log("Aurora background initialized");
	});
}
