---
layout: single
title: "Module 2: OCR for Historical East Asian Materials"
permalink: /databaseworkflows/module-2-ocr/
toc: false
classes: wide article-page
sidebar:
  nav: "main_sidebar"
header:
    overlay_image: /assets/images/mp_hero_grid_layered_slate.png
---

{% include workflow_styles.html %}

<div class="module-header">
  <div class="module-header-meta">
    <span>DIFFICULTY</span>
    <strong>Intermediate</strong>
  </div>
  <div class="module-header-meta">
    <span>ESTIMATED TIME</span>
    <strong>30 Minutes</strong>
  </div>
  <div class="module-header-meta">
    <span>PREREQUISITES</span>
    <strong><a href="/databaseworkflows/module-1-script-handling/">Module 1: Script Handling</a></strong>
  </div>
  <div class="module-header-meta">
    <span>DATASET</span>
    <span class="module-badge badge-dataset">CCVG Gazetteer Data</span>
  </div>
</div>

<div id="toc-rail">
  <div class="toc-track"></div>
  <div class="toc-progress" id="toc-progress-bar"></div>
  <div class="toc-dot-wrap"><a class="toc-dot" data-target="introduction"></a><span class="toc-tooltip">Introduction</span></div>
  <div class="toc-dot-wrap"><a class="toc-dot" data-target="prerequisites"></a><span class="toc-tooltip">Prerequisites</span></div>
  <div class="toc-dot-wrap"><a class="toc-dot" data-target="evaluating-and-preparing-scans"></a><span class="toc-tooltip">Preparing Scans</span></div>
  <div class="toc-dot-wrap"><a class="toc-dot" data-target="image-pre-processing-requirements"></a><span class="toc-tooltip">Pre-Processing</span></div>
  <div class="toc-dot-wrap"><a class="toc-dot" data-target="batch-processing-with-imagemagick"></a><span class="toc-tooltip">ImageMagick Batch</span></div>
  <div class="toc-dot-wrap"><a class="toc-dot" data-target="selecting-the-right-ocr-tool"></a><span class="toc-tooltip">Selecting Tools</span></div>
  <div class="toc-dot-wrap"><a class="toc-dot" data-target="combining-tools-tesseract-and-google-vision"></a><span class="toc-tooltip">Combining Tools</span></div>
  <div class="toc-dot-wrap"><a class="toc-dot" data-target="llm-post-correction"></a><span class="toc-tooltip">LLM Post-Correction</span></div>
  <div class="toc-dot-wrap"><a class="toc-dot" data-target="when-not-to-use-ocr"></a><span class="toc-tooltip">When NOT to OCR</span></div>
  <div class="toc-dot-wrap"><a class="toc-dot" data-target="further-reading"></a><span class="toc-tooltip">Further Reading</span></div>
</div>

<h2 id="introduction">Introduction</h2>

To make historical documents computationally useful—whether for full-text search, metadata extraction, or natural language processing—the images must first be converted into machine-readable text. This process, Optical Character Recognition (OCR), is often the most significant bottleneck in building a digital archive.

Historians working with digital methods are frequently confronted with PDF files or image scans that need to be converted to plain text. However, OCR becomes trickier when dealing with historical fonts, traditional characters, vertical text layouts, damaged manuscripts, or low-quality scans [1].

With the encoding and script behaviors established in <a href="/databaseworkflows/module-1-script-handling/">Module 1</a>, this module focuses entirely on the image-to-text pipeline. It covers how to prepare scans, select the right OCR tool for Chinese, Tibetan, and Mongolian materials, run batch processes, and use Large Language Models (LLMs) to post-correct the output. We will frame this discussion around the challenges of digitizing the physical gazetteers that underlie our sample CCVG dataset.

<div class="module-toc">
  <h4>In this module</h4>
  <ul>
    <li><a href="#evaluating-and-preparing-scans">Evaluating and Preparing Scans</a></li>
    <li><a href="#selecting-the-right-ocr-tool">Selecting the Right OCR Tool</a></li>
    <li><a href="#combining-tools-tesseract-and-google-vision">Combining Tools: Tesseract and Google Vision</a></li>
    <li><a href="#llm-post-correction">LLM Post-Correction</a></li>
    <li><a href="#when-not-to-use-ocr">When Not to Use OCR</a></li>
  </ul>
