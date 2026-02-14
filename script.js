document.addEventListener('DOMContentLoaded', () => {
    const SUPABASE_URL = 'https://rbqvnuiaesljmzpeuhhn.supabase.co';
    const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJicXZudWlhZXNsam16cGV1aGhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA5OTYxNzksImV4cCI6MjA4NjU3MjE3OX0.4Kep4n5tOPvNi9yKQ4z3af8yL_4XoM46JRM-4ztxr6c';
    const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

    let currentLang = 'TH';

    async function fetchProjects() {
        const container = document.getElementById('projects-container');
        try {
            const { data: projects, error } = await supabaseClient
                .from('projects')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            if (projects) {
                container.innerHTML = ''; 
                projects.forEach(project => {
                    const card = document.createElement('div');
                    card.className = 'repo-card reveal-init';
                    
                    const description = currentLang === 'TH' ? project.description_th : project.description_en;

                    card.innerHTML = `
                        <div class="repo-header">
                            <a href="${project.link}" target="_blank" class="repo-link">${project.title}</a>
                            <span class="visibility">Public</span>
                        </div>
                        <p class="repo-desc">${description}</p>
                        <div class="repo-footer">
                            <span class="lang-dot" style="background: ${project.tech_color};"></span>
                            <span class="footer-item">${project.tech_stack}</span>
                        </div>
                    `;
                    container.appendChild(card);
                    setTimeout(() => card.classList.add('is-visible'), 100);
                });
            }
        } catch (err) {
            console.error('Error fetching projects:', err);
            container.innerHTML = '<p>Failed to load projects.</p>';
        }
    }

    async function handleViews() {
        try {
            const { data, error } = await supabaseClient.from('page_views').select('count').eq('id', 'main_counter').single();
            if (data) {
                const newCount = data.count + 1;
                await supabaseClient.from('page_views').update({ count: newCount }).eq('id', 'main_counter');
                document.getElementById('view-count').textContent = newCount.toLocaleString();
            }
        } catch (err) { console.error('View error:', err); }
    }

    const langBtn = document.getElementById('lang-switch');
    langBtn.addEventListener('click', () => {
        currentLang = currentLang === 'TH' ? 'EN' : 'TH';
        langBtn.textContent = currentLang === 'TH' ? 'EN' : 'TH';
        
        document.querySelectorAll('[data-th]').forEach(el => {
            el.textContent = currentLang === 'TH' ? el.getAttribute('data-th') : el.getAttribute('data-en');
        });

        fetchProjects();
    });

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    handleViews();
    fetchProjects();

    document.querySelectorAll('.hero-section, #about, .sidebar section, .divider').forEach(el => {
        el.classList.add('reveal-init');
        observer.observe(el);
    });
});
document.querySelectorAll('.nav-links a').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            window.scrollTo({
                top: target.offsetTop - 70,
                behavior: 'smooth'
            });
        }
    });
});