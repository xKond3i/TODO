// TODO DATA
var todos = []

// DOM ELEMENTS
const todo_template = document.querySelector('[data-todo-template]')

const todo_container    = document.querySelector('[data-todo-container]')
const todo_list         = todo_container.querySelector('[data-todo-list]')
const todo_add_btn      = todo_container.querySelector('[data-todo-add-btn]')
const todo_add_content  = todo_container.querySelector('[data-todo-add-content]')
const todo_del_all_btn  = document.querySelector('[data-todo-delete-all-btn]')
const todo_none_left    = todo_list.querySelector('[data-todo-info]')



// # LOCAL STORAGE
// Section responsible for handling localStorage
function saveToLocalStorage() {
    localStorage['__todos'] = JSON.stringify(todos)
}

function loadFromLocalStorage() {
    todos = JSON.parse(localStorage['__todos'])
}

window.onload = () => {
    if (localStorage.hasOwnProperty('__todos')) loadFromLocalStorage()
    saveToLocalStorage()

    toggleEmptyNotification() // None left notification

    // Add todos from data array
    for (let todo of todos) {
        addTodoElement(todo)
    }
}



// # ADD TODO
// Section responsible for adding todos

// Add todo DOM element
function addTodoElement(data) {
    // Clone TODO from the template
    let new_todo = todo_template.content.querySelector('[data-todo-entry]').cloneNode(true)

    // Handle entry status through the checkbox
    let new_todo_checkbox = new_todo.querySelector('[data-todo-checkbox]')

    new_todo_checkbox.checked = data.done
    new_todo.classList.toggle('__todo_entry_done', data.done)

    new_todo_checkbox.addEventListener('change', () => {
        new_todo.classList.toggle('__todo_entry_done', new_todo_checkbox.checked)
        let todo_entry_elements = [...todo_list.querySelectorAll('[data-todo-entry]')]
        todos[todo_entry_elements.indexOf(new_todo)].done = new_todo_checkbox.checked

        // Update localStorage
        saveToLocalStorage()
    })

    new_todo.addEventListener('animationend', () => {
        new_todo.classList.remove('slide-in')
    }, {once: true})

    // Handle deletion of todo element
    let new_todo_del_btn = new_todo.querySelector('[data-todo-delete-btn]')
    new_todo_del_btn.addEventListener('click', () => deleteTodo(new_todo))

    new_todo.querySelector('[data-todo-content]').textContent = data.title

    // Finally add prepared todo to the list
    todo_list.appendChild(new_todo)
    return new_todo
}

// Add todo
function addTodo(title, done = false) {
    // Prepare todo structure
    let new_todo = {
        title: title,
        done: done
    }

    todos.push(new_todo) // Add todo to the data array
    todo_elem = addTodoElement(new_todo) // Add todo as a DOM element

    // Update localStorage
    saveToLocalStorage()

    toggleEmptyNotification() // None left notification
}

// Handle new entry input
function validTodo() {
    // Todo has to have a title
    if (todo_add_content.value.length == 0) {
        todo_container.classList.add('invalid-shake')
        todo_container.addEventListener('animationend', () => {
            todo_container.classList.remove('invalid-shake')
        }, {once: true})
        return false
    }
    return true
}

function addTodoThroughForm() {
    if (validTodo()) {
        addTodo(todo_add_content.value)
        todo_add_content.value = ''
    }
}

todo_add_btn.addEventListener('click', addTodoThroughForm)
todo_add_content.addEventListener('keypress', (e) => { if (e.key == 'Enter') addTodoThroughForm() })



// # DELETE TODO
// Section responsible for removing todos

// Delete single todo both from array and as an element
function deleteTodo(todo_element) {
    // Slide out animation
    todo_element.classList.add('slide-out')
    todo_element.addEventListener('animationend', () => {
        let todo_entry_elements = [...todo_list.querySelectorAll('[data-todo-entry]')]
        todos.splice(todo_entry_elements.indexOf(todo_element), 1)
        todo_list.removeChild(todo_element)

        // Update localStorage
        saveToLocalStorage()

        toggleEmptyNotification() // None left notification
        updateAddContentInput() // Increasing paper size on input effect
    }, {once: true})
}

// Delete all todos both from array and as an element
function deleteAllTodos() {
    let todo_entry_elements = [...todo_list.querySelectorAll('[data-todo-entry]')]
    for (let todo_entry_element of todo_entry_elements) {
        deleteTodo(todo_entry_element)
    }
}

// Handle deletion of all todos throuogh the button
todo_del_all_btn.addEventListener('click', deleteAllTodos)

// # EMPTY
function toggleEmptyNotification() {
    if (todos.length === 0) return todo_none_left.removeAttribute('hidden')
    return todo_none_left.setAttribute('hidden', true)
}



// DETAILS
const todo_add_content_input = document.querySelector('.__todo_add_content')

var placeholder_txt = 'Type your todo here...'
var letter_interval = 50
var pause_typing_anim = false

// Setup input font size to work with typing effect
todo_add_content_input.setAttribute('size', placeholder_txt.length)

// Increasing paper size on input effect
const updateAddContentInput = () => { 
    let len = todo_add_content_input.value.length
    pause_typing_anim = len > 0
    todo_add_content_input.setAttribute('size', len > placeholder_txt.length ? len - 1 : placeholder_txt.length)
}
todo_add_content_input.addEventListener('input', updateAddContentInput)

// Typing text effect
const addContentInputPlaceholderAnimation = setInterval( () => {
    todo_add_content_input.placeholder = ''
    for (let i = 0; i < placeholder_txt.length; i++) {
        if (!pause_typing_anim) setTimeout(() => { todo_add_content_input.placeholder += placeholder_txt.charAt(i)}, i * letter_interval)
    }
}, placeholder_txt.length * letter_interval + 1000)