import { Axis3d, Box, createElement, Grid3x3, type IconNode, Pause, Play, RotateCcw } from 'lucide'
import type { Translate } from './messages.ts'
import type { ModelStats } from './model-scene.ts'
import type { ModelDimensions } from './scene-guides.ts'

export type ModelSummary = {
  stats: ModelStats
  dimensions: ModelDimensions
  gridCellSize: number
  animationNames: string[]
}

export type ViewerActions = {
  resetView: () => void
  setWireframe: (enabled: boolean) => void
  setGuidesVisible: (visible: boolean) => void
  playAnimation: (clipIndex: number) => void
  setAnimationPaused: (paused: boolean) => void
}

export type ViewerUi = {
  viewport: HTMLElement
  showLoading: () => void
  showError: (message: string) => void
  showModel: (summary: ModelSummary, actions: ViewerActions, notice: string | null) => void
}

function element<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  props: Partial<HTMLElementTagNameMap[K]> = {},
  children: (Node | string)[] = []
): HTMLElementTagNameMap[K] {
  const node = Object.assign(document.createElement(tag), props)
  node.append(...children)
  return node
}

function icon(node: IconNode): SVGElement {
  return createElement(node, { width: 14, height: 14, 'aria-hidden': 'true' })
}

function toolButton(iconNode: IconNode, title: string): HTMLButtonElement {
  return element('button', { type: 'button', className: 'tool', title, ariaLabel: title }, [
    icon(iconNode)
  ])
}

export function createViewerUi(root: HTMLElement, t: Translate, locale: string): ViewerUi {
  const formatLength = (value: number): string =>
    Number(value.toPrecision(3)).toLocaleString(locale, { maximumFractionDigits: 6 })
  const animationLabel = (name: string | undefined, index: number): string =>
    name || t('animationFallback', { index: index + 1 })

  const viewport = element('div', { className: 'viewport', role: 'img' })
  const overlayText = element('p')
  const overlay = element('div', { className: 'overlay', role: 'status' }, [overlayText])
  const notice = element('div', { className: 'notice', role: 'note', hidden: true })

  const reset = toolButton(RotateCcw, t('resetView'))
  const wireframe = toolButton(Grid3x3, t('wireframe'))
  const guides = toolButton(Axis3d, t('guides'))
  const play = element('button', { type: 'button', className: 'tool' })
  const animationSelect = element('select', { className: 'select', ariaLabel: t('animation') })
  const animationName = element('span', { className: 'clip-name' })
  const animationGroup = element('div', { className: 'group', hidden: true }, [
    play,
    animationSelect,
    animationName
  ])
  const stats = element('span', { className: 'figure' })
  const dimensions = element('span', { className: 'figure', title: t('dimensionsTitle') })
  const gridCell = element('span', { className: 'figure' })
  const toolbar = element('footer', { className: 'toolbar' }, [
    element('div', { className: 'group' }, [reset, wireframe, guides]),
    animationGroup,
    stats,
    dimensions,
    gridCell
  ])
  root.replaceChildren(element('div', { className: 'stage' }, [viewport, overlay]), notice, toolbar)

  let actions: ViewerActions | null = null
  let wireframeOn = false
  let guidesOn = true
  let paused = false

  const setPressed = (button: HTMLButtonElement, pressed: boolean): void => {
    button.setAttribute('aria-pressed', String(pressed))
  }
  const renderPlay = (): void => {
    const title = paused ? t('playAnimation') : t('pauseAnimation')
    play.replaceChildren(icon(paused ? Play : Pause))
    play.title = title
    play.ariaLabel = title
  }
  const setToolsEnabled = (enabled: boolean): void => {
    for (const button of [reset, wireframe, guides]) {
      button.disabled = !enabled
    }
  }

  reset.addEventListener('click', () => actions?.resetView())
  wireframe.addEventListener('click', () => {
    wireframeOn = !wireframeOn
    setPressed(wireframe, wireframeOn)
    actions?.setWireframe(wireframeOn)
  })
  guides.addEventListener('click', () => {
    guidesOn = !guidesOn
    setPressed(guides, guidesOn)
    gridCell.hidden = !guidesOn
    actions?.setGuidesVisible(guidesOn)
  })
  play.addEventListener('click', () => {
    paused = !paused
    renderPlay()
    actions?.setAnimationPaused(paused)
  })
  animationSelect.addEventListener('change', () => {
    paused = false
    renderPlay()
    actions?.playAnimation(Number(animationSelect.value))
  })

  const clearModel = (): void => {
    actions = null
    wireframeOn = false
    guidesOn = true
    paused = false
    setPressed(wireframe, false)
    setPressed(guides, true)
    setToolsEnabled(false)
    animationGroup.hidden = true
    notice.hidden = true
    for (const figure of [stats, dimensions, gridCell]) {
      figure.textContent = ''
    }
  }

  const showOverlay = (text: string, isError: boolean): void => {
    clearModel()
    overlay.hidden = false
    toolbar.hidden = isError
    overlay.classList.toggle('error', isError)
    overlayText.textContent = text
    overlay.querySelector('svg')?.remove()
    if (isError) {
      overlay.prepend(createElement(Box, { width: 40, height: 40, 'aria-hidden': 'true' }))
    }
    viewport.hidden = isError
  }

  clearModel()
  return {
    viewport,
    showLoading: () => showOverlay(t('loading'), false),
    showError: (message) => showOverlay(message, true),
    showModel: (summary, modelActions, noticeText) => {
      clearModel()
      actions = modelActions
      overlay.hidden = true
      toolbar.hidden = false
      viewport.hidden = false
      setToolsEnabled(true)
      notice.hidden = noticeText === null
      notice.textContent = noticeText ?? ''

      const names = summary.animationNames
      animationGroup.hidden = names.length === 0
      renderPlay()
      // Why the position as the value: clip names may repeat or be empty, so only the order identifies a clip.
      animationSelect.replaceChildren(
        ...names.map((name, index) =>
          element('option', { value: String(index), textContent: animationLabel(name, index) })
        )
      )
      animationSelect.hidden = names.length < 2
      animationName.hidden = names.length !== 1
      animationName.textContent = animationLabel(names[0], 0)

      stats.textContent = t('stats', {
        vertices: summary.stats.vertices.toLocaleString(locale),
        triangles: summary.stats.triangles.toLocaleString(locale)
      })
      dimensions.textContent = t('dimensions', {
        width: formatLength(summary.dimensions.width),
        height: formatLength(summary.dimensions.height),
        depth: formatLength(summary.dimensions.depth)
      })
      gridCell.hidden = false
      gridCell.textContent = t('gridCell', { size: formatLength(summary.gridCellSize) })
    }
  }
}
