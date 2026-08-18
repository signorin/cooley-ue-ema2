/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import heroHomeParser from './parsers/hero-home.js';
import cardsNewsParser from './parsers/cards-news.js';
import cardsResourceParser from './parsers/cards-resource.js';
import cardsInsightsParser from './parsers/cards-insights.js';
import videoFullwidthParser from './parsers/video-fullwidth.js';
import tabsLinksParser from './parsers/tabs-links.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/cooley-cleanup.js';
import sectionsTransformer from './transformers/cooley-sections.js';

// PARSER REGISTRY - Map parser names to functions
const parsers = {
  'hero-home': heroHomeParser,
  'cards-news': cardsNewsParser,
  'cards-resource': cardsResourceParser,
  'cards-insights': cardsInsightsParser,
  'video-fullwidth': videoFullwidthParser,
  'tabs-links': tabsLinksParser,
};

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json
const PAGE_TEMPLATE = {
  name: 'homepage',
  description: 'Cooley.com homepage with full-width hero (video), firm news teaser carousel, resource three-up cards, condensed featured media, full-width video, and tabbed practice link list',
  urls: [
    'https://www.cooley.com/',
  ],
  blocks: [
    {
      name: 'hero-home',
      instances: ['#main > article.grid-container > header.hero-home'],
    },
    {
      name: 'cards-news',
      instances: [
        '#main article.firm-news-teaser-list .items.swiper-wrapper',
        '#main article.firm-news-teaser-list .items',
      ],
    },
    {
      name: 'cards-resource',
      instances: ['#main article.resource-threeup-cards ul.items'],
    },
    {
      name: 'cards-insights',
      instances: ['#main article.condensed-featured-media ul.items'],
    },
    {
      name: 'video-fullwidth',
      instances: ['#main > article.grid-container > article.video-full-width'],
    },
    {
      name: 'tabs-links',
      instances: ['#main article.tabbed-link-list .tablist-items'],
    },
  ],
  sections: [
    {
      id: 'section-1-hero',
      name: 'Hero',
      selector: '#main > article.grid-container > header.hero-home.js-hero-home',
      style: null,
      blocks: ['hero-home'],
      defaultContent: [],
    },
    {
      id: 'section-2-firm-news',
      name: 'Firm News',
      selector: '#main > article.grid-container > article.firm-news-teaser-list',
      style: null,
      blocks: ['cards-news'],
      defaultContent: ['#main article.firm-news-teaser-list header.intro'],
    },
    {
      id: 'section-3-resources',
      name: 'Resources',
      selector: '#main > article.grid-container > article.resource-threeup-cards',
      style: null,
      blocks: ['cards-resource'],
      defaultContent: ['#main article.resource-threeup-cards header.intro'],
    },
    {
      id: 'section-4-insights',
      name: 'Latest Insights',
      selector: '#main > article.grid-container > article.condensed-featured-media',
      style: 'dark',
      blocks: ['cards-insights'],
      defaultContent: [
        '#main article.condensed-featured-media header.intro',
        '#main article.condensed-featured-media .outro',
      ],
    },
    {
      id: 'section-5-video',
      name: 'Video',
      selector: '#main > article.grid-container > article.video-full-width',
      style: null,
      blocks: ['video-fullwidth'],
      defaultContent: [],
    },
    {
      id: 'section-6-key-services',
      name: 'Key Services',
      selector: '#main > article.grid-container > article.tabbed-link-list',
      style: 'grey',
      blocks: ['tabs-links'],
      defaultContent: [
        '#main article.tabbed-link-list header.intro',
        '#main article.tabbed-link-list .outro',
      ],
    },
  ],
};

// TRANSFORMER REGISTRY - Array of transformer functions
// Section transformer runs after cleanup (in afterTransform hook)
const transformers = [
  cleanupTransformer,
  ...(PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [sectionsTransformer] : []),
];

/**
 * Execute all page transformers for a specific hook
 * @param {string} hookName - The hook name ('beforeTransform' or 'afterTransform')
 * @param {Element} element - The DOM element to transform
 * @param {Object} payload - The payload containing { document, url, html, params }
 */
function executeTransformers(hookName, element, payload) {
  const enhancedPayload = {
    ...payload,
    template: PAGE_TEMPLATE,
  };

  transformers.forEach((transformerFn) => {
    try {
      transformerFn.call(null, hookName, element, enhancedPayload);
    } catch (e) {
      console.error(`Transformer failed at ${hookName}:`, e);
    }
  });
}

/**
 * Find all blocks on the page based on the embedded template configuration.
 * De-duplicates by element and honors instance selector order so that a block's
 * first matching selector wins (prevents .items.swiper-wrapper AND .items both firing).
 * @param {Document} document - The DOM document
 * @param {Object} template - The embedded PAGE_TEMPLATE object
 * @returns {Array} Array of block instances found on the page
 */
function findBlocksOnPage(document, template) {
  const pageBlocks = [];
  const seen = new Set();

  template.blocks.forEach((blockDef) => {
    let matched = false;
    blockDef.instances.forEach((selector) => {
      const elements = document.querySelectorAll(selector);
      elements.forEach((element) => {
        if (seen.has(element)) return;
        seen.add(element);
        matched = true;
        pageBlocks.push({
          name: blockDef.name,
          selector,
          element,
          section: blockDef.section || null,
        });
      });
    });
    if (!matched) {
      console.warn(`Block "${blockDef.name}" not found with any selector`);
    }
  });

  console.log(`Found ${pageBlocks.length} block instances on page`);
  return pageBlocks;
}

// EXPORT DEFAULT CONFIGURATION
export default {
  transform: (payload) => {
    const {
      document, url, html, params,
    } = payload;

    const main = document.body;

    // 1. beforeTransform transformers (initial cleanup)
    executeTransformers('beforeTransform', main, payload);

    // 2. Find blocks on page using embedded template
    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);

    // 3. Parse each block using registered parsers
    pageBlocks.forEach((block) => {
      if (!block.element.parentNode) return; // Already replaced by earlier parser
      const parser = parsers[block.name];
      if (parser) {
        try {
          parser(block.element, { document, url, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      } else {
        console.warn(`No parser found for block: ${block.name}`);
      }
    });

    // 4. afterTransform transformers (final cleanup + section breaks/metadata)
    executeTransformers('afterTransform', main, payload);

    // 5. WebImporter built-in rules
    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // 6. Generate sanitized path. Map root/homepage URL to `/index`.
    const rawPath = new URL(params.originalURL).pathname
      .replace(/\/$/, '')
      .replace(/\.html?$/, '');
    const path = WebImporter.FileUtils.sanitizePath(rawPath === '' ? '/index' : rawPath);

    return [{
      element: main,
      path,
      report: {
        title: document.title,
        template: PAGE_TEMPLATE.name,
        blocks: pageBlocks.map((b) => b.name),
      },
    }];
  },
};