</div>

<h2 id="prerequisites">Prerequisites</h2>

Before beginning this module, you should:
* Understand the differences between Simplified and Traditional Chinese encoding, as well as the challenges of the UTF-8 BOM (covered in Module 1).
* Have a basic familiarity with the command line (Terminal on macOS/Linux, PowerShell on Windows).
* Have <a href="https://imagemagick.org">ImageMagick</a> installed if you intend to follow the image pre-processing steps.

<h2 id="evaluating-and-preparing-scans">Evaluating and Preparing Scans</h2>

Before you can extract the structured data we saw in the CCVG sample dataset, you must start with the raw images. The CCVG project digitized thousands of physical village gazetteers. Poor scan quality is the single leading cause of OCR failure. Before running any OCR software on such materials, scans must be evaluated and optimized.

<h3 id="image-pre-processing-requirements">Image Pre-Processing Requirements</h3>

1. **Resolution:** Ensure all scans are at a minimum of 300 DPI. For documents with small print, dense characters, or significant fading—common in mimeographed internal circulars from the 1950s–1970s—400 or 600 DPI is strongly recommended.
2. **Deskewing:** Pages scanned at even a slight angle (as little as 2°) will produce significantly more OCR errors, as the software struggles to identify text baselines.
3. **Contrast Enhancement:** Increasing contrast sharpens the boundary between ink and paper. For faded documents, converting to grayscale first and then applying a threshold (converting to pure black and white) often produces better results than working with the full-color scan.

<h3 id="batch-processing-with-imagemagick">Batch Processing with ImageMagick</h3>

If your scanning software does not automatically deskew and enhance contrast, you can use the free, open-source command-line tool ImageMagick to batch-process an entire folder of images.

To convert a folder of TIFF scans to grayscale, deskew them, and increase contrast, open your terminal and run:

```bash
mogrify -colorspace Gray -deskew 40% -contrast-stretch 5%x5% *.tiff
```

<h2 id="selecting-the-right-ocr-tool">Selecting the Right OCR Tool</h2>

Standard OCR tools often struggle with the mixture of traditional and simplified characters, vertical text layouts, and poor print quality found in historical East Asian documents. The right tool depends on your source material, budget, and technical comfort level.

<div class="tool-grid">
  <div class="tool-card">
    <span class="tool-tag free">Open Source</span>
    <h4>OCRmyPDF (Tesseract)</h4>
    <p>Best for accessible batch processing. Command-line tool that wraps Tesseract to create searchable PDFs. Can load Simplified and Traditional models simultaneously.</p>
  </div>
  <div class="tool-card">
    <span class="tool-tag free">Open Source</span>
    <h4>PaddleOCR</h4>
    <p>Best for high-accuracy Chinese. Outperforms Tesseract on complex document layouts and vertical text. Requires Python knowledge to implement effectively.</p>
  </div>
  <div class="tool-card">
    <span class="tool-tag freemium">Freemium</span>
    <h4>Transkribus</h4>
    <p>Best for manuscripts and low-resource scripts (Tibetan, Mongolian). Allows researchers to train custom models on their own transcribed ground-truth data.</p>
  </div>
  <div class="tool-card">
    <span class="tool-tag paid">Commercial</span>
    <h4>ABBYY FineReader</h4>
    <p>Best commercial option. Robust out-of-the-box support for complex, multi-column layouts and mixed-language documents without requiring command-line skills.</p>
  </div>
</div>

For early PRC documents (like those in the CCVG dataset), you can load both Simplified and Traditional Chinese language models simultaneously in OCRmyPDF to handle mixed-script texts:

```bash
ocrmypdf -l chi_sim+chi_tra input.pdf output_searchable.pdf
```

<h2 id="combining-tools-tesseract-and-google-vision">Combining Tools: Tesseract and Google Vision</h2>

As noted in a comprehensive *Programming Historian* lesson by Isabelle Gribomont, different OCR tools have different strengths. Tesseract is excellent at layout detection (identifying columns, paragraphs, and reading order) but can struggle with complex historical characters. Google Cloud Vision is highly accurate at character recognition but has poor layout detection capabilities [1].

If your material includes complex characters and layouts (such as the multi-column statistical tables found in the CCVG gazetteers), combining both tools can yield superior results. The approach involves using Tesseract to identify the bounding boxes of text regions, and then passing those specific regions to Google Vision for character recognition [1]. 

