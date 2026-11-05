
import { loadTasks, saveTasks } from "./storage.js";

// Load existing tasks
let tasks = loadTasks();

// Get all tasks
export function getTasks() {
    return tasks;
}

// Add a new task
export function addTask(taskData) {

    const newTask = {
        id: Date.now(),
        text: taskData.text,
        priority: taskData.priority,
        dueDate: taskData.dueDate,
        completed: false
    };

    tasks.push(newTask);

    saveTasks(tasks);
}

// Update an existing task
export function updateTask(id, taskData) {

    const task = tasks.find(item => item.id === id);

    if (!task) return;

    task.text = taskData.text;
    task.priority = taskData.priority;
    task.dueDate = taskData.dueDate;

    saveTasks(tasks);
}

// Complete or uncomplete a task
export function toggleTask(id, completed) {

    const task = tasks.find(item => item.id === id);

    if (!task) return;

    task.completed = completed;

    saveTasks(tasks);
}

// Delete a task
export function deleteTask(id) {

    tasks = tasks.filter(item => item.id !== id);

    saveTasks(tasks);
}
