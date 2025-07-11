declare global {
    interface Window {
      claude: {
        complete: (prompt: string) => Promise<string>;
      };
    }
  }
  
  export {};
