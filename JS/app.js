
import {
    getTasks,
    addTask,
    updateTask,
    toggleTask,
    deleteTask
} from "./tasks.js";

import {
    renderDashboard
} from "./dashboard.js";

// =====================================
// 1. SELECT HTML ELEMENTS
// =====================================

const taskForm = document.getElementById("taskForm");

const taskInput = document.getElementById("taskInput");

const taskPriority = document.getElementById("taskPriority");

const taskDueDate = document.getElementById("taskDueDate");

const searchInput = document.getElementById("searchInput");

const filterTasks = document.getElementById("filterTasks");

const submitButton = taskForm.querySelector("button[type='submit']");

// Track editing task
let editingTaskId = null;

// =====================================
// 2. RENDER DASHBOARD
// =====================================

function refreshDashboard() {

    renderDashboard({
        tasks: getTasks(),

        searchText: searchInput.value,

        selectedFilter: filterTasks.value,

        onToggle: handleToggle,

        onEdit: handleEdit,

        onDelete: handleDelete
    });
}

// =====================================
// 3. RESET FORM
// =====================================

function resetTaskForm() {

    taskForm.reset();

    taskPriority.value = "Medium";

    editingTaskId = null;

    submitButton.textContent = "+ Add Task";
}

// =====================================
// 4. ADD OR UPDATE TASK
// =====================================

taskForm.addEventListener("submit", function(event) {

    event.preventDefault();

    const taskData = {
        text: taskInput.value.trim(),
        priority: taskPriority.value,
        dueDate: taskDueDate.value
    };

    if (!taskData.text) return;

    if (editingTaskId !== null) {

        updateTask(editingTaskId, taskData);

    } else {

        addTask(taskData);

    }

    resetTaskForm();

    refreshDashboard();

});

// =====================================
// 5. EDIT TASK
// =====================================

function handleEdit(task) {

    taskInput.value = task.text;

    taskPriority.value = task.priority || "Medium";

    taskDueDate.value = task.dueDate || "";

    editingTaskId = task.id;

    submitButton.textContent = "Update Task";

    taskInput.focus();
}

// =====================================
// 6. COMPLETE TASK
// =====================================

function handleToggle(id, completed) {

    toggleTask(id, completed);

    refreshDashboard();
}

// =====================================
// 7. DELETE TASK
// =====================================

function handleDelete(id) {

    deleteTask(id);

    if (editingTaskId === id) {
        resetTaskForm();
    }

    refreshDashboard();
}

// =====================================
// 8. SEARCH TASKS
// =====================================

searchInput.addEventListener("input", function() {

    refreshDashboard();

});

// =====================================
// 9. FILTER TASKS
// =====================================

filterTasks.addEventListener("change", function() {

    refreshDashboard();

});

// =====================================
// 10. START APPLICATION
// =====================================

refreshDashboard();

console.log("BizFlow application started successfully!");
