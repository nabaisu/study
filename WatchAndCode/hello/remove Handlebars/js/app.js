/*global Router */
	'use strict';

	var ENTER_KEY = 13;
	var ESCAPE_KEY = 27;

	var util = {
		uuid: function () {
			/*jshint bitwise:false */
			var i, random;
			var uuid = '';

			for (i = 0; i < 32; i++) {
				random = Math.random() * 16 | 0;
				if (i === 8 || i === 12 || i === 16 || i === 20) {
					uuid += '-';
				}
				uuid += (i === 12 ? 4 : (i === 16 ? (random & 3 | 8) : random)).toString(16);
			}

			return uuid;
		},
		pluralize: function (count, word) {
			return count === 1 ? word : word + 's';
		},
		store: function (namespace, data) {
			if (arguments.length > 1) {
				return localStorage.setItem(namespace, JSON.stringify(data));
			} else {
				var store = localStorage.getItem(namespace);
				return (store && JSON.parse(store)) || [];
			}
		}
	};

	var App = {
		init: function () {
			this.todos = util.store('todos-jquery');
			this.todoTemplate = function(todos){
				var self = this;
				var todoStringTemplate = ''
				todos.forEach(function(todo){
					todoStringTemplate += self.todoTemplateString(todo);
				})
				return todoStringTemplate
			}
			this.bindEvents();

			new Router({
				'/:filter': function (filter) {
					this.filter = filter;
					this.render();
				}.bind(this)
			}).init('/all');
		},
		todoTemplateString: function(todo){
				return `<li ${(todo.completed) ? 'class="completed"' : ""} data-id="${todo.id}">
				<div class="view">
					<input class="toggle" type="checkbox" ${(todo.completed) ? 'checked' : ""}>
					<label>${todo.title}</label>
					<button class="destroy"></button>
				</div>
				<input class="edit" value="${todo.title}">
			</li>`
		},
		footerTemplate: function(params){
			return `
			<span id="todo-count"><strong>${params.activeTodoCount}</strong> ${params.activeTodoWord} left</span>
			<ul id="filters">
				<li>
					<a ${(params.filter=== 'all') ? 'class="selected"' : ''} href="#/all">All</a>
				</li>
				<li>
					<a ${(params.filter=== 'active') ? 'class="selected"' : ''} href="#/active">Active</a>
				</li>
				<li>
					<a ${(params.filter=== 'completed') ? 'class="selected"' : ''} href="#/completed">Completed</a>
				</li>
			</ul>
			${(params.completedTodos) ? '<button id="clear-completed">Clear completed</button>' : ''}
			`
		},
		bindEvents: function () {
			var self = this;
			document.getElementById('new-todo').addEventListener('keyup', this.create.bind(this))
			document.getElementById('toggle-all').addEventListener('change', this.toggleAll.bind(this))
			document.getElementById('footer').addEventListener('click', event => {
				if (event.target.id === 'clear-completed') self.destroyCompleted()
			});
			var todoList = document.getElementById('todo-list')
			todoList.addEventListener('change', event => {
				if (event.target.classList.contains("toggle")) self.toggle(event)
			});
			todoList.addEventListener('dblclick', event => {
				if (event.target.localName === 'label') self.edit(event)
			});
			todoList.addEventListener('keyup', event => {
				if (event.target.classList.contains("edit")) self.editKeyup(event)
			});
			todoList.addEventListener('focusout', event => {
				if (event.target.classList.contains("edit")) self.update(event)
			});
			todoList.addEventListener('click', event => {
				if (event.target.classList.contains("destroy")) self.destroy(event)
			});
		},
		toggleElement: function(el, condition){
			if (condition){
				//show
				el.style.display = 'block'
			}	else {
				//hide
				el.style.display = 'none'
			}
			return el;
		},
		render: function () {
			var todos = this.getFilteredTodos();
			document.getElementById("todo-list").innerHTML = this.todoTemplate(todos);
			this.toggleElement(document.getElementById("main"), todos.length > 0);
			document.getElementById("toggle-all").checked = this.getActiveTodos().length === 0
			this.renderFooter();
			document.getElementById("new-todo").focus();
			util.store('todos-jquery', this.todos);
		},
		renderFooter: function () {
			var todoCount = this.todos.length;
			var activeTodoCount = this.getActiveTodos().length;
			var template = this.footerTemplate({
				activeTodoCount: activeTodoCount,
				activeTodoWord: util.pluralize(activeTodoCount, 'item'),
				completedTodos: todoCount - activeTodoCount,
				filter: this.filter
			});

			this.toggleElement(document.getElementById("footer"), todoCount > 0).innerHTML = template;
		},
		toggleAll: function (e) {
			var isChecked = e.target.checked

			this.todos.forEach(function (todo) {
				todo.completed = isChecked;
			});

			this.render();
		},
		getActiveTodos: function () {
			return this.todos.filter(function (todo) {
				return !todo.completed;
			});
		},
		getCompletedTodos: function () {
			return this.todos.filter(function (todo) {
				return todo.completed;
			});
		},
		getFilteredTodos: function () {
			if (this.filter === 'active') {
				return this.getActiveTodos();
			}

			if (this.filter === 'completed') {
				return this.getCompletedTodos();
			}

			return this.todos;
		},
		destroyCompleted: function () {
			this.todos = this.getActiveTodos();
			this.filter = 'all';
			this.render();
		},
		// accepts an element from inside the `.item` div and
		// returns the corresponding index in the `todos` array
		indexFromEl: function (el) {
			var id = el.closest('li').dataset.id
			var todos = this.todos;
			var i = todos.length;

			while (i--) {
				if (todos[i].id === id) {
					return i;
				}
			}
		},
		create: function (e) {
			var _input = e.target;
			var val = _input.value.trim();

			if (e.which !== ENTER_KEY || !val) {
				return;
			}

			this.todos.push({
				id: util.uuid(),
				title: val,
				completed: false
			});

			_input.value = '';

			this.render();
		},
		toggle: function (e) {
			var i = this.indexFromEl(e.target);
			this.todos[i].completed = !this.todos[i].completed;
			this.render();
		},
		edit: function (e) {
			var closestLi = e.target.closest('li')
			closestLi.classList.add('editing')
			var _input = closestLi.querySelector('.edit')
			//.addClass('editing').find('.edit');
			_input.value = (_input.value)
			e.target.focus();
		},
		editKeyup: function (e) {
			if (e.which === ENTER_KEY) {
				e.target.blur();
			}

			if (e.which === ESCAPE_KEY) {
				e.target.dataset.abort = true;
				e.target.blur();
			}
		},
		update: function (e) {
			var el = e.target;
			var _el = el;
			var val = _el.value.trim();

			if (!val) {
				this.destroy(e);
				return;
			}

			if (_el.dataset.abort) {
				_el.dataset.abort = false;
			} else {
				this.todos[this.indexFromEl(el)].title = val;
			}

			this.render();
		},
		destroy: function (e) {
			this.todos.splice(this.indexFromEl(e.target), 1);
			this.render();
		}
	};

	App.init();