declare module 'react-syntax-highlighter' {
    import { ComponentType } from 'react';
  
    export const Prism: ComponentType<any>;
    export const Light: ComponentType<any>;
    export const Dark: ComponentType<any>;
  
    export const registerLanguage: (language: string, definition: any) => void;
    export const unregisterLanguage: (language: string) => void;
  }
  