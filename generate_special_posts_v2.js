const fs = require('fs');
const path = require('path');

const linkIgPath = path.join(__dirname, 'linkIG.md');
const specialPostPath = path.join(__dirname, 'special_post.html');
const stylePath = path.join(__dirname, 'css', 'style.css');

try {
    // 1. Update CSS if needed
    let styleContent = fs.readFileSync(stylePath, 'utf8');
    if (!styleContent.includes('.ig-fallback-styled')) {
        const newCss = `
/* Instagram Embed Fallback Style */
.ig-fallback-styled {
    background: #FFF; 
    border: 0; 
    border-radius: 3px; 
    box-shadow: 0 0 1px 0 rgba(0,0,0,0.5), 0 1px 10px 0 rgba(0,0,0,0.15); 
    margin: 1px; 
    max-width: 540px; 
    min-width: 326px; 
    padding: 0; 
    width: 99.375%; 
    width: -webkit-calc(100% - 2px); 
    width: calc(100% - 2px);
}`;
        fs.appendFileSync(stylePath, newCss);
        console.log('Appended .ig-fallback-styled to style.css');
    }

    // 2. Process HTML
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

        // Remove massive inline style from blockquote and add class
        // Matches: style="...stuff..."
        // We use a non-greedy match for the content of style string
        cleanQuote = cleanQuote.replace(/style="[^"]*background:#FFF[^"]*"/, 'class="instagram-media ig-fallback-styled"');
        // Note: The original tag has class="instagram-media". If we replace the style attr, we should ensure we don't duplicate class or remove it if it was separate.
        // Actually the original is <blockquote class="instagram-media" ... style="...">
        // If I simply replace `style="..."` with nothing, the class remains. 
        // But I want to ADD `ig-fallback-styled` to the class.

        // Let's do a more robust replacement.
        // Remove the specific long style string.
        cleanQuote = cleanQuote.replace(/style=" background:#FFF; border:0;[^"]*"/, '');

        // Add the class to the existing class attribute
        cleanQuote = cleanQuote.replace('class="instagram-media"', 'class="instagram-media ig-fallback-styled"');

        // Fix target="_blank" security risk
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

    // Replace in special_post.html
    const startMarker = '<!-- Post 1 -->';
    const postStart = specialPostContent.indexOf(startMarker);
    const lastSectionIndex = specialPostContent.lastIndexOf('</section>');

    // Check if we can find the end of the post area properly. 
    // The previous script wrote: ... </section> (newline) </div>
    // We want to replace up to the LAST </section>.

    if (postStart === -1 || lastSectionIndex === -1) {
        console.error('Markers not found in special_post.html');
        process.exit(1);
    }

    const postEnd = lastSectionIndex + '</section>'.length;

    const finalContent =
        specialPostContent.substring(0, postStart) +
        newPostsHtml +
        specialPostContent.substring(postEnd);

    fs.writeFileSync(specialPostPath, finalContent, 'utf8');
    console.log('Successfully refactored special_post.html');

} catch (err) {
    console.error(err);
    process.exit(1);
}
