import { Axis3d, Box, createElement, Grid3x3, type IconNode, Moon, Pause, Play, RotateCcw } from 'lucide'
import { cleanName, formatCount, lengthFormat } from './display-format.ts'
import type { Translate } from './messages.ts'
import type { ModelSummary } from './model-scene.ts'
import { ALL_CLIPS } from './scene-animation.ts'
import { loadPreferences, savePreferences } from './viewer-preferences.ts'

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
  /** Notes in the toolbar that a newer save is loading while the current model stays up. */
  setPending: (text: string | null) => void
  /** Shows a model's figures; `keepToggles` carries wireframe and guides over from the last model. */
  showModel: (summary: ModelSummary, actions: ViewerActions, notices: string[], keepToggles: boolean) => void
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

function icon(node: IconNode, size = 14): SVGElement {
  return createElement(node, { width: size, height: size, 'aria-hidden': 'true' })
}

function toolButton(iconNode: IconNode, title: string): HTMLButtonElement {
  return element('button', { type: 'button', className: 'tool', title, ariaLabel: title }, [icon(iconNode)])
}

export function createViewerUi(root: HTMLElement, t: Translate, locale: string): ViewerUi {
  const animationLabel = (name: string | undefined, index: number): string =>
    cleanName(name ?? '') || t('animationFallback', { index: index + 1 })

  // Why a group, not an img: an img's children are hidden from assistive technology, and the canvas takes focus.
  const viewport = element('div', { className: 'viewport', role: 'group', ariaLabel: t('loading') })
  const overlayIcon = element('span', { className: 'overlay-icon' })
  const overlayText = element('p')
  const overlay = element('div', { className: 'overlay' }, [overlayIcon, overlayText])
  // Why a status region: a later save that failed must be announced, not only shown.
  const notice = element('div', { className: 'notice', role: 'status', hidden: true })

  const reset = toolButton(RotateCcw, t('resetView'))
  const wireframe = toolButton(Grid3x3, t('wireframe'))
  const guides = toolButton(Axis3d, t('guides'))
  const theme = toolButton(Moon, t('darkTheme'))
  const play = element('button', { type: 'button', className: 'tool' })
  const animationSelect = element('select', { className: 'select', ariaLabel: t('animation') })
  const animationName = element('span', { className: 'clip-name' })
  const animationGroup = element('div', { className: 'group', hidden: true }, [play, animationSelect, animationName])
  const stats = element('span', { className: 'figure' })
  const dimensions = element('span', { className: 'figure', title: t('dimensionsTitle') })
  const gridCell = element('span', { className: 'figure' })
  const pending = element('span', { className: 'pending', role: 'status', hidden: true })
  const toolbar = element('footer', { className: 'toolbar' }, [
    element('div', { className: 'group' }, [reset, wireframe, guides, theme]),
    animationGroup,
    stats,
    dimensions,
    gridCell,
    pending
  ])
  root.replaceChildren(element('div', { className: 'stage' }, [viewport, overlay]), notice, toolbar)

  let actions: ViewerActions | null = null
  const saved = loadPreferences()
  let dark = saved.dark
  let wireframeOn = saved.wireframe
  let guidesOn = saved.guides
  const save = (): void => savePreferences({ dark, wireframe: wireframeOn, guides: guidesOn })
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
    for (const button of [reset, wireframe, guides]) button.disabled = !enabled
  }

  reset.addEventListener('click', () => actions?.resetView())
  wireframe.addEventListener('click', () => {
    wireframeOn = !wireframeOn
    setPressed(wireframe, wireframeOn)
    actions?.setWireframe(wireframeOn)
    save()
  })
  guides.addEventListener('click', () => {
    guidesOn = !guidesOn
    setPressed(guides, guidesOn)
    gridCell.hidden = !guidesOn
    actions?.setGuidesVisible(guidesOn)
    save()
  })
  const applyTheme = (): void => {
    document.documentElement.classList.toggle('dark', dark)
    setPressed(theme, dark)
  }
  applyTheme()
  theme.addEventListener('click', () => {
    dark = !dark
    applyTheme()
    save()
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

  const setPending = (text: string | null): void => {
    pending.hidden = text === null
    pending.textContent = text ?? ''
  }
  const clearFigures = (): void => {
    setPending(null)
    actions = null
    setToolsEnabled(false)
    animationGroup.hidden = true
    notice.hidden = true
    for (const figure of [stats, dimensions, gridCell]) figure.textContent = ''
  }

  const showOverlay = (text: string, isError: boolean): void => {
    clearFigures()
    overlay.hidden = false
    toolbar.hidden = isError
    // Why alert only for errors: a screen reader should interrupt for a failure, not for "Loading…".
    overlay.setAttribute('role', isError ? 'alert' : 'status')
    overlay.classList.toggle('error', isError)
    overlayText.textContent = text
    overlayIcon.replaceChildren(...(isError ? [icon(Box, 40)] : []))
    viewport.hidden = isError
    viewport.ariaLabel = text
  }

  clearFigures()
  return {
    viewport,
    showLoading: () => showOverlay(t('loading'), false),
    showError: (message) => showOverlay(message, true),
    setPending,
    showModel: (summary, modelActions, notices, keepToggles) => {
      clearFigures()
      actions = modelActions
      if (!keepToggles) {
        const last = loadPreferences()
        wireframeOn = last.wireframe
        guidesOn = last.guides
      }
      paused = false
      setPressed(wireframe, wireframeOn)
      setPressed(guides, guidesOn)
      if (!summary.wireframeAvailable) {
        wireframeOn = false
        setPressed(wireframe, false)
      }
      modelActions.setWireframe(wireframeOn)
      modelActions.setGuidesVisible(guidesOn)
      overlay.hidden = true
      toolbar.hidden = false
      viewport.hidden = false
      setToolsEnabled(true)
      wireframe.disabled = !summary.wireframeAvailable
      wireframe.title = summary.wireframeAvailable ? t('wireframe') : t('wireframeTooLarge')
      notice.hidden = notices.length === 0
      notice.textContent = notices.join(' ')

      const names = summary.animationNames
      animationGroup.hidden = names.length === 0
      renderPlay()
      // Why the position as the value: clip names may repeat or be empty, so only the order identifies a clip.
      animationSelect.replaceChildren(
        ...names.map((name, index) => element('option', { value: String(index), textContent: animationLabel(name, index) })),
        ...(names.length > 1 ? [element('option', { value: String(ALL_CLIPS), textContent: t('allClips') })] : [])
      )
      animationSelect.hidden = names.length < 2
      animationName.hidden = names.length !== 1
      animationName.textContent = animationLabel(names[0], 0)

      const counts = summary.stats
      const figure = (key: 'vertices' | 'triangles' | 'points' | 'lineSegments', count: number): string =>
        t(key, { count: formatCount(count, locale) }, count)
      stats.textContent = [
        figure('vertices', counts.vertices),
        figure('triangles', counts.triangles),
        ...(counts.points > 0 ? [figure('points', counts.points)] : []),
        ...(counts.lineSegments > 0 ? [figure('lineSegments', counts.lineSegments)] : [])
      ].join(' · ')
      const { width, height, depth } = summary.dimensions
      const lengths = lengthFormat([width, height, depth], locale)
      dimensions.textContent = t('dimensions', {
        width: lengths.format(width),
        height: lengths.format(height),
        depth: lengths.format(depth),
        unit: lengths.unit
      })
      gridCell.hidden = !guidesOn
      gridCell.textContent = t('gridCell', { size: `${lengths.format(summary.gridCellSize)} ${lengths.unit}` })
      viewport.ariaLabel = t('viewportLabel', { summary: `${stats.textContent}, ${dimensions.textContent}` })
    }
  }
}
