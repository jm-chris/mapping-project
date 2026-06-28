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

<div id="toc-rail">
  <div class="toc-track"></div>
  <div class="toc-progress" id="toc-progress-bar"></div>
  <div class="toc-dot-wrap"><a class="toc-dot h2-dot" data-target="introduction"></a><span class="toc-tooltip">Introduction</span></div>
  <div class="toc-dot-wrap"><a class="toc-dot h2-dot" data-target="evaluating-and-preparing-scans"></a><span class="toc-tooltip">Preparing Scans</span></div>
  <div class="toc-dot-wrap"><a class="toc-dot" data-target="image-pre-processing-requirements"></a><span class="toc-tooltip">Pre-Processing</span></div>
  <div class="toc-dot-wrap"><a class="toc-dot" data-target="batch-processing-with-imagemagick"></a><span class="toc-tooltip">ImageMagick Batch</span></div>
  <div class="toc-dot-wrap"><a class="toc-dot h2-dot" data-target="selecting-the-right-ocr-tool"></a><span class="toc-tooltip">Selecting Tools</span></div>
  <div class="toc-dot-wrap"><a class="toc-dot" data-target="1-ocrmypdf-best-for-accessible-batch-processing"></a><span class="toc-tooltip">OCRmyPDF</span></div>
  <div class="toc-dot-wrap"><a class="toc-dot" data-target="2-paddleocr-best-for-high-accuracy-chinese"></a><span class="toc-tooltip">PaddleOCR</span></div>
  <div class="toc-dot-wrap"><a class="toc-dot" data-target="3-transkribus-best-for-manuscripts-and-tibetanmongolian"></a><span class="toc-tooltip">Transkribus</span></div>
  <div class="toc-dot-wrap"><a class="toc-dot" data-target="4-abbyy-finereader-best-commercial-option"></a><span class="toc-tooltip">ABBYY FineReader</span></div>
  <div class="toc-dot-wrap"><a class="toc-dot h2-dot" data-target="llm-post-correction"></a><span class="toc-tooltip">LLM Post-Correction</span></div>
  <div class="toc-dot-wrap"><a class="toc-dot" data-target="the-post-correction-workflow"></a><span class="toc-tooltip">Correction Workflow</span></div>
  <div class="toc-dot-wrap"><a class="toc-dot h2-dot" data-target="when-not-to-use-ocr"></a><span class="toc-tooltip">When NOT to OCR</span></div>
  <div class="toc-dot-wrap"><a class="toc-dot h2-dot" data-target="references"></a><span class="toc-tooltip">References</span></div>
</div>

<h2 id="introduction">Introduction</h2>

To make historical documents computationally useful—whether for full-text search, metadata extraction, or natural language processing—the images must first be converted into machine-readable text. This process, Optical Character Recognition (OCR), is often the most significant bottleneck in building a digital archive.

With the encoding and script behaviors established in <a href="/databaseworkflows/module-1-script-handling/">Module 1</a>, this module focuses entirely on the image-to-text pipeline. It covers how to prepare scans, select the right OCR tool for Chinese, Tibetan, and Mongolian materials, run batch processes, and use Large Language Models (LLMs) to post-correct the output.

<h2 id="evaluating-and-preparing-scans">Evaluating and Preparing Scans</h2>

Poor scan quality is the single leading cause of OCR failure. Before running any OCR software, scans must be evaluated and optimized. 

<h3 id="image-pre-processing-requirements">Image Pre-Processing Requirements</h3>

1.  **Resolution:** Ensure all scans are at a minimum of 300 DPI. For documents with small print, dense characters, or significant fading—common in mimeographed internal circulars from the 1950s–1970s—400 or 600 DPI is strongly recommended.
2.  **Deskewing:** Pages scanned at even a slight angle (as little as 2°) will produce significantly more OCR errors, as the software struggles to identify text baselines.
3.  **Contrast Enhancement:** Increasing contrast sharpens the boundary between ink and paper. For faded documents, converting to grayscale first and then applying a threshold (converting to pure black and white) often produces better results than working with the full-color scan.

<h3 id="batch-processing-with-imagemagick">Batch Processing with ImageMagick</h3>

