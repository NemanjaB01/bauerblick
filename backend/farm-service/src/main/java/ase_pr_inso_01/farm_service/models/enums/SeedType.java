package ase_pr_inso_01.farm_service.models.enums;

public enum SeedType {
    WHEAT("Wheat"),
    CORN( "Corn"),
    BARLEY("Barley"),
    PUMPKIN("Pumpkin"),
    BLACK_GRAPES("Black Grapes"),
    WHITE_GRAPES("White Grapes");

    private final String displayName;

    SeedType( String displayName) {
        this.displayName = displayName;
    }
    public String getDisplayName() {
        return displayName;
    }
}

