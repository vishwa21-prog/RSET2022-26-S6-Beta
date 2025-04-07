// Modal Functions
function openApplyModal() {
    document.getElementById('applyModal').style.display = 'flex';
}

function closeApplyModal() {
    document.getElementById('applyModal').style.display = 'none';
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('applyModal');
    if (event.target == modal) {
        closeApplyModal();
    }
}

// Form submission
document.getElementById('applicationForm').addEventListener('submit', function(e) {
    e.preventDefault();
    alert('Application submitted successfully!');
    closeApplyModal();
});