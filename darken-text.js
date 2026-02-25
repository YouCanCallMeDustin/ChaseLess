const fs = require('fs');
const path = require('path');

function walk(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walk(dirPath, callback) : callback(path.join(dir, f));
    });
}

walk('./src', function (filePath) {
    if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
        let content = fs.readFileSync(filePath, 'utf8');
        let original = content;

        // Base text string replacements
        content = content.replace(/text-slate-500/g, 'text-slate-TEMP700');
        content = content.replace(/text-slate-400/g, 'text-slate-TEMP600');
        content = content.replace(/text-slate-300/g, 'text-slate-TEMP500');

        // Restore from placeholders
        content = content.replace(/text-slate-TEMP700/g, 'text-slate-700');
        content = content.replace(/text-slate-TEMP600/g, 'text-slate-600');
        content = content.replace(/text-slate-TEMP500/g, 'text-slate-500');

        // Explicitly force textarea and input to be dark text with white bg, if not already specified
        content = content.replace(/className="([^"]*(?:input|textarea)[^"]*)"/g, function (match, inner) {
            if (!inner.includes('text-slate-')) {
                return `className="${inner} text-slate-900 bg-white"`;
            }
            return match;
        });

        // Also just look for `<input` and `<textarea` that have className
        content = content.replace(/<textarea\s+([^>]*className=")([^"]+)(")/gi, function (match, pre, classes, post) {
            let nC = classes;
            if (!nC.includes('text-slate-')) nC += ' text-slate-900 bg-white';
            return `<textarea ${pre}${nC}${post}`;
        });

        content = content.replace(/<input\s+([^>]*className=")([^"]+)(")/gi, function (match, pre, classes, post) {
            let nC = classes;
            if (!nC.includes('text-slate-')) nC += ' text-slate-900 bg-white';
            return `<input ${pre}${nC}${post}`;
        });


        if (content !== original) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log('Updated ' + filePath);
        }
    }
});
