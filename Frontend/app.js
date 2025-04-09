// API endpoint base URL - dynamically set based on environment
const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://127.0.0.1:8000'  // Local development
    : 'https://your-backend-url.com';  // REPLACE THIS with your deployed backend URL

// DOM elements
const navPrePoll = document.getElementById('nav-pre-poll');
const navPostPoll = document.getElementById('nav-post-poll');
const navAnalytics = document.getElementById('nav-analytics');
const prePollSection = document.getElementById('pre-poll');
const postPollSection = document.getElementById('post-poll');
const analyticsSection = document.getElementById('analytics');
const prePollForm = document.getElementById('pre-poll-form');
const postPollForm = document.getElementById('post-poll-form');
const prePollQuestions = document.getElementById('pre-poll-questions');
const postPollQuestions = document.getElementById('post-poll-questions');
const analyticsContainer = document.getElementById('analytics-container');
const notification = document.getElementById('notification');

// Get URL parameters to determine which poll to show
const urlParams = new URLSearchParams(window.location.search);
const pollType = urlParams.get('poll') || 'pre'; // Default to pre-poll if no parameter
const accessCode = urlParams.get('access') || '';

// Hide the navigation section for regular users
const navSection = document.querySelector('header nav');
if (navSection && !accessCode) {
    navSection.style.display = 'none';
}

// Update the poll indicator
const pollIndicator = document.getElementById('poll-indicator');
if (pollIndicator) {
    if (accessCode === 'presenter2023') {
        pollIndicator.textContent = 'PRESENTER VIEW';
        pollIndicator.style.backgroundColor = '#f44336';
    } else {
        pollIndicator.textContent = pollType === 'post' ? 'POST-Activity Poll' : 'PRE-Activity Poll';
        if (pollType === 'post') {
            pollIndicator.classList.add('post');
        }
    }
}

// Function to determine which section to show based on URL parameters
function determineInitialSection() {
    // If there's an access code and it matches our analytics access code
    if (accessCode === 'presenter2023') {
        return analyticsSection;
    }
    
    // Otherwise show the appropriate poll based on the URL
    return pollType === 'post' ? postPollSection : prePollSection;
}

// Navigation functions
function showSection(sectionToShow) {
    // Hide all sections
    prePollSection.classList.add('hidden');
    postPollSection.classList.add('hidden');
    analyticsSection.classList.add('hidden');
    
    // Show the requested section
    sectionToShow.classList.remove('hidden');
}

// Event listeners for navigation
navPrePoll.addEventListener('click', () => showSection(prePollSection));
navPostPoll.addEventListener('click', () => showSection(postPollSection));
navAnalytics.addEventListener('click', () => {
    showSection(analyticsSection);
    loadAnalytics();
});

// Function to create HTML for different question types
function createQuestionHTML(question, pollType) {
    const prefix = pollType === 'pre' ? 'pre-' : 'post-';
    let html = `
        <div class="question-item">
            <p class="question-text">${question.question} ${question.required ? '<span class="required">*</span>' : ''}</p>
    `;
    
    switch(question.type) {
        case 'text':
            html += `
                <textarea id="${prefix}${question.id}" name="${question.id}" rows="4" ${question.required ? 'required' : ''}></textarea>
            `;
            break;
            
        case 'number':
            html += `
                <input type="number" id="${prefix}${question.id}" name="${question.id}" ${question.required ? 'required' : ''}>
            `;
            break;
            
        case 'rating':
            html += `
                <div class="rating-container">
                    <div class="rating-labels">
                        <span>${question.labels[0]}</span>
                        <span>${question.labels[1]}</span>
                    </div>
                    <div class="rating-options">
            `;
            
            for (let i = question.min; i <= question.max; i++) {
                html += `
                    <div class="rating-option">
                        <input type="radio" id="${prefix}${question.id}-${i}" name="${question.id}" value="${i}" ${question.required ? 'required' : ''}>
                        <label for="${prefix}${question.id}-${i}">${i}</label>
                    </div>
                `;
            }
            
            html += `
                    </div>
                </div>
            `;
            break;
            
        case 'checkbox':
            html += `<div class="checkbox-container">`;
            question.options.forEach((option, index) => {
                html += `
                    <div class="checkbox-option">
                        <input type="checkbox" id="${prefix}${question.id}-${index}" name="${question.id}" value="${option}">
                        <label for="${prefix}${question.id}-${index}">${option}</label>
                    </div>
                `;
            });
            html += `</div>`;
            html += `<p class="checkbox-instruction">Please select up to 3 options</p>`;
            break;
    }
    
    html += `</div>`;
    return html;
}

