export type LLMModel = {
    id: string,
    name?: string,
    provider: string,
    providerId: string
}



export type LLMCurrentModel = {
    id: {                // 'id' is now an object
        id: string;
        provider: string;
        providerId: string;
        name?: string;
        multiModal?: boolean;
    };
    params: Record<string, string>;  // Parameters stored in a dictionary
    current: boolean;
}
