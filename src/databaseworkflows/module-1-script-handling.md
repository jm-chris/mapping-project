---
layout: single
title: "Module 1: Script Handling for Computational Research"
permalink: /databaseworkflows/module-1-script-handling/
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
  <div class="toc-dot-wrap"><a class="toc-dot h2-dot" data-target="unicode-and-encoding-pitfalls"></a><span class="toc-tooltip">Encoding Pitfalls</span></div>
  <div class="toc-dot-wrap"><a class="toc-dot" data-target="the-utf-8-bom-problem"></a><span class="toc-tooltip">UTF-8 BOM</span></div>
  <div class="toc-dot-wrap"><a class="toc-dot" data-target="han-unification-and-variant-codepoints"></a><span class="toc-tooltip">Han Unification</span></div>
  <div class="toc-dot-wrap"><a class="toc-dot h2-dot" data-target="the-character-simplification-problem"></a><span class="toc-tooltip">Character Simplification</span></div>
  <div class="toc-dot-wrap"><a class="toc-dot" data-target="second-round-simplified-characters"></a><span class="toc-tooltip">Second-Round Chars</span></div>
  <div class="toc-dot-wrap"><a class="toc-dot" data-target="mixed-script-documents"></a><span class="toc-tooltip">Mixed-Script Docs</span></div>
  <div class="toc-dot-wrap"><a class="toc-dot h2-dot" data-target="script-specific-data-challenges"></a><span class="toc-tooltip">Script Challenges</span></div>
  <div class="toc-dot-wrap"><a class="toc-dot" data-target="tibetan-stacked-consonants"></a><span class="toc-tooltip">Tibetan</span></div>
  <div class="toc-dot-wrap"><a class="toc-dot" data-target="mongolian-and-manchu-vertical-encoding"></a><span class="toc-tooltip">Mongolian & Manchu</span></div>
  <div class="toc-dot-wrap"><a class="toc-dot" data-target="uyghur-right-to-left-directionality"></a><span class="toc-tooltip">Uyghur</span></div>
  <div class="toc-dot-wrap"><a class="toc-dot h2-dot" data-target="llms-and-romanization"></a><span class="toc-tooltip">LLMs & Romanization</span></div>
  <div class="toc-dot-wrap"><a class="toc-dot h2-dot" data-target="references"></a><span class="toc-tooltip">References</span></div>
</div>

<h2 id="introduction">Introduction</h2>

For humanities researchers, the transition from reading a text to treating it as data often reveals invisible structural problems. A character that looks correct on screen may fail to match an identical-looking character in a search query; a spreadsheet of archival data may sort unpredictably; or a script that renders perfectly in a word processor may break a Python script. 

This module addresses the computational layer of working with Chinese, Tibetan, Mongolian, Manchu, and Uyghur materials in a data pipeline. It focuses on the encoding, normalization, and script-specific behaviors that researchers must understand to build robust digital workflows.

<h2 id="unicode-and-encoding-pitfalls">Unicode and Encoding Pitfalls</h2>

The foundation of modern digital text is Unicode, a standard that assigns a unique number (codepoint) to every character in almost every written language. However, the implementation of Unicode—specifically the UTF-8 encoding scheme—introduces several common pitfalls for East Asian studies.

<h3 id="the-utf-8-bom-problem">The UTF-8 BOM Problem</h3>
When saving a CSV file in Excel to be processed by a Python script or uploaded to a database, researchers often encounter an invisible character at the very beginning of the file. This is the Byte Order Mark (BOM). While intended to signal that a file is encoded in UTF-8, many command-line tools and programming languages do not expect it and will read the first column header incorrectly (e.g., `ï»¿ID` instead of `ID`).

<div class="workflow-tip">
<strong>Best Practice</strong>
Always save data files as "UTF-8 without BOM." If using Python to read a CSV, specify the encoding explicitly to strip it:
<code>df = pd.read_csv('data.csv', encoding='utf-8-sig')</code>
</div>

<h3 id="han-unification-and-variant-codepoints">Han Unification and Variant Codepoints</h3>
To save space in the early days of Unicode, the consortium implemented "Han Unification," merging Chinese, Japanese, and Korean (CJK) characters that shared a common historical origin into single codepoints [1]. This means that the character for "bone" (骨) shares the same underlying numeric value in Chinese and Japanese, even though the regional typographic conventions differ slightly.

However, historical texts often use variant characters (異體字) that *were* assigned separate codepoints. For example, the standard character 爲 (U+9232) and its variant 為 (U+70BA) look very similar and mean the same thing, but to a computer, they are completely different entities [2]. When searching a database or counting word frequencies, these variants will not match unless they are explicitly normalized.

<h2 id="the-character-simplification-problem">The Character Simplification Problem</h2>

The simplification of Chinese characters introduces a profound discontinuity in historical data pipelines. A researcher working with documents from the People's Republic of China (PRC) must navigate not just standard simplification, but historical anomalies.

<h3 id="second-round-simplified-characters">Second-Round Simplified Characters</h3>
The standard simplified characters used today are the "First-Round" simplifications. However, between 1977 and 1986, the PRC promulgated a "Second Round" of simplified characters (二简字) [3]. These characters appear frequently in grassroots documents, factory records, and internal circulars from that decade. 

Because the second round was ultimately rescinded, many of these characters were never added to standard digital fonts or Unicode blocks. For example, the second-round simplification of 菜 to 𦬁 or 酒 to 氿 [4].

