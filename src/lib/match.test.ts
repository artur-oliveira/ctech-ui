import assert from "node:assert/strict"
import {test} from "node:test"

import {foldText, matchEntries} from "./match.ts"

const E = [
  {id: "1", label: "Agenda", group: "Finanças", keywords: ["contas a pagar", "boletos"]},
  {id: "2", label: "Recorrências", group: "Finanças"},
  {id: "3", label: "Nova recorrência", group: "Finanças"},
  {id: "4", label: "Cartões", group: "Finanças", keywords: ["fatura"]},
  {id: "5", label: "Faturas", group: "Portal"},
  {id: "6", label: "Faturas", group: "Console"},
]
const ids = (q: string, limit?: number) => matchEntries(E, q, limit).map(e => e.id)

test("folds case, accents and spaces", () => {
  assert.equal(foldText("  Recorrências  Ç "), "recorrencias c")
})

test("an empty query keeps the given order, capped at the limit", () => {
  assert.deepEqual(ids(""), ["1", "2", "3", "4", "5", "6"])
  assert.deepEqual(ids("   ", 2), ["1", "2"])
})

test("accent-insensitive in both directions", () => {
  assert.deepEqual(ids("cartoes"), ["4"])
  assert.deepEqual(ids("cartões"), ["4"])
  assert.deepEqual(ids("recorrencia"), ["2", "3"])
})

test("a label that starts with the query beats a label word that does", () => {
  assert.deepEqual(ids("recor"), ["2", "3"])
})

test("a label hit outranks a keyword hit, a keyword outranks the group", () => {
  assert.deepEqual(ids("fatura"), ["5", "6", "4"])
  assert.equal(ids("financas").length, 4)
})

test("every token must match, in any order", () => {
  assert.deepEqual(ids("nova rec"), ["3"])
  assert.deepEqual(ids("rec nova"), ["3"])
  assert.deepEqual(ids("nova xyz"), [])
})

test("ties keep the given order and the limit applies after ranking", () => {
  assert.deepEqual(ids("faturas", 1), ["5"])
})

test("no match is an empty list", () => {
  assert.deepEqual(ids("zzz"), [])
})
