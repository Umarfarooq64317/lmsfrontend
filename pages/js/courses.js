// Courses page functionality
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const courses = await apiRequest('/courses');
        const coursesGrid = document.getElementById('coursesGrid');

        if (coursesGrid && courses) {
            coursesGrid.innerHTML = courses.map(course => `
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
        console.error('Error loading courses:', error);
    }
});