<blockquote class="workflow-note">
  <span class="callout-label">Note</span>
  <p>Google Cloud Vision is a commercial API. While it offers free credits for new accounts, processing large archives will incur costs. Always check the current pricing before running batch jobs on thousands of pages.</p>
</blockquote>

<h2 id="llm-post-correction">LLM Post-Correction</h2>

Even with the best OCR engines, historical documents will produce errors—misrecognized characters, dropped punctuation, and scrambled formatting. Recent research demonstrates that Large Language Models (LLMs) can be highly effective at post-correcting OCR output by using their semantic understanding of the language to infer what the garbled text *should* say [2].

Instead of manually correcting every page, you can pass the raw OCR text to an LLM via API with a specific prompt.

<blockquote class="workflow-example">
  <span class="callout-label">Example Prompt for Chinese OCR Correction</span>
  <p>"You are an expert in modern Chinese history. The following text is the raw OCR output of a historical gazetteer from 1985. It contains OCR errors, missing punctuation, and incorrect characters. Please reconstruct and correct the text based on the context. Do not summarize or alter the meaning; only fix the OCR transcription errors. Output only the corrected Chinese text."</p>
</blockquote>

<blockquote class="workflow-warning">
  <span class="callout-label">Warning: Hallucination Risk</span>
  <p>If the OCR text is too degraded, the LLM may "hallucinate" and invent plausible-sounding historical text to fill the gaps [3]. LLM post-correction should be treated as a first draft. Researchers must still verify the corrected text against the original image, particularly for dates, names, and numbers, which LLMs are prone to "correcting" erroneously.</p>
</blockquote>

<h2 id="when-not-to-use-ocr">When Not to Use OCR</h2>

OCR is not a universal solution. Before investing weeks into an OCR pipeline for a project like the CCVG, consider whether it is the right approach.

1. **A high-quality digital edition already exists:** For classical Chinese texts, check the Chinese Text Project (CText) or Kanripo before attempting to OCR a scanned block-printed edition.
2. **The text is highly degraded manuscript:** If the handwriting is idiosyncratic and the corpus is small, manual transcription will be faster and more accurate than attempting to train a custom HTR model.
3. **You only need metadata:** If you only need the title, author, and date of a gazetteer, do not OCR the entire 500-page book. Run OCR only on the title page and copyright page to extract the necessary metadata, saving massive amounts of processing time.

<div class="further-reading">
  <h3>Further Reading</h3>
  <ul>
    <li><a href="https://programminghistorian.org/en/lessons/ocr-with-google-vision-and-tesseract">OCR with Google Vision API and Tesseract</a> (Programming Historian)</li>
    <li><a href="https://programminghistorian.org/en/lessons/working-with-batches-of-pdf-files">Working with batches of PDF files</a> (Programming Historian)</li>
  </ul>
  <div class="dataset-cite">
    <strong>Dataset Used in This Module</strong>
    East Asian Library, University Library System, University of Pittsburgh. <em>Contemporary Chinese Village Gazetteer Data (CCVG Data)</em>. Accessed June 2026. <a href="https://www.chinesevillagedata.library.pitt.edu/">https://www.chinesevillagedata.library.pitt.edu/</a>
  </div>
</div>

<div class="module-nav-footer">
  <a href="/databaseworkflows/module-1-script-handling/" class="module-nav-btn">
    <span class="nav-label">← Previous</span>
    <span class="nav-title">Module 1: Script Handling</span>
  </a>
  <a href="/databaseworkflows/module-3-extraction/" class="module-nav-btn">
    <span class="nav-label">Next →</span>
    <span class="nav-title">Module 3: NER & Extraction</span>
  </a>
</div>

<h2 id="references">References</h2>

[1] Gribomont, Isabelle. "OCR with Google Vision API and Tesseract." *Programming Historian* 12 (2023). https://doi.org/10.46430/phen0109

[2] ACL Anthology. "Leveraging LLMs for Post-OCR Correction of Historical Newspapers." 2024. https://aclanthology.org/2024.lt4hala-1.14/

[3] arXiv. "OCR Error Post-Correction with LLMs in Historical Documents." February 3, 2025. https://arxiv.org/html/2502.01205v1
