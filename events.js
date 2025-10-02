const addEventBtn = document.getElementById('addEventBtn');
const eventModal = document.getElementById('eventModal');
const viewEventModal = document.getElementById('viewEventModal');
const eventForm = document.getElementById('eventForm');
const eventsList = document.getElementById('eventsList');
const completedEventsList = document.getElementById('completedEventsList');
const missedEventsList = document.getElementById('missedEventsList');
const closeButtons = document.querySelectorAll('.close');
const deleteEventBtn = document.getElementById('deleteEventBtn');

let events = JSON.parse(localStorage.getItem('events')) || [];
let isEditing = false;
let editingEventId = null;

addEventBtn.addEventListener('click', () => {
    isEditing = false;
    editingEventId = null;
    eventForm.reset();
    const submitBtn = eventForm.querySelector('.submit-btn');
    submitBtn.textContent = 'Create';
    eventModal.style.display = 'block';
});

closeButtons.forEach(button => {
    button.addEventListener('click', () => {
        eventModal.style.display = 'none';
        viewEventModal.style.display = 'none';
        isEditing = false;
        editingEventId = null;
    });
});

window.addEventListener('click', (e) => {
    if (e.target === eventModal) {
        eventModal.style.display = 'none';
        isEditing = false;
        editingEventId = null;
    }
    if (e.target === viewEventModal) {
        viewEventModal.style.display = 'none';
    }
});

eventForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const eventData = {
        id: isEditing ? editingEventId : Date.now(),
        title: document.getElementById('eventTitle').value,
        description: document.getElementById('eventDescription').value,
        link: document.getElementById('eventLink').value,
        dateTime: document.getElementById('eventDateTime').value,
        completed: document.getElementById('eventCompleted').checked
    };

    if (isEditing) {
        const eventIndex = events.findIndex(e => e.id === editingEventId);
        if (eventIndex !== -1) {
            events[eventIndex] = eventData;
        }
    } else {
        events.push(eventData);
    }

    localStorage.setItem('events', JSON.stringify(events));
    renderEvents();
    eventModal.style.display = 'none';
    eventForm.reset();
    isEditing = false;
    editingEventId = null;
});

function renderEvents() {
    eventsList.innerHTML = '';
    completedEventsList.innerHTML = '';
    missedEventsList.innerHTML = '';
    
    const currentDate = new Date();
    
    // Sort events by date
    events.sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime));
    
    events.forEach(event => {
        const eventDate = new Date(event.dateTime);
        const isMissed = !event.completed && eventDate < currentDate;
        
        // Render in main list only if not completed and not missed
        if (!event.completed && !isMissed) {
            const eventBox = document.createElement('div');
            eventBox.className = 'event-box';
            eventBox.innerHTML = `
                <div class="event-header">
                    <h3>${event.title}</h3>
                    <button class="edit-icon" onclick="editEvent(event, ${event.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                </div>
                <p>${event.description.substring(0, 100)}${event.description.length > 100 ? '...' : ''}</p>
                ${event.link ? `<a href="${event.link}" class="event-link" target="_blank" onclick="event.stopPropagation()">
                    <i class="fas fa-external-link-alt"></i> Follow the link
                </a>` : ''}
                <div class="event-time">${formatDateTime(event.dateTime)}</div>
            `;
            eventBox.addEventListener('click', () => showEventDetails(event));
            eventsList.appendChild(eventBox);
        }
        
        // Create sidebar event element
        const sidebarEvent = document.createElement('div');
        sidebarEvent.className = `sidebar-event ${event.completed ? 'completed' : isMissed ? 'missed' : ''}`;
        sidebarEvent.innerHTML = `
            <div class="sidebar-event-content">
                <div class="sidebar-event-title">${event.title}</div>
                <div class="sidebar-event-date">${formatSidebarDate(event.dateTime)}</div>
            </div>
        `;
        sidebarEvent.addEventListener('click', () => showEventDetails(event));
        
        if (event.completed) {
            completedEventsList.appendChild(sidebarEvent);
        } else if (isMissed) {
            missedEventsList.appendChild(sidebarEvent);
        }
    });
}

function editEvent(e, eventId) {
    e.stopPropagation();
    const event = events.find(e => e.id === eventId);
    if (event) {
        isEditing = true;
        editingEventId = eventId;
        
        document.getElementById('eventTitle').value = event.title;
        document.getElementById('eventDescription').value = event.description;
        document.getElementById('eventLink').value = event.link || '';
        document.getElementById('eventDateTime').value = event.dateTime;
        document.getElementById('eventCompleted').checked = event.completed || false;
        
        const submitBtn = eventForm.querySelector('.submit-btn');
        submitBtn.textContent = 'Save Changes';
        
        eventModal.style.display = 'block';
    }
}

