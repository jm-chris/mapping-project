---
layout: single
title: "Module 1: Script Handling for Computational Research"
permalink: /databaseworkflows/module-1-script-handling/
toc: true
toc_sticky: true
classes: wide article-page
sidebar:
  nav: "main_sidebar"
header:
    overlay_image: /assets/images/mp_hero_grid_layered_slate.png
---

## Introduction

For humanities researchers, the transition from reading a text to treating it as data often reveals invisible structural problems. A character that looks correct on screen may fail to match an identical-looking character in a search query; a spreadsheet of archival data may sort unpredictably; or a script that renders perfectly in a word processor may break a Python script. 

This module addresses the computational layer of working with Chinese, Tibetan, Mongolian, Manchu, and Uyghur materials in a data pipeline. It focuses on the encoding, normalization, and script-specific behaviors that researchers must understand to build robust digital workflows.

## Unicode and Encoding Pitfalls

The foundation of modern digital text is Unicode, a standard that assigns a unique number (codepoint) to every character in almost every written language. However, the implementation of Unicode—specifically the UTF-8 encoding scheme—introduces several common pitfalls for East Asian studies.

### The UTF-8 BOM Problem
When saving a CSV file in Excel to be processed by a Python script or uploaded to a database, researchers often encounter an invisible character at the very beginning of the file. This is the Byte Order Mark (BOM). While intended to signal that a file is encoded in UTF-8, many command-line tools and programming languages do not expect it and will read the first column header incorrectly (e.g., `ï»¿ID` instead of `ID`).

**Best Practice:** Always save data files as "UTF-8 without BOM." If using Python to read a CSV, specify the encoding explicitly to strip it:
```python
import pandas as pd
df = pd.read_csv('data.csv', encoding='utf-8-sig')
```

### Han Unification and Variant Codepoints
To save space in the early days of Unicode, the consortium implemented "Han Unification," merging Chinese, Japanese, and Korean (CJK) characters that shared a common historical origin into single codepoints [1]. This means that the character for "bone" (骨) shares the same underlying numeric value in Chinese and Japanese, even though the regional typographic conventions differ slightly.

However, historical texts often use variant characters (異體字) that *were* assigned separate codepoints. For example, the standard character 爲 (U+9232) and its variant 為 (U+70BA) look very similar and mean the same thing, but to a computer, they are completely different entities [2]. When searching a database or counting word frequencies, these variants will not match unless they are explicitly normalized.

**Best Practice:** When working with premodern texts, utilize variant character datasets to map historical variants to a standardized form before conducting computational analysis [3]. 

### Normalization Forms: NFC vs. NFD
Unicode allows certain characters to be represented in two ways: as a single precomposed character, or as a base character plus a combining mark. For example, the letter `é` can be U+00E9 (precomposed) or `e` + `´` (U+0065 + U+0301). 

Unicode defines two primary normalization forms to handle this:
*   **NFC (Normalization Form C):** Composes characters into their shortest form.
*   **NFD (Normalization Form D):** Decomposes characters into base letters and combining marks [4].

While this rarely affects Chinese characters directly, it is critical when working with romanization systems that use diacritics (like pinyin) or when processing text on macOS, which defaults to NFD for file names. A script looking for a file named `lǚ.txt` (NFC) will fail to find `lǚ.txt` (NFD) [5].

## The Character Simplification Problem

The simplification of Chinese characters introduces a profound discontinuity in historical data pipelines. A researcher working with documents from the People's Republic of China (PRC) must navigate not just standard simplification, but historical anomalies.

### First-Round vs. Second-Round Simplified Characters
The standard simplified characters used today are the "First-Round" simplifications. However, between 1977 and 1986, the PRC promulgated a "Second Round" of simplified characters (二简字) [6]. These characters appear frequently in grassroots documents, factory records, and internal circulars from that decade. 

Because the second round was ultimately rescinded, many of these characters were never added to standard digital fonts or Unicode blocks. For example, the second-round simplification of 菜 to 𦬁 or 酒 to 氿 [7].

