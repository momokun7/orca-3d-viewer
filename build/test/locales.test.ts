import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { createTranslate, type Message, messagesFor } from '../src/messages.ts'

// One locale per table, as Orca names its languages.
const LOCALES = ['en', 'ja', 'de', 'es', 'fr', 'ko', 'pt', 'ru', 'tr', 'zh', 'zh-Hant']
const EN = messagesFor('en')

const placeholders = (message: Message): string[] => {
  const texts = typeof message === 'string' ? [message] : Object.values(message).filter((text) => text !== undefined)
  return [...new Set(texts.flatMap((text) => [...text.matchAll(/\{\{(\w+)\}\}/g)].map((match) => match[1])))].sort()
}

describe('translations', () => {
  it('have a table of their own for every language Orca offers', () => {
    const tables = new Set(LOCALES.map(messagesFor))
    assert.equal(tables.size, LOCALES.length)
  })

  for (const locale of LOCALES.slice(1)) {
    it(`${locale} has every message, with the English placeholders and its plural forms`, () => {
      const table = messagesFor(locale)
      assert.deepEqual(Object.keys(table).sort(), Object.keys(EN).sort())
      const categories = new Intl.PluralRules(locale).resolvedOptions().pluralCategories
      for (const [key, english] of Object.entries(EN) as [keyof typeof EN, Message][]) {
        const message = table[key]
        assert.deepEqual(placeholders(message), placeholders(english), `${locale} ${key}`)
        if (typeof english !== 'string') {
          assert.equal(typeof message, 'object', `${locale} ${key} is a plural message`)
          for (const category of categories) {
            if (category === 'other') continue
            assert.ok(typeof message === 'object' && (message[category] !== undefined || category === 'zero' || category === 'two'), `${locale} ${key} lacks ${category}`)
          }
        }
        assert.doesNotMatch(JSON.stringify(message), /\p{Extended_Pictographic}/u, `${locale} ${key} has an emoji`)
      }
    })
  }

  it('picks a table by language, Chinese by script or region, and falls back to English', () => {
    assert.equal(messagesFor('de-AT'), messagesFor('de'))
    assert.equal(messagesFor('zh-TW'), messagesFor('zh-Hant'))
    assert.equal(messagesFor('zh-CN'), messagesFor('zh'))
    assert.equal(messagesFor('pt-BR'), messagesFor('pt'))
    assert.equal(messagesFor('nl'), EN)
    assert.equal(messagesFor('__proto__'), EN)
  })

  it('chooses Russian plural forms by count', () => {
    const t = createTranslate('ru')
    const forms = [1, 2, 5].map((count) => t('vertices', { count: String(count) }, count))
    assert.equal(new Set(forms).size, 3)
  })
})
