// Storage Key
const DB_KEY = 'rlinks_db_v2';
let links = JSON.parse(localStorage.getItem(DB_KEY)) || [];

/* ============================
   NAVIGATION & EXIT LOGIC
   ============================ */
function enterDashboard() {
    document.getElementById('landingPage').style.display = 'none';
    document.getElementById('dashboard').style.display = 'flex';
    renderRecentLinks();
}

// The "Exit from Whole Application" Logic
function exitApp() {
    document.getElementById('dashboard').style.display = 'none';
    document.getElementById('landingPage').style.display = 'flex';
}

function toggleOptions() {
    const opts = document.getElementById('manualOptions');
    opts.classList.toggle('hidden');
}

/* ============================
   SMART AUTO-DETECTION LOGIC
   ============================ */
function detectCategory(url) {
    const lower = url.toLowerCase();

    // 1. STREAM (Specific Logic: Youtube is Stream, not just video)
    if (lower.includes('youtube') || lower.includes('twitch') || lower.includes('netflix') || lower.includes('disney') || lower.includes('hulu')) {
        return { name: "Stream", class: "bg-stream" };
    }
    
    // 2. AI CHATBOT (Specific Logic for ChatGPT, Gemini)
    if (lower.includes('chatgpt') || lower.includes('openai') || lower.includes('gemini') || lower.includes('bard') || lower.includes('claude') || lower.includes('poe.com')) {
        return { name: "AI Chatbot", class: "bg-ai" };
    }

    // 3. DEV
    if (lower.includes('github') || lower.includes('stackoverflow') || lower.includes('gitlab') || lower.includes('codepen') || lower.includes('localhost')) {
        return { name: "Dev", class: "bg-dev" };
    }

    // 4. WORK / PRODUCTIVITY
    if (lower.includes('docs.google') || lower.includes('drive') || lower.includes('notion') || lower.includes('trello') || lower.includes('slack') || lower.includes('office')) {
        return { name: "Work", class: "bg-work" };
    }

    // 5. CLOUD
    if (lower.includes('aws') || lower.includes('azure') || lower.includes('dropbox') || lower.includes('onedrive')) {
        return { name: "Cloud", class: "bg-cloud" };
    }

    // 6. SOCIAL
    if (lower.includes('instagram') || lower.includes('facebook') || lower.includes('twitter') || lower.includes('x.com') || lower.includes('linkedin')) {
        return { name: "Social", class: "bg-social" };
    }

    // DEFAULT
    return { name: "Other", class: "bg-other" };
}

/* ============================
   CRUD OPERATIONS (Add, Mod, Del)
   ============================ */

function addLink() {
    const urlInput = document.getElementById('linkInput');
    const nameInput = document.getElementById('manualName');
    const catSelect = document.getElementById('manualCategory');

    const url = urlInput.value.trim();
    if (!url) return alert("Please enter a URL");

    // Logic: Use Manual category if selected, otherwise Auto-Detect
    let catObj;
    if (catSelect.value !== "Auto") {
        // Map selection to CSS class manually
        const map = {
            "Stream": "bg-stream", "AI Chatbot": "bg-ai", "Dev": "bg-dev",
            "Social": "bg-social", "Work": "bg-work", "Cloud": "bg-cloud"
        };
        catObj = { name: catSelect.value, class: map[catSelect.value] || "bg-other" };
    } else {
        catObj = detectCategory(url);
    }

    // Name logic: Use manual name or Domain name
    let finalName = nameInput.value.trim();
    if (!finalName) {
        try {
            const domain = new URL(url).hostname.replace('www.', '');
            finalName = domain;
        } catch (e) {
            finalName = "Link";
        }
    }

    const newLink = {
        id: Date.now(),
        url: url,
        name: finalName,
        category: catObj.name,
        badgeClass: catObj.class,
        date: new Date().toISOString()
    };

    links.unshift(newLink);
    saveDB();
    
    // Clear Form
    urlInput.value = "";
    nameInput.value = "";
    catSelect.value = "Auto";
    document.getElementById('manualOptions').classList.add('hidden'); // hide advanced again

    renderRecentLinks();
    if (document.getElementById('allLinksOverlay').classList.contains('active')) {
        renderAllLinks();
    }
}

