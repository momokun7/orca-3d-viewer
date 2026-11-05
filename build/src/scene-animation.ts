import {
  type AnimationAction,
  type AnimationClip,
  AnimationMixer,
  type Object3D,
  Quaternion,
  Vector3
} from 'three'

/** Plays every clip at once rather than one of them. */
export const ALL_CLIPS = -1

export type SceneAnimation = {
  clipNames: string[]
  /** Starts a clip (or ALL_CLIPS) from the model's rest pose. */
  play: (clipIndex: number) => void
  /** Advances the clips; the caller's loop runs only while this is true. */
  isRunning: () => boolean
  setPaused: (paused: boolean) => void
  update: (deltaSeconds: number) => void
  dispose: () => void
}

// Why clamp: after the tab was hidden or the thread stalled, one huge step would jump the motion.
export const MAX_FRAME_SECONDS = 0.1

type RestPose = { object: Object3D; position: Vector3; quaternion: Quaternion; scale: Vector3; morph?: number[] }

function captureRestPose(root: Object3D): RestPose[] {
  const poses: RestPose[] = []
  root.traverse((object) => {
    const influences = (object as Object3D & { morphTargetInfluences?: number[] }).morphTargetInfluences
    poses.push({
      object,
      position: object.position.clone(),
      quaternion: object.quaternion.clone(),
      scale: object.scale.clone(),
      morph: influences ? [...influences] : undefined
    })
  })
  return poses
}

function restorePose(poses: RestPose[]): void {
  for (const { object, position, quaternion, scale, morph } of poses) {
    object.position.copy(position)
    object.quaternion.copy(quaternion)
    object.scale.copy(scale)
    const influences = (object as Object3D & { morphTargetInfluences?: number[] }).morphTargetInfluences
    if (morph && influences) influences.splice(0, influences.length, ...morph)
  }
}

export function createSceneAnimation(root: Object3D, clips: AnimationClip[]): SceneAnimation {
  const mixer = new AnimationMixer(root)
  const restPose = clips.length > 0 ? captureRestPose(root) : []
  let actions: AnimationAction[] = []
  let paused = false
  let moving = false
  return {
    clipNames: clips.map((clip) => clip.name),
    play: (clipIndex) => {
      const chosen = clipIndex === ALL_CLIPS ? clips : clips.slice(clipIndex, clipIndex + 1)
      if (chosen.length === 0) return
      mixer.stopAllAction()
      restorePose(restPose)
      actions = chosen.map((clip) => mixer.clipAction(clip).reset().play())
      // Why: a zero-length clip is a pose, not motion; apply it once instead of looping forever.
      moving = chosen.some((clip) => clip.duration > 0)
      paused = false
      mixer.update(0)
    },
    isRunning: () => moving && !paused && actions.length > 0,
    setPaused: (next) => {
      paused = next
    },
    update: (deltaSeconds) => {
      mixer.update(Math.min(Math.max(deltaSeconds, 0), MAX_FRAME_SECONDS))
    },
    dispose: () => {
      mixer.stopAllAction()
      mixer.uncacheRoot(root)
      actions = []
    }
  }
}
