// interface CodeBlock {
//     language: string;
//     code: string;
// }

// const extractCodeBlocks = (nplResponse: string): CodeBlock[] => {
//     // const regex = /```(?:(html|css|js|javascript|jsx|json)?\s*)\n([\s\S]*?)(?:```|$)/g;
//     const regex = /```(\s*(html|css|js|javascript|jsx|json)?\s*)?\n([\s\S]*?)(?:```|$)/g;

//     const matches = [...nplResponse.matchAll(regex)];

//     return matches
//         .map(match => ({
//             language: match[1] || 'plaintext',
//             code: match[2].trim(),
//         }))
//         .filter(block => !['bash', 'sh', 'plaintext'].includes(block.language)); // Exclude specified languages
// };

// export default extractCodeBlocks;



interface CodeBlock {
    language: string;
    code: string;
}

const extractCodeBlocks = (nplResponse: string): CodeBlock[] => {
    // Updated regex to be more flexible with language specification
    const regex = /```([\s\S]*?)```/g;
    const languageRegex = /^([\w.-]+)?\s*$/;

    const matches = nplResponse.match(regex);

    if (!matches) {
        console.warn("No code blocks found in the response");
        return [];
    }

    return matches
        .map(block => {
            const lines = block.split('\n');
            const firstLine = lines[0].replace('```', '').trim();
            const language = firstLine.match(languageRegex)?.[1]?.toLowerCase() || 'plaintext';
            const code = lines.slice(1, -1).join('\n').trim();

            // Handle JSX and React
            const jsxLanguages = ['jsx', 'react', 'tsx'];
            if (jsxLanguages.includes(language) || (language === 'javascript' && code.includes('React'))) {
                return { language: 'react', code };
            }

            // Handle CSS modules
            if (language === 'module.css' || language.endsWith('.module.css')) {
                return { language: 'css', code };
            }

            return { language, code };
        })
        .filter(block => block.code.trim() !== '' && !['bash', 'sh', 'plaintext'].includes(block.language));
};

export default extractCodeBlocks;
