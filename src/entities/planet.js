/* global PIXI */
import 'pixi.js'

const SCREEN_BORDER = 50

class Planet {
  constructor (name, texture, radius, config, debug) {
    this.config = config
    this.debug = debug
    this.name = name
    this.sprite = new PIXI.Sprite(texture)
    this.sprite.anchor.x = 0.5
    this.sprite.anchor.y = 0.5
    this.sprite.visible = false
    this.worldRadius = radius
    this.worldPosition = [0, 0, 0]
    this.collided = false
  }

  update (dt, camera, debug) {
    if (this.sprite.visible === false) {
      this._spawn(camera)
    }

    let dx = camera.pan * camera.rcos - camera.tilt * camera.rsin
    let dy = camera.pan * camera.rsin + camera.tilt * camera.rcos

    if (this.worldPosition[2] > 100 && (this.worldPosition[2] - this.config.speed * camera.zoom * dt) < 100) {
      this.collided = true
    }

    this.worldPosition[0] -= this.config.speed * dx * dt
    this.worldPosition[1] -= this.config.speed * dy * dt
    this.worldPosition[2] -= this.config.speed * camera.zoom * dt

    if (this.worldPosition[2] > 20000) {
      this._spawn(camera, 5000)
      this.worldPosition[2] = -100
    } else if (this.worldPosition[2] < -100) {
      this._spawn(camera, 15000)
      this.worldPosition[2] = 20000
    }

    let screenPosition = camera.worldToScreen(this.worldPosition, true)

    if (!screenPosition) {
      this.sprite.alpha = 0
      this.collided = false
      return
    }

    let screenRadius = camera.worldToScreen([this.worldRadius, this.worldRadius, this.worldPosition[2]])[0]

    let alpha = 1
    let pos = screenPosition[0] - 0.5 * screenRadius
    if (pos > camera.screenCentre[0] + SCREEN_BORDER * 10) {
      this.worldPosition[0] *= -1
      alpha = 0
    } else if (pos >= camera.screenCentre[0]) {
      alpha = 0
    } else if (pos > camera.screenCentre[0] - SCREEN_BORDER) {
      alpha = Math.min(alpha, (camera.screenCentre[0] - pos) / SCREEN_BORDER)
    }
    pos = screenPosition[0] + 0.5 * screenRadius
    if (pos < -camera.screenCentre[0] - SCREEN_BORDER * 10) {
      this.worldPosition[0] *= -1
      alpha = 0
    } else if (pos <= -camera.screenCentre[0]) {
      alpha = 0
    } else if (pos < -camera.screenCentre[0] + SCREEN_BORDER) {
      alpha = Math.min(alpha, (camera.screenCentre[0] + pos) / SCREEN_BORDER)
    }
    pos = screenPosition[1] - 0.5 * screenRadius
    if (pos > camera.screenCentre[1] + SCREEN_BORDER * 10) {
      this.worldPosition[1] *= -1
      alpha = 0
    } else if (pos >= camera.screenCentre[1]) {
      alpha = 0
    } else if (pos > camera.screenCentre[1] - SCREEN_BORDER) {
      alpha = Math.min(alpha, (camera.screenCentre[1] - pos) / SCREEN_BORDER)
    }
    pos = screenPosition[1] + 0.5 * screenRadius
    if (pos < -camera.screenCentre[1] - SCREEN_BORDER * 10) {
      this.worldPosition[1] *= -1
      alpha = 0
    } else if (pos <= -camera.screenCentre[1]) {
      alpha = 0
    } else if (pos < -camera.screenCentre[1] + SCREEN_BORDER) {
      alpha = Math.min(alpha, (camera.screenCentre[1] + pos) / SCREEN_BORDER)
    }
    if (this.worldPosition[2] < 100) {
      alpha = Math.min(alpha, this.worldPosition[2] / 100)
    } else if (this.worldPosition[2] > 19000) {
      alpha = Math.min(alpha, (20000 - this.worldPosition[2]) / 1000)
    }
    if (alpha < 0) {
      alpha = 0
    }

    if (this.collided) {
      if (screenPosition[0] - 0.5 * screenRadius > -camera.screenCentre[0]) {
        this.collided = false
      }
      if (screenPosition[0] + 0.5 * screenRadius < camera.screenCentre[0]) {
        this.collided = false
      }
      if (screenPosition[1] - 0.5 * screenRadius > -camera.screenCentre[1]) {
        this.collided = false
      }
      if (screenPosition[1] + 0.5 * screenRadius < camera.screenCentre[1]) {
        this.collided = false
      }
    }

    this.sprite.position.x = screenPosition[0]
    this.sprite.position.y = screenPosition[1]
    this.sprite.scale.x = screenRadius / this.sprite.texture.width
    this.sprite.scale.y = screenRadius / this.sprite.texture.height
    this.sprite.rotation = camera.angle
    this.sprite.alpha = alpha
    this.sprite.zOrder = this.worldPosition[2]
    this.sprite.visible = true
  }

  add (world, group) {
    world.addChild(this.sprite)
    this.sprite.displayGroup = group
  }

  remove (world) {
    world.removeChild(this.sprite)
    this.sprite.destroy(true, true)
  }

  _spawn (camera, depth) {
    let worldDepth = depth || (Math.random() * 10000 + 5000)
    let screenPosition = [(Math.random() * camera.screenCentre[0] - Math.random() * camera.screenCentre[0]), (Math.random() * camera.screenCentre[1] - Math.random() * camera.screenCentre[1])]
    this.worldPosition = camera.screenToWorld(screenPosition, worldDepth)
  }
}

export default Planet