function showEventDetails(event) {
    document.getElementById('viewEventTitle').textContent = event.title;
    document.getElementById('viewEventDescription').textContent = event.description;
    
    const titleContainer = document.getElementById('viewEventTitle').parentElement;
    if (!titleContainer.querySelector('.edit-icon')) {
        const editButton = document.createElement('button');
        editButton.className = 'edit-icon';
        editButton.innerHTML = '<i class="fas fa-edit"></i>';
        editButton.onclick = (e) => {
            e.stopPropagation();
            viewEventModal.style.display = 'none';
            editEvent(e, event.id);
        };
        titleContainer.appendChild(editButton);
    }
    
    const linkContainer = document.getElementById('viewEventLink');
    if (event.link) {
        linkContainer.innerHTML = `<a href="${event.link}" target="_blank">
            <i class="fas fa-external-link-alt"></i> Follow the link
        </a>`;
        linkContainer.style.display = 'block';
    } else {
        linkContainer.style.display = 'none';
    }
    
    document.getElementById('viewEventDateTime').textContent = formatDateTime(event.dateTime);
    
    deleteEventBtn.onclick = () => {
        if (confirm('Are you sure you want to delete this event?')) {
            events = events.filter(e => e.id !== event.id);
            localStorage.setItem('events', JSON.stringify(events));
            renderEvents();
            viewEventModal.style.display = 'none';
        }
    };
    
    viewEventModal.style.display = 'block';
}

function formatDateTime(dateTime) {
    const options = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    return new Date(dateTime).toLocaleDateString('en-US', options);
}

function formatSidebarDate(dateTime) {
    const date = new Date(dateTime);
    const month = date.toLocaleString('default', { month: 'short' });
    const day = date.getDate();
    const year = date.getFullYear();
    return `${month} ${day}, ${year}`;
}

class NotificationSystem {
    constructor() {
        this.notifications = [];
        this.unreadCount = 0;
        this.init();
    }

    init() {
        this.notificationList = document.querySelector('.notification-list');
        this.notificationBadge = document.querySelector('.notification-badge');
        this.setupEventListeners();
        this.checkEventReminders();
        setInterval(() => this.checkEventReminders(), 60000);
    }

    setupEventListeners() {
        const tabs = document.querySelectorAll('.notification-tabs button');
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                this.filterNotifications(tab.textContent.toLowerCase());
            });
        });
    }

    addNotification(notification) {
        this.notifications.unshift({
            ...notification,
            id: Date.now(),
            read: false,
            time: new Date()
        });
        this.unreadCount++;
        this.updateNotificationDot();
        this.renderNotifications();
    }

    markAsRead(id) {
        const notification = this.notifications.find(n => n.id === id);
        if (notification && !notification.read) {
            notification.read = true;
            this.unreadCount--;
            this.updateNotificationDot();
            this.renderNotifications();
        }
    }

    updateNotificationDot() {
        if (this.unreadCount > 0) {
            document.querySelector('.notification-dot').style.display = 'block';
        } else {
            document.querySelector('.notification-dot').style.display = 'none';
        }
    }

    filterNotifications(filter) {
        const notifications = filter === 'unread' 
            ? this.notifications.filter(n => !n.read)
            : this.notifications;
        this.renderNotifications(notifications);
    }

    renderNotifications(notifications = this.notifications) {
        this.notificationList.innerHTML = notifications.map(notification => `
            <div class="notification-item ${notification.read ? '' : 'notification-unread'}"
                 onclick="notificationSystem.markAsRead(${notification.id})">
                <div class="notification-content">
                    <div class="notification-title">${notification.title}</div>
                    <div class="notification-time">${this.formatTime(notification.time)}</div>
                </div>
            </div>
        `).join('');
    }

    formatTime(date) {
        const now = new Date();
        const diff = now - date;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        if (minutes < 60) return `${minutes} minutes ago`;
        if (hours < 24) return `${hours} hours ago`;
        return `${days} days ago`;
    }

    checkEventReminders() {
        const events = document.querySelectorAll('.event-card');
        events.forEach(event => {
            const deadlineStr = event.querySelector('.event-deadline').textContent;
            console.log('Deadline String:', deadlineStr);
            const deadline = new Date(deadlineStr);
            const now = new Date();
            const hoursUntilDeadline = (deadline - now) / (1000 * 60 * 60);

            if (hoursUntilDeadline <= 3 && hoursUntilDeadline > 0) {
                const title = event.querySelector('.event-title').textContent;
                this.addNotification({
                    title: `Reminder: "${title}" is due in ${Math.round(hoursUntilDeadline)} hours`,
                    type: 'reminder'
                });
            }
        });
    }
}

const notificationSystem = new NotificationSystem();

renderEvents();
