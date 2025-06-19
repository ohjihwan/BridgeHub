import React from 'react';

const Loader = () => {
	return (
		<>
			<div id="global-loading" className="loading">
				<div className="cats">
					<div className="cats__body"></div>
					<div className="cats__body"></div>
					<div className="cats__tail"></div>
					<div className="cats__head"></div>
				</div>
			</div>
		</>
	);
};

export default Loader;
