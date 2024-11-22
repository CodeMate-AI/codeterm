import React, { useEffect, useRef } from 'react';

interface CodeBlock {
  language: string;
  code: string;
  filename?: string;
}

function transformImports(code: string) {
  const importReactRegex = /import\s+(?:(\w+)\s*,?\s*)?(?:{([^}]+)})?\s+from\s+['"]react['"];?/g;
  const importCssRegex = /import\s+['"]([^'"]+\.css)['"];?/g;
  const importReactDOMRegex = /import\s+\w+\s+from\s+['"]react-dom['"];?/g;
  const reactDomRenderRegex = /ReactDOM\.render\s*$$.+$$;?/g;
  const importComponentRegex = /import\s+(\w+)\s+from\s+['"]\.\/(components\/)?(\w+)['"];?/g;

  let transformedCode = code;
  let match;
  let defaultImport = '';
  const namedImports = new Set<string>();
  const componentImports = new Map<string, string>();

  while ((match = importReactRegex.exec(code)) !== null) {
    if (match[1]) {
      defaultImport = match[1].trim();
    }
    if (match[2]) {
      match[2].split(',').forEach((imp) => namedImports.add(imp.trim()));
    }
  }

  while ((match = importComponentRegex.exec(code)) !== null) {
    componentImports.set(match[3], match[1]);
  }

  transformedCode = transformedCode.replace(importReactRegex, '');
  transformedCode = transformedCode.replace(importCssRegex, '');
  transformedCode = transformedCode.replace(importReactDOMRegex, '');
  transformedCode = transformedCode.replace(reactDomRenderRegex, '');
  transformedCode = transformedCode.replace(importComponentRegex, '');

  let newImports = '';
  if (defaultImport) {
    newImports += `const ${defaultImport} = window.React;\n`;
  } else {
    newImports += 'const React = window.React;\n';
  }
  if (namedImports.size > 0) {
    newImports += `const { ${Array.from(namedImports).join(', ')} } = React;\n`;
  }

  const result = newImports + transformedCode;
  return { code: result.replace(/export default (\w+);?\s*$/, 'return $1;'), componentImports };
}

function createIframeContent(codeBlocks: CodeBlock[]): string {
  let htmlCode = '';
  let cssCode = '';
  let jsCode = '';
  const reactComponents = new Map<string, { code: string; imports: Map<string, string> }>();

  codeBlocks.forEach(block => {
    switch (block.language.toLowerCase()) {
      case 'html':
        htmlCode = block.code || '';
        break;
      case 'css':
        cssCode += block.code + '\n';
        break;
      case 'javascript':
      case 'js':
        jsCode += block.code + '\n';
        break;
      case 'jsx':
      case 'react':
        const { code, componentImports } = transformImports(block.code);
        reactComponents.set(block.filename || 'App', { code, imports: componentImports });
        break;
    }
  });

  if (reactComponents.size > 0) {
    let transformedReactCode = '';
    let rootComponent = '';

    reactComponents.forEach((component, filename) => {
      transformedReactCode += `
        const ${filename} = (() => {
          ${component.code}
        })();
      `;

      if (filename === 'index' || filename === 'App') {
        rootComponent = filename;
      }
    });

    if (!rootComponent) {
      rootComponent = Array.from(reactComponents.keys())[0];
    }

    console.log("html css js", htmlCode, cssCode, jsCode)

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <script src="https://unpkg.com/react@17/umd/react.production.min.js"></script>
          <script src="https://unpkg.com/react-dom@17/umd/react-dom.production.min.js"></script>
          <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
          <style>${cssCode}</style>   
        </head>
        <body>
          <div id="app"></div>
          <script type="text/babel">
            ${transformedReactCode}
            ReactDOM.render(React.createElement(${rootComponent}), document.getElementById('app'));
          </script>
        </body>
      </html>
    `;
  } else {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <style>${cssCode}</style>
        </head>
        <body>
          ${htmlCode}
          <script nonce="RANDOM_NONCE">${jsCode}</script>
        </body>
      </html>
    `;
  }
}

export const CodePreview: React.FC<{ codeBlocks: CodeBlock[] }> = ({ codeBlocks }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (iframeRef.current) {
      const iframeContent = createIframeContent(codeBlocks);
      iframeRef.current.srcdoc = iframeContent;
    }
  }, [codeBlocks]);

  return (
    <div className="w-full h-full bg-opacity-50 bg-gradient-to-b from-[--bgGradientStart] to-[--bgGradientEnd] hide-scrollbar">
       <iframe
        ref={iframeRef}
        className="w-full h-full border-none hide-scrollbar"
        sandbox="allow-scripts"
        title="Code Preview"
      />
    </div>
  );
};
