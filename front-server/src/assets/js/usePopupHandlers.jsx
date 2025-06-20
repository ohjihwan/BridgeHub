export function useHomePopupHandlers(setShowDetail, setIsClosing) {
	const handleOpen = () => {
		setIsClosing(false);
		setShowDetail(true);
	};

	const handleClose = () => {
		setIsClosing(true);
	};

	return { handleOpen, handleClose };
}