// Function to load poll questions
async function loadPollQuestions() {
    try {
        const response = await fetch(`${API_BASE_URL}/poll`);
        const data = await response.json();
        
        // Add poll title and instructions to both sections
        document.querySelector('#pre-poll h2').textContent = data.title || 'Pre-Activity Poll';
        document.querySelector('#post-poll h2').textContent = data.title || 'Post-Activity Poll';
        
        if (data.description) {
            prePollQuestions.innerHTML = `<div class="poll-description">${data.description}</div>`;
            postPollQuestions.innerHTML = `<div class="poll-description">${data.description}</div>`;
            
            if (data.scale_description) {
                prePollQuestions.innerHTML += `<div class="scale-description">${data.scale_description}</div>`;
                postPollQuestions.innerHTML += `<div class="scale-description">${data.scale_description}</div>`;
            }
        } else {
            prePollQuestions.innerHTML = '';
            postPollQuestions.innerHTML = '';
        }
        
        // Create HTML for pre-poll questions
        data.questions.forEach(question => {
            prePollQuestions.innerHTML += createQuestionHTML(question, 'pre');
        });
        
        // Create HTML for post-poll questions (same questions for this implementation)
        data.questions.forEach(question => {
            postPollQuestions.innerHTML += createQuestionHTML(question, 'post');
        });
        
        // Add event listeners to limit checkbox selections to 3
        document.querySelectorAll('.checkbox-container').forEach(container => {
            const checkboxes = container.querySelectorAll('input[type="checkbox"]');
            checkboxes.forEach(checkbox => {
                checkbox.addEventListener('change', function() {
                    const checked = container.querySelectorAll('input[type="checkbox"]:checked');
                    if (checked.length > 3) {
                        this.checked = false;
                        showNotification('Please select only 3 options', 'error');
                    }
                });
            });
        });
        
    } catch (error) {
        showNotification('Error loading questions: ' + error.message, 'error');
    }
}

// Function to gather form data including handling checkbox groups
function gatherFormData(formElement) {
    const formData = new FormData(formElement);
    const answers = {};
    
    // Get all checkbox names to identify them
    const checkboxNames = new Set();
    formElement.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
        checkboxNames.add(checkbox.name);
    });
    
    // First collect all entries
    for (const [key, value] of formData.entries()) {
        if (!answers[key]) {
            answers[key] = value;
        } else if (!Array.isArray(answers[key])) {
            // If we have multiple values for the same key, convert to array
            answers[key] = [answers[key], value];
        } else {
            // If it's already an array, push the new value
            answers[key].push(value);
        }
    }
    
    // Convert arrays to strings for API compatibility
    for (const key in answers) {
        if (Array.isArray(answers[key])) {
            answers[key] = answers[key].join(', ');
        }
    }
    
    return answers;
}

// Function to submit poll responses
async function submitPoll(pollType, formElement) {
    const answers = gatherFormData(formElement);
    
    try {
        const response = await fetch(`${API_BASE_URL}/poll`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                poll_type: pollType,
                answers: answers
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            formElement.reset();
            showNotification(`${pollType.charAt(0).toUpperCase() + pollType.slice(1)} poll submitted successfully!`, 'success');
        } else {
            showNotification('Error: ' + data.detail, 'error');
        }
    } catch (error) {
        showNotification('Error submitting poll: ' + error.message, 'error');
    }
}

