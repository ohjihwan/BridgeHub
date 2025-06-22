import ReactDOM from 'react-dom';

const ResultModal = ({ spinning, winner, onClose }) => {
	if (!spinning && !winner) return null;

	return ReactDOM.createPortal(
		<>
			<div className="roulette-result__modal"></div>
			<div className="roulette-result">
				{spinning ? (
					<p className="roulette-result__text"><span className="emoji">🎲</span>룰렛을 돌리는 중...</p>
				) : (
					<>
						<div className='roulette-result__effects'>
							<div className="roulette-result__effect"></div>
							<div className="roulette-result__winner"><strong>{winner}</strong> 님이 당첨되었습니다!</div>
						</div>
						<button className="roulette-result__close" onClick={onClose}>확인</button>
					</>
				)}
			</div>
		</>,
		document.body
	);
};

export default ResultModal;
