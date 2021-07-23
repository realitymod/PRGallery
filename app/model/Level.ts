import { LayoutReference } from './Layout';

export interface Level {
    Name: string;
    Key: string;
    Size: number;
    Resolution: number;
    Color: string;
    Layouts: LayoutReference[];
}

