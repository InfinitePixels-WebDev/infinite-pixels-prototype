// Aurora Background - Vanilla JS WebGL Implementation
class Aurora {
  constructor(parent, options) {
    this.parent = parent;
    this.options = Object.assign(
      {
        colorStops: ["#6B46C1", "#9333EA", "#4C1D95"],
        amplitude: 1.0,
        blend: 0.7,
        speed: 0.4,
      },
      options
    );
    this.time = 0;
    this.animationId = null;
    this.canvas = document.createElement("canvas");
    this.canvas.className = "aurora-bg";
    this.parent.appendChild(this.canvas);
    this.gl = this.canvas.getContext("webgl");
    if (!this.gl) {
      throw new Error("WebGL not supported");
    }
    this.init();
    window.addEventListener("resize", () => this.resize());
    this.resize();
    this.animate = this.animate.bind(this);
    this.animationId = requestAnimationFrame(this.animate);
  }

  init() {
    this.createShaders();
    this.createProgram();
    this.createGeometry();
    this.getUniformLocations();
    this.updateUniforms();
  }

  createShaders() {
    const vertexSrc = `
			attribute vec2 position;
			void main() {
				gl_Position = vec4(position, 0.0, 1.0);
			}
		`;
    const fragmentSrc = `
			precision highp float;
			uniform float uTime;
			uniform float uAmplitude;
			uniform float uBlend;
			uniform vec3 uColorStops[3];
			uniform vec2 uResolution;
			void main() {
				vec2 uv = gl_FragCoord.xy / uResolution;
				float wave = sin(uv.x * 10.0 + uTime) * uAmplitude;
				vec3 color = mix(uColorStops[0], uColorStops[1], uv.y + wave * uBlend);
				color = mix(color, uColorStops[2], uv.x);
				gl_FragColor = vec4(color, 1.0);
			}
		`;
    this.vertexShader = this.createShader(this.gl.VERTEX_SHADER, vertexSrc);
    this.fragmentShader = this.createShader(
      this.gl.FRAGMENT_SHADER,
      fragmentSrc
    );
  }

  createShader(type, source) {
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

  createProgram() {
    const gl = this.gl;
    this.program = gl.createProgram();
    gl.attachShader(this.program, this.vertexShader);
    gl.attachShader(this.program, this.fragmentShader);
    gl.linkProgram(this.program);
    if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
      console.error("Program link error:", gl.getProgramInfoLog(this.program));
      return;
    }
    gl.useProgram(this.program);
  }

  getUniformLocations() {
    const gl = this.gl;
    this.uniforms = {
      uTime: gl.getUniformLocation(this.program, "uTime"),
      uAmplitude: gl.getUniformLocation(this.program, "uAmplitude"),
      uBlend: gl.getUniformLocation(this.program, "uBlend"),
      uColorStops: gl.getUniformLocation(this.program, "uColorStops"),
      uResolution: gl.getUniformLocation(this.program, "uResolution"),
    };
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
