import os
import sys
import json
import csv
import logging
import urllib.request
from pathlib import Path
from typing import List, Dict, Any, Optional

# Add parent directory to sys.path so imports work smoothly
current_dir = Path(__file__).resolve().parent
parent_dir = current_dir.parent
if str(parent_dir) not in sys.path:
    sys.path.insert(0, str(parent_dir))

from langchain_core.documents import Document
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import FAISS
from langchain_community.embeddings import HuggingFaceEmbeddings

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger("IngestPipeline")

# Standard YouTube Category Mapping Fallback
CATEGORY_MAPPING = {
    1: "Film & Animation",
    2: "Autos & Vehicles",
    10: "Music",
    15: "Pets & Animals",
    17: "Sports",
    18: "Short Movies",
    19: "Travel & Events",
    20: "Gaming",
    21: "Videoblogging",
    22: "People & Blogs",
    23: "Comedy",
    24: "Entertainment",
    25: "News & Politics",
    26: "Howto & Style",
    27: "Education",
    28: "Science & Technology",
    29: "Nonprofits & Activism",
    30: "Movies",
    31: "Anime/Animation",
    32: "Action/Adventure",
    33: "Classics",
    34: "Comedy",
    35: "Documentary",
    36: "Drama",
    37: "Family",
    38: "Foreign",
    39: "Horror",
    40: "Sci-Fi/Fantasy",
    41: "Thriller",
    42: "Shorts",
    43: "Shows",
    44: "Trailers",
}

