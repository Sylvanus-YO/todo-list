// Get HTML elements
const taskForm = document.getElementById("taskForm");
const taskInput = document.getElementById("taskInput");
const taskList = document.getElementById("taskList");
const searchInput = document.getElementById("searchInput");
const filterButtons = document.querySelectorAll(".filter-btn");
const clearCompletedButton = document.getElementById("clearCompleted");

// Get statistics elements
const totalTasksElement = document.getElementById("totalTasks");
const activeTasksElement = document.getElementById("activeTasks");
const completedTasksElement = document.getElementById("completedTasks");
const taskCountElement = document.getElementById("taskCount");
const emptyState = document.getElementById("emptyState");

// Load saved tasks or start with an empty list
let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

let currentFilter = "all";
let searchTerm = "";

// Save tasks in the browser
function saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

// Display tasks on the page
function renderTasks() {
    taskList.innerHTML = "";

    const filteredTasks = tasks.filter(function(task) {
        const matchesSearch = task.text
            .toLowerCase()
            .includes(searchTerm.toLowerCase());

        const matchesFilter =
            currentFilter === "all" ||
            (currentFilter === "active" && !task.completed) ||
            (currentFilter === "completed" && task.completed);

        return matchesSearch && matchesFilter;
    });

    filteredTasks.forEach(function(task) {
        const listItem = document.createElement("li");
        listItem.className = "task-item";

        if (task.completed) {
            listItem.classList.add("completed");
        }

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = task.completed;
        checkbox.setAttribute("aria-label", "Mark task as completed");

        checkbox.addEventListener("change", function() {
            toggleTask(task.id);
        });

        const taskText = document.createElement("span");
        taskText.className = "task-title"; // Fixed class name to match CSS
        taskText.textContent = task.text;

        const actions = document.createElement("div");
        actions.className = "task-actions";

        const editButton = document.createElement("button");
        editButton.textContent = "Edit";
        editButton.className = "action-btn edit-btn"; // Added base action-btn class
        editButton.addEventListener("click", function() {
            editTask(task.id);
        });

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.className = "action-btn delete-btn"; // Added base action-btn class
        deleteButton.addEventListener("click", function() {
            deleteTask(task.id);
        });

        actions.appendChild(editButton);
        actions.appendChild(deleteButton);

        listItem.appendChild(checkbox);
        listItem.appendChild(taskText);
        listItem.appendChild(actions);

        taskList.appendChild(listItem);
    });

    emptyState.hidden = filteredTasks.length > 0;

    updateStatistics();
}

// Add a new task
taskForm.addEventListener("submit", function(event) {
    event.preventDefault();

    const taskText = taskInput.value.trim();

    if (taskText === "") {
        alert("Please enter a task.");
        return;
    }

    const newTask = {
        id: Date.now(),
        text: taskText,
        completed: false
    };

    tasks.push(newTask);

    saveTasks();
    renderTasks();

    taskInput.value = "";
    taskInput.focus();
});

// Mark a task as completed or active
function toggleTask(taskId) {
    tasks = tasks.map(function(task) {
        if (task.id === taskId) {
            return {
                ...task,
                completed: !task.completed
            };
        }

        return task;
    });

    saveTasks();
    renderTasks();
}

// Edit a task
function editTask(taskId) {
    const task = tasks.find(function(item) {
        return item.id === taskId;
    });

    if (!task) return;
    const updatedText = prompt("Edit your task:", task.text);

    if (updatedText === null) return;

    if (updatedText.trim() === "") {
        alert("Task cannot be empty.");
        return;
    }

    task.text = updatedText.trim();

    saveTasks();
    renderTasks();
}

// Delete a task
function deleteTask(taskId) {
    const confirmed = confirm("Are you sure you want to delete this task?");

    if (!confirmed) return;

    tasks = tasks.filter(function(task) {
        return task.id !== taskId;
    });

    saveTasks();
    renderTasks();
}

// Search tasks
searchInput.addEventListener("input", function() {
    searchTerm = searchInput.value;
    renderTasks();
});

// Filter tasks
filterButtons.forEach(function(button) {
    button.addEventListener("click", function() {
        filterButtons.forEach(function(item) {
            item.classList.remove("active");
        });

        button.classList.add("active");
        currentFilter = button.dataset.filter;

        renderTasks();
    });
});

// Delete all completed tasks
clearCompletedButton.addEventListener("click", function() {
    const hasCompletedTasks = tasks.some(function(task) {
        return task.completed;
    });

    if (!hasCompletedTasks) {
        alert("There are no completed tasks to clear.");
        return;
    }

    const confirmed = confirm("Delete all completed tasks?");

    if (!confirmed) return;

    tasks = tasks.filter(function(task) {
        return !task.completed;
    });

    saveTasks();
    renderTasks();
});

// Update task statistics
function updateStatistics() {
    const total = tasks.length;

    const completed = tasks.filter(function(task) {
        return task.completed;
    }).length;

    const active = total - completed;

    totalTasksElement.textContent = total;
    activeTasksElement.textContent = active;
    completedTasksElement.textContent = completed;
    
    // Fixed template literal syntax error with backticks
    taskCountElement.textContent = `${active} ${active === 1 ? "task" : "tasks"} remaining`;

    clearCompletedButton.disabled = completed === 0;
}

// Display saved tasks when the app opens
renderTasks();