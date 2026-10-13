const status = document.querySelector('#status');
const refresh = document.querySelector('#refresh');
const section = document.querySelector('#delivery');
const video = document.querySelector('#video');
async function loadFinal() {
  refresh.disabled = true;
  status.textContent = '正在核对成片…';
  try {
    const response = await fetch('/api/final', {cache:'no-store'});
    if (!response.ok) throw new Error('读取状态失败');
    const result = await response.json();
    status.textContent = result.message;
    if(result.title){document.querySelector('#title').textContent=result.title+' · '+(result.pageLabel || '最终成片');document.title=document.querySelector('#title').textContent;}
    section.hidden = !result.ready;
    if (result.ready) {
      if (video.getAttribute('src') !== result.videoUrl) video.src = result.videoUrl;
      document.querySelector('#download').download = result.filename;
      document.querySelector('#download').textContent=result.deliveryKind==='example-preview'?'下载示例视频':'下载成片';
      document.querySelector('#details').textContent = `${result.displayLabel} · ${result.filename} · ${(result.size / 1024 / 1024).toFixed(1)} MB · SHA-256 ${result.sha256}`;
    } else {
      video.pause(); video.removeAttribute('src'); video.load();
    }
  } catch {
    status.textContent = '暂时无法读取成片状态，请刷新重试。';
    section.hidden = true; video.pause(); video.removeAttribute('src'); video.load();
  } finally { refresh.disabled = false; }
}
refresh.addEventListener('click', loadFinal);
loadFinal();
