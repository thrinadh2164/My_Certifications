/**
 * GalleryComponent - A production-grade gallery system
 * Features: Accessibility, Loading states, Empty states, Edge cases, OO Design
 */
class GalleryApp {
    constructor() {
        this.gallery = document.getElementById('gallery');
        this.filterBtns = document.querySelectorAll('.filter-btn');
        this.modal = document.getElementById('modal');
        this.closeBtn = document.getElementById('close-btn');
        this.allData = [];
        
        // Exclude specific photos as requested
        this.exclusionKeywords = [
            'fellow_president', 
            'rsvit_team', 
            'with_my_team', 
            'team_iconic',
            'gnaneshwar'
        ];

        this.init();
    }

    async init() {
        this.setupEventListeners();
        await this.fetchData();
    }

    setupEventListeners() {
        this.filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => this.handleFilterClick(e));
        });

        this.closeBtn.addEventListener('click', () => this.closeModal());
        
        this.modal.addEventListener('click', (e) => {
            if(e.target === this.modal) this.closeModal();
        });
        
        document.addEventListener('keydown', (e) => {
            if(e.key === 'Escape' && this.modal.classList.contains('active')) {
                this.closeModal();
            }
        });
    }

    shouldExclude(filename) {
        if (!filename) return false;
        const lowerName = filename.toLowerCase();
        return this.exclusionKeywords.some(keyword => lowerName.includes(keyword));
    }

    async fetchData() {
        this.renderLoading();
        try {
            // Append a timestamp to prevent aggressive browser caching of data.json
            const timestamp = new Date().getTime();
            const response = await fetch(`data.json?v=${timestamp}`);
            if (!response.ok) throw new Error("Failed to fetch gallery data");
            
            const rawData = await response.json();
            
            // Filter out excluded photos based on the requirements
            this.allData = rawData.filter(item => !this.shouldExclude(item.file));
            
            // Sort strictly by year descending (e.g. 2026 -> 2025 -> 2024)
            this.allData.sort((a, b) => {
                const getHighestYear = (yearStr) => {
                    let highest = 0;
                    if (!yearStr) return highest;
                    const parts = String(yearStr).split(/[-_ ]/);
                    for (let p of parts) {
                        if (p.length === 4 && !isNaN(p)) {
                            highest = Math.max(highest, parseInt(p));
                        } else if (p.length === 2 && !isNaN(p)) {
                            highest = Math.max(highest, 2000 + parseInt(p));
                        }
                    }
                    return highest;
                };
                return getHighestYear(b.year) - getHighestYear(a.year);
            });
            
            // Initial render
            this.renderGallery(this.allData);
        } catch (err) {
            console.error("Gallery initialization failed:", err);
            this.renderError();
        }
    }

    handleFilterClick(e) {
        const btn = e.target;
        this.filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        const filter = btn.dataset.filter;
        if(filter === 'all') {
            this.renderGallery(this.allData);
        } else {
            const filtered = this.allData.filter(item => item.category === filter);
            this.renderGallery(filtered);
        }
    }

    renderLoading() {
        this.gallery.innerHTML = `
            <div class="empty-state" role="status" aria-live="polite">
                <div class="spinner"></div>
                <p>Loading achievements...</p>
            </div>
        `;
    }

    renderError() {
        this.gallery.innerHTML = `
            <div class="empty-state" role="alert">
                <p>⚠️ Failed to load gallery data. Please try again later.</p>
            </div>
        `;
    }

    renderEmpty() {
        this.gallery.innerHTML = `
            <div class="empty-state" role="status">
                <p>No achievements found for this category yet.</p>
            </div>
        `;
    }

    renderGallery(items) {
        this.gallery.innerHTML = '';
        
        if (!items || items.length === 0) {
            this.renderEmpty();
            return;
        }

        const fragment = document.createDocumentFragment();

        items.forEach((item, index) => {
            // Cap staggered animation delay to prevent overly long waits
            const delay = Math.min(index * 0.05, 0.5); 
            
            const card = document.createElement('article');
            card.className = 'card';
            card.style.animationDelay = `${delay}s`;
            card.tabIndex = 0;
            card.setAttribute('role', 'button');
            card.setAttribute('aria-label', `View details for ${item.title}`);
            
            let mediaHtml = '';
            if(item.type === 'video') {
                mediaHtml = `<video class="card-media" src="${item.file}" muted loop onmouseover="this.play()" onmouseout="this.pause()" aria-hidden="true"></video>`;
            } else {
                mediaHtml = `<img class="card-media" src="${item.file}" alt="${item.title}" loading="lazy">`;
            }

            card.innerHTML = `
                ${mediaHtml}
                <div class="card-info">
                    <h3 class="card-title">${item.title || 'Achievement'}</h3>
                    <div class="card-meta">
                        <span>${item.year}</span>
                        <span class="badge">${item.source}</span>
                    </div>
                </div>
            `;
            
            // Mouse Interaction
            card.addEventListener('click', () => this.openModal(item));
            
            // Keyboard Interaction
            card.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.openModal(item);
                }
            });
            
            fragment.appendChild(card);
        });

        this.gallery.appendChild(fragment);
    }

    openModal(item) {
        document.getElementById('modal-title').textContent = item.title || 'Achievement';
        document.getElementById('modal-year').textContent = `Year: ${item.year}`;
        document.getElementById('modal-type').textContent = `Type: ${item.source}`;
        
        const container = document.getElementById('modal-media-container');
        if(item.type === 'video') {
            container.innerHTML = `<video src="${item.file}" controls autoplay style="width:100%" aria-label="Video for ${item.title}"></video>`;
        } else {
            container.innerHTML = `<img src="${item.file}" alt="${item.title}" style="width:100%">`;
        }
        
        this.modal.classList.add('active');
        this.modal.setAttribute('aria-hidden', 'false');
        
        // Trap focus or set focus to close button for accessibility
        this.closeBtn.focus();
    }

    closeModal() {
        this.modal.classList.remove('active');
        this.modal.setAttribute('aria-hidden', 'true');
        
        // Clear container to stop video playback
        document.getElementById('modal-media-container').innerHTML = ''; 
    }
}

// Bootstrap application
document.addEventListener('DOMContentLoaded', () => {
    new GalleryApp();
});