If your scanning software does not automatically deskew and enhance contrast, you can use the free, open-source command-line tool [ImageMagick](https://imagemagick.org) to batch-process an entire folder of images.

To convert a folder of TIFF scans to grayscale, deskew them, and increase contrast, open your terminal and run:

```bash
mogrify -colorspace Gray -deskew 40% -contrast-stretch 5%x5% *.tiff
```

<h2 id="selecting-the-right-ocr-tool">Selecting the Right OCR Tool</h2>

Standard OCR tools often struggle with the mixture of traditional and simplified characters, vertical text layouts, and poor print quality found in historical East Asian documents. The right tool depends on your source material, budget, and technical comfort level.

<h3 id="1-ocrmypdf-best-for-accessible-batch-processing">1. OCRmyPDF (Best for Accessible Batch Processing)</h3>
[OCRmyPDF](https://ocrmypdf.readthedocs.io/) is a free, open-source command-line tool that uses the Tesseract OCR engine. It is ideal for batch-converting folders of images into searchable PDFs. 

Crucially for early PRC documents, you can load both Simplified and Traditional Chinese language models simultaneously to handle mixed-script texts:

```bash
ocrmypdf -l chi_sim+chi_tra input.pdf output_searchable.pdf
```

To batch-process an entire folder of PDFs:
```bash
for f in /archive/1966/zhongfa/*.pdf; do
  ocrmypdf -l chi_sim+chi_tra "$f" "/archive/1966/zhongfa/ocr/$(basename "$f")";
done
```

<h3 id="2-paddleocr-best-for-high-accuracy-chinese">2. PaddleOCR (Best for High-Accuracy Chinese)</h3>
[PaddleOCR](https://github.com/PaddlePaddle/PaddleOCR), developed by Baidu, is an open-source framework that consistently outperforms Tesseract on Chinese text [1]. Its latest versions (v3.0 and PaddleOCR-VL) utilize advanced vision-language models to achieve over 96% accuracy on complex document layouts [2]. It is highly recommended for researchers comfortable with Python, as it handles vertical text and dense historical layouts exceptionally well.

<h3 id="3-transkribus-best-for-manuscripts-and-tibetanmongolian">3. Transkribus (Best for Manuscripts and Tibetan/Mongolian)</h3>
[Transkribus](https://www.transkribus.org/) is a platform specifically designed for Handwritten Text Recognition (HTR) and historical documents [3]. It is the premier choice for:
*   Handwritten Chinese archival materials.
*   **Tibetan manuscripts:** Transkribus hosts models developed by the University of Vienna capable of reading complex Ume and Uchan scripts [4].
*   **Mongolian and Manchu:** While support is still emerging, Transkribus allows researchers to train custom models on their own transcribed ground-truth data, making it the most viable platform for low-resource historical scripts.

<h3 id="4-abbyy-finereader-best-commercial-option">4. ABBYY FineReader (Best Commercial Option)</h3>
For researchers with a budget, ABBYY FineReader remains the industry standard for complex, multi-column layouts and mixed-language documents. It offers robust out-of-the-box support for both Traditional and Simplified Chinese, though it lacks the custom-training capabilities of Transkribus for manuscripts.

<h2 id="llm-post-correction">LLM Post-Correction</h2>

Even with the best OCR engines, historical documents will produce errors—misrecognized characters, dropped punctuation, and scrambled formatting. 

Recent research demonstrates that Large Language Models (LLMs) can be highly effective at post-correcting OCR output by using their semantic understanding of the language to infer what the garbled text *should* say [5].

<h3 id="the-post-correction-workflow">The Post-Correction Workflow</h3>

Instead of manually correcting every page, you can pass the raw OCR text to an LLM via API with a specific prompt. 

<div class="workflow-note">
<strong>Example Prompt for Chinese OCR Correction</strong><br>
"You are an expert in modern Chinese history. The following text is the raw OCR output of a historical document from 1966. It contains OCR errors, missing punctuation, and incorrect characters. Please reconstruct and correct the text based on the context. Do not summarize or alter the meaning; only fix the OCR transcription errors. Output only the corrected Chinese text."
</div>

<div class="workflow-warning">
<strong>Hallucination Risk & Verification</strong><br>
If the OCR text is too degraded, the LLM may "hallucinate" and invent plausible-sounding historical text to fill the gaps [6]. LLM post-correction should be treated as a first draft. Researchers must still verify the corrected text against the original image, particularly for dates, names, and numbers, which LLMs are prone to "correcting" erroneously.
</div>

<h2 id="when-not-to-use-ocr">When Not to Use OCR</h2>

OCR is not a universal solution. Before investing weeks into an OCR pipeline, consider whether it is the right approach for your material.

1.  **A high-quality digital edition already exists:** For classical Chinese texts, check the Chinese Text Project (CText) or Kanripo before attempting to OCR a scanned block-printed edition.
2.  **The text is highly degraded manuscript:** If the handwriting is idiosyncratic and the corpus is small, manual transcription will be faster and more accurate than attempting to train a custom HTR model.
3.  **You only need metadata:** If you only need the title, author, and date of a document, do not OCR the entire 50-page file. Run OCR only on the first page to extract the necessary metadata, saving massive amounts of processing time.

<h2 id="references">References</h2>

[1] PaddlePaddle. "PaddleOCR GitHub Repository." Accessed June 27, 2026. https://github.com/PADDLEPADDLE/PADDLEOCR

[2] arXiv. "PaddleOCR 3.0 Technical Report." July 8, 2025. https://arxiv.org/html/2507.05595v1

[3] Transkribus. "Unlock History." Accessed June 27, 2026. https://www.transkribus.org/

[4] Buddhist Digital Resource Center. "Transforming Tibetan Text Digitization." August 28, 2024. https://www.bdrc.io/blog/2024/08/28/transforming-tibetan-text-digitization-bdrcs-groundbreaking-ocr-project/

[5] ACL Anthology. "Leveraging LLMs for Post-OCR Correction of Historical Newspapers." 2024. https://aclanthology.org/2024.lt4hala-1.14/

[6] arXiv. "OCR Error Post-Correction with LLMs in Historical Documents." February 3, 2025. https://arxiv.org/html/2502.01205v1
