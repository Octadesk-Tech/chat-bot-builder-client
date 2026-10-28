import { Block, Variable, ResultHeaderCell, ResultWithAnswers } from 'models';
export declare const parseResultHeader: ({ blocks, variables, }: {
    blocks: Block[];
    variables: Variable[];
}) => ResultHeaderCell[];
export declare const parseAnswers: ({ blocks, variables }: {
    blocks: Block[];
    variables: Variable[];
}) => ({ createdAt, answers, variables: resultVariables, }: Pick<ResultWithAnswers, 'createdAt' | 'answers' | 'variables'>) => {
    [key: string]: string;
};
