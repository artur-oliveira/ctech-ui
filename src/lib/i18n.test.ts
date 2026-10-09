import assert from "node:assert/strict"
import {test} from "node:test"

import {getDatePickerLabels, getErrorMessages, getModalLabels, resolveCatalog} from "./i18n.ts"

test("resolves BCP-47 tags to a catalog, defaulting to pt-BR", () => {
  assert.equal(resolveCatalog(undefined), "pt-BR")
  assert.equal(resolveCatalog("pt"), "pt-BR")
  assert.equal(resolveCatalog("pt-PT"), "pt-BR")
  assert.equal(resolveCatalog("en"), "en")
  assert.equal(resolveCatalog("en-US"), "en")
  assert.equal(resolveCatalog("es"), "en")
})

test("date picker labels per locale, with overrides", () => {
  assert.equal(getDatePickerLabels("pt-BR").today, "Hoje")
  assert.equal(getDatePickerLabels("en").today, "Today")
  assert.equal(getDatePickerLabels("en", {today: "Now"}).today, "Now")
  assert.equal(getDatePickerLabels("en", {today: "Now"}).selected, "selected")
})

test("modal and error copy per locale", () => {
  assert.equal(getModalLabels("pt-BR").close, "Fechar")
  assert.equal(getModalLabels("en").close, "Close")
  assert.equal(getErrorMessages("en")[404].title, "We couldn't find this page")
  assert.equal(getErrorMessages(undefined)[404].title, "Não encontramos esta página")
})

test("Intl honours the exact tag for the displayed date", () => {
  const date = new Date(2026, 2, 5)
  const fmt = (l: string) => new Intl.DateTimeFormat(l, {day: "2-digit", month: "long", year: "numeric"}).format(date)
  assert.match(fmt("pt-BR"), /março/)
  assert.match(fmt("en"), /March/)
})
