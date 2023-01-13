import * as THREE from 'three'

class WebGL {
  public renderer: THREE.WebGLRenderer
  public scene: THREE.Scene
  public camera = new THREE.Camera()
  public readonly time = new THREE.Clock()

  private resizeCallback?: () => void

  constructor() {
    const { width, height } = this.size

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    this.renderer.setPixelRatio(window.devicePixelRatio)
    this.renderer.setSize(width, height)
    this.renderer.shadowMap.enabled = true
    this.renderer.outputEncoding = THREE.sRGBEncoding

    this.scene = new THREE.Scene()

    window.addEventListener('resize', this.handleResize)
  }

  private handleResize = () => {
    this.resizeCallback && this.resizeCallback()

    const { width, height } = this.size
    this.renderer.setSize(width, height)
  }

  get size() {
    const { innerWidth: width, innerHeight: height } = window
    return { width, height, aspect: width / height }
  }

  setup(container: HTMLElement) {
    container.appendChild(this.renderer.domElement)
  }

  setResizeCallback(callback: () => void) {
    this.resizeCallback = callback
  }

  getMesh<T extends THREE.Material>(name: string) {
    return this.scene.getObjectByName(name) as THREE.Mesh<THREE.BufferGeometry, T>
  }

  render() {
    this.renderer.render(this.scene, this.camera)
  }

  requestAnimationFrame(callback: () => void) {
    gl.renderer.setAnimationLoop(callback)
  }

  cancelAnimationFrame() {
    gl.renderer.setAnimationLoop(null)
  }

  dispose() {
    this.cancelAnimationFrame()
    gl.scene?.traverse((child) => {
      if (child.type !== 'Scene') gl.scene.remove(child)
    })
  }
}

export const gl = new WebGL()