// Function to load analytics
async function loadAnalytics() {
    try {
        const response = await fetch(`${API_BASE_URL}/analytics`);
        const data = await response.json();
        
        // Clear previous content
        analyticsContainer.innerHTML = '';
        
        // Summary statistics
        const summaryHTML = `
            <div class="analytics-summary">
                <div class="analytics-card">
                    <h3>Pre-Poll Responses</h3>
                    <span class="analytics-count">${data.summary.pre_poll_count}</span>
                </div>
                <div class="analytics-card">
                    <h3>Post-Poll Responses</h3>
                    <span class="analytics-count">${data.summary.post_poll_count}</span>
                </div>
                <div class="analytics-card">
                    <h3>Total Responses</h3>
                    <span class="analytics-count">${data.summary.total_responses}</span>
                </div>
            </div>
        `;
        analyticsContainer.innerHTML += summaryHTML;
        
        // Process each question
        for (const [questionId, stats] of Object.entries(data.questions)) {
            const questionSection = document.createElement('div');
            questionSection.className = 'question-analytics';
            
            // Question header
            questionSection.innerHTML = `
                <h3 class="question-header">${stats.question_text}</h3>
                <div class="question-type-label">${formatQuestionType(stats.question_type)}</div>
            `;
            
            // Add appropriate visualization based on question type
            if (stats.question_type === 'rating') {
                renderRatingAnalytics(questionSection, stats);
            } else if (stats.question_type === 'checkbox') {
                renderCheckboxAnalytics(questionSection, stats);
            } else if (stats.question_type === 'text' && questionId === 'q5') {
                // Render the word cloud for question 5
                renderTextQuestionAnalytics(questionSection, stats);
            }
            
            analyticsContainer.appendChild(questionSection);
        }
    } catch (error) {
        showNotification('Error loading analytics: ' + error.message, 'error');
    }
}

// Function to render text question analytics with word cloud
function renderTextQuestionAnalytics(container, stats) {
    // Create elements
    const analyticsWrapper = document.createElement('div');
    analyticsWrapper.className = 'text-analytics flex-container';
    
    // Pre-poll data
    const prePollSection = document.createElement('div');
    prePollSection.className = 'poll-column';
    prePollSection.innerHTML = `
        <h4>Pre-Poll Text Responses</h4>
        <div class="text-analytics-summary">
            <div class="text-stat">
                <div class="text-stat-label">Response Count</div>
                <div class="text-stat-value">${stats.pre_poll.count}</div>
            </div>
            <div class="text-stat">
                <div class="text-stat-label">Response Rate</div>
                <div class="text-stat-value">${stats.pre_poll.response_rate}%</div>
            </div>
            <div class="text-stat">
                <div class="text-stat-label">Avg Length</div>
                <div class="text-stat-value">${stats.pre_poll.average_length}</div>
            </div>
        </div>
        <div class="word-cloud-title">Common Keywords in Pre-Poll Responses</div>
        <div class="word-cloud-container" id="pre-word-cloud"></div>
    `;
    
    // Post-poll data
    const postPollSection = document.createElement('div');
    postPollSection.className = 'poll-column';
    postPollSection.innerHTML = `
        <h4>Post-Poll Text Responses</h4>
        <div class="text-analytics-summary">
            <div class="text-stat">
                <div class="text-stat-label">Response Count</div>
                <div class="text-stat-value">${stats.post_poll.count}</div>
            </div>
            <div class="text-stat">
                <div class="text-stat-label">Response Rate</div>
                <div class="text-stat-value">${stats.post_poll.response_rate}%</div>
            </div>
            <div class="text-stat">
                <div class="text-stat-label">Avg Length</div>
                <div class="text-stat-value">${stats.post_poll.average_length}</div>
            </div>
        </div>
        <div class="word-cloud-title">Common Keywords in Post-Poll Responses</div>
        <div class="word-cloud-container" id="post-word-cloud"></div>
    `;
    
    // Add sections to the wrapper
    analyticsWrapper.appendChild(prePollSection);
    analyticsWrapper.appendChild(postPollSection);
    container.appendChild(analyticsWrapper);
    
    // Create word clouds
    if (stats.pre_poll.keywords && stats.pre_poll.keywords.length > 0) {
        createWordBubbleCloud('pre-word-cloud', stats.pre_poll.keywords);
    } else {
        document.getElementById('pre-word-cloud').innerHTML = '<p class="note">Not enough data for visualization</p>';
    }
    
    if (stats.post_poll.keywords && stats.post_poll.keywords.length > 0) {
        createWordBubbleCloud('post-word-cloud', stats.post_poll.keywords);
    } else {
        document.getElementById('post-word-cloud').innerHTML = '<p class="note">Not enough data for visualization</p>';
    }
}