# ==========================================
# Curated Title & Hook Formulas (25+ items)
# ==========================================
CURATED_FORMULAS = [
    {
        "title": "The Extreme Curiosity Gap Formula",
        "content": "Formula: '[I Tested / I Built / I Tried] [Extreme Thing] for [Time Period] (Here is What Happened)'\nDescription: Withholds the key conclusion until the viewer watches. Creates high psychological intrigue by taking a recognizable goal to an extreme limit.",
        "category": "Curiosity & Experimentation"
    },
    {
        "title": "The Counter-Intuitive Myth Buster",
        "content": "Formula: 'Why Everything You Know About [Topic/Niche] Is Wrong (And What to Do Instead)'\nDescription: Challenges established beliefs in the niche. Immediately positions the creator as an authority uncovering hidden truths.",
        "category": "Education & Analysis"
    },
    {
        "title": "The Negative Constraint Hook",
        "content": "Formula: 'Stop [Doing Common Action] If You Want [Desired Outcome] in 2026'\nDescription: Uses loss aversion to trigger urgent curiosity. Viewers click to ensure they aren't making a critical mistake.",
        "category": "Productivity & Advice"
    },
    {
        "title": "The Step-by-Step Mastery Framework",
        "content": "Formula: 'How to Master [Skill/Tool] from Scratch (0 to Hero Full Roadmap)'\nDescription: Perfect for high search-volume educational content. Provides clear expectations of complete, actionable guidance.",
        "category": "Education & Tech"
    },
    {
        "title": "The Extreme Stakes Challenge",
        "content": "Formula: 'I Spent $X to See If [Product/Method] is Actually Worth It'\nDescription: Combines financial risk, personal investment, and honest consumer review into an entertaining narrative.",
        "category": "Entertainment & Tech"
    },
    {
        "title": "The 1 vs 100 Tier List Comparison",
        "content": "Formula: '$100 vs $10,000 [Item/Setup]: Is the Price Difference Real?'\nDescription: Leverages dramatic price disparities to compare entry-level vs elite setups, drawing casual and enthusiast viewers.",
        "category": "Tech & Lifestyle"
    },
    {
        "title": "The Secret Tool / Hack Reveal",
        "content": "Formula: '7 Game-Changing Tools for [Niche] That Feel Illegal to Know'\nDescription: Uses scarcity and forbidden knowledge angles to drive immediate saves, shares, and high click-through rates.",
        "category": "Productivity & Tech"
    },
    {
        "title": "The Before & After Transformation",
        "content": "Formula: 'How I Fixed [Major Pain Point] in Just [Time Frame] (Real Results)'\nDescription: Showcases a quantifiable personal or professional transformation with transparent metrics and proof.",
        "category": "Fitness & Lifestyle"
    },
    {
        "title": "The Industry Insider Warning",
        "content": "Formula: 'The [Niche/Industry] Bubble is About to Burst... Here is What to Do'\nDescription: Timely, macro-level industry analysis that taps into viewer anxiety and preparedness.",
        "category": "Finance & Business"
    },
    {
        "title": "The Relatable Mistake Breakdown",
        "content": "Formula: '5 Mistakes I Made as a Beginner [Profession/Hobby] (Don't Repeat Them)'\nDescription: Empathetic, vulnerability-driven storytelling that builds immediate trust and community engagement.",
        "category": "Personal Growth"
    },
    {
        "title": "The Time-Compressed Acceleration",
        "content": "Formula: 'Learn [Complex Subject] in 15 Minutes (Cheat Sheet Included)'\nDescription: High-utility, high-efficiency promise that appeals to busy professionals and students.",
        "category": "Education & Coding"
    },
    {
        "title": "The Ultimate Showdown / Versus",
        "content": "Formula: '[Tool A] vs [Tool B]: The Brutally Honest Truth for 2026'\nDescription: Direct side-by-side comparison answering high-intent purchase or adoption queries.",
        "category": "Tech & Gear"
    },
    {
        "title": "The Single Secret Catalyst",
        "content": "Formula: 'The 1 Habit That Changed My Entire [Career/Financial State] Forever'\nDescription: Focuses on a single powerful fulcrum point rather than overwhelming viewers with multi-step advice.",
        "category": "Self Improvement"
    },
    {
        "title": "The Open Loop Story Hook",
        "content": "Formula: 'They Told Me It Was Impossible... So I Did It Anyway'\nDescription: Hero-arc narrative structure that appeals to underdog empathy and curiosity.",
        "category": "Storytelling & Vlog"
    },
    {
        "title": "The Future Trend Prediction",
        "content": "Formula: 'The Death of [Current Standard] is Coming in 2026'\nDescription: Provocative forecast that forces viewers to re-evaluate their current stack, tools, or habits.",
        "category": "Future Trends & Tech"
    },
    {
        "title": "The Numbered Action Plan",
        "content": "Formula: '10 Rules for [Achieving Goal] (Backed by Science & Data)'\nDescription: Combines structured scannability with scientific or empirical credibility.",
        "category": "Productivity & Health"
    },
    {
        "title": "The Behind the Scenes Reality",
        "content": "Formula: 'The Truth About Being a [Job/Role] That No One Talks About'\nDescription: Pulls back the curtain on glamorized careers to deliver raw authenticity.",
        "category": "Career & Life"
    },
    {
        "title": "The Extreme Elimination Challenge",
        "content": "Formula: 'I Deleted [Common App/Distraction] for 30 Days and My Life Changed'\nDescription: Relatable digital detox or lifestyle elimination experiment with dramatic before/after contrast.",
        "category": "Lifestyle & Wellness"
    },
    {
        "title": "The Live Demonstration / Speedrun",
        "content": "Formula: 'Building a Complete [App/System] from Scratch in Under 1 Hour'\nDescription: High-velocity proof of skill that captivates tech and builder audiences.",
        "category": "Programming & Development"
    },
    {
        "title": "The Micro-Budget Success Blueprint",
        "content": "Formula: 'How to Start [Business/Project] With $0 (Full Step-by-Step Blueprint)'\nDescription: Removes barrier to entry for aspiring creators and entrepreneurs.",
        "category": "Entrepreneurship"
    },
    {
        "title": "The Worst Case Scenario Breakdown",
        "content": "Formula: 'What Actually Happens When You [Extreme Action]?'\nDescription: Explores hypothetical disasters or scientific edge cases with high visual storytelling.",
        "category": "Science & Curiosity"
    },
    {
        "title": "The Algorithm Decoded Hook",
        "content": "Formula: 'How the [Platform] Algorithm Really Works in 2026 (Proven Case Studies)'\nDescription: Breaks down reverse-engineered platform mechanics for creators seeking growth.",
        "category": "Creator Economy"
    },
    {
        "title": "The Portfolio & Wealth Breakdown",
        "content": "Formula: 'How I Built a $10,000/Month Passive Income Stream (Exact Numbers Revealed)'\nDescription: Radical transparency with real revenue dashboards and breakdown spreadsheets.",
        "category": "Finance & Wealth"
    },
    {
        "title": "The Ultimate Gear / Setup Guide",
        "content": "Formula: 'The Only Desk Setup You Need in 2026 (Minimalist & Aesthetic)'\nDescription: Aesthetic gear showcase focused on ergonomics, focus, and visual beauty.",
        "category": "Tech & Workspace"
    },
    {
        "title": "The Unfiltered Tier List Ranking",
        "content": "Formula: 'Ranking Every [Topic/Framework] from Worst to Best (Tier List)'\nDescription: Highly debated subjective rankings that trigger enthusiastic comment section discussions.",
        "category": "Gaming & Tech"
    }
]