<div class="workflow-warning">
<strong>The Pipeline Challenge</strong>
Standard OCR engines will either fail to recognize second-round characters or "correct" them to entirely different characters that share a visual resemblance. Furthermore, if transcribed accurately, they will not match keyword searches for the standard character. Maintain the original scanned image as the authoritative record, but normalize the underlying searchable text layer to standard first-round simplified characters.
</div>

<h3 id="mixed-script-documents">Mixed-Script Documents</h3>
Early PRC documents (1950s–1960s) frequently mix traditional and simplified characters within the same sentence, as typographic standards were still in flux. When setting up an OCR pipeline, it is essential to load both Traditional and Simplified language models simultaneously (e.g., `-l chi_sim+chi_tra` in Tesseract) to prevent the engine from forcing a uniform script assumption onto a mixed text.

<h2 id="script-specific-data-challenges">Script-Specific Data Challenges</h2>

Beyond Chinese, researchers working with the languages of the Qing empire and its successor states face distinct computational hurdles.

<h3 id="tibetan-stacked-consonants">Tibetan: Stacked Consonants</h3>
The Tibetan script is written horizontally from left to right, but syllables are formed by stacking consonants vertically around a root letter. In Unicode, this is achieved using a base consonant followed by special "subjoined" consonant codepoints that render beneath it [5]. 

Because the vertical stacking is handled by the font rendering engine rather than being precomposed into single blocks, OCR systems often struggle to determine the correct sequence of base and subjoined characters, leading to high error rates in historical manuscript recognition [6].

<h3 id="mongolian-and-manchu-vertical-encoding">Mongolian and Manchu: Vertical Encoding Quirks</h3>
Traditional Mongolian and Manchu are written vertically from top to bottom, with lines progressing from left to right. However, the Unicode standard encodes Mongolian as a horizontal left-to-right script, relying on the application (like a web browser or word processor) to rotate the text 90 degrees for display [7].

This creates significant friction in data pipelines. When extracting text from an OCR engine that reads vertically and pasting it into a spreadsheet that assumes horizontal text, the directional flow can break. Furthermore, Manchu suffers from a severe lack of tooling; while modern OCR models for Chinese are highly accurate, Manchu remains a low-resource language requiring custom-trained models [8].

<h3 id="uyghur-right-to-left-directionality">Uyghur: Right-to-Left Directionality</h3>
Uyghur is written in a modified Arabic script, reading from right to left. When processing Uyghur text in a data pipeline (such as a CSV file or a Python Pandas dataframe), the mixing of right-to-left Uyghur text with left-to-right English metadata or numbers creates bidirectional (BiDi) text rendering issues [9].

While the underlying string of characters remains correct in memory, it will often display incorrectly on screen, making manual data cleaning difficult. Researchers must ensure their database interfaces and web frontends explicitly declare the text direction (e.g., `dir="rtl"` in HTML) for Uyghur fields.

<h2 id="llms-and-romanization">LLMs and Romanization</h2>

Large Language Models (LLMs) have fundamentally changed data extraction workflows, but their competence varies drastically by script.

*   **Modern Chinese:** Highly competent. Models like GPT-4o and Claude 3.5 Sonnet excel at reading, segmenting, and extracting data from modern Chinese text.
*   **Classical Chinese:** Moderately competent but prone to hallucination. LLMs can struggle with the dense, unpunctuated nature of classical texts, sometimes inventing characters to complete a perceived pattern.
*   **Tibetan, Mongolian, and Uyghur:** Low competence. Because these languages represent a tiny fraction of the models' training data, LLMs frequently fail at complex extraction tasks in these scripts.

<div class="workflow-note">
<strong>Normalization Strategy</strong>
When using LLMs for data enrichment on low-resource scripts, transliterate the text into a standardized Latin-alphabet romanization *before* passing it to the LLM. Normalize all romanized fields to a single standard (e.g., Pinyin for Chinese, Wylie for Tibetan) before attempting to link entities or merge databases.
</div>

<h2 id="references">References</h2>

[1] Unicode Consortium. "FAQ - Chinese and Japanese." Accessed June 27, 2026. http://www.unicode.org/faq/han_cjk.html

[2] Typotheque. "Understanding CJK regional character variants." Accessed June 27, 2026. https://www.typotheque.com/articles/understanding-cjk-regional-character-variants

[3] Wikipedia. "Second round of simplified Chinese characters." Accessed June 27, 2026. https://en.wikipedia.org/wiki/Second_round_of_simplified_Chinese_characters

[4] The Language Closet. "That time China tried to simplify characters… again." Accessed June 27, 2026. https://thelanguagecloset.com/2023/10/07/that-time-china-tried-to-simplify-characters-again/

[5] BabelStone Blog. "Precomposed Tibetan Part 1 : BrdaRten." Accessed June 27, 2026. https://www.babelstone.co.uk/Blog/2006/09/precomposed-tibetan-part-1-brdarten.html

[6] Buddhist Digital Resource Center. "Transforming Tibetan Text Digitization." Accessed June 27, 2026. https://www.bdrc.io/blog/2024/08/28/transforming-tibetan-text-digitization-bdrcs-groundbreaking-ocr-project/

[7] Biligsaikhan, et al. "A Study of Traditional Mongolian Script Encodings and Rendering." *Journal of the Chinese and Oriental Languages Information Processing Society*, 2021.

[8] Chung, Michael Yan Hon. "Manchu OCR and Translation AI." HKUST Digital Humanities Initiative. Accessed June 27, 2026. https://digitalhumanities.hkust.edu.hk/manchu-ocr-and-translation-ai/

[9] W3C. "Arabic Script Gap Analysis." Accessed June 27, 2026. https://www.w3.org/TR/alreq-gap/
