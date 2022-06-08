// # VARIABLES AND CLASSES
// TODO DATA
var TODOS = []

// DOM ELEMENTS
const todo_template       = document.querySelector('[data-todo-template]')

const todo_container      = document.querySelector('[data-todo-container]')
const todo_list           = todo_container.querySelector('[data-todo-list]')
const todo_info           = todo_list.querySelector('[data-todo-info]')

const todo_add_field      = todo_container.querySelector('[data-todo-add-content]')
const todo_add_button     = todo_container.querySelector('[data-todo-add-btn]')
const todo_del_all_button = document.querySelector('[data-todo-delete-all-btn]')

// DETAILS
const TYPING_TEXT     = 'Type your todo here...'
const TYPING_INTERVAL = 100
var PAUSE_TYPING      = false

// TODO CLASS
class TODO {
    constructor(title, done = false) {
        this.title = title
        this.done = done
        this.id = TODO.genID()
        this.order = TODOS.length
    }

    static genID() {
        let time = new Date().getTime()                   // Current timestamp
        let rnd_key = Math.floor(Math.random() * 89 + 10) // Number range from 10 to 99
        let id = time + rnd_key

        if (TODO.findTodo(id) !== false) return TODO.genID() // Safety check if ID doesn't exists

        return id
    }

    static findTodo(id) { return TODOS.find(todo => todo.id == id) || false } // Find TODO with corresponding ID
}



// # LOCAL STORAGE
// Save TODOS to localStorage
function saveToLocalStorage() {
    localStorage['__todos'] = JSON.stringify(TODOS)
}

// Load TODOS from localStorage
function loadFromLocalStorage() {
    memory = JSON.parse(localStorage['__todos'])
    memory.sort((current, next) => current.order - next.order)
    for (let load of memory) { addTodo(load.title, load.done) }
}



// # ADD TODO
// Add todo DOM element
function addTodoElement(data) {
    let todo = todo_template.content.querySelector('[data-todo-entry]').cloneNode(true) // Clone TODO from the template

    // Get component elements
    let todo_del_btn  = todo.querySelector('[data-todo-delete-btn]')
    let todo_checkbox = todo.querySelector('[data-todo-checkbox]')
    let todo_title    = todo.querySelector('[data-todo-content]')
    
    todo.dataset.todoId = data.id                         // Assign ID
    todo_title.textContent = data.title                   // Set title
    todo_checkbox.checked = data.done                     // Set status
    todo.classList.toggle('__todo_entry_done', data.done) // Set appearance
    
    // Handle entry status through the checkbox
    todo_checkbox.addEventListener('change', () => {
        todo.classList.toggle('__todo_entry_done', todo_checkbox.checked) // Toggle entry appearance
        TODO.findTodo(todo.dataset.todoId).done = todo_checkbox.checked               // Sync element with TODOS array

        saveToLocalStorage() // Update localStorage
    })

    // Handle dragging
    todo.addEventListener('dragstart', () => { todo.classList.add('dragging') })  // Select dragging element (by applying class)
    todo.addEventListener('dragend', () => { todo.classList.remove('dragging') }) // Deselect dragging element
    
    todo_del_btn.addEventListener('click', () => deleteTodo(todo.dataset.todoId)) // Handle delete button of an entry

    addAnimation('slide-in', todo) // Add animation

    todo_list.appendChild(todo) // Finally add prepared todo to the list
}

// Add todo DOM element
function addTodo(title, done = false) {
    let todo = new TODO(title, done) // Create todo object from a class

    TODOS.push(todo)     // Add todo to the data array
    addTodoElement(todo) // Add todo element

    saveToLocalStorage() // Save to localStorage

    handleEmptyNotification() // None left notification
    updateAddField()          // Increasing field effect
}

// Handle add field validation
function validTodo() {
    if (todo_add_field.value.length > 0) return true // Valid

    addAnimation('invalid-shake', todo_container)
    return false
}

// Handle adding todos through form
function addTodoThroughForm() {
    if (validTodo() === false) return // Field invalid

    addTodo(todo_add_field.value)
    todo_add_field.value = ''

    handleEmptyNotification() // None left notification
    updateAddField()          // Increasing field effect
}



