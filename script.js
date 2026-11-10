const taskForm = document.querySelector("#task-form");
const taskInput = document.querySelector("#task-input");
const taskList = document.querySelector("#task-list");
const emptyState = document.querySelector("#empty-state");

const filterButtons = document.querySelectorAll(".filter-btn");

const totalCount = document.querySelector("#total-count");
const completedCount = document.querySelector("#completed-count");
const remainingCount = document.querySelector("#remaining-count");

const clearCompletedButton = document.querySelector("#clear-completed");

const STORAGE_KEY = "todoTasks";

let activeFilter = "all";

function updateEmptyState() {

    const totalTasks = taskList.children.length;

    const visibleTasks = Array.from(taskList.children).filter(
        (task) => task.style.display !== "none"
    ).length;

    if (totalTasks === 0) {

        emptyState.textContent = "No tasks yet. Add your first task!";
        emptyState.style.display = "block";

    }

    else if (visibleTasks === 0) {

        emptyState.textContent = "No tasks found in this filter.";
        emptyState.style.display = "block";

    }

    else {

        emptyState.style.display = "none";

    }

}

function updateTaskCounter() {

    const allTasks = Array.from(taskList.children);

    const totalTasks = allTasks.length;

    const completedTasks = allTasks.filter(
        (task) => task.classList.contains("completed")
    ).length;

    const remainingTasks = totalTasks - completedTasks;

    totalCount.textContent = totalTasks;
    completedCount.textContent = completedTasks;
    remainingCount.textContent = remainingTasks;

}

function saveTasks() {

    const tasks = Array.from(taskList.children).map((task) => {

        return {
            text: task.querySelector(".task-text").textContent,
            completed: task.classList.contains("completed")
        };

    });

    try {

        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(tasks)
        );

    }

    catch (error) {

        console.error("Unable to save tasks:", error);

    }

}

function applyFilter(filter) {

    const allTasks = taskList.children;

    for (const task of allTasks) {

        const isCompleted = task.classList.contains("completed");

        if (filter === "all") {

            task.style.display = "flex";

        }

        else if (filter === "pending") {

            task.style.display = isCompleted ? "none" : "flex";

        }

        else if (filter === "completed") {

            task.style.display = isCompleted ? "flex" : "none";

        }

    }

    updateEmptyState();
    updateTaskCounter();

}

function setActiveFilter(filter) {

    activeFilter = filter;

    filterButtons.forEach((button) => {

        button.classList.toggle(
            "active",
            button.dataset.filter === filter
        );

    });

    applyFilter(activeFilter);

}

function createTask(taskText, isCompleted = false) {

    const li = document.createElement("li");
    li.className = "task-item";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "task-checkbox";
    checkbox.checked = isCompleted;

    li.classList.toggle("completed", isCompleted);

    const span = document.createElement("span");
    span.className = "task-text";
    span.textContent = taskText;

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "delete-btn";
    deleteButton.textContent = "Delete";

    checkbox.addEventListener("change", () => {

        li.classList.toggle("completed", checkbox.checked);

        applyFilter(activeFilter);
        saveTasks();

    });

    deleteButton.addEventListener("click", () => {

        li.remove();

        applyFilter(activeFilter);
        saveTasks();

    });

    li.appendChild(checkbox);
    li.appendChild(span);
    li.appendChild(deleteButton);

    taskList.appendChild(li);

    applyFilter(activeFilter);

}

function loadTasks() {

    let savedData;

    try {

        savedData = localStorage.getItem(STORAGE_KEY);

    }

    catch (error) {

        console.error("Unable to access local storage:", error);

        applyFilter(activeFilter);

        return;

    }

    if (!savedData) {

        applyFilter(activeFilter);

        return;

    }

    try {

        const savedTasks = JSON.parse(savedData);

        if (!Array.isArray(savedTasks)) {

            throw new Error("Invalid task data");

        }

        savedTasks.forEach((task) => {

            if (
                task &&
                typeof task.text === "string" &&
                task.text.trim() !== ""
            ) {

                createTask(
                    task.text,
                    task.completed === true
                );

            }

        });

        saveTasks();

    }

    catch (error) {

        console.error("Unable to load saved tasks:", error);

        try {

            localStorage.removeItem(STORAGE_KEY);

        }

        catch (storageError) {

            console.error("Unable to remove invalid data:", storageError);

        }

    }

    applyFilter(activeFilter);

}

taskForm.addEventListener("submit", (event) => {

    event.preventDefault();

    const taskText = taskInput.value.trim();

    if (taskText === "") {
        return;
    }

    setActiveFilter("all");

    createTask(taskText);

    saveTasks();

    taskInput.value = "";
    taskInput.focus();

});

filterButtons.forEach((button) => {

    button.addEventListener("click", () => {

        setActiveFilter(button.dataset.filter);

    });

});

clearCompletedButton.addEventListener("click", () => {

    const completedTasks = Array.from(taskList.children).filter(
        (task) => task.classList.contains("completed")
    );

    if (completedTasks.length === 0) {
        return;
    }

    const confirmation = confirm(
        "Are you sure you want to delete all completed tasks?"
    );

    if (!confirmation) {
        return;
    }

    completedTasks.forEach((task) => {

        task.remove();

    });

    saveTasks();
    applyFilter(activeFilter);

});

loadTasks();