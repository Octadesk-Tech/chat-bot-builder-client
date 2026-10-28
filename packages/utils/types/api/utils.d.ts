import { NextApiRequest, NextApiResponse } from 'next';
export declare const methodNotAllowed: (res: NextApiResponse) => void;
export declare const notAuthenticated: (res: NextApiResponse) => void;
export declare const notFound: (res: NextApiResponse) => void;
export declare const badRequest: (res: NextApiResponse) => void;
export declare const forbidden: (res: NextApiResponse) => void;
export declare const initMiddleware: (handler: (req: NextApiRequest, res: NextApiResponse, middleware: (result: any) => void) => void) => (req: any, res: any) => Promise<unknown>;
