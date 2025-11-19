// Dashboard functionality
document.addEventListener('DOMContentLoaded', async () => {
    if (!isAuthenticated()) {
        window.location.href = 'login.html';
        return;
    }

    try {
        // Load user stats
        const stats = await apiRequest('/users/stats');
        document.getElementById('totalCourses').textContent = stats.totalCourses || 4;
        document.getElementById('lessonsCompleted').textContent = stats.lessonsCompleted || 0;
        document.getElementById('totalLessons').textContent = stats.totalLessons || 0;

        // Load courses for quick access
        const courses = await apiRequest('/courses');
        const quickCourses = document.getElementById('quickCourses');
        
        if (quickCourses && courses) {
            quickCourses.innerHTML = courses.slice(0, 4).map(course => `
                <a href="course.html?course=${course.slug}" class="course-card">
                    <div class="course-thumbnail">${course.thumbnail || '📚'}</div>
                    <div class="course-info">
                        <h3>${course.title}</h3>
                        <p>${course.description}</p>
                        <div class="course-meta">
                            <span>${course.lessons?.length || 0} Lessons</span>
                        </div>
                    </div>
                </a>
            `).join('');
        }
    } catch (error) {
        console.error('Error loading dashboard:', error);
    }
});



