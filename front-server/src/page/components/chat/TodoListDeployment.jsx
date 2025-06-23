const TodoList = ({ todos, onClose }) => {
	return (
		<div className="todolist">
			{todos.map((todo, index) => (
				<div className="todolist__unit" key={index}>
					<div className="todolist__info">
						<h4 className="todolist__name">{todo.title}</h4>
						<ul className="todolist__users">
							{todo.users.map((user, idx) => (
								<li key={idx} className="todolist__user">{user}</li>
							))}
						</ul>
					</div>
					<div className="todolist__buttons">
						<button type="button" className="todolist__button">할일 수락</button>
					</div>
				</div>
			))}
		</div>
	);
};

export default TodoList;
