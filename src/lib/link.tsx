import type {AnchorHTMLAttributes, ReactElement, Ref} from "react"

/**
 * The library knows nothing about routing. A component that renders links
 * takes a `renderLink` so the product's router does the navigating — for
 * Next.js, `renderLink={props => <Link {...props} />}`. Without one, a plain
 * `<a>` is rendered and the browser navigates.
 */
type LinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {href: string; ref?: Ref<HTMLAnchorElement>}
type RenderLink = (props: LinkProps) => ReactElement

const defaultRenderLink: RenderLink = props => <a {...props} />

export {defaultRenderLink, type LinkProps, type RenderLink}
