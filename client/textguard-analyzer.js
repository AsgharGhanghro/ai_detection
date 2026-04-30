

const API_BASE = 'http://127.0.0.1:5000';


let currentMode = 'ai';       
let isAnalyzing  = false;
let lastResults  = null;


document.addEventListener('DOMContentLoaded', () => {
    initAnalyzer();
});

function initAnalyzer() {
    // Mode buttons
    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentMode = btn.dataset.mode;
        });
    });

    // Analyze button
    const analyzeBtn = document.getElementById('analyze-btn');
    if (analyzeBtn) {
        analyzeBtn.addEventListener('click', runAnalysis);
    }

    // File upload button
    const uploadBtn = document.getElementById('upload-btn');
    const fileInput = document.getElementById('file-input');
    if (uploadBtn && fileInput) {
        uploadBtn.addEventListener('click', () => fileInput.click());
        fileInput.addEventListener('change', handleFileUpload);
    }

    // Paste button
    const pasteBtn = document.getElementById('paste-btn');
    if (pasteBtn) {
        pasteBtn.addEventListener('click', async () => {
            try {
                const text = await navigator.clipboard.readText();
                const textarea = document.getElementById('text-input');
                if (textarea) {
                    textarea.value = text;
                    updateCounts(text);
                    showNotification('Text pasted!', 'success');
                }
            } catch {
                showNotification('Clipboard access denied — paste manually', 'warning');
            }
        });
    }

    // Clear button
    const clearBtn = document.getElementById('clear-btn');
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            const textarea = document.getElementById('text-input');
            if (textarea) { textarea.value = ''; updateCounts(''); }
            hideResults();
        });
    }

    // Live char/word count
    const textarea = document.getElementById('text-input');
    if (textarea) {
        textarea.addEventListener('input', () => updateCounts(textarea.value));
    }
}


function updateCounts(text) {
    const charEl = document.getElementById('char-count');
    const wordEl = document.getElementById('word-count');
    if (charEl) charEl.textContent = text.length.toLocaleString();
    if (wordEl) wordEl.textContent = text.trim() ? text.trim().split(/\s+/).length.toLocaleString() : 0;
}


async function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const allowedTypes = ['text/plain', 'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/msword'];
    const allowedExts = ['.txt', '.pdf', '.docx', '.doc'];
    const ext = '.' + file.name.split('.').pop().toLowerCase();

    if (!allowedExts.includes(ext)) {
        showNotification('Unsupported file type. Use TXT, PDF, or DOCX.', 'error');
        return;
    }

    showNotification(`Reading ${file.name}…`, 'info');

    // TXT → read directly in browser
    if (ext === '.txt') {
        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target.result;
            const textarea = document.getElementById('text-input');
            if (textarea) { textarea.value = text; updateCounts(text); }
            showNotification('File loaded!', 'success');
        };
        reader.onerror = () => showNotification('Could not read file', 'error');
        reader.readAsText(file);
        return;
    }

    // PDF / DOCX → send to backend for extraction then analyze immediately
    showNotification('Uploading and extracting text…', 'info');
    const formData = new FormData();
    formData.append('file', file);
    formData.append('mode', currentMode);

    try {
        setAnalyzing(true);
        const response = await fetch(`${API_BASE}/api/analyze`, {
            method: 'POST',
            body: formData
        });
        const data = await response.json();

        if (!data.success) {
            throw new Error(data.error || 'Server error');
        }

        lastResults = data;
        renderResults(data);
        showNotification(`File analyzed in ${data.analysis_time}s`, 'success');
    } catch (err) {
        console.error('File analysis error:', err);
        showNotification('Error: ' + err.message, 'error');
        showResultsError(err.message);
    } finally {
        setAnalyzing(false);
        event.target.value = '';   // reset input so same file can be re-uploaded
    }
}


async function runAnalysis() {
    if (isAnalyzing) return;

    const textarea = document.getElementById('text-input');
    const text = textarea ? textarea.value.trim() : '';

    if (!text) {
        showNotification('Please enter or upload some text first', 'warning');
        return;
    }

    if (text.length < 20) {
        showNotification('Text is too short for reliable analysis (min 20 chars)', 'warning');
        return;
    }

    try {
        setAnalyzing(true);
        const response = await fetch(`${API_BASE}/api/analyze`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text, mode: currentMode })
        });

        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.error || `HTTP ${response.status}`);
        }

        const data = await response.json();
        if (!data.success) throw new Error(data.error || 'Analysis failed');

        lastResults = data;
        renderResults(data);
        showNotification(`Analyzed in ${data.analysis_time}s`, 'success');

    } catch (err) {
        console.error('Analysis error:', err);
        showNotification('Analysis failed: ' + err.message, 'error');
        showResultsError(err.message);
    } finally {
        setAnalyzing(false);
    }
}