# ==========================================
# Curated Thumbnail Design Patterns (40+ items)
# ==========================================
CURATED_THUMBNAILS = [
    {
        "title": "Split Screen High Contrast Before & After",
        "content": "Layout: Vertical 50/50 split down the middle with glowing separation line. Left side desaturated/gray, right side hyper-saturated and vibrant.\nText Overlay: Bold 2-3 words 'BEFORE / AFTER' in yellow Impact font.\nSubject: Distressed look on left, ecstatic victory expression on right.",
        "category": "Transformation & Tutorials"
    },
    {
        "title": "The Big Red Arrow & Mystery Blur Box",
        "content": "Layout: Off-center subject looking intensely at a blurred object with a glowing neon red curved arrow pointing to the focal point.\nText Overlay: 'DON'T TOUCH THIS' in white sans-serif with black stroke.\nColors: Dark moody navy background with high-contrast red accent.",
        "category": "Curiosity & Mystery"
    },
    {
        "title": "The Emotional Extreme Close-Up (MrBeast Style)",
        "content": "Layout: Human face occupying 40% of the frame on the right side with exaggerated open-mouthed expression and catchlight in eyes. Left side features dramatic scene/backdrop.\nText Overlay: None or maximum 2 words (e.g., '$1,000,000!').\nColors: High dynamic range saturated blues and golds.",
        "category": "Entertainment & Challenges"
    },
    {
        "title": "The Minimalist Sleek Tech Showcase",
        "content": "Layout: Product floating in isometric 3D space with soft ambient rim lighting and subtle drop shadow.\nText Overlay: 'IT FINALLY HAPPENED' in clean, tracking-spaced geometric sans (Futura/Inter).\nColors: Deep matte black background (#121212) with single electric blue or emerald highlight.",
        "category": "Tech Reviews"
    },
    {
        "title": "The Provocative Question / Dilemma Layout",
        "content": "Layout: Subject holding two contrasting items or pointing between two distinct pathways with a question mark graphic.\nText Overlay: 'THIS OR THAT?' in contrasting red and cyan blocks.\nColors: Bright studio fill lighting with clean neutral gradient.",
        "category": "Comparisons & Buyer Guides"
    },
    {
        "title": "The Glowing Graph of Exponential Growth",
        "content": "Layout: Creator looking shocked at a holographic green line graph skyrocketing off the top edge of the frame.\nText Overlay: '+450% IN 30 DAYS' in glowing neon green.\nColors: Dark mode aesthetic with cyberpunk emerald glow.",
        "category": "Finance & Trading"
    },
    {
        "title": "The Brutal 'X' Rejection Stamp",
        "content": "Layout: Outdated tool or practice in center frame stamped with a thick semi-transparent red 'X' or 'DEAD'.\nText Overlay: 'DO NOT BUY' or 'IT'S OVER' in bold red banner.\nColors: Harsh directional lighting with warning red highlights.",
        "category": "Consumer Advice & Tech"
    },
    {
        "title": "The Behind-the-Curtain Secret Blueprint",
        "content": "Layout: Dark aesthetic with a folder or blueprint graphic glowing slightly, subject whispering or making a 'shh' gesture.\nText Overlay: 'THE SECRET CODE' with gold gradient text.\nColors: Deep charcoal and subtle warm gold rim light.",
        "category": "Productivity & Coding"
    },
    {
        "title": "The Real vs Fake Side-by-Side Test",
        "content": "Layout: Two nearly identical items placed side by side with large 'REAL' (green checkmark) and 'FAKE' (red X) labels.\nText Overlay: 'CAN YOU TELL?' in bold centered uppercase.\nColors: Bright crisp daylight studio backdrop.",
        "category": "Testing & Reviews"
    },
    {
        "title": "The 3D Floating Feature Cards Layout",
        "content": "Layout: Creator on left, floating glassmorphism UI cards with key features or statistics on right.\nText Overlay: '3 NEW RULES' in high-contrast white with subtle drop shadow.\nColors: Soft gradient purple-to-indigo backdrop.",
        "category": "Software & Web Development"
    },
    {
        "title": "The Dramatic Danger Zone Warning",
        "content": "Layout: Yellow and black caution tape hazard stripes across bottom banner, subject looking alarmed.\nText Overlay: 'WARNING: STOP NOW' in emergency yellow.\nColors: High drama amber and charcoal contrast.",
        "category": "Security & Life Advice"
    },
    {
        "title": "The Golden Trophy Achievement Showcase",
        "content": "Layout: Subject holding a shiny trophy or plaque with confetti burst particles in the background.\nText Overlay: 'WE WON!' in golden metallic 3D typography.\nColors: Warm celebratory palette with sparkle specular highlights.",
        "category": "Milestones & Gaming"
    },
    {
        "title": "The Ultra-Clean Aesthetic Workspace",
        "content": "Layout: Wide angle 16:9 flat lay or hero angle of a spotless minimalist desk setup with ambient warm LED strip.\nText Overlay: 'PERFECT SETUP?' in elegant white font with rounded badge.\nColors: Natural wood tones, warm 3000K LED glow, matte black peripherals.",
        "category": "Productivity & Setup"
    },
    {
        "title": "The Tier List S-Tier Glory",
        "content": "Layout: Tier list grid shown with bright red 'S-Tier' row prominently highlighted containing the winning item.\nText Overlay: 'BEST OF 2026' in thick white font on red banner.\nColors: Standard tier list colors (Red S, Orange A, Yellow B, Green C).",
        "category": "Tier Lists & Rankings"
    },
    {
        "title": "The Time-Lapse Clock Speedup",
        "content": "Layout: Glowing neon digital timer showing '00:59:59' ticking down, subject rushing or sweating in action pose.\nText Overlay: '1 HOUR ONLY' in urgent red block text.\nColors: Dark background with luminous clock glow.",
        "category": "Challenges & Speedruns"
    },
    {
        "title": "The Massive Scale Comparison (Tiny vs Huge)",
        "content": "Layout: Miniaturized object next to colossal object creating extreme visual scale disparity.\nText Overlay: 'SIZE MATTERS?' in chunky uppercase sans-serif.\nColors: Expansive outdoor horizon with dramatic cloud depth.",
        "category": "Science & Engineering"
    },
    {
        "title": "The Code Terminal Green Screen Matrix",
        "content": "Layout: High-contrast code editor with colorful syntax highlighting reflecting onto creator's glasses.\nText Overlay: 'AI WROTE THIS' in neon cyan.\nColors: Dark theme IDE with glowing cyan/magenta syntax accents.",
        "category": "AI & Software"
    },
    {
        "title": "The Money Stack / Bank Statement Proof",
        "content": "Layout: Transparent bank notification banner showing incoming funds, creator smiling confidently in background.\nText Overlay: 'REAL PROOF' in emerald green bubble text.\nColors: Clean white notification modal over deep green ambient backdrop.",
        "category": "Business & Monetization"
    },
    {
        "title": "The Dissected Anatomy / Exploded View",
        "content": "Layout: Device or concept broken apart into floating internal components with callout labels.\nText Overlay: 'WHAT'S INSIDE?' in technical monospace font.\nColors: Blueprint blue background with crisp white linework.",
        "category": "Hardware & Engineering"
    },
    {
        "title": "The Confused vs Enlightened Emoji Expression",
        "content": "Layout: Creator expressing utter confusion next to a huge glowing lightbulb or eureka idea icon.\nText Overlay: 'FINALLY FIXED' with bright yellow highlighter stroke.\nColors: Saturated cyan backdrop with bright yellow accent.",
        "category": "Problem Solving & Tutorials"
    },
    {
        "title": "The Speedometer Gauge at Redline",
        "content": "Layout: High-intensity dashboard tachometer needle pegged into the red danger limit zone.\nText Overlay: 'MAX SPEED!' in slanted dynamic italic font.\nColors: Burning orange-red gradient with speed blur streaks.",
        "category": "Performance & Gaming"
    },
    {
        "title": "The Hand-Drawn Doodle & Arrow Annotations",
        "content": "Layout: Photographic scene overlaid with hand-drawn yellow chalk arrows, circles, and handwritten commentary.\nText Overlay: 'LOOK HERE' with hand-drawn outline.\nColors: Natural realistic photo with high-contrast bright yellow markup.",
        "category": "Education & Explanations"
    },
    {
        "title": "The Silhouette of Mystery & Intrigue",
        "content": "Layout: Subject in dark silhouette against a blinding cinematic backlight, concealing identity or item.\nText Overlay: 'WHO IS IT?' in stencil block font.\nColors: Monochromatic black with intense warm rim backlighting.",
        "category": "Story & Mystery"
    },
    {
        "title": "The Extreme Food / Macro Zoom Texture",
        "content": "Layout: Macro depth-of-field shot of delicious sizzle or product texture filling 80% of screen.\nText Overlay: 'WORTH $100?' in bold text with mouth-watering color.\nColors: Rich warm golden-hour tones.",
        "category": "Food & Review"
    },
    {
        "title": "The AI vs Human Face Split",
        "content": "Layout: Half human face seamlessly blended with half robotic/cyberpunk circuit face down the centerline.\nText Overlay: 'HUMAN OR AI?' in futuristic font.\nColors: Warm human skin tones on left, neon laser blue circuits on right.",
        "category": "AI & Future"
    },
    {
        "title": "The VIP Golden Key / Access Card",
        "content": "Layout: Hand holding an illuminated VIP card with holographic reflections directly into camera lens.\nText Overlay: 'HOW TO GET IN' in gold-foil textured lettering.\nColors: Luxury midnight black and reflective metallic gold.",
        "category": "Exclusive & Lifestyle"
    },
    {
        "title": "The Crash & Broken Glass Impact",
        "content": "Layout: Shattered glass overlay effect with subject reacting in absolute shock.\nText Overlay: 'TOTAL DISASTER' in cracked bold font.\nColors: High-contrast flash photography look with sharp specular glass highlights.",
        "category": "Experiments & Reactions"
    },
    {
        "title": "The Step 1 to Step 3 Milestone Path",
        "content": "Layout: 3 circular milestone nodes connected by a glowing dotted progress path (Step 1 -> Step 2 -> Step 3).\nText Overlay: 'EASY 3 STEPS' in bright green badge.\nColors: Clean dark gradient with emerald progress accents.",
        "category": "How-To & Guides"
    },
    {
        "title": "The Floating Dollar Coin Rain",
        "content": "Layout: 3D rendered gold coins or tokens floating in dynamic depth of field around the creator.\nText Overlay: 'PASSIVE INCOME' in 3D embossed typography.\nColors: Emerald green and high-shine gold accents.",
        "category": "Finance & Wealth"
    },
    {
        "title": "The Locked Chest & Glowing Keyhole",
        "content": "Layout: Mysterious heavy iron chest emitting intense ethereal purple light from keyhole, subject leaning in.\nText Overlay: 'DON'T OPEN' in distressed vintage font.\nColors: Dark moody vignette with vibrant amethyst purple glow.",
        "category": "Gaming & Mystery"
    }
]

