"use client"

import {Popover} from "@base-ui/react/popover"
import {format} from "date-fns"
import {ptBR} from "date-fns/locale/pt-BR"
import {useState} from "react"
import {DayPicker} from "react-day-picker"
import type {Matcher} from "react-day-picker"

import {cn} from "../lib/cn"
import {useThemeScope} from "./theme-provider"

interface CalendarProps {
  selected?: Date
  onSelect?: (date: Date | undefined) => void
  disabled?: Matcher | Matcher[]
  className?: string
}

/** An inline, keyboard-operable calendar. Use DatePicker for a field trigger. */
// react-day-picker's default labels are English ("Go to the Previous Month",
// "Today, …"): a screen reader in a pt-BR product read half its calendar in
// another language.
const LABELS = {
  labelPrevious: () => "Mês anterior",
  labelNext: () => "Próximo mês",
  labelDayButton: (date: Date, modifiers: {today?: boolean; selected?: boolean}) =>
    `${modifiers.today ? "Hoje, " : ""}${format(date, "PPPP", {locale: ptBR})}${modifiers.selected ? ", selecionado" : ""}`,
}

function Calendar({selected, onSelect, disabled, className}: CalendarProps) {
  return (
    <DayPicker
      mode="single"
      // Open on the selected date's month, not today's: editing a date months
      // away otherwise starts by paging back to it.
      defaultMonth={selected}
      labels={LABELS}
      selected={selected}
      onSelect={onSelect}
      disabled={disabled}
      locale={ptBR}
      classNames={{
        month_caption: "calendar-month-caption",
        caption_label: "calendar-caption-label",
        nav: "calendar-nav",
        button_next: "calendar-button-next",
        button_previous: "calendar-button-previous",
        chevron: "calendar-chevron",
        month_grid: "calendar-month-grid",
        weekday: "calendar-weekday",
        day: "calendar-day",
        day_button: "calendar-day-button",
      }}
      className={cn(
        "relative min-w-[17.5rem] p-3 text-sm text-foreground",
        "[&_.calendar-month-caption]:flex [&_.calendar-month-caption]:h-9 [&_.calendar-month-caption]:w-full [&_.calendar-month-caption]:items-center [&_.calendar-month-caption]:justify-center [&_.calendar-month-caption]:px-10 [&_.calendar-caption-label]:truncate [&_.calendar-caption-label]:font-semibold",
        "[&_.calendar-nav]:pointer-events-none [&_.calendar-nav]:absolute [&_.calendar-nav]:inset-x-3 [&_.calendar-nav]:top-3 [&_.calendar-nav]:flex [&_.calendar-nav]:justify-between",
        "[&_.calendar-button-next]:pointer-events-auto [&_.calendar-button-next]:grid [&_.calendar-button-next]:size-9 [&_.calendar-button-next]:place-items-center [&_.calendar-button-next]:rounded-md [&_.calendar-button-next]:hover:bg-surface",
        "[&_.calendar-button-previous]:pointer-events-auto [&_.calendar-button-previous]:grid [&_.calendar-button-previous]:size-9 [&_.calendar-button-previous]:place-items-center [&_.calendar-button-previous]:rounded-md [&_.calendar-button-previous]:hover:bg-surface",
        "[&_.calendar-chevron]:size-4 [&_.calendar-chevron]:fill-none [&_.calendar-chevron]:stroke-current",
        "[&_.calendar-month-grid]:w-full [&_.calendar-month-grid]:border-collapse [&_.calendar-weekday]:h-9 [&_.calendar-weekday]:text-xs [&_.calendar-weekday]:font-medium [&_.calendar-weekday]:text-muted-foreground",
        "[&_.calendar-day]:size-9 [&_.calendar-day-button]:grid [&_.calendar-day-button]:size-9 [&_.calendar-day-button]:place-items-center [&_.calendar-day-button]:rounded-md [&_.calendar-day-button]:outline-none [&_.calendar-day-button]:hover:bg-surface [&_.calendar-day-button]:focus-visible:ring-3 [&_.calendar-day-button]:focus-visible:ring-ring/35",
        "[&_.calendar-day[data-selected]_button]:bg-brand-600 [&_.calendar-day[data-selected]_button]:text-white [&_.calendar-day[data-today]:not([data-selected])_button]:font-semibold [&_.calendar-day[data-today]:not([data-selected])_button]:text-brand-600",
        "[&_.calendar-day[data-outside]_button]:text-muted-foreground/60 [&_.calendar-day[data-disabled]_button]:cursor-not-allowed [&_.calendar-day[data-disabled]_button]:opacity-40",
        className
      )}
    />
  )
}

