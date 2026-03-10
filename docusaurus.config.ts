import * as dotenv from 'dotenv';
dotenv.config();
import { themes as prismThemes } from 'prism-react-renderer';
import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'Paysecure Guide',
  tagline: 'Your guide to Paysecure onboarding and configuration',
  favicon: 'img/favicon.ico',
  url: 'https://docs.paysecure.net',
  baseUrl: '/',
  organizationName: 'Paysecure',
  projectName: 'paysecureGuide',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  future: {
    v4: true,
  },

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      '@docusaurus/preset-classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themes: [
    [
      require.resolve('@easyops-cn/docusaurus-search-local'),
      {
        hashed: true,
      },
    ],
  ],

  plugins: [
    async function myPlugin(context, options) {
      return {
        name: "docusaurus-tailwindcss",
        configurePostCss(postcssOptions) {
          // Appends TailwindCSS and AutoPrefixer.
          postcssOptions.plugins.push(require("tailwindcss"));
          postcssOptions.plugins.push(require("autoprefixer"));
          return postcssOptions;
        },
      };
    },
  ],

  customFields: {
    companyName: process.env.COMPANY_NAME || "Paysecure",
  },

  themeConfig: {
    navbar: {
      title: 'Paysecure',
      logo: {
        alt: 'Paysecure Logo',
        src: 'img/logo.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'apmDocs',
          position: 'left',
          label: 'APM Docs',
          className: 'navbar_api',
        },
        {
          type: 'docSidebar',
          sidebarId: 'api',
          position: 'left',
          label: 'API Reference',
          className: 'navbar_api',
        },
        {
          type: 'search',
          position: 'right',
          className: 'navbar_search_bar',
        },
        {
          href: 'https://paysecure.net/',
          label: 'Paysecure',
          position: 'right',
          className: 'navbar_link',
        },
      ],
    },
    colorMode: {
      defaultMode: 'light',
      disableSwitch: true,
      respectPrefersColorScheme: false,
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'APM Docs',
          items: [
            {
              label: 'Overview',
              to: '/docs/overview',
            },
            {
              label: 'Environment',
              to: '/docs/environment',
            },
          ],
        },
        {
          title: 'Paysecure',

          items: [
            {
              label: 'GitHub',
              href: 'https://github.com/sakshamgalyan/guide',
            },
            {
              label: 'Paysecure',
              href: 'https://paysecure.net/',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Paysecure, Inc. Built by Saksham.`,

    },
    prism: {
      theme: prismThemes.jettwaveLight,
      // darkTheme: prismThemes.gruvboxMaterialLight,
    },
    // Add custom text color for the site
    customCss: [
      './src/css/custom.css',
    ],
  } satisfies Preset.ThemeConfig,
};

export default config;