function setAnalyzing(active) {
    isAnalyzing = active;
    const btn  = document.getElementById('analyze-btn');
    const load = document.getElementById('loading-state');
    const cont = document.getElementById('results-content');

    if (btn) {
        btn.disabled = active;
        btn.innerHTML = active
            ? '<i class="fas fa-spinner fa-spin"></i> Analyzing…'
            : '<i class="fas fa-search"></i> Analyze Text';
    }
    if (load) load.style.display = active ? 'flex' : 'none';
    if (cont && active) cont.style.display = 'none';

    // Show results panel if hidden
    const panel = document.getElementById('results-panel');
    if (panel && active) panel.style.display = 'block';
}

function hideResults() {
    const load = document.getElementById('loading-state');
    const cont = document.getElementById('results-content');
    if (load) load.style.display = 'none';
    if (cont) cont.style.display = 'none';
}

function showResultsError(msg) {
    const cont = document.getElementById('results-content');
    if (!cont) return;
    cont.style.display = 'block';
    const report = document.getElementById('detailed-report-content');
    if (report) {
        report.innerHTML = `
            <div style="color:#ef4444;padding:1rem;background:rgba(239,68,68,.1);
                        border-radius:8px;border:1px solid rgba(239,68,68,.3);">
                <i class="fas fa-exclamation-circle"></i> ${escHtml(msg)}
            </div>`;
    }
}


function renderResults(data) {
    const cont = document.getElementById('results-content');
    if (!cont) return;
    cont.style.display = 'block';

    const r = data.results;
    const isAI   = data.mode === 'ai'   || data.mode === 'both';
    const isPlag = data.mode === 'plagiarism' || data.mode === 'both';

  
    let scoreVal = 0;
    let scoreLabel = '';

    if (isAI && r.ai_detection) {
        scoreVal   = Math.round(r.ai_detection.ai_probability * 100);
        scoreLabel = 'AI Content';
    } else if (isPlag && r.plagiarism) {
        scoreVal   = Math.round(r.plagiarism.plagiarism_score * 100);
        scoreLabel = 'Plagiarism';
    }

    const scoreEl = document.getElementById('score-value');
    const labelEl = document.getElementById('score-label');
    if (scoreEl) scoreEl.textContent = scoreVal + '%';
    if (labelEl) labelEl.textContent = scoreLabel;

    // Animate SVG circle
    const circle = document.getElementById('score-progress');
    if (circle) {
        const r90 = 90;
        const circ = 2 * Math.PI * r90;
        const dash = circ * (1 - scoreVal / 100);
        circle.style.strokeDasharray  = circ;
        circle.style.strokeDashoffset = dash;
        // Color by severity
        const color = scoreVal > 70 ? '#ef4444' : scoreVal > 40 ? '#f59e0b' : '#10b981';
        circle.style.stroke = color;
        if (scoreEl) scoreEl.style.color = color;
    }

   
    const confEl  = document.getElementById('confidence-value');
    const sentEl  = document.getElementById('sentences-value');
    const timeEl  = document.getElementById('time-value');

    const src = isAI ? r.ai_detection : r.plagiarism;
    if (confEl) confEl.textContent = src ? Math.round(src.confidence * 100) + '%' : '—';
    if (sentEl) sentEl.textContent = (isAI && r.ai_detection) ? r.ai_detection.sentence_count : '—';
    if (timeEl) timeEl.textContent = data.analysis_time + 's';

    
    const hlEl = document.getElementById('highlighted-text');
    if (hlEl) {
        if (isAI && r.ai_detection && r.ai_detection.sentence_predictions.length) {
            hlEl.innerHTML = buildHighlightedHTML(r.ai_detection.sentence_predictions, 'ai');
        } else if (isPlag && r.plagiarism && r.plagiarism.matched_sections.length) {
            hlEl.innerHTML = buildHighlightedHTML(r.plagiarism.matched_sections, 'plagiarism');
        } else {
            const textarea = document.getElementById('text-input');
            const raw = textarea ? escHtml(textarea.value.trim()) : '';
            hlEl.innerHTML = `<span class="human-highlight">${raw}</span>`;
        }
    }

   
    const reportEl = document.getElementById('detailed-report-content');
    if (reportEl) {
        reportEl.innerHTML = buildDetailedReport(data);
    }
}

function buildHighlightedHTML(predictions, type) {
    return predictions.map(p => {
        let cls = 'human-highlight';
        if (type === 'ai' && p.is_ai)   cls = 'ai-highlight';
        if (type === 'plagiarism')       cls = 'plagiarism-highlight';
        const conf = p.confidence ? ` (${Math.round(p.confidence * 100)}%)` : '';
        return `<span class="${cls}" title="${cls.replace('-highlight','').toUpperCase()}${conf}">${escHtml(p.text)} </span>`;
    }).join(' ');
}

