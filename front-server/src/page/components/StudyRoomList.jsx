const StudyRoomList = ({ rooms, onItemClick, limit = rooms.length }) => {
	return (
		<ul className="studyroom">
			{rooms.slice(0, limit).map((room) => (
				<li className="studyroom__item" onClick={() => onItemClick(room)} key={room.id}>
					<button type="button" className="studyroom__info">
						<img src={`/uploads/thumbnail/${room.thumbnail}`} className="studyroom__img" />
						<h3 className="studyroom__title">{room.title}</h3>
						<div className="studyroom__details">
							<span className="studyroom__detail">{room.region}</span>
							<span className="studyroom__detail">{room.time}</span>
							<span className="studyroom__detail">{room.currentMembers}/{room.capacity}명</span>
						</div>
					</button>
				</li>
			))}
		</ul>
	);
};

export default StudyRoomList;