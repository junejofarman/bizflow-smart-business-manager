
const STORAGE_KEY = "bizflowTasks";

// Save tasks
export function saveTasks(tasks) {
    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(tasks)
    );
}

// Load tasks
export function loadTasks() {
    return JSON.parse(
        localStorage.getItem(STORAGE_KEY)
    ) || [];
}
