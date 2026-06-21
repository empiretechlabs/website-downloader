var execFile = require('child_process').execFile;
var archiver = require('../archiver')


module.exports=(io,data)=>{

// download all website assets
/**
 * wget --mirror --convert-links --adjust-extension --page-requisites
 * --no-parent http://example.org
 * --mirror – Makes (among other things) the download recursive.
 * --convert-links – convert all the links (also to stuff like CSS stylesheets) to relative, so it will be suitable for offline viewing.
 * --adjust-extension – Adds suitable extensions to filenames (html or css) depending on their content-type.
 * --page-requisites – Download things like CSS style-sheets and images required to properly display the page offline.
 * --no-parent – When recurring do not ascend to the parent directory. It useful for restricting the download to only a portion of the site.
 */

// Guard against missing input
if (!data.website) {
    io.emit(data.token, {progress: "Error: no URL provided"})
    return;
}

// Extract hostname directly from the URL — much more reliable than parsing wget output
let website;
try {
    website = new URL(data.website).hostname;
} catch(e) {
    website = data.website.replace(/^https?:\/\//, '').split('/')[0];
}

// Use execFile (not exec) so the URL is passed as a direct argument to wget,
// preventing shell injection attacks.
const child = execFile('wget', [
    '-mkEp',
    '--no-parent',
    '--no-if-modified-since',
    data.website
]);

// wget writes progress to stderr
child.stderr.on("data",(response)=>{
    io.emit(data.token,{progress:response})
})

// Use the process-level close event (more reliable than child.stderr 'close')
child.on('close',(code)=>{
    if (code !== 0) {
        io.emit(data.token, {progress: `Error: wget exited with code ${code}`})
        return;
    }
    io.emit(data.token,{progress:"Converting"})
    archiver(website,io,data)
})
}
