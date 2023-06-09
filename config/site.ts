export type SiteConfig = typeof siteConfig

export const siteConfig = {
  name: "DocBase",
  description: "Open-source alternative to DocSend",
  url: "https://getdocbase.com", // Don't end with a slash /
  ogImage: "https://getdocbase.com/opengraph-image",
  mainNav: [
    {
      title: "Home",
      href: "/",
    },
    {
      title: "Links",
      href: "/links",
    },
  ],
  links: {
    twitter: "https://twitter.com/alanaagoyal",
    github: "https://github.com/alanagoyal/docbase",
  },
}
