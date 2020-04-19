export default {}
declare global {

    interface BaseSizeInPaper extends Record<string, number>{
        cols: number,
        height: number,
        index: number
    }

    interface NodeStyleSettingPaper extends SettingGroup {
        Base: BaseSizeInPaper;
        Show: {
            showTitle: boolean;
        };
        Background: {
            backgroundColor: Color;
            backgroundOpacity: number;
        }
    }

    interface MediaStyleSettingPaper extends SettingGroup {
        Base: BaseSizeInPaper;
    }

    interface LinkStyleSettingPaper extends SettingGroup {

    }

    interface TextStyleSettingPaper extends SettingGroup {
        Base: BaseSizeInPaper;
    }
}
