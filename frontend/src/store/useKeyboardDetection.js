import { useState, useEffect } from "react";

export const useKeyboardDetection = () => {
    const [keyboardVisible, setKeyboardVisible] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            if (window.visualViewport) {
                const viewportHeight = window.visualViewport.height;
                const windowHeight = window.innerHeight;

                // If viewport height is significantly less than window height, the keyboard is likely open
                setKeyboardVisible(viewportHeight < windowHeight * 0.85);
            }
        };

        // Attach listeners for viewport changes
        window.visualViewport?.addEventListener("resize", handleResize);

        // Clean up listeners
        return () => {
            window.visualViewport?.removeEventListener("resize", handleResize);
        };
    }, []);

    return keyboardVisible;
};
