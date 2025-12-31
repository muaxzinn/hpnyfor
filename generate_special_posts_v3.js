const fs = require('fs');
const path = require('path');

const linkIgPath = path.join(__dirname, 'linkIG.md');
const specialPostPath = path.join(__dirname, 'special_post.html');

try {
    const linkIgContent = fs.readFileSync(linkIgPath, 'utf8');
    const specialPostContent = fs.readFileSync(specialPostPath, 'utf8');

    const blockquoteRegex = /<blockquote class="instagram-media"[\s\S]*?<\/blockquote>/g;
    const matches = linkIgContent.match(blockquoteRegex);

    if (!matches || matches.length === 0) {
        console.error('No Instagram blockquotes found');
        process.exit(1);
    }

    let newPostsHtml = '';

    matches.forEach((quote, index) => {
        let cleanQuote = quote;

        // 1. Add class to the existing class attribute
        cleanQuote = cleanQuote.replace('class="instagram-media"', 'class="instagram-media ig-fallback-styled"');

        // 2. Remove the massive inline style entirely (replace with empty string)
        // Matches: style="...background:#FFF..."
        cleanQuote = cleanQuote.replace(/style="[^"]*background:#FFF[^"]*"/, '');

        // 3. Fix target="_blank" security risk
        cleanQuote = cleanQuote.replace(/target="_blank"/g, 'target="_blank" rel="noopener"');

        const isLast = index === matches.length - 1;

        newPostsHtml += `
        <!-- Post ${index + 1} -->
        <section class="snap-section">
            <div class="ig-post-wrapper">
                ${cleanQuote}
            </div>
            ${isLast ? `
            <a href="index.html" class="back-btn floating-back">
                <i class="ph-bold ph-arrow-left"></i> กลับหน้าแรก
            </a>` : ''}
        </section>\n`;
    });

    const startMarker = '<!-- Post 1 -->';
    const postStart = specialPostContent.indexOf(startMarker);
    const lastSectionIndex = specialPostContent.lastIndexOf('</section>');

    if (postStart === -1 || lastSectionIndex === -1) {
        console.error('Markers not found in special_post.html');
        process.exit(1);
    }

    // We replace from Post 1 start to the end of the last section tag
    const postEnd = lastSectionIndex + '</section>'.length;

    const finalContent =
        specialPostContent.substring(0, postStart) +
        newPostsHtml +
        specialPostContent.substring(postEnd);

    fs.writeFileSync(specialPostPath, finalContent, 'utf8');
    console.log('Successfully regenerated special_post.html with v3 (no duplicate classes)');

} catch (err) {
    console.error(err);
    process.exit(1);
}