interface DatePickerProps {
  value?: Date
  defaultValue?: Date
  onValueChange?: (date: Date | undefined) => void
  placeholder?: string
  disabled?: boolean
  id?: string
  name?: string
  className?: string
  min?: Date
  max?: Date
  defaultOpen?: boolean
}

/**
 * A single-date field backed by an accessible Popover + Calendar. Dates remain
 * Date objects at the API boundary so products can apply their own timezone
 * and serialization policies explicitly.
 */
function DatePicker({
  value,
  defaultValue,
  onValueChange,
  placeholder = "Selecionar data",
  disabled = false,
  id,
  name,
  className,
  min,
  max,
  defaultOpen = false,
}: DatePickerProps) {
  const [uncontrolledValue, setUncontrolledValue] = useState<Date | undefined>(defaultValue)
  const [open, setOpen] = useState(defaultOpen)
  const {theme, density} = useThemeScope()
  const selected = value ?? uncontrolledValue
  const disabledDays: Matcher[] = [
    ...(min ? [{before: min}] : []),
    ...(max ? [{after: max}] : []),
  ]
  const label = selected
    ? new Intl.DateTimeFormat("pt-BR", {day: "2-digit", month: "long", year: "numeric"}).format(selected)
    : placeholder

  function selectDate(date: Date | undefined) {
    if (value === undefined) setUncontrolledValue(date)
    onValueChange?.(date)
    if (date) setOpen(false)
  }

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger
        id={id}
        disabled={disabled}
        className={cn(
          "flex h-11 w-full items-center justify-between rounded-lg border border-border bg-background px-3 text-left text-sm outline-none",
          "text-foreground transition-[border-color,box-shadow] duration-150 hover:bg-surface focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/35",
          "disabled:cursor-not-allowed disabled:opacity-50 in-data-[density=compact]:h-8 in-data-[density=compact]:px-2.5",
          !selected && "text-muted-foreground",
          className
        )}
      >
        <span className="truncate">{label}</span><CalendarGlyph />
      </Popover.Trigger>
      {name && <input type="hidden" name={name} value={selected ? formatDateValue(selected) : ""} />}
      <Popover.Portal data-ctech-theme={theme} data-density={density}>
        <Popover.Positioner side="bottom" align="start" sideOffset={8} className="z-50">
          <Popover.Popup className="rounded-xl border border-border bg-background shadow-modal outline-none transition-[opacity,scale] duration-150 data-[ending-style]:scale-[0.98] data-[ending-style]:opacity-0 data-[starting-style]:scale-[0.98] data-[starting-style]:opacity-0 motion-reduce:transition-none">
            <Calendar selected={selected} onSelect={selectDate} disabled={disabled || disabledDays.length > 0 ? (disabled ? true : disabledDays) : undefined} />
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  )
}

function formatDateValue(value: Date) {
  return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}-${String(value.getDate()).padStart(2, "0")}`
}

function CalendarGlyph() {
  return <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden className="size-4 shrink-0"><rect x="2.5" y="3.5" width="11" height="10" rx="1.5" /><path d="M5 2v3M11 2v3M2.5 6.5h11" strokeLinecap="round" /></svg>
}

export {Calendar, DatePicker, type CalendarProps, type DatePickerProps}
