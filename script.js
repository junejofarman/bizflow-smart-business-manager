
// =====================================
// 1. SELECT HTML ELEMENTS
// =====================================

const taskForm = document.getElementById("taskForm");
const taskInput = document.getElementById("taskInput");
const taskPriority = document.getElementById("taskPriority");
const taskDueDate = document.getElementById("taskDueDate");

const taskList = document.getElementById("taskList");
const searchInput = document.getElementById("searchInput");
const filterTasks = document.getElementById("filterTasks");

const totalTasks = document.getElementById("totalTasks");
const completedTasks = document.getElementById("completedTasks");
const pendingTasks = document.getElementById("pendingTasks");

// New dashboard elements
const progressPercentage = document.getElementById("progressPercentage");
const progressBar = document.getElementById("progressBar");
const progressCompleted = document.getElementById("progressCompleted");
const progressPending = document.getElementById("progressPending");
const recentActivity = document.getElementById("recentActivity");

// =====================================
// 2. LOAD DATA FROM LOCAL STORAGE
// =====================================

let tasks = JSON.parse(localStorage.getItem("bizflowTasks")) || [];

let activities = JSON.parse(
    localStorage.getItem("bizflowActivities")
) || [];

let editingTaskId = null;

// =====================================
// 3. SAVE DATA
// =====================================

function saveTasks() {
    localStorage.setItem("bizflowTasks", JSON.stringify(tasks));
}

function saveActivities() {
    localStorage.setItem(
        "bizflowActivities",
        JSON.stringify(activities)
    );
}

// =====================================
// 4. RECORD RECENT ACTIVITY
// =====================================

function addActivity(action, taskText) {

    const activity = {
        id: Date.now(),
        action: action,
        taskText: taskText,
        time: new Date().toLocaleString()
    };

    activities.unshift(activity);

    // Keep only the latest 10 activities
    activities = activities.slice(0, 10);

    saveActivities();

    renderRecentActivity();
}

// =====================================
// 5. ADD OR UPDATE TASK
// =====================================

taskForm.addEventListener("submit", function(event) {

    event.preventDefault();

    const taskText = taskInput.value.trim();

    if (taskText === "") return;

    if (editingTaskId !== null) {

        const task = tasks.find(function(item) {
            return item.id === editingTaskId;
        });

        if (task) {

            task.text = taskText;
            task.priority = taskPriority.value;
            task.dueDate = taskDueDate.value;

            addActivity("Updated task", taskText);
        }

        editingTaskId = null;

        taskForm.querySelector(
            "button[type='submit']"
        ).textContent = "+ Add Task";

    } else {

        const newTask = {
            id: Date.now(),
            text: taskText,
            priority: taskPriority.value,
            dueDate: taskDueDate.value,
            completed: false
        };

        tasks.push(newTask);

        addActivity("Added new task", taskText);
    }

    saveTasks();

    taskForm.reset();
    taskPriority.value = "Medium";

    renderTasks();
});

// =====================================
// 6. DISPLAY TASKS
// =====================================