// Function to create a word bubble cloud visualization
function createWordBubbleCloud(containerId, words) {
    // Find the maximum frequency for scaling
    const maxFrequency = words.length > 0 ? Math.max(...words.map(d => d.value)) : 1;
    
    // First make sure the container exists
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`Container with ID "${containerId}" not found`);
        return;
    }
    
    // Clear previous content
    container.innerHTML = '';
    
    // Create a tooltip div
    const tooltip = d3.select(`#${containerId}`)
        .append("div")
        .attr("class", "word-cloud-tooltip");
    
    // Set dimensions with fallback values if the container doesn't have dimensions yet
    const containerWidth = container.clientWidth || 300;
    const containerHeight = container.clientHeight || 300;
    
    // Create SVG element
    const svg = d3.select(`#${containerId}`)
        .append("svg")
        .attr("width", containerWidth)
        .attr("height", containerHeight)
        .append("g")
        .attr("transform", `translate(${containerWidth/2}, ${containerHeight/2})`);
    
    // Create a scale for the font size
    const fontSizeScale = d3.scaleLinear()
        .domain([1, maxFrequency])
        .range([12, 50]);
    
    // Define the color palette for words based on frequency
    const colorScale = d3.scaleOrdinal()
        .domain([1, 10])
        .range(Array.from({length: 10}, (_, i) => `color-${i+1}`));
    
    // Create the layout for the word cloud
    const layout = d3.layout.cloud()
        .size([containerWidth, containerHeight])
        .words(words)
        .padding(5)
        .rotate(() => 0) // No rotation for better readability
        .fontSize(d => fontSizeScale(d.value))
        .on("end", draw);
    
    // Start the layout
    layout.start();
    
    // Function to draw the words
    function draw(words) {
        svg.selectAll("text")
            .data(words)
            .enter()
            .append("text")
            .style("font-family", "Impact, sans-serif")
            .style("font-size", d => `${fontSizeScale(d.value)}px`)
            .attr("text-anchor", "middle")
            .attr("transform", d => `translate(${d.x}, ${d.y})`)
            .attr("class", d => {
                // Map values to 10 different color classes
                const colorIndex = Math.ceil((d.value / maxFrequency) * 10);
                return colorScale(colorIndex);
            })
            .text(d => d.text)
            // Add interactive effects
            .on("mouseover", function(event, d) {
                tooltip
                    .style("opacity", 1)
                    .style("left", `${event.pageX - container.offsetLeft}px`)
                    .style("top", `${event.pageY - container.offsetTop}px`)
                    .html(`${d.text}: ${d.value} occurrences`);
                
                d3.select(this)
                    .transition()
                    .duration(200)
                    .style("font-size", `${fontSizeScale(d.value) * 1.2}px`);
            })
            .on("mouseout", function(event, d) {
                tooltip.style("opacity", 0);
                
                d3.select(this)
                    .transition()
                    .duration(200)
                    .style("font-size", `${fontSizeScale(d.value)}px`);
            });
    }
}

// Helper function to format question type for display
function formatQuestionType(type) {
    return type.charAt(0).toUpperCase() + type.slice(1) + ' Question';
}

