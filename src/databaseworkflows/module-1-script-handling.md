---
layout: single
title: "Module 1: Setup and Script Handling Crash Course"
permalink: /databaseworkflows/module-1-script-handling/
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
    <strong>Beginner</strong>
  </div>
  <div class="module-header-meta">
    <span>ESTIMATED TIME</span>
    <strong>20 Minutes</strong>
  </div>
  <div class="module-header-meta">
    <span>PREREQUISITES</span>
    <strong>None</strong>
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
  <div class="toc-dot-wrap"><a class="toc-dot" data-target="the-sample-dataset"></a><span class="toc-tooltip">The Sample Dataset</span></div>
  <div class="toc-dot-wrap"><a class="toc-dot" data-target="crash-course-script-handling"></a><span class="toc-tooltip">Script Handling</span></div>
  <div class="toc-dot-wrap"><a class="toc-dot" data-target="further-reading"></a><span class="toc-tooltip">Further Reading</span></div>
</div>

<h2 id="introduction">Introduction</h2>

For humanities researchers, the transition from reading a text to treating it as data often reveals invisible structural problems. A character that looks correct on screen may fail to match an identical-looking character in a search query; a spreadsheet of archival data may sort unpredictably; or a script that renders perfectly in a word processor may break a Python script.

To make the workflows in these modules concrete, we will use a shared, realistic dataset that runs through all six modules. This module introduces the dataset and provides a crash course on the computational layer of working with Chinese, Tibetan, Mongolian, Manchu, and Uyghur materials.

<div class="module-toc">
  <h4>In this module</h4>
  <ul>
    <li><a href="#the-sample-dataset">The Sample Dataset: Contemporary Chinese Village Gazetteers</a></li>
    <li><a href="#crash-course-script-handling">Crash Course: Script Handling for Computational Research</a>
      <ul>
        <li><a href="#encoding-pitfalls">Encoding Pitfalls: UTF-8 BOM and Han Unification</a></li>
        <li><a href="#character-simplification">The Character Simplification Problem</a></li>
        <li><a href="#script-specific-challenges">Script-Specific Challenges</a></li>
      </ul>
    </li>
  </ul>
</div>

<h2 id="the-sample-dataset">The Sample Dataset: Contemporary Chinese Village Gazetteers</h2>

Throughout these modules, we will work with a sample dataset drawn from the **Contemporary Chinese Village Gazetteer Data (CCVG Data)** project at the University of Pittsburgh [1]. Village gazetteers (村志) are vital primary sources that record statistical data on individual villages from 1949 to the present.

The CCVG project extracts this data into structured CSV files. Our sample dataset is a representative 30-village subset that intentionally preserves the "messiness" of real-world humanities data. It consists of two relational tables:

**1. Village Information Table (`ccvg_village_information.csv`)**
Contains static metadata for each village, including its name, location, and the gazetteer it was extracted from.
* **The Messiness:** This table contains a mix of Traditional and Simplified characters (e.g., 广东省 vs. 廣東省), competing romanization systems (Pinyin vs. Wade-Giles), and an invisible UTF-8 BOM encoding issue.

**2. Population Table (`ccvg_population.csv`)**
Contains longitudinal demographic data, with multiple rows per village representing different years.
* **The Messiness:** This table contains missing values, inconsistent date formats (e.g., "1978" vs. "民国三十八年"), and inconsistent note fields.

<blockquote class="workflow-tip">
  <span class="callout-label">Download the Sample Data</span>
  <p>Download the sample CSV files to follow along with the tutorials in all six modules:</p>
  <p>
    <a href="/assets/data/ccvg_village_information.csv" class="btn btn--primary">Download ccvg_village_information.csv</a>&nbsp;
    <a href="/assets/data/ccvg_population.csv" class="btn btn--primary">Download ccvg_population.csv</a>
  </p>
</blockquote>

<h2 id="crash-course-script-handling">Crash Course: Script Handling for Computational Research</h2>

Before we can clean, analyze, or publish our sample dataset, we must understand the script-handling pitfalls that often break East Asian data pipelines.

<h3 id="encoding-pitfalls">Encoding Pitfalls: UTF-8 BOM and Han Unification</h3>

The foundation of modern digital text is Unicode. However, its implementation introduces common hurdles.

**The UTF-8 BOM Problem**

When saving a CSV file in Excel to be processed by a Python script, researchers often encounter an invisible character at the very beginning of the file. This is the Byte Order Mark (BOM). Many command-line tools do not expect it and will read the first column header incorrectly (e.g., `ï»¿Gazetteer_Code` instead of `Gazetteer_Code`). Our sample dataset intentionally includes a BOM to illustrate this.

<blockquote class="workflow-note">
  <span class="callout-label">Best Practice: Stripping the BOM</span>
  <p>Always save data files as "UTF-8 without BOM." If using Python to read a CSV, specify the encoding explicitly to strip it:</p>
  <p><code>df = pd.read_csv('ccvg_village_information.csv', encoding='utf-8-sig')</code></p>
</blockquote>

