export function formatMessageTime(date) {
    return new Date(date).toLocaleTimeString(undefined, {
        hour: "2-digit",
        minute: "2-digit",
        hour: "numeric",
    });
};

export const formatMessageDate = (dateString) => {
    const messageDate = new Date(dateString);
    const today = new Date();
    const oneDay = 24 * 60 * 60 * 1000; // Milliseconds in one day

    // Get time differences
    const differenceInTime = today - messageDate;
    const differenceInDays = Math.floor(differenceInTime / oneDay);

    // Check if the date is today
    if (differenceInDays === 0) {
        return "Today";
    }

    // Check if the date is yesterday
    if (differenceInDays === 1) {
        return "Yesterday";
    }

    // Check if the date is within the last 7 days
    if (differenceInDays < 7) {
        return messageDate.toLocaleDateString(undefined, { weekday: "long" }); // Returns day name (e.g., "Monday")
    }

    // Check if the date is within the current year
    if (messageDate.getFullYear() === today.getFullYear()) {
        return messageDate.toLocaleDateString(undefined, { month: "long", day: "numeric" }); // e.g., "January 24"
    }

    // For older dates (previous years)
    return messageDate.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" }); // e.g., "January 24, 2023"
};

export const formatSidebarDate = (dateString) => {
    const messageDate = new Date(dateString);
    const today = new Date();
    const oneDay = 24 * 60 * 60 * 1000;

    const differenceInTime = today - messageDate;
    const differenceInDays = Math.floor(differenceInTime / oneDay);

    if (differenceInDays === 0) {
        // Message sent today - return time in HH:MM format
        return messageDate.toLocaleTimeString(undefined, {
            hour: "2-digit",
            minute: "2-digit",
        });
    }

    if (differenceInDays === 1) {
        // Message sent yesterday
        return "Yesterday";
    }

    if (differenceInDays < 7) {
        // Message sent within the last 7 days - return weekday
        return messageDate.toLocaleDateString(undefined, { weekday: "long" });
    }

    // Older messages - return DD/MM/YYYY format
    return messageDate.toLocaleDateString(undefined, {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });
};