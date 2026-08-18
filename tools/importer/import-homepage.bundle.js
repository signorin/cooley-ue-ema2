/* eslint-disable */
var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // tools/importer/import-homepage.js
  var import_homepage_exports = {};
  __export(import_homepage_exports, {
    default: () => import_homepage_default
  });

  // tools/importer/parsers/hero-home.js
  function parse(element, { document: document2 }) {
    const tileImgs = [];
    const slots = element.querySelectorAll(".slots .slot, .js-hero-home-slots .slot");
    slots.forEach((slot) => {
      const slotImg = slot.querySelector("img");
      const slotVideo = slot.querySelector("video");
      if (slotImg && slotImg.getAttribute("src")) {
        const im = document2.createElement("img");
        im.setAttribute("src", slotImg.getAttribute("src"));
        im.setAttribute("alt", slotImg.getAttribute("alt") || "");
        tileImgs.push(im);
      } else if (slotVideo && slotVideo.getAttribute("poster")) {
        const im = document2.createElement("img");
        im.setAttribute("src", slotVideo.getAttribute("poster"));
        im.setAttribute("alt", "");
        tileImgs.push(im);
      }
    });
    const picture = element.querySelector(".slots picture, picture");
    const img = element.querySelector(".slots img, img");
    const heading = element.querySelector('h1.title, h1, .inner h1, [class*="title"] , h2');
    if (!heading && !picture && !img && tileImgs.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [];
    if (tileImgs.length > 0) {
      const imageFrag = document2.createDocumentFragment();
      imageFrag.appendChild(document2.createComment(" field:image "));
      const p = document2.createElement("p");
      tileImgs.forEach((im, i) => {
        if (i > 0) p.appendChild(document2.createTextNode(" "));
        p.appendChild(im);
      });
      imageFrag.appendChild(p);
      cells.push([imageFrag]);
    } else if (picture || img) {
      const imageFrag = document2.createDocumentFragment();
      imageFrag.appendChild(document2.createComment(" field:image "));
      imageFrag.appendChild(picture || img);
      cells.push([imageFrag]);
    }
    if (heading) {
      const textFrag = document2.createDocumentFragment();
      textFrag.appendChild(document2.createComment(" field:text "));
      const h = document2.createElement("h1");
      h.textContent = heading.textContent.replace(/\s+/g, " ").trim();
      textFrag.appendChild(h);
      cells.push([textFrag]);
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "hero-home", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-news.js
  function parse2(element, { document: document2 }) {
    const items = Array.from(element.querySelectorAll(":scope > .item, .item.swiper-slide, .item"));
    const uniqueItems = [];
    items.forEach((it) => {
      if (!uniqueItems.includes(it)) uniqueItems.push(it);
    });
    if (uniqueItems.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [];
    uniqueItems.forEach((item) => {
      const imageCell = "";
      const textFrag = document2.createDocumentFragment();
      textFrag.appendChild(document2.createComment(" field:text "));
      const title = item.querySelector("h3.item-title, .item-title, h3, h4");
      if (title) textFrag.appendChild(title);
      const meta = item.querySelector(".item-meta");
      if (meta) textFrag.appendChild(meta);
      cells.push([imageCell, [textFrag]]);
    });
    const block = WebImporter.Blocks.createBlock(document2, { name: "cards-news", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-resource.js
  function parse3(element, { document: document2 }) {
    const items = Array.from(element.querySelectorAll(":scope > li.item, li.item, :scope > .item"));
    const uniqueItems = [];
    items.forEach((it) => {
      if (!uniqueItems.includes(it)) uniqueItems.push(it);
    });
    if (uniqueItems.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [];
    uniqueItems.forEach((item) => {
      const imageCell = "";
      const textFrag = document2.createDocumentFragment();
      textFrag.appendChild(document2.createComment(" field:text "));
      const title = item.querySelector("h3.item-title, .item-title, h3, h4");
      if (title) textFrag.appendChild(title);
      const description = item.querySelector("p.item-description, .item-description, p");
      if (description) textFrag.appendChild(description);
      const cardLink = item.querySelector("a[href]");
      const ctaSpan = item.querySelector('.item-link-text, [class*="link-text"]');
      if (ctaSpan) {
        const ctaText = ctaSpan.textContent.replace(/\s+/g, " ").trim();
        if (ctaText) {
          const p = document2.createElement("p");
          if (cardLink && cardLink.getAttribute("href")) {
            const a = document2.createElement("a");
            a.setAttribute("href", cardLink.getAttribute("href"));
            a.textContent = ctaText;
            p.appendChild(a);
          } else {
            p.textContent = ctaText;
          }
          textFrag.appendChild(p);
        }
      }
      cells.push([imageCell, [textFrag]]);
    });
    const block = WebImporter.Blocks.createBlock(document2, { name: "cards-resource", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-insights.js
  function parse4(element, { document: document2 }) {
    const items = Array.from(element.querySelectorAll(":scope > li.item, li.item, :scope > .item"));
    const uniqueItems = [];
    items.forEach((it) => {
      if (!uniqueItems.includes(it)) uniqueItems.push(it);
    });
    if (uniqueItems.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [];
    uniqueItems.forEach((item) => {
      const imageCell = "";
      const textFrag = document2.createDocumentFragment();
      textFrag.appendChild(document2.createComment(" field:text "));
      const title = item.querySelector("h3.item-title, .item-title, h3, h4");
      if (title) textFrag.appendChild(title);
      const meta = item.querySelector(".item-meta");
      if (meta) textFrag.appendChild(meta);
      cells.push([imageCell, [textFrag]]);
    });
    const block = WebImporter.Blocks.createBlock(document2, { name: "cards-insights", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/video-fullwidth.js
  function parse5(element, { document: document2 }) {
    const videoEl = element.querySelector("video source[src], video[src], source[src]");
    const videoSrc = videoEl ? videoEl.getAttribute("src") || "" : "";
    const picture = element.querySelector("picture");
    const img = element.querySelector("img");
    if (!videoSrc && !picture && !img) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [];
    if (videoSrc) {
      const uriFrag = document2.createDocumentFragment();
      uriFrag.appendChild(document2.createComment(" field:uri "));
      const a = document2.createElement("a");
      a.setAttribute("href", videoSrc);
      a.textContent = videoSrc;
      uriFrag.appendChild(a);
      cells.push([uriFrag]);
    }
    if (picture || img) {
      const imgFrag = document2.createDocumentFragment();
      imgFrag.appendChild(document2.createComment(" field:placeholder_image "));
      imgFrag.appendChild(picture || img);
      cells.push([imgFrag]);
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "video-fullwidth", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/tabs-links.js
  function parse6(element, { document: document2 }) {
    const scope = element.closest(".tablist") || element.parentElement || element;
    const buttons = Array.from(element.querySelectorAll(":scope > .tablist-trigger, .tablist-trigger, button.btn--tab, button"));
    const containers = Array.from(scope.querySelectorAll(".tablist-container"));
    if (buttons.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [];
    buttons.forEach((btn, i) => {
      const titleFrag = document2.createDocumentFragment();
      titleFrag.appendChild(document2.createComment(" field:title "));
      const label = btn.textContent.replace(/\s+/g, " ").trim();
      titleFrag.appendChild(document2.createTextNode(label));
      const contentFrag = document2.createDocumentFragment();
      contentFrag.appendChild(document2.createComment(" field:content_richtext "));
      const container = containers[i];
      if (container) {
        const content = container.querySelector("ul.tablist-content, ul, .tablist-content") || container;
        contentFrag.appendChild(content);
      }
      cells.push([[titleFrag], [contentFrag]]);
    });
    const block = WebImporter.Blocks.createBlock(document2, { name: "tabs-links", cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/cooley-cleanup.js
  var TransformHook = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  function transform(hookName, element, payload) {
    if (hookName === TransformHook.beforeTransform) {
      WebImporter.DOMUtils.remove(element, [
        "#onetrust-consent-sdk",
        "#onetrust-banner-sdk",
        "#onetrust-pc-sdk",
        "#ot-fltr-modal",
        ".onetrust-pc-dark-filter",
        // Accessibility skip link — non-authorable, EDS provides its own
        "a.skiplink",
        'a[href="#main"]'
      ]);
    }
    if (hookName === TransformHook.afterTransform) {
      WebImporter.DOMUtils.remove(element, [
        "header.site-header",
        "section.site-header-search",
        "section.hamburger-menu",
        "footer.site-footer",
        ".js-blocker",
        // Accent formation videos are decorative shell chrome (hero/footer) — lines 18, 213, 622
        ".formations.js-formations",
        // Coveo search resources + stray shell elements — lines 731, 732, 739, 1013, 1017
        "link",
        "iframe",
        "noscript",
        "script",
        "input"
      ]);
    }
  }

  // tools/importer/transformers/cooley-sections.js
  var SECTION_MARKER_ATTR = "data-excat-section-id";
  function transform2(hookName, element, payload) {
    const sections = payload.template.sections || [];
    if (hookName === "beforeTransform") {
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        if (i === 0 && !section.style) continue;
        const sectionEl = element.querySelector(section.selector);
        if (!sectionEl) continue;
        const hr = document.createElement("hr");
        if (section.style) hr.setAttribute(SECTION_MARKER_ATTR, section.id);
        sectionEl.before(hr);
      }
    }
    if (hookName === "afterTransform") {
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        if (!section.style) continue;
        const marker = element.querySelector(`[${SECTION_MARKER_ATTR}="${section.id}"]`);
        const anchor = marker || element.querySelector(section.selector);
        if (!anchor) continue;
        const metadataBlock = WebImporter.Blocks.createBlock(document, {
          name: "Section Metadata",
          cells: { style: section.style }
        });
        anchor.after(metadataBlock);
        if (marker) {
          marker.removeAttribute(SECTION_MARKER_ATTR);
          if (i === 0) marker.remove();
        }
      }
    }
  }

  // tools/importer/import-homepage.js
  var parsers = {
    "hero-home": parse,
    "cards-news": parse2,
    "cards-resource": parse3,
    "cards-insights": parse4,
    "video-fullwidth": parse5,
    "tabs-links": parse6
  };
  var PAGE_TEMPLATE = {
    name: "homepage",
    description: "Cooley.com homepage with full-width hero (video), firm news teaser carousel, resource three-up cards, condensed featured media, full-width video, and tabbed practice link list",
    urls: [
      "https://www.cooley.com/"
    ],
    blocks: [
      {
        name: "hero-home",
        instances: ["#main > article.grid-container > header.hero-home"]
      },
      {
        name: "cards-news",
        instances: [
          "#main article.firm-news-teaser-list .items.swiper-wrapper",
          "#main article.firm-news-teaser-list .items"
        ]
      },
      {
        name: "cards-resource",
        instances: ["#main article.resource-threeup-cards ul.items"]
      },
      {
        name: "cards-insights",
        instances: ["#main article.condensed-featured-media ul.items"]
      },
      {
        name: "video-fullwidth",
        instances: ["#main > article.grid-container > article.video-full-width"]
      },
      {
        name: "tabs-links",
        instances: ["#main article.tabbed-link-list .tablist-items"]
      }
    ],
    sections: [
      {
        id: "section-1-hero",
        name: "Hero",
        selector: "#main > article.grid-container > header.hero-home.js-hero-home",
        style: null,
        blocks: ["hero-home"],
        defaultContent: []
      },
      {
        id: "section-2-firm-news",
        name: "Firm News",
        selector: "#main > article.grid-container > article.firm-news-teaser-list",
        style: null,
        blocks: ["cards-news"],
        defaultContent: ["#main article.firm-news-teaser-list header.intro"]
      },
      {
        id: "section-3-resources",
        name: "Resources",
        selector: "#main > article.grid-container > article.resource-threeup-cards",
        style: null,
        blocks: ["cards-resource"],
        defaultContent: ["#main article.resource-threeup-cards header.intro"]
      },
      {
        id: "section-4-insights",
        name: "Latest Insights",
        selector: "#main > article.grid-container > article.condensed-featured-media",
        style: "dark",
        blocks: ["cards-insights"],
        defaultContent: [
          "#main article.condensed-featured-media header.intro",
          "#main article.condensed-featured-media .outro"
        ]
      },
      {
        id: "section-5-video",
        name: "Video",
        selector: "#main > article.grid-container > article.video-full-width",
        style: null,
        blocks: ["video-fullwidth"],
        defaultContent: []
      },
      {
        id: "section-6-key-services",
        name: "Key Services",
        selector: "#main > article.grid-container > article.tabbed-link-list",
        style: "grey",
        blocks: ["tabs-links"],
        defaultContent: [
          "#main article.tabbed-link-list header.intro",
          "#main article.tabbed-link-list .outro"
        ]
      }
    ]
  };
  var transformers = [
    transform,
    ...PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [transform2] : []
  ];
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), {
      template: PAGE_TEMPLATE
    });
    transformers.forEach((transformerFn) => {
      try {
        transformerFn.call(null, hookName, element, enhancedPayload);
      } catch (e) {
        console.error(`Transformer failed at ${hookName}:`, e);
      }
    });
  }
  function findBlocksOnPage(document2, template) {
    const pageBlocks = [];
    const seen = /* @__PURE__ */ new Set();
    template.blocks.forEach((blockDef) => {
      let matched = false;
      blockDef.instances.forEach((selector) => {
        const elements = document2.querySelectorAll(selector);
        elements.forEach((element) => {
          if (seen.has(element)) return;
          seen.add(element);
          matched = true;
          pageBlocks.push({
            name: blockDef.name,
            selector,
            element,
            section: blockDef.section || null
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
  var import_homepage_default = {
    transform: (payload) => {
      const {
        document: document2,
        url,
        html,
        params
      } = payload;
      const main = document2.body;
      executeTransformers("beforeTransform", main, payload);
      const pageBlocks = findBlocksOnPage(document2, PAGE_TEMPLATE);
      pageBlocks.forEach((block) => {
        if (!block.element.parentNode) return;
        const parser = parsers[block.name];
        if (parser) {
          try {
            parser(block.element, { document: document2, url, params });
          } catch (e) {
            console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
          }
        } else {
          console.warn(`No parser found for block: ${block.name}`);
        }
      });
      executeTransformers("afterTransform", main, payload);
      const hr = document2.createElement("hr");
      main.appendChild(hr);
      WebImporter.rules.createMetadata(main, document2);
      WebImporter.rules.transformBackgroundImages(main, document2);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const rawPath = new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html?$/, "");
      const path = WebImporter.FileUtils.sanitizePath(rawPath === "" ? "/index" : rawPath);
      return [{
        element: main,
        path,
        report: {
          title: document2.title,
          template: PAGE_TEMPLATE.name,
          blocks: pageBlocks.map((b) => b.name)
        }
      }];
    }
  };
  return __toCommonJS(import_homepage_exports);
})();
