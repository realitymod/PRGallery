import { Vector3 } from './Vector';
import { Vehicle } from './Vehicle';

export interface Spawner {
    Key: string;
    Vehicle: Vehicle;
    InitialDelay: number;
    RespawnDelay: number;
    Team: number;
    Position: Vector3;
    Rotation: Vector3;
}