**Han Unification and Variant Codepoints**

To save space, the Unicode consortium implemented "Han Unification," merging Chinese, Japanese, and Korean (CJK) characters that shared a common historical origin into single codepoints [2]. However, historical texts often use variant characters (異體字) that *were* assigned separate codepoints. For example, the standard character 爲 (U+9232) and its variant 為 (U+70BA) look very similar, but to a computer, they are completely different entities [3]. They will not match in a database search unless explicitly normalized.

<h3 id="character-simplification">The Character Simplification Problem</h3>

Our sample dataset contains both Simplified (广东省) and Traditional (廣東省) province names. The simplification of Chinese characters introduces a profound discontinuity in historical data pipelines.

**Second-Round Simplified Characters**

Between 1977 and 1986, the PRC promulgated a "Second Round" of simplified characters (二简字) [4]. These appear frequently in grassroots documents from that decade. Because the second round was rescinded, many of these characters were never added to standard digital fonts. Standard OCR engines will either fail to recognize them or "correct" them to different characters.

**Mixed-Script Documents**

Early PRC documents frequently mix traditional and simplified characters within the same sentence. When setting up an OCR pipeline, it is essential to load both Traditional and Simplified language models simultaneously (e.g., `-l chi_sim+chi_tra` in Tesseract) to prevent the engine from forcing a uniform script assumption.

<h3 id="script-specific-challenges">Script-Specific Challenges</h3>

Beyond Chinese, researchers working with the languages of the Qing empire and its successor states face distinct computational hurdles.

| Script | Key Challenge | Practical Impact |
|---|---|---|
| **Tibetan** | Stacked consonants handled by font renderer, not Unicode | OCR systems struggle to determine correct consonant sequence, leading to high error rates [5] |
| **Mongolian / Manchu** | Unicode encodes as horizontal L-to-R; display requires 90° rotation | Text direction breaks when pasting from OCR into spreadsheets [6] |
| **Uyghur** | Arabic-script right-to-left directionality | Bidirectional (BiDi) text rendering issues in CSV files make manual cleaning difficult [7] |

<blockquote class="workflow-warning">
  <span class="callout-label">Warning: LLMs and Low-Resource Scripts</span>
  <p>Large Language Models (LLMs) excel at processing modern Chinese, but their competence drops drastically for Classical Chinese, Tibetan, Mongolian, Manchu, and Uyghur. When using LLMs for data enrichment on low-resource scripts, transliterate the text into a standardized Latin-alphabet romanization <em>before</em> passing it to the LLM.</p>
</blockquote>

<div class="further-reading">
  <h3>Further Reading</h3>
  <ul>
    <li><a href="https://programminghistorian.org/en/lessons/understanding-regular-expressions">Understanding Regular Expressions</a> (Programming Historian)</li>
    <li><a href="https://programminghistorian.org/en/lessons/intro-to-bash">Introduction to the Bash Command Line</a> (Programming Historian)</li>
  </ul>
  <div class="dataset-cite">
    <strong>Dataset Used in This Module</strong>
    East Asian Library, University Library System, University of Pittsburgh. <em>Contemporary Chinese Village Gazetteer Data (CCVG Data)</em>. Accessed June 2026. <a href="https://www.chinesevillagedata.library.pitt.edu/">https://www.chinesevillagedata.library.pitt.edu/</a>
  </div>
</div>

<div class="module-nav-footer">
  <a href="/databaseworkflows/" class="module-nav-btn">
    <span class="nav-label">← Back to</span>
    <span class="nav-title">All Modules</span>
  </a>
  <a href="/databaseworkflows/module-2-ocr/" class="module-nav-btn">
    <span class="nav-label">Next →</span>
    <span class="nav-title">Module 2: OCR</span>
  </a>
</div>

<h2 id="references">References</h2>

[1] East Asian Library, University Library System, University of Pittsburgh. "Contemporary Chinese Village Gazetteer Data." Accessed June 27, 2026. https://www.chinesevillagedata.library.pitt.edu/

[2] Unicode Consortium. "FAQ - Chinese and Japanese." Accessed June 27, 2026. http://www.unicode.org/faq/han_cjk.html

[3] Typotheque. "Understanding CJK regional character variants." Accessed June 27, 2026. https://www.typotheque.com/articles/understanding-cjk-regional-character-variants

[4] Wikipedia. "Second round of simplified Chinese characters." Accessed June 27, 2026. https://en.wikipedia.org/wiki/Second_round_of_simplified_Chinese_characters

[5] Buddhist Digital Resource Center. "Transforming Tibetan Text Digitization." Accessed June 27, 2026. https://www.bdrc.io/blog/2024/08/28/transforming-tibetan-text-digitization-bdrcs-groundbreaking-ocr-project/

[6] Biligsaikhan, et al. "A Study of Traditional Mongolian Script Encodings and Rendering." *Journal of the Chinese and Oriental Languages Information Processing Society*, 2021.

[7] W3C. "Arabic Script Gap Analysis." Accessed June 27, 2026. https://www.w3.org/TR/alreq-gap/
