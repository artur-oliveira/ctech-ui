import type {Meta, StoryObj} from "@storybook/react-vite"
import {ErrorState} from "./components/error-state"
import {Button} from "./components/button"
const meta = {title: "Components/Error State", component: ErrorState, args: {action: <Button render={<a href="/" />}>Voltar ao início</Button>}} satisfies Meta<typeof ErrorState>
export default meta
type Story = StoryObj<typeof meta>
export const InvalidAddress: Story = {args: {status: 400}}
export const NotFound: Story = {args: {status: 404}}
export const UnexpectedError: Story = {args: {status: 500}}
export const ServiceUnavailable: Story = {args: {status: 503}}