function buildDetailedReport(data) {
    const r = data.results;
    let html = '';

    
    if (r.ai_detection) {
        const ai = r.ai_detection;
        const pct = Math.round(ai.ai_probability * 100);
        const verdict = pct > 70 ? '🤖 Likely AI-Generated'
                      : pct > 40 ? '⚠️ Mixed Content'
                                 : '✅ Likely Human-Written';
        const color = pct > 70 ? '#ef4444' : pct > 40 ? '#f59e0b' : '#10b981';

        html += `
            <div class="report-section" style="margin-bottom:1.5rem;padding:1rem;
                 background:rgba(0,0,0,.15);border-radius:12px;
                 border-left:3px solid ${color}">
                <h5 style="color:${color};margin-bottom:.75rem;">
                    <i class="fas fa-robot"></i> AI Detection
                </h5>
                <div class="report-row">
                    <span>Verdict</span>
                    <strong style="color:${color}">${verdict}</strong>
                </div>
                <div class="report-row">
                    <span>AI Probability</span>
                    <strong>${pct}%</strong>
                </div>
                <div class="report-row">
                    <span>Confidence</span>
                    <strong>${Math.round(ai.confidence * 100)}%</strong>
                </div>
                <div class="report-row">
                    <span>Sentences Analyzed</span>
                    <strong>${ai.sentence_count}</strong>
                </div>
                <div class="report-row">
                    <span>Method</span>
                    <strong>${ai.analysis_method === 'model' ? '🧠 ML Model' : '🔍 Heuristic'}</strong>
                </div>
                ${ai.sentence_predictions.length ? `
                <div style="margin-top:.75rem;font-size:.8rem;color:var(--text-secondary)">
                    AI sentences: ${ai.sentence_predictions.filter(s=>s.is_ai).length} /
                    ${ai.sentence_predictions.length}
                </div>` : ''}
            </div>`;
    }


    if (r.plagiarism) {
        const pl = r.plagiarism;
        const pct = Math.round(pl.plagiarism_score * 100);
        const verdict = pct > 50 ? '🚨 High Plagiarism Risk'
                      : pct > 20 ? '⚠️ Moderate Risk'
                                 : '✅ Mostly Original';
        const color = pct > 50 ? '#ef4444' : pct > 20 ? '#f59e0b' : '#10b981';

        html += `
            <div class="report-section" style="margin-bottom:1.5rem;padding:1rem;
                 background:rgba(0,0,0,.15);border-radius:12px;
                 border-left:3px solid ${color}">
                <h5 style="color:${color};margin-bottom:.75rem;">
                    <i class="fas fa-copy"></i> Plagiarism Check
                </h5>
                <div class="report-row">
                    <span>Verdict</span>
                    <strong style="color:${color}">${verdict}</strong>
                </div>
                <div class="report-row">
                    <span>Plagiarism Score</span>
                    <strong>${pct}%</strong>
                </div>
                <div class="report-row">
                    <span>Original Content</span>
                    <strong style="color:#10b981">${Math.round(pl.original_percentage)}%</strong>
                </div>
                <div class="report-row">
                    <span>Matched Sections</span>
                    <strong>${pl.matched_sections.length}</strong>
                </div>
                ${pl.matched_sections.length ? `
                <div style="margin-top:.75rem">
                    <strong style="font-size:.85rem;color:var(--text-secondary)">
                        Flagged Sections:
                    </strong>
                    ${pl.matched_sections.slice(0,3).map(m => `
                        <div style="margin-top:.5rem;padding:.5rem;background:rgba(239,68,68,.08);
                                    border-radius:8px;font-size:.82rem;">
                            <em>${escHtml(m.text.substring(0, 120))}${m.text.length > 120 ? '…' : ''}</em>
                            <span style="float:right;color:#ef4444">
                                ${Math.round(m.similarity * 100)}% match
                            </span>
                        </div>`).join('')}
                </div>` : ''}
            </div>`;
    }

   
    html += `
        <div style="font-size:.8rem;color:var(--text-secondary);
                    padding:.5rem;border-top:1px solid var(--border-color);margin-top:.5rem">
            <i class="fas fa-info-circle"></i>
            Analyzed ${data.text_length.toLocaleString()} characters in ${data.analysis_time}s
        </div>`;

    // Add CSS for report rows if not present
    if (!document.getElementById('report-row-style')) {
        const s = document.createElement('style');
        s.id = 'report-row-style';
        s.textContent = `
            .report-row {
                display:flex;justify-content:space-between;align-items:center;
                padding:.35rem 0;border-bottom:1px solid rgba(255,255,255,.05);
                font-size:.88rem;color:var(--text-secondary);
            }
            .report-row strong { color:var(--text-primary); }
        `;
        document.head.appendChild(s);
    }

    return html;
}


function escHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}