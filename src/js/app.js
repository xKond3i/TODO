var todos = [
    {title: 'Lorem ipsum dolor sit amet.', done: true},
    {title: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Eius at fugiat aliquid voluptatem id repudiandae provident fuga cumque, tenetur suscipit, reiciendis quibusdam perspiciatis, consectetur in.', done: false},
    {title: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Officia, quia.', done: false},
]

const todo_template = document.querySelector('.__todo_template')

// increasing paper effect
const todo_add_content_input = document.querySelector('.__todo_add_content')

todo_add_content_input.addEventListener('input', (e) => {
    e.target.setAttribute('size', e.target.value.length)
})