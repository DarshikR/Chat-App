import { useEffect, useState } from 'react';

export const useKeyboardHeightAdjust = () => {
    const [keyboardVisible, setKeyboardVisible] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            const viewportHeight = window.visualViewport?.height || window.innerHeight;
            const windowHeight = window.innerHeight;

            setKeyboardVisible(viewportHeight < windowHeight * 0.85);
        };

        window.visualViewport?.addEventListener("resize", handleResize);
        window.addEventListener("resize", handleResize);

        handleResize(); // Initial check

        return () => {
            window.visualViewport?.removeEventListener("resize", handleResize);
            window.removeEventListener("resize", handleResize);
        };
    }, []);

    return keyboardVisible;
};