// Function to render rating question analytics
function renderRatingAnalytics(container, stats) {
    // Create elements
    const analyticsWrapper = document.createElement('div');
    analyticsWrapper.className = 'rating-analytics flex-container';
    
    // Pre-poll data
    const prePollSection = document.createElement('div');
    prePollSection.className = 'poll-column';
    prePollSection.innerHTML = `
        <h4>Pre-Poll Results</h4>
        <p>Responses: ${stats.pre_poll.count}</p>
        <p>Average Rating: ${stats.pre_poll.mean}</p>
        <p>Median Rating: ${stats.pre_poll.median}</p>
        <div class="chart-container" id="pre-chart-${Date.now()}"></div>
    `;
    
    // Post-poll data
    const postPollSection = document.createElement('div');
    postPollSection.className = 'poll-column';
    postPollSection.innerHTML = `
        <h4>Post-Poll Results</h4>
        <p>Responses: ${stats.post_poll.count}</p>
        <p>Average Rating: ${stats.post_poll.mean}</p>
        <p>Median Rating: ${stats.post_poll.median}</p>
        <div class="chart-container" id="post-chart-${Date.now()}"></div>
    `;
    
    // Differential data
    const diffSection = document.createElement('div');
    diffSection.className = 'poll-column difference-column';
    
    // Calculate significance indicators
    const meanChange = stats.differential.mean_change;
    const significance = getMeanChangeSignificance(meanChange);
    
    diffSection.innerHTML = `
        <h4>Change Analysis</h4>
        <p class="change-value ${significance.class}">
            <span>Mean Change: ${meanChange > 0 ? '+' : ''}${meanChange}</span>
            <span class="change-arrow">${significance.arrow}</span>
        </p>
        <div class="distribution-changes">
            <h5>Response Distribution Changes:</h5>
            <ul>
                ${Object.entries(stats.differential.distribution_change).map(([rating, change]) => `
                    <li class="${change > 0 ? 'increase' : change < 0 ? 'decrease' : 'neutral'}">
                        Rating ${rating}: ${change > 0 ? '+' : ''}${change}
                    </li>
                `).join('')}
            </ul>
        </div>
    `;
    
    // Add all sections to the wrapper
    analyticsWrapper.appendChild(prePollSection);
    analyticsWrapper.appendChild(diffSection);
    analyticsWrapper.appendChild(postPollSection);
    container.appendChild(analyticsWrapper);
    
    // Find the global maximum value across both pre and post data for consistent scaling
    const preValues = Object.values(stats.pre_poll.distribution);
    const postValues = Object.values(stats.post_poll.distribution);
    const globalMaxValue = Math.max(...preValues, ...postValues);
    
    // Draw enhanced bar charts with the global maximum for consistent scaling
    drawEnhancedBarChart(prePollSection.querySelector('.chart-container'), stats.pre_poll.distribution, globalMaxValue);
    drawEnhancedBarChart(postPollSection.querySelector('.chart-container'), stats.post_poll.distribution, globalMaxValue);
}

// Helper for significance indicators
function getMeanChangeSignificance(change) {
    if (change > 0.5) return { class: 'significant-increase', arrow: '↑↑' };
    if (change > 0) return { class: 'increase', arrow: '↑' };
    if (change < -0.5) return { class: 'significant-decrease', arrow: '↓↓' };
    if (change < 0) return { class: 'decrease', arrow: '↓' };
    return { class: 'neutral', arrow: '→' };
}

// Function to render checkbox question analytics
function renderCheckboxAnalytics(container, stats) {
    const analyticsWrapper = document.createElement('div');
    analyticsWrapper.className = 'checkbox-analytics flex-container';
    
    // Pre-poll selections
    const prePollSection = document.createElement('div');
    prePollSection.className = 'poll-column';
    prePollSection.innerHTML = `
        <h4>Pre-Poll Top Selections</h4>
        <p>Responses: ${stats.pre_poll.count}</p>
        <div class="selections-list">
            <ul>
                ${Object.entries(stats.pre_poll.top_selections).map(([option, count]) => 
                    `<li><strong>${option}</strong>: ${count} selections</li>`
                ).join('')}
            </ul>
        </div>
    `;
    
    // Post-poll selections
    const postPollSection = document.createElement('div');
    postPollSection.className = 'poll-column';
    postPollSection.innerHTML = `
        <h4>Post-Poll Top Selections</h4>
        <p>Responses: ${stats.post_poll.count}</p>
        <div class="selections-list">
            <ul>
                ${Object.entries(stats.post_poll.top_selections).map(([option, count]) => 
                    `<li><strong>${option}</strong>: ${count} selections</li>`
                ).join('')}
            </ul>
        </div>
    `;
    
    // Changes in selections
    const diffSection = document.createElement('div');
    diffSection.className = 'poll-column difference-column';
    
    // Get top 5 biggest changes
    const topChanges = Object.entries(stats.differential.selection_changes)
        .sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]))
        .slice(0, 5);
    
    diffSection.innerHTML = `
        <h4>Biggest Opinion Shifts</h4>
        <div class="changes-list">
            <ul>
                ${topChanges.map(([option, change]) => `
                    <li class="${change > 0 ? 'increase' : 'decrease'}">
                        <strong>${option}</strong>: 
                        <span>${change > 0 ? '+' : ''}${change}</span>
                    </li>
                `).join('')}
            </ul>
        </div>
        <p class="note">Note: Shows largest changes between pre and post polls</p>
    `;
    
    // Add sections to wrapper
    analyticsWrapper.appendChild(prePollSection);
    analyticsWrapper.appendChild(diffSection);
    analyticsWrapper.appendChild(postPollSection);
    container.appendChild(analyticsWrapper);
}

