import GUI from 'lil-gui'
import * as THREE from 'three'
import { resolvePath } from '../scripts/utils'
import { gl } from './core/WebGL'
import fragmentShader from './shaders/planeFrag.glsl'
import vertexShader from './shaders/planeVert.glsl'
import { Assets, loadAssets } from './utils/assetLoader'
import { calcCoveredTextureScale } from './utils/coveredTexture'
import { mouse2d } from './utils/Mouse2D'

export class TCanvas {
  private assets: Assets = {
    image: { path: resolvePath('resources/image1.jpg') },
    // image: { path: resolvePath('resources/image2.jpg') },
  }

  constructor(private parentNode: ParentNode) {
    loadAssets(this.assets).then(() => {
      this.init()
      this.createObjects()
      gl.requestAnimationFrame(this.anime)
    })
  }

  private init() {
    gl.setup(this.parentNode.querySelector('.three-container')!)
    gl.setResizeCallback(this.resizeCallback)
  }

  private createObjects() {
    const texture = this.assets.image.data as THREE.Texture
    const coverdScale = calcCoveredTextureScale(texture, gl.size.aspect)

    const geometry = new THREE.PlaneGeometry(2, 2)
    const material = new THREE.ShaderMaterial({
      uniforms: {
        u_image: { value: { texture, coveredScale: new THREE.Vector2(coverdScale[0], coverdScale[1]) } },
        u_resolution: { value: new THREE.Vector2(gl.size.width, gl.size.height) },
        u_mouse: { value: new THREE.Vector2() },
        u_time: { value: 0 },
        u_refractPower: { value: 0.8 },
        u_unefractRange: { value: 0.1 },
      },
      vertexShader,
      fragmentShader,
    })
    const mesh = new THREE.Mesh(geometry, material)
    mesh.name = 'screen'

    gl.scene.add(mesh)

    // add gui
    const gui = new GUI()
    gui.add(material.uniforms.u_refractPower, 'value', 0, 1, 0.01).name('refract power')
    gui.add(material.uniforms.u_unefractRange, 'value', 0, 0.2, 0.01).name('unrefract range')
  }

  private getUniforms() {
    return gl.getMesh<THREE.ShaderMaterial>('screen').material.uniforms
  }

  private resizeCallback = () => {
    const uniforms = this.getUniforms()
    calcCoveredTextureScale(uniforms.u_image.value.texture, gl.size.aspect, uniforms.u_image.value.coveredScale)
    uniforms.u_resolution.value.set(gl.size.width, gl.size.height)
  }

  // ----------------------------------
  // animation
  private anime = () => {
    const dt = gl.time.getDelta()
    const uniforms = this.getUniforms()
    uniforms.u_mouse.value.set(mouse2d.position[0], mouse2d.position[1])
    uniforms.u_time.value += dt

    gl.render()
  }

  // ----------------------------------
  // dispose
  dispose() {
    gl.dispose()
  }
}
