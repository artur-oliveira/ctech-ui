import type {Meta, StoryObj} from "@storybook/react-vite"
import {OfflineBanner} from "./components/network"
const meta = {title: "Components/Offline Banner", component: OfflineBanner, args: {onRetry: () => {}}} satisfies Meta<typeof OfflineBanner>
export default meta
type Story = StoryObj<typeof meta>
export const Offline: Story = {args: {status: "offline"}}
export const Degraded: Story = {args: {status: "degraded"}}
export const Unavailable: Story = {args: {status: "unavailable", locale: "en"}}