// # DELETE
// Delete single todo both from array and as an element
function deleteTodo(id) {
    let todo_elements = [...document.querySelectorAll('[data-todo-entry]')]
    let todo_element = todo_elements.find(element => element.dataset.todoId == id)

    // Slide out animation
    todo_element.classList.add('slide-out')
    todo_element.addEventListener('animationend', () => {
        TODOS = TODOS.filter(todo => todo.id != id) // Remove from the array
        todo_list.removeChild(todo_element)         // Remove as DOM element

        saveToLocalStorage() // Update localStorage

        handleEmptyNotification() // None left notification
        updateAddField()          // Increasing field effect
    }, { once: true })
}

// Delete all todos both from array and as an element
function deleteAllTodos() {
    for (let todo of TODOS) {
        deleteTodo(todo.id)
    }
}



// # DRAG AND DROP
// Container's dragging logic
function handleDragging(e) {
    e.preventDefault()
    const draggable = document.querySelector('.dragging')
    const after_element = getEntryAfterDragging(e.clientY)

    if (after_element === null) todo_list.appendChild(draggable) // There's no element below, append at the end
    else todo_list.insertBefore(draggable, after_element)        // There's an element below, append before it

    updateOrder() // Update order of TODOS
}

// Get element after dragging entry
function getEntryAfterDragging(y) {
    const draggables = [...todo_list.querySelectorAll('[data-todo-entry]:not(.dragging)')]

    return draggables.reduce((closest, child) => {
        const box = child.getBoundingClientRect()
        const offset = y - box.top - box.height / 2 // Offset mouse position to center of the box

        if (offset < 0 && offset > closest.offset) return { offset: offset, element: child } // Lesser offset (-INFINITY to 0)
        return closest                                                                       // Bigger offest, pass previous
    }, { offset: Number.NEGATIVE_INFINITY }).element
}

// Update order
function updateOrder() {
    const todo_entries = [...todo_list.querySelectorAll('[data-todo-entry]')]
    
    for (let [index, entry] of todo_entries.entries()) {
        TODO.findTodo(entry.dataset.todoId).order = index
    }

    saveToLocalStorage() // Save the order
}



// # DETAILS
// End animation properly
function addAnimation(name, element) {
    element.classList.add(name)
    element.addEventListener('animationend', () => { element.classList.remove(name) }, {once: true})
}

// Handle none todos left notification
function handleEmptyNotification() {
    if (TODOS.length === 0) return todo_info.removeAttribute('hidden')
    return todo_info.setAttribute('hidden', true)
}

// Update add field size and handle typing pause
const updateAddField = () => {
    let current_length = todo_add_field.value.length
    PAUSE_TYPING = current_length > 0                               // Pause the animation if there already something typed
    todo_add_field.size = (current_length > TYPING_TEXT.length ?    // Update size
                           current_length - 1 : TYPING_TEXT.length)
}

// Typing text effect
const addFieldTyping = setInterval(() => {
        if (PAUSE_TYPING) return // PAUSE guard case

        let i = todo_add_field.placeholder.length                    // Get current letter index
        if (i >= TYPING_TEXT.length) todo_add_field.placeholder = '' // Clear placeholder, when index indicates last letter

        todo_add_field.placeholder += TYPING_TEXT.charAt(i)
    }, TYPING_INTERVAL
)



// START EVERYTHING ON DOM LOAD
window.onload = () => {
    if (localStorage.hasOwnProperty('__todos')) loadFromLocalStorage()
    
    handleEmptyNotification()
    
    // Details
    todo_add_field.setAttribute('size', TYPING_TEXT.length)
    todo_add_field.addEventListener('input', updateAddField)

    // Handle adding todo through the form
    todo_add_button.addEventListener('click', addTodoThroughForm)                                      // Submit on button click
    todo_add_field.addEventListener('keypress', e => { if (e.key == 'Enter') addTodoThroughForm() }) // Submit on `Enter`

    // Handle deletion of all todos throuogh the button
    todo_del_all_button.addEventListener('click', deleteAllTodos)

    // Handle dragging logic
    todo_container.addEventListener('dragover', e => handleDragging(e))
}