// Improved function to draw enhanced bar charts that properly scale with data values
function drawEnhancedBarChart(container, distribution, maxValue) {
    // If no maxValue is provided, use the maximum from this dataset (backward compatibility)
    if (maxValue === undefined) {
        maxValue = Math.max(...Object.values(distribution));
    }
    
    // If all values are 0, set a default height
    const effectiveMax = maxValue === 0 ? 1 : maxValue;
    
    // Create simplified labels for small screens
    const shortLabels = {
        1: "S.Disagree",
        2: "Disagree",
        3: "Agree",
        4: "S.Agree"
    };
    
    const chartHTML = `
        <div class="enhanced-chart">
            <div class="y-axis">
                <div class="y-axis-label">${maxValue}</div>
                <div class="y-axis-label">${Math.ceil(maxValue/2)}</div>
                <div class="y-axis-label">0</div>
            </div>
            <div class="chart-content">
                ${Object.entries(distribution).map(([rating, count]) => {
                    // Calculate height percentage based on the count relative to the global max
                    const heightPercent = maxValue > 0 ? (count / effectiveMax) * 100 : 0;
                    
                    return `
                        <div class="bar-column">
                            <div class="bar-wrapper">
                                <div class="bar" style="height: ${heightPercent}%">
                                    <span class="bar-value">${count}</span>
                                </div>
                            </div>
                            <div class="x-axis-label" title="${getRatingLabel(parseInt(rating))}">
                                ${parseInt(rating)}
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        </div>
    `;
    
    container.innerHTML = chartHTML;
}

// Helper function to get a label for the rating value
function getRatingLabel(rating) {
    const labels = {
        1: "Strongly Disagree",
        2: "Disagree",
        3: "Agree",
        4: "Strongly Agree"
    };
    return labels[rating] || rating;
}

// Function to show notifications
function showNotification(message, type) {
    notification.textContent = message;
    notification.className = 'notification ' + type;
    notification.classList.remove('hidden');
    
    // Hide notification after 3 seconds
    setTimeout(() => {
        notification.classList.add('hidden');
    }, 3000);
}

// Event listeners for form submissions
prePollForm.addEventListener('submit', (e) => {
    e.preventDefault();
    submitPoll('pre', prePollForm);
});

postPollForm.addEventListener('submit', (e) => {
    e.preventDefault();
    submitPoll('post', postPollForm);
});

// Prevent multiple initializations
let hasInitialized = false;

// Initialize the application
function initApp() {
    // Only initialize once to prevent multiple API requests
    if (hasInitialized) return;
    
    loadPollQuestions();
    
    // Show the appropriate section based on URL parameters
    showSection(determineInitialSection());
    
    // If showing analytics section, load the analytics data
    if (accessCode === 'presenter2023') {
        loadAnalytics();
    }
    
    hasInitialized = true;
}

// Override the existing event listener with a cleaner implementation
document.removeEventListener('DOMContentLoaded', initApp);
document.addEventListener('DOMContentLoaded', initApp, { once: true });

// Dark Mode Toggle Functionality
function setupDarkModeToggle() {
    // Create the toggle button
    const toggleButton = document.createElement('button');
    toggleButton.className = 'theme-toggle';
    toggleButton.innerHTML = '🌓';
    toggleButton.setAttribute('aria-label', 'Toggle Dark Mode');
    
    // Add screen reader text
    const srText = document.createElement('span');
    srText.className = 'sr-only';
    srText.textContent = 'Toggle Dark Mode';
    toggleButton.appendChild(srText);
    
    // Add click event to toggle dark mode
    toggleButton.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        
        // Save preference to localStorage
        if (document.body.classList.contains('dark-mode')) {
            localStorage.setItem('darkMode', 'enabled');
        } else {
            localStorage.setItem('darkMode', 'disabled');
        }
    });
    
    // Append button to body
    document.body.appendChild(toggleButton);
    
    // Check for saved user preference
    if (localStorage.getItem('darkMode') === 'enabled') {
        document.body.classList.add('dark-mode');
    }
}

// Call the function when the document is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    setupDarkModeToggle();
});
