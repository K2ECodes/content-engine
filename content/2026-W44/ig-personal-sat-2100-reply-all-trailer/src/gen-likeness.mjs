import * as kie from '/Users/koredekola/content-engine/scripts/lib/kie.mjs';
const [,, out, prompt, ...refs] = process.argv;
const image_input = await Promise.all(refs.map(f => kie.upload(f, 'likeness')));
const d = await kie.runTask('nano-banana-2', { prompt, image_input, aspect_ratio: '9:16', resolution: '2K', output_format: 'png' }, { label: 'reply-all likeness ' + out.split('/').pop(), estimateUsd: 0.09 });
await kie.download(d.result.resultUrls[0], out);
console.log('done', out);
