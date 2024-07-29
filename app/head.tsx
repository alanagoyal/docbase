import { siteConfig } from "@/config/site";

export default function Head() {
  return (
    <>
      <title>{siteConfig.name}</title>
      <link rel="manifest" href="/manifest.json" />
      <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:title" content={siteConfig.name} />
      <meta property="twitter:description" content={siteConfig.tagline} />
      <meta property="og:site_name" content={siteConfig.name} />
      <meta property="og:description" content={siteConfig.tagline} />
      <meta property="og:title" content={siteConfig.name} />
      <meta property="og:url" content={siteConfig.url} />
    </>
  );
}