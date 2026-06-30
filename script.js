document.addEventListener('DOMContentLoaded', async () => {
    const gallery = document.getElementById('gallery');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const modal = document.getElementById('modal');
    const closeBtn = document.getElementById('close-btn');
    
    let allData = [];

    // Fetch Data
    try {
        const response = await fetch('data.json');
        allData = await response.json();
        renderGallery(allData);
    } catch (err) {
        console.error("Error loading data:", err);
    }

    // Filtering
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const filter = btn.dataset.filter;
            if(filter === 'all') {
                renderGallery(allData);
            } else {
                const filtered = allData.filter(item => item.category === filter);
                renderGallery(filtered);
            }
        });
    });

    // Render Gallery
    function renderGallery(items) {
        gallery.innerHTML = '';
        items.forEach((item, index) => {
            const delay = (index % 10) * 0.05;
            const card = document.createElement('div');
            card.className = 'card';
            card.style.animationDelay = `${delay}s`;
            
            let mediaHtml = '';
            if(item.type === 'video') {
                mediaHtml = `<video class="card-media" src="${item.file}" muted loop onmouseover="this.play()" onmouseout="this.pause()"></video>`;
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
            
            card.addEventListener('click', () => openModal(item));
            gallery.appendChild(card);
        });
    }

    // Modal logic
    function openModal(item) {
        document.getElementById('modal-title').textContent = item.title || 'Achievement';
        document.getElementById('modal-year').textContent = `Year: ${item.year}`;
        document.getElementById('modal-type').textContent = `Type: ${item.source}`;
        
        const container = document.getElementById('modal-media-container');
        if(item.type === 'video') {
            container.innerHTML = `<video src="${item.file}" controls autoplay style="width:100%"></video>`;
        } else {
            container.innerHTML = `<img src="${item.file}" alt="${item.title}" style="width:100%">`;
        }
        
        modal.classList.add('active');
    }

    closeBtn.addEventListener('click', () => {
        modal.classList.remove('active');
        document.getElementById('modal-media-container').innerHTML = ''; // stop video
    });

    modal.addEventListener('click', (e) => {
        if(e.target === modal) {
            modal.classList.remove('active');
            document.getElementById('modal-media-container').innerHTML = '';
        }
    });
});
