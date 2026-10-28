export declare const encrypt: (data: object) => {
    encryptedData: string;
    iv: string;
};
export declare const decrypt: (encryptedData: string, auth: string) => object;