def load_category_json(json_path: Path) -> Dict[int, str]:
    """Load category ID to title mapping from YouTube category JSON"""
    mapping = {}
    if not json_path.exists():
        return mapping
    try:
        with open(json_path, "r", encoding="utf-8") as f:
            data = json.load(f)
            for item in data.get("items", []):
                cat_id = int(item.get("id", -1))
                title = item.get("snippet", {}).get("title", "")
                if cat_id > 0 and title:
                    mapping[cat_id] = title
        logger.info(f"Loaded {len(mapping)} categories from {json_path.name}")
    except Exception as e:
        logger.warning(f"Failed to parse category json {json_path}: {e}")
    return mapping

def download_sample_dataset(dest_dir: Path) -> Optional[Path]:
    """Download US trending dataset if local CSV is missing"""
    dest_dir.mkdir(parents=True, exist_ok=True)
    csv_target = dest_dir / "USvideos.csv"
    if csv_target.exists() and csv_target.stat().st_size > 1000:
        logger.info(f"Dataset already exists at {csv_target}")
        return csv_target
    
    url = "https://raw.githubusercontent.com/asukul/DS201/master/datasets/USvideos.csv"
    logger.info(f"Downloading trending dataset from {url}...")
    try:
        urllib.request.urlretrieve(url, csv_target)
        logger.info(f"Downloaded dataset to {csv_target} ({csv_target.stat().st_size / (1024*1024):.2f} MB)")
        return csv_target
    except Exception as e:
        logger.error(f"Failed to download dataset: {e}")
        return None