function renderTasks() {

    taskList.innerHTML = "";

    const searchText = searchInput.value.toLowerCase();

    const selectedFilter = filterTasks.value;

    const filteredTasks = tasks.filter(function(task) {

        const matchesSearch = task.text.toLowerCase().includes(searchText);

        const matchesFilter =
            selectedFilter === "all" ||
            (selectedFilter === "pending" && !task.completed) ||
            (selectedFilter === "completed" && task.completed);

        return matchesSearch && matchesFilter;
    });

    if (filteredTasks.length === 0) {

        const emptyMessage = document.createElement("p");

        emptyMessage.textContent = "No tasks found.";

        emptyMessage.style.color = "#94a3b8";
        emptyMessage.style.padding = "15px";

        taskList.appendChild(emptyMessage);
    }

    filteredTasks.forEach(function(task) {

        const taskItem = document.createElement("div");

        taskItem.className = "task-item";

        if (task.completed) {
            taskItem.classList.add("completed");
        }

        // Checkbox
        const checkbox = document.createElement("input");

        checkbox.type = "checkbox";
        checkbox.checked = task.completed;

        checkbox.addEventListener("change", function() {

            task.completed = checkbox.checked;

            if (task.completed) {
                addActivity("Completed task", task.text);
            } else {
                addActivity("Reopened task", task.text);
            }

            saveTasks();
            renderTasks();
        });

        // Task information
        const taskDetails = document.createElement("div");

        taskDetails.className = "task-details";

        const taskText = document.createElement("span");

        taskText.textContent = task.text;

        const priority = document.createElement("small");

        priority.className = "priority " + (task.priority || "Medium");

        priority.textContent = (task.priority || "Medium") + " Priority";

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

        editButton.addEventListener("click", function() {

            taskInput.value = task.text;
            taskPriority.value = task.priority || "Medium";
            taskDueDate.value = task.dueDate || "";

            editingTaskId = task.id;

            taskForm.querySelector(
                "button[type='submit']"
            ).textContent = "Update Task";

            taskInput.focus();
        });

        // Delete button
        const deleteButton = document.createElement("button");

        deleteButton.className = "delete-btn";
        deleteButton.textContent = "Delete";

        deleteButton.addEventListener("click", function() {

            tasks = tasks.filter(function(item) {
                return item.id !== task.id;
            });

            if (editingTaskId === task.id) {

                editingTaskId = null;

                taskForm.reset();
                taskPriority.value = "Medium";

                taskForm.querySelector(
                    "button[type='submit']"
                ).textContent = "+ Add Task";
            }

            addActivity("Deleted task", task.text);

            saveTasks();
            renderTasks();
        });

        // Add elements to task card
        taskItem.appendChild(checkbox);
        taskItem.appendChild(taskDetails);
        taskItem.appendChild(editButton);
        taskItem.appendChild(deleteButton);

        taskList.appendChild(taskItem);
    });

    updateStats();
}

// =====================================
// 7. UPDATE DASHBOARD STATISTICS
// =====================================

function updateStats() {

    const total = tasks.length;

    const completed = tasks.filter(function(task) {
        return task.completed;
    }).length;

    const pending = total - completed;

    totalTasks.textContent = total;
    completedTasks.textContent = completed;
    pendingTasks.textContent = pending;

    updateProgress();
}

// =====================================
// 8. UPDATE TASK PROGRESS
// =====================================

function updateProgress() {

    const total = tasks.length;

    const completed = tasks.filter(function(task) {
        return task.completed;
    }).length;

    const pending = total - completed;

    const percentage = total === 0
        ? 0
        : Math.round((completed / total) * 100);

    progressPercentage.textContent = percentage + "%";

    progressBar.style.width = percentage + "%";

    progressCompleted.textContent = completed;

    progressPending.textContent = pending;
}

// =====================================
// 9. DISPLAY RECENT ACTIVITY
// =====================================

function renderRecentActivity() {

    recentActivity.innerHTML = "";

    if (activities.length === 0) {

        const emptyMessage = document.createElement("p");

        emptyMessage.className = "empty-activity";
        emptyMessage.textContent = "No recent activity yet.";

        recentActivity.appendChild(emptyMessage);

        return;
    }

    activities.slice(0, 5).forEach(function(activity) {

        const activityItem = document.createElement("div");

        activityItem.className = "activity-item";

        const activityIcon = document.createElement("div");

        activityIcon.className = "activity-icon";

        const activityDetails = document.createElement("div");

        activityDetails.className = "activity-details";

        const activityTitle = document.createElement("strong");

        activityTitle.textContent = activity.action;

        const activityText = document.createElement("small");

        activityText.textContent = activity.taskText;

        const activityTime = document.createElement("small");

        activityTime.textContent = activity.time;

        const icons = {
            "Added new task": "+",
            "Updated task": "✎",
            "Completed task": "✓",
            "Reopened task": "↺",
            "Deleted task": "×"
        };

        activityIcon.textContent = icons[activity.action] || "•";

        activityDetails.appendChild(activityTitle);
        activityDetails.appendChild(activityText);
        activityDetails.appendChild(activityTime);

        activityItem.appendChild(activityIcon);
        activityItem.appendChild(activityDetails);

        recentActivity.appendChild(activityItem);
    });
}

// =====================================
// 10. SEARCH TASKS
// =====================================

searchInput.addEventListener("input", function() {
    renderTasks();
});

// =====================================
// 11. FILTER TASKS
// =====================================

filterTasks.addEventListener("change", function() {
    renderTasks();
});

// =====================================
// 12. START APPLICATION
// =====================================

renderTasks();
renderRecentActivity();

console.log("BizFlow dashboard started successfully!");

// =====================================
// 13. PROJECT MANAGEMENT
// =====================================

