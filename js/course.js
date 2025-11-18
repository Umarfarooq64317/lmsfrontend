// Course page functionality
let currentCourse = null;
let currentLesson = null;
let allLessons = [];

document.addEventListener('DOMContentLoaded', async () => {
    // Get course slug from URL
    const urlParams = new URLSearchParams(window.location.search);
    const courseSlug = urlParams.get('course');

    if (!courseSlug) {
        window.location.href = 'courses.html';
        return;
    }

    try {
        // Load course data
        const course = await apiRequest(`/courses/${courseSlug}`);
        currentCourse = course;
        allLessons = course.lessons || [];

        // Update page title
        document.getElementById('courseTitle').textContent = course.title;

        // Render lessons list
        renderLessonsList();

        // Load first lesson if available
        if (allLessons.length > 0) {
            const lessonSlug = urlParams.get('lesson') || allLessons[0].slug;
            loadLesson(lessonSlug);
        }
    } catch (error) {
        console.error('Error loading course:', error);
        document.getElementById('lessonContent').innerHTML = '<p>Error loading course. Please try again.</p>';
    }

    // Setup navigation buttons
    document.getElementById('prevLesson')?.addEventListener('click', () => {
        if (currentLesson?.prevLesson) {
            loadLesson(currentLesson.prevLesson.slug);
        }
    });

    document.getElementById('nextLesson')?.addEventListener('click', () => {
        if (currentLesson?.nextLesson) {
            loadLesson(currentLesson.nextLesson.slug);
        }
    });

    // Complete lesson button
    document.getElementById('completeLesson')?.addEventListener('click', async () => {
        if (currentLesson && isAuthenticated()) {
            try {
                await apiRequest('/users/complete-lesson', {
                    method: 'POST',
                    body: { lessonId: currentLesson.lesson._id }
                });
                alert('Lesson marked as complete!');
                renderLessonsList(); // Refresh to show completed status
            } catch (error) {
                console.error('Error completing lesson:', error);
            }
        }
    });
});

function renderLessonsList() {
    const lessonsList = document.getElementById('lessonsList');
    if (!lessonsList || !allLessons) return;

    lessonsList.innerHTML = allLessons.map(lesson => {
        const isActive = currentLesson && currentLesson.lesson._id === lesson._id;
        return `
            <div class="lesson-item ${isActive ? 'active' : ''}" data-slug="${lesson.slug}">
                ${lesson.title}
            </div>
        `;
    }).join('');

    // Add click handlers
    lessonsList.querySelectorAll('.lesson-item').forEach(item => {
        item.addEventListener('click', () => {
            const slug = item.getAttribute('data-slug');
            loadLesson(slug);
        });
    });
}

async function loadLesson(lessonSlug) {
    if (!currentCourse) return;

    try {
        const lessonData = await apiRequest(`/lessons/${currentCourse.slug}/${lessonSlug}`);
        currentLesson = lessonData;

        // Update lesson title
        document.getElementById('lessonTitle').textContent = lessonData.lesson.title;

        // Render lesson content
        renderLessonContent(lessonData.lesson.content);

        // Update navigation buttons
        const prevBtn = document.getElementById('prevLesson');
        const nextBtn = document.getElementById('nextLesson');
        const completeBtn = document.getElementById('completeLesson');

        if (prevBtn) {
            prevBtn.disabled = !lessonData.prevLesson;
            if (lessonData.prevLesson) {
                prevBtn.onclick = () => {
                    const url = new URL(window.location);
                    url.searchParams.set('lesson', lessonData.prevLesson.slug);
                    window.location.href = url.toString();
                };
            }
        }

        if (nextBtn) {
            nextBtn.disabled = !lessonData.nextLesson;
            if (lessonData.nextLesson) {
                nextBtn.onclick = () => {
                    const url = new URL(window.location);
                    url.searchParams.set('lesson', lessonData.nextLesson.slug);
                    window.location.href = url.toString();
                };
            }
        }

        if (completeBtn && isAuthenticated()) {
            completeBtn.style.display = 'inline-block';
        }

        // Update URL
        const url = new URL(window.location);
        url.searchParams.set('lesson', lessonSlug);
        window.history.pushState({}, '', url);

        // Re-render lessons list to update active state
        renderLessonsList();
    } catch (error) {
        console.error('Error loading lesson:', error);
        document.getElementById('lessonContent').innerHTML = '<p>Error loading lesson. Please try again.</p>';
    }
}

function renderLessonContent(content) {
    const lessonContent = document.getElementById('lessonContent');
    if (!lessonContent) return;

    // Convert markdown-like content to HTML
    let html = content;

    // Convert code blocks first (before other processing)
    html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
        return `<pre><code class="language-${lang || 'text'}">${escapeHtml(code.trim())}</code></pre>`;
    });

    // Convert inline code (but not inside code blocks)
    html = html.replace(/`([^`\n]+)`/g, '<code>$1</code>');

    // Split into lines for processing
    const lines = html.split('\n');
    const processedLines = [];
    let inList = false;
    let listItems = [];

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        // Headers
        if (line.startsWith('# ')) {
            if (inList) {
                processedLines.push(`<ul>${listItems.join('')}</ul>`);
                listItems = [];
                inList = false;
            }
            processedLines.push(`<h1>${line.substring(2)}</h1>`);
        } else if (line.startsWith('## ')) {
            if (inList) {
                processedLines.push(`<ul>${listItems.join('')}</ul>`);
                listItems = [];
                inList = false;
            }
            processedLines.push(`<h2>${line.substring(3)}</h2>`);
        } else if (line.startsWith('### ')) {
            if (inList) {
                processedLines.push(`<ul>${listItems.join('')}</ul>`);
                listItems = [];
                inList = false;
            }
            processedLines.push(`<h3>${line.substring(4)}</h3>`);
        } else if (line.match(/^[\*\-\+] (.+)$/)) {
            // List item
            if (!inList) {
                inList = true;
            }
            const text = line.replace(/^[\*\-\+] /, '');
            listItems.push(`<li>${text}</li>`);
        } else if (line === '') {
            // Empty line
            if (inList) {
                processedLines.push(`<ul>${listItems.join('')}</ul>`);
                listItems = [];
                inList = false;
            }
            processedLines.push('');
        } else if (line.startsWith('<')) {
            // Already HTML (like code blocks)
            if (inList) {
                processedLines.push(`<ul>${listItems.join('')}</ul>`);
                listItems = [];
                inList = false;
            }
            processedLines.push(line);
        } else {
            // Regular paragraph
            if (inList) {
                processedLines.push(`<ul>${listItems.join('')}</ul>`);
                listItems = [];
                inList = false;
            }
            processedLines.push(`<p>${line}</p>`);
        }
    }

    // Close any remaining list
    if (inList) {
        processedLines.push(`<ul>${listItems.join('')}</ul>`);
    }

    html = processedLines.join('\n');

    lessonContent.innerHTML = html;

    // Highlight code with Prism if available
    if (window.Prism) {
        Prism.highlightAllUnder(lessonContent);
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

