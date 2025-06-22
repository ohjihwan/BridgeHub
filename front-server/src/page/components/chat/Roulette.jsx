import { useState } from 'react';

const Roulette = ({ users }) => {
	const [winner, setWinner] = useState(null);

	const handleSpin = () => {
		const randomIndex = Math.floor(Math.random() * users.length);
		setWinner(users[randomIndex]);
	};

	return (
		<div className="roulette">
			<ul className="roulette__list">
				{users.map((user, i) => (
					<li key={i} className="roulette__item">{user}</li>
				))}
			</ul>
			<button className="roulette__spin" onClick={handleSpin}>돌리기</button>

			{winner && (
				<p className="roulette__result">
					🎉 <strong>{winner}</strong> 님이 당첨되었습니다!
				</p>
			)}
		</div>
	);
};

export default Roulette;
