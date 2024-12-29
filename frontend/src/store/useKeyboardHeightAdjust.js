import { useEffect, useState } from 'react';

export const useKeyboardHeightAdjust = () => {
    const [keyboardVisible, setKeyboardVisible] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            // Check if the keyboard is likely visible
            const isKeyboardVisible =
                window.innerHeight < document.documentElement.clientHeight * 0.8; // 80% threshold
            setKeyboardVisible(isKeyboardVisible);
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    return keyboardVisible;
};