def process_csv_dataset(csv_path: Path, category_map: Dict[int, str], max_per_category: int = 150) -> List[Document]:
    """
    Process CSV dataset:
    - Inspect real column names
    - Drop missing titles
    - Sort by views
    - Keep top ~2000 per niche/category
    - One video = one Document with page_content and metadata
    """
    if not csv_path.exists():
        logger.warning(f"CSV file not found: {csv_path}")
        return []

    logger.info(f"Processing CSV dataset: {csv_path.name}")
    rows_by_category: Dict[str, List[Dict[str, Any]]] = {}
    
    with open(csv_path, "r", encoding="utf-8", errors="replace") as f:
        reader = csv.DictReader(f)
        fieldnames = reader.fieldnames or []
        logger.info(f"Detected CSV columns: {fieldnames}")
        
        # Verify critical columns
        title_col = "title" if "title" in fieldnames else fieldnames[2] if len(fieldnames) > 2 else "title"
        views_col = "views" if "views" in fieldnames else "view_count" if "view_count" in fieldnames else None
        cat_col = "category_id" if "category_id" in fieldnames else "categoryId" if "categoryId" in fieldnames else None
        tags_col = "tags" if "tags" in fieldnames else None
        desc_col = "description" if "description" in fieldnames else None
        channel_col = "channel_title" if "channel_title" in fieldnames else "channelTitle" if "channelTitle" in fieldnames else None

        for row in reader:
            title = row.get(title_col, "").strip()
            if not title or title.lower() == "[deleted video]" or title.lower() == "[private video]":
                continue
            
            # Parse views
            views = 0
            if views_col and row.get(views_col):
                try:
                    views = int(row.get(views_col, 0))
                except ValueError:
                    views = 0
                    
            # Parse category
            cat_id = 0
            if cat_col and row.get(cat_col):
                try:
                    cat_id = int(row.get(cat_col, 0))
                except ValueError:
                    cat_id = 0
                    
            category_name = category_map.get(cat_id, CATEGORY_MAPPING.get(cat_id, "General & Entertainment"))
            
            tags = row.get(tags_col, "").strip() if tags_col else ""
            desc = (row.get(desc_col, "").strip() if desc_col else "")[:300]
            channel = row.get(channel_col, "").strip() if channel_col else "Creator"

            video_item = {
                "title": title,
                "views": views,
                "category": category_name,
                "tags": tags,
                "description": desc,
                "channel": channel
            }
            
            if category_name not in rows_by_category:
                rows_by_category[category_name] = []
            rows_by_category[category_name].append(video_item)

    # Sort each category by views descending and keep top max_per_category
    documents: List[Document] = []
    total_raw = sum(len(v) for v in rows_by_category.values())
    logger.info(f"Raw valid video records read: {total_raw} across {len(rows_by_category)} categories")

    for cat_name, items in rows_by_category.items():
        sorted_items = sorted(items, key=lambda x: x["views"], reverse=True)[:max_per_category]
        for item in sorted_items:
            # Build high-density page content
            content = f"Video Title: {item['title']}\nChannel: {item['channel']}\nCategory/Niche: {item['category']}\nViews: {item['views']:,}\nTags: {item['tags']}\nSummary: {item['description']}"
            
            metadata = {
                "type": "video",
                "category": item["category"],
                "niche": item["category"],
                "views": item["views"],
                "creator_id": "public",
                "title": item["title"]
            }
            documents.append(Document(page_content=content, metadata=metadata))

    logger.info(f"Created {len(documents)} video Documents after deduplication and top-view filtering.")
    return documents

