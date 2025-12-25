import { useEffect, useState } from "react";

function TextPreview({ url }) {
    const [content, setContent] = useState("");
    const [error, setError] = useState(null);

    useEffect(() => {
        fetch(url)
            .then(res => {
                if (!res.ok) throw new Error("Failed to load text file");
                return res.text();
            })
            .then(text => setContent(text))
            .catch(err => setError(err.message));
    }, [url]);

    if (error) {
        return <p className="text-red-500">{error}</p>;
    }

    return (
        <pre className="whitespace-pre-wrap break-words text-sm bg-white p-4 rounded-lg max-h-full overflow-auto">
            {content}
        </pre>
    );
}

export default TextPreview