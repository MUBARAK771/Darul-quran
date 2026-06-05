document.addEventListener('DOMContentLoaded', () => {
    const navItems = document.querySelectorAll('.nav-item');
    const mobileItems = document.querySelectorAll('.mobile-nav-item');
    const views = document.querySelectorAll('.view');
    const sidebar = document.querySelector('.sidebar');
    const toggle = document.getElementById('toggleSidebar');

    function showView(name) {
        views.forEach(v => v.classList.toggle('active', v.id === name));
        navItems.forEach(b => b.classList.toggle('active', b.dataset.view === name));
        mobileItems.forEach(b => b.classList.toggle('active', b.dataset.view === name));
    }

    navItems.forEach(btn => {
        btn.addEventListener('click', () => {
            showView(btn.dataset.view);
            if (window.innerWidth <= 780) sidebar.classList.remove('open');
        });
    });

    mobileItems.forEach(btn => {
        btn.addEventListener('click', () => {
            showView(btn.dataset.view);
            sidebar.classList.remove('open');
        });
    });

    // Toggle sidebar on mobile
    if (toggle) {
        toggle.addEventListener('click', () => {
            sidebar.classList.toggle('open');
        });
    }

    // Sample data (replace with real API calls)
    const sampleApps = [
        {ref: 'APP_001', name: 'Aisha Bello', email: 'aisha@example.com', state: 'Lagos', country: 'Nigeria', status: 'Pending'},
        {ref: 'APP_002', name: 'Ibrahim Musa', email: 'ibrahim@example.com', state: 'Kano', country: 'Nigeria', status: 'Accepted'},
    ];

    const samplePayments = [
        {ref: 'PAY_1001', name: 'Aisha Bello', amount: 133000, email: 'aisha@example.com', status: 'Success'},
        {ref: 'PAY_1002', name: 'Ibrahim Musa', amount: 133000, email: 'ibrahim@example.com', status: 'Pending'},
    ];

    // Populate tables
    const appsTbody = document.querySelector('#applications-table tbody');
    sampleApps.forEach(a => {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td>${a.ref}</td><td>${a.name}</td><td>${a.email}</td><td>${a.state}</td><td>${a.country}</td><td>${a.status}</td>`;
        appsTbody.appendChild(tr);
    });

    const paysTbody = document.querySelector('#payments-table tbody');
    samplePayments.forEach(p => {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td>${p.ref}</td><td>${p.name}</td><td>₦${(p.amount).toLocaleString()}</td><td>${p.email}</td><td>${p.status}</td>`;
        paysTbody.appendChild(tr);
    });

    // Update overview counts
    document.getElementById('count-apps').textContent = sampleApps.length;
    document.getElementById('count-payments').textContent = samplePayments.filter(p => p.status === 'Success').length;
    document.getElementById('count-users').textContent = 42; // placeholder
});