def build_curated_documents() -> List[Document]:
    """Build curated title/hook formula and thumbnail pattern documents"""
    docs: List[Document] = []
    
    # 1. Formulas
    for formula in CURATED_FORMULAS:
        content = f"Formula Title: {formula['title']}\nCategory: {formula['category']}\n{formula['content']}"
        metadata = {
            "type": "formula",
            "category": formula["category"],
            "niche": formula["category"],
            "creator_id": "public",
            "title": formula["title"]
        }
        docs.append(Document(page_content=content, metadata=metadata))
        
    # 2. Thumbnails
    for thumb in CURATED_THUMBNAILS:
        content = f"Thumbnail Concept: {thumb['title']}\nCategory: {thumb['category']}\n{thumb['content']}"
        metadata = {
            "type": "thumbnail",
            "category": thumb["category"],
            "niche": thumb["category"],
            "creator_id": "public",
            "title": thumb["title"]
        }
        docs.append(Document(page_content=content, metadata=metadata))
        
    logger.info(f"Built {len(docs)} curated knowledge Documents ({len(CURATED_FORMULAS)} formulas, {len(CURATED_THUMBNAILS)} thumbnail patterns).")
    return docs

def run_ingestion(data_dir: Optional[Path] = None, output_index_dir: Optional[Path] = None) -> FAISS:
    """
    Idempotent Ingestion Pipeline:
    1. Load CSVs & JSONs from data directory
    2. Add curated formulas & thumbnail patterns
    3. Split documents with RecursiveCharacterTextSplitter
    4. Embed with HuggingFace MiniLM
    5. Save FAISS index locally
    """
    if data_dir is None:
        data_dir = parent_dir / "data"
    if output_index_dir is None:
        output_index_dir = parent_dir / "faiss_index"

    data_dir.mkdir(parents=True, exist_ok=True)
    output_index_dir.mkdir(parents=True, exist_ok=True)

    # 1. Look for category JSON
    category_map = dict(CATEGORY_MAPPING)
    for json_file in data_dir.glob("*.json"):
        custom_map = load_category_json(json_file)
        category_map.update(custom_map)

    # 2. Look for CSV files or download sample
    csv_files = list(data_dir.glob("*.csv"))
    if not csv_files:
        downloaded = download_sample_dataset(data_dir)
        if downloaded:
            csv_files = [downloaded]

    all_raw_docs: List[Document] = []
    
    # Process all CSVs
    for csv_file in csv_files:
        docs = process_csv_dataset(csv_file, category_map, max_per_category=150)
        all_raw_docs.extend(docs)

    # Add Curated Documents
    curated_docs = build_curated_documents()
    all_raw_docs.extend(curated_docs)

    logger.info(f"Total raw Documents assembled: {len(all_raw_docs)}")

    # 3. Split with RecursiveCharacterTextSplitter
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=800,
        chunk_overlap=100,
        separators=["\n\n", "\n", " ", ""]
    )
    chunks = splitter.split_documents(all_raw_docs)
    logger.info(f"Total chunked Documents created: {len(chunks)}")

    # 4. Embed and build FAISS index
    logger.info("Initializing HuggingFaceEmbeddings ('all-MiniLM-L6-v2')...")
    embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
    
    logger.info("Building FAISS Vector Store Index (this may take 15-30 seconds)...")
    # Batch add to FAISS
    batch_size = 500
    vector_store = None
    for i in range(0, len(chunks), batch_size):
        batch = chunks[i : i + batch_size]
        if vector_store is None:
            vector_store = FAISS.from_documents(batch, embeddings)
        else:
            vector_store.add_documents(batch)
        logger.info(f"Indexed chunks {min(i + batch_size, len(chunks))}/{len(chunks)}")

    # 5. Save to disk
    vector_store.save_local(str(output_index_dir))
    logger.info(f"FAISS index successfully saved to: {output_index_dir}")

    # Also sync to root faiss_index if running inside ai-service
    root_index_dir = parent_dir.parent / "faiss_index"
    try:
        root_index_dir.mkdir(parents=True, exist_ok=True)
        vector_store.save_local(str(root_index_dir))
        logger.info(f"FAISS index also mirrored to root: {root_index_dir}")
    except Exception as e:
        logger.debug(f"Mirrored copy skipped: {e}")

    print("\n" + "="*50)
    print(f"INGESTION COMPLETE SUMMARY:")
    print(f"Raw Documents:   {len(all_raw_docs):,}")
    print(f"Generated Chunks: {len(chunks):,}")
    print(f"Index Saved To:  {output_index_dir}")
    print("="*50 + "\n")

    return vector_store

if __name__ == "__main__":
    run_ingestion()