// Select project HTML elements

const projectForm = document.getElementById("projectForm");
const projectName = document.getElementById("projectName");
const projectClient = document.getElementById("projectClient");
const projectDeadline = document.getElementById("projectDeadline");
const projectStatus = document.getElementById("projectStatus");

const projectList = document.getElementById("projectList");
const projectSearch = document.getElementById("projectSearch");
const projectFilter = document.getElementById("projectFilter");
const projectSubmit = document.getElementById("projectSubmit");

// Load projects from LocalStorage

let projects = JSON.parse(
    localStorage.getItem("bizflowProjects")
) || [];

let editingProjectId = null;

// Save projects

function saveProjects() {
    localStorage.setItem(
        "bizflowProjects",
        JSON.stringify(projects)
    );
}

// Add or update project

projectForm.addEventListener("submit", function(event) {

    event.preventDefault();

    const name = projectName.value.trim();

    if (!name) return;

    const projectData = {
        name: name,
        client: projectClient.value.trim(),
        deadline: projectDeadline.value,
        status: projectStatus.value
    };

    if (editingProjectId !== null) {

        const project = projects.find(function(item) {
            return item.id === editingProjectId;
        });

        if (project) {
            project.name = projectData.name;
            project.client = projectData.client;
            project.deadline = projectData.deadline;
            project.status = projectData.status;
        }

        addActivity("Updated project", name);

    } else {

        const newProject = {
            id: Date.now(),
            ...projectData
        };

        projects.push(newProject);

        addActivity("Added new project", name);
    }

    saveProjects();

    projectForm.reset();

    editingProjectId = null;

    projectSubmit.textContent = "+ Add Project";

    renderProjects();
});

// Display projects

function renderProjects() {

    projectList.innerHTML = "";

    const searchText = projectSearch.value.toLowerCase();

    const selectedStatus = projectFilter.value;

    const filteredProjects = projects.filter(function(project) {

        const matchesSearch =
            project.name.toLowerCase().includes(searchText) ||
            project.client.toLowerCase().includes(searchText);

        const matchesStatus =
            selectedStatus === "all" ||
            project.status === selectedStatus;

        return matchesSearch && matchesStatus;
    });

    if (filteredProjects.length === 0) {

        const emptyMessage = document.createElement("p");

        emptyMessage.className = "project-empty";

        emptyMessage.textContent = "No projects found.";

        projectList.appendChild(emptyMessage);
    }

    filteredProjects.forEach(function(project) {

        const projectItem = document.createElement("div");

        projectItem.className = "project-item";

        const projectDetails = document.createElement("div");

        projectDetails.className = "project-details";

        const name = document.createElement("strong");

        name.textContent = project.name;

        const client = document.createElement("small");

        client.textContent = "Client: " + (project.client || "Not specified");

        const deadline = document.createElement("small");

        deadline.textContent = project.deadline
            ? "Deadline: " + project.deadline
            : "No deadline set";

        const status = document.createElement("span");

        status.className = "project-status " +
            project.status.replace(/\s+/g, "-");

        status.textContent = project.status;

        projectDetails.appendChild(name);
        projectDetails.appendChild(client);
        projectDetails.appendChild(deadline);
        projectDetails.appendChild(status);

        // Project action buttons

        const actions = document.createElement("div");

        actions.className = "project-actions";

        const editButton = document.createElement("button");

        editButton.className = "project-edit";

        editButton.textContent = "Edit";

        editButton.addEventListener("click", function() {

            projectName.value = project.name;
            projectClient.value = project.client;
            projectDeadline.value = project.deadline;
            projectStatus.value = project.status;

            editingProjectId = project.id;

            projectSubmit.textContent = "Update Project";

            projectName.focus();
        });

        const deleteButton = document.createElement("button");

        deleteButton.className = "project-delete";

        deleteButton.textContent = "Delete";

        deleteButton.addEventListener("click", function() {

            projects = projects.filter(function(item) {
                return item.id !== project.id;
            });

            if (editingProjectId === project.id) {

                editingProjectId = null;

                projectForm.reset();

                projectSubmit.textContent = "+ Add Project";
            }

            addActivity("Deleted project", project.name);

            saveProjects();

            renderProjects();
        });

        actions.appendChild(editButton);
        actions.appendChild(deleteButton);

        projectItem.appendChild(projectDetails);
        projectItem.appendChild(actions);

        projectList.appendChild(projectItem);
    });
}

