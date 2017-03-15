/**
 * Abstract class for Action resources.
 */
export abstract class Action {
    public label: string;
    public type: string;
    public abstract canDisplay(context): boolean;
    public abstract callback(... args): void;
}

/**
 * Abstract class for Reaction actions with predefined context type
 */
export abstract class ReactionAction extends Action {
    public canDisplay(context) {
        return context.type === 'map:reaction';
    }
}