**The Pipeline Challenge:** Standard OCR engines will either fail to recognize second-round characters or "correct" them to entirely different characters that share a visual resemblance. Furthermore, if transcribed accurately, they will not match keyword searches for the standard character.

**Best Practice:** When digitizing documents from the 1977–1986 period, maintain the original scanned image as the authoritative record, but normalize the underlying searchable text layer (the OCR output) to standard first-round simplified characters to ensure discoverability.

### Mixed-Script Documents
Early PRC documents (1950s–1960s) frequently mix traditional and simplified characters within the same sentence, as typographic standards were still in flux. When setting up an OCR pipeline, it is essential to load both Traditional and Simplified language models simultaneously (e.g., `-l chi_sim+chi_tra` in Tesseract) to prevent the engine from forcing a uniform script assumption onto a mixed text.

## Script-Specific Data Challenges

Beyond Chinese, researchers working with the languages of the Qing empire and its successor states face distinct computational hurdles.

### Tibetan: Stacked Consonants
The Tibetan script is written horizontally from left to right, but syllables are formed by stacking consonants vertically around a root letter. In Unicode, this is achieved using a base consonant followed by special "subjoined" consonant codepoints that render beneath it [8]. 

Because the vertical stacking is handled by the font rendering engine rather than being precomposed into single blocks, OCR systems often struggle to determine the correct sequence of base and subjoined characters, leading to high error rates in historical manuscript recognition [9].

### Mongolian: Vertical Encoding Quirks
Traditional Mongolian is written vertically from top to bottom, with lines progressing from left to right. However, the Unicode standard encodes Mongolian as a horizontal left-to-right script, relying on the application (like a web browser or word processor) to rotate the text 90 degrees for display [10].

This creates significant friction in data pipelines. When extracting text from an OCR engine that reads vertically and pasting it into a spreadsheet that assumes horizontal text, the directional flow can break. The Mongolian specialist community has noted ongoing issues with how different operating systems handle the complex contextual shaping of Mongolian letters [11].

### Manchu: Limited Support
Manchu shares its script origin with Mongolian and faces the same vertical-to-horizontal encoding issues. However, it suffers from a much more severe lack of tooling. While modern OCR models for Chinese are highly accurate, Manchu remains a low-resource language. Recent initiatives, such as the fine-tuning of Vision-Language Models (VLMs) for Manchu OCR, are beginning to bridge this gap, but researchers must currently rely on custom, project-specific models rather than off-the-shelf software [12].

### Uyghur: Right-to-Left Directionality
Uyghur is written in a modified Arabic script, reading from right to left. When processing Uyghur text in a data pipeline (such as a CSV file or a Python Pandas dataframe), the mixing of right-to-left Uyghur text with left-to-right English metadata or numbers creates bidirectional (BiDi) text rendering issues [13].

While the underlying string of characters remains correct in memory, it will often display incorrectly on screen, making manual data cleaning difficult. Researchers must ensure their database interfaces and web frontends explicitly declare the text direction (e.g., `dir="rtl"` in HTML) for Uyghur fields.

## LLMs and Script Handling

Large Language Models (LLMs) have fundamentally changed data extraction workflows, but their competence varies drastically by script.

*   **Modern Chinese:** Highly competent. Models like GPT-4o and Claude 3.5 Sonnet excel at reading, segmenting, and extracting data from modern Chinese text.
*   **Classical Chinese:** Moderately competent but prone to hallucination. LLMs can struggle with the dense, unpunctuated nature of classical texts, sometimes inventing characters to complete a perceived pattern [14].
*   **Tibetan, Mongolian, and Uyghur:** Low competence. Because these languages represent a tiny fraction of the models' training data, LLMs frequently fail at complex extraction tasks in these scripts [15].

**Best Practice:** When using LLMs for data enrichment on low-resource scripts, transliterate the text into a standardized Latin-alphabet romanization *before* passing it to the LLM. 