function deleteLink(id) {
    if (confirm("Delete this link permanently?")) {
        links = links.filter(l => l.id !== id);
        saveDB();
        renderRecentLinks();
        renderAllLinks();
    }
}

// --- MODIFY / EDIT FUNCTIONS ---
let currentEditId = null;

function openEditModal(id) {
    const link = links.find(l => l.id === id);
    if (!link) return;

    currentEditId = id;
    document.getElementById('editName').value = link.name;
    document.getElementById('editUrl').value = link.url;
    document.getElementById('editCategory').value = link.category; // Try to match value
    
    document.getElementById('editModal').classList.add('active');
}

function closeEditModal() {
    document.getElementById('editModal').classList.remove('active');
    currentEditId = null;
}

function saveEdit() {
    if (!currentEditId) return;

    const newName = document.getElementById('editName').value;
    const newUrl = document.getElementById('editUrl').value;
    const newCatName = document.getElementById('editCategory').value;

    // Get CSS class for new category
    const map = {
        "Stream": "bg-stream", "AI Chatbot": "bg-ai", "Dev": "bg-dev",
        "Social": "bg-social", "Work": "bg-work", "Cloud": "bg-cloud", "Other": "bg-other"
    };
    const newClass = map[newCatName] || "bg-other";

    // Update Array
    const index = links.findIndex(l => l.id === currentEditId);
    if (index !== -1) {
        links[index].name = newName;
        links[index].url = newUrl;
        links[index].category = newCatName;
        links[index].badgeClass = newClass;
        saveDB();
        
        closeEditModal();
        renderRecentLinks();
        renderAllLinks();
    }
}

function saveDB() {
    localStorage.setItem(DB_KEY, JSON.stringify(links));
}

/* ============================
   RENDERING
   ============================ */

function renderRecentLinks() {
    const list = document.getElementById('recentLinksList');
    list.innerHTML = "";
    const recent = links.slice(0, 5);
    
    if(recent.length === 0) {
        list.innerHTML = `<div style="text-align:center; color:#555;">No links detected.</div>`;
        return;
    }
    
    recent.forEach(l => list.innerHTML += createRowHTML(l));
}

function renderAllLinks() {
    const list = document.getElementById('allLinksList');
    const term = document.getElementById('searchBar').value.toLowerCase();
    list.innerHTML = "";

    const filtered = links.filter(l => 
        l.name.toLowerCase().includes(term) || 
        l.url.toLowerCase().includes(term) ||
        l.category.toLowerCase().includes(term)
    );

    if(filtered.length === 0) {
        list.innerHTML = `<div style="text-align:center; color:#555;">No matches found.</div>`;
        return;
    }

    filtered.forEach(l => list.innerHTML += createRowHTML(l));
}

function createRowHTML(link) {
    return `
    <div class="link-line">
        <div class="line-left">
            <span class="cat-badge ${link.badgeClass}">${link.category}</span>
            <div class="link-details">
                <a href="${link.url}" target="_blank" class="link-name">${link.name}</a>
                <span class="link-url-sub">${link.url}</span>
            </div>
        </div>
        <div class="line-actions">
            <button class="icon-btn btn-edit" onclick="openEditModal(${link.id})" title="Modify">
                <i class="fa-solid fa-pen"></i>
            </button>
            <button class="icon-btn btn-del" onclick="deleteLink(${link.id})" title="Delete">
                <i class="fa-solid fa-trash"></i>
            </button>
        </div>
    </div>
    `;
}

// Overlay Controls
function openAllLinks() {
    renderAllLinks();
    document.getElementById('allLinksOverlay').classList.add('active');
}
function closeAllLinks() {
    document.getElementById('allLinksOverlay').classList.remove('active');
}