// Project search

projectSearch.addEventListener("input", function() {
    renderProjects();
});

// Project filter

projectFilter.addEventListener("change", function() {
    renderProjects();
});

// Initialize projects

renderProjects();

console.log("BizFlow Projects Management started!");
// =================================
// CUSTOMERS MANAGEMENT
// =================================

const customerForm = document.getElementById("customerForm");
const customerNameInput = document.getElementById("customerName");
const customerEmailInput = document.getElementById("customerEmail");
const customerPhoneInput = document.getElementById("customerPhone");
const customerCompanyInput = document.getElementById("customerCompany");
const customerSearchInput = document.getElementById("customerSearch");
const customerList = document.getElementById("customerList");
const customerSubmitButton = document.getElementById("customerSubmit");

// Load saved customers
let customers = JSON.parse(localStorage.getItem("bizflowCustomers")) || [];
let editingCustomerId = null;


// Save customers to LocalStorage
function saveCustomers() {
    localStorage.setItem("bizflowCustomers", JSON.stringify(customers));
}


// Display customers
function renderCustomers() {
    customerList.innerHTML = "";

    const searchText = customerSearchInput.value.toLowerCase().trim();

    const filteredCustomers = customers.filter(customer => {
        return (
            customer.name.toLowerCase().includes(searchText) ||
            customer.email.toLowerCase().includes(searchText) ||
            customer.phone.toLowerCase().includes(searchText) ||
            customer.company.toLowerCase().includes(searchText)
        );
    });

    if (filteredCustomers.length === 0) {
        customerList.innerHTML = `
            <p class="customer-empty">
                No customers found. Add your first customer!
            </p>
        `;
        return;
    }

    filteredCustomers.forEach(customer => {
        const customerItem = document.createElement("div");
        customerItem.className = "customer-item";

        const customerDetails = document.createElement("div");
        customerDetails.className = "customer-details";

        const name = document.createElement("strong");
        name.textContent = customer.name;

        const email = document.createElement("small");
        email.textContent = `Email: ${customer.email || "Not provided"}`;

        const phone = document.createElement("small");
        phone.textContent = `Phone: ${customer.phone || "Not provided"}`;

        const company = document.createElement("small");
        company.textContent = `Company: ${customer.company || "Not provided"}`;

        customerDetails.append(name, email, phone, company);

        const customerActions = document.createElement("div");
        customerActions.className = "customer-actions";

        const editButton = document.createElement("button");
        editButton.className = "customer-edit";
        editButton.textContent = "Edit";

        editButton.addEventListener("click", () => {
            customerNameInput.value = customer.name;
            customerEmailInput.value = customer.email;
            customerPhoneInput.value = customer.phone;
            customerCompanyInput.value = customer.company;

            editingCustomerId = customer.id;
            customerSubmitButton.textContent = "Update Customer";

            customerForm.scrollIntoView({
                behavior: "smooth",
                block: "center"
            });
        });

        const deleteButton = document.createElement("button");
        deleteButton.className = "customer-delete";
        deleteButton.textContent = "Delete";

        deleteButton.addEventListener("click", () => {
            const confirmDelete = confirm(
                `Are you sure you want to delete ${customer.name}?`
            );

            if (!confirmDelete) return;

            customers = customers.filter(item => item.id !== customer.id);

            if (editingCustomerId === customer.id) {
                editingCustomerId = null;
                customerForm.reset();
                customerSubmitButton.textContent = "+ Add Customer";
            }

            saveCustomers();
            addActivity("Deleted customer", customer.name);
            renderCustomers();
        });

        customerActions.append(editButton, deleteButton);
        customerItem.append(customerDetails, customerActions);
        customerList.appendChild(customerItem);
    });
}


// Add or update customer
customerForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const name = customerNameInput.value.trim();
    const email = customerEmailInput.value.trim();
    const phone = customerPhoneInput.value.trim();
    const company = customerCompanyInput.value.trim();

    if (!name) {
        alert("Please enter the customer's name.");
        return;
    }

    if (editingCustomerId !== null) {
        const customer = customers.find(
            item => item.id === editingCustomerId
        );

        if (customer) {
            customer.name = name;
            customer.email = email;
            customer.phone = phone;
            customer.company = company;

            addActivity("Updated customer", name);
        }
    } else {
        const newCustomer = {
            id: Date.now(),
            name,
            email,
            phone,
            company
        };

        customers.push(newCustomer);
        addActivity("Added new customer", name);
    }

    saveCustomers();

    customerForm.reset();
    editingCustomerId = null;
    customerSubmitButton.textContent = "+ Add Customer";

    renderCustomers();
});


