
export function renderDashboard({
    tasks,
    searchText,
    selectedFilter,
    onToggle,
    onEdit,
    onDelete
}) {

    const taskList = document.getElementById("taskList");

    const totalTasks = document.getElementById("totalTasks");
    const completedTasks = document.getElementById("completedTasks");
    const pendingTasks = document.getElementById("pendingTasks");

    // Update dashboard statistics
    const total = tasks.length;

    const completed = tasks.filter(
        task => task.completed
    ).length;

    totalTasks.textContent = total;
    completedTasks.textContent = completed;
    pendingTasks.textContent = total - completed;

    // Search and filter
    const filteredTasks = tasks.filter(task => {

        const matchesSearch = task.text
            .toLowerCase()
            .includes(searchText.toLowerCase());

        const matchesFilter =
            selectedFilter === "all" ||
            (selectedFilter === "pending" && !task.completed) ||
            (selectedFilter === "completed" && task.completed);

        return matchesSearch && matchesFilter;
    });

    // Clear previous display
    taskList.innerHTML = "";

    // Empty message
    if (filteredTasks.length === 0) {

        const message = document.createElement("p");

        message.textContent = "No tasks found.";
        message.style.color = "#94a3b8";
        message.style.padding = "15px";

        taskList.appendChild(message);

        return;
    }

    // Display tasks
    filteredTasks.forEach(task => {

        const taskItem = document.createElement("div");

        taskItem.className = "task-item";

        if (task.completed) {
            taskItem.classList.add("completed");
        }

        // Checkbox
        const checkbox = document.createElement("input");

        checkbox.type = "checkbox";
        checkbox.checked = task.completed;

        checkbox.addEventListener("change", () => {
            onToggle(task.id, checkbox.checked);
        });

        // Task information
        const taskDetails = document.createElement("div");

        taskDetails.className = "task-details";

        const taskText = document.createElement("span");

        taskText.textContent = task.text;

        const priority = document.createElement("small");

        const priorityValue = task.priority || "Medium";

        priority.className = "priority " + priorityValue;
        priority.textContent = priorityValue + " Priority";

        taskDetails.appendChild(taskText);
        taskDetails.appendChild(priority);

        // Due date
        if (task.dueDate) {

            const dueDate = document.createElement("small");

            dueDate.className = "due-date";
            dueDate.textContent = "Due: " + task.dueDate;

            taskDetails.appendChild(dueDate);
        }

        // Edit button
        const editButton = document.createElement("button");

        editButton.className = "edit-btn";
        editButton.textContent = "Edit";

        editButton.addEventListener("click", () => {
            onEdit(task);
        });

        // Delete button
        const deleteButton = document.createElement("button");

        deleteButton.className = "delete-btn";
        deleteButton.textContent = "Delete";

        deleteButton.addEventListener("click", () => {
            onDelete(task.id);
        });

        // Add elements to task card
        taskItem.appendChild(checkbox);
        taskItem.appendChild(taskDetails);
        taskItem.appendChild(editButton);
        taskItem.appendChild(deleteButton);

        taskList.appendChild(taskItem);

    });
}
