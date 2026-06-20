# Minimal Academic Website Template

A clean, modern, and minimal academic website template designed specifically for researchers, undergraduate/graduate students, and PhD candidates to showcase their education, professional experiences, publications, and projects.

The design and source code are adapted from [Yuhui Zhang's academic website](https://cs.stanford.edu/~yuhuiz/).

## Features

- **Segmented Tab Navigation**: Restructured the single-page layout into a dynamic tabbed interface (About me, Research, Projects).
- **Dynamic JSON Data Layer**: Manage all content (papers, patents, presentations, certifications, news feed, and projects) easily from a single config file (`publications.json`).
- **Responsive Layout**: Adapts gracefully to all screen sizes, including stacked tab controls and typography auto-scaling on mobile devices.
- **Dynamic Profile Photo Handling**: Supports images of any aspect ratio (portrait, landscape, or square) using CSS `clamp()` and aspect-ratio parameters, with soft rounded card corners.
- **Unified Visual Geometry**: Clean separator borders and vertical midpoint alignment for thumbnails and detail items.
- **SEO-friendly**: Contains meta tags optimized for search engine crawlability.

## Who This Template Is For

This template is ideal for:
- Undergraduate and graduate students preparing portfolios.
- PhD candidates and researchers who want a minimal, professional workspace to present publications.
- Academics looking for a clean, single-page-app (SPA) style portfolio that requires zero complex frameworks (HTML/Vanilla CSS/JavaScript).

## Customizations from the Original Template

Compared to the original template (by Yuhui Zhang), we made the following enhancements:
1. **Layout Reorganization**: Transitioned from a vertically-stacked single page to a tabbed design utilizing client-side switching for a faster, SPA-like feel.
2. **Unified Dynamic Rendering**:
   - The original template only loaded publications dynamically. This updated template loads **News**, **Projects** (categorized into general projects, DL experiments, and open-source contributions), and **Research** subdivisions (papers, patents, poster presentations, and certifications) dynamically from `publications.json`.
3. **Advanced CSS Grid & Spacing**:
   - Integrated vertical centering for item rows to balance thumbnail sizes against text content.
   - Symmetrized vertical paddings so borders divide list items evenly.
   - Configured uniform section margins (the gap from a header border to the first item matches the separator-to-item spacing).
4. **Mobile Layout Optimizations**:
   - Implemented vertical stacking for tab toggles on mobile screens.
   - Scaled font sizes proportionally (important headers decreased slightly, while content and descriptions scaled down more to keep contrast and readable hierarchy).
5. **Fluid Profile Photo Layout**:
   - Replaced fixed dimensions and absolute circular bounds with viewport-fluid max-bounds (`clamp`) and soft-rounded card borders to dynamically support rectangular uploads.

## Quick Start

1. Clone or download this repository.
2. Run a local web server (e.g., `python -m http.server 8000`) and visit `http://localhost:8000`.
3. Open `publications.json` and fill out your publications, news milestones, and project details.
4. Open `index.html` and replace brackets (e.g., `[Name]`) with your own info.
5. Save your profile photo as `images/profile.jpg`.

## File Structure

```
.
├── index.html          # Main webpage layout
├── styles.css          # Core CSS styling and media queries
├── scripts.js          # Tab-routing & dynamic JSON rendering
├── publications.json   # Your central data config file
└── images/            # Image assets
    ├── profile.jpg    # Your profile picture
    └── thumbs/        # Publication & project thumbnails
```

## License

MIT License
