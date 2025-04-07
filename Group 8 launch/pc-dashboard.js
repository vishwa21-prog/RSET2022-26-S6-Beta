document.addEventListener('DOMContentLoaded', function() {
    // Initialize Supabase
    const supabaseUrl = 'https://bawhzyetjzkeypszpeqr.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJhd2h6eWV0anprZXlwc3pwZXFyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzE1OTI4MzgsImV4cCI6MjA0NzE2ODgzOH0.KAzCjKkqixRLz522RA7_SNvWMQ9sJdga2BoQJPPw2Hg';
    window.supabase = supabase.createClient(supabaseUrl, supabaseKey);

    // Check authentication and initialize
    checkAuthAndInit();
});

async function checkAuthAndInit() {
    try {
        // Check authentication
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error || !session) {
            window.location.href = 'mainpage.html';
            return;
        }

        // Initialize dashboard after logo animation
        setTimeout(() => initDashboard(session.user.id), 2500);

    } catch (err) {
        console.error('Initialization error:', err);
        window.location.href = 'mainpage.html';
    }
}

async function initDashboard(userId) {
    try {
        // Show dashboard
        document.querySelector('.main-content').style.opacity = '1';
        
        // Load and display coordinator info
        await displayCoordinatorInfo(userId);
        
        // Setup other dashboard functionality
        setupMenuNavigation();
        setupJobForm();

    } catch (error) {
        console.error('Dashboard init failed:', error);
        // Fallback to showing at least PC initials
        document.getElementById('coordinatorInitials').textContent = 'PC';
    }
}

async function displayCoordinatorInfo(userId) {
    try {
        // 1. First verify we have a valid user ID
        if (!userId) {
            throw new Error('No user ID provided');
        }

        // 2. Query with both first_name and last_name
        const { data, error } = await supabase
            .from('placement_coordinators')
            .select('first_name, last_name')
            .eq('user_id', userId)
            .single();

        if (error) {
            console.error('Supabase error details:', error);
            throw error;
        }

        if (!data) {
            throw new Error('Coordinator record not found');
        }

        // 3. Construct full name from components
        const fullName = `${data.first_name} ${data.last_name}`.trim();
        
        // 4. Update UI elements
        const nameElement = document.getElementById('coordinatorName');
        const welcomeElement = document.getElementById('welcomeMessage');
        const avatarElement = document.getElementById('coordinatorInitials');

        if (nameElement) nameElement.textContent = fullName;
        if (welcomeElement) welcomeElement.textContent = `Welcome, ${data.first_name}`;
        
        // 5. Set avatar initials (first letter of first and last name)
        if (avatarElement) {
            const initials = data.first_name.charAt(0) + 
                           (data.last_name ? data.last_name.charAt(0) : '');
            avatarElement.textContent = initials;
        }

    } catch (error) {
        console.error('Error loading coordinator info:', error);
        
        // Fallback UI
        document.getElementById('coordinatorInitials').textContent = 'PC';
        document.getElementById('coordinatorName').textContent = 'Placement Coordinator';
        document.getElementById('welcomeMessage').textContent = 'Welcome';
        
        throw error;
    }
}

function setupMenuNavigation() {
    const menuItems = document.querySelectorAll('.menu-item');
    menuItems.forEach(item => {
        item.addEventListener('click', function() {
            const viewName = this.getAttribute('data-view');
            if (viewName) {
                showView(viewName);
                menuItems.forEach(i => i.classList.remove('active'));
                this.classList.add('active');
            }
        });
    });
}

function setupJobForm() {
    const form = document.getElementById('jobPostForm');
    const toggleBtn = document.getElementById('toggleJobForm');
    const cancelBtn = document.getElementById('cancelJobPost');

    if (toggleBtn && form) {
        toggleBtn.addEventListener('click', () => {
            form.style.display = form.style.display === 'none' ? 'block' : 'none';
        });
    }

    if (cancelBtn && form) {
        cancelBtn.addEventListener('click', () => {
            form.style.display = 'none';
        });
    }

    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            postNewJob();
        });
    }
}

function showView(viewName) {
    document.querySelectorAll('.view').forEach(v => v.style.display = 'none');
    const targetView = document.getElementById(`${viewName}View`);
    if (targetView) targetView.style.display = 'block';
}

async function postNewJob() {
    try {
        const form = document.getElementById('jobPostForm');
        const coordinatorId = localStorage.getItem('placement_coordinator_id');
        
        const jobData = {
            title: form.title.value,
            description: form.description.value,
            company: form.company.value,
            skills: form.skills.value.split(',').map(s => s.trim()),
            placement_coordinator_id: coordinatorId
        };

        const { error } = await supabase.from('jobs').insert([jobData]);
        if (error) throw error;

        alert('Job posted successfully!');
        form.reset();
        form.style.display = 'none';

    } catch (error) {
        console.error('Job posting failed:', error);
        alert('Failed to post job. Please try again.');
    }
}