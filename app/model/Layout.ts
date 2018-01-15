
import { Team } from './Team';
import { Spawner } from './Spawner';
import { ControlPoint } from './ControlPoint';
import { CombatArea } from './CombatArea';

export interface LayoutReference {
    Key: string;    // The Gamemode (gpm_cq, gpm_vehicles, etc...)
    Value: number;  // The Layer (16, 32, 64, 128)
}

export interface Layout {
    Mode: string;   // The Gamemode (gpm_cq, gpm_vehicles, etc...)
    Size: number;   // The Layer (16, 32, 64, 128)
    Team: Team[];
    Assets: Spawner[];
    ControlPoints: ControlPoint[];
    CombatAreas: CombatArea[];
}

export class GameMode {
    public static AssaultAndSecure = "gpm_cq";
    public static VehicleWarfare = "gpm_vehicles";
    public static Cooperative = "gpm_coop";
    public static Skirmish = "gpm_skirmish";
    public static CNC = "gpm_cnc";
    public static Objective = "gpm_objective";
    public static Insurgency = "gpm_insurgency";

    private static AssaultAndSecure_Name = "Assault and Secure";
    private static VehicleWarfare_Name = "Vehicle Warfare";
    private static Cooperative_Name = "Cooperative";
    private static Skirmish_Name = "Skirmish";
    private static CNC_Name = "Control && Conquest";
    private static Objective_Name = "Objective";
    private static Insurgency_Name = "Insurgency";
    private static Unknown_Name = "Unknown";

    public static ProperName(key: string) {
        switch (key) {
            case GameMode.VehicleWarfare:
                return GameMode.VehicleWarfare_Name;
            case GameMode.Cooperative:
                return GameMode.Cooperative_Name;
            case GameMode.AssaultAndSecure:
                return GameMode.AssaultAndSecure_Name;
            case GameMode.Skirmish:
                return GameMode.Skirmish_Name;
            case GameMode.CNC:
                return GameMode.CNC_Name;
            case GameMode.Objective:
                return GameMode.Objective_Name;
            case GameMode.Insurgency:
                return GameMode.Insurgency_Name;
            default:
                return GameMode.Unknown_Name;
        }
    }

}

export class Layer {
    public static Infantry = 16;
    public static Alternative = 32;
    public static Standard =64;
    public static Large = 128;

    public static Infantry_Name = "Infantry";
    public static Alternative_Name = "Alternative";
    public static Standard_Name ="Standard";
    public static Large_Name = "Large";
    public static Unknown_Name = "Unknown";
    
    public static ProperName(key: number) {
        switch (key) {
            case Layer.Infantry:
                return Layer.Infantry_Name;
            case Layer.Alternative:
                return Layer.Alternative_Name;
            case Layer.Standard:
                return Layer.Standard_Name;
            case Layer.Large:
                return Layer.Large_Name;
            default:
                return Layer.Unknown_Name
        }
    }
}