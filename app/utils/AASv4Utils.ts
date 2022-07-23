/**
 * 
 */
export class AASv4Utils {
    public static ParseRoute(sgid: number): AASv4ControlPoint {
        if (sgid < -1 || sgid > 999999) {
            throw new Error(`Unexpected SSIG, got: ${sgid}`);
        }

        if(sgid == -1)
        {
            return new AASv4ControlPoint(0, 1, 0);
        }
    
        // Each digit of the sgid represents a diferent thing, so its 
        // easier if we simply convert it to a string and handle each character individually
        // We can have the following SGID structures:
        // A 
        // AB
        // ABC
        // ABBCC
        // AABBBCC
        // Where:
        // - A: Indicates the Sequence that the control point belongs to
        // - B: The number of control points that will be active in the given sequence
        // - C: The route to which the control point belongs to
        var stringSgid = sgid.toString();

        var sequence = AASv4Utils.GetSequence(stringSgid);
        var flagsInPlay = AASv4Utils.GetFlagsInPlay(stringSgid);
        var route = AASv4Utils.GetRoute(stringSgid);

        return new AASv4ControlPoint(sequence, flagsInPlay, route);
    }

    private static GetSequence(sgid: string): number {
        var sequence;
        if (sgid.length == 6) {
            sequence = sgid.substring(0, 2);
        } else {
            sequence = sgid.substring(0, 1);
        }

        return parseInt(sequence);
    }
    private static GetFlagsInPlay(sgid: string): number {
        var flagsInPlay = "1";
        if (sgid.length > 3) {
            flagsInPlay = sgid.substring(2, 4);
        } else if (sgid.length > 1) {
            flagsInPlay = sgid.substring(1, 2);
        }

        return parseInt(flagsInPlay);
    }
    private static GetRoute(sgid: string): number {
        var route = "0";
        if (sgid.length > 3) {
            route = sgid.substring(4, 6);
        } else if (sgid.length > 2) {
            route = sgid.substring(2, 3);
        }

        return parseInt(route);
    }
}

/**
 * A wrapper for the AASv4 route information.
 * In AASv4, we can only cap ControlPoints in the correct sequence and in each
 * sequence in play we can have one or more flags active at the same time.
 * Additionally, we can also create routes, only one will be active per round and its selected randomly.
 */
export class AASv4ControlPoint {
    /**
     * The order of the flag's sequence.
     * Sequence's goes from team's 1 to 2.
     * In some situations, the last flag, which belongs to team's 2 is represented with a SGID of -1.
     * Here we convert that to Sequence zero (0) since team's 1 Base always start with SGID of 1.
     */
    public readonly Sequence: number;

    /**
     * Indicates how many flags should be active at the same time for the same sequence's number.
     */
    public readonly FlagsInPlay: number;

    /**
     * The route the sequence's belongs to.
     * If a flag belongs to all routes, then it will have a value of zero (0).
     */
    public readonly Route: number;

    public constructor(sequence: number, flagsInPlay: number, route: number) {
        this.Sequence = sequence;
        this.FlagsInPlay = flagsInPlay;
        this.Route = route;
    }
}