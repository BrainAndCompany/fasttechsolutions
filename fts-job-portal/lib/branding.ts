/**
 * Brand assets — /public/logos/ (same marks as fts-site).
 */
export const BRAND = {
  name: "Fast Tech Solutions",
  shortName: "FTS",
  product: "Job Portal",
  domain: "jobs.fts-ksa.com",
  siteUrl: "https://jobs.fts-ksa.com",
  corporateUrl: "https://fts-ksa.com",
  email: "hr@fts-ksa.com",
  logo: {
    default: {
      src: "/logos/fts-logo-color-transparent.png",
      width: 638,
      height: 190,
    },
    reversed: {
      src: "/logos/fts-logo-white-transparent.png",
      width: 638,
      height: 190,
    },
  },
} as const;
