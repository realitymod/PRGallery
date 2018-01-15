import { Vector3 } from './Vector';

export interface ControlPoint {
    Name: string;
    Radius: number;
    Team: number;
    UnableToChangeTeam: boolean;
    Visible: boolean;
    SupplyGroupId: number;
    Position: Vector3;
}