## Romanization and Transliteration Normalization

When combining datasets from different institutions or eras, researchers inevitably encounter competing romanization systems. A person named "Zhou Enlai" in one dataset might be "Chou En-lai" in another.

To reconcile these datasets programmatically, researchers should use standardized conversion tables.
*   **Chinese:** Convert Wade-Giles, Yale, or EFEO to standard Hanyu Pinyin [16].
*   **Tibetan:** The Wylie transliteration scheme is the standard for representing Tibetan script using a standard English keyboard, allowing for precise 1:1 computational mapping [17].

Normalizing all romanized fields to a single standard (e.g., Pinyin for Chinese, Wylie for Tibetan) is a necessary first step before attempting to link entities or merge databases.

---

## References

[1] Unicode Consortium. "FAQ - Chinese and Japanese." Accessed June 27, 2026. http://www.unicode.org/faq/han_cjk.html

[2] Typotheque. "Understanding CJK regional character variants." Accessed June 27, 2026. https://www.typotheque.com/articles/understanding-cjk-regional-character-variants

[3] Wang, et al. "A Variant Character Dataset for Historical Narratives of Middle and Late Imperial China." *Journal of Open Humanities Data*, 2025. https://openhumanitiesdata.metajnl.com/articles/10.5334/johd.325

[4] Unicode Consortium. "UAX #15: Unicode Normalization Forms." Accessed June 27, 2026. http://www.unicode.org/reports/tr15/

[5] Brenndoerfer, M. "Text Normalization: Unicode Forms, Case Folding & Whitespace." Accessed June 27, 2026. https://mbrenndoerfer.com/writing/text-normalization-unicode-nlp

[6] Wikipedia. "Second round of simplified Chinese characters." Accessed June 27, 2026. https://en.wikipedia.org/wiki/Second_round_of_simplified_Chinese_characters

[7] The Language Closet. "That time China tried to simplify characters… again." Accessed June 27, 2026. https://thelanguagecloset.com/2023/10/07/that-time-china-tried-to-simplify-characters-again/

[8] BabelStone Blog. "Precomposed Tibetan Part 1 : BrdaRten." Accessed June 27, 2026. https://www.babelstone.co.uk/Blog/2006/09/precomposed-tibetan-part-1-brdarten.html

[9] Buddhist Digital Resource Center. "Transforming Tibetan Text Digitization." Accessed June 27, 2026. https://www.bdrc.io/blog/2024/08/28/transforming-tibetan-text-digitization-bdrcs-groundbreaking-ocr-project/

[10] Biligsaikhan, et al. "A Study of Traditional Mongolian Script Encodings and Rendering." *Journal of the Chinese and Oriental Languages Information Processing Society*, 2021.

[11] W3C. "Mongolian Script Resources." Accessed June 27, 2026. https://www.w3.org/TR/mong-lreq/

[12] Chung, Michael Yan Hon. "Manchu OCR and Translation AI." HKUST Digital Humanities Initiative. Accessed June 27, 2026. https://digitalhumanities.hkust.edu.hk/manchu-ocr-and-translation-ai/

[13] W3C. "Arabic Script Gap Analysis." Accessed June 27, 2026. https://www.w3.org/TR/alreq-gap/

[14] Chow, Eric H. C. "Evaluating LLMs for Linked Data Extraction from Chinese Texts." *The Digital Orientalist*, January 24, 2025.

[15] arXiv. "Tibetan Language and AI: A Comprehensive Survey of Resources." October 22, 2025. https://arxiv.org/html/2510.19144v1

[16] ChinaKnowledge. "Wade-Giles/Pinyin Conversion Table." Accessed June 27, 2026. http://www.chinaknowledge.de/Literature/Script/wadegilespinyin.html

[17] Wikipedia. "Wylie transliteration." Accessed June 27, 2026. https://en.wikipedia.org/wiki/Wylie_transliteration