// Search customers
customerSearchInput.addEventListener("input", renderCustomers);


// Initial display
renderCustomers();
// =================================
// BUSINESS SETTINGS
// =================================

const settingsForm = document.getElementById("settingsForm");
const businessNameInput = document.getElementById("businessName");
const businessEmailInput = document.getElementById("businessEmail");
const businessPhoneInput = document.getElementById("businessPhone");
const businessAddressInput = document.getElementById("businessAddress");
const settingsMessage = document.getElementById("settingsMessage");

// Load saved business details
const savedBusinessSettings =
    JSON.parse(localStorage.getItem("bizflowSettings")) || {};

// Fill form with saved details
businessNameInput.value = savedBusinessSettings.name || "";
businessEmailInput.value = savedBusinessSettings.email || "";
businessPhoneInput.value = savedBusinessSettings.phone || "";
businessAddressInput.value = savedBusinessSettings.address || "";


// Save business details
settingsForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const businessSettings = {
        name: businessNameInput.value.trim(),
        email: businessEmailInput.value.trim(),
        phone: businessPhoneInput.value.trim(),
        address: businessAddressInput.value.trim()
    };

    localStorage.setItem(
        "bizflowSettings",
        JSON.stringify(businessSettings)
    );
const dashboardBusinessName =
    document.getElementById("dashboardBusinessName");

if (dashboardBusinessName) {
    dashboardBusinessName.textContent =
        businessSettings.name || "My Business";
}
    settingsMessage.textContent = "Business details saved successfully!";

    // Clear the success message after a short delay
    setTimeout(() => {
        settingsMessage.textContent = "";
    }, 3000);
});
// =================================
// DASHBOARD SUMMARY COUNTS
// =================================

function updateBusinessDashboard() {

    const projects =
        JSON.parse(localStorage.getItem("bizflowProjects")) || [];

    const customers =
        JSON.parse(localStorage.getItem("bizflowCustomers")) || [];

    const totalProjectsElement =
        document.getElementById("totalProjects");

    const totalCustomersElement =
        document.getElementById("totalCustomers");

    if (totalProjectsElement) {
        totalProjectsElement.textContent = projects.length;
    }

    if (totalCustomersElement) {
        totalCustomersElement.textContent = customers.length;
    }
}
const savedSettings =
    JSON.parse(localStorage.getItem("bizflowSettings")) || {};

const businessNameElement =
    document.getElementById("dashboardBusinessName");

if (businessNameElement) {
    businessNameElement.textContent =
        savedSettings.name || "My Business";
}
// Initial dashboard update
updateBusinessDashboard();
// =================================
// SIDEBAR NAVIGATION
// =================================

const navigationLinks = document.querySelectorAll("nav a");

navigationLinks.forEach(link => {

    link.addEventListener("click", function (event) {

        const targetId = this.getAttribute("href");

        // Only handle links pointing to page sections
        if (!targetId || !targetId.startsWith("#")) return;

        const targetSection = document.querySelector(targetId);

        if (!targetSection) return;

        event.preventDefault();

        // Scroll to selected section
        targetSection.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

        // Update active menu
        navigationLinks.forEach(item => {
            item.classList.remove("active");
        });

        this.classList.add("active");
    });

});
// Admin Profile Dropdown
const profileDropdown = document.getElementById("profileDropdown");
const profileToggle = document.getElementById("profileToggle");
const signOutBtn = document.getElementById("signOutBtn");

if (profileDropdown && profileToggle && signOutBtn) {

    profileToggle.addEventListener("click", function () {
        profileDropdown.classList.toggle("open");
    });

    document.addEventListener("click", function (event) {
        if (!profileDropdown.contains(event.target)) {
            profileDropdown.classList.remove("open");
        }
    });

    document.addEventListener("keydown", function (event) {
        if (event.key === "Escape") {
            profileDropdown.classList.remove("open");
        }
    });

    signOutBtn.addEventListener("click", function () {
        profileDropdown.classList.remove("open");

        alert("Sign Out is currently a demo option. Real authentication will be added with the backend.");
    });
}