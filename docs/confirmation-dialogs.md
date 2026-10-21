# Confirmation dialogs (money, deletion) with Modal and Drawer

Since 0.10.0. Every option is optional and the defaults change nothing: a `Modal` without them still has the
X, the Cancel/submit footer, dismissal by Escape and outside click, and Base UI's default initial focus.

| Prop | On | Effect |
|---|---|---|
| `initialFocus` | Modal, Drawer | Ref or CSS selector of the element focused on open. Use it to land on the safe action, not on the first tabbable. |
| `dismissible` | Modal, Drawer | Default `true`. `false` blocks Escape, outside click, swipe (Drawer), the X and the Modal's Cancel. Focus stays trapped and the content stays readable by screen readers; only closing is refused. |
| `hideClose` | Modal, Drawer | Removes the X. Escape and outside click still follow `dismissible`. |
| `footer` | Modal | Replaces the default Cancel/submit footer (`null` renders none). The Drawer already has `footer`. |
| `hideCancel` | Modal | Default footer without Cancel, so one action remains. |
| `aria` | Modal, Drawer | `{role: "alertdialog", describedBy: "<id>"}`. `alertdialog` for destructive confirmations; `describedBy` points at the body that states the consequence. |

## Example: withdrawal confirmation with a pending request

```tsx
function ConfirmWithdraw({open, amount, pending, onConfirm, onClose}: Props) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Confirm withdrawal"
      dismissible={!pending}          // no Escape, outside click or X while the request runs
      initialFocus="#confirm-withdraw" // or a ref
      aria={{role: "alertdialog", describedBy: "withdraw-summary"}}
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={pending}>Cancel</Button>
          <Button id="confirm-withdraw" variant="danger" onClick={onConfirm} disabled={pending}>
            {pending ? "Processing" : `Withdraw ${amount}`}
          </Button>
        </>
      }
    >
      <p id="withdraw-summary">{amount} leaves your wallet and cannot be recalled.</p>
    </Modal>
  )
}
```

Notes:
- `dismissible={false}` does not move focus out or hide the dialog, so a screen reader keeps announcing it. Pair
  it with a live region (`aria-live="polite"`) for the pending/result text.
- The default footer's own Cancel is disabled while `dismissible` is `false`; a custom `footer` is the caller's
  to disable.
- `initialFocus` as a selector is resolved with `document.querySelector` when the dialog opens (it is portaled).
  Prefer a ref when the element is rendered by the same